
const { Pool } = require('pg');
require("dotenv").config({ path: "../.env", override: true });

const config = {
    user: 'postgres',
    host: '127.0.0.1',
    database: 'contest_db',
    password: 'password',
    port: 5432,
};

const pool = new Pool(config);

async function resetSessions() {
    try {
        console.log("🔌 Connecting to DB...");

        // Truncate user_sessions and user_questions to clear all progress
        console.log("🗑️  Clearing 'user_sessions' and 'user_questions'...");
        await pool.query(`TRUNCATE TABLE user_sessions, user_questions RESTART IDENTITY CASCADE;`);

        console.log("✅ Sessions cleared. You can now join as a new user.");
        process.exit(0);

    } catch (err) {
        console.error("❌ Failed to clear sessions:", err);
        process.exit(1);
    }
}

resetSessions();
