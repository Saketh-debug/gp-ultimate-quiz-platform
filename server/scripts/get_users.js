const pool = require('../db');

async function getUsers() {
  try {
    const res = await pool.query("SELECT id, username, token FROM users LIMIT 3");
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

getUsers();
