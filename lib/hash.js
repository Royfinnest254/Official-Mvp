const crypto = require('crypto');

/**
 * Deterministic JSON stringify to ensure consistent hashes.
 * Sorts object keys recursively.
 */
function stableStringify(obj) {
    if (obj === null || typeof obj !== 'object') {
        return JSON.stringify(obj);
    }
    if (Array.isArray(obj)) {
        return '[' + obj.map(stableStringify).join(',') + ']';
    }
    const keys = Object.keys(obj).sort();
    return '{' + keys.map(k => `"${k}":${stableStringify(obj[k])}`).join(',') + '}';
}

/**
 * Generates a SHA-256 hash of the block content and previous hash.
 * @param {Object} payload - The block payload (amount, currency, fromBank, toBank)
 * @param {string} prevHash - The hash of the previous block
 * @returns {string} - The SHA-256 hash in hex format
 */
function hashBlock(payload, prevHash) {
  const data = stableStringify({ payload, prevHash });
  return crypto.createHash('sha256').update(data).digest('hex');
}

module.exports = { hashBlock };
