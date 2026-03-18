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
                `SELECT q.id, q.title, q.description, duq.status, duq.base_points, duq.sequence_order,
                        duq.accepted_at, duq.passed_count, duq.score_awarded
                 FROM questions q
                 JOIN dsa_user_questions duq ON q.id = duq.question_id
                 WHERE duq.user_id = $1
                 ORDER BY duq.sequence_order ASC`,
                [user.id]
            );

            // Redact description and replace title for fully accepted questions
            // Partial questions remain open for re-submission
            outputQuestions = qRes.rows.map(q => {
                if (q.status === 'ACCEPTED') {
                    return {
                        ...q,
                        title: "Question Solved ✅",
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

// DSA Partial Scoring Table
// Key: sequence_order (0-4), Value: points per consecutive passed TCs
//
// Q1 (50 pts, 3 TCs) : all-or-nothing
// Q2 (100 pts, 2 TCs): TC1=brute force → 30 pts; TC2=optimal → 100 pts total
// Q3 (100 pts, 2 TCs): same tier as Q2
// Q4 (150 pts, 3 TCs): partial 50/100/150
// Q5 (150 pts, 3 TCs): partial 50/100/150
const DSA_SCORING = [
    { 0: 0, 1: 0, 2: 0, 3: 50 },           // Q1 — 3 TCs, all-or-nothing
    { 0: 0, 1: 30, 2: 100 },               // Q2 — 2 TCs: brute→30, optimal→100
    { 0: 0, 1: 30, 2: 100 },               // Q3 — 2 TCs: brute→30, optimal→100
    { 0: 0, 1: 50, 2: 100, 3: 150 },       // Q4 — 3 TCs
    { 0: 0, 1: 50, 2: 100, 3: 150 },       // Q5 — 3 TCs
];

// Submit Result (Called after socket execution)
router.post("/submit-result", async (req, res) => {
    const { userId, questionId, passedCount } = req.body;
    // Cap passedCount against the ACTUAL number of test cases for this question
    // (Q2/Q3 have 2 TCs; hard-coding 3 would cause a missing key in DSA_SCORING)
    const tcCountRes = await pool.query(
        "SELECT COUNT(*) FROM test_cases WHERE problem_id = $1::text",
        [questionId]
    );
    const maxTCs = parseInt(tcCountRes.rows[0]?.count) || 3;
    const safePassedCount = Math.max(0, Math.min(maxTCs, parseInt(passedCount) || 0));

    try {
        // 1. Fetch session
        const sessionRes = await pool.query("SELECT * FROM dsa_sessions WHERE user_id = $1", [userId]);
        if (sessionRes.rows.length === 0) return res.status(404).json({ error: "Session not found" });

        // Check session hasn't expired
        const session = sessionRes.rows[0];
        if (new Date(session.end_time) < new Date()) {
            return res.status(403).json({ error: "Contest has ended" });
        }

        // 2. Fetch this user's question record
        const qRes = await pool.query(
            `SELECT duq.*, q.sequence_order AS seq_order
             FROM dsa_user_questions duq
             JOIN questions q ON q.id = duq.question_id
             WHERE duq.user_id = $1 AND duq.question_id = $2`,
            [userId, questionId]
        );
        if (qRes.rows.length === 0) return res.status(404).json({ error: "Question not assigned" });
        const question = qRes.rows[0];

        // 3. Compute new score from scoring table
        const seqOrder = question.seq_order; // 0-4
        const scoringTier = DSA_SCORING[seqOrder] || DSA_SCORING[1]; // fallback to Q2 tier
        const newScore = scoringTier[safePassedCount] ?? 0;
        const existingScore = question.score_awarded || 0;

        // 4. Best-attempt: only update if new score is strictly better
        if (newScore <= existingScore) {
            // No improvement — return current total score
            const totalRes = await pool.query("SELECT total_score FROM dsa_sessions WHERE user_id = $1", [userId]);
            return res.json({
                success: true,
                message: "No improvement",
                scoreAwarded: existingScore,
                passedCount: question.passed_count,
                totalScore: totalRes.rows[0]?.total_score || 0,
            });
        }

        const now = new Date();
        const allPass = safePassedCount === 3;
        const newStatus = allPass ? 'ACCEPTED' : (newScore > 0 ? 'PARTIAL' : null);

        // 5. Atomic update of question record
        // NOTE: $3 (newStatus) can be null, which causes PostgreSQL to fail type
        // inference when $3 is reused in a CASE WHEN comparison. Use a separate
        // $4 parameter (same value) for the CASE, so both usages are unambiguous.
        await pool.query(
            `UPDATE dsa_user_questions
             SET passed_count = $1, score_awarded = $2, status = $3,
                 accepted_at = CASE WHEN $4 = 'ACCEPTED' THEN $5 ELSE accepted_at END
             WHERE user_id = $6 AND question_id = $7`,
            [safePassedCount, newScore, newStatus, newStatus, now, userId, questionId]
        );

        // 6. Recalculate total_score as SUM of all score_awarded (atomic, no drift)
        const totalRes = await pool.query(
            `UPDATE dsa_sessions SET total_score = (
                SELECT COALESCE(SUM(score_awarded), 0)
                FROM dsa_user_questions WHERE user_id = $1
             )
             WHERE user_id = $1
             RETURNING total_score`,
            [userId]
        );
        const newTotalScore = totalRes.rows[0]?.total_score || 0;

        // 7. Sync users.dsa_score for leaderboard (fix for existing bug)
        await pool.query(
            "UPDATE users SET dsa_score = $1 WHERE id = $2",
            [newTotalScore, userId]
        );

        console.log(`🏆 DSA Score: User ${userId}, Q ${questionId} (seq ${seqOrder}) → ${safePassedCount}/3 TCs → +${newScore - existingScore} pts | Total: ${newTotalScore}`);

        res.json({
            success: true,
            passedCount: safePassedCount,
            scoreAwarded: newScore,
            totalScore: newTotalScore,
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
