const express = require("express");
const path = require("path");
const fs = require("fs");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");
const upload = require("../middleware/upload");

const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
const { isPromoActive, promoPrice, promoInfo } = require("../config/promo");
const { notifySubscribersNewProduct } = require("../config/notifier");

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
      params.push(`%${search}%`, `%${search}%`);
      where += ` AND (products.name ILIKE $${params.length - 1} OR products.description ILIKE $${params.length})`;
    }

    if (category) {
      params.push(category);
      where += ` AND products.category = $${params.length}`;
    }

    const orderBy = SORT_MAP[sort] || SORT_MAP.newest;

    const countResult = await db.query(`SELECT COUNT(*) AS total FROM products ${where}`, params);
    const total = Number(countResult.rows[0].total);

    params.push(limit, offset);
    const limitIdx = params.length - 1;
    const result = await db.query(
      `SELECT products.*, ${RATING_SELECT}
       FROM products
       ${where}
       ORDER BY ${orderBy}
       LIMIT $${limitIdx} OFFSET $${limitIdx + 1}`,
      params
    );

    const rows = result.rows;
    const promoActive = isPromoActive();
    rows.forEach((r) => {
      r.price = Number(r.price);
      r.promo_active = promoActive;
      r.sale_price = promoActive ? promoPrice(r.price) : null;
      r.original_price = Number(r.price);
      r.avg_rating = Number(r.avg_rating);
      r.review_count = Number(r.review_count);
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
router.get("/categories", async (req, res, next) => {
  try {
    const sql =
      "SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != '' ORDER BY category";
    const result = await db.query(sql);
    res.json(result.rows.map((row) => row.category));
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id/reviews
// Public - list reviews for a product
router.get("/:id/reviews", async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.name AS user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`,
      [req.params.id]
    );
    res.json(result.rows);
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
      const productResult = await db.query("SELECT id FROM products WHERE id = $1", [productId]);
      if (productResult.rows.length === 0) {
        return res.status(404).json({ message: "Produit introuvable" });
      }

      const existingResult = await db.query(
        "SELECT id FROM reviews WHERE product_id = $1 AND user_id = $2",
        [productId, req.user.id]
      );

      if (existingResult.rows.length > 0) {
        return res.status(400).json({ message: "Vous avez déjà donné votre avis sur ce produit" });
      }

      await db.query(
        "INSERT INTO reviews (product_id, user_id, rating, comment) VALUES ($1, $2, $3, $4)",
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
    const result = await db.query(
      `SELECT products.*, ${RATING_SELECT} FROM products WHERE products.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Produit introuvable" });
    }
    const row = result.rows[0];
    const promoActive = isPromoActive();
    row.price = Number(row.price);
    row.avg_rating = Number(row.avg_rating);
    row.review_count = Number(row.review_count);
    row.promo_active = promoActive;
    row.sale_price = promoActive ? promoPrice(row.price) : null;
    row.original_price = Number(row.price);
    res.json(row);
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
      const result = await db.query(
        `INSERT INTO products (name, description, price, stock, image, category)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          name.trim(),
          description || null,
          Number(price),
          stock != null ? Number(stock) : 0,
          image || null,
          category || null,
        ]
      );

      // Notifier les abonnés du nouveau produit (WhatsApp + email)
      notifySubscribersNewProduct({
        id: result.rows[0].id,
        name: name.trim(),
        price: Number(price),
      });

      res.status(201).json({
        message: "Produit créé avec succès",
        productId: result.rows[0].id,
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
      const currentResult = await db.query("SELECT image FROM products WHERE id = $1", [
        req.params.id,
      ]);
      if (currentResult.rows.length === 0) {
        return res.status(404).json({ message: "Produit introuvable" });
      }

      // Clean up the old image file when it is replaced
      if (image && image !== currentResult.rows[0].image) {
        unlinkIfLocal(currentResult.rows[0].image);
      }

      const result = await db.query(
        `UPDATE products
         SET name = $1, description = $2, price = $3, stock = $4, image = $5, category = $6
         WHERE id = $7`,
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

      if (result.rowCount === 0) {
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
    const currentResult = await db.query("SELECT image FROM products WHERE id = $1", [
      req.params.id,
    ]);
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ message: "Produit introuvable" });
    }

    await db.query("DELETE FROM products WHERE id = $1", [req.params.id]);
    unlinkIfLocal(currentResult.rows[0].image);

    res.json({ message: "Produit supprimé avec succès" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
