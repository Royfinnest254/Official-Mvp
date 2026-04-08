const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// GET /tx/stats - Get global network statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total count of all records
    const { count: total, error: totalErr } = await supabase
      .from('coordination_records')
      .select('*', { count: 'exact', head: true });

    // Calculate Real Average Latency from the last 50 records
    const { data: latencyRecords, error: latencyErr } = await supabase
      .from('coordination_records')
      .select('latency_ms')
      .order('id', { ascending: false })
      .limit(50);

    let avgLatency = 42; // Default fallback
    if (latencyRecords && latencyRecords.length > 0) {
      const totalLat = latencyRecords.reduce((acc, curr) => acc + (curr.latency_ms || 0), 0);
      avgLatency = Math.round(totalLat / latencyRecords.length);
    }

    // Get count of transactions in the last 10 seconds for ultra-responsive TPS
    const tenSecondsAgo = Date.now() - 10000;
    const { count: recentCount, error: recentErr } = await supabase
      .from('coordination_records')
      .select('*', { count: 'exact', head: true })
      .gt('event_ts', tenSecondsAgo);

    const realTPS = (recentCount || 0) / 10;
    const disputes = 0; // Displacement logic to be implemented later

    if (totalErr || recentErr || latencyErr) {
        throw (totalErr || recentErr || latencyErr);
    }

    res.json({ 
      total: total || 0, 
      disputes: disputes || 0,
      tps: parseFloat(realTPS.toFixed(1)),
      latency: avgLatency
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /tx/recent - Get the latest network transactions for the live dashboard
router.get('/recent', async (req, res) => {
  try {
    const { data: records, error } = await supabase
      .from('coordination_records')
      .select('id, bundle_id, tx_ref_hash, institution_a, institution_b, event_type, event_ts, chain_hash')
      .order('id', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json({ events: records });
  } catch (error) {
    console.error("Error fetching recent tx:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /tx/:txId - Get full history of a transaction
router.get('/:txId', async (req, res) => {
  const { txId } = req.params;
  try {
    const { data: records, error } = await supabase
      .from('coordination_records')
      .select('*')
      .eq('tx_ref_hash', txId)
      .order('event_ts', { ascending: true });

    if (error) throw error;
    res.json({ events: records });
  } catch (error) {
    console.error("Error fetching tx history:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
