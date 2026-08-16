import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { AccessibilityChecker } from './AccessibilityChecker.js';

const meta: Meta<typeof AccessibilityChecker> = {
  title: 'AI Tools/AccessibilityChecker',
  component: AccessibilityChecker,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AccessibilityChecker>;

export const Default: Story = {
  render: () => <AccessibilityChecker />,
};
