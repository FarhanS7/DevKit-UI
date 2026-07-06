import { describe, expect, it } from 'vitest';

import { cn } from '../cn.js';

describe('cn utility', () => {
  it('merges tailwind classes deterministically', () => {
    // Basic merge where the latter overrides the former
    expect(cn('px-2 py-1', 'p-4')).toBe('p-4');
  });

  it('handles conditional classes properly via clsx', () => {
    const isTrue = true;
    const isFalse = false;

    expect(cn('text-sm', isTrue && 'font-bold', isFalse && 'hidden')).toBe('text-sm font-bold');
  });

  it('resolves complex conflicts deterministically', () => {
    expect(cn('bg-red-500 text-white', 'bg-blue-500', { 'text-black': true })).toBe(
      'bg-blue-500 text-black'
    );
  });

  it('ignores null, undefined, and false values', () => {
    expect(cn('base-class', null, undefined, false, 'active-class')).toBe(
      'base-class active-class'
    );
  });
});
