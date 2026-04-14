const { createClient } = require('@supabase/supabase-js');

const TARGET_URL = 'https://hqyetfmqjesaeozcarri.supabase.co';
const TARGET_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxeWV0Zm1xamVzYWVvemNhcnJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjAzMzQyNCwiZXhwIjoyMDkxNjA5NDI0fQ.apwRzBTfeO_pkBOWiyN1nUxjF0wIRrs0KsUysNLFWTM';

const targetSupabase = createClient(TARGET_URL, TARGET_KEY);

async function checkCount() {
  const { count, error } = await targetSupabase
    .from('coordination_records')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Target row count:', count);
  }
}

checkCount();
