const express = require("express");
const path = require("path");
const fs = require("fs");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");
const upload = require("../middleware/upload");

const promisePool = db.promise();
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
const { isPromoActive, promoPrice, promoInfo } = require("../config/promo");

const RATING_SELECT = `
  (SELECT COALESCE(AVG(rating), 0) FROM reviews r WHERE r.product_id = products.id) AS avg_rating,
  (SELECT COUNT(*) FROM reviews r WHERE r.product_id = products.id) AS review_count
`;

const SORT_MAP = {
  newest: "products.created_at DESC",
  price_asc: "products.price ASC",
  price_desc: "products.price DESC",
  popular: "(SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi WHERE oi.product_id = products.id) DESC",
  rating: "(SELECT COALESCE(AVG(rating), 0) FROM reviews r WHERE r.product_id = products.id) DESC",
};

const unlinkIfLocal = (filename) => {
  if (!filename || filename.startsWith("http")) return;
  const fullPath = path.join(UPLOADS_DIR, filename);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

// GET /api/products?search=&category=&sort=&page=&limit=
// Public - paginated list with optional search, category & sorting
router.get("/", async (req, res, next) => {
  try {
    const { search, category, sort } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 48);
    const offset = (page - 1) * limit;

    let where = "WHERE 1=1";
    const params = [];

    if (search) {
      where += " AND (products.name LIKE ? OR products.description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      where += " AND products.category = ?";
      params.push(category);
    }

    const orderBy = SORT_MAP[sort] || SORT_MAP.newest;

    const [[{ total }]] = await promisePool.query(
      `SELECT COUNT(*) AS total FROM products ${where}`,
      params
    );

    const [rows] = await promisePool.query(
      `SELECT products.*, ${RATING_SELECT}
       FROM products
       ${where}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const promoActive = isPromoActive();
    rows.forEach((r) => {
      r.promo_active = promoActive;
      r.sale_price = promoActive ? promoPrice(r.price) : null;
      r.original_price = Number(r.price);
    });

    res.json({
      products: rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/categories
// Public - list distinct product categories
router.get("/categories", (req, res, next) => {
  const sql =
    "SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != '' ORDER BY category";
  db.query(sql, (err, result) => {
    if (err) return next(err);
    res.json(result.map((row) => row.category));
  });
});

// GET /api/products/:id/reviews
// Public - list reviews for a product
router.get("/:id/reviews", async (req, res, next) => {
  try {
    const [rows] = await promisePool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.name AS user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/products/:id/reviews
// Logged-in user - add a review
router.post(
  "/:id/reviews",
  verifyToken,
  [
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("La note doit être entre 1 et 5"),
    body("comment").optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const productId = req.params.id;
    const { rating, comment } = req.body;

    try {
      const [[product]] = await promisePool.query("SELECT id FROM products WHERE id = ?", [
        productId,
      ]);
      if (!product) {
        return res.status(404).json({ message: "Produit introuvable" });
      }

      const [existing] = await promisePool.query(
        "SELECT id FROM reviews WHERE product_id = ? AND user_id = ?",
        [productId, req.user.id]
      );

      if (existing.length > 0) {
        return res.status(400).json({ message: "Vous avez déjà donné votre avis sur ce produit" });
      }

      await promisePool.query(
        "INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)",
        [productId, req.user.id, rating, comment || null]
      );

      res.status(201).json({ message: "Avis ajouté avec succès" });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/products/promo
// Public - promo info (weekend discount)
router.get("/promo", (req, res) => {
  res.json(promoInfo());
});

// GET /api/products/:id
// Public - single product (with rating)
router.get("/:id", async (req, res, next) => {
  try {
    const [rows] = await promisePool.query(
      `SELECT products.*, ${RATING_SELECT} FROM products WHERE products.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Produit introuvable" });
    }
    const promoActive = isPromoActive();
    rows[0].promo_active = promoActive;
    rows[0].sale_price = promoActive ? promoPrice(rows[0].price) : null;
    rows[0].original_price = Number(rows[0].price);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/products/upload
// Admin only - upload a product image, returns file name
router.post("/upload", verifyToken, isAdmin, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Aucune image téléchargée" });
  }
  res.status(201).json({ filename: req.file.filename });
});

// POST /api/products
// Admin only - create product (JSON body)
router.post(
  "/",
  verifyToken,
  isAdmin,
  [
    body("name").trim().notEmpty().withMessage("Le nom du produit est requis"),
    body("price").isFloat({ gt: 0 }).withMessage("Un prix valide est requis"),
    body("stock").optional().isInt({ min: 0 }).withMessage("Stock invalide"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, description, price, stock, image, category } = req.body;

    try {
      const [result] = await promisePool.query(
        `INSERT INTO products (name, description, price, stock, image, category)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          name.trim(),
          description || null,
          Number(price),
          stock != null ? Number(stock) : 0,
          image || null,
          category || null,
        ]
      );
      res.status(201).json({
        message: "Produit créé avec succès",
        productId: result.insertId,
      });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/products/:id
// Admin only - update product
router.put(
  "/:id",
  verifyToken,
  isAdmin,
  [
    body("name").trim().notEmpty().withMessage("Le nom du produit est requis"),
    body("price").isFloat({ gt: 0 }).withMessage("Un prix valide est requis"),
    body("stock").optional().isInt({ min: 0 }).withMessage("Stock invalide"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, description, price, stock, image, category } = req.body;

    try {
      const [currentRows] = await promisePool.query("SELECT image FROM products WHERE id = ?", [
        req.params.id,
      ]);
      if (currentRows.length === 0) {
        return res.status(404).json({ message: "Produit introuvable" });
      }

      // Clean up the old image file when it is replaced
      if (image && image !== currentRows[0].image) {
        unlinkIfLocal(currentRows[0].image);
      }

      const [result] = await promisePool.query(
        `UPDATE products
         SET name = ?, description = ?, price = ?, stock = ?, image = ?, category = ?
         WHERE id = ?`,
        [
          name.trim(),
          description || null,
          Number(price),
          stock != null ? Number(stock) : 0,
          image || null,
          category || null,
          req.params.id,
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Produit introuvable" });
      }

      res.json({ message: "Produit mis à jour avec succès" });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/products/:id
// Admin only - delete product (removes image file too)
router.delete("/:id", verifyToken, isAdmin, async (req, res, next) => {
  try {
    const [currentRows] = await promisePool.query("SELECT image FROM products WHERE id = ?", [
      req.params.id,
    ]);
    if (currentRows.length === 0) {
      return res.status(404).json({ message: "Produit introuvable" });
    }

    await promisePool.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    unlinkIfLocal(currentRows[0].image);

    res.json({ message: "Produit supprimé avec succès" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
