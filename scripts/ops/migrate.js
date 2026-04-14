const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Source (Current)
const SOURCE_URL = process.env.SUPABASE_URL;
const SOURCE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Target (New)
const TARGET_URL = 'https://hqyetfmqjesaeozcarri.supabase.co';
const TARGET_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxeWV0Zm1xamVzYWVvemNhcnJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjAzMzQyNCwiZXhwIjoyMDkxNjA5NDI0fQ.apwRzBTfeO_pkBOWiyN1nUxjF0wIRrs0KsUysNLFWTM';

const sourceSupabase = createClient(SOURCE_URL, SOURCE_KEY);
const targetSupabase = createClient(TARGET_URL, TARGET_KEY);

async function migrateTable(tableName) {
  console.log(`\n--- Parallel Migrating table: ${tableName} ---`);
  
  const { count: sourceCount, error: countError } = await sourceSupabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });

  if (countError) {
    if (countError.code === '42P01') {
      console.log(`Table ${tableName} does not exist in source. Skipping.`);
      return;
    }
    console.error(`Error counting source rows:`, countError.message);
    return;
  }

  const { count: targetCount } = await targetSupabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });

  console.log(`Source count: ${sourceCount}`);
  console.log(`Target count (skipping): ${targetCount}`);

  const batchSize = 1000;
  const concurrency = 10;
  let totalMigrated = targetCount;

  const migrateBatch = async (offset) => {
    const { data: batch, error: fetchError } = await sourceSupabase
      .from(tableName)
      .select('*')
      .range(offset, offset + batchSize - 1)
      .order('id', { ascending: true });

    if (fetchError) throw new Error(`Fetch error at ${offset}: ${fetchError.message}`);
    if (!batch || batch.length === 0) return 0;

    const { error: insertError } = await targetSupabase
      .from(tableName)
      .insert(batch);

    if (insertError) throw new Error(`Insert error at ${offset}: ${insertError.message}`);
    
    return batch.length;
  };

  for (let i = targetCount; i < sourceCount; i += batchSize * concurrency) {
    const batchPromises = [];
    for (let j = 0; j < concurrency; j++) {
      const offset = i + (j * batchSize);
      if (offset < sourceCount) {
        batchPromises.push(migrateBatch(offset));
      }
    }

    const results = await Promise.all(batchPromises);
    const sum = results.reduce((a, b) => a + b, 0);
    totalMigrated += sum;
    console.log(`Migrated ${totalMigrated}/${sourceCount} rows...`);
  }

  console.log(`Finished migrating ${tableName}.`);
}

async function run() {
  await migrateTable('coordination_records');
}

run();
