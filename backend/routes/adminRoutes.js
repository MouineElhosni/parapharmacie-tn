const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const db = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");
const { notifySubscribersPromo } = require("../config/notifier");

// GET /api/admin/stats
// Admin only - dashboard statistics
router.get("/stats", verifyToken, isAdmin, async (req, res, next) => {
  try {
    const countsSql = `
      SELECT
        (SELECT COUNT(*) FROM products) AS "totalProducts",
        (SELECT COUNT(*) FROM orders) AS "totalOrders",
        (SELECT COUNT(*) FROM users) AS "totalUsers",
        (SELECT COALESCE(SUM(total), 0) FROM orders) AS "totalRevenue",
        (SELECT COUNT(*) FROM orders WHERE status = 'pending') AS "pendingOrders",
        (SELECT COUNT(*) FROM products WHERE stock <= 5) AS "lowStock"
    `;

    const lowStockSql = `
      SELECT id, name, stock FROM products
      WHERE stock <= 5
      ORDER BY stock ASC
      LIMIT 10
    `;

    const recentSql = `
      SELECT o.id, o.customer_name, o.total, o.status, o.created_at
      FROM orders o
      ORDER BY o.created_at DESC
      LIMIT 5
    `;

    const [counts, lowStock, recentOrders] = await Promise.all([
      db.query(countsSql),
      db.query(lowStockSql),
      db.query(recentSql),
    ]);

    const stats = counts.rows[0];
    stats.totalProducts = Number(stats.totalProducts);
    stats.totalOrders = Number(stats.totalOrders);
    stats.totalUsers = Number(stats.totalUsers);
    stats.totalRevenue = Number(stats.totalRevenue);
    stats.pendingOrders = Number(stats.pendingOrders);
    stats.lowStock = Number(stats.lowStock);

    lowStock.rows.forEach((r) => {
      r.stock = Number(r.stock);
    });
    recentOrders.rows.forEach((r) => {
      r.total = Number(r.total);
    });

    res.json({
      ...stats,
      lowStock: lowStock.rows,
      recentOrders: recentOrders.rows,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/notify-promo
// Admin only - send promo/offer notification to all subscribers
router.post(
  "/notify-promo",
  verifyToken,
  isAdmin,
  [
    body("title").trim().notEmpty().withMessage("Le titre est requis"),
    body("message").optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
    body("discount").optional({ checkFalsy: true }).isInt({ min: 1, max: 90 }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { title, message, discount } = req.body;

    try {
      const result = await notifySubscribersPromo({
        title,
        message: message || null,
        discount: discount ? Number(discount) : null,
      });

      res.json({
        message: `Notification envoyée à ${result.phones} téléphone(s) et ${result.emails} email(s)`,
        phones: result.phones,
        emails: result.emails,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
