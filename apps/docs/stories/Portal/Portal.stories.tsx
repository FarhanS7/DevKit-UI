import React, { useState, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Portal } from '@devkit-ui/core';

const meta: Meta<typeof Portal> = {
  title: 'Components/Portal',
  component: Portal,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Portal>;

const DefaultPortalDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="px-4 py-2 bg-slate-800 text-white rounded"
      >
        {open ? 'Close Portal' : 'Open Portal'}
      </button>
      {open && (
        <Portal>
          <div className="fixed bottom-4 right-4 p-4 bg-emerald-600 text-white rounded shadow-lg z-50">
            This content is rendered into document.body via Portal!
          </div>
        </Portal>
      )}
    </div>
  );
};

export const Default: Story = {
  render: () => <DefaultPortalDemo />,
};

const CustomContainerPortalDemo = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="px-4 py-2 bg-slate-800 text-white rounded mb-4"
      >
        Toggle Custom Container Portal
      </button>

      <div
        ref={containerRef}
        className="p-6 border-2 border-dashed border-indigo-500 rounded min-h-[100px] relative"
      >
        <p className="text-slate-500 text-sm">Target Container Box</p>
        {open && (
          <Portal container={containerRef.current}>
            <div className="p-3 bg-indigo-600 text-white rounded mt-2">
              Rendered inside the custom container!
            </div>
          </Portal>
        )}
      </div>
    </div>
  );
};

export const CustomContainer: Story = {
  render: () => <CustomContainerPortalDemo />,
};
