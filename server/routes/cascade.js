const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/authMiddleware');

const ROUND_NAME = 'cascade';
const GRACE_PERIOD_MINUTES = 30;
const CONTEST_DURATION_MINUTES = 60;

// Scoring Configuration (change these to adjust scoring)
const BASE_POINTS_CASCADE = 12;
const STREAK_MULTIPLIER = 20;

// Join or Resume Cascade Round
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
            return res.status(403).json({ error: "Coding Cascade round has not started yet." });
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
            "SELECT * FROM cascade_sessions WHERE user_id = $1",
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
                `SELECT q.id, q.title, q.description, q.time_limit, cuq.status, cuq.base_points, cuq.is_streak_eligible, cuq.sequence_order
                 FROM questions q
                 JOIN cascade_user_questions cuq ON q.id = cuq.question_id
                 WHERE cuq.user_id = $1
                 ORDER BY cuq.sequence_order ASC`,
                [user.id]
            );

            outputQuestions = qRes.rows;

            const totalTimeLeft = Math.max(0, Math.floor((new Date(session.end_time) - now) / 1000));

            // Fetch current cascade_score for resume seeding (edge case #6)
            const scoreRes = await pool.query("SELECT cascade_score FROM users WHERE id = $1", [user.id]);
            const cascadeScore = scoreRes.rows[0]?.cascade_score || 0;

            // Issue a fresh JWT on resume
            const versionRes = await pool.query(
                'SELECT session_version FROM users WHERE id = $1', [user.id]
            );
            const sessionVersion = versionRes.rows[0].session_version;
            const accessToken = jwt.sign(
                { userId: user.id, username: user.username, role: 'user', sessionVersion },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '3h' }
            );

            res.json({
                accessToken,
                userId: user.id,
                team: user.team_name,
                endTime: session.end_time,
                totalTimeLeft,
                currentStreak: session.current_streak,
                maxStreak: session.max_streak,
                highestForwardIndex: session.highest_forward_index,
                isReviewMode: session.is_review_mode,
                currentViewingIndex: session.current_viewing_index,
                cascadeScore,
                questions: outputQuestions,
                message: "Resumed session"
            });

        } else {
            // --- NEW SESSION ---
            if (diffMinutes > GRACE_PERIOD_MINUTES) {
                return res.status(403).json({ error: "Entry closed. Grace period exceeded." });
            }

            const endTime = new Date(now.getTime() + CONTEST_DURATION_MINUTES * 60 * 1000);

            // Increment session_version — invalidates any existing JWT for this user
            const versionRes = await pool.query(
                'UPDATE users SET session_version = session_version + 1 WHERE id = $1 RETURNING session_version',
                [user.id]
            );
            const sessionVersion = versionRes.rows[0].session_version;

            // Force-logout old socket if one exists (via in-memory Map)
            const io = req.app.get('io');
            const userSockets = req.app.get('userSockets');
            const existingSocketId = userSockets?.get(String(user.id));
            if (existingSocketId && io) {
                io.to(existingSocketId).emit('force_logout');
            }

            // Cleanup old questions just in case
            await pool.query("DELETE FROM cascade_user_questions WHERE user_id = $1", [user.id]);

            // Create Session
            await pool.query(
                "INSERT INTO cascade_sessions(user_id, join_time, end_time) VALUES ($1, $2, $3)",
                [user.id, now, endTime]
            );

            // Assign 15 Fixed Questions (Requires questions to have sequence_order)
            // For now, we grab 15 questions order by sequence_order or id. 
            // We assume there are exactly 15 cascade questions set up in DB.
            const qRes = await pool.query(
                "SELECT id, title, description, base_points, sequence_order, time_limit FROM questions WHERE round = 'cascade' ORDER BY sequence_order ASC LIMIT 15"
            );

            const questionsToAssign = qRes.rows;

            if (questionsToAssign.length === 0) {
                return res.status(500).json({ error: "No Cascade questions found in DB. Please seed questions with round = 'cascade' first." });
            }

            for (let i = 0; i < questionsToAssign.length; i++) {
                const q = questionsToAssign[i];
                const basePts = q.base_points || 10;

                await pool.query(
                    "INSERT INTO cascade_user_questions(user_id, question_id, sequence_order, base_points, is_streak_eligible) VALUES ($1, $2, $3, $4, TRUE)",
                    [user.id, q.id, i, basePts]
                );

                outputQuestions.push({
                    ...q,
                    sequence_order: i,
                    status: null,
                    base_points: basePts,
                    time_limit: q.time_limit ?? null,
                    is_streak_eligible: true
                });
            }

            // Issue JWT for new session
            const accessToken = jwt.sign(
                { userId: user.id, username: user.username, role: 'user', sessionVersion },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '3h' }
            );

            res.json({
                accessToken,
                userId: user.id,
                team: user.team_name,
                endTime,
                totalTimeLeft: CONTEST_DURATION_MINUTES * 60,
                currentStreak: 0,
                maxStreak: 0,
                highestForwardIndex: 0,
                cascadeScore: 0,
                questions: outputQuestions,
                message: "New session started"
            });
        }

    } catch (err) {
        console.error("❌ CASCADE JOIN ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Submit Result (Called after Socket execution)
router.post("/submit-result", authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { questionId } = req.body;
    try {
        const sessionRes = await pool.query("SELECT * FROM cascade_sessions WHERE user_id = $1", [userId]);
        if (sessionRes.rows.length === 0) return res.status(404).json({ error: "Session not found" });
        const session = sessionRes.rows[0];

        const qRes = await pool.query("SELECT * FROM cascade_user_questions WHERE user_id = $1 AND question_id = $2", [userId, questionId]);
        if (qRes.rows.length === 0) return res.status(404).json({ error: "Question not found" });
        const question = qRes.rows[0];

        // Idempotency: already accepted — return current score (edge case #3)
        if (question.status === 'ACCEPTED') {
            const userRes = await pool.query("SELECT cascade_score FROM users WHERE id = $1", [userId]);
            return res.json({
                success: true,
                message: "Already accepted previously",
                currentStreak: session.current_streak,
                maxStreak: session.max_streak,
                highestForwardIndex: session.highest_forward_index,
                cascadeScore: userRes.rows[0]?.cascade_score || 0
            });
        }

        let newCurrentStreak = session.current_streak;
        let newMaxStreak = session.max_streak;
        let newHighestForward = session.highest_forward_index;

        if (question.is_streak_eligible) {
            newCurrentStreak += 1;
            newMaxStreak = Math.max(newMaxStreak, newCurrentStreak);
            newHighestForward = Math.max(newHighestForward, question.sequence_order + 1);
        }

        // Update Question Status
        await pool.query(
            "UPDATE cascade_user_questions SET status = 'ACCEPTED' WHERE user_id = $1 AND question_id = $2",
            [userId, questionId]
        );

        // Update Session (streaks)
        await pool.query(
            "UPDATE cascade_sessions SET current_streak = $1, max_streak = $2, highest_forward_index = $3 WHERE user_id = $4",
            [newCurrentStreak, newMaxStreak, newHighestForward, userId]
        );

        // Use per-question base_points from snapshot (set at session join time).
        // ?? 12 as fallback: nullish only (0 is a valid score and should NOT be overridden)
        const scoreToAward = question.base_points ?? 12;

        // Award base points — atomic guard prevents double-scoring (edge case #9)
        const scoreUpdateRes = await pool.query(
            "UPDATE cascade_user_questions SET score_awarded = $1 WHERE user_id = $2 AND question_id = $3 AND score_awarded = 0 RETURNING score_awarded",
            [scoreToAward, userId, questionId]
        );

        let cascadeScore = 0;
        if (scoreUpdateRes.rows.length > 0) {
            // Score was successfully awarded — increment user total
            const userUpdateRes = await pool.query(
                "UPDATE users SET cascade_score = cascade_score + $1 WHERE id = $2 RETURNING cascade_score",
                [scoreToAward, userId]
            );
            cascadeScore = userUpdateRes.rows[0]?.cascade_score || 0;
            console.log(`🏆 Cascade Score: User ${userId}, Q ${questionId} → +${scoreToAward} pts | Total: ${cascadeScore}`);
        } else {
            // Already scored (race condition) — just fetch current total
            const userRes = await pool.query("SELECT cascade_score FROM users WHERE id = $1", [userId]);
            cascadeScore = userRes.rows[0]?.cascade_score || 0;
        }

        res.json({
            success: true,
            currentStreak: newCurrentStreak,
            maxStreak: newMaxStreak,
            highestForwardIndex: newHighestForward,
            scoreAwarded: scoreToAward,
            cascadeScore
        });

    } catch (err) {
        console.error("❌ CASCADE SUBMIT ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Skip Question
router.post("/skip", authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { questionId } = req.body;
    try {
        const sessionRes = await pool.query("SELECT highest_forward_index FROM cascade_sessions WHERE user_id = $1", [userId]);
        const highestForward = sessionRes.rows[0].highest_forward_index;

        await pool.query(
            "UPDATE cascade_user_questions SET status = 'SKIPPED' WHERE user_id = $1 AND question_id = $2",
            [userId, questionId]
        );

        // Update Session - BREAK STREAK
        const newHighestForward = highestForward + 1;
        await pool.query(
            "UPDATE cascade_sessions SET current_streak = 0, highest_forward_index = $1 WHERE user_id = $2",
            [newHighestForward, userId]
        );

        res.json({ success: true, currentStreak: 0, highestForwardIndex: newHighestForward });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Go Back
router.post("/go-back", authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        const sessionRes = await pool.query("SELECT highest_forward_index FROM cascade_sessions WHERE user_id = $1", [userId]);
        const highestForward = sessionRes.rows[0].highest_forward_index;

        // Break streak
        await pool.query("UPDATE cascade_sessions SET current_streak = 0, is_review_mode = TRUE WHERE user_id = $1", [userId]);

        // Mark remaining unvisited questions as not streak eligible? 
        // Wait, the plan says: When returning from "Go Back", a new streak begins.
        // So the remaining unvisited questions ARE streak eligible.
        // We just need to mark the ONES WE ARE GOING BACK TO as not eligible.
        // But the user already skipped them, or they had status NULL < highest_forward.

        await pool.query(
            "UPDATE cascade_user_questions SET is_streak_eligible = FALSE WHERE user_id = $1 AND sequence_order < $2",
            [userId, highestForward]
        );

        res.json({ success: true, currentStreak: 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Return Forward
router.post("/return-forward", authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        await pool.query("UPDATE cascade_sessions SET is_review_mode = FALSE, current_viewing_index = 0 WHERE user_id = $1", [userId]);
        res.json({ success: true, message: "Returned to forward progression. New streak started." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lightweight time-check endpoint for visibility re-sync
router.post("/time-check", authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        const sessionRes = await pool.query(
            "SELECT end_time FROM cascade_sessions WHERE user_id = $1",
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

        res.json({ totalTimeLeft });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Persist currently viewed node index (for reload resilience)
router.post("/update-viewing-index", authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { currentViewingIndex } = req.body;
    try {
        await pool.query(
            "UPDATE cascade_sessions SET current_viewing_index = $1 WHERE user_id = $2",
            [currentViewingIndex, userId]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
