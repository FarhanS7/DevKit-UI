import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';

import { Label } from './Label.js';

expect.extend(toHaveNoViolations);

describe('Label Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders children correctly', () => {
    render(<Label htmlFor="input-id">Username</Label>);
    const label = screen.getByText('Username');
    expect(label).toBeDefined();
    expect(label.getAttribute('for')).toBe('input-id');
  });

  it('focuses associated input when clicked', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Label htmlFor="input-id">Email</Label>
        <input id="input-id" type="email" />
      </div>
    );

    const label = screen.getByText('Email');
    await user.click(label);

    const input = screen.getByRole('textbox');
    expect(document.activeElement).toBe(input);
  });

  it('passes axe-core accessibility check with zero violations', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="test-input">Test Label</Label>
        <input id="test-input" type="text" />
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
