const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const authController = require("../controllers/authController");

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Veuillez saisir un e-mail valide"),
    body("password").notEmpty().withMessage("Le mot de passe est obligatoire"),
  ],
  authController.login
);

module.exports = router;
