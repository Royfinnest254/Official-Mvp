/**
 * Connex Witness Node Server (Multi-Deployment Ready)
 * Can be deployed to Render, Railway, Vercel, etc.
 * Responds to signing requests from the Connex Gateway.
 */
require('dotenv').config();
const express = require('express');
const ed = require('@noble/ed25519');

const app = express();
app.use(express.json());

const NODE_ID = process.env.NODE_ID || 1;
const PRIVATE_KEY = process.env.PRIVATE_KEY || process.env[`NODE_${NODE_ID}_PRIVATE_KEY`];
const PORT = process.env.PORT || (8000 + parseInt(NODE_ID));

if (!PRIVATE_KEY) {
  console.error(`ERROR: PRIVATE_KEY must be set in environment`);
  process.exit(1);
}

// Map Node ID to Cloud Name for Simulation Logs
const cloudMap = { 1: 'AWS', 2: 'GCP', 3: 'Azure' };
const cloudName = cloudMap[NODE_ID] || 'Experimental Node';

app.get('/', (req, res) => {
  res.json({ status: 'active', node: NODE_ID, cloud: cloudName, version: '0.1' });
});

app.post('/sign', async (req, res) => {
  const { hash } = req.body;
  
  if (!hash) {
    return res.status(400).json({ error: 'Missing hash to sign' });
  }

  try {
    const signature = await ed.sign(hash, PRIVATE_KEY);
    const pubKey = await ed.getPublicKey(PRIVATE_KEY);
    
    res.json({
      node_id: NODE_ID,
      signature: Buffer.from(signature).toString('hex'),
      public_key: Buffer.from(pubKey).toString('hex')
    });
  } catch (error) {
    res.status(500).json({ error: 'Signing failure' });
  }
});

app.listen(PORT, () => {
  console.log(`Connex Witness Node [${cloudName}] live on port ${PORT}`);
});
