
const express = require("express");
const router = express.Router();
const pool = require("../db");

// Admin Login
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query(
            "SELECT * FROM admins WHERE username = $1 AND password = $2",
            [username, password]
        );

        if (result.rows.length > 0) {
            res.json({ success: true, token: result.rows[0].token });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Round
router.post("/start-round", async (req, res) => {
    const { roundName, token } = req.body;

    // Simple token check (in real app, use middleware)
    const adminCheck = await pool.query("SELECT * FROM admins WHERE token = $1", [token]);
    if (adminCheck.rows.length === 0) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    try {
        const now = new Date();
        await pool.query(
            "INSERT INTO round_control (round_name, start_time, is_active) VALUES ($1, $2, TRUE) ON CONFLICT (round_name) DO UPDATE SET start_time = $2, is_active = TRUE",
            [roundName, now]
        );

        // Optional: Broadcast via Socket.IO if needed
        const io = req.app.get("io");
        if (io) {
            io.emit("round_started", { roundName, startTime: now });
        }

        res.json({ success: true, message: `${roundName} started at ${now.toISOString()}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Stop Round
router.post("/stop-round", async (req, res) => {
    const { roundName, token } = req.body;
    const adminCheck = await pool.query("SELECT * FROM admins WHERE token = $1", [token]);
    if (adminCheck.rows.length === 0) {
        return res.status(403).json({ error: "Unauthorized" });
    }
    try {
        await pool.query("UPDATE round_control SET is_active = FALSE WHERE round_name = $1", [roundName]);

        // Broadcast to all connected clients
        const io = req.app.get("io");
        if (io) {
            io.emit("round_stopped", { roundName });
        }

        res.json({ success: true, message: "Round stopped." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reset Round
router.post("/reset-round", async (req, res) => {
    const { roundName, token } = req.body;
    // ... Verify Token ...
    try {
        await pool.query("UPDATE round_control SET is_active = FALSE, start_time = NULL WHERE round_name = $1", [roundName]);
        res.json({ success: true, message: "Round reset to Not Started." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Round Status
router.get("/status/:roundName", async (req, res) => {
    const { roundName } = req.params;
    try {
        const result = await pool.query("SELECT * FROM round_control WHERE round_name = $1", [roundName]);
        if (result.rows.length > 0) {
            let row = result.rows[0];

            // Auto-expire logic: different durations per round
            if (row.is_active && row.start_time) {
                const now = new Date();
                const startTime = new Date(row.start_time);
                const diff = now - startTime;
                // rapidfire: 30m grace + 45m contest = 75m
                // cascade: 30m grace + 60m contest = 90m
                // dsa: 30m grace + 120m contest = 150m
                const MAX_DURATION = roundName === 'cascade'
                    ? (30 + 60) * 60 * 1000   // 90 mins
                    : roundName === 'dsa'
                        ? (30 + 120) * 60 * 1000  // 150 mins
                        : (30 + 45) * 60 * 1000;  // 75 mins

                if (diff > MAX_DURATION) {
                    await pool.query("UPDATE round_control SET is_active = FALSE WHERE round_name = $1", [roundName]);
                    row.is_active = false; // Return updated state
                }
            }

            res.json(row);
        } else {
            res.json({ round_name: roundName, is_active: false });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cascade Streak Bonus — configurable multiplier
const STREAK_MULTIPLIER = 20;

// Leaderboard — returns all teams sorted by total score
router.get("/leaderboard", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT username, team_name,
                   rapidfire_score, cascade_score, dsa_score,
                   (rapidfire_score + cascade_score + dsa_score) AS total_score
            FROM users
            ORDER BY total_score DESC, username ASC
        `);

        res.json(result.rows);
    } catch (err) {
        console.error("❌ LEADERBOARD ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Apply Streak Bonus — admin batch-applies max_streak * STREAK_MULTIPLIER to cascade_score
// Only applies to users whose sessions have expired (end_time < NOW)
// Uses atomic CTE to prevent partial failures
router.post("/apply-streak-bonus", async (req, res) => {
    const { token } = req.body;
    if (token !== process.env.ADMIN_TOKEN) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const result = await pool.query(`
            WITH to_apply AS (
                UPDATE cascade_sessions
                SET streak_bonus_applied = TRUE
                WHERE streak_bonus_applied = FALSE AND end_time < NOW()
                RETURNING user_id, max_streak
            )
            UPDATE users u
            SET cascade_score = u.cascade_score + (ta.max_streak * ${STREAK_MULTIPLIER})
            FROM to_apply ta
            WHERE u.id = ta.user_id
        `);

        const usersUpdated = result.rowCount;
        console.log(`🏆 Streak bonus applied to ${usersUpdated} users (multiplier: ${STREAK_MULTIPLIER})`);

        res.json({
            success: true,
            usersUpdated,
            message: usersUpdated > 0
                ? `Applied streak bonus to ${usersUpdated} user(s).`
                : "No pending users found (all active or already applied)."
        });
    } catch (err) {
        console.error("❌ APPLY STREAK BONUS ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
