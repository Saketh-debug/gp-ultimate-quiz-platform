const express = require("express");
const router = express.Router();
const pool = require("../db");

const ROUND_NAME = 'dsa';
const GRACE_PERIOD_MINUTES = 30;
const CONTEST_DURATION_MINUTES = 120; // 2 hours

// Join or Resume DSA Round
router.post("/join", async (req, res) => {
    try {
        const { token } = req.body;
        const now = new Date();

        // 1. Check Round Status
        const roundStatusRes = await pool.query(
            "SELECT * FROM round_control WHERE round_name = $1",
            [ROUND_NAME]
        );

        if (roundStatusRes.rows.length === 0 || !roundStatusRes.rows[0].is_active) {
            return res.status(403).json({ error: "DSA round has not started yet." });
        }

        const roundStartTime = new Date(roundStatusRes.rows[0].start_time);
        const diffMinutes = (now - roundStartTime) / 1000 / 60;

        // 2. Validate user
        const userRes = await pool.query("SELECT * FROM users WHERE token = $1", [token]);
        if (userRes.rows.length === 0) {
            return res.status(401).json({ error: "Invalid token" });
        }
        const user = userRes.rows[0];

        // 3. Check for existing active session
        const activeSession = await pool.query(
            "SELECT * FROM dsa_sessions WHERE user_id = $1",
            [user.id]
        );

        let outputQuestions = [];

        if (activeSession.rows.length > 0) {
            // --- RESUME EXISTING SESSION ---
            const session = activeSession.rows[0];

            if (session.end_time < now) {
                return res.status(403).json({ error: "Contest has ended for this user." });
            }

            // Fetch assigned questions
            const qRes = await pool.query(
                `SELECT q.id, q.title, q.description, duq.status, duq.base_points, duq.sequence_order, duq.accepted_at
                 FROM questions q
                 JOIN dsa_user_questions duq ON q.id = duq.question_id
                 WHERE duq.user_id = $1
                 ORDER BY duq.sequence_order ASC`,
                [user.id]
            );

            // Redact description and replace title for accepted questions
            outputQuestions = qRes.rows.map(q => {
                if (q.status === 'ACCEPTED') {
                    return {
                        ...q,
                        title: "Question Solved",
                        description: "You have already successfully solved this question."
                    };
                }
                return q;
            });

            const totalTimeLeft = Math.max(0, Math.floor((new Date(session.end_time) - now) / 1000));

            res.json({
                userId: user.id,
                team: user.team_name,
                endTime: session.end_time,
                totalTimeLeft,
                totalScore: session.total_score,
                questions: outputQuestions,
                message: "Resumed session"
            });

        } else {
            // --- NEW SESSION ---
            if (diffMinutes > GRACE_PERIOD_MINUTES) {
                return res.status(403).json({ error: "Entry closed. Grace period exceeded." });
            }

            const endTime = new Date(now.getTime() + CONTEST_DURATION_MINUTES * 60 * 1000);

            // Cleanup old questions just in case
            await pool.query("DELETE FROM dsa_user_questions WHERE user_id = $1", [user.id]);

            // Create Session
            await pool.query(
                "INSERT INTO dsa_sessions(user_id, join_time, end_time) VALUES ($1, $2, $3)",
                [user.id, now, endTime]
            );

            // Assign 5 DSA Questions (round = 'dsa')
            const qRes = await pool.query(
                "SELECT id, title, description, base_points, sequence_order FROM questions WHERE round = 'dsa' ORDER BY sequence_order ASC LIMIT 5"
            );

            let questionsToAssign = qRes.rows;
            if (questionsToAssign.length === 0) {
                return res.status(500).json({ error: "No DSA questions found in DB. Please seed questions first." });
            }

            for (let i = 0; i < questionsToAssign.length; i++) {
                const q = questionsToAssign[i];
                const basePts = q.base_points || 100;

                await pool.query(
                    "INSERT INTO dsa_user_questions(user_id, question_id, sequence_order, base_points) VALUES ($1, $2, $3, $4)",
                    [user.id, q.id, i, basePts]
                );

                outputQuestions.push({
                    ...q,
                    sequence_order: i,
                    status: null,
                    base_points: basePts,
                    accepted_at: null
                });
            }

            res.json({
                userId: user.id,
                team: user.team_name,
                endTime,
                totalTimeLeft: CONTEST_DURATION_MINUTES * 60,
                totalScore: 0,
                questions: outputQuestions,
                message: "New session started"
            });
        }

    } catch (err) {
        console.error("❌ DSA JOIN ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Submit Result (Called after socket execution confirms ACCEPTED)
router.post("/submit-result", async (req, res) => {
    const { userId, questionId } = req.body;
    try {
        const sessionRes = await pool.query("SELECT * FROM dsa_sessions WHERE user_id = $1", [userId]);
        if (sessionRes.rows.length === 0) return res.status(404).json({ error: "Session not found" });
        const session = sessionRes.rows[0];

        const qRes = await pool.query("SELECT * FROM dsa_user_questions WHERE user_id = $1 AND question_id = $2", [userId, questionId]);
        if (qRes.rows.length === 0) return res.status(404).json({ error: "Question not found" });
        const question = qRes.rows[0];

        if (question.status === 'ACCEPTED') {
            return res.json({
                message: "Already accepted previously",
                totalScore: session.total_score
            });
        }

        const now = new Date();

        // Update Question Status
        await pool.query(
            "UPDATE dsa_user_questions SET status = 'ACCEPTED', accepted_at = $1 WHERE user_id = $2 AND question_id = $3",
            [now, userId, questionId]
        );

        // Calculate new total score
        const newTotalScore = session.total_score + question.base_points;

        // Update Session
        await pool.query(
            "UPDATE dsa_sessions SET total_score = $1 WHERE user_id = $2",
            [newTotalScore, userId]
        );

        res.json({
            success: true,
            totalScore: newTotalScore,
            acceptedAt: now
        });

    } catch (err) {
        console.error("❌ DSA SUBMIT ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Lightweight time-check endpoint for visibility re-sync
router.post("/time-check", async (req, res) => {
    const { userId } = req.body;
    try {
        const sessionRes = await pool.query(
            "SELECT end_time FROM dsa_sessions WHERE user_id = $1",
            [userId]
        );

        if (sessionRes.rows.length === 0) {
            return res.json({ totalTimeLeft: 0, contestEnded: true });
        }

        const endTime = new Date(sessionRes.rows[0].end_time);
        const now = new Date();
        const totalTimeLeft = Math.max(0, Math.floor((endTime - now) / 1000));

        if (totalTimeLeft <= 0) {
            return res.json({ totalTimeLeft: 0, contestEnded: true });
        }

        res.json({ totalTimeLeft, contestEnded: false });
    } catch (err) {
        console.error("❌ DSA TIME-CHECK ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
