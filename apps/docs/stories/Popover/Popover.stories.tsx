import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Popover, Button, Input } from '@devkit-ui/core';

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <Popover.Trigger>
        <Button variant="secondary">Dimensions</Button>
      </Popover.Trigger>
      <Popover.Content className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-slate-900 leading-none">Dimensions</h4>
            <p className="text-xs text-slate-500">Set the dimensions for the layer.</p>
          </div>
          <div className="grid gap-2">
            <Input label="Width" defaultValue="100%" size="sm" />
            <Input label="Max Width" defaultValue="300px" size="sm" />
            <Input label="Height" defaultValue="25px" size="sm" />
          </div>
        </div>
      </Popover.Content>
    </Popover>
  ),
};
