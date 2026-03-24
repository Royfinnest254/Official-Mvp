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

    // Get total count of disputes (REJECT or DISPUTE)
    // Supabase JS doesn't support complex OR counts in a single .select call with .select('*', {count: 'exact'}) easily for multiple values
    // but we can just query for REJECT and it covers most
    const { count: disputes, error: disputeErr } = await supabase
      .from('coordination_records')
      .select('*', { count: 'exact', head: true })
      .or('event_type.eq.REJECT,event_type.eq.DISPUTE');

    if (totalErr) throw totalErr;
    if (disputeErr) throw disputeErr;

    res.json({ 
      total: total || 0, 
      disputes: disputes || 0,
      tps: 5.0 
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
