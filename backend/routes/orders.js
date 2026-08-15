const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const db = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");
const optionalAuth = require("../middleware/optionalAuth");
const isAdmin = require("../middleware/adminMiddleware");
const { promoPrice } = require("../config/promo");
const { notifyStoreOrder } = require("../config/whatsappNotifier");
const { upsertSubscriber } = require("../config/subscriber");

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

// GET /api/orders
// Admin only - list all orders (with their items)
router.get("/", verifyToken, isAdmin, async (req, res, next) => {
  try {
    const ordersResult = await db.query(
      `SELECT o.*, u.name AS user_name
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );

    const orders = ordersResult.rows;
    if (orders.length > 0) {
      const ids = orders.map((o) => o.id);
      const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");
      const itemsResult = await db.query(
        `SELECT oi.order_id, oi.product_id, oi.quantity, oi.price, p.name AS product_name, p.image AS product_image
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id IN (${placeholders})`,
        ids
      );

      const itemsByOrder = {};
      itemsResult.rows.forEach((it) => {
        if (!itemsByOrder[it.order_id]) itemsByOrder[it.order_id] = [];
        itemsByOrder[it.order_id].push(it);
      });

      orders.forEach((o) => {
        o.total = Number(o.total);
        o.delivery_fees = Number(o.delivery_fees);
        o.items = itemsByOrder[o.id] || [];
        o.items.forEach((it) => {
          it.price = Number(it.price);
        });
      });
    }

    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/my
// Logged-in user - list their own orders (with items)
router.get("/my", verifyToken, async (req, res, next) => {
  try {
    const ordersResult = await db.query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );

    const orders = ordersResult.rows;
    if (orders.length > 0) {
      const ids = orders.map((o) => o.id);
      const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");
      const itemsResult = await db.query(
        `SELECT oi.order_id, oi.product_id, oi.quantity, oi.price, p.name AS product_name, p.image AS product_image
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id IN (${placeholders})`,
        ids
      );

      const itemsByOrder = {};
      itemsResult.rows.forEach((it) => {
        if (!itemsByOrder[it.order_id]) itemsByOrder[it.order_id] = [];
        itemsByOrder[it.order_id].push(it);
      });

      orders.forEach((o) => {
        o.total = Number(o.total);
        o.delivery_fees = Number(o.delivery_fees);
        o.items = itemsByOrder[o.id] || [];
        o.items.forEach((it) => {
          it.price = Number(it.price);
        });
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
    const orderResult = await db.query(
      `SELECT o.*, u.name AS user_name
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = $1`,
      [req.params.id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    const order = orderResult.rows[0];
    if (req.user.role !== "admin" && Number(order.user_id) !== Number(req.user.id)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const itemsResult = await db.query(
      `SELECT oi.product_id, oi.quantity, oi.price, p.name AS product_name, p.image AS product_image
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [req.params.id]
    );

    order.total = Number(order.total);
    order.delivery_fees = Number(order.delivery_fees);
    const items = itemsResult.rows;
    items.forEach((it) => {
      it.price = Number(it.price);
    });

    res.json({ ...order, items });
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
    const result = await db.query("UPDATE orders SET status = $1 WHERE id = $2", [
      status,
      req.params.id,
    ]);
    if (result.rowCount === 0) {
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
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const orderItems = [];
      let total = 0;

      for (const item of items) {
        const productId = Number(item.product_id);
        const quantity = Number(item.quantity);

        if (!productId || !quantity || quantity <= 0 || !Number.isInteger(quantity)) {
          await client.query("ROLLBACK");
          return res.status(400).json({ message: "Article invalide dans la commande" });
        }

        const productResult = await client.query(
          "SELECT id, name, price, stock FROM products WHERE id = $1 FOR UPDATE",
          [productId]
        );

        if (productResult.rows.length === 0) {
          await client.query("ROLLBACK");
          return res.status(400).json({ message: `Produit #${productId} introuvable` });
        }

        const product = productResult.rows[0];

        if (Number(product.stock) < quantity) {
          await client.query("ROLLBACK");
          return res.status(400).json({
            message: `Stock insuffisant pour « ${product.name} » (${product.stock} restant)`,
          });
        }

        const unitPrice = promoPrice(product.price);
        total += unitPrice * quantity;
        orderItems.push({ product_id: productId, quantity, price: unitPrice, name: product.name });
      }

      total = Math.round(total * 100) / 100;

      const orderRes = await client.query(
        `INSERT INTO orders (user_id, customer_name, customer_email, address, phone, payment_method, total)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [userId, customer_name, customer_email, address, phone, payment_method || "cod", total]
      );

      const orderId = orderRes.rows[0].id;

      for (const oi of orderItems) {
        await client.query(
          "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
          [orderId, oi.product_id, oi.quantity, oi.price]
        );
        await client.query("UPDATE products SET stock = stock - $1 WHERE id = $2", [
          oi.quantity,
          oi.product_id,
        ]);
      }

      await client.query("COMMIT");

      // Fidélité : cadeau offert à chaque 5e commande du même client (par téléphone)
      let ordersCount = 0;
      let giftEarned = false;
      try {
        const countResult = await db.query(
          "SELECT COUNT(*)::int AS cnt FROM orders WHERE phone = $1 AND status != 'cancelled'",
          [phone]
        );
        ordersCount = Number(countResult.rows[0].cnt);
        giftEarned = ordersCount > 0 && ordersCount % 5 === 0;
      } catch (err) {
        console.error("[orders] erreur calcul fidélité :", err.message);
      }

      // Inscription automatique aux notifications nouveautés
      upsertSubscriber({ phone, email: customer_email, source: "order" }).catch((err) =>
        console.error("[orders] erreur abonnement :", err.message)
      );

      notifyStoreOrder({
        orderId,
        total,
        customer_name,
        phone,
        address,
        items: orderItems,
        ordersCount,
        giftEarned,
      });

      res.status(201).json({
        message: "Commande créée avec succès",
        orderId,
        total,
        loyalty: {
          ordersCount,
          giftEarned,
          nextGiftIn: giftEarned ? 0 : 5 - (ordersCount % 5),
        },
      });
    } catch (err) {
      await client.query("ROLLBACK");
      next(err);
    } finally {
      client.release();
    }
  }
);

module.exports = router;
