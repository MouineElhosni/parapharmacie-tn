const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");

// GET /api/wishlist
// Logged-in user - list wishlist items with product details
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT w.product_id, w.created_at, p.name, p.price, p.image, p.category,
              (SELECT COALESCE(AVG(rating), 0) FROM reviews r WHERE r.product_id = p.id) AS avg_rating
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [req.user.id]
    );
    result.rows.forEach((r) => {
      r.price = Number(r.price);
      r.avg_rating = Number(r.avg_rating);
    });
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/wishlist
// Logged-in user - add a product to the wishlist
router.post(
  "/",
  verifyToken,
  [body("product_id").isInt({ gt: 0 }).withMessage("Produit invalide")],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const productId = req.body.product_id;

    try {
      const productResult = await db.query("SELECT id FROM products WHERE id = $1", [productId]);
      if (productResult.rows.length === 0) {
        return res.status(404).json({ message: "Produit introuvable" });
      }

      await db.query(
        "INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2) ON CONFLICT (user_id, product_id) DO NOTHING",
        [req.user.id, productId]
      );

      res.status(201).json({ message: "Produit ajouté aux favoris" });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/wishlist/:productId
// Logged-in user - remove a product from the wishlist
router.delete("/:productId", verifyToken, async (req, res, next) => {
  try {
    const result = await db.query(
      "DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2",
      [req.user.id, req.params.productId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Produit absent des favoris" });
    }
    res.json({ message: "Produit retiré des favoris" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
