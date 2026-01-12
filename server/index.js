require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const pool = require("./db");
const authRoutes = require("./routes/auth");
const questionRoutes = require("./routes/question");
const app = express();

app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.IO
const io = new Server(server, {
  cors: { origin: "*" },
});

let contestStartTime = null;
const CONTEST_DURATION_MIN = 60;
const JOIN_WINDOW_MIN = 15;

// Health check
app.get("/", async (req, res) => {
  const r = await pool.query("SELECT NOW()");
  res.json({ status: "ok", dbTime: r.rows[0] });
});

// Admin: start contest
app.post("/start-contest", (req, res) => {
  if (contestStartTime) {
    return res.status(400).json({ error: "Contest already started" });
  }

  contestStartTime = new Date();

  // 🔴 Broadcast to all connected clients
  io.emit("contest_started", {
    startTime: contestStartTime,
    duration: CONTEST_DURATION_MIN,
  });

  res.json({
    message: "Contest started",
    startTime: contestStartTime,
    durationMinutes: CONTEST_DURATION_MIN,
    joinWindowMinutes: JOIN_WINDOW_MIN,
  });
});

// Make contest state available to routes
app.use((req, res, next) => {
  req.contest = {
    contestStartTime,
    CONTEST_DURATION_MIN,
    JOIN_WINDOW_MIN,
  };
  next();
});

app.use("/auth", authRoutes);
app.use("/question", questionRoutes);

// Socket logic
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("register", async ({ userId }) => {
    // Find active session
    const s = await pool.query(
      "SELECT socket_id FROM user_sessions WHERE user_id = $1 AND end_time > NOW()",
      [userId]
    );

    // If another device is already using this token, kick it
    if (s.rows.length > 0 && s.rows[0].socket_id) {
      io.to(s.rows[0].socket_id).emit("force_logout");
    }

    // Bind this socket to the active session
    await pool.query(
      "UPDATE user_sessions SET socket_id = $1 WHERE user_id = $2 AND end_time > NOW()",
      [socket.id, userId]
    );
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
