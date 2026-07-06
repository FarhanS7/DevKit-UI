import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const IntroductionComponent = () => {
  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        padding: '32px',
        maxWidth: '640px',
        lineHeight: '1.7',
        color: '#1e293b',
      }}
    >
      <h1 style={{ fontFamily: "'Archivo', sans-serif", letterSpacing: '-0.025em' }}>
        Welcome to DevKit UI
      </h1>
      <p style={{ color: '#64748b', marginTop: '8px' }}>
        A production-ready React component library built with TypeScript, powered by design tokens,
        and ready to ship.
      </p>

      <h2 style={{ marginTop: '24px', fontFamily: "'Archivo', sans-serif" }}>Quick Links</h2>
      <ul style={{ paddingLeft: '20px', color: '#475569' }}>
        <li>
          <strong>Landing Page:</strong> Check out the{' '}
          <a href="?path=/story/pages-landing-page--light-theme" style={{ color: '#3b82f6' }}>
            Light Theme
          </a>{' '}
          and{' '}
          <a href="?path=/story/pages-landing-page--dark-theme" style={{ color: '#3b82f6' }}>
            Dark Theme
          </a>{' '}
          demos.
        </li>
        <li>
          <strong>Components:</strong> Browse the component library (coming soon).
        </li>
        <li>
          <strong>Tokens:</strong> Design token reference (coming soon).
        </li>
      </ul>

      <h2 style={{ marginTop: '24px', fontFamily: "'Archivo', sans-serif" }}>Phase Status</h2>
      <ul style={{ paddingLeft: '20px', color: '#475569' }}>
        <li>
          <strong>Phase A — Infrastructure:</strong> ✅ Complete
        </li>
        <li>
          <strong>Phase B — Token Pipeline:</strong> 🔄 In Progress
        </li>
        <li>
          <strong>Landing Page:</strong> ✅ Complete (Light + Dark themes)
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
