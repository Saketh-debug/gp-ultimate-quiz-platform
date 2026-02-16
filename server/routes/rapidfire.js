
const express = require("express");
const router = express.Router();
const pool = require("../db");

const ROUND_NAME = 'rapidfire';
const GRACE_PERIOD_MINUTES = 30;
const CONTEST_DURATION_MINUTES = 45;

/**
 * Helper: Calculate remaining time for a specific question (3 mins max)
 */
function getQuestionTimeLeft(startTime) {
    if (!startTime) return 180; // Default full time if not started
    const now = new Date();
    const elapsedSeconds = Math.floor((now - new Date(startTime)) / 1000);
    return Math.max(0, 180 - elapsedSeconds);
}

// Join or Resume Rapid Fire Round
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
            return res.status(403).json({ error: "Rapid Fire round has not started yet." });
        }

        const roundStartTime = new Date(roundStatusRes.rows[0].start_time);
        const diffMinutes = (now - roundStartTime) / 1000 / 60;

        if (diffMinutes > GRACE_PERIOD_MINUTES) {
            // allow existing users to re-join/resume even after grace period, 
            // but block NEW users.
            // We'll check if user has a session below.
        }

        // 2. Validate user
        const userRes = await pool.query("SELECT * FROM users WHERE token = $1", [token]);
        if (userRes.rows.length === 0) {
            return res.status(401).json({ error: "Invalid token" });
        }
        const user = userRes.rows[0];

        // 3. Check for existing active session
        const activeSession = await pool.query(
            "SELECT * FROM user_sessions WHERE user_id = $1 AND end_time > NOW()",
            [user.id]
        );

        let outputQuestions = [];

        if (activeSession.rows.length > 0) {
            // --- RESUME EXISTING SESSION ---
            const session = activeSession.rows[0];

            // Check if session has expired
            if (session.end_time < now) {
                return res.status(403).json({ error: "Contest has ended for this user." });
            }

            // Fetch assigned questions with their specific start times
            const qRes = await pool.query(
                `SELECT q.id, q.title, q.description, uq.start_time, uq.status
                 FROM questions q
                 JOIN user_questions uq ON q.id = uq.question_id
                 WHERE uq.user_id = $1
                 ORDER BY uq.sequence_order ASC`,
                [user.id]
            );

            // --- Find current question, auto-advance past expired ones ---
            let currentIndex = -1;
            for (let i = 0; i < qRes.rows.length; i++) {
                const q = qRes.rows[i];
                // Skip already completed questions
                if (q.status === 'ACCEPTED' || q.status === 'TIMEOUT') continue;

                // This question is a candidate (status is NULL = in-progress or not started)
                if (q.start_time) {
                    const remaining = getQuestionTimeLeft(q.start_time);
                    if (remaining <= 0) {
                        // Timer expired while user was away — mark as TIMEOUT
                        await pool.query(
                            "UPDATE user_questions SET status = 'TIMEOUT' WHERE user_id = $1 AND question_id = $2",
                            [user.id, q.id]
                        );
                        qRes.rows[i].status = 'TIMEOUT';
                        continue;
                    }
                }

                // Found a valid current question
                currentIndex = i;
                break;
            }

            // If all questions are done, point to the last one
            if (currentIndex === -1) {
                currentIndex = qRes.rows.length - 1;
            }

            // Auto-start timer for the current question if it hasn't been started
            const currentQ = qRes.rows[currentIndex];
            if (!currentQ.start_time && currentQ.status !== 'ACCEPTED' && currentQ.status !== 'TIMEOUT') {
                await pool.query(
                    "UPDATE user_questions SET start_time = NOW() WHERE user_id = $1 AND question_id = $2",
                    [user.id, currentQ.id]
                );
                currentQ.start_time = now; // reflect in the object we'll return
            }

            // Build output with timeLeft per question
            outputQuestions = qRes.rows.map(q => ({
                ...q,
                timeLeft: getQuestionTimeLeft(q.start_time)
            }));

            res.json({
                userId: user.id,
                team: user.team_name,
                endTime: session.end_time,
                currentIndex,
                questions: outputQuestions,
                message: "Resumed session"
            });

        } else {
            // --- NEW SESSION ---

            // Enforce Grace Period for NEW sessions
            if (diffMinutes > GRACE_PERIOD_MINUTES) {
                return res.status(403).json({ error: "Entry closed. Grace period exceeded." });
            }

            const endTime = new Date(now.getTime() + CONTEST_DURATION_MINUTES * 60 * 1000);

            // Cleanup old questions for this user to ensure fresh start
            await pool.query("DELETE FROM user_questions WHERE user_id = $1", [user.id]);

            // Create Session
            await pool.query(
                "INSERT INTO user_sessions(user_id, join_time, end_time) VALUES ($1, $2, $3)",
                [user.id, now, endTime]
            );

            // Assign 15 Random Questions
            const qRes = await pool.query(
                "SELECT id, title, description, avg_time FROM questions ORDER BY RANDOM() LIMIT 15"
            );

            if (qRes.rows.length === 0) {
                return res.status(500).json({ error: "No questions found in DB" });
            }

            // Insert into user_questions
            // Mark the FIRST question with start_time = NOW immediately
            for (let i = 0; i < qRes.rows.length; i++) {
                const q = qRes.rows[i];
                const startTime = (i === 0) ? now : null; // Only start timer for first q

                await pool.query(
                    "INSERT INTO user_questions(user_id, question_id, start_time, sequence_order) VALUES ($1, $2, $3, $4)",
                    [user.id, q.id, startTime, i]
                );

                outputQuestions.push({
                    ...q,
                    start_time: startTime,
                    timeLeft: i === 0 ? 180 : 180 // Only meaningful for first one
                });
            }

            res.json({
                userId: user.id,
                team: user.team_name,
                endTime,
                currentIndex: 0,
                questions: outputQuestions,
                message: "New session started"
            });
        }

    } catch (err) {
        console.error("❌ RAPID FIRE JOIN ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint to start timer for a specific question (called when user moves to next q)
router.post("/start-question", async (req, res) => {
    const { userId, questionId } = req.body;
    try {
        // 1. Get the sequence order of the current question
        const qRes = await pool.query(
            "SELECT sequence_order FROM user_questions WHERE user_id = $1 AND question_id = $2",
            [userId, questionId]
        );

        if (qRes.rows.length === 0) return res.status(404).json({ error: "Question not assigned" });

        const currentSeq = qRes.rows[0].sequence_order;

        // 2. Mark all previous questions as TIMEOUT (if skipped)
        await pool.query(
            "UPDATE user_questions SET status = 'TIMEOUT' WHERE user_id = $1 AND sequence_order < $2 AND status NOT IN ('ACCEPTED', 'TIMEOUT')",
            [userId, currentSeq]
        );

        // 3. Start the timer for the CURRENT question
        const updateRes = await pool.query(
            "UPDATE user_questions SET start_time = NOW() WHERE user_id = $1 AND question_id = $2 AND start_time IS NULL RETURNING start_time",
            [userId, questionId]
        );

        // Calculate timeLeft from the (possibly just-set) start_time
        let questionTimeLeft = 180;
        if (updateRes.rows.length > 0) {
            questionTimeLeft = getQuestionTimeLeft(updateRes.rows[0].start_time);
        } else {
            // start_time was already set (not NULL), fetch it
            const existing = await pool.query(
                "SELECT start_time FROM user_questions WHERE user_id = $1 AND question_id = $2",
                [userId, questionId]
            );
            if (existing.rows.length > 0 && existing.rows[0].start_time) {
                questionTimeLeft = getQuestionTimeLeft(existing.rows[0].start_time);
            }
        }

        res.json({ success: true, timeLeft: questionTimeLeft });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
