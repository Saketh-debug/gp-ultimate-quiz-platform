const fs = require('fs');
const readline = require('readline');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'password',
  database: process.env.DB_NAME || 'contest_db',
});

async function importData() {
  const fileStream = fs.createReadStream('../sudhamsh_updated.sql', { encoding: 'utf-8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let inQuestions = false;
  let inTestcases = false;

  for await (const line of rl) {
    if (line.startsWith('COPY public.questions ')) {
      inQuestions = true;
      continue;
    }
    if (line.startsWith('COPY public.test_cases ')) {
      inTestcases = true;
      continue;
    }

    if (inQuestions) {
      if (line.startsWith('\\.')) {
        inQuestions = false;
        continue;
      }
      const parts = line.split('\t').map(p => p === '\\N' ? null : p);
      if (parts.length >= 9) {
        try {
          await pool.query(
            `INSERT INTO questions (id, title, description, avg_time, round, base_points, sequence_order, time_limit, sample_input)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (id) DO NOTHING;`,
            [parts[0], parts[1], parts[2], parts[3], parts[4], parts[5], parts[6], parts[7], parts[8] ? parts[8].substring(0, 5000) : null]
          );
        } catch (e) {
          console.error('Error inserting question:', e.message);
        }
      }
    }

    if (inTestcases) {
      if (line.startsWith('\\.')) {
        inTestcases = false;
        continue;
      }
      const parts = line.split('\t').map(p => p === '\\N' ? null : p);
      if (parts.length >= 6) {
        try {
          await pool.query(
            `INSERT INTO test_cases (id, question_id, input_data, expected_output, is_hidden, points)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (id) DO NOTHING;`,
            [parts[0], parts[1], parts[2], parts[3], parts[4], parts[5]]
          );
        } catch (e) {
          console.error('Error inserting test case:', e.message);
        }
      }
    }
  }

  console.log("Import finished.");
  process.exit(0);
}

importData();
