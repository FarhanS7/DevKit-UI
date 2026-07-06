import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const IntroductionComponent = () => {
  return (
    <div
      style={{ fontFamily: 'sans-serif', padding: '24px', maxWidth: '600px', lineHeight: '1.6' }}
    >
      <h1>Welcome to @devkit-ui/core</h1>
      <p>
        This is the design system component library built with React, TypeScript, and Tailwind CSS.
      </p>
      <h2>Phase A Status</h2>
      <ul>
        <li>
          <strong>A.1 Workspace:</strong> Linked successfully.
        </li>
        <li>
          <strong>A.2 Vite Build:</strong> Compiles ESM & CommonJS outputs.
        </li>
        <li>
          <strong>A.3 Storybook:</strong> Setting up... (Running this story!)
        </li>
        <li>
          <strong>A.4 ESLint/Prettier:</strong> Up next.
        </li>
      </ul>
    </div>
  );
};

const meta: Meta<typeof IntroductionComponent> = {
  title: 'Introduction',
  component: IntroductionComponent,
};

export default meta;
type Story = StoryObj<typeof IntroductionComponent>;

export const Default: Story = {};
