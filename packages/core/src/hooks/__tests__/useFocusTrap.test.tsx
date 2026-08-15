import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { useFocusTrap } from '../useFocusTrap.js';

function TestComponent({ isActive }: { isActive: boolean }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  useFocusTrap(containerRef, isActive);

  return (
    <div>
      <button id="outside-trigger">Outside Button</button>
      <div ref={containerRef} tabIndex={-1} data-testid="trap-container">
        <button id="inside-1">First Inside</button>
        <input id="inside-2" type="text" placeholder="Second Inside" />
        <button id="inside-3">Third Inside</button>
      </div>
    </div>
  );
}

function EmptyTestComponent({ isActive }: { isActive: boolean }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  useFocusTrap(containerRef, isActive);

  return (
    <div>
      <button id="outside-trigger">Outside Button</button>
      <div ref={containerRef} tabIndex={-1} data-testid="empty-container">
        <span>No focusable elements</span>
      </div>
    </div>
  );
}

describe('useFocusTrap', () => {
  afterEach(() => {
    cleanup();
  });

  it('moves focus to the first focusable element inside container on activation', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<TestComponent isActive={false} />);

    const trigger = screen.getByRole('button', { name: 'Outside Button' });
    await user.click(trigger);
    expect(document.activeElement).toBe(trigger);

    rerender(<TestComponent isActive={true} />);

    const firstInside = screen.getByRole('button', { name: 'First Inside' });
    expect(document.activeElement).toBe(firstInside);
  });

  it('wraps focus from last element to first element on Tab', async () => {
    const user = userEvent.setup();
    render(<TestComponent isActive={true} />);

    const firstInside = screen.getByRole('button', { name: 'First Inside' });
    const lastInside = screen.getByRole('button', { name: 'Third Inside' });

    expect(document.activeElement).toBe(firstInside);

    await user.tab();
    expect(document.activeElement).toBe(screen.getByPlaceholderText('Second Inside'));

    await user.tab();
    expect(document.activeElement).toBe(lastInside);

    // Tab from last element should wrap back to first
    await user.tab();
    expect(document.activeElement).toBe(firstInside);
  });

  it('wraps focus from first element to last element on Shift+Tab', async () => {
    const user = userEvent.setup();
    render(<TestComponent isActive={true} />);

    const firstInside = screen.getByRole('button', { name: 'First Inside' });
    const lastInside = screen.getByRole('button', { name: 'Third Inside' });

    expect(document.activeElement).toBe(firstInside);

    // Shift+Tab from first element should wrap to last element
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(lastInside);
  });

  it('restores focus to previously active element on unmount/deactivation', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<TestComponent isActive={false} />);

    const trigger = screen.getByRole('button', { name: 'Outside Button' });
    await user.click(trigger);
    expect(document.activeElement).toBe(trigger);

    rerender(<TestComponent isActive={true} />);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'First Inside' }));

    rerender(<TestComponent isActive={false} />);
    expect(document.activeElement).toBe(trigger);
  });

  it('handles empty containers without throwing or leaking focus', async () => {
    const user = userEvent.setup();
    render(<EmptyTestComponent isActive={true} />);

    const emptyContainer = screen.getByTestId('empty-container');
    expect(document.activeElement).toBe(emptyContainer);

    await user.tab();
    // Focus should remain intercepted and not jump outside
    expect(document.activeElement).toBe(emptyContainer);
  });
});
