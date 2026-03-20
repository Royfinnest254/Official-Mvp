require('dotenv').config();

const API_URL = `http://localhost:${process.env.PORT || 3000}`;
const API_KEY = process.env.API_KEY;

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': API_KEY
};

async function runDemo() {
  console.log('--- STARTING CONNEX DEMO ---');

  // Step 1: Check health
  console.log('\nStep 1: Checking health...');
  const healthRes = await fetch(`${API_URL}/health`);
  const healthData = await healthRes.json();
  console.log('Result:', healthData);

  // Step 2: POST an event
  console.log('\nStep 2: Recording payment from KCB (KE) to Stanbic (UG)...');
  const postRes = await fetch(`${API_URL}/events`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      txId: 'TXN_KE_UG_001',
      amount: 50000,
      currency: 'KES',
      fromBank: 'KCB_KE',
      toBank: 'STANBIC_UG',
      status: 'PENDING'
    })
  });
  const postData = await postRes.json();
  console.log('Result:', postData);
  const blockId = postData.blockId;

  // Step 3: GET the block
  console.log('\nStep 3: Verifying witness signatures on the block...');
  const blockRes = await fetch(`${API_URL}/chain/${blockId}`, { headers });
  const blockData = await blockRes.json();
  console.log('Witnesses:', blockData.block.signatures.map(s => s.witness));
  console.log('Signature Count:', blockData.block.signatures.length);

  // Step 4: Inject a dispute
  console.log('\nStep 4: Simulating Verification Gap (Injecting Dispute)...');
  const patchRes = await fetch(`${API_URL}/events/TXN_KE_UG_001/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      status: 'DISPUTED',
      reason: 'Recipient bank reports non-receipt'
    })
  });
  const patchData = await patchRes.json();
  console.log('Result:', patchData);

  // Step 5: Run chain verification
  console.log('\nStep 5: Verifying global chain integrity...');
  const verifyRes = await fetch(`${API_URL}/chain/verify`, { headers });
  const verifyData = await verifyRes.json();
  console.log('Result:', verifyData);

  // Step 6: Show transaction history
  console.log('\nStep 6: Displaying full evidence trail for TXN_KE_UG_001...');
  const txRes = await fetch(`${API_URL}/tx/TXN_KE_UG_001`, { headers });
  const txData = await txRes.json();
  console.log('History:', txData.events.map(e => ({ status: e.status, hash: e.block_hash.substring(0, 10) + '...' })));

  console.log('\n--- DEMO COMPLETE ---');
}

runDemo().catch(err => {
  console.error('Demo failed:', err.message);
  process.exit(1);
});
