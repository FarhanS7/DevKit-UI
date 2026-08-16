import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CommandPalette, Button } from '@devkit-ui/core';

const meta: Meta<typeof CommandPalette> = {
  title: 'Components/CommandPalette',
  component: CommandPalette,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CommandPalette>;

const commands = [
  { value: 'new-file', label: 'Create New File', category: 'Actions' },
  { value: 'open-settings', label: 'Open Settings', category: 'Preferences' },
  { value: 'theme-toggle', label: 'Toggle Dark Theme', category: 'Preferences' },
  { value: 'component-button', label: 'Button Component Docs', category: 'Components' },
  { value: 'component-dialog', label: 'Dialog Modal Docs', category: 'Components' },
  { value: 'component-tabs', label: 'Tabs Navigation Docs', category: 'Components' },
  { value: 'run-build', label: 'Run Production Build', category: 'Terminal' },
  { value: 'run-tests', label: 'Execute Vitest Suite', category: 'Terminal' },
];

const CommandPaletteDemo = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="p-6 flex flex-col items-start gap-4">
      <Button onClick={() => setOpen(true)} variant="primary">
        Open Command Palette (Press ⌘K)
      </Button>
      {selected && <p className="text-sm text-emerald-600 font-medium">Executed: {selected}</p>}

      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        items={commands.map(cmd => ({
          ...cmd,
          onSelect: val => setSelected(val),
        }))}
      />
    </div>
  );
};

export const Default: Story = {
  render: () => <CommandPaletteDemo />,
};
