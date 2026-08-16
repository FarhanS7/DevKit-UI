import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from '@devkit-ui/core';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    label: 'Accept terms and conditions',
  },
};

const ControlledCheckboxDemo = () => {
  const [checked, setChecked] = useState<boolean | 'indeterminate'>(false);
  return (
    <div className="flex flex-col gap-3">
      <Checkbox
        checked={checked}
        onCheckedChange={setChecked}
        label={`Checkbox status: ${String(checked)}`}
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setChecked(true)}
          className="px-2 py-1 text-xs bg-blue-600 text-white rounded"
        >
          Check
        </button>
        <button
          type="button"
          onClick={() => setChecked(false)}
          className="px-2 py-1 text-xs bg-slate-600 text-white rounded"
        >
          Uncheck
        </button>
        <button
          type="button"
          onClick={() => setChecked('indeterminate')}
          className="px-2 py-1 text-xs bg-amber-600 text-white rounded"
        >
          Set Indeterminate
        </button>
      </div>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledCheckboxDemo />,
};

export const Indeterminate: Story = {
  args: {
    checked: 'indeterminate',
    label: 'Select all items (partially selected)',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    checked: true,
    label: 'Disabled checked checkbox',
  },
};
