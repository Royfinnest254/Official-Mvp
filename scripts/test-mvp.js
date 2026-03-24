const axios = require('axios');

async function runTests() {
  const headers = {
    'x-api-key': 'connex_secret_mvp_2026',
    'Content-Type': 'application/json'
  };

  try {
    console.log('--- 1. POST /observations ---');
    const postRes = await axios.post('http://localhost:3001/observations', {
      txId: 'TX-MVP-999',
      amount: 5000,
      currency: 'KES',
      fromBank: 'KCB',
      toBank: 'Safaricom',
      status: 'INITIATE'
    }, { headers });
    
    console.log('Observation Response:');
    console.log(JSON.stringify(postRes.data, null, 2));

    console.log('\n--- 2. GET /vault/verify ---');
    const verifyRes = await axios.get('http://localhost:3001/vault/verify', { headers });
    console.log('Verify Response:');
    console.log(JSON.stringify(verifyRes.data, null, 2));

  } catch (error) {
    console.error('Test Failed!');
    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
  } finally {
    process.exit(0);
  }
}

runTests();
