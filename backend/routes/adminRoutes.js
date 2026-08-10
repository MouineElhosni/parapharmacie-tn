const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

// GET /api/admin/stats
// Admin only - dashboard statistics
router.get("/stats", verifyToken, isAdmin, (req, res) => {
  const countsSql = `
    SELECT
      (SELECT COUNT(*) FROM products) AS totalProducts,
      (SELECT COUNT(*) FROM orders) AS totalOrders,
      (SELECT COUNT(*) FROM users) AS totalUsers,
      (SELECT COALESCE(SUM(total), 0) FROM orders) AS totalRevenue,
      (SELECT COUNT(*) FROM orders WHERE status = 'pending') AS pendingOrders,
      (SELECT COUNT(*) FROM products WHERE stock <= 5) AS lowStock
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

  db.query(countsSql, (err, counts) => {
    if (err) return res.status(500).json({ message: "Erreur interne du serveur" });

    db.query(lowStockSql, (err, lowStock) => {
      if (err) return res.status(500).json({ message: "Erreur interne du serveur" });

      db.query(recentSql, (err, recentOrders) => {
        if (err) return res.status(500).json({ message: "Erreur interne du serveur" });

        res.json({
          ...counts[0],
          lowStock,
          recentOrders,
        });
      });
    });
  });
});

module.exports = router;
