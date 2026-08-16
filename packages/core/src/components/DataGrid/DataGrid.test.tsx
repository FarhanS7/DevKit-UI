import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, vi } from 'vitest';

import { DataGrid, type ColumnDef } from './DataGrid.js';

expect.extend(toHaveNoViolations);

interface UserRow {
  id: number;
  name: string;
  role: string;
}

const columns: ColumnDef<UserRow>[] = [
  { key: 'id', header: 'ID', sortable: true },
  { key: 'name', header: 'Name', sortable: true },
  { key: 'role', header: 'Role', sortable: false },
];

const sampleData: UserRow[] = [
  { id: 2, name: 'Bob', role: 'Developer' },
  { id: 1, name: 'Alice', role: 'Designer' },
  { id: 3, name: 'Charlie', role: 'Manager' },
];

describe('DataGrid Component', () => {
  it('renders ARIA grid layout correctly with headers and cells', () => {
    render(<DataGrid columns={columns} data={sampleData} />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('sorts columns when clicking sortable header', () => {
    render(<DataGrid columns={columns} data={sampleData} />);

    const idHeader = screen.getByText('ID');
    fireEvent.click(idHeader);

    const cells = screen.getAllByRole('gridcell');
    expect(cells[0]).toHaveTextContent('1'); // Alice (id 1) first after asc sort
  });

  it('triggers onRowSelect when pressing Enter on active cell', () => {
    const handleSelect = vi.fn();
    render(<DataGrid columns={columns} data={sampleData} onRowSelect={handleSelect} />);

    const grid = screen.getByRole('grid');
    fireEvent.keyDown(grid, { key: 'Enter' });

    expect(handleSelect).toHaveBeenCalledWith(sampleData[0]);
  });

  it('passes axe-core accessibility audit', async () => {
    const { container } = render(<DataGrid columns={columns} data={sampleData} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
