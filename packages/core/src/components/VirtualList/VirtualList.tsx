/* eslint-disable no-unused-vars */
import * as React from 'react';

import { cn } from '../../utils/cn.js';

import { binarySearchVisibleIndex } from './binarySearch.js';

export interface VirtualListProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  items: T[];
  itemHeight: number | ((index: number) => number);
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  className,
  ...props
}: VirtualListProps<T>) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = React.useState(0);

  // 1. Compute heights index maps: O(n) prefix-sum
  const { heights, cumulativeHeights, totalHeight } = React.useMemo(() => {
    const heightsList: number[] = [];
    const cumulative: number[] = [];
    let currentTotal = 0;

    for (let i = 0; i < items.length; i++) {
      const h = typeof itemHeight === 'function' ? itemHeight(i) : itemHeight;
      heightsList.push(h);
      currentTotal += h;
      cumulative.push(currentTotal);
    }

    return { heights: heightsList, cumulativeHeights: cumulative, totalHeight: currentTotal };
  }, [items, itemHeight]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // 2. Find visible item bounds using O(log n) binary search
  const startRawIndex = binarySearchVisibleIndex(cumulativeHeights, scrollTop);
  const endRawIndex = binarySearchVisibleIndex(cumulativeHeights, scrollTop + containerHeight);

  // 3. Apply overscan padding boundaries
  const startIndex = Math.max(0, startRawIndex - overscan);
  const endIndex = Math.min(items.length - 1, endRawIndex + overscan);

  // 4. Calculate translateY offset positions
  const offsetTop = startIndex > 0 ? cumulativeHeights[startIndex - 1]! : 0;

  const visibleItems = React.useMemo(() => {
    const list: React.ReactNode[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      const item = items[i];
      if (item !== undefined) {
        list.push(
          <div key={i} style={{ height: heights[i] }} data-virtual-item={i}>
            {renderItem(item, i)}
          </div>
        );
      }
    }
    return list;
  }, [items, startIndex, endIndex, heights, renderItem]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn('overflow-auto relative', className)}
      style={{ height: containerHeight }}
      {...props}
    >
      <div style={{ height: totalHeight, width: '100%', position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetTop}px)`,
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
          }}
        >
          {visibleItems}
        </div>
      </div>
    </div>
  );
}
