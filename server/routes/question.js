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
