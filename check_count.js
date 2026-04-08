const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function checkCount() {
  const { count, error } = await supabase
    .from('coordination_records')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error counting records:', error.message);
  } else {
    console.log(`Total coordination records in database: ${count}`);
  }
}

checkCount();
