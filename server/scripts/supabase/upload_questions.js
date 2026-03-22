/**
 * upload_questions.js
 *
 * Reads all questions + test_cases from the local PostgreSQL DB
 * and pushes them to Supabase (full replace — truncate then insert).
 *
 * Run from the server/ directory:
 *   node scripts/supabase/upload_questions.js
 */

require("dotenv").config({ path: require('path').resolve(__dirname, '../../.env'), override: true });
const { Pool } = require("pg");
const { createClient } = require("@supabase/supabase-js");

// ── Local DB connection ─────────────────────────────────────────────────────
const localPool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

// ── Supabase connection ──────────────────────────────────────────────────────
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function upload() {
    console.log("🔌 Connecting to local DB...");
    await localPool.query("SELECT 1");
    console.log("✅ Local DB connected.\n");

    // ── 1. Read all local questions ──────────────────────────────────────────
    console.log("📖 Reading questions from local DB...");
    const { rows: questions } = await localPool.query(
        "SELECT * FROM questions ORDER BY id ASC"
    );
    console.log(`   Found ${questions.length} questions.`);

    // ── 2. Read all local test_cases ─────────────────────────────────────────
    console.log("📖 Reading test_cases from local DB...");
    const { rows: testCases } = await localPool.query(
        "SELECT * FROM test_cases ORDER BY id ASC"
    );
    console.log(`   Found ${testCases.length} test cases.\n`);

    // ── 3. Wipe Supabase (test_cases first, then questions due to FK) ─────────
    console.log("🗑️  Clearing Supabase test_cases...");
    const { error: delTCErr } = await supabase
        .from("test_cases")
        .delete()
        .neq("id", 0); // delete all rows
    if (delTCErr) throw new Error("Delete test_cases failed: " + delTCErr.message);

    console.log("🗑️  Clearing Supabase questions...");
    const { error: delQErr } = await supabase
        .from("questions")
        .delete()
        .neq("id", 0);
    if (delQErr) throw new Error("Delete questions failed: " + delQErr.message);

    // ── 4. Reset sequences in Supabase so IDs start from 1 ───────────────────
    console.log("🔄 Resetting Supabase sequences...");
    const { error: seqQErr } = await supabase.rpc("reset_sequence", {
        table_name: "questions",
        seq_name: "questions_id_seq",
        start_val: 1,
    });
    // If RPC doesn't exist yet, we'll handle it gracefully
    if (seqQErr) {
        console.warn(
            "⚠️  Could not reset questions sequence via RPC (will rely on Supabase auto-assign):",
            seqQErr.message
        );
    }
    const { error: seqTCErr } = await supabase.rpc("reset_sequence", {
        table_name: "test_cases",
        seq_name: "test_cases_id_seq",
        start_val: 1,
    });
    if (seqTCErr) {
        console.warn(
            "⚠️  Could not reset test_cases sequence via RPC:",
            seqTCErr.message
        );
    }

    // ── 5. Insert questions (without id — let Supabase auto-assign) ───────────
    console.log("⬆️  Inserting questions into Supabase...");
    const localToSupabaseId = {}; // maps local question id → supabase question id

    for (const q of questions) {
        const localId = q.id;
        const { data: inserted, error: insQErr } = await supabase
            .from("questions")
            .insert({
                title: q.title,
                description: q.description,
                avg_time: q.avg_time,
                round: q.round,
                base_points: q.base_points,
                sequence_order: q.sequence_order,
                time_limit: q.time_limit,
            })
            .select("id")
            .single();

        if (insQErr) throw new Error(`Insert question failed (local id=${localId}): ` + insQErr.message);

        localToSupabaseId[localId] = inserted.id;
        console.log(
            `   ✅ Q${localId} "${q.title}" (${q.round}) → Supabase id=${inserted.id}`
        );
    }

    // ── 6. Insert test_cases with remapped problem_id ─────────────────────────
    console.log("\n⬆️  Inserting test_cases into Supabase...");
    let tcCount = 0;
    for (const tc of testCases) {
        const localProblemId = parseInt(tc.problem_id, 10);
        const newProblemId = localToSupabaseId[localProblemId];

        if (newProblemId === undefined) {
            console.warn(
                `   ⚠️  Skipping test_case id=${tc.id}: no matching question for problem_id=${tc.problem_id}`
            );
            continue;
        }

        const { error: insTCErr } = await supabase.from("test_cases").insert({
            problem_id: String(newProblemId),
            input: tc.input,
            expected_output: tc.expected_output,
            is_hidden: tc.is_hidden,
        });

        if (insTCErr)
            throw new Error(
                `Insert test_case failed (local id=${tc.id}): ` + insTCErr.message
            );

        tcCount++;
    }

    console.log(`   ✅ Inserted ${tcCount} test cases.`);
    console.log("\n🎉 Upload complete! Supabase is now up-to-date.");

    await localPool.end();
    process.exit(0);
}

upload().catch((err) => {
    console.error("❌ Upload failed:", err.message);
    localPool.end();
    process.exit(1);
});
