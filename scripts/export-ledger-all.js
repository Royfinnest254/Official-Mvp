require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const BATCH_SIZE = 1000;
const OUTPUT_FILE = 'C:\\Users\\roych\\.gemini\\antigravity\\brain\\deb12fa7-7390-4de3-8c74-3f0fe8346541\\all_ledger_records.csv';

async function exportAll() {
  console.log('🔄 Starting Full Ledger Export (All Records to CSV)...');
  
  // Create write stream
  const writer = fs.createWriteStream(OUTPUT_FILE);
  
  // Write CSV Header
  writer.write('id,bundle_id,event_id,institution_a,institution_b,event_type,tx_ref_hash,chain_hash,prev_hash,event_ts,created_at,sig_node_1,sig_node_2,sig_node_3\n');

  let from = 0;
  let to = BATCH_SIZE - 1;
  let done = false;
  let totalSaved = 0;

  while (!done) {
    console.log(`📦 Fetching records ${from} to ${to}...`);
    const { data, error } = await supabase
      .from('coordination_records')
      .select('*')
      .order('id', { ascending: true })
      .range(from, to);

    if (error) {
      console.error('❌ Error fetching data:', error);
      break;
    }

    if (!data || data.length === 0) {
      done = true;
      break;
    }

    // Write batch to CSV
    data.forEach(r => {
      const row = [
        r.id,
        `"${r.bundle_id}"`,
        `"${r.event_id}"`,
        `"${r.institution_a}"`,
        `"${r.institution_b}"`,
        `"${r.event_type}"`,
        `"${r.tx_ref_hash.replace(/\n/g, ' ')}"`, // Clean up TX IDs
        `"${r.chain_hash}"`,
        `"${r.prev_hash}"`,
        r.event_ts,
        `"${r.created_at}"`,
        `"${r.sig_node_1 || ''}"`,
        `"${r.sig_node_2 || ''}"`,
        `"${r.sig_node_3 || ''}"`
      ].join(',');
      writer.write(row + '\n');
    });

    totalSaved += data.length;
    from += BATCH_SIZE;
    to += BATCH_SIZE;

    if (data.length < BATCH_SIZE) {
      done = true;
    }
  }

  writer.end();
  console.log(`✅ Successfully saved ${totalSaved} records to CSV.`);
  console.log(`💾 Data saved to: ${OUTPUT_FILE}`);
}

exportAll().catch(err => {
  console.error('❌ Fatal Error:', err);
  process.exit(1);
});
