const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const ordersRoutes = require("./routes/orders");
const adminRoutes = require("./routes/adminRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");

const app = express();

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// Request logging
app.use(morgan("dev"));

// CORS
const allowedOrigin = process.env.CORS_ORIGIN || "*";
app.use(cors({ origin: allowedOrigin === "*" ? true : allowedOrigin.split(",") }));

// JSON body parsing
app.use(express.json({ limit: "1mb" }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Trop de requêtes, réessayez plus tard." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Trop de tentatives, réessayez dans quelques minutes." },
});

app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);

// Static files (product images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wishlist", wishlistRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    name: "Parapharmacie.Tn API",
    version: "2.0.0",
    status: "ok",
  });
});

// Serve the frontend production build (same origin)
const frontendDist = path.join(__dirname, "..", "frontend", "dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get(/^(?!\/?(api|uploads)(\/|$)).*/, (req, res) => {
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route non trouvée" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  if (err.message === "Only image files are allowed (jpg, jpeg, png, webp, gif)") {
    return res.status(400).json({ message: "Seuls les fichiers image sont autorisés (jpg, jpeg, png, webp, gif)" });
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "Fichier trop volumineux (max 5 Mo)" });
  }
  res.status(500).json({ message: "Erreur interne du serveur" });
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
