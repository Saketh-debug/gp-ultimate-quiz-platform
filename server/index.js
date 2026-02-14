require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const pool = require("./db");
const authRoutes = require("./routes/auth");
const questionRoutes = require("./routes/question");
const adminRoutes = require("./routes/admin");

const app = express();

app.use(cors());
app.use(express.json());

/* =====================================================
   GLOBAL CONTEST STATE (Single Source of Truth)
===================================================== */
app.locals.contestStartTime = null;
app.locals.CONTEST_DURATION_MIN = 300;
app.locals.JOIN_WINDOW_MIN = 300;

/* =====================================================
   CREATE HTTP + SOCKET SERVER
===================================================== */
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

// make socket accessible in routes
app.set("io", io);

/* =====================================================
   HEALTH CHECK
===================================================== */
app.get("/", async (req, res) => {
  const r = await pool.query("SELECT NOW()");
  res.json({
    status: "ok",
    dbTime: r.rows[0],
  });
});

/* =====================================================
   ROUTES
===================================================== */
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/question", questionRoutes);

/* =====================================================
   SOCKET LOGIC
===================================================== */
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("register", async ({ token }) => {
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return;
    }

    const userId = decoded.id;

    try {
      // check existing session
      const s = await pool.query(
        `SELECT socket_id
         FROM user_sessions
         WHERE user_id = $1 AND end_time > NOW()`,
        [userId]
      );

      // kick old device if exists
      if (s.rows.length > 0 && s.rows[0].socket_id) {
        io.to(s.rows[0].socket_id).emit("force_logout");
      }

      // bind new socket
      await pool.query(
        `UPDATE user_sessions
         SET socket_id = $1
         WHERE user_id = $2 AND end_time > NOW()`,
        [socket.id, userId]
      );

    } catch (err) {
      console.error("Socket registration error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

/* =====================================================
   START SERVER
===================================================== */
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
