const ed = require('@noble/ed25519');

async function generate() {
  const witnesses = ['CBK', 'BoU', 'IFC'];
  const keys = {};

  for (const name of witnesses) {
    const privKey = ed.utils.randomPrivateKey();
    const pubKey = await ed.getPublicKey(privKey);
    keys[name] = {
      PRIVATE: Buffer.from(privKey).toString('base64'),
      PUBLIC: Buffer.from(pubKey).toString('base64'),
    };
  }

  console.log('Witness Keys Generated:\n');
  witnesses.forEach(name => {
    console.log(`--- ${name} ---`);
    console.log(`PRIVATE: ${keys[name].PRIVATE}`);
    console.log(`PUBLIC: ${keys[name].PUBLIC}\n`);
  });

  console.log('IMPORTANT: Save the PRIVATE keys in your Render/Supabase environment variables.');
  console.log('The PUBLIC keys should be seeded into the witnesses table.');
}

generate().catch(console.error);