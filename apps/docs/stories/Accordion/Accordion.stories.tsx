import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Accordion } from '@devkit-ui/core';

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Single: Story = {
  render: () => (
    <Accordion type="single" defaultValue={['item-1']} className="w-[450px]">
      <Accordion.Item value="item-1">
        <Accordion.Trigger>Is it accessible?</Accordion.Trigger>
        <Accordion.Content>
          Yes. It adheres to the WAI-ARIA design pattern for Accordions with proper keyboard
          navigation.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.Trigger>Is it unstyled?</Accordion.Trigger>
        <Accordion.Content>
          No. It comes with clean design system tokens and Tailwind CSS utilities out of the box.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-3">
        <Accordion.Trigger>Can it be animated?</Accordion.Trigger>
        <Accordion.Content>
          Yes! Smooth transitions are supported and automatically respect reduced motion settings.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-[450px]">
      <Accordion.Item value="item-1">
        <Accordion.Trigger>First Accordion Section</Accordion.Trigger>
        <Accordion.Content>
          Multiple items can be expanded simultaneously in multiple mode.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.Trigger>Second Accordion Section</Accordion.Trigger>
        <Accordion.Content>This item is also expanded by default.</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-3">
        <Accordion.Trigger>Third Accordion Section</Accordion.Trigger>
        <Accordion.Content>Clicking triggers toggles individual item visibility.</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  ),
};
