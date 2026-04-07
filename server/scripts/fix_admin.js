const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const config = {
    user: 'postgres',
    host: '127.0.0.1',
    database: 'contest_db',
    password: 'password',
    port: 5432,
};
const pool = new Pool(config);

async function fixAdmin() {
    try {
        console.log("Adding password_hash column...");
        await pool.query('ALTER TABLE admins ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)');
        
        const admins = await pool.query('SELECT id, username, password FROM admins');
        console.log(`Found ${admins.rows.length} admin(s)`);
        
        for (const admin of admins.rows) {
            if (!admin.password) continue;
            const hash = await bcrypt.hash(admin.password, 12);
            await pool.query('UPDATE admins SET password_hash = $1 WHERE id = $2', [hash, admin.id]);
            console.log(`Hashed password for ${admin.username}`);
        }
        console.log("Done.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
fixAdmin();
