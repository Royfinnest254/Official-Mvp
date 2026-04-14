const crypto = require('crypto');

/**
 * Generates a SHA-256 hash of the coordination event and previous hash.
 * @param {string} txRefHash - The transaction reference hash
 * @param {string} institution_a - Origin institution
 * @param {string} institution_b - Destination institution
 * @param {string} prevHash - The hash of the previous block
 * @param {number|string} ts - The timestamp
 * @returns {string} - The SHA-256 hash in hex format
 */
function hashBlock(txRefHash, institution_a, institution_b, prevHash, ts) {
  // Use a canonical object structure to ensure consistency across Go and JS.
  const payload = {
    institution_a,
    institution_b,
    prev_hash: prevHash,
    timestamp: ts,
    tx_ref_hash: txRefHash
  };
  const data = JSON.stringify(payload);
  return crypto.createHash('sha256').update(data).digest('hex');
}

module.exports = { hashBlock };
