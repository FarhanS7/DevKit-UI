import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Heading } from '@devkit-ui/core';

const meta: Meta<typeof Heading> = {
  title: 'Components/Heading',
  component: Heading,
  tags: ['autodocs'],
  argTypes: {
    as: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    },
    variant: {
      control: 'select',
      options: ['heading-xl', 'heading-lg', 'heading-md', 'heading-sm'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Heading>;

export const Default: Story = {
  args: {
    as: 'h1',
    variant: 'heading-xl',
    children: 'Build Modern User Interfaces',
  },
};

export const Levels: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Heading as="h1" variant="heading-xl">
        h1: Heading Extra Large
      </Heading>
      <Heading as="h2" variant="heading-lg">
        h2: Heading Large
      </Heading>
      <Heading as="h3" variant="heading-md">
        h3: Heading Medium
      </Heading>
      <Heading as="h4" variant="heading-sm">
        h4: Heading Small
      </Heading>
    </div>
  ),
};
