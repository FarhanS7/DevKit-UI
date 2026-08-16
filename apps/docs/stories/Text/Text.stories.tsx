import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Text } from '@devkit-ui/core';

const meta: Meta<typeof Text> = {
  title: 'Components/Text',
  component: Text,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['body', 'body-sm', 'label', 'caption', 'code'],
    },
    as: {
      control: 'text',
    },
    truncate: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Text>;

export const Default: Story = {
  args: {
    children: 'The quick brown fox jumps over the lazy dog.',
    variant: 'body',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <span className="text-xs text-slate-400 block mb-1">Body (Default)</span>
        <Text variant="body">The quick brown fox jumps over the lazy dog.</Text>
      </div>
      <div>
        <span className="text-xs text-slate-400 block mb-1">Body Small</span>
        <Text variant="body-sm">The quick brown fox jumps over the lazy dog.</Text>
      </div>
      <div>
        <span className="text-xs text-slate-400 block mb-1">Label</span>
        <Text variant="label">Form Field Label Text</Text>
      </div>
      <div>
        <span className="text-xs text-slate-400 block mb-1">Caption</span>
        <Text variant="caption">Small descriptive caption text.</Text>
      </div>
      <div>
        <span className="text-xs text-slate-400 block mb-1">Code</span>
        <Text variant="code">const devkit = 'ui';</Text>
      </div>
    </div>
  ),
};

export const Polymorphic: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Text as="span" variant="body">
        Rendered as span tag
      </Text>
      <Text as="div" variant="body">
        Rendered as div tag
      </Text>
      <Text as="code" variant="code">
        Rendered as code tag
      </Text>
    </div>
  ),
};

export const Truncated: Story = {
  render: () => (
    <div className="w-64 border p-2 rounded">
      <Text truncate variant="body">
        This is a very long paragraph that will be truncated with an ellipsis when it overflows the
        container width.
      </Text>
    </div>
  ),
};
