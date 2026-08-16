import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Dialog, Button } from '@devkit-ui/core';

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <Dialog.Trigger>
        <Button variant="primary">Edit Profile</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Edit Profile</Dialog.Title>
        <Dialog.Description>
          Make changes to your profile here. Click save when you're done.
        </Dialog.Description>
        <div className="mt-6 flex justify-end gap-3">
          <Dialog.Close>
            <Button variant="secondary">Cancel</Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button variant="primary">Save Changes</Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog>
  ),
};
