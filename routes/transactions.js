const express = require('express');
const router = express.Router();
const db = require('../lib/db');

// GET /tx/stats - Get global network statistics
router.get('/stats', async (req, res) => {
  try {
    // [DAISY-CHAIN] Get total count from both projects
    const jobs = [
      db.supabaseLegacy ? db.supabaseLegacy.from('coordination_records').select('*', { count: 'estimated', head: true }) : Promise.resolve({ count: 0, error: null }),
      db.supabaseCurrent ? db.supabaseCurrent.from('coordination_records').select('*', { count: 'estimated', head: true }) : Promise.resolve({ count: 0, error: null }),
      db.supabaseCurrent ? db.supabaseCurrent.from('coordination_records').select('latency_ms').order('id', { ascending: false }).limit(50) : Promise.resolve({ data: [], error: null })
    ];
    const [legacyCountRes, currentCountRes, currentLatencyRes] = await Promise.all(jobs);

    const total = (legacyCountRes.count || 0) + (currentCountRes.count || 0);

    // Calculate Average Latency from current project (relevant for current performance)
    let avgLatency = 42;
    const latencyRecords = currentLatencyRes.data || [];
    if (latencyRecords.length > 0) {
      const totalLat = latencyRecords.reduce((acc, curr) => acc + (curr.latency_ms || 0), 0);
      avgLatency = Math.round(totalLat / latencyRecords.length);
    }

    // Recent TPS (Always from current project)
    const tenSecondsAgo = new Date(Date.now() - 10000).toISOString();
    let recentCount = 0;
    if (db.supabaseCurrent) {
      const { count, error: recentErr } = await db.supabaseCurrent
        .from('coordination_records')
        .select('*', { count: 'exact', head: true })
        .gt('created_at', tenSecondsAgo);
      if (recentErr) throw recentErr;
      recentCount = count || 0;
    }

    const realTPS = (recentCount || 0) / 10;
    const disputes = 0;

    res.json({ 
      total, 
      disputes,
      tps: parseFloat(realTPS.toFixed(1)),
      latency: avgLatency
    });
  } catch (error) {
    console.error("[Transactions] Error fetching stats:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /tx/recent - Get the latest network transactions for the live dashboard
router.get('/recent', async (req, res) => {
  try {
    // [DAISY-CHAIN] getChain handles aggregating from both if needed
    const records = await db.getChain(50);
    res.json({ events: records });
  } catch (error) {
    console.error("[Transactions] Error fetching recent tx:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /tx/:txId - Get full history of a transaction
router.get('/:txId', async (req, res) => {
  const { txId } = req.params;
  try {
    // [DAISY-CHAIN] getTxHistory searches both projects
    const records = await db.getTxHistory(txId);
    res.json({ events: records });
  } catch (error) {
    console.error("[Transactions] Error fetching tx history:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
