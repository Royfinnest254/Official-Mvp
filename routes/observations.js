const express = require('express');
const router = express.Router();
const { getLatestBlock, insertBlock } = require('../lib/db');
const { hashBlock } = require('../lib/hash');
const { signBlock } = require('../lib/sign');

// POST /events - Record a new coordination event
router.post('/', async (req, res) => {
  const { txId, amount, currency, fromBank, toBank, status } = req.body;

  if (!txId || !amount || !currency || !fromBank || !toBank || !status) {
    return res.status(400).json({ error: 'Missing required payload fields' });
  }

  try {
    const latestBlock = await getLatestBlock();
    const prevHash = latestBlock ? latestBlock.block_hash : '0000000000000000000000000000000000000000000000000000000000000000';
    const blockNumber = latestBlock ? latestBlock.block_number + 1 : 1;

    const payload = { amount, currency, fromBank, toBank };
    const blockHash = hashBlock(payload, prevHash);
    const signatures = await signBlock(blockHash);

    const newBlock = await insertBlock({
      tx_id: txId,
      block_number: blockNumber,
      prev_hash: prevHash,
      block_hash: blockHash,
      status: status,
      payload: payload,
      signatures: signatures
    });

    res.status(201).json({
      message: 'Settlement observation successfully sealed and synced',
      blockId: newBlock.id,
      hash: newBlock.block_hash,
      timestamp: newBlock.created_at,
      sigCount: signatures.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /events/:txId/status - Update status of a transaction
router.patch('/:txId/status', async (req, res) => {
  const { txId } = req.params;
  const { status, reason } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Missing status field' });
  }

  try {
    // To update status, we write a NEW block for the SAME txId
    const latestBlock = await getLatestBlock();
    if (!latestBlock) {
        return res.status(404).json({ error: 'No blocks found in chain' });
    }

    // Find the last known state for this txId to copy the payload
    const { data: txHistory, error: txError } = await require('../lib/db').supabase
        .from('blocks')
        .select('*')
        .eq('tx_id', txId)
        .order('block_number', { ascending: false })
        .limit(1)
        .single();
    
    if (txError || !txHistory) {
        return res.status(404).json({ error: `Transaction ${txId} not found` });
    }

    const prevHash = latestBlock.block_hash;
    const blockNumber = latestBlock.block_number + 1;

    const payload = txHistory.payload;
    if (reason) payload.reason = reason; // Add reason for dispute if provided

    const blockHash = hashBlock(payload, prevHash);
    const signatures = await signBlock(blockHash);

    const newBlock = await insertBlock({
      tx_id: txId,
      block_number: blockNumber,
      prev_hash: prevHash,
      block_hash: blockHash,
      status: status,
      payload: payload,
      signatures: signatures
    });

    res.json({
      blockId: newBlock.id,
      newStatus: newBlock.status,
      hash: newBlock.block_hash
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
