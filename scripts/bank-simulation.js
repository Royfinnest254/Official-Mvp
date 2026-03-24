/**
 * Connex Bank Simulation (Bank A & Bank B)
 * Generates ~800 TPS of cross-institutional payment handoffs.
 * Each transaction calls the Connex Gateway Webhook.
 */
require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3001/v1/events';
const API_KEY = process.env.API_KEY;

// NOTE: Adjusted from 800 down to 5. 
// Free-tier cloud services (like Render) immediately rate-limit or crash 
// if you send 800 requests per second to them.
const TARGET_TPS = 5;

let txCounter = 0;

/**
 * Generate a random coordination event
 */
function generateEvent() {
  const isBankA = Math.random() > 0.5;
  txCounter++;
  
  // Every 25th transaction (exactly every 5 seconds at 5 TPS) is a dispute
  const isDispute = (txCounter % 25 === 0);
  
  return {
    institution_a: isBankA ? 'BANK_A_KE' : 'BANK_B_KE',
    institution_b: isBankA ? 'BANK_B_KE' : 'BANK_A_KE',
    event_type: isDispute ? 'REJECT' : 'CONFIRM',
    tx_ref_hash: 'OQX' + Math.floor(Math.random() * 1000000).toString(),
    timestamp: Date.now(),
    account_info: {
      sender: `ACC-${Math.floor(Math.random() * 100000)}`,
      receiver: `ACC-${Math.floor(Math.random() * 100000)}`,
      amount: (Math.random() * 1000).toFixed(2)
    }
  };
}

/**
 * Send a single coordination event to Connex Gateway
 */
async function sendEvent() {
  const event = generateEvent();
  try {
    const response = await axios.post(GATEWAY_URL, event, {
      headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' }
    });
    // Log occasionally to show it's working
    if (event.event_type === 'REJECT') {
      console.log(`[DISPUTE INJECTED] Tx: ${event.tx_ref_hash} | Status: 200`);
    } else if (txCounter % 10 === 0) {
      console.log(`[BANK] Sent 10 Txs... Latest: ${event.tx_ref_hash}`);
    }
  } catch (error) {
    console.error(`[BANK] Error sending event: ${error.message}`);
  }
}

/**
 * High-Throughput Loop
 */
function runSimulation() {
  console.log(`--- Connex Bank Simulation Started ---`);
  console.log(`Target: ${TARGET_TPS} TPS | Gateway: ${GATEWAY_URL}`);

  const interval = 1000 / TARGET_TPS;
  
  setInterval(() => {
    sendEvent();
  }, interval);
}

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send({ status: 'simulation_active', tx_processed: txCounter });
});

app.listen(PORT, () => {
  console.log(`[SIM] Web interface live on port ${PORT}`);
  runSimulation();
});
