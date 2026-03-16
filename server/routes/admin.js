
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

        // Cap active session end_times to now so streak bonus can be applied immediately
        // Using parameterized JS Date (not SQL NOW()) to stay consistent with how
        // end_time was originally written — avoids mixed-timezone data in the column
        const now = new Date();
        if (roundName === 'cascade') {
            await pool.query(
                "UPDATE cascade_sessions SET end_time = $1 WHERE end_time > $1",
                [now]
            );
        }
        if (roundName === 'dsa') {
            await pool.query(
                "UPDATE dsa_sessions SET end_time = $1 WHERE end_time > $1",
                [now]
            );
        }

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
    const adminCheck = await pool.query("SELECT * FROM admins WHERE token = $1", [token]);
    if (adminCheck.rows.length === 0) {
        return res.status(403).json({ error: "Unauthorized" });
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


// ============================================================
// ===         ADMIN QUESTION MANAGEMENT ROUTES             ===
// ============================================================

// DSA scoring requires a specific number of TCs per question slot (0-indexed)
const DSA_REQUIRED_TC_COUNT = {
    0: 3, // Q1: all-or-nothing 3 TCs
    1: 2, // Q2: 2 TCs
    2: 2, // Q3: 2 TCs
    3: 3, // Q4: 3 TCs
    4: 3, // Q5: 3 TCs
};

// Helper: check if a round has any active user sessions right now
async function hasActiveSessions(round) {
    if (round === 'cascade') {
        const r = await pool.query("SELECT 1 FROM cascade_sessions WHERE end_time > NOW() LIMIT 1");
        return r.rows.length > 0;
    }
    if (round === 'dsa') {
        const r = await pool.query("SELECT 1 FROM dsa_sessions WHERE end_time > NOW() LIMIT 1");
        return r.rows.length > 0;
    }
    // rapidfire
    const r = await pool.query("SELECT 1 FROM user_sessions WHERE end_time > NOW() LIMIT 1");
    return r.rows.length > 0;
}

// GET /admin/questions/:round — list all questions for a round (with TC counts)
router.get("/questions/:round", async (req, res) => {
    const { round } = req.params;
    const token = req.query.token;
    const adminCheck = await pool.query("SELECT * FROM admins WHERE token = $1", [token]);
    if (adminCheck.rows.length === 0) return res.status(403).json({ error: "Unauthorized" });

    try {
        const result = await pool.query(`
            SELECT q.*,
                   (SELECT COUNT(*) FROM test_cases tc WHERE tc.problem_id = q.id::text) AS tc_count
            FROM questions q
            WHERE q.round = $1
            ORDER BY q.sequence_order ASC, q.id ASC
        `, [round]);
        res.json(result.rows);
    } catch (err) {
        console.error("❌ LIST QUESTIONS ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET /admin/questions/:id/testcases — get all test cases for a question
router.get("/questions/:id/testcases", async (req, res) => {
    const { id } = req.params;
    const token = req.query.token;
    const adminCheck = await pool.query("SELECT * FROM admins WHERE token = $1", [token]);
    if (adminCheck.rows.length === 0) return res.status(403).json({ error: "Unauthorized" });

    try {
        const result = await pool.query(
            "SELECT * FROM test_cases WHERE problem_id = $1::text ORDER BY id ASC",
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /admin/questions — create a new question + test cases (atomic)
router.post("/questions", async (req, res) => {
    const { token, round, title, description, avg_time, base_points, time_limit, sequence_order, test_cases } = req.body;
    const adminCheck = await pool.query("SELECT * FROM admins WHERE token = $1", [token]);
    if (adminCheck.rows.length === 0) return res.status(403).json({ error: "Unauthorized" });

    // Validate required fields
    if (!round || !title || !description) {
        return res.status(400).json({ error: "round, title, and description are required" });
    }

    // Cascade: check for sequence_order duplicate
    if (round === 'cascade' && sequence_order !== undefined) {
        const dupCheck = await pool.query(
            "SELECT 1 FROM questions WHERE round = 'cascade' AND sequence_order = $1",
            [sequence_order]
        );
        if (dupCheck.rows.length > 0) {
            return res.status(409).json({ error: `Cascade sequence_order ${sequence_order} is already in use by another question.` });
        }
    }

    // DSA: validate test case count matches scoring tier
    if (round === 'dsa' && sequence_order !== undefined) {
        const required = DSA_REQUIRED_TC_COUNT[sequence_order];
        const actual = (test_cases || []).length;
        if (required !== undefined && actual !== required) {
            return res.status(400).json({
                error: `DSA question at position ${sequence_order} requires exactly ${required} test cases (got ${actual}). Changing TC count would break partial scoring.`
            });
        }
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const qRes = await client.query(
            `INSERT INTO questions (title, description, avg_time, round, base_points, sequence_order, time_limit)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [
                title,
                description,
                avg_time || 180,
                round,
                base_points || 10,
                sequence_order || 0,
                time_limit || null
            ]
        );
        const question = qRes.rows[0];

        for (const tc of (test_cases || [])) {
            await client.query(
                "INSERT INTO test_cases (problem_id, input, expected_output, is_hidden) VALUES ($1, $2, $3, $4)",
                [question.id.toString(), tc.input, tc.expected_output, tc.is_hidden !== false]
            );
        }

        await client.query("COMMIT");
        console.log(`✅ Admin created question ID ${question.id} (${round})`);
        res.json({ success: true, question });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("❌ CREATE QUESTION ERROR:", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// PUT /admin/questions/:id — update question fields + replace all test cases (atomic)
router.put("/questions/:id", async (req, res) => {
    const { id } = req.params;
    const { token, round, title, description, avg_time, base_points, time_limit, sequence_order, test_cases } = req.body;
    const adminCheck = await pool.query("SELECT * FROM admins WHERE token = $1", [token]);
    if (adminCheck.rows.length === 0) return res.status(403).json({ error: "Unauthorized" });

    // Fetch existing question to know its round
    const existing = await pool.query("SELECT * FROM questions WHERE id = $1", [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: "Question not found" });
    const existingRound = existing.rows[0].round;
    const effectiveRound = round || existingRound;

    // Cascade: check for sequence_order duplicate (exclude self)
    if (effectiveRound === 'cascade' && sequence_order !== undefined) {
        const dupCheck = await pool.query(
            "SELECT 1 FROM questions WHERE round = 'cascade' AND sequence_order = $1 AND id != $2",
            [sequence_order, id]
        );
        if (dupCheck.rows.length > 0) {
            return res.status(409).json({ error: `Cascade sequence_order ${sequence_order} is already in use by another question.` });
        }
    }

    // DSA: validate test case count
    if (effectiveRound === 'dsa' && sequence_order !== undefined) {
        const required = DSA_REQUIRED_TC_COUNT[sequence_order];
        const actual = (test_cases || []).length;
        if (required !== undefined && actual !== required) {
            return res.status(400).json({
                error: `DSA question at position ${sequence_order} requires exactly ${required} test cases (got ${actual}).`
            });
        }
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const qRes = await client.query(
            `UPDATE questions
             SET title = $1, description = $2, avg_time = $3,
                 base_points = $4, sequence_order = $5, time_limit = $6
             WHERE id = $7 RETURNING *`,
            [
                title || existing.rows[0].title,
                description || existing.rows[0].description,
                avg_time !== undefined ? avg_time : existing.rows[0].avg_time,
                base_points !== undefined ? base_points : existing.rows[0].base_points,
                sequence_order !== undefined ? sequence_order : existing.rows[0].sequence_order,
                time_limit !== undefined ? time_limit : existing.rows[0].time_limit,
                id
            ]
        );

        // Replace test cases: delete old, insert new
        if (test_cases !== undefined) {
            await client.query("DELETE FROM test_cases WHERE problem_id = $1::text", [id]);
            for (const tc of test_cases) {
                await client.query(
                    "INSERT INTO test_cases (problem_id, input, expected_output, is_hidden) VALUES ($1, $2, $3, $4)",
                    [id.toString(), tc.input, tc.expected_output, tc.is_hidden !== false]
                );
            }
        }

        await client.query("COMMIT");
        console.log(`✅ Admin updated question ID ${id}`);
        res.json({ success: true, question: qRes.rows[0] });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("❌ UPDATE QUESTION ERROR:", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// DELETE /admin/questions/:id — delete question + test cases (blocks if active session exists)
router.delete("/questions/:id", async (req, res) => {
    const { id } = req.params;
    const { token } = req.body;
    const adminCheck = await pool.query("SELECT * FROM admins WHERE token = $1", [token]);
    if (adminCheck.rows.length === 0) return res.status(403).json({ error: "Unauthorized" });

    // Find the question's round first
    const existing = await pool.query("SELECT round FROM questions WHERE id = $1", [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: "Question not found" });
    const round = existing.rows[0].round;

    // Guard: block deletion if there are active sessions for this round
    const active = await hasActiveSessions(round);
    if (active) {
        return res.status(409).json({
            error: `Cannot delete while the ${round} round has active user sessions. Stop the round first.`
        });
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query("DELETE FROM test_cases WHERE problem_id = $1::text", [id]);
        await client.query("DELETE FROM questions WHERE id = $1", [id]);
        await client.query("COMMIT");
        console.log(`🗑️ Admin deleted question ID ${id} (${round})`);
        res.json({ success: true, message: `Question ${id} and its test cases deleted.` });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("❌ DELETE QUESTION ERROR:", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

module.exports = router;

