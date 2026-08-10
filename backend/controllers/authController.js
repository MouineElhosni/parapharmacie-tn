const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/userModel");

// REGISTER USER
exports.register = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { name, email, password } = req.body;

  User.findUserByEmail(email, (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur interne du serveur" });

    if (result.length > 0) {
      return res.status(400).json({ message: "Cet e-mail est déjà utilisé" });
    }

    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return res.status(500).json({ message: "Erreur interne du serveur" });

      User.createUser({ name, email, password: hash }, (err) => {
        if (err) return res.status(500).json({ message: "Erreur interne du serveur" });

        res.status(201).json({ message: "Inscription réussie" });
      });
    });
  });
};

// LOGIN
exports.login = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { email, password } = req.body;

  User.findUserByEmail(email, (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur interne du serveur" });

    if (result.length === 0) {
      return res.status(401).json({ message: "E-mail ou mot de passe invalide" });
    }

    const user = result[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ message: "Erreur interne du serveur" });

      if (!isMatch) {
        return res.status(401).json({ message: "E-mail ou mot de passe invalide" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.json({
        message: "Connexion réussie",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    });
  });
};
