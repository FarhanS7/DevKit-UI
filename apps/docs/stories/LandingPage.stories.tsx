import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LandingPage } from './LandingPage';

const meta: Meta<typeof LandingPage> = {
  title: 'Pages/Landing Page',
  component: LandingPage,
  parameters: {
    layout: 'fullscreen',
    controls: { hideNoControlsWarning: true },
  },
  argTypes: {
    initialTheme: {
      control: 'radio',
      options: ['light', 'dark'],
      description: 'Initial theme for the landing page',
    },
  },
};

export default meta;
type Story = StoryObj<typeof LandingPage>;

export const LightTheme: Story = {
  args: {
    initialTheme: 'light',
  },
};

export const DarkTheme: Story = {
  args: {
    initialTheme: 'dark',
  },
};
