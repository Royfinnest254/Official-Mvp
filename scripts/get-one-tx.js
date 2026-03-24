require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

const GATEWAY_URL = process.env.GATEWAY_URL || 'https://official-mvp.onrender.com/v1/events';
const API_KEY = process.env.API_KEY;

async function getOneTx() {
  const event = {
    institution_a: 'BANK_A_KE',
    institution_b: 'BANK_B_KE',
    event_type: 'CONFIRM',
    tx_ref_hash: 'OQX' + Math.floor(Math.random() * 1000000).toString(),
    timestamp: Date.now(),
    account_info: {
      sender: 'DISPUTE_TEST_SENDER',
      receiver: 'DISPUTE_TEST_RECEIVER',
      amount: '500.00'
    }
  };

  try {
    console.log('Sending test transaction to Gateway...');
    const response = await axios.post(GATEWAY_URL, event, {
      headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' }
    });
    
    console.log('\n--- TRANSACTION SUCCESSFUL ---');
    console.log('COPY THIS HASH TO THE PORTAL:');
    console.log(event.tx_ref_hash);
    console.log('-------------------------------\n');
    console.log('Gateway Response Status:', response.status);
    console.log('Proof Bundle ID:', response.data.bundle_id);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

getOneTx();
