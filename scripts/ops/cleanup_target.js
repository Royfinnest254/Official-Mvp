const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const config = {
  host: 'aws-0-eu-west-1.pooler.supabase.com',
  user: 'postgres.hqyetfmqjesaeozcarri',
  password: '@Synchro2026',
  database: 'postgres',
  port: 5432,
};

async function cleanup() {
  const client = new Client(config);
  try {
    await client.connect();
    console.log('Connected to target database.');

    // We can just drop the table since we have the schema file to recreate it
    console.log('Dropping coordination_records...');
    await client.query('DROP TABLE IF EXISTS coordination_records CASCADE;');

    const sqlPath = path.join(__dirname, '..', 'supabase_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Re-creating schema...');
    await client.query(sql);
    console.log('Target project is now fresh and ready.');

  } catch (err) {
    console.error('Error cleaning up:', err.message);
  } finally {
    await client.end();
  }
}

cleanup();
