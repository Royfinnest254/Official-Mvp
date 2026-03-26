require('dotenv').config();

const API_URL = `http://localhost:${process.env.PORT || 3001}`;
const API_KEY = process.env.API_KEY || 'connex_secret_mvp_2026';

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': API_KEY
};

async function runDemo() {
  console.log('--- STARTING CCTV 2.0 EVIDENCE AUDIT DEMO ---');

  try {
    // 1. Capture a new settlement observation
    const traceId = `UETR-${crypto.randomUUID().toUpperCase()}`;
    console.log(`\nStep 1: Vaulting ISO 20022 Payload (${traceId})...`);
    const auditRes = await fetch(`${API_URL}/observations`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        txId: traceId,
        amount: Math.floor(Math.random() * 50000) + 10000,
        currency: 'KES',
        fromBank: 'KCB_NRE_HQ',
        toBank: 'EQUITY_HQ_MSA',
        status: 'SEALED',
        metadata: {
          endToEndId: `REF-${Math.floor(Math.random() * 999999)}`,
          instructionId: `INS-${Math.floor(Math.random() * 999999)}`,
          purposeCode: 'SALA',
          clearingSystem: 'KEPS'
        }
      })
    });
    const auditData = await auditRes.json();
    console.log('✅ Evidence captured and synced to quorum.');

    // 2. Fetch the Evidence Vault
    console.log('\nStep 2: Syncing with Evidence Vault...');
    const vaultRes = await fetch(`${API_URL}/vault`, { headers });
    const vaultData = await vaultRes.json();
    console.log(`✅ Vault sync complete. Total traces recorded: ${vaultData.total_traces}`);

    // 3. Verify Vault Integrity
    console.log('\nStep 3: Verifying Vault Cryptographic Integrity...');
    const verifyRes = await fetch(`${API_URL}/vault/verify`, { headers });
    const verifyData = await verifyRes.json();
    console.log(`✅ Vault Integrity: ${verifyData.valid ? 'SECURE' : 'COMPROMISED'}`);

    if (vaultData.blocks.length > 0) {
      const latestTrace = vaultData.blocks[0];
      console.log(`\n--- Latest Audit Trace Details ---`);
      console.log(`ID: ${latestTrace.tx_id}`);
      console.log(`Value: ${latestTrace.payload.amount} ${latestTrace.payload.currency}`);
      console.log(`Hash: ${latestTrace.block_hash.substring(0, 32)}...`);
      console.log(`Signatures: ${latestTrace.signatures.map(s => s.witness).join(', ')}`);
    }

    console.log('\n--- DEMO COMPLETE ---');
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    process.exit(1);
  }
}

runDemo();
