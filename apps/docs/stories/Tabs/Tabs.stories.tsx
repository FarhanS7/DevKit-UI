import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from '@devkit-ui/core';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <Tabs.List>
        <Tabs.Trigger value="account">Account</Tabs.Trigger>
        <Tabs.Trigger value="password">Password</Tabs.Trigger>
        <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="account" className="p-4 border rounded">
        <h3 className="font-medium text-slate-900">Account Preferences</h3>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account details and email preferences.
        </p>
      </Tabs.Content>
      <Tabs.Content value="password" className="p-4 border rounded">
        <h3 className="font-medium text-slate-900">Change Password</h3>
        <p className="text-sm text-slate-500 mt-1">
          Update your password to keep your account secure.
        </p>
      </Tabs.Content>
      <Tabs.Content value="settings" className="p-4 border rounded">
        <h3 className="font-medium text-slate-900">General Settings</h3>
        <p className="text-sm text-slate-500 mt-1">
          Configure workspace and notifications options.
        </p>
      </Tabs.Content>
    </Tabs>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="general" orientation="vertical" className="w-[500px]">
      <Tabs.List>
        <Tabs.Trigger value="general">General</Tabs.Trigger>
        <Tabs.Trigger value="billing">Billing</Tabs.Trigger>
        <Tabs.Trigger value="team">Team Members</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="general" className="flex-1 p-4 border rounded">
        <h3 className="font-medium text-slate-900">General Settings</h3>
        <p className="text-sm text-slate-500 mt-1">Basic organization parameters.</p>
      </Tabs.Content>
      <Tabs.Content value="billing" className="flex-1 p-4 border rounded">
        <h3 className="font-medium text-slate-900">Billing Information</h3>
        <p className="text-sm text-slate-500 mt-1">Manage subscriptions and payment methods.</p>
      </Tabs.Content>
      <Tabs.Content value="team" className="flex-1 p-4 border rounded">
        <h3 className="font-medium text-slate-900">Team Members</h3>
        <p className="text-sm text-slate-500 mt-1">Invite and manage team permissions.</p>
      </Tabs.Content>
    </Tabs>
  ),
};
