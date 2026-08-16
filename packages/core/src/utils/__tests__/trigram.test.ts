import { describe, it, expect } from 'vitest';

import { trigramSimilarity } from '../trigram.js';

describe('trigramSimilarity', () => {
  it('returns 1.0 for exact substring matches', () => {
    expect(trigramSimilarity('button', 'Button Component')).toBe(1.0);
    expect(trigramSimilarity('Button', 'Button')).toBe(1.0);
  });

  it('calculates fuzzy match score for minor typos', () => {
    const typoScore = trigramSimilarity('butn', 'Button');
    expect(typoScore).toBeGreaterThan(0.1);
  });

  it('returns 0 for empty inputs or completely unrelated strings', () => {
    expect(trigramSimilarity('', 'Button')).toBe(0);
    expect(trigramSimilarity('xyz', 'Button')).toBeLessThan(0.1);
  });
});
