const express = require('express');
const router = express.Router();
const { getLatestBlock } = require('../lib/db');

router.get('/', async (req, res) => {
  try {
    const latest = await getLatestBlock();
    res.json({
      status: 'ok',
      blocks: latest ? latest.block_number : 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
