const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'password',
  database: process.env.DB_NAME || 'contest_db',
});

async function run() {
  await client.connect();
  const sql = fs.readFileSync(path.join(__dirname, '../sudhamsh_updated.sql'), 'utf8');
  await client.query(sql);
  console.log('Successfully imported SQL dump');
  await client.end();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
