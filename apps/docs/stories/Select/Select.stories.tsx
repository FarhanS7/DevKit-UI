import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Select } from '@devkit-ui/core';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Select>;

const options = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'au', label: 'Australia' },
  { value: 'de', label: 'Germany' },
];

export const Default: Story = {
  args: {
    options,
    label: 'Select Country',
    placeholder: 'Choose country...',
  },
};

const ControlledSelectDemo = () => {
  const [val, setVal] = useState('ca');
  return (
    <div className="flex flex-col gap-3 max-w-xs">
      <Select options={options} value={val} onValueChange={setVal} label="Country (Controlled)" />
      <p className="text-xs text-slate-500">Selected value: {val}</p>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledSelectDemo />,
};

export const Disabled: Story = {
  args: {
    options,
    label: 'Disabled Select',
    defaultValue: 'us',
    disabled: true,
  },
};
