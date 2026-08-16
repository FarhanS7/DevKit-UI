import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, vi } from 'vitest';

import { Combobox } from './Combobox.js';

expect.extend(toHaveNoViolations);

const sampleOptions = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
];

describe('Combobox Component', () => {
  it('renders trigger button correctly', () => {
    render(<Combobox options={sampleOptions} placeholder="Select framework" label="Framework" />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Framework')).toBeInTheDocument();
  });

  it('filters options based on search input', () => {
    render(<Combobox options={sampleOptions} placeholder="Select framework" label="Framework" />);

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 're' } });

    expect(screen.getByRole('option', { name: 'React' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Vue' })).not.toBeInTheDocument();
  });

  it('calls onValueChange when an option is selected', () => {
    const handleValueChange = vi.fn();
    render(
      <Combobox options={sampleOptions} onValueChange={handleValueChange} label="Framework" />
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    const option = screen.getByRole('option', { name: 'Svelte' });
    fireEvent.click(option);

    expect(handleValueChange).toHaveBeenCalledWith('svelte');
  });

  it('passes axe-core accessibility audit', async () => {
    const { container } = render(
      <Combobox options={sampleOptions} defaultValue="react" label="Choose Framework" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
