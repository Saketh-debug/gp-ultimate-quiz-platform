// config.js
module.exports = {
    // ----------------------------------------------------
    // 1. WORKER CONFIGURATION (The Muscle)
    // ----------------------------------------------------
    // Update these IPs whenever your laptops change networks!
    JUDGE_NODES: [
        process.env.JUDGE0_URL || 'http://192.168.1.113:2358',
    ],

    // ----------------------------------------------------
    // 2. INFRASTRUCTURE CONFIGURATION (The Brain)
    // ----------------------------------------------------
    REDIS_CONFIG: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
    },

    PG_CONFIG: {
        user: process.env.PG_USER || 'postgres',
        host: process.env.PG_HOST || 'localhost',
        database: process.env.PG_DATABASE || 'contest_db',
        password: process.env.PG_PASSWORD || 'password', // Matches the docker run command from Phase 2
        port: process.env.PG_PORT || 5432,
        max: 20,
    },

    // Internal secret — must match INTERNAL_SECRET in server/.env
    // Protects submit-result endpoints from being called by users directly.
    INTERNAL_SECRET: 'opulence_contest_internal_dispatcher_secret_2025_!@#',
};