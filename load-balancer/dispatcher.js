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

// Language ID → Readable Name for error messages
const LANGUAGE_NAMES = {
    71: 'Python 3',
    50: 'C (GCC)',
    54: 'C++ (G++)',
    62: 'Java (OpenJDK)',
    60: 'Go',
};

/**
 * Constructs a detailed, language-specific error message from a Judge0 response.
 * Each compiler/runtime has its own error format — this preserves the native output.
 *
 * Judge0 status IDs:
 *   3  = Accepted
 *   4  = Wrong Answer
 *   5  = Time Limit Exceeded
 *   6  = Compilation Error
 *   7  = Runtime Error (SIGSEGV)
 *   8  = Runtime Error (SIGXFSZ)
 *   9  = Runtime Error (SIGFPE)
 *   10 = Runtime Error (SIGABRT)
 *   11 = Runtime Error (NZEC)
 *   12 = Runtime Error (Other)
 *   13 = Internal Error
 *   14 = Exec Format Error
 */
function formatErrorOutput(result, languageId) {
    const statusId = result.status?.id;
    const statusDesc = result.status?.description || 'Unknown Error';
    const langName = LANGUAGE_NAMES[parseInt(languageId)] || `Language ${languageId}`;

    // --- COMPILATION ERROR (status 6) ---
    if (statusId === 6) {
        const compileOut = result.compile_output || '';
        const lines = [];

        lines.push(`❌ Compilation Error [${langName}]`);
        lines.push('');

        if (compileOut) {
            // The compile_output from Judge0 already contains the native compiler output
            // GCC/G++:   main.cpp:7:12: error: 'n' was not declared in this scope
            // javac:     Main.java:5: error: ';' expected
            // Go:        ./main.go:10:2: undefined: fmt.Printl
            lines.push(compileOut.trim());
        } else {
            lines.push('No compiler output available.');
        }

        lines.push('');
        lines.push('=== Code Exited With Compilation Errors ===');

        return lines.join('\n');
    }

    // --- TIME LIMIT EXCEEDED (status 5) ---
    if (statusId === 5) {
        const lines = [];
        lines.push(`⏱️ Time Limit Exceeded [${langName}]`);
        lines.push('');
        lines.push(`Your code did not finish within the allowed time limit.`);
        if (result.time) {
            lines.push(`Execution time: ${result.time}s`);
        }
        lines.push('');
        lines.push('Common causes:');
        lines.push('  • Infinite loop');
        lines.push('  • Inefficient algorithm (high time complexity)');
        lines.push('  • Waiting for input that was not provided');
        lines.push('');
        lines.push('=== Time Limit Exceeded ===');
        return lines.join('\n');
    }

    // --- RUNTIME ERROR (status 7-12) ---
    if (statusId >= 7 && statusId <= 12) {
        const stderr = result.stderr || '';
        const lines = [];

        // Runtime error sub-types
        const runtimeTypeMap = {
            7: 'Segmentation Fault (SIGSEGV)',
            8: 'Output Limit Exceeded (SIGXFSZ)',
            9: 'Floating Point Exception (SIGFPE)',
            10: 'Aborted (SIGABRT)',
            11: 'Non-Zero Exit Code (NZEC)',
            12: 'Runtime Error',
        };

        const runtimeType = runtimeTypeMap[statusId] || 'Runtime Error';

        lines.push(`💥 Runtime Error: ${runtimeType} [${langName}]`);
        lines.push('');

        if (stderr) {
            // Python:  Traceback (most recent call last): ... ValueError: invalid literal ...
            // C/C++:   (usually empty or OS-level message)
            // Java:    Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException ...
            // Go:      panic: runtime error: index out of range ...
            lines.push(stderr.trim());
        } else {
            // For C/C++ segfaults, stderr is often empty
            if (statusId === 7) {
                lines.push('Your program tried to access memory that was not allocated.');
                lines.push('Common causes:');
                lines.push('  • Array index out of bounds');
                lines.push('  • Dereferencing a null/dangling pointer');
                lines.push('  • Stack overflow from infinite recursion');
            } else if (statusId === 9) {
                lines.push('A floating point exception occurred.');
                lines.push('Common cause: Division by zero');
            } else if (statusId === 11) {
                lines.push('Your program exited with a non-zero exit code.');
                if (parseInt(languageId) === 71) {
                    lines.push('In Python, this usually means an unhandled exception occurred.');
                } else if (parseInt(languageId) === 62) {
                    lines.push('In Java, this usually means an uncaught exception was thrown.');
                }
            } else {
                lines.push(`Your program crashed with signal: ${statusDesc}`);
            }
        }

        lines.push('');
        lines.push(`=== Code Exited With ${runtimeType} ===`);

        return lines.join('\n');
    }

    // --- INTERNAL ERROR (status 13) ---
    if (statusId === 13) {
        return `⚠️ Internal Judge Error [${langName}]\n\nThe judge encountered an internal error while processing your submission.\nThis is NOT your fault. Please try again or contact an admin.\n\n=== Internal Error ===`;
    }

    // --- EXEC FORMAT ERROR (status 14) ---
    if (statusId === 14) {
        return `⚠️ Exec Format Error [${langName}]\n\nThe compiled binary could not be executed.\nThis may be a Judge configuration issue.\n\n=== Exec Format Error ===`;
    }

    // --- WRONG ANSWER (status 4) — shouldn't hit this path normally, but safety net ---
    if (statusId === 4) {
        return result.stderr || result.stdout || statusDesc;
    }

    // --- FALLBACK ---
    return result.stderr || result.compile_output || result.stdout || statusDesc;
}

