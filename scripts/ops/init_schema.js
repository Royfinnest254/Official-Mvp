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

async function initSchema() {
  const client = new Client(config);
  try {
    await client.connect();
    console.log('Connected to target database.');

    const sqlPath = path.join(__dirname, '..', 'supabase_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing schema SQL...');
    await client.query(sql);
    console.log('Schema initialization complete.');

  } catch (err) {
    console.error('Error initializing schema:', err.message);
  } finally {
    await client.end();
  }
}

initSchema();
