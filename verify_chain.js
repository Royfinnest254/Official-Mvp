const db = require('./lib/db');

async function verify() {
  console.log('--- Verifying Dual Supabase Daisy-Chain ---');
  
  try {
    // 1. Check Latest Block logic
    const latest = await db.getLatestBlock();
    console.log('Latest Block found:', latest ? latest.bundle_id : 'NONE');

    // 2. Check Chain Aggregation
    const chain = await db.getChain(10);
    console.log(`Chain fetch (limit 10) returned ${chain.length} records.`);

    // 3. Verify Legacy counts
    const { count: legacyCount } = await db.supabaseLegacy.from('coordination_records').select('*', { count: 'exact', head: true });
    console.log(`Legacy records in Project A: ${legacyCount}`);

    // 4. Verify Current (Project B)
    const { count: currentCount } = await db.supabaseCurrent.from('coordination_records').select('*', { count: 'exact', head: true });
    console.log(`Current records in Project B: ${currentCount}`);

    // Continuity verification logic:
    // If Project B has records, the first record's prev_hash should match Legacy's last record's chain_hash.
    if (currentCount > 0) {
        const { data: firstB } = await db.supabaseCurrent.from('coordination_records').select('*').order('id', { ascending: true }).limit(1).single();
        const { data: lastA } = await db.supabaseLegacy.from('coordination_records').select('*').order('id', { ascending: false }).limit(1).single();
        
        if (firstB && lastA) {
            console.log('--- Continuity Check ---');
            console.log(`Project A Last Hash: ${lastA.chain_hash}`);
            console.log(`Project B First Prev: ${firstB.prev_hash}`);
            if (firstB.prev_hash === lastA.chain_hash) {
                console.log('✅ Continuity Preserved!');
            } else {
                console.log('⚠️ Continuity Mismatch! (Only expected if B was already populated differently)');
            }
        }
    } else {
        console.log('Project B is currently empty. Continuity will be established on the next write.');
    }

  } catch (err) {
    console.error('Verification failed:', err.message);
  }
}

verify();
