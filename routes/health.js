const express = require('express');
const router = express.Router();
const { getLatestBlock } = require('../lib/db');

// GET /health - Public liveness and chain-tip probe.
//
// Returns the latest sealed record count and current timestamp.
// This endpoint is intentionally public so load balancers and uptime
// monitors can check server health without an API key.
router.get('/', async (req, res) => {
  try {
    const latest = await getLatestBlock();

    // The schema uses 'id' (BIGSERIAL) as the primary key, not 'block_number'.
    // We report the latest record's id as the chain depth indicator.
    res.json({
      status:     'ok',
      chain_depth: latest ? latest.id : 0,
      timestamp:  new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
