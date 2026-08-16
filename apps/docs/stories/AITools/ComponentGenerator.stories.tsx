import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { ComponentGenerator } from './ComponentGenerator.js';

const meta: Meta<typeof ComponentGenerator> = {
  title: 'AI Tools/ComponentGenerator',
  component: ComponentGenerator,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ComponentGenerator>;

export const Default: Story = {
  render: () => <ComponentGenerator />,
};
