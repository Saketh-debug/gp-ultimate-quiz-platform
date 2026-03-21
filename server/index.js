
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const axios = require("axios");
const jwt = require('jsonwebtoken');
const pool = require("./db");
const { authenticateToken, authorizeAdmin } = require('./middleware/authMiddleware');
const authRoutes = require("./routes/auth");
const questionRoutes = require("./routes/question");
const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.IO
const io = new Server(server, {
  cors: { origin: "*" },
});
app.set("io", io); // Make io available in routes

// In-memory map: userId (string) → socketId
// Used by join routes to emit force_logout to evicted sessions
const userSockets = new Map();
app.set('userSockets', userSockets);

let contestStartTime = null;
const CONTEST_DURATION_MIN = 300;
const JOIN_WINDOW_MIN = 300;

// Health check
app.get("/", async (req, res) => {
  const r = await pool.query("SELECT NOW()");
  res.json({ status: "ok", dbTime: r.rows[0] });
});

// Admin: start contest — now requires admin JWT
app.post("/start-contest", authenticateToken, authorizeAdmin, (req, res) => {
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

// Legacy /auth route disabled \u2014 per-round join routes handle everything now
// app.use("/auth", authRoutes);
app.use("/question", questionRoutes);
const rapidFireRoutes = require("./routes/rapidfire");
const cascadeRoutes = require("./routes/cascade");
const dsaRoutes = require("./routes/dsa");

app.use("/cascade", cascadeRoutes);
app.use("/rapidfire", rapidFireRoutes);
app.use("/dsa", dsaRoutes);

const adminRoutes = require("./routes/admin");
app.use("/admin", adminRoutes);

// -----------------------------------------------------------
// /submit Proxy — authenticate JWT, then forward to load-balancer
// Clients MUST call this instead of hitting port 3100 directly
// -----------------------------------------------------------
const LB_URL = process.env.LB_URL || 'http://localhost:3100';
app.post("/submit", authenticateToken, async (req, res) => {
  const userId = req.user.userId; // Injected from JWT — cannot be spoofed by client
  const { source_code, language_id, problem_id, stdin, mode } = req.body;
  try {
    const result = await axios.post(`${LB_URL}/submit`, {
      user_id: userId,
      source_code, language_id, problem_id, stdin, mode
    });
    res.json(result.data);
  } catch (err) {
    // Forward actual LB error status + data instead of swallowing it
    const status = err.response?.status || 500;
    const data = err.response?.data || { error: 'Submission failed' };
    console.error('❌ Proxy /submit error:', err.message);
    res.status(status).json(data);
  }
});

// Socket logic
// Soft auth middleware: set socket.user if JWT is valid, but don't reject
// unauthenticated connections. This allows backendSocket (used for round_stopped
// broadcasts) to connect without a token.
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (token) {
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      // Token invalid — socket.user stays undefined
      // Don't reject the connection; broadcast-only sockets need no auth
    }
  }
  next(); // always allow connection
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id, '| user:', socket.user?.userId || 'anonymous');

  socket.on("join_user", async () => {
    // Bug 5 fix: use socket.user.userId from JWT, not client-supplied payload
    const userId = socket.user?.userId;
    if (!userId) return; // unauthenticated — ignore
    await pool.query(
      "UPDATE user_sessions SET socket_id = $1 WHERE user_id = $2 AND end_time > NOW()",
      [socket.id, userId]
    );
  });

  socket.on("register", async () => {
    // userId from authenticated socket — client cannot supply a fake userId
    const userId = socket.user?.userId;
    if (!userId) return;

    // Kick any currently connected socket for this user
    const existingSocketId = userSockets.get(String(userId));
    if (existingSocketId && existingSocketId !== socket.id) {
      io.to(existingSocketId).emit("force_logout");
    }

    // Register this socket as the authoritative one for this user
    userSockets.set(String(userId), socket.id);

    // Also update user_sessions socket_id (for rapidfire DB-based lookup)
    await pool.query(
      "UPDATE user_sessions SET socket_id = $1 WHERE user_id = $2 AND end_time > NOW()",
      [socket.id, userId]
    );
  });

  socket.on("disconnect", () => {
    const userId = socket.user?.userId;
    // Clean up map only if this socket is still the registered one
    if (userId && userSockets.get(String(userId)) === socket.id) {
      userSockets.delete(String(userId));
    }
    console.log("Client disconnected:", socket.id);
  });
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
