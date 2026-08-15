import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';

import { Accordion } from './Accordion.js';

expect.extend(toHaveNoViolations);

function TestAccordion({
  type = 'single',
  defaultValue = [],
}: {
  type?: 'single' | 'multiple';
  defaultValue?: string[];
}) {
  return (
    <Accordion type={type} defaultValue={defaultValue}>
      <Accordion.Item value="item-1">
        <Accordion.Trigger asHeading="h3">Is it accessible?</Accordion.Trigger>
        <Accordion.Content>Yes. It adheres to the WAI-ARIA design pattern.</Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="item-2">
        <Accordion.Trigger asHeading="h3">Is it unstyled?</Accordion.Trigger>
        <Accordion.Content>
          No. It uses design tokens and Tailwind utility classes.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}

describe('Accordion Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders collapsed by default when defaultValue is empty', () => {
    render(<TestAccordion />);

    const trigger1 = screen.getByRole('button', { name: 'Is it accessible?' });
    expect(trigger1.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText(/It adheres to the WAI-ARIA/i)).toBeNull();
  });

  it('expands item content when trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<TestAccordion />);

    const trigger1 = screen.getByRole('button', { name: 'Is it accessible?' });
    await user.click(trigger1);

    expect(trigger1.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText(/It adheres to the WAI-ARIA/i)).toBeDefined();
  });

  it('closes previous item when new item is opened in single mode', async () => {
    const user = userEvent.setup();
    render(<TestAccordion type="single" defaultValue={['item-1']} />);

    const trigger1 = screen.getByRole('button', { name: 'Is it accessible?' });
    const trigger2 = screen.getByRole('button', { name: 'Is it unstyled?' });

    expect(trigger1.getAttribute('aria-expanded')).toBe('true');

    await user.click(trigger2);

    expect(trigger1.getAttribute('aria-expanded')).toBe('false');
    expect(trigger2.getAttribute('aria-expanded')).toBe('true');
  });

  it('allows multiple open items in multiple mode', async () => {
    const user = userEvent.setup();
    render(<TestAccordion type="multiple" defaultValue={['item-1']} />);

    const trigger1 = screen.getByRole('button', { name: 'Is it accessible?' });
    const trigger2 = screen.getByRole('button', { name: 'Is it unstyled?' });

    await user.click(trigger2);

    expect(trigger1.getAttribute('aria-expanded')).toBe('true');
    expect(trigger2.getAttribute('aria-expanded')).toBe('true');
  });

  it('passes axe-core accessibility check with zero violations when open', async () => {
    const { container } = render(<TestAccordion defaultValue={['item-1']} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
