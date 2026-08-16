import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DataGrid, type ColumnDef } from '@devkit-ui/core';

const meta: Meta<typeof DataGrid> = {
  title: 'Components/DataGrid',
  component: DataGrid,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DataGrid>;

interface Employee {
  id: number;
  name: string;
  department: string;
  salary: number;
}

const columns: ColumnDef<Employee>[] = [
  { key: 'id', header: 'ID', sortable: true },
  { key: 'name', header: 'Employee Name', sortable: true },
  { key: 'department', header: 'Department', sortable: true },
  { key: 'salary', header: 'Salary ($)', sortable: true },
];

const dataset: Employee[] = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  name: `Employee ${i + 1}`,
  department: ['Engineering', 'Design', 'Marketing', 'Sales', 'Product'][i % 5]!,
  salary: 60000 + (i % 20) * 2500,
}));

const DataGridDemo = () => {
  const [selected, setSelected] = useState<Employee | null>(null);

  return (
    <div className="flex flex-col gap-3 max-w-2xl">
      <div className="flex justify-between items-center bg-slate-100 p-3 rounded">
        <span className="text-xs font-semibold text-slate-700">
          DataGrid — 1,000 Rows, 2D Keyboard Focus (Arrow keys) & Sorting
        </span>
        {selected && (
          <span className="text-xs font-medium text-blue-600">Selected: {selected.name}</span>
        )}
      </div>

      <DataGrid
        columns={columns}
        data={dataset}
        containerHeight={400}
        onRowSelect={row => setSelected(row)}
      />
    </div>
  );
};

export const Default: Story = {
  render: () => <DataGridDemo />,
};
