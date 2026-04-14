const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../lib/db');
const { hashBlock } = require('../lib/hash');
const { signBlock } = require('../lib/sign');

// POST /observations - Record a new coordination event
router.post('/', async (req, res) => {
  const { txId, fromBank, toBank, status } = req.body;

  if (!txId || !fromBank || !toBank || !status) {
    return res.status(400).json({ error: 'Missing required fields: txId, fromBank, toBank, status' });
  }

  const validStatuses = ['INITIATE', 'CONFIRM', 'REJECT', 'REVERSE'];
  const normalizedStatus = status.toUpperCase();
  if (!validStatuses.includes(normalizedStatus)) {
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    // Get the current chain tip (searches both Legacy and Current projects).
    const lastRecord = await db.getLatestBlock();
    const prevHash = lastRecord ? lastRecord.chain_hash : '0'.repeat(64);
    const ts = Date.now();

    // Compute chain hash using all fields that identify this event.
    // IMPORTANT: The argument order here must exactly match the order used
    // in vault.js /verify when recomputing the hash for integrity checking.
    const chainHash = hashBlock(txId, fromBank, toBank, prevHash, ts);

    // Collect real ed25519 signatures from all three witness keys.
    // Requires CBK_PRIVATE_KEY, BoU_PRIVATE_KEY, IFC_PRIVATE_KEY in env.
    const signatures = await signBlock(chainHash);

    const newRecord = await db.insertBlock({
      bundle_id:    'OBS-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
      event_id:     crypto.randomUUID(),
      institution_a: fromBank,
      institution_b: toBank,
      event_type:   normalizedStatus,
      tx_ref_hash:  txId,
      chain_hash:   chainHash,
      prev_hash:    prevHash,
      sig_node_1:   signatures[0].signature,
      sig_node_2:   signatures[1].signature,
      sig_node_3:   signatures[2].signature,
      event_ts:     ts,
      latency_ms:   null,
    });

    res.status(201).json({
      message:    'Settlement observation successfully sealed and synced',
      id:         newRecord.id,
      bundle_id:  newRecord.bundle_id,
      chain_hash: newRecord.chain_hash,
      timestamp:  newRecord.created_at,
      sigCount:   signatures.length,
    });
  } catch (error) {
    console.error('[Observations] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /observations/:txId/status - Append a status-change event to the chain.
//
// Does NOT mutate any existing record (the ledger is append-only).
// Instead, a new block is sealed that references the original txId and the
// new status, inheriting institutions from the transaction's history.
//
// Body: { status, reason? }
router.patch('/:txId/status', async (req, res) => {
  const { txId } = req.params;
  const { status, reason } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Missing required field: status' });
  }

  const validStatuses = ['INITIATE', 'CONFIRM', 'REJECT', 'REVERSE'];
  const normalizedStatus = status.toUpperCase();
  if (!validStatuses.includes(normalizedStatus)) {
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    // Verify the transaction exists before appending a status update.
    const txHistory = await db.getTxHistory(txId);
    if (!txHistory || txHistory.length === 0) {
      return res.status(404).json({ error: `Transaction ${txId} not found` });
    }

    // Use the global chain tip (not the tx-specific tip) to preserve
    // the single-linked-list structure of the full ledger.
    const lastRecord = await db.getLatestBlock();
    if (!lastRecord) {
      return res.status(500).json({ error: 'Could not determine chain tip' });
    }

    const prevHash = lastRecord.chain_hash;
    const ts = Date.now();

    // Inherit institutions from the original transaction entry.
    const original = txHistory[0];
    const chainHash = hashBlock(txId, original.institution_a, original.institution_b, prevHash, ts);
    const signatures = await signBlock(chainHash);

    const newRecord = await db.insertBlock({
      bundle_id:     'UPD-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
      event_id:      crypto.randomUUID(),
      institution_a: original.institution_a,
      institution_b: original.institution_b,
      event_type:    normalizedStatus,
      tx_ref_hash:   txId,
      chain_hash:    chainHash,
      prev_hash:     prevHash,
      sig_node_1:    signatures[0].signature,
      sig_node_2:    signatures[1].signature,
      sig_node_3:    signatures[2].signature,
      event_ts:      ts,
      latency_ms:    null,
    });

    res.json({
      id:         newRecord.id,
      bundle_id:  newRecord.bundle_id,
      new_status: newRecord.event_type,
      chain_hash: newRecord.chain_hash,
    });
  } catch (error) {
    console.error('[Observations] Update Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
