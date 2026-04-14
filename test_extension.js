const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:3000/v1/events';
const API_KEY = process.env.API_KEY || 'connex_secret_mvp_2026';

async function testTransaction() {
  console.log('--- Triggering Test Transaction to verify Continuity ---');
  try {
    const response = await axios.post(API_URL, {
      institution_a: 'TEST_BANK_LEGACY',
      institution_b: 'TEST_BANK_NEW',
      event_type: 'INITIATE',
      tx_ref_hash: 'TX-DAISY-CHAIN-' + Date.now(),
      timestamp: Date.now()
    }, {
      headers: { 'x-api-key': API_KEY }
    });

    console.log('Transaction Successful:', response.data);
    console.log('Waiting 2 seconds for sync...');
    await new Promise(r => setTimeout(r, 2000));

    // Now run verify_chain.js again via node
    const { execSync } = require('child_process');
    const output = execSync('node verify_chain.js').toString();
    console.log('\n--- Final Verification Output ---');
    console.log(output);

  } catch (err) {
    console.error('Test failed:', err.response ? err.response.data : err.message);
  }
}

testTransaction();
