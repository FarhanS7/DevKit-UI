import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Combobox } from '@devkit-ui/core';

const meta: Meta<typeof Combobox> = {
  title: 'Components/Combobox',
  component: Combobox,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Combobox>;

const frameworks = [
  { value: 'next', label: 'Next.js' },
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue.js' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'astro', label: 'Astro' },
  { value: 'nuxt', label: 'Nuxt' },
];

export const Default: Story = {
  args: {
    options: frameworks,
    label: 'Select Framework',
    placeholder: 'Search framework...',
  },
};

const ControlledComboboxDemo = () => {
  const [val, setVal] = useState('react');
  return (
    <div className="flex flex-col gap-3 max-w-xs">
      <Combobox
        options={frameworks}
        value={val}
        onValueChange={setVal}
        label="Framework (Controlled Search)"
      />
      <p className="text-xs text-slate-500">Selected value: {val}</p>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledComboboxDemo />,
};
