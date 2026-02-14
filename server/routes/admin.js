const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const pool = require("../db");
const authenticate = require("../middleware/verify");

// ---------------- ADMIN LOGIN ----------------
router.post("/login", async (req, res) => {
  try {
    const { token } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE token = $1 AND role = 'admin'",
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid admin token" });
    }

    const admin = result.rows[0];

    const jwtToken = jwt.sign(
      {
        id: admin.id,
        role: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "6h" }
    );

    res.json({ token: jwtToken });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------- START CONTEST ----------------
router.post("/start-contest", authenticate, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }

  if (req.app.locals.contestStartTime) {
    return res.status(400).json({ error: "Contest already started" });
  }

const startTime = new Date();

req.app.locals.contestStartTime = startTime;

// broadcast to all clients
req.app.get("io").emit("contest_started", {
  startTime,
  duration: req.app.locals.CONTEST_DURATION_MIN,
});


  res.json({
    message: "Contest started",
    startTime: req.app.locals.contestStartTime,
  });
});

module.exports = router;
