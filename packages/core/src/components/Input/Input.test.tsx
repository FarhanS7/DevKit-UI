import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { axe } from 'jest-axe';
import * as React from 'react';

import { Input } from './Input.js';

describe('Input component', () => {
  it('renders correctly with default props', () => {
    const { getByRole } = render(<Input aria-label="Test input" />);
    const input = getByRole('textbox');
    expect(input.tagName).toBe('INPUT');
    expect(input.getAttribute('type')).toBe('text');
  });

  it('renders label and links it to the input', () => {
    const { getByLabelText } = render(<Input label="First Name" id="first-name" />);
    // getByLabelText internally checks that htmlFor matches the input's id
    const input = getByLabelText('First Name');
    expect(input.id).toBe('first-name');
  });

  it('auto-generates an ID if none is provided', () => {
    const { getByLabelText } = render(<Input label="Last Name" />);
    const input = getByLabelText('Last Name');
    expect(input.id).toBeDefined();
    expect(input.id.length).toBeGreaterThan(0);
  });

  it('renders helper text and links via aria-describedby', () => {
    const { getByRole, getByText } = render(
      <Input aria-label="Email" helperText="We will not spam you." />
    );
    const input = getByRole('textbox');
    const helper = getByText('We will not spam you.');

    expect(input.getAttribute('aria-describedby')).toBe(helper.id);
  });

  it('renders error message, links it, and applies aria-invalid', () => {
    const { getByRole, getByText, queryByText } = render(
      <Input aria-label="Email" helperText="Helper" errorMessage="Invalid email address" />
    );
    const input = getByRole('textbox');
    const error = getByText('Invalid email address');

    // When error is present, helper text should not be rendered
    expect(queryByText('Helper')).toBeNull();

    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(error.id);
    expect(input.className).toContain('border-[var(--color-status-error)]');
  });

  it('allows typing and triggers onChange', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const { getByRole } = render(<Input aria-label="Name" onChange={handleChange} />);
    const input = getByRole('textbox');

    await user.type(input, 'Hello');
    expect(handleChange).toHaveBeenCalled();
    expect((input as HTMLInputElement).value).toBe('Hello');
  });

  it('applies different size classes', () => {
    const { container: containerSm } = render(<Input size="sm" aria-label="Small" />);
    const { container: containerLg } = render(<Input size="lg" aria-label="Large" />);

    const inputSm = containerSm.querySelector('input');
    const inputLg = containerLg.querySelector('input');

    expect(inputSm?.className).toContain('h-8');
    expect(inputLg?.className).toContain('h-12');
  });

  it('has zero accessibility violations without label (with aria-label)', async () => {
    const { container } = render(<Input aria-label="Accessible input" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has zero accessibility violations with label and helper', async () => {
    const { container } = render(<Input label="Username" helperText="Pick a good one" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has zero accessibility violations with error state', async () => {
    const { container } = render(<Input label="Email" errorMessage="Email is required" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
