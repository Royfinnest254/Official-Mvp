const axios = require('axios');
require('dotenv').config();

const urls = [
  process.env.NODE_1_URL,
  process.env.NODE_2_URL,
  process.env.NODE_3_URL
];

async function testNodes() {
  for (let i = 0; i < urls.length; i++) {
    try {
      const url = urls[i];
      if (!url) {
        console.log(`Node ${i+1} URL missing!`);
        continue;
      }
      console.log(`Pinging Node ${i+1}: ${url}`);
      
      const res = await axios.post(url, { hash: 'a3f4d2' }, { timeout: 10000 });
      console.log(`Node ${i+1} Success! Signature: ${res.data.signature.substring(0, 15)}...`);
    } catch (e) {
      console.log(`Node ${i+1} Failed: ${e.response?.data?.error || e.message}`);
    }
  }
}

testNodes();
