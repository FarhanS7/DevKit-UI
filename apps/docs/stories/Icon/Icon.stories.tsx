import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from '@devkit-ui/core';

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Default: Story = {
  args: {
    name: 'ArrowRight',
    size: 24,
    'aria-hidden': 'true',
  },
};

export const AllIcons: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <Icon name="ArrowRight" size={32} aria-hidden="true" />
        <span className="text-xs text-slate-500">ArrowRight</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="Check" size={32} aria-hidden="true" />
        <span className="text-xs text-slate-500">Check</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon name="X" size={32} aria-hidden="true" />
        <span className="text-xs text-slate-500">X</span>
      </div>
    </div>
  ),
};

export const AccessibleLabel: Story = {
  args: {
    name: 'Check',
    size: 24,
    'aria-label': 'Success checkmark icon',
  },
};
