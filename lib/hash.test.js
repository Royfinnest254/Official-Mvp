const { hashBlock } = require('./hash');

describe('hashBlock', () => {
  const txRefHash = 'test_tx_123';
  const insA = 'BANK_A';
  const insB = 'BANK_B';
  const prevHash = '0'.repeat(64);
  const ts = 1620000000000;

  test('generates a consistent SHA-256 hash', () => {
    const hash1 = hashBlock(txRefHash, insA, insB, prevHash, ts);
    const hash2 = hashBlock(txRefHash, insA, insB, prevHash, ts);
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
    expect(hash1).toMatch(/^[a-f0-9]{64}$/);
  });

  test('changing any parameter changes the hash', () => {
    const baseHash = hashBlock(txRefHash, insA, insB, prevHash, ts);
    
    expect(hashBlock('changed', insA, insB, prevHash, ts)).not.toBe(baseHash);
    expect(hashBlock(txRefHash, 'changed', insB, prevHash, ts)).not.toBe(baseHash);
    expect(hashBlock(txRefHash, insA, 'changed', prevHash, ts)).not.toBe(baseHash);
    expect(hashBlock(txRefHash, insA, insB, '1'.repeat(64), ts)).not.toBe(baseHash);
    expect(hashBlock(txRefHash, insA, insB, prevHash, ts + 1)).not.toBe(baseHash);
  });

  test('includes all fields in the hash computation', () => {
    // This test ensures that fields aren't ignored
    const h1 = hashBlock('A', 'B', 'C', 'D', 'E');
    const h2 = hashBlock('AB', '', 'C', 'D', 'E');
    // Even if concatenated values are similar, order and presence matter
    // (Note: Currently hashBlock just concatenates, which might have collisions 
    // if not careful, e.g. "A"+"B" vs "AB"+"". A better impl uses delimiters.)
    expect(h1).not.toBe(h2); 
  });
});
