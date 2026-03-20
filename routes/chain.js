const express = require('express');
const router = express.Router();
const { getChain, supabase } = require('../lib/db');
const { hashBlock } = require('../lib/hash');

// GET /chain - Return full hash chain
router.get('/', async (req, res) => {
  try {
    const blocks = await getChain();
    res.json({ blocks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /chain/verify - Run integrity check
router.get('/verify', async (req, res) => {
  try {
    // Get all blocks ordered oldest first for sequential verification
    const { data: blocks, error } = await supabase
      .from('blocks')
      .select('*')
      .order('block_number', { ascending: true });

    if (error) throw error;

    let valid = true;
    let blocksChecked = 0;
    let lastHash = '0000000000000000000000000000000000000000000000000000000000000000';

    for (const block of blocks) {
      // 1. Check prev_hash links correctly
      if (block.prev_hash !== lastHash) {
        valid = false;
        break;
      }

      // 2. Re-calculate block_hash and compare
      const calculatedHash = hashBlock(block.payload, block.prev_hash);
      if (block.block_hash !== calculatedHash) {
        valid = false;
        break;
      }

      lastHash = block.block_hash;
      blocksChecked++;
    }

    res.json({ valid, blocksChecked });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /chain/:blockId - Return a single block by its ID
router.get('/:blockId', async (req, res) => {
  const { blockId } = req.params;
  try {
    const { data: block, error } = await supabase
      .from('blocks')
      .select('*')
      .eq('id', blockId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Block not found' });
      throw error;
    }

    res.json({ block });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
