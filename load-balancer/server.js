// server.js
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const { Queue } = require('bullmq');
const { Pool } = require('pg');
const cors = require('cors');
const { REDIS_CONFIG, PG_CONFIG } = require('./config');

const app = express();
app.use(express.json());
app.use(cors());

// Create HTTP Server & Socket.io Server
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

const db = new Pool(PG_CONFIG);
const submissionQueue = new Queue('judge-cluster', { connection: REDIS_CONFIG });

// --- SOCKET.IO LOGIC ---
io.on('connection', (socket) => {
    // 1. User Joins (Browser)
    socket.on('join_user', (userId) => {
        socket.join(userId);
        console.log(`[Socket] User ${userId} joined room.`);
    });

    // 2. Dispatcher Updates (Internal)
    socket.on('internal_job_finished', (data) => {
        console.log(`[Socket] Forwarding result for Job ${data.submissionId} to User ${data.userId}`);

        // Forward the data ONLY to the specific user
        io.to(data.userId).emit('submission_result', data);
    });
});
// -----------------------

app.post('/submit', async (req, res) => {
    const { user_id, source_code, language_id, problem_id, stdin, mode } = req.body;
    try {
        const result = await db.query(
            "INSERT INTO submissions (user_id, source_code, language_id, status) VALUES ($1, $2, $3, 'PENDING') RETURNING id",
            [user_id, source_code, language_id]
        );
        const submissionId = result.rows[0].id;

        // FIXED: Added problem_id AND mode to the job payload
        await submissionQueue.add('execute-job', {
            submissionId,
            source_code,
            language_id,
            user_id,
            stdin: stdin || "",
            problem_id,
            mode // <--- Pass 'run' or 'submit' explicitly
        });

        res.json({ status: 'queued', submission_id: submissionId });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

server.listen(3100, '0.0.0.0', () => console.log('🚀 API + Socket Hub running on port 3100'));

