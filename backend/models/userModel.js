const db = require("../config/db");

const createUser = (user, callback) => {
  const sql = `
    INSERT INTO users
    (name, email, password)
    VALUES ($1, $2, $3)
  `;

  db.query(sql, [user.name, user.email, user.password], (err, result) => {
    if (err) return callback(err);
    callback(null, result.rows);
  });
};

const findUserByEmail = (email, callback) => {
  const sql = `
    SELECT * FROM users
    WHERE email = $1
  `;

  db.query(sql, [email], (err, result) => {
    if (err) return callback(err);
    callback(null, result.rows);
  });
};

module.exports = {
  createUser,
  findUserByEmail,
};
