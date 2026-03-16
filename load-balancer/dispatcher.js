const { Worker } = require('bullmq');
const axios = require('axios');
const { Pool } = require('pg');
const { JUDGE_NODES, REDIS_CONFIG, PG_CONFIG } = require('./config');

// Language multipliers for DSA time limits (Codeforces-standard)
// Base limit is defined per-question for C/C++; other languages are scaled.
const LANG_MULTIPLIERS = {
    71: 3.0, // Python 3
    50: 1.0, // C
    54: 1.0, // C++
    62: 2.0, // Java
    60: 1.5, // Go
};

// Connect to the API Server as a client to send updates
const io = require("socket.io-client");
const socket = io("http://localhost:3100");

// Initialize Database Connection
const db = new Pool(PG_CONFIG);

// Round Robin Index Tracker
let nodeIndex = 0;

console.log(`👷 Dispatcher started. managing ${JUDGE_NODES.length} worker nodes.`);
console.log(`   - Concurrency Limit: 20 jobs in parallel`);

// The Queue Worker
const worker = new Worker('judge-cluster', async (job) => {
    // Unpack job data
    const { submissionId, source_code, language_id, user_id, stdin, problem_id, mode } = job.data;

    // 1. LOAD BALANCING (Round Robin)
    const targetJudge = JUDGE_NODES[nodeIndex];
    nodeIndex = (nodeIndex + 1) % JUDGE_NODES.length;

    console.log(`[Job ${submissionId}] 🚀 Dispatching to -> ${targetJudge}`);

    try {
        // 2. MARK AS PROCESSING
        await db.query("UPDATE submissions SET status = 'PROCESSING' WHERE id = $1", [submissionId]);

        let finalStatus = 'ACCEPTED';
        let finalOutput = '';
        let finalStderr = '';
        let finalTime = 0;
        let passedCount = 0;     // number of TCs that passed (DSA partial scoring)
        let totalTestCases = 0;  // total TCs evaluated in submit mode

        // <--- LOGIC CHANGE START: Check Mode --->
        // Explicit mode check. Default to 'run' if mode is missing (safe fallback).
        const isRunMode = mode === 'run' || mode !== 'submit';

        if (isRunMode) {
            // ==========================
            // MODE A: RUN (Custom Input)
            // ==========================
            console.log(`[Job ${submissionId}] 🏃 Executing Run Mode (Custom Input)`);
            const payload = {
                source_code: source_code,
                language_id: parseInt(language_id),
                stdin: stdin || "",
                base64_encoded: false
            };

            const response = await axios.post(
                `${targetJudge}/submissions?wait=true`,
                payload,
                { timeout: 30000 }
            );
            const result = response.data;

            // Judge0 ID 3 = Accepted. Guard against missing status (e.g. compilation errors)
            const statusId = result.status?.id;
            finalStatus = statusId === 3 ? 'ACCEPTED' : 'ERROR';
            finalOutput = result.stdout || "";
            finalStderr = result.stderr || result.compile_output || "";
            finalTime = result.time;

        } else {
            // ==========================
            // MODE B: SUBMIT (Hidden Test Cases)
            // ==========================
            console.log(`[Job ${submissionId}] 🧪 Executing Submit Mode (Hidden Cases) for Problem ${problem_id}`);

            // Fetch Test Cases
            const testCasesRes = await db.query(
                "SELECT input, expected_output FROM test_cases WHERE problem_id = $1::text ORDER BY id ASC",
                [problem_id]
            );

            const testCases = testCasesRes.rows;

            if (testCases.length === 0) {
                throw new Error(`No test cases found for problem ${problem_id}`);
            }

            // Check if this is a DSA problem — if so, apply time_limit + language multiplier
            const questionMetaRes = await db.query(
                "SELECT round, time_limit FROM questions WHERE id = $1",
                [problem_id]
            );
            const questionMeta = questionMetaRes.rows[0];
            const isDSA = questionMeta?.round === 'dsa';
            const isCascade = questionMeta?.round === 'cascade';
            const baseTimeLimit = questionMeta?.time_limit ?? null; // ?? not || so 0.0 is not treated as falsy

            totalTestCases = testCases.length;

            for (let i = 0; i < testCases.length; i++) {
                const testCase = testCases[i];
                console.log(`   - Running Test Case ${i + 1}/${testCases.length}`);

                const payload = {
                    source_code: source_code,
                    language_id: parseInt(language_id),
                    stdin: testCase.input || "",
                    expected_output: testCase.expected_output || "",
                    base64_encoded: false
                };

                // Apply per-question time limit for DSA and Cascade submissions
                // Use != null so a 0.0 limit (edge case) is still enforced
                if (baseTimeLimit != null) {
                    const mult = LANG_MULTIPLIERS[parseInt(language_id)] || 1.0;
                    const cpuLimit = parseFloat((baseTimeLimit * mult).toFixed(2));
                    payload.cpu_time_limit = cpuLimit;
                    payload.wall_time_limit = parseFloat((cpuLimit * 3).toFixed(2));
                    console.log(`   [${questionMeta?.round?.toUpperCase()}] cpu_time_limit=${cpuLimit}s (base=${baseTimeLimit}s × ${mult})`);
                }

                const response = await axios.post(
                    `${targetJudge}/submissions?wait=true`,
                    payload,
                    { timeout: 30000 }
                );

                const result = response.data;
                const actualOutput = (result.stdout || "").trim();
                const expectedOutput = (testCase.expected_output || "").trim();

                // Validation Logic — guard against missing status (e.g. compilation errors)
                const statusId = result.status?.id;
                if (statusId !== 3) {
                    // TLE (5), WA (4), Runtime Error (6), Compilation Error (6), etc.
                    // DSA gets PARTIAL (for partial scoring); everything else gets WRONG_ANSWER (not ERROR)
                    // so frontends can handle it in their standard wrong-answer branch
                    finalStatus = isDSA ? "PARTIAL" : "WRONG_ANSWER";
                    finalOutput = result.stdout || "";
                    finalStderr = result.stderr || result.compile_output || `Failed on Test Case ${i + 1} (status: ${result.status?.description || statusId})`;
                    break;
                }

                if (actualOutput !== expectedOutput) {
                    finalStatus = isDSA ? "PARTIAL" : "WRONG_ANSWER";
                    finalOutput = actualOutput;
                    finalStderr = `Wrong Answer on Test Case ${i + 1}\nExpected: ${expectedOutput}\nActual: ${actualOutput}`;
                    break;
                }

                // This TC passed
                passedCount++;
                finalTime = Math.max(finalTime, parseFloat(result.time || 0));
            }

            // If all TCs passed, finalStatus stays ACCEPTED
            // For DSA: passedCount < testCases.length means PARTIAL (already set above)
        }
        // <--- LOGIC CHANGE END --->

        // 4. SAVE RESULT TO DB
        await db.query(`
            UPDATE submissions 
            SET status = $1, stdout = $2, stderr = $3, execution_time = $4
            WHERE id = $5
        `, [finalStatus, finalOutput, finalStderr, finalTime, submissionId]);

        console.log(`[Job ${submissionId}] ✅ Completed on ${targetJudge} | Status: ${finalStatus}`);

        // 5. NOTIFY THE MAIN SERVER
        socket.emit('internal_job_finished', {
            userId: user_id,
            submissionId: submissionId,
            status: finalStatus,
            stdout: finalOutput,
            stderr: finalStderr,
            time: finalTime,
            passedCount,
            totalTestCases,
        });

        // 6. UPDATE CONTEST PROGRESS (RAPID FIRE)
        if (finalStatus === 'ACCEPTED' && problem_id) {
            await db.query(`
                UPDATE user_questions 
                SET status = 'ACCEPTED'
                WHERE user_id = $1 AND question_id = $2
            `, [user_id, problem_id]);
            console.log(`[Job ${submissionId}] 🏆 Marked Question ${problem_id} as ACCEPTED for User ${user_id}`);
        }

    } catch (error) {
        const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
        console.error(`[Job ${submissionId}] ❌ Failed on ${targetJudge}:`, errorMsg);

        await db.query("UPDATE submissions SET status = 'FAILED', stderr = $1 WHERE id = $2", [errorMsg, submissionId]);

        socket.emit('internal_job_finished', {
            userId: user_id,
            submissionId: submissionId,
            status: 'FAILED',
            error: errorMsg
        });
    }

}, {
    connection: REDIS_CONFIG,
    concurrency: 20
});

