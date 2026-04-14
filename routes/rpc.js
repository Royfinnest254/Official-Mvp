const express = require('express');
const router = express.Router();
const db = require('../lib/db');

// GET /rpc/get_dashboard_stats
// Returns aggregate statistics across both Supabase projects.
// Used by Grafana Infinity data source. Requires x-api-key header.
router.get('/get_dashboard_stats', async (req, res) => {
  try {
    const jobs = [
      db.supabaseLegacy 
        ? db.supabaseLegacy.from('coordination_records').select('*', { count: 'estimated', head: true })
        : Promise.resolve({ count: 0, error: null }),
      db.supabaseCurrent
        ? db.supabaseCurrent.from('coordination_records').select('*', { count: 'estimated', head: true })
        : Promise.resolve({ count: 0, error: null }),
      db.supabaseLegacy
        ? db.supabaseLegacy.from('coordination_records').select('institution_a, institution_b').order('id', { ascending: false }).limit(50)
        : Promise.resolve({ data: [], error: null }),
      db.supabaseCurrent
        ? db.supabaseCurrent.from('coordination_records').select('institution_a, institution_b').order('id', { ascending: false }).limit(50)
        : Promise.resolve({ data: [], error: null }),
      db.supabaseCurrent
        ? db.supabaseCurrent.from('coordination_records').select('latency_ms').order('id', { ascending: false }).limit(50)
        : Promise.resolve({ data: [], error: null }),
    ];

    const [legacyCountRes, currentCountRes, legacyInstRes, currentInstRes, currentLatRes] = await Promise.all(jobs);

    if (legacyCountRes.error) throw legacyCountRes.error;
    if (currentCountRes.error) throw currentCountRes.error;

    const total = (legacyCountRes.count || 0) + (currentCountRes.count || 0);

    // Build unique institution set across both projects.
    const instSet = new Set();
    [...(legacyInstRes.data || []), ...(currentInstRes.data || [])].forEach(r => {
      instSet.add(r.institution_a);
      instSet.add(r.institution_b);
    });

    // Average latency from the most recent 50 records of the current project.
    let avgLatency = 45;
    const latData = currentLatRes.data || [];
    if (latData.length > 0) {
      const sum = latData.reduce((acc, r) => acc + (r.latency_ms || 0), 0);
      avgLatency = Math.round(sum / latData.length);
    }

    res.json([{
      total_transactions: total,
      active_institutions: instSet.size || 2,
      avg_latency: avgLatency,
    }]);
  } catch (error) {
    console.error('[RPC] Error get_dashboard_stats:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /rpc/get_throughput_series
// Returns event timestamps bucketed into 5-second intervals for charting TPS.
router.get('/get_throughput_series', async (req, res) => {
  try {
    let records = [];
    if (db.supabaseCurrent) {
      const { data, error } = await db.supabaseCurrent
        .from('coordination_records')
        .select('event_ts')
        .order('id', { ascending: false })
        .limit(60);
      if (error) throw error;
      records = data || [];
    }
    if (records.length < 20 && db.supabaseLegacy) {
      const { data: legacyData } = await db.supabaseLegacy
        .from('coordination_records')
        .select('event_ts')
        .order('id', { ascending: false })
        .limit(20);
      records = records.concat(legacyData || []);
    }

    // Group into 5-second buckets.
    const buckets = {};
    records.forEach(r => {
      const bin = Math.floor(r.event_ts / 5000) * 5000;
      buckets[bin] = (buckets[bin] || 0) + 1;
    });

    const series = Object.keys(buckets)
      .map(ts => ({ time: parseInt(ts), value: buckets[ts] }))
      .sort((a, b) => a.time - b.time);

    if (series.length === 0) {
      series.push({ time: Date.now(), value: 0 });
    }

    res.json(series);
  } catch (error) {
    console.error('[RPC] Error get_throughput_series:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /rpc/get_event_distribution
// Returns a breakdown of event_type counts from the current project.
router.get('/get_event_distribution', async (req, res) => {
  try {
    let currentData = [];
    if (db.supabaseCurrent) {
      const { data, error } = await db.supabaseCurrent
        .from('coordination_records')
        .select('event_type')
        .order('id', { ascending: false })
        .limit(500);
      if (error) throw error;
      currentData = data || [];
    }

    const counts = {};
    currentData.forEach(r => {
      counts[r.event_type] = (counts[r.event_type] || 0) + 1;
    });

    const dist = Object.keys(counts).map(k => ({ metric: k, value: counts[k] }));

    if (dist.length === 0) {
      dist.push({ metric: 'NONE', value: 1 });
    }

    res.json(dist);
  } catch (error) {
    console.error('[RPC] Error get_event_distribution:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
