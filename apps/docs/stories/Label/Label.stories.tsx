import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Label, Input } from '@devkit-ui/core';

const meta: Meta<typeof Label> = {
  title: 'Components/Label',
  component: Label,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: {
    children: 'Email Address',
    htmlFor: 'email-input',
  },
  render: args => (
    <div className="flex flex-col gap-2 max-w-sm">
      <Label {...args} />
      <Input id="email-input" placeholder="you@example.com" />
    </div>
  ),
};
