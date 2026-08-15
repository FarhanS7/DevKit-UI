import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { axe } from 'jest-axe';
import * as React from 'react';

import { Button } from './Button.js';

describe('Button component', () => {
  it('renders as a <button type="button"> by default', () => {
    const { container } = render(<Button>Click me</Button>);
    const el = container.firstChild as HTMLButtonElement;
    expect(el.tagName).toBe('BUTTON');
    expect(el.type).toBe('button');
    expect(el.textContent).toBe('Click me');
  });

  it('renders correctly with specific variant and size classes', () => {
    const { container } = render(
      <Button variant="ghost" size="lg">
        Ghost
      </Button>
    );
    const el = container.firstChild as HTMLButtonElement;
    expect(el.className).toContain('hover:bg-[var(--color-background-subtle)]');
    expect(el.className).toContain('h-12'); // size="lg"
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const { getByText } = render(<Button onClick={handleClick}>Trigger Click</Button>);

    await user.click(getByText('Trigger Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('prevents click events when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const { getByText } = render(
      <Button disabled onClick={handleClick}>
        Trigger Disabled
      </Button>
    );

    const btn = getByText('Trigger Disabled') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    await user.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders spinner and disables interactions when isLoading is true', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const { container, getByText } = render(
      <Button isLoading onClick={handleClick}>
        Loading...
      </Button>
    );

    const el = container.firstChild as HTMLButtonElement;
    expect(el.disabled).toBe(true);
    expect(el.getAttribute('aria-busy')).toBe('true');

    // Check spinner presence
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).not.toBeNull();

    await user.click(getByText('Loading...'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders as a custom element (polymorphic) using the "as" prop', () => {
    const { container } = render(
      <Button as="a" href="/test">
        Link Button
      </Button>
    );
    const el = container.firstChild as HTMLAnchorElement;
    expect(el.tagName).toBe('A');
    expect(el.href).toContain('/test');
    expect(el.getAttribute('type')).toBeNull(); // anchors shouldn't have type="button"
  });

  it('renders left and right icons correctly', () => {
    const { container } = render(
      <Button leftIcon={<span>Left</span>} rightIcon={<span>Right</span>}>
        Mid
      </Button>
    );
    expect(container.textContent).toBe('LeftMidRight');
  });

  it('has zero accessibility violations', async () => {
    const { container } = render(<Button aria-label="Accessible Button">Accessible</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has zero accessibility violations in loading state', async () => {
    const { container } = render(<Button isLoading>Loading</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
