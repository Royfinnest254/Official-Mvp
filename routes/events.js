const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../lib/db');
const { signBlock } = require('../lib/sign');

// POST /v1/events - Seal a coordination event from the bank simulation.
//
// Body: { institution_a, institution_b, event_type, tx_ref_hash, timestamp? }
// event_type must be: INITIATE | CONFIRM | REJECT | REVERSE
// Any unknown event_type is normalised to CONFIRM.
router.post('/', async (req, res) => {
  const { institution_a, institution_b, event_type, tx_ref_hash, timestamp } = req.body;

  if (!institution_a || !institution_b || !event_type || !tx_ref_hash) {
    return res.status(400).json({
      error: 'Missing required fields: institution_a, institution_b, event_type, tx_ref_hash',
    });
  }

  const validTypes = ['INITIATE', 'CONFIRM', 'REJECT', 'REVERSE'];
  const normalizedType = event_type.toUpperCase();
  const finalType = validTypes.includes(normalizedType) ? normalizedType : 'CONFIRM';

  try {
    // Fetch the current chain tip across both Legacy and Current projects.
    const lastRecord = await db.getLatestBlock();
    const prevHash = lastRecord?.chain_hash || '0'.repeat(64);

    const cleanTxHash = tx_ref_hash.trim();
    const event_id = crypto.randomUUID();
    const bundle_id = 'BND-' + crypto.randomBytes(5).toString('hex').toUpperCase();
    const ts = timestamp || Date.now();

    // Compute the chain hash using the same field order as vault.js /verify.
    const chain_hash = crypto
      .createHash('sha256')
      .update(cleanTxHash + institution_a + institution_b + prevHash + ts)
      .digest('hex');

    // Collect real ed25519 signatures from all three witness keys.
    // Replaces the previous placeholder SHA-256 "signatures" that offered
    // no cryptographic proof of multi-party witness (see audit BUG-5).
    const signatures = await signBlock(chain_hash);

    // Simulate realistic cross-border consensus latency (25ms – 85ms).
    const latency = Math.floor(Math.random() * 60) + 25;

    const data = await db.insertBlock({
      bundle_id,
      event_id,
      institution_a,
      institution_b,
      event_type:  finalType,
      tx_ref_hash: cleanTxHash,
      chain_hash,
      prev_hash:   prevHash,
      sig_node_1:  signatures[0].signature,
      sig_node_2:  signatures[1].signature,
      sig_node_3:  signatures[2].signature,
      event_ts:    ts,
      latency_ms:  latency,
    });

    // Update Prometheus counters.
    const { transactionCounter, consensusLatency } = require('../lib/metrics');
    transactionCounter.inc({ institution_a, institution_b, status: 'sealed', event_type: finalType });
    consensusLatency.observe(latency / 1000);

    res.status(201).json({
      status:     'sealed',
      id:         data.id,
      bundle_id:  data.bundle_id,
      chain_hash: data.chain_hash,
    });
  } catch (error) {
    console.error('[Events] Error processing record:', error.message);
    const { transactionCounter } = require('../lib/metrics');
    transactionCounter.inc({
      institution_a: req.body.institution_a || 'unknown',
      institution_b: req.body.institution_b || 'unknown',
      status:        'failure',
      event_type:    req.body.event_type || 'UNKNOWN',
    });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
