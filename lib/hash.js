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
  const data = txRefHash.trim() + institution_a + institution_b + prevHash + ts;
  return crypto.createHash('sha256').update(data).digest('hex');
}

module.exports = { hashBlock };
