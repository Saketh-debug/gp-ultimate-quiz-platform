require("dotenv").config({ override: true });
const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

async function addSocketIdColumns() {
    try {
        console.log("Adding socket_id columns to session tables...");

        // Add socket_id to cascade_sessions
        console.log("Adding socket_id to cascade_sessions...");
        await pool.query(`
            ALTER TABLE cascade_sessions
            ADD COLUMN IF NOT EXISTS socket_id VARCHAR(255)
        `);
        console.log("✅ cascade_sessions updated");

        // Add socket_id to dsa_sessions
        console.log("Adding socket_id to dsa_sessions...");
        await pool.query(`
            ALTER TABLE dsa_sessions
            ADD COLUMN IF NOT EXISTS socket_id VARCHAR(255)
        `);
        console.log("✅ dsa_sessions updated");

        console.log("🎉 All session tables updated with socket_id columns!");

    } catch (err) {
        console.error("❌ Migration failed:", err.message);
    } finally {
        pool.end();
    }
}

addSocketIdColumns();