/**
 * Base64 encode a string for Judge0 input.
 * Judge0 requires base64-encoded source_code, stdin, expected_output
 * to avoid encoding issues with special characters.
 */
function b64encode(text) {
    return Buffer.from(text || '').toString('base64');
}

/**
 * Safely decode a base64-encoded string from Judge0 output.
 * Returns empty string if null/undefined, or the original string if decoding fails.
 */
function b64decode(encoded) {
    if (!encoded) return '';
    try {
        return Buffer.from(encoded, 'base64').toString('utf-8');
    } catch {
        return encoded; // Not valid base64, return as-is
    }
}

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
                source_code: b64encode(source_code),
                language_id: parseInt(language_id),
                stdin: b64encode(stdin || ""),
                base64_encoded: true
            };

            const response = await axios.post(
                `${targetJudge}/submissions?wait=true&base64_encoded=true`,
                payload,
                { timeout: 30000 }
            );
            const result = response.data;

            // Decode base64 output fields from Judge0
            result.stdout = b64decode(result.stdout);
            result.stderr = b64decode(result.stderr);
            result.compile_output = b64decode(result.compile_output);

            // Judge0 ID 3 = Accepted. Guard against missing status (e.g. compilation errors)
            const statusId = result.status?.id;
            finalStatus = statusId === 3 ? 'ACCEPTED' : 'ERROR';
            finalOutput = result.stdout || "";
            if (statusId !== 3) {
                finalStderr = formatErrorOutput(result, language_id);
            }
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
                    source_code: b64encode(source_code),
                    language_id: parseInt(language_id),
                    stdin: b64encode(testCase.input || ""),
                    expected_output: b64encode(testCase.expected_output || ""),
                    base64_encoded: true
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
                    `${targetJudge}/submissions?wait=true&base64_encoded=true`,
                    payload,
                    { timeout: 30000 }
                );

                const result = response.data;

                // Decode base64 output fields from Judge0
                result.stdout = b64decode(result.stdout);
                result.stderr = b64decode(result.stderr);
                result.compile_output = b64decode(result.compile_output);

                const actualOutput = (result.stdout || "").trim();
                const expectedOutput = (testCase.expected_output || "").trim();

                // Validation Logic — guard against missing status (e.g. compilation errors)
                const statusId = result.status?.id;
                if (statusId !== 3) {
                    // TLE (5), WA (4), Runtime Error (6), Compilation Error (6), etc.
                    // DSA gets PARTIAL (for partial scoring); everything else gets WRONG_ANSWER (not ERROR)
                    // so frontends can handle it in their standard wrong-answer branch
                    finalStatus = isDSA ? "PARTIAL" : "WRONG_ANSWER";
                    finalOutput = (result.stdout || "").substring(0, 10000);
                    // Use formatErrorOutput for detailed, language-specific error messages
                    const formattedError = formatErrorOutput(result, language_id);
                    finalStderr = `Test Case ${i + 1}/${testCases.length}: FAILED\n\n${formattedError}`;
                    break;
                }

                if (actualOutput !== expectedOutput) {
                    finalStatus = isDSA ? "PARTIAL" : "WRONG_ANSWER";
                    finalOutput = actualOutput.substring(0, 10000);
                    const maxPreview = 500;
                    const expPreview = expectedOutput.length > maxPreview ? expectedOutput.substring(0, maxPreview) + '...(truncated)' : expectedOutput;
                    const actPreview = actualOutput.length > maxPreview ? actualOutput.substring(0, maxPreview) + '...(truncated)' : actualOutput;
                    finalStderr = `Wrong Answer on Test Case ${i + 1}\nExpected: ${expPreview}\nActual: ${actPreview}`;
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
        // Truncate stdout/stderr for socket relay — Socket.io v4 default maxHttpBufferSize is 1MB.
        // Judge0 can return up to 1MB of stdout alone (e.g. infinite loops), exceeding the limit
        // and causing the message to be silently dropped. The full output is already saved to the DB above.
        const MAX_SOCKET_OUTPUT = 10000; // 10KB — plenty for the frontend output panel
        const truncatedOutput = finalOutput.length > MAX_SOCKET_OUTPUT
            ? finalOutput.substring(0, MAX_SOCKET_OUTPUT) + '\n\n--- Output truncated (too large) ---'
            : finalOutput;
        const truncatedStderr = finalStderr.length > MAX_SOCKET_OUTPUT
            ? finalStderr.substring(0, MAX_SOCKET_OUTPUT) + '\n\n--- Error output truncated ---'
            : finalStderr;

        socket.emit('internal_job_finished', {
            userId: user_id,
            submissionId: submissionId,
            status: finalStatus,
            stdout: truncatedOutput,
            stderr: truncatedStderr,
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

