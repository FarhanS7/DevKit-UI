import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, vi } from 'vitest';

import { Select } from './Select.js';

expect.extend(toHaveNoViolations);

const sampleOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'orange', label: 'Orange' },
];

describe('Select Component', () => {
  it('renders trigger with placeholder initially', () => {
    render(<Select options={sampleOptions} placeholder="Choose a fruit" label="Fruit" />);
    expect(screen.getByRole('button', { name: /Fruit/i })).toBeInTheDocument();
    expect(screen.getByText('Choose a fruit')).toBeInTheDocument();
  });

  it('renders active option label when defaultValue is provided', () => {
    render(<Select options={sampleOptions} defaultValue="banana" label="Fruit" />);
    expect(screen.getByRole('button', { name: /Fruit/i })).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('calls onValueChange when an option is selected', () => {
    const handleValueChange = vi.fn();
    render(<Select options={sampleOptions} onValueChange={handleValueChange} label="Fruit" />);

    const trigger = screen.getByRole('button', { name: /Fruit/i });
    fireEvent.click(trigger);

    const option = screen.getByRole('button', { name: 'Orange' });
    fireEvent.click(option);

    expect(handleValueChange).toHaveBeenCalledWith('orange');
  });

  it('passes axe-core accessibility audit', async () => {
    const { container } = render(
      <Select options={sampleOptions} defaultValue="apple" label="Select Fruit" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
