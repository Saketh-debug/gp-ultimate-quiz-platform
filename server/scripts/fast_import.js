const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'password',
  database: process.env.DB_NAME || 'contest_db',
});

async function importData() {
  await pool.query('DELETE FROM test_cases');
  await pool.query('DELETE FROM questions');

  const qData = fs.readFileSync('questions_dump.txt', 'utf-8');
  const qLines = qData.split('\n');
  let qCount = 0;
  for (const line of qLines) {
    if (!line.trim() || line.startsWith('COPY') || line.startsWith('\\.')) continue;
    const parts = line.split('\t').map(p => p === '\\N' ? null : p);
    if (parts.length >= 9) {
      try {
        await pool.query(
          `INSERT INTO questions (id, title, description, avg_time, round, base_points, sequence_order, time_limit, sample_input)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [parts[0], parts[1], parts[2], parts[3], parts[4], parts[5], parts[6], parts[7], parts[8] ? parts[8].substring(0, 5000) : null]
        );
        qCount++;
      } catch (e) {
        console.error('Error inserting question:', e.message);
      }
    }
  }
  console.log(`Imported ${qCount} questions.`);

  const tcData = fs.readFileSync('test_cases_dump.txt', 'utf-8');
  const tcLines = tcData.split('\n');
  let tcCount = 0;
  for (const line of tcLines) {
    if (!line.trim() || line.startsWith('COPY') || line.startsWith('\\.')) continue;
    const parts = line.split('\t').map(p => p === '\\N' ? null : p);
    if (parts.length >= 6) {
      try {
        await pool.query(
          `INSERT INTO test_cases (id, question_id, input_data, expected_output, is_hidden, points)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [parts[0], parts[1], parts[2], parts[3], parts[4], parts[5]]
        );
        tcCount++;
      } catch (e) {
        console.error('Error inserting test case:', e.message);
      }
    }
  }
  console.log(`Imported ${tcCount} test cases.`);

  process.exit(0);
}

importData();
