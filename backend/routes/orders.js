const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const db = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");
const optionalAuth = require("../middleware/optionalAuth");
const isAdmin = require("../middleware/adminMiddleware");
const { promoPrice } = require("../config/promo");

const promisePool = db.promise();

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

// GET /api/orders
// Admin only - list all orders
router.get("/", verifyToken, isAdmin, async (req, res, next) => {
  try {
    const [orders] = await promisePool.query(
      `SELECT o.*, u.name AS user_name
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/my
// Logged-in user - list their own orders (with items)
router.get("/my", verifyToken, async (req, res, next) => {
  try {
    const [orders] = await promisePool.query(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );

    if (orders.length > 0) {
      const ids = orders.map((o) => o.id);
      const placeholders = ids.map(() => "?").join(",");
      const [items] = await promisePool.query(
        `SELECT oi.order_id, oi.product_id, oi.quantity, oi.price, p.name AS product_name, p.image AS product_image
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id IN (${placeholders})`,
        ids
      );

      const itemsByOrder = {};
      items.forEach((it) => {
        if (!itemsByOrder[it.order_id]) itemsByOrder[it.order_id] = [];
        itemsByOrder[it.order_id].push(it);
      });

      orders.forEach((o) => {
        o.items = itemsByOrder[o.id] || [];
      });
    }

    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id
// Admin (any order) or the owner of the order - order with its items
router.get("/:id", verifyToken, async (req, res, next) => {
  try {
    const [order] = await promisePool.query(
      `SELECT o.*, u.name AS user_name
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [req.params.id]
    );

    if (order.length === 0) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    if (req.user.role !== "admin" && Number(order[0].user_id) !== Number(req.user.id)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const [items] = await promisePool.query(
      `SELECT oi.product_id, oi.quantity, oi.price, p.name AS product_name, p.image AS product_image
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [req.params.id]
    );

    res.json({ ...order[0], items });
  } catch (err) {
    next(err);
  }
});

// PUT /api/orders/:id/status
// Admin only - update order status
router.put("/:id/status", verifyToken, isAdmin, async (req, res, next) => {
  const { status } = req.body;

  if (!status || !ORDER_STATUSES.includes(status)) {
    return res.status(400).json({
      message: `Le statut doit être l'un des suivants : ${ORDER_STATUSES.join(", ")}`,
    });
  }

  try {
    const [result] = await promisePool.query("UPDATE orders SET status = ? WHERE id = ?", [
      status,
      req.params.id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Commande introuvable" });
    }
    res.json({ message: "Statut de la commande mis à jour", status });
  } catch (err) {
    next(err);
  }
});

// POST /api/orders
// Create an order: validates stock, uses server-side prices, decrements stock in a transaction
router.post(
  "/",
  optionalAuth,
  [
    body("customer_name").trim().notEmpty().withMessage("Le nom est requis"),
    body("customer_email").isEmail().withMessage("Un email valide est requis"),
    body("address").trim().notEmpty().withMessage("L'adresse est requise"),
    body("phone")
      .trim()
      .notEmpty()
      .withMessage("Le téléphone est requis")
      .isLength({ min: 8, max: 20 })
      .withMessage("Numéro de téléphone invalide"),
    body("payment_method").optional().isIn(["cod"]).withMessage("Moyen de paiement invalide"),
    body("items").isArray({ min: 1 }).withMessage("Le panier est vide"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { customer_name, customer_email, address, phone, payment_method, items } = req.body;
    const userId = req.user ? req.user.id : null;
    const conn = await promisePool.getConnection();

    try {
      await conn.beginTransaction();

      const orderItems = [];
      let total = 0;

      for (const item of items) {
        const productId = Number(item.product_id);
        const quantity = Number(item.quantity);

        if (!productId || !quantity || quantity <= 0 || !Number.isInteger(quantity)) {
          await conn.rollback();
          return res.status(400).json({ message: "Article invalide dans la commande" });
        }

        const [rows] = await conn.query("SELECT id, name, price, stock FROM products WHERE id = ?", [
          productId,
        ]);

        if (rows.length === 0) {
          await conn.rollback();
          return res.status(400).json({ message: `Produit #${productId} introuvable` });
        }

        const product = rows[0];

        if (Number(product.stock) < quantity) {
          await conn.rollback();
          return res.status(400).json({
            message: `Stock insuffisant pour « ${product.name} » (${product.stock} restant)`,
          });
        }

        const unitPrice = promoPrice(product.price);
        total += unitPrice * quantity;
        orderItems.push({ product_id: productId, quantity, price: unitPrice });
      }

      total = Math.round(total * 100) / 100;

      const [orderRes] = await conn.query(
        `INSERT INTO orders (user_id, customer_name, customer_email, address, phone, payment_method, total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, customer_name, customer_email, address, phone, payment_method || "cod", total]
      );

      const orderId = orderRes.insertId;

      for (const oi of orderItems) {
        await conn.query(
          "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
          [orderId, oi.product_id, oi.quantity, oi.price]
        );
        await conn.query("UPDATE products SET stock = stock - ? WHERE id = ?", [
          oi.quantity,
          oi.product_id,
        ]);
      }

      await conn.commit();
      res.status(201).json({
        message: "Commande créée avec succès",
        orderId,
        total,
      });
    } catch (err) {
      await conn.rollback();
      next(err);
    } finally {
      conn.release();
    }
  }
);

module.exports = router;
