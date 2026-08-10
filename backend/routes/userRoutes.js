const express = require("express");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

const promisePool = db.promise();

// GET /api/users/profile
// Logged-in user - return full profile
router.get("/profile", verifyToken, async (req, res, next) => {
  try {
    const [result] = await promisePool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
      [req.user.id]
    );
    if (result.length === 0) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    res.json(result[0]);
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
      const [existing] = await promisePool.query(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [email, req.user.id]
      );
      if (existing.length > 0) {
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
      }

      await promisePool.query("UPDATE users SET name = ?, email = ? WHERE id = ?", [
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
      const [result] = await promisePool.query("SELECT password FROM users WHERE id = ?", [
        req.user.id,
      ]);
      if (result.length === 0) {
        return res.status(404).json({ message: "Utilisateur introuvable" });
      }

      const isMatch = await bcrypt.compare(current_password, result[0].password);
      if (!isMatch) {
        return res.status(400).json({ message: "Le mot de passe actuel est incorrect" });
      }

      const hash = await bcrypt.hash(new_password, 10);
      await promisePool.query("UPDATE users SET password = ? WHERE id = ?", [hash, req.user.id]);

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
    const [users] = await promisePool.query(
      "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(users);
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
    const [result] = await promisePool.query("UPDATE users SET role = ? WHERE id = ?", [
      role,
      targetId,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    res.json({ message: "Rôle de l'utilisateur mis à jour", role });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
