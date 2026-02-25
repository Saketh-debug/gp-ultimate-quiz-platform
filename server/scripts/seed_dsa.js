require("dotenv").config({ override: true });
const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

async function seedDSAQuestions() {
    try {
        console.log("Seeding 5 DSA questions...");

        // First find out IDs of existing dsa questions to delete their test cases
        const existingRes = await pool.query("SELECT id FROM questions WHERE round = 'dsa'");
        for (const row of existingRes.rows) {
            await pool.query("DELETE FROM test_cases WHERE problem_id = $1", [row.id.toString()]);
        }
        await pool.query("DELETE FROM questions WHERE round = 'dsa'");


        const questions = [
            {
                title: "Alien Language Validation",
                description: `You are given a dictionary of words representing an alien language. Ensure the sequence of words is sorted lexicographically according to a specific given alien alphabet string.
**Input**: \`words = ["hello","leetcode"]\`, \`order = "hlabcdefgijkmnopqrstuvwxyz"\`
**Output**: \`true\``,
                test_cases: [
                    { input: "2\nhello\nleetcode\nhlabcdefgijkmnopqrstuvwxyz", expected: "true\n", is_hidden: false }
                ],
                base_points: 100,
                sequence_order: 0,
            },
            {
                title: "Martian Supply Routes",
                description: `Given an adjacency list representing paths between martian outposts, find the shortest path from outpost \`A\` to outpost \`B\`.
**Input**: \`graph = [[1,2],[0,3],[0,3],[1,2]], A = 0, B = 3\`
**Output**: \`2\``,
                test_cases: [
                    { input: "4\n1 2\n0 3\n0 3\n1 2\n0\n3", expected: "2\n", is_hidden: false }
                ],
                base_points: 200,
                sequence_order: 1,
            },
            {
                title: "Rover Signal Synchronization",
                description: `Given two strings \`s\` and \`t\`, return the length of their longest common subsequence. This determines the signal sync strength.
**Input**: \`s = "abcde", t = "ace"\`
**Output**: \`3\``,
                test_cases: [
                    { input: "abcde\nace", expected: "3\n", is_hidden: false }
                ],
                base_points: 300,
                sequence_order: 2,
            },
            {
                title: "Asteroid Mining Optimization",
                description: `You are given an array of asteroid masses. You have a laser of power \`k\`. Return the maximum number of asteroids you can destroy if destroying an asteroid of mass \`m\` takes \`m\` power and reduces your laser power to \`k - m\`.
**Input**: \`asteroids = [1, 2, 3, 4, 5], k = 7\`
**Output**: \`3\``,
                test_cases: [
                    { input: "5\n1 2 3 4 5\n7", expected: "3\n", is_hidden: false }
                ],
                base_points: 400,
                sequence_order: 3,
            },
            {
                title: "Comm-Link Encryption Sequence",
                description: `Find the longest palindromic substring in the given comm-link transmission string \`s\`.
**Input**: \`s = "babad"\`
**Output**: \`bab\``,
                test_cases: [
                    { input: "babad", expected: "bab\n", is_hidden: false }
                ],
                base_points: 500,
                sequence_order: 4,
            }
        ];

        for (const q of questions) {
            // Insert question
            const qRes = await pool.query(
                `INSERT INTO questions (title, description, base_points, round, sequence_order)
                 VALUES ($1, $2, $3, 'dsa', $4) RETURNING id`,
                [q.title, q.description, q.base_points, q.sequence_order]
            );

            const questionId = qRes.rows[0].id;

            // Insert test cases
            for (const tc of q.test_cases) {
                await pool.query(
                    `INSERT INTO test_cases (problem_id, input, expected_output, is_hidden)
                     VALUES ($1, $2, $3, $4)`,
                    [questionId.toString(), tc.input, tc.expected, tc.is_hidden]
                );
            }

            console.log(`✅ Seeded: ${q.title} (ID: ${questionId}) with ${q.test_cases.length} test cases.`);
        }

        console.log("🎉 DSA Questions and test cases seeded successfully!");

    } catch (err) {
        console.error("❌ Seeding failed:", err.message);
    } finally {
        pool.end();
    }
}

seedDSAQuestions();
