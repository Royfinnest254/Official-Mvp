const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function listTables() {
  const { data, error } = await supabase.rpc('get_tables');
  if (error) {
    // If RPC doesn't exist, try querying pg_catalog via REST (might not work depending on permissions)
    const { data: tables, error: tableError } = await supabase
      .from('pg_catalog.pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
    
    if (tableError) {
      console.log('Error fetching tables:', tableError.message);
      // Fallback: Just check the known ones
      console.log('Known table check: coordination_records, blocks');
    } else {
      console.log('Tables in public schema:', tables.map(t => t.tablename).join(', '));
    }
  } else {
    console.log('Tables:', data);
  }
}

listTables();
