const express = require('express');
const router = express.Router();
const { getTxHistory } = require('../lib/db');

// GET /tx/:txId - Get full history of a transaction
router.get('/:txId', async (req, res) => {
  const { txId } = req.params;
  try {
    const events = await getTxHistory(txId);
    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
