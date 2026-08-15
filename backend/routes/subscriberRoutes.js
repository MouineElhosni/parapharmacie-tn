const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const db = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");
const { upsertSubscriber } = require("../config/subscriber");

// POST /api/subscribers
// Public - subscribe to product/promo notifications (WhatsApp and/or email)
router.post(
  "/",
  [
    body("phone").optional({ checkFalsy: true }).trim().isLength({ min: 8, max: 20 }),
    body("email").optional({ checkFalsy: true }).isEmail(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { phone, email } = req.body;
    if (!phone && !email) {
      return res
        .status(400)
        .json({ message: "Renseignez au moins un numéro de téléphone ou un email" });
    }

    try {
      await upsertSubscriber({ phone, email });
      res.status(201).json({
        message: "Inscription enregistrée ! Vous recevrez les nouveautés et les promotions.",
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/subscribers
// Admin only - list all subscribers
router.get("/", verifyToken, isAdmin, async (req, res, next) => {
  try {
    const result = await db.query(
      "SELECT id, phone, email, source, created_at FROM subscribers ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/subscribers/:id
// Admin only - remove a subscriber
router.delete("/:id", verifyToken, isAdmin, async (req, res, next) => {
  try {
    const result = await db.query("DELETE FROM subscribers WHERE id = $1", [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Abonné introuvable" });
    }
    res.json({ message: "Abonné supprimé" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
