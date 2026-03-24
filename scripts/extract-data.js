require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function extractData() {
  console.log('='.repeat(70));
  console.log('  CONNEX NETWORK — RAW EXPERIMENT DATA EXTRACTION');
  console.log('  Extracted: ' + new Date().toLocaleString());
  console.log('='.repeat(70));

  // 1. Total records in the ledger
  console.log('⏳ Connecting to Supabase...');
  const { count: totalRecords, error: countError } = await supabase
    .from('coordination_records')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.error('❌ Connection Error:', countError);
    process.exit(1);
  }
  console.log(`\n📊 TOTAL COORDINATION RECORDS IN LEDGER: ${totalRecords}`);

  // 2. Fetch all records for analysis
  console.log('⏳ Fetching all records...');
  const { data: allRecords, error } = await supabase
    .from('coordination_records')
    .select('*')
    .order('id', { ascending: true });
  
  if (error) { console.error('DB Error:', error); return; }

  // 3. Event type breakdown
  const eventTypes = {};
  allRecords.forEach(r => {
    eventTypes[r.event_type] = (eventTypes[r.event_type] || 0) + 1;
  });
  console.log('\n📋 EVENT TYPE BREAKDOWN:');
  Object.entries(eventTypes).forEach(([type, count]) => {
    const pct = ((count / totalRecords) * 100).toFixed(1);
    console.log(`   ${type}: ${count} events (${pct}%)`);
  });

  // 4. Institution breakdown
  const institutions = {};
  allRecords.forEach(r => {
    const pair = `${r.institution_a} → ${r.institution_b}`;
    institutions[pair] = (institutions[pair] || 0) + 1;
  });
  console.log('\n🏦 INSTITUTION PAIR BREAKDOWN:');
  Object.entries(institutions).forEach(([pair, count]) => {
    console.log(`   ${pair}: ${count} events`);
  });

  // 5. Consensus analysis (REAL signature data)
  let fullConsensus = 0;    // 3 of 3 nodes signed
  let partialConsensus = 0; // 2 of 3 nodes signed
  let failedConsensus = 0;  // 0-1 nodes signed
  let node1Success = 0, node2Success = 0, node3Success = 0;

  allRecords.forEach(r => {
    const n1 = r.sig_node_1 && r.sig_node_1.length > 20 && r.sig_node_1 !== 'NODE_OFFLINE';
    const n2 = r.sig_node_2 && r.sig_node_2.length > 20 && r.sig_node_2 !== 'NODE_OFFLINE';
    const n3 = r.sig_node_3 && r.sig_node_3.length > 20 && r.sig_node_3 !== 'NODE_OFFLINE';
    if (n1) node1Success++;
    if (n2) node2Success++;
    if (n3) node3Success++;
    const valid = [n1, n2, n3].filter(Boolean).length;
    if (valid === 3) fullConsensus++;
    else if (valid === 2) partialConsensus++;
    else failedConsensus++;
  });

  console.log('\n🔐 WITNESS NODE CONSENSUS ANALYSIS (REAL DATA):');
  console.log(`   Full Consensus (3/3 nodes):    ${fullConsensus} events (${((fullConsensus/totalRecords)*100).toFixed(1)}%)`);
  console.log(`   Partial Consensus (2/3 nodes): ${partialConsensus} events (${((partialConsensus/totalRecords)*100).toFixed(1)}%)`);
  console.log(`   Failed Consensus (<2 nodes):   ${failedConsensus} events (${((failedConsensus/totalRecords)*100).toFixed(1)}%)`);
  console.log(`\n   Node 1 (AWS) Success Rate:   ${node1Success}/${totalRecords} = ${((node1Success/totalRecords)*100).toFixed(1)}%`);
  console.log(`   Node 2 (GCP) Success Rate:   ${node2Success}/${totalRecords} = ${((node2Success/totalRecords)*100).toFixed(1)}%`);
  console.log(`   Node 3 (Azure) Success Rate: ${node3Success}/${totalRecords} = ${((node3Success/totalRecords)*100).toFixed(1)}%`);

  // 6. Time-based analysis (REAL throughput)
  if (allRecords.length >= 2) {
    const firstTs = parseInt(allRecords[0].event_ts);
    const lastTs = parseInt(allRecords[allRecords.length - 1].event_ts);
    const durationMs = lastTs - firstTs;
    const durationSec = durationMs / 1000;
    const durationMin = durationSec / 60;
    const realTPS = totalRecords / durationSec;

    console.log('\n⏱️  REAL THROUGHPUT METRICS:');
    console.log(`   First event:    ${new Date(firstTs).toLocaleString()}`);
    console.log(`   Last event:     ${new Date(lastTs).toLocaleString()}`);
    console.log(`   Total duration: ${durationMin.toFixed(1)} minutes (${durationSec.toFixed(0)} seconds)`);
    console.log(`   REAL measured TPS: ${realTPS.toFixed(2)} transactions/second`);
    console.log(`   REAL measured TPM: ${(totalRecords / durationMin).toFixed(1)} transactions/minute`);
  }

  // 7. Hash chain integrity check
  console.log('\n🔗 HASH CHAIN INTEGRITY CHECK:');
  let chainValid = true;
  let chainBreaks = 0;
  for (let i = 1; i < allRecords.length; i++) {
    if (allRecords[i].prev_hash !== allRecords[i-1].chain_hash) {
      chainValid = false;
      chainBreaks++;
    }
  }
  if (chainValid) {
    console.log(`   ✅ CHAIN IS INTACT. All ${totalRecords} blocks are correctly linked.`);
  } else {
    console.log(`   ⚠️  Chain has ${chainBreaks} break(s) out of ${totalRecords - 1} links.`);
  }

  // 8. Sample records (first 5 and last 5)
  console.log('\n📄 FIRST 5 RECORDS (Earliest Events):');
  console.log('-'.repeat(70));
  allRecords.slice(0, 5).forEach(r => {
    console.log(`   ID: ${r.id} | TX: ${r.tx_ref_hash} | ${r.institution_a} → ${r.institution_b} | Type: ${r.event_type}`);
    console.log(`     Time: ${new Date(parseInt(r.event_ts)).toLocaleString()}`);
    console.log(`     Hash: ${r.chain_hash.substring(0, 40)}...`);
    console.log(`     Sigs: N1=${r.sig_node_1 ? '✅' : '❌'} N2=${r.sig_node_2 ? '✅' : '❌'} N3=${r.sig_node_3 ? '✅' : '❌'}`);
  });

  console.log('\n📄 LAST 5 RECORDS (Most Recent Events):');
  console.log('-'.repeat(70));
  allRecords.slice(-5).forEach(r => {
    console.log(`   ID: ${r.id} | TX: ${r.tx_ref_hash} | ${r.institution_a} → ${r.institution_b} | Type: ${r.event_type}`);
    console.log(`     Time: ${new Date(parseInt(r.event_ts)).toLocaleString()}`);
    console.log(`     Hash: ${r.chain_hash.substring(0, 40)}...`);
    console.log(`     Sigs: N1=${r.sig_node_1 ? '✅' : '❌'} N2=${r.sig_node_2 ? '✅' : '❌'} N3=${r.sig_node_3 ? '✅' : '❌'}`);
  });

  // 9. Unique TX ID format analysis
  const txFormats = { mpesa_style: 0, hex_hash: 0, other: 0 };
  allRecords.forEach(r => {
    if (r.tx_ref_hash.startsWith('OQX')) txFormats.mpesa_style++;
    else if (r.tx_ref_hash.length > 30) txFormats.hex_hash++;
    else txFormats.other++;
  });
  console.log('\n🆔 TRANSACTION ID FORMAT ANALYSIS:');
  console.log(`   M-PESA Style (OQX...):  ${txFormats.mpesa_style}`);
  console.log(`   SHA-256 Hash Style:     ${txFormats.hex_hash}`);
  console.log(`   Other:                  ${txFormats.other}`);

  // 10. Signature length analysis (proves real Ed25519)
  const sigLengths = new Set();
  allRecords.forEach(r => {
    if (r.sig_node_1 && r.sig_node_1 !== 'NODE_OFFLINE') sigLengths.add(r.sig_node_1.length);
    if (r.sig_node_2 && r.sig_node_2 !== 'NODE_OFFLINE') sigLengths.add(r.sig_node_2.length);
    if (r.sig_node_3 && r.sig_node_3 !== 'NODE_OFFLINE') sigLengths.add(r.sig_node_3.length);
  });
  console.log('\n✍️  SIGNATURE LENGTH ANALYSIS:');
  console.log(`   Unique signature lengths observed: ${[...sigLengths].join(', ')} characters`);
  console.log(`   (Ed25519 hex signatures should be 128 characters = 64 bytes)`);

  console.log('\n' + '='.repeat(70));
  console.log('  END OF RAW DATA EXTRACTION');
  console.log('='.repeat(70));
}

extractData().catch(console.error);
