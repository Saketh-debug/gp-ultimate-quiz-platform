
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
    // ... Verify Token ...
    try {
        await pool.query("UPDATE round_control SET is_active = FALSE WHERE round_name = $1", [roundName]);
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

            // Auto-expire logic: If active AND > 75 mins passed (30m grace + 45m contest)
            if (row.is_active && row.start_time) {
                const now = new Date();
                const startTime = new Date(row.start_time);
                const diff = now - startTime;
                const MAX_DURATION = (30 + 45) * 60 * 1000; // 75 mins

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

module.exports = router;
