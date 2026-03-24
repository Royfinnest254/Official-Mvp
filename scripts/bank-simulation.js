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
const TARGET_TPS = 800;

/**
 * Generate a random coordination event
 */
function generateEvent() {
  const isBankA = Math.random() > 0.5;
  return {
    institution_a: isBankA ? 'BANK_A_KE' : 'BANK_B_KE',
    institution_b: isBankA ? 'BANK_B_KE' : 'BANK_A_KE',
    event_type: 'CONFIRM',
    tx_ref_hash: crypto.randomBytes(32).toString('hex'), // SHA-256 simulation
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
    // Log occasionally to show it's working without flooding console
    if (Math.random() < 0.01) {
      console.log(`[BANK] Sent Tx: ${event.tx_ref_hash.substring(0, 8)}... Result: ${response.status}`);
    }
  } catch (error) {
    if (Math.random() < 0.01) {
      console.error(`[BANK] Error sending event: ${error.message}`);
    }
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

if (!API_KEY) {
  console.error('ERROR: API_KEY must be set in .env');
  process.exit(1);
}

runSimulation();
