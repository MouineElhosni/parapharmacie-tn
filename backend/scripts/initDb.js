const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

const SCHEMA_FILE = path.join(__dirname, "..", "postgres_schema.sql");
const SEED_FILE = path.join(__dirname, "..", "seed-data.sql");

function readSeed() {
  return fs.readFileSync(SEED_FILE, "utf8");
}

async function initDb() {
  const schemaSql = fs.readFileSync(SCHEMA_FILE, "utf8");
  const seedMarker = "-- Seed data";
  const markerIdx = schemaSql.indexOf(seedMarker);
  const schemaOnly = markerIdx >= 0 ? schemaSql.slice(0, markerIdx) : schemaSql;

  const { rows } = await pool.query("SELECT to_regclass('public.products') AS tbl");

  // Le schéma est idempotent (IF NOT EXISTS) : on l'applique toujours
  // pour créer les nouvelles tables (ex: subscribers) sur une base existante.
  await pool.query(schemaOnly);

  // Migrations sur base existante : ajouter les colonnes manquantes
  const migrations = [
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT NULL",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT NULL",
  ];
  for (const sql of migrations) {
    try {
      await pool.query(sql);
    } catch (err) {
      console.error(`[initDb] Migration ignorée : ${err.message}`);
    }
  }

  if (rows[0].tbl) {
    const count = await pool.query("SELECT COUNT(*)::int AS count FROM products");
    if (count.rows[0].count === 0) {
      await pool.query(readSeed());
      console.log("[initDb] Tables existantes mais vides : données initiales appliquées");
    } else {
      console.log(`[initDb] Schéma vérifié, base existante (${count.rows[0].count} produits)`);
    }
  } else {
    await pool.query(readSeed());
    console.log("[initDb] Base neuve : schéma + données initiales appliqués");
  }
}

module.exports = initDb;
