
const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require('jsonwebtoken');
const { authenticateToken, authenticateInternal } = require('../middleware/authMiddleware');

const ROUND_NAME = 'rapidfire';
const GRACE_PERIOD_MINUTES = 30;
const CONTEST_DURATION_MINUTES = 50;

// Scoring Configuration (change BASE_POINTS to adjust scoring)
const BASE_POINTS = 10;
const QUESTION_DURATION = 300; // 5 minutes per question

/**
 * Helper: Calculate remaining time for a specific question.
 * If the round is paused, we cap the effective "now" at pausedAt so the timer
 * does not advance while the contest is frozen.
 */
function getQuestionTimeLeft(startTime, pausedAt) {
    if (!startTime) return QUESTION_DURATION; // Default full time if not started
    const now = new Date();
    // Cap effective current time at pause moment to prevent timer decay during pause
    const effectiveNow = pausedAt ? new Date(Math.min(now.getTime(), new Date(pausedAt).getTime())) : now;
    const elapsedSeconds = Math.floor((effectiveNow - new Date(startTime)) / 1000);
    return Math.max(0, QUESTION_DURATION - elapsedSeconds);
}

// Join or Resume Rapid Fire Round
// NOTE: Joining (new session) is blocked while round is paused to prevent
// users from starting with a full timer during a pause freeze.
router.post("/join", async (req, res) => {
    try {
        const { token } = req.body;
        const now = new Date();

        // 1. Check Round Status (including pause state)
        const roundStatusRes = await pool.query(
            "SELECT * FROM round_control WHERE round_name = $1",
            [ROUND_NAME]
        );

        if (roundStatusRes.rows.length === 0 || !roundStatusRes.rows[0].is_active) {
            return res.status(403).json({ error: "Rapid Fire round has not started yet." });
        }

        const roundRow = roundStatusRes.rows[0];
        const isPaused = roundRow.is_paused ?? false;
        const pausedAt = roundRow.paused_at ? new Date(roundRow.paused_at) : null;

        const roundStartTime = new Date(roundRow.start_time);
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

        // 3. Check for any prior session (active or expired)
        const activeSession = await pool.query(
            "SELECT * FROM user_sessions WHERE user_id = $1 ORDER BY join_time DESC LIMIT 1",
            [user.id]
        );

        let outputQuestions = [];

        if (activeSession.rows.length > 0) {
            // --- RESUME EXISTING SESSION ---
            const session = activeSession.rows[0];

            // Block: user already completed this contest
            if (session.completed) {
                return res.status(403).json({ error: "You have already completed this contest." });
            }

            // Block: session timer has expired
            if (new Date(session.end_time) < now) {
                return res.status(403).json({ error: "Contest has ended for this user." });
            }

            // Fetch assigned questions with their specific start times
            const qRes = await pool.query(
                `SELECT q.id, q.title, q.description, q.sample_input, uq.start_time, uq.status
                 FROM questions q
                 JOIN user_questions uq ON q.id = uq.question_id
                 WHERE uq.user_id = $1
                 ORDER BY uq.sequence_order ASC`,
                [user.id]
            );

            // --- Find current question, auto-advance past expired ones ---
            // Pass pausedAt so timer doesn't decay while round is paused
            let currentIndex = -1;
            for (let i = 0; i < qRes.rows.length; i++) {
                const q = qRes.rows[i];
                // Skip already completed questions
                if (q.status === 'ACCEPTED' || q.status === 'TIMEOUT') continue;

                // This question is a candidate (status is NULL = in-progress or not started)
                if (q.start_time) {
                    const remaining = getQuestionTimeLeft(q.start_time, pausedAt);
                    if (remaining <= 0 && !isPaused) {
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

            // If all questions are done — mark completed and block re-entry
            if (currentIndex === -1) {
                await pool.query(
                    "UPDATE user_sessions SET completed = TRUE WHERE user_id = $1",
                    [user.id]
                );
                return res.status(403).json({ error: "You have already completed this contest." });
            }

            // Auto-start timer for the current question if it hasn't been started
            // (only if NOT paused — we don't want to start a fresh timer mid-pause)
            const currentQ = qRes.rows[currentIndex];
            if (!currentQ.start_time && currentQ.status !== 'ACCEPTED' && currentQ.status !== 'TIMEOUT' && !isPaused) {
                await pool.query(
                    "UPDATE user_questions SET start_time = $3 WHERE user_id = $1 AND question_id = $2",
                    [user.id, currentQ.id, now]
                );
                currentQ.start_time = now;
            }

            // Build output with timeLeft per question (pass pausedAt so timer doesn't decay during pause)
            outputQuestions = qRes.rows.map(q => ({
                ...q,
                timeLeft: getQuestionTimeLeft(q.start_time, pausedAt)
            }));

            // Compute totalTimeLeft — if paused, we freeze the value at what it was when paused
            let totalTimeLeft;
            if (isPaused && pausedAt) {
                totalTimeLeft = Math.max(0, Math.floor((new Date(session.end_time) - pausedAt) / 1000));
            } else {
                totalTimeLeft = Math.max(0, Math.floor((new Date(session.end_time) - now) / 1000));
            }

            // Issue a fresh JWT on resume (re-validates identity, kicks old sockets)
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
                currentIndex,
                currentScore: user.rapidfire_score || 0,
                isPaused,
                questions: outputQuestions,
                message: "Resumed session"
            });

        } else {
            // --- NEW SESSION ---

            // Block new joins while round is paused
            if (isPaused) {
                return res.status(503).json({ error: "Contest is currently paused. Please wait for the admin to resume." });
            }

            // Enforce Grace Period for NEW sessions
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

            // Cleanup old questions for this user to ensure fresh start
            await pool.query("DELETE FROM user_questions WHERE user_id = $1", [user.id]);

            // Create Session
            await pool.query(
                "INSERT INTO user_sessions(user_id, join_time, end_time) VALUES ($1, $2, $3)",
                [user.id, now, endTime]
            );

            // Assign 15 Random Questions
            const qRes = await pool.query(
                "SELECT id, title, description, avg_time, sample_input FROM questions WHERE round = 'rapidfire' ORDER BY RANDOM() LIMIT 10"
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
                    timeLeft: QUESTION_DURATION // Only meaningful for first question
                });
            }

            // Issue JWT
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
                currentIndex: 0,
                currentScore: user.rapidfire_score || 0,
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
router.post("/start-question", authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { questionId } = req.body;
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
        const startNow = new Date();
        const updateRes = await pool.query(
            "UPDATE user_questions SET start_time = $3 WHERE user_id = $1 AND question_id = $2 AND start_time IS NULL RETURNING start_time",
            [userId, questionId, startNow]
        );

        // Calculate timeLeft from the (possibly just-set) start_time
        let questionTimeLeft = QUESTION_DURATION;
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

        // Also compute totalTimeLeft from session end_time
        const sessionNow = new Date();
        const sessionRes = await pool.query(
            "SELECT end_time FROM user_sessions WHERE user_id = $1 AND end_time > $2",
            [userId, sessionNow]
        );
        const totalTimeLeft = sessionRes.rows.length > 0
            ? Math.max(0, Math.floor((new Date(sessionRes.rows[0].end_time) - sessionNow) / 1000))
            : 0;

        res.json({ success: true, timeLeft: questionTimeLeft, totalTimeLeft });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lightweight time-check endpoint for visibility re-sync
router.post("/time-check", authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        const now = new Date();

        // 0. Get round pause state — affects all timer computations
        const rcRes = await pool.query(
            "SELECT is_paused, paused_at FROM round_control WHERE round_name = $1",
            [ROUND_NAME]
        );
        const isPaused = rcRes.rows[0]?.is_paused ?? false;
        const pausedAt = rcRes.rows[0]?.paused_at ? new Date(rcRes.rows[0].paused_at) : null;
        // Effective current time — capped at pausedAt so timers don't decay during pause
        const effectiveNow = (isPaused && pausedAt) ? pausedAt : now;

        // 1. Get session end_time
        const sessionRes = await pool.query(
            "SELECT end_time FROM user_sessions WHERE user_id = $1 AND end_time > $2",
            [userId, effectiveNow]
        );

        if (sessionRes.rows.length === 0) {
            return res.json({ totalTimeLeft: 0, questionTimeLeft: 0, contestEnded: true, isPaused });
        }

        const endTime = new Date(sessionRes.rows[0].end_time);
        const totalTimeLeft = Math.max(0, Math.floor((endTime - effectiveNow) / 1000));

        // 2. Find current question
        const qRes = await pool.query(
            `SELECT uq.question_id, uq.start_time, uq.status, uq.sequence_order
             FROM user_questions uq
             WHERE uq.user_id = $1
             ORDER BY uq.sequence_order ASC`,
            [userId]
        );

        let currentIndex = -1;
        for (let i = 0; i < qRes.rows.length; i++) {
            const q = qRes.rows[i];
            if (q.status === 'ACCEPTED' || q.status === 'TIMEOUT') continue;

            if (q.start_time) {
                const remaining = getQuestionTimeLeft(q.start_time, pausedAt);
                // Only mark TIMEOUT when NOT paused — during pause the timer is frozen
                if (remaining <= 0 && !isPaused) {
                    await pool.query(
                        "UPDATE user_questions SET status = 'TIMEOUT' WHERE user_id = $1 AND question_id = $2",
                        [userId, q.question_id]
                    );
                    continue;
                } else if (remaining <= 0 && isPaused) {
                    // Timer would expire but we're paused — keep question open
                    currentIndex = i;
                    break;
                }
            }

            currentIndex = i;
            break;
        }

        if (currentIndex === -1) {
            currentIndex = qRes.rows.length - 1;
        }

        // Auto-start timer for the current question if not started (only when not paused)
        const currentQ = qRes.rows[currentIndex];
        let questionTimeLeft = 0;
        if (currentQ && currentQ.status !== 'ACCEPTED' && currentQ.status !== 'TIMEOUT') {
            if (!currentQ.start_time && !isPaused) {
                await pool.query(
                    "UPDATE user_questions SET start_time = $3 WHERE user_id = $1 AND question_id = $2",
                    [userId, currentQ.question_id, now]
                );
                questionTimeLeft = QUESTION_DURATION;
            } else {
                questionTimeLeft = getQuestionTimeLeft(currentQ.start_time, pausedAt);
            }
        }

        res.json({ totalTimeLeft, questionTimeLeft, currentIndex, isPaused });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Submit Result — called by frontend after load balancer confirms ACCEPTED
// All scoring computed server-side from stored start_time
// NOTE: This endpoint is now internal-only — called by the dispatcher after Judge0 confirms ACCEPTED.
// User JWTs are rejected with 403. Use authenticateInternal instead of authenticateToken.
router.post("/submit-result", authenticateInternal, async (req, res) => {
    const userId = req.user.userId; // injected from x-user-id header by dispatcher
    const { questionId } = req.body;
    try {
        // 0. Reject scoring while round is paused — start_time hasn't been shifted yet,
        //    so elapsed-time calculation would be wrong. Dispatcher should retry on resume.
        const pauseCheck = await pool.query(
            "SELECT is_paused FROM round_control WHERE round_name = $1",
            [ROUND_NAME]
        );
        if (pauseCheck.rows[0]?.is_paused) {
            return res.status(503).json({ error: "Round is paused — scoring deferred.", retry: true });
        }

        // 1. Fetch question data (also select status for expiry guard)
        const qRes = await pool.query(
            "SELECT start_time, score_awarded, status FROM user_questions WHERE user_id = $1 AND question_id = $2",
            [userId, questionId]
        );

        if (qRes.rows.length === 0) {
            return res.status(404).json({ error: "Question not found for this user" });
        }

        const question = qRes.rows[0];

        // 2. Idempotency: already scored? Return existing score
        if (question.score_awarded > 0) {
            const userRes = await pool.query(
                "SELECT rapidfire_score FROM users WHERE id = $1",
                [userId]
            );
            return res.json({
                success: true,
                message: "Already scored",
                scoreAwarded: question.score_awarded,
                totalRoundScore: userRes.rows[0]?.rapidfire_score || 0
            });
        }

        // --- Bug 2 Fix: Reject if question timer has already expired ---
        // Guard A: Status is already TIMEOUT (set by /join or /time-check when user was away)
        if (question.status === 'TIMEOUT') {
            console.warn(`⚠️ submit-result: question ${questionId} is already TIMEOUT for user ${userId}. Rejecting.`);
            return res.status(403).json({ error: "Question timer expired", scoreAwarded: 0 });
        }

        // Guard B: Elapsed time exceeds the question duration + a grace buffer for queue/judge latency.
        // This catches submissions that entered the queue just before expiry but were judged after.
        const SCORING_GRACE_SECONDS = 10; // 10s extra to absorb BullMQ queue wait + Judge0 exec time
        if (question.start_time) {
            const nowForElapsed = new Date();
            const elapsed = (nowForElapsed - new Date(question.start_time)) / 1000;
            if (elapsed > QUESTION_DURATION + SCORING_GRACE_SECONDS) {
                // Also persist the TIMEOUT status so future checks are fast
                await pool.query(
                    "UPDATE user_questions SET status = 'TIMEOUT' WHERE user_id = $1 AND question_id = $2 AND status NOT IN ('ACCEPTED','TIMEOUT')",
                    [userId, questionId]
                );
                console.warn(`⚠️ submit-result: question ${questionId} expired (elapsed ${elapsed.toFixed(1)}s) for user ${userId}. Rejecting.`);
                return res.status(403).json({ error: "Question timer expired", scoreAwarded: 0 });
            }
        }

        // --- Bug 3 Fix: Reject if the 50-min session has ended ---
        const sessionCheckRes = await pool.query(
            "SELECT end_time, completed FROM user_sessions WHERE user_id = $1 ORDER BY join_time DESC LIMIT 1",
            [userId]
        );
        if (
            sessionCheckRes.rows.length === 0 ||
            sessionCheckRes.rows[0].completed ||
            new Date(sessionCheckRes.rows[0].end_time) < new Date()
        ) {
            console.warn(`⚠️ submit-result: session expired or completed for user ${userId}. Rejecting.`);
            return res.status(403).json({ error: "Contest session has expired", scoreAwarded: 0 });
        }
        // --- End of Bug 2 & 3 Guards ---

        // 3. Compute remaining time from server-side timestamps
        let remainingTime = 0;
        if (question.start_time) {
            const now = new Date();
            const elapsed = (now - new Date(question.start_time)) / 1000;
            remainingTime = Math.max(0, QUESTION_DURATION - elapsed);
        } else {
            // start_time is NULL — should not happen, but award base points only
            console.warn(`⚠️ submit-result: start_time is NULL for user ${userId}, question ${questionId}`);
        }

        // 4. Calculate score: base + time bonus
        const score = Math.round(BASE_POINTS + 5 * (remainingTime / QUESTION_DURATION));

        // 5. Atomic update — only if score_awarded is still 0 (prevents double-scoring)
        // Also mark status = 'ACCEPTED' so the /join re-entry gate can skip completed questions.
        const updateRes = await pool.query(
            "UPDATE user_questions SET score_awarded = $1, status = 'ACCEPTED' WHERE user_id = $2 AND question_id = $3 AND score_awarded = 0 RETURNING score_awarded",
            [score, userId, questionId]
        );

        if (updateRes.rows.length === 0) {
            // Race condition: another request already scored this question
            const userRes = await pool.query(
                "SELECT rapidfire_score FROM users WHERE id = $1",
                [userId]
            );
            return res.json({
                success: true,
                message: "Already scored (race)",
                scoreAwarded: score,
                totalRoundScore: userRes.rows[0]?.rapidfire_score || 0
            });
        }

        // 6. Increment user's total rapidfire score (atomic)
        const userUpdateRes = await pool.query(
            "UPDATE users SET rapidfire_score = rapidfire_score + $1 WHERE id = $2 RETURNING rapidfire_score",
            [score, userId]
        );

        const totalRoundScore = userUpdateRes.rows[0]?.rapidfire_score || 0;

        console.log(`🏆 Rapidfire Score: User ${userId}, Q ${questionId} → +${score} pts (remaining: ${remainingTime.toFixed(1)}s) | Total: ${totalRoundScore}`);

        res.json({
            success: true,
            scoreAwarded: score,
            totalRoundScore
        });

    } catch (err) {
        console.error("❌ RAPIDFIRE SUBMIT-RESULT ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
