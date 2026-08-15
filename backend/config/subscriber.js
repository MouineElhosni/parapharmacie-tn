const db = require("./db");

// Insert or merge a subscriber identified by phone and/or email
async function upsertSubscriber({ phone, email, source = "newsletter" }) {
  const cleanPhone = phone ? String(phone).trim() : null;
  const cleanEmail = email ? String(email).trim().toLowerCase() : null;
  if (!cleanPhone && !cleanEmail) return;

  const existing = await db.query(
    "SELECT id FROM subscribers WHERE phone = $1 OR email = $2 LIMIT 1",
    [cleanPhone, cleanEmail]
  );

  if (existing.rows.length > 0) {
    await db.query(
      `UPDATE subscribers
       SET phone = COALESCE($1, phone),
           email = COALESCE($2, email),
           source = $3
       WHERE id = $4`,
      [cleanPhone, cleanEmail, source, existing.rows[0].id]
    );
  } else {
    await db.query(
      "INSERT INTO subscribers (phone, email, source) VALUES ($1, $2, $3)",
      [cleanPhone, cleanEmail, source]
    );
  }
}

module.exports = { upsertSubscriber };
