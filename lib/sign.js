const ed = require('@noble/ed25519');
const crypto = require('crypto');

// Set sha512 for noble-ed25519 v1.7.1 (already configured in node env)
// Note: In 1.7.1, it doesn't always need manual setting if crypto is available, 
// but we'll ensure it for stability.
if (!ed.utils.sha512) {
    ed.utils.sha512 = (...msgs) => {
        const hash = crypto.createHash('sha512');
        for (const m of msgs) hash.update(m);
        return hash.digest();
    };
}

/**
 * Signs a block hash with all three witness keys.
 * @param {string} blockHash - The hash of the block to sign
 * @returns {Promise<Array>} - Array of signature objects
 */
async function signBlock(blockHash) {
    const witnesses = [
        { id: 'CBK', display: 'Node 01' },
        { id: 'BoU', display: 'Node 02' },
        { id: 'IFC', display: 'Node 03' }
    ];
    
    return Promise.all(witnesses.map(async (w) => {
        const privKeyBase64 = process.env[`${w.id}_PRIVATE_KEY`];
        if (!privKeyBase64) throw new Error(`Missing private key for witness: ${w.id}`);
        
        const privKey = Buffer.from(privKeyBase64, 'base64');
        const pubKey = await ed.getPublicKey(privKey);
        const sig = await ed.sign(blockHash, privKey);
        
        return {
            witness: w.display,
            publicKey: Buffer.from(pubKey).toString('base64'),
            signature: Buffer.from(sig).toString('base64')
        };
    }));
}

module.exports = { signBlock };
