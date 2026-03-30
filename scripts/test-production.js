const axios = require('axios');

const PROD_URL = 'https://official-mvp-production.up.railway.app/v1/events';
const API_KEY = 'connex_secret_mvp_2026';

async function testProduction() {
  console.log('--- CONNEX Production Test ---');
  console.log(`URL: ${PROD_URL}`);

  const testEvent = {
    institution_a: 'BANK_A_KE',
    institution_b: 'BANK_B_KE',
    event_type: 'CONFIRM',
    tx_ref_hash: 'TEST-' + Math.floor(Math.random() * 10000),
    timestamp: Date.now()
  };

  try {
    const response = await axios.post(PROD_URL, testEvent, {
      headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' }
    });

    console.log('\n✅ TEST SUCCESS!');
    console.log(`Bundle ID: ${response.data.bundle_id}`);
    console.log(`Status: ${response.data.status}`);
    console.log(`Signatures Obtained: ${response.data.signatures.length} of 3`);
    console.log('------------------------------');
  } catch (error) {
    console.error('\n❌ TEST FAILED!');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(`Message: ${error.message}`);
    }
    console.log('------------------------------');
  }
}

testProduction();
