const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function tamper() {
  const bundleId = process.argv[2];
  
  console.log('--- CONNEX FORENSIC TAMPER TOOL ---');
  
  let target;
  if (bundleId) {
    const { data, error } = await supabase
      .from('coordination_records')
      .select('*')
      .eq('bundle_id', bundleId)
      .single();
    
    if (error || !data) {
      console.error(`Error: Could not find record with bundle_id: ${bundleId}`);
      return;
    }
    target = data;
  } else {
    const { data, error } = await supabase
      .from('coordination_records')
      .select('*')
      .order('id', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) {
      console.error('Error: No records found in vault.');
      return;
    }
    target = data;
  }

  console.log(`Targeting Record: ${target.bundle_id} (TX: ${target.tx_ref_hash})`);
  
  // Corrupting the chain hash by flipping one character
  const originalHash = target.chain_hash;
  const tamperedHash = originalHash.substring(0, originalHash.length - 1) + (originalHash.endsWith('f') ? 'a' : 'f');

  console.log(`Original Hash: ${originalHash}`);
  console.log(`Tampered Hash: ${tamperedHash}`);

  const { error: updateError } = await supabase
    .from('coordination_records')
    .update({ chain_hash: tamperedHash })
    .eq('id', target.id);

  if (updateError) {
    console.error('Tamper Failed:', updateError.message);
  } else {
    console.log('\x1b[31m%s\x1b[0m', 'SUCCESS: Record successfully corrupted. Run the Forensic Walk in the dashboard to detect.');
  }
}

tamper();
