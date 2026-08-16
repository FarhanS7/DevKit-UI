/* eslint-disable no-unused-vars */
import * as React from 'react';

import { cn } from '../../utils/cn.js';
import { VirtualList } from '../VirtualList/VirtualList.js';

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
  onRowSelect?: (_row: T) => void;
  className?: string;
}

export function DataGrid<T>({
  columns,
  data,
  containerHeight = 400,
  rowHeight = 48,
  onRowSelect,
  className,
}: DataGridProps<T>) {
  const [activeCell, setActiveCell] = React.useState<[number, number]>([0, 0]); // [colIndex, rowIndex]
  const [sortConfig, setSortConfig] = React.useState<{
    key: keyof T;
    direction: 'asc' | 'desc';
  } | null>(null);

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
        {
          const activeRow = sortedData[row];
          if (activeRow) onRowSelect?.(activeRow);
        }
        break;
      default:
        return;
    }

    if (nextCol !== col || nextRow !== row) {
      e.preventDefault();
      setActiveCell([nextCol, nextRow]);

      setTimeout(() => {
        const cell = gridRef.current?.querySelector(
          `[data-grid-cell="${nextCol}-${nextRow}"]`
        ) as HTMLElement;
        cell?.focus();
      }, 0);
    }
  };

  const handleSort = (key: keyof T) => {
    setSortConfig(prev => {
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
      tabIndex={0}
      aria-rowcount={sortedData.length}
      aria-colcount={columns.length}
      onKeyDown={handleKeyDown}
      className={cn(
        'flex flex-col border border-[var(--color-border-default,#d1d5db)] rounded-[var(--radius-md,#0.375rem)] overflow-hidden bg-[var(--color-background-default,#ffffff)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus,#3b82f6)]',
        className
      )}
    >
      {/* Header Row */}
      <div
        role="row"
        className="flex border-b border-[var(--color-border-default,#d1d5db)] bg-[var(--color-background-subtle,#f3f4f6)]"
      >
        {columns.map(col => {
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
              tabIndex={col.sortable ? 0 : -1}
              aria-sort={ariaSort}
              onClick={() => col.sortable && handleSort(col.key)}
              onKeyDown={e => {
                if (col.sortable && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleSort(col.key);
                }
              }}
              className={cn(
                'flex flex-1 items-center gap-2 px-4 py-3 text-sm font-semibold select-none text-[var(--color-text-primary,#111827)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus,#3b82f6)] focus-visible:ring-inset',
                col.sortable && 'cursor-pointer hover:bg-[var(--color-border-default,#d1d5db)]/30'
              )}
            >
              <span>{col.header}</span>
              {col.sortable && isSorted && (
                <span aria-hidden="true">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
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
              <div
                role="row"
                className="flex border-b border-[var(--color-border-default,#d1d5db)]/50 hover:bg-[var(--color-background-subtle,#f3f4f6)]/50 transition-colors"
              >
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
                        'flex-1 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus,#3b82f6)] focus:ring-inset text-[var(--color-text-primary,#111827)]',
                        isActive &&
                          'bg-[var(--color-background-subtle,#f3f4f6)] ring-2 ring-[var(--color-border-focus,#3b82f6)]'
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
