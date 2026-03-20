const { getChain } = require('../lib/db');

async function show() {
  const blocks = await getChain();
  console.log('--- MERMAID ---');
  console.log('graph TD');
  blocks.reverse().forEach((b, i) => {
    const label = b.status === 'DISPUTED' ? 'DISPUTED_BLOCK' : 'PENDING_BLOCK';
    const hashShort = b.block_hash.substring(0, 8);
    console.log(`  B${i}["${label} #${b.block_number}<br/>TX: ${b.tx_id}<br/>Hash: ${hashShort}..."]`);
    if (i > 0) {
      console.log(`  B${i-1} --> B${i}`);
    }
  });
  console.log('--- END ---');
  console.log('--- DATA ---');
  console.log(JSON.stringify(blocks, null, 2));
}

show().catch(console.error);
