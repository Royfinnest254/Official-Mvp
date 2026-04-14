const express = require('express');
const router = express.Router();
const db = require('../lib/db');
const { hashBlock } = require('../lib/hash');

// GET /vault - Return full hash chain
router.get('/', async (req, res) => {
  try {
    // [DAISY-CHAIN] getChain already handles combining results
    const blocks = await db.getChain(200); 
    res.json({ 
      vault_status: 'SECURE',
      total_traces: blocks.length,
      blocks 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /vault/verify - Run detailed forensic integrity check
router.get('/verify', async (req, res) => {
  try {
    // [DAISY-CHAIN] Fetch all records from legacy then current to verify flow
    const [legacyRes, currentRes] = await Promise.all([
      db.supabaseLegacy ? db.supabaseLegacy.from('coordination_records').select('*').order('id', { ascending: true }) : Promise.resolve({ data: [], error: null }),
      db.supabaseCurrent ? db.supabaseCurrent.from('coordination_records').select('*').order('id', { ascending: true }) : Promise.resolve({ data: [], error: null })
    ]);

    if (legacyRes.error) throw legacyRes.error;
    if (currentRes.error) throw currentRes.error;

    // Maintain chronological order
    const records = (legacyRes.data || []).concat(currentRes.data || []);

    const failures = [];
    let lastHash = '0'.repeat(64);
    let blocksChecked = 0;

    for (const record of records) {
      const issues = [];
      
      // 1. Linkage Check (Critical for Daisy-Chain Transition)
      if (record.prev_hash !== lastHash) {
        issues.push({
          type: 'LINKAGE_BROKEN',
          message: `Previous hash mismatch. Expected ${lastHash.substring(0, 8)}... but found ${record.prev_hash.substring(0, 8)}...`,
          expected: lastHash,
          actual: record.prev_hash
        });
      }

      // 2. Hash Integrity Check
      const calculatedHash = hashBlock(
        record.tx_ref_hash,
        record.institution_a,
        record.institution_b,
        record.prev_hash,
        record.event_ts
      );

      if (record.chain_hash !== calculatedHash) {
        issues.push({
          type: 'HASH_MISMATCH',
          message: 'Data corruption detected. Digital fingerprint does not match record contents.',
          expected: calculatedHash,
          actual: record.chain_hash
        });
      }

      if (issues.length > 0) {
        failures.push({
          id: record.id,
          bundle_id: record.bundle_id,
          tx_id: record.tx_ref_hash,
          issues
        });
      }

      lastHash = record.chain_hash;
      blocksChecked++;
    }

    const valid = failures.length === 0;
    const integrityScore = blocksChecked > 0 ? Math.max(0, 100 - (failures.length / blocksChecked * 100)) : 100;

    res.json({ 
      valid, 
      blocksChecked, 
      failures, 
      integrityScore: parseFloat(integrityScore.toFixed(2)),
      timestamp: Date.now()
    });
  } catch (error) {
    console.error("[Vault] Integrity Check Failure:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
