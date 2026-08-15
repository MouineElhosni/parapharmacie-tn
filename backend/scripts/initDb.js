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

  if (rows[0].tbl) {
    const count = await pool.query("SELECT COUNT(*)::int AS count FROM products");
    if (count.rows[0].count === 0) {
      await pool.query(readSeed());
      console.log("[initDb] Tables existantes mais vides : données initiales appliquées");
    } else {
      console.log(`[initDb] Base existante (${count.rows[0].count} produits) : rien à faire`);
    }
  } else {
    await pool.query(schemaOnly);
    await pool.query(readSeed());
    console.log("[initDb] Base neuve : schéma + données initiales appliqués");
  }
}

module.exports = initDb;
