const axios = require('axios');

const NODE_URL = 'https://connex-node-1-production.up.railway.app/sign';
const TEST_HASH = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

async function testNode() {
  console.log(`Testing Node at: ${NODE_URL}`);
  try {
    const response = await axios.post(NODE_URL, { hash: TEST_HASH }, { timeout: 10000 });
    console.log('✅ SIGNATURE OBTAINED:', response.data.signature);
  } catch (error) {
    console.error('❌ NODE ERROR:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(`Message: ${error.message}`);
    }
  }
}

testNode();
