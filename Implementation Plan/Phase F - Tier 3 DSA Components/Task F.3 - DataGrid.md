# Task F.3 — DataGrid

**Phase:** F — Tier 3 DSA Components  
**Blocked by:** F.1, C.1  
**Blocks:** Tables  
**Week:** 8  
**AI Skill to use:** `senior-frontend`, `system-design`

---

## 1. What I'm Building

A high-performance virtualized grid layout (`DataGrid`) supporting column sorting, cell-level keyboard navigation (X, Y coordinates), and row selection.

---

## 2. Architectural Decisions, DSA & Trade-offs

- **2D Keyboard Focus coordinate tracking**: Standard table tags only support tab-based sequences. An interactive grid must support arrow keys to navigate focus in 2D space (up, down, left, right). We store active cell coordinate indexes `[activeX, activeY]` to handle focus moves programmatically.
- **WAI-ARIA Grid Role Structure**: We set `role="grid"`, `role="row"`, and `role="gridcell"` to announce coordinates to screen readers and enable arrow key focus adjustments.
- **Sorting State parameters**: When sorting triggers, we set `aria-sort="ascending"` / `aria-sort="descending"` on column headers so screen readers announce the sort state.

---

## 3. Implementation Plan & Approach

### 1. Create `packages/core/src/components/DataGrid/DataGrid.tsx`

Create the coordinate grid component:

```typescript
import * as React from 'react';
import { cn } from '../../utils/cn';
import { VirtualList } from '../VirtualList/VirtualList';

export interface ColumnDef<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
}

export interface DataGridProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  containerHeight?: number;
  rowHeight?: number;
  onRowSelect?: (row: T) => void;
}

export function DataGrid<T>({
  columns,
  data,
  containerHeight = 400,
  rowHeight = 48,
  onRowSelect,
}: DataGridProps<T>) {
  const [activeCell, setActiveCell] = React.useState<[number, number]>([0, 0]); // [colIndex, rowIndex]
  const [sortConfig, setSortConfig] = React.useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(null);

  const baseId = React.useId();
  const gridRef = React.useRef<HTMLDivElement>(null);

  // 1. Sort logic
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // 2. 2D Keyboard Focus Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const [col, row] = activeCell;
    const maxCols = columns.length - 1;
    const maxRows = sortedData.length - 1;

    let nextCol = col;
    let nextRow = row;

    switch (e.key) {
      case 'ArrowRight':
        nextCol = Math.min(col + 1, maxCols);
        break;
      case 'ArrowLeft':
        nextCol = Math.max(col - 1, 0);
        break;
      case 'ArrowDown':
        nextRow = Math.min(row + 1, maxRows);
        break;
      case 'ArrowUp':
        nextRow = Math.max(row - 1, 0);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        const activeRow = sortedData[row];
        if (activeRow) onRowSelect?.(activeRow);
        break;
      default:
        return;
    }

    if (nextCol !== col || nextRow !== row) {
      e.preventDefault();
      setActiveCell([nextCol, nextRow]);

      // Move focus programmatically
      setTimeout(() => {
        const cell = gridRef.current?.querySelector(
          `[data-grid-cell="${nextCol}-${nextRow}"]`
        ) as HTMLElement;
        cell?.focus();
      }, 0);
    }
  };

  const handleSort = (key: keyof T) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  return (
    <div
      ref={gridRef}
      role="grid"
      aria-rowcount={sortedData.length}
      aria-colcount={columns.length}
      onKeyDown={handleKeyDown}
      className="flex flex-col border border-[var(--color-border-default)] rounded-[var(--radius-md)] overflow-hidden bg-[var(--color-background-default)]"
    >
      {/* Header Row */}
      <div role="row" className="flex border-b border-[var(--color-border-default)] bg-[var(--color-background-subtle)]">
        {columns.map((col, idx) => {
          const isSorted = sortConfig?.key === col.key;
          const ariaSort = isSorted
            ? sortConfig.direction === 'asc'
              ? 'ascending'
              : 'descending'
            : undefined;

          return (
            <div
              key={String(col.key)}
              role="columnheader"
              aria-sort={ariaSort}
              onClick={() => col.sortable && handleSort(col.key)}
              className={cn(
                'flex flex-1 items-center gap-2 px-4 py-3 text-sm font-semibold select-none text-[var(--color-text-primary)]',
                col.sortable && 'cursor-pointer hover:bg-[var(--color-border-default)]/30'
              )}
            >
              <span>{col.header}</span>
              {col.sortable && isSorted && (
                <span>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Virtualized Body Rows */}
      <div className="relative">
        <VirtualList
          items={sortedData}
          itemHeight={rowHeight}
          containerHeight={containerHeight}
          renderItem={(rowItem, rowIndex) => {
            return (
              <div role="row" className="flex border-b border-[var(--color-border-default)]/50 hover:bg-[var(--color-background-subtle)]/50">
                {columns.map((col, colIndex) => {
                  const isActive = activeCell[0] === colIndex && activeCell[1] === rowIndex;
                  const cellId = `${baseId}-cell-${colIndex}-${rowIndex}`;

                  return (
                    <div
                      key={String(col.key)}
                      id={cellId}
                      role="gridcell"
                      tabIndex={isActive ? 0 : -1}
                      data-grid-cell={`${colIndex}-${rowIndex}`}
                      onFocus={() => setActiveCell([colIndex, rowIndex])}
                      className={cn(
                        'flex-1 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)] focus:ring-inset text-[var(--color-text-primary)]',
                        isActive && 'bg-[var(--color-background-subtle)] ring-2 ring-[var(--color-border-focus)]'
                      )}
                    >
                      {String(rowItem[col.key])}
                    </div>
                  );
                })}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}
```

### 2. Update Barrel Exports

Export components from `packages/core/src/index.ts`:

```typescript
export { DataGrid } from './components/DataGrid/DataGrid';
export type { DataGridProps, ColumnDef } from './components/DataGrid/DataGrid';
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Header index values**: Header rows are counted in `aria-rowcount`, but they use `role="columnheader"` rather than `role="gridcell"`.
- **Keyboard navigation triggers**: Space and Enter keys on cells should trigger action callbacks or row selection handlers.

---

## 5. Definition of Done

- [ ] `DataGrid` component exists.
- [ ] Arrow keys navigate cell focus across columns and rows.
- [ ] Column headers trigger sorting callbacks and update `aria-sort` state parameters.
- [ ] Active row elements render inside `VirtualList` viewports.
- [ ] Axe-core check has 0 violations.

---

## 6. QA Test Scenarios

| Scenario                | Command                            | Expected Result                                                 |
| ----------------------- | ---------------------------------- | --------------------------------------------------------------- |
| Verify rendering output | Mount `<DataGrid>`                 | HTML renders grid containers with appropriate columns and rows. |
| Test Cell selection     | Select a cell and press ArrowRight | Focus moves to the cell in the next column.                     |
| Test sorting            | Click a sortable column header     | The list re-orders, and `aria-sort` reflects the direction.     |

---

## 7. AI Code Loop Prompt

```
TASK: F.3 — DataGrid

Create packages/core/src/components/DataGrid/DataGrid.tsx.
Integrate VirtualList component to render spreadsheet rows.
Configure state coordinate arrays [activeX, activeY] to track selected cells.
Implement arrow key navigation to move focus in 2D space.
Configure role="grid", role="row", and role="gridcell" mappings.
Verify column sorting updates, 2D arrow key movements, and accessibility in DataGrid.test.tsx.
Update core index.ts to export DataGrid.
```
