import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '@devkit-ui/core';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
    label: 'Username',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
    helperText: 'We will never share your email with anyone else.',
  },
};

export const ErrorState: Story = {
  args: {
    label: 'Password',
    type: 'password',
    defaultValue: '123',
    errorMessage: 'Password must be at least 8 characters long.',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    defaultValue: 'Cannot edit this',
    disabled: true,
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-sm">
      <Input size="sm" label="Small Input" placeholder="Size sm" />
      <Input size="md" label="Medium Input" placeholder="Size md" />
      <Input size="lg" label="Large Input" placeholder="Size lg" />
    </div>
  ),
};
