import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect } from 'vitest';

import { CommandPalette } from './CommandPalette.js';

expect.extend(toHaveNoViolations);

const sampleCommands = [
  { value: 'btn', label: 'Button Component', category: 'Components' },
  { value: 'input', label: 'Input Field', category: 'Components' },
  { value: 'dialog', label: 'Dialog Modal', category: 'Overlays' },
];

describe('CommandPalette Component', () => {
  it('renders input and command options when open', () => {
    render(<CommandPalette open={true} onOpenChange={() => {}} items={sampleCommands} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Button Component')).toBeInTheDocument();
  });

  it('fuzzy matches typos like "butn" to "Button Component" using trigrams', () => {
    render(<CommandPalette open={true} onOpenChange={() => {}} items={sampleCommands} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'butn' } });

    expect(screen.getByText('Button Component')).toBeInTheDocument();
    expect(screen.queryByText('Dialog Modal')).not.toBeInTheDocument();
  });

  it('updates aria-activedescendant on arrow key navigation', () => {
    render(<CommandPalette open={true} onOpenChange={() => {}} items={sampleCommands} />);

    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    expect(input.getAttribute('aria-activedescendant')).toContain('-option-input');
  });

  it('passes axe-core accessibility audit when open', async () => {
    const { container } = render(
      <CommandPalette open={true} onOpenChange={() => {}} items={sampleCommands} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
