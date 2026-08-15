import * as React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';

import { useScrollLock } from '../useScrollLock.js';

function TestComponent({ lock }: { lock: boolean }) {
  useScrollLock(lock);
  return <div data-testid="scroll-lock-test">Scroll Lock Test</div>;
}

describe('useScrollLock', () => {
  beforeEach(() => {
    // Reset body inline styles
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.paddingRight = '';
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('applies scroll lock styles when active', () => {
    render(<TestComponent lock={true} />);

    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.width).toBe('100%');
  });

  it('restores original body styles when lock is set to false', () => {
    document.body.style.overflow = 'auto';
    const { rerender } = render(<TestComponent lock={true} />);

    expect(document.body.style.overflow).toBe('hidden');

    rerender(<TestComponent lock={false} />);

    expect(document.body.style.overflow).toBe('auto');
    expect(document.body.style.position).toBe('');
    expect(window.scrollTo).toHaveBeenCalled();
  });

  it('restores original body styles on unmount', () => {
    const { unmount } = render(<TestComponent lock={true} />);

    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('');
    expect(document.body.style.position).toBe('');
  });
});
