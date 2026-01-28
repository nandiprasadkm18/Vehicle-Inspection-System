const crypto = require('crypto');

/**
 * Calculates the SHA-256 hash of a given data object or string.
 * @param {object|string} data - The data to hash.
 * @returns {string} - The hex string verification of the hash.
 */
function calculateHash(data) {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(str).digest('hex');
}

/**
 * Verifies if a given hash matches the data.
 * @param {object|string} data 
 * @param {string} hash 
 * @returns {boolean}
 */
function verifyHash(data, hash) {
  return calculateHash(data) === hash;
}

module.exports = {
  calculateHash,
  verifyHash
};
