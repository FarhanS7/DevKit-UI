import * as React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';

import { Checkbox } from './Checkbox.js';

expect.extend(toHaveNoViolations);

describe('Checkbox Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders unchecked by default', () => {
    render(<Checkbox label="Accept Terms" />);

    const checkbox = screen.getByRole('checkbox', { name: 'Accept Terms' });
    expect(checkbox.getAttribute('aria-checked')).toBe('false');
  });

  it('toggles checked state when clicked in uncontrolled mode', async () => {
    const user = userEvent.setup();
    const handleCheckedChange = vi.fn();
    render(<Checkbox label="Accept Terms" onCheckedChange={handleCheckedChange} />);

    const checkbox = screen.getByRole('checkbox', { name: 'Accept Terms' });
    expect(checkbox.getAttribute('aria-checked')).toBe('false');

    await user.click(checkbox);
    expect(checkbox.getAttribute('aria-checked')).toBe('true');
    expect(handleCheckedChange).toHaveBeenCalledWith(true);

    await user.click(checkbox);
    expect(checkbox.getAttribute('aria-checked')).toBe('false');
    expect(handleCheckedChange).toHaveBeenCalledWith(false);
  });

  it('handles indeterminate state correctly', async () => {
    const user = userEvent.setup();
    const handleCheckedChange = vi.fn();
    render(
      <Checkbox label="Select All" checked="indeterminate" onCheckedChange={handleCheckedChange} />
    );

    const checkbox = screen.getByRole('checkbox', { name: 'Select All' });
    expect(checkbox.getAttribute('aria-checked')).toBe('mixed');

    // Clicking indeterminate checkbox transitions to checked (true)
    await user.click(checkbox);
    expect(handleCheckedChange).toHaveBeenCalledWith(true);
  });

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup();
    const handleCheckedChange = vi.fn();
    render(<Checkbox label="Disabled Item" disabled onCheckedChange={handleCheckedChange} />);

    const checkbox = screen.getByRole('checkbox', { name: 'Disabled Item' });
    expect(checkbox.getAttribute('aria-disabled')).toBe('true');

    await user.click(checkbox);
    expect(handleCheckedChange).not.toHaveBeenCalled();
    expect(checkbox.getAttribute('aria-checked')).toBe('false');
  });

  it('passes axe-core accessibility check with zero violations', async () => {
    const { container } = render(<Checkbox label="Accessible Checkbox" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
