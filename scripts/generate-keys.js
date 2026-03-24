const ed = require('@noble/ed25519');

/**
 * Connex Trust Anchor Key Generation
 * This script generates the Ed25519 key pairs for the 3 witness nodes
 * as specified in the Connex PRD (AWS, GCP, Azure).
 */
async function generate() {
  const nodes = [
    { id: 1, name: 'NODE_1_AWS', region: 'eu-west-1' },
    { id: 2, name: 'NODE_2_GCP', region: 'africa-south1' },
    { id: 3, name: 'NODE_3_AZURE', region: 'east-africa' }
  ];

  console.log('\n--- CONNEX KEY GENERATION (PHASE 1) ---');
  console.log('Generating keys for 3 independent witness nodes...\n');

  for (const node of nodes) {
    const privKey = ed.utils.randomPrivateKey();
    const pubKey = await ed.getPublicKey(privKey);
    
    const privHex = Buffer.from(privKey).toString('hex');
    const pubHex = Buffer.from(pubKey).toString('hex');

    console.log(`[${node.name} (${node.region})]`);
    console.log(`PRIVATE_KEY: ${privHex}`);
    console.log(`PUBLIC_KEY:  ${pubHex}\n`);
  }

  console.log('----------------------------------------');
  console.log('NEXT STEPS:');
  console.log('1. Copy each PRIVATE_KEY into your .env file.');
  console.log('2. The PUBLIC_KEYs will be used for stateless verification.');
  console.log('3. Ensure these keys are NEVER shared or checked into Git.');
}

generate().catch(console.error);