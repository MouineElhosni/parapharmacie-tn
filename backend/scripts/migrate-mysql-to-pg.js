// One-time migration: MySQL (XAMPP) -> PostgreSQL
// Reads all rows from the MySQL ecommerce DB and inserts them into PostgreSQL,
// preserving IDs and resetting serial sequences afterwards.
//
// Usage:
//   cd backend
//   npm install mysql2 (temporarily, or already present in node_modules)
//   node scripts/migrate-mysql-to-pg.js
//
// Env vars read from .env:
//   MySQL (source) : MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_NAME
//   PG (target)    : DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SSL

require("dotenv").config();
const mysql = require("mysql2/promise");
const { Pool } = require("pg");

const TABLES = ["users", "products", "orders", "order_items", "reviews", "wishlist"];

async function main() {
  const mysqlConn = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_NAME || "ecommerce",
  });

  const pgPool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "ecommerce",
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  });

  try {
    // Clear existing data (schema seed / previous attempts) so IDs don't collide
    await pgPool.query("TRUNCATE TABLE order_items, reviews, wishlist, orders, products, users RESTART IDENTITY CASCADE");

    const [mysqlTables] = await mysqlConn.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = ?",
      [mysqlConn.config.database]
    );
    const existing = new Set(mysqlTables.map((t) => t.table_name));

    for (const table of TABLES) {
      if (!existing.has(table)) {
        console.log(`SKIP ${table}: n'existe pas dans MySQL`);
        continue;
      }

      const [rows] = await mysqlConn.query(`SELECT * FROM ${table} ORDER BY id`);

      if (rows.length === 0) {
        console.log(`SKIP ${table}: 0 lignes`);
        continue;
      }

      const columns = Object.keys(rows[0]);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
      const colList = columns.map((c) => `"${c}"`).join(", ");
      const insertSql = `INSERT INTO ${table} (${colList}) VALUES (${placeholders})`;

      const client = await pgPool.connect();
      try {
        await client.query("BEGIN");
        for (const row of rows) {
          const values = columns.map((c) => {
            const v = row[c];
            if (v === null || v === undefined) return null;
            if (typeof v === "object" && v instanceof Date) return v;
            return v;
          });
          await client.query(insertSql, values);
        }
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }

      console.log(`OK ${table}: ${rows.length} lignes`);

      // Reset the serial sequence so new inserts keep working after explicit IDs
      const seqRes = await pgPool.query(
        `SELECT pg_get_serial_sequence('${table}', 'id') AS seq`
      );
      if (seqRes.rows[0] && seqRes.rows[0].seq) {
        await pgPool.query(`SELECT setval($1, (SELECT MAX(id) FROM ${table}))`, [
          seqRes.rows[0].seq,
        ]);
      }
    }

    console.log("Migration terminée.");
  } finally {
    await mysqlConn.end();
    await pgPool.end();
  }
}

main().catch((err) => {
  console.error("ERREUR:", err);
  process.exit(1);
});
