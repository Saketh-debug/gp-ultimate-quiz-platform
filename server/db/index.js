require("dotenv").config({ override: true }); // 👈 REQUIRED: Override shell env vars

const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT, // 👈 REQUIRED
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  max: 30,
});

console.log("🔌 DB Config:", {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  db: process.env.DB_NAME
});

pool.query("SELECT 1")
  .then(() => console.log("✅ DB connected"))
  .catch(err => console.error("❌ DB connection failed:", err.message));

module.exports = pool;

// const { Pool } = require("pg");

// const pool = new Pool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME,
// });

// module.exports = pool;