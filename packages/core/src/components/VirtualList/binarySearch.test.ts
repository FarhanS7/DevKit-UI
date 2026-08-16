import { describe, it, expect } from 'vitest';

import { binarySearchVisibleIndex } from './binarySearch.js';

describe('binarySearchVisibleIndex', () => {
  it('returns 0 for empty array', () => {
    expect(binarySearchVisibleIndex([], 100)).toBe(0);
  });

  it('finds correct index in cumulative heights array', () => {
    // Heights of 50px each: cumulative = [50, 100, 150, 200, 250]
    const cumulative = [50, 100, 150, 200, 250];

    expect(binarySearchVisibleIndex(cumulative, 0)).toBe(0);
    expect(binarySearchVisibleIndex(cumulative, 40)).toBe(0);
    expect(binarySearchVisibleIndex(cumulative, 50)).toBe(0);
    expect(binarySearchVisibleIndex(cumulative, 51)).toBe(1);
    expect(binarySearchVisibleIndex(cumulative, 120)).toBe(2);
    expect(binarySearchVisibleIndex(cumulative, 240)).toBe(4);
  });

  it('handles target beyond maximum cumulative height', () => {
    const cumulative = [50, 100, 150];
    expect(binarySearchVisibleIndex(cumulative, 500)).toBe(2);
  });
});
