const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

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
