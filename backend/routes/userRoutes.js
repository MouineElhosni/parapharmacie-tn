const express = require("express");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

// GET /api/users/profile
// Logged-in user - return full profile
router.get("/profile", verifyToken, async (req, res, next) => {
  try {
    const result = await db.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/profile
// Logged-in user - update name and/or email
router.put(
  "/profile",
  verifyToken,
  [
    body("name").trim().notEmpty().withMessage("Le nom est requis"),
    body("email").isEmail().withMessage("Un email valide est requis"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, email } = req.body;

    try {
      const existingResult = await db.query(
        "SELECT id FROM users WHERE email = $1 AND id != $2",
        [email, req.user.id]
      );
      if (existingResult.rows.length > 0) {
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
      }

      await db.query("UPDATE users SET name = $1, email = $2 WHERE id = $3", [
        name.trim(),
        email,
        req.user.id,
      ]);

      res.json({
        message: "Profil mis à jour avec succès",
        user: { id: req.user.id, name: name.trim(), email },
      });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/users/password
// Logged-in user - change password
router.put(
  "/password",
  verifyToken,
  [
    body("current_password").notEmpty().withMessage("Le mot de passe actuel est requis"),
    body("new_password")
      .isLength({ min: 6 })
      .withMessage("Le nouveau mot de passe doit contenir au moins 6 caractères"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { current_password, new_password } = req.body;

    try {
      const result = await db.query("SELECT password FROM users WHERE id = $1", [req.user.id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Utilisateur introuvable" });
      }

      const isMatch = await bcrypt.compare(current_password, result.rows[0].password);
      if (!isMatch) {
        return res.status(400).json({ message: "Le mot de passe actuel est incorrect" });
      }

      const hash = await bcrypt.hash(new_password, 10);
      await db.query("UPDATE users SET password = $1 WHERE id = $2", [hash, req.user.id]);

      res.json({ message: "Mot de passe modifié avec succès" });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/users
// Admin only - list all users
router.get("/", verifyToken, isAdmin, async (req, res, next) => {
  try {
    const result = await db.query(
      "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/:id/role
// Admin only - change a user's role (user <-> admin)
router.put("/:id/role", verifyToken, isAdmin, async (req, res, next) => {
  const { role } = req.body;

  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ message: "Le rôle doit être 'user' ou 'admin'" });
  }

  const targetId = Number(req.params.id);

  if (targetId === Number(req.user.id)) {
    return res.status(400).json({ message: "Vous ne pouvez pas changer votre propre rôle" });
  }

  try {
    const result = await db.query("UPDATE users SET role = $1 WHERE id = $2", [role, targetId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    res.json({ message: "Rôle de l'utilisateur mis à jour", role });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
