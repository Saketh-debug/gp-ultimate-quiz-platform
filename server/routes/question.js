// routes/question.js
const express = require("express");
const router = express.Router();
const pool = require("../db");

// Open a question (start timer if first time)
router.post("/open", async (req, res) => {
  const { userId, questionId } = req.body;

  try {
    // 1. Check if exam is over for this user
    const s = await pool.query(
      "SELECT end_time FROM user_sessions WHERE user_id = $1",
      [userId]
    );

    if (s.rows.length === 0) {
      return res.status(400).json({ error: "No active session" });
    }

    if (new Date() > s.rows[0].end_time) {
      return res.status(403).json({ error: "Exam over" });
    }

    // 2. Check if attempt already exists
    const a = await pool.query(
      "SELECT started_at FROM attempts WHERE user_id = $1 AND question_id = $2",
      [userId, questionId]
    );

    if (a.rows.length > 0) {
      // Already opened before → return same start time
      return res.json({ startedAt: a.rows[0].started_at });
    }

    // 3. First time opening → create attempt
    const r = await pool.query(
      "INSERT INTO attempts (user_id, question_id, started_at) VALUES ($1, $2, NOW()) RETURNING started_at",
      [userId, questionId]
    );

    res.json({ startedAt: r.rows[0].started_at });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

// <------------------------------------------------------------------------------->
// Submit a question
router.post("/submit", async (req, res) => {
  try {
    const { userId, questionId, isCorrect } = req.body;

    // 1) Check if exam is over for this user
    const s = await pool.query(
      "SELECT end_time FROM user_sessions WHERE user_id = $1",
      [userId]
    );

    if (s.rows.length === 0)
      return res.status(400).json({ error: "No active session" });

    if (new Date() > s.rows[0].end_time)
      return res.status(403).json({ error: "Exam over for this user" });

    // 2) Fetch attempt (must exist from /open)
    const a = await pool.query(
      "SELECT started_at FROM attempts WHERE user_id = $1 AND question_id = $2",
      [userId, questionId]
    );

    if (a.rows.length === 0) {
      return res.status(400).json({ error: "Question not opened yet" });
    }

    const startedAt = new Date(a.rows[0].started_at);
    const now = new Date();
    const timeTaken = Math.floor((now - startedAt) / 1000);

    // 3) Get avg_time of question
    const q = await pool.query(
      "SELECT avg_time FROM questions WHERE id = $1",
      [questionId]
    );

    const avg = q.rows[0].avg_time;

    // 4) Scoring
    let score = 0;
    if (isCorrect) {
      if (timeTaken < avg / 2) score = 40; // ikkada it's: 20 + 2*10
      else if (timeTaken < avg) score = 30; // ikkada it's: 20 + 10
      else score = 20; //ikkada he/she gets only the base score. 
    }

    // 5) Update attempt
    await pool.query(
      `UPDATE attempts
       SET submitted_at = NOW(),
           time_taken = $1,
           is_correct = $2,
           score = $3
       WHERE user_id = $4 AND question_id = $5`,
      [timeTaken, isCorrect, score, userId, questionId]
    );

    res.json({
      timeTaken,
      isCorrect,
      score,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
