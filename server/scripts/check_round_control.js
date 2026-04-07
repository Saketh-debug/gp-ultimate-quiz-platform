const pool = require('../db');

async function checkRoundControl() {
  try {
    const res = await pool.query("SELECT * FROM round_control");
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkRoundControl();
