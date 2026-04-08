const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function checkLocks() {
  console.log("Checking for active database processes...");
  // This might fail if the SERVICE_KEY doesn't have permission to pg_stat_activity
  const { data, error } = await supabase.rpc('get_active_queries'); 
  
  if (error) {
    console.log("RPC 'get_active_queries' failed (standard for new projects).");
    console.log("Querying directly via .from()...");
    // Alternative: Try to see if we can just count current connections if possible
    // But usually we can't query pg_catalog via Supabase JS easily.
  } else {
    console.table(data);
  }
}

checkLocks();
