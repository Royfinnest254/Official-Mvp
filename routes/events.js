/**
 * Connex API Gateway - Events Route
 * PRD v0.1 implementation for POST /v1/events
 * Coordinates the 3 witness nodes to achieve 2-of-3 consensus.
 */
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// Database Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Witness Node Endpoints from Environment Variables
const NODE_URLS = [
  process.env.NODE_1_URL, // e.g., https://connex-node-1.onrender.com/sign
  process.env.NODE_2_URL, // e.g., https://connex-node-2.onrender.com/sign
  process.env.NODE_3_URL  // e.g., https://connex-node-3.onrender.com/sign
];

// Authentication is handled globally by index.js to ensure strict consistency across all forensic endpoints.


/**
 * POST /v1/events
 * Receives coordination event, requests signatures, builds proof bundle.
 */
router.post('/', async (req, res) => {
  const { institution_a, institution_b, event_type, tx_ref_hash, timestamp } = req.body;
  
  if (!institution_a || !institution_b || !event_type || !tx_ref_hash || !timestamp) {
    return res.status(400).json({ error: 'Missing required event tuple fields (PRD Section 2)' });
  }

  const eventTs = parseInt(timestamp);

  try {
    // 1. Get the Previous Hash to maintain the chain securely
    let prev_hash = "0000000000000000000000000000000000000000000000000000000000000000"; // Genesis Block fallback
    const { data: lastRecord, error: fetchErr } = await supabase
      .from('coordination_records')
      .select('chain_hash')
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (!fetchErr && lastRecord && lastRecord.chain_hash) {
      prev_hash = lastRecord.chain_hash;
    }

    // 2. Compute the new Block Hash H_i = SHA-256(H_i-1 || E_i || t_i)
    // E_i is the serialized event data
    // 2. Compute the new Block Hash using a deterministic JSON structure to prevent delimiter injection
    const eventData = { institution_a, institution_b, event_type, tx_ref_hash, timestamp: eventTs, prev_hash };
    const chain_hash = crypto.createHash('sha256').update(JSON.stringify(eventData)).digest('hex');

    // 3. Request Signatures from the 3 Witness Nodes in parallel
    const signPromises = NODE_URLS.map(async (url, idx) => {
      try {
        if (!url) return null; // If URL isn't configured yet
        const start = Date.now();
        const response = await axios.post(url, { hash: chain_hash }, { timeout: 15000 });
        const latency = Date.now() - start;
        return { node: idx + 1, signature: response.data.signature, latency };
      } catch (err) {
        console.error(`Node ${idx + 1} signing failed at ${url}: ${err.message}`);
        return null; // Node is unavailable/crashed (crash tolerance)
      }
    });

    const results = await Promise.all(signPromises);
    const validSignatures = results.filter(r => r !== null);

    // 4. Threshold Check (Need at least 2 of 3)
    // Local Prototype Mode: Only simulate signatures if NOT in production
    if (validSignatures.length < 2 && process.env.NODE_ENV !== 'production') {
      console.log("Local Prototype Mode: Simulating Witness Signatures...");
      validSignatures.push({ node: 1, signature: "SIM_SIG_" + crypto.randomBytes(4).toString('hex') });
      validSignatures.push({ node: 2, signature: "SIM_SIG_" + crypto.randomBytes(4).toString('hex') });
      validSignatures.push({ node: 3, signature: "SIM_SIG_" + crypto.randomBytes(4).toString('hex') });
    }

    if (validSignatures.length < 2) {
      return res.status(503).json({ 
        error: 'Consensus Failure: 2-of-3 threshold not met.', 
        signatures_obtained: validSignatures.length 
      });
    }

    // Assign sigs to DB columns
    const sig1 = validSignatures.find(s => s.node === 1)?.signature || 'NODE_OFFLINE';
    const sig2 = validSignatures.find(s => s.node === 2)?.signature || 'NODE_OFFLINE';
    const sig3 = validSignatures.find(s => s.node === 3)?.signature || 'NODE_OFFLINE';

    // 5. Generate Proof Bundle UUID
    const bundle_id = `cx-${crypto.randomBytes(4).toString('hex')}`;
    const event_id = crypto.randomUUID();

    // 6. Write to Immutable Ledger (Supabase)
    const dbRecord = {
      bundle_id,
      event_id,
      institution_a,
      institution_b,
      event_type,
      tx_ref_hash,
      chain_hash,
      prev_hash,
      sig_node_1: sig1,
      sig_node_2: sig2,
      sig_node_3: sig3,
      event_ts: eventTs
    };

    const { error: dbError } = await supabase.from('coordination_records').insert([dbRecord]);
    
    if (dbError) {
      console.error("Ledger insertion error:", dbError);
      return res.status(500).json({ error: 'Failed to write to immutable ledger.' });
    }

    // 7. Return the Proof Bundle to the Bank (in < 100ms)
    res.json({
      bundle_id,
      event: { event_id, institution_a, institution_b, event_type, tx_ref_hash, timestamp: eventTs },
      chain_hash,
      prev_hash,
      signatures: validSignatures.map(s => s.signature),
      issued_at: Date.now(),
      status: 'Quorum Reached (2+ of 3)'
    });

  } catch (error) {
    console.error("Gateway /v1/events error:", error);
    res.status(500).json({ error: 'Internal server error processing event.' });
  }
});

module.exports = router;
