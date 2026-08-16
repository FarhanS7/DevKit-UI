import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { VisuallyHidden } from '@devkit-ui/core';

const meta: Meta<typeof VisuallyHidden> = {
  title: 'Components/VisuallyHidden',
  component: VisuallyHidden,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof VisuallyHidden>;

export const Default: Story = {
  render: () => (
    <div>
      <p>The text below is hidden visually but accessible to screen readers:</p>
      <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded">
        <span>Save</span>
        <VisuallyHidden> changes to document</VisuallyHidden>
      </button>
    </div>
  ),
};
