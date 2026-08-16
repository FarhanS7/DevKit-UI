import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { VirtualList } from '@devkit-ui/core';

const meta: Meta<typeof VirtualList> = {
  title: 'Components/VirtualList',
  component: VirtualList,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof VirtualList>;

const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i % 3 === 0 ? 'Admin' : 'Member',
}));

export const TenThousandItems: Story = {
  render: () => (
    <div className="w-[500px] border border-slate-200 rounded-md overflow-hidden shadow-sm">
      <div className="bg-slate-100 p-3 text-xs font-semibold text-slate-600 border-b">
        Virtual Scroll Demo — 10,000 Items Array
      </div>
      <VirtualList
        items={largeDataset}
        itemHeight={48}
        containerHeight={360}
        renderItem={(user, index) => (
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 hover:bg-slate-50 transition-colors">
            <div>
              <p className="text-sm font-medium text-slate-800">{user.name}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700">
              #{index + 1} • {user.role}
            </span>
          </div>
        )}
      />
    </div>
  ),
};
