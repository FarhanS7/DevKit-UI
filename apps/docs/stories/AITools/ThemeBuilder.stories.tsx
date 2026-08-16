import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { ThemeBuilder } from './ThemeBuilder.js';

const meta: Meta<typeof ThemeBuilder> = {
  title: 'AI Tools/ThemeBuilder',
  component: ThemeBuilder,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ThemeBuilder>;

export const Default: Story = {
  render: () => <ThemeBuilder />,
};
