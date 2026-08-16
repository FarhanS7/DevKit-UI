# Task F.1 — VirtualList

**Phase:** F — Tier 3 DSA Components  
**Blocked by:** C.1  
**Blocks:** F.2, E.7  
**Week:** 8  
**AI Skill to use:** `senior-frontend`, `system-design`

---

## 1. What I'm Building

A high-performance virtualization component (`VirtualList`) that renders only the visible subset of extremely large datasets. It uses prefix-sum offset indices and binary search lookups to achieve smooth 60fps scrolling with 10,000+ items.

---

## 2. Architectural Decisions, DSA & Trade-offs

- **O(n) Prefix-Sum Cumulative heights**: On mount, we pre-compute the top offsets of all items by running an O(n) prefix-sum accumulation of row heights. This lookup index allows us to map scroll scroll-positions to row keys instantly.
- **O(log n) Binary Search visible bounds lookup**: On scroll events, running a linear scan over 10,000 rows to find the active view index can freeze the thread. We use binary search to locate the visible start index in O(log n) time (14 comparisons for 10,000 items).
- **Absolute heights spacers**: The list uses an absolute height container representing the total theoretical size of the list. This ensures the browser displays correct, natural scrollbar sizing.

---

## 3. Implementation Plan & Approach

### 1. Create `packages/core/src/components/VirtualList/VirtualList.tsx`

Create the virtualization component:

```typescript
import * as React from 'react';
import { cn } from '../../utils/cn';

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

  // 1. Compute heights index maps: O(n)
  const { heights, cumulativeHeights, totalHeight } = React.useMemo(() => {
    const heights: number[] = [];
    const cumulativeHeights: number[] = [];
    let currentTotal = 0;

    for (let i = 0; i < items.length; i++) {
      const h = typeof itemHeight === 'function' ? itemHeight(i) : itemHeight;
      heights.push(h);
      currentTotal += h;
      cumulativeHeights.push(currentTotal);
    }

    return { heights, cumulativeHeights, totalHeight: currentTotal };
  }, [items, itemHeight]);

  // 2. Binary search visible start index: O(log n)
  const getStartIndex = React.useCallback(
    (top: number) => {
      let lo = 0;
      let hi = cumulativeHeights.length - 1;

      while (lo < hi) {
        const mid = (lo + hi) >>> 1; // Fast floor division
        if (cumulativeHeights[mid] < top) {
          lo = mid + 1;
        } else {
          hi = mid;
        }
      }
      return lo;
    },
    [cumulativeHeights]
  );

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Find visible item bounds
  const startRawIndex = getStartIndex(scrollTop);
  const endRawIndex = getStartIndex(scrollTop + containerHeight);

  // Apply overscan padding boundaries
  const startIndex = Math.max(0, startRawIndex - overscan);
  const endIndex = Math.min(items.length - 1, endRawIndex + overscan);

  // Calculate translateY offset positions
  const offsetTop = startIndex > 0 ? cumulativeHeights[startIndex - 1]! : 0;

  const visibleItems = React.useMemo(() => {
    const list: React.ReactNode[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      const item = items[i];
      if (item !== undefined) {
        list.push(
          <div
            key={i}
            style={{ height: heights[i] }}
            data-virtual-item={i}
          >
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
```

### 2. Update Barrel Exports

Export components from `packages/core/src/index.ts`:

```typescript
export { VirtualList } from './components/VirtualList/VirtualList';
export type { VirtualListProps } from './components/VirtualList/VirtualList';
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **ResizeObserver synchronization**: If the window resizes, the containerHeight should update. Our component accepts `containerHeight` as a prop to keep layout updates clean.
- **TranslateY rounding**: Verify that translation values do not cause visual text anti-aliasing issues. Using simple integer values in template strings preserves text clarity.

---

## 5. Definition of Done

- [ ] `VirtualList` component is implemented in core.
- [ ] Render layouts map O(log n) binary search calculations.
- [ ] Active DOM elements do not exceed 50 nodes when rendering a 10,000-item array.
- [ ] Scrolling and overscan rendering are smooth.

---

## 6. QA Test Scenarios

| Scenario                 | Command                                      | Expected Result                                                              |
| ------------------------ | -------------------------------------------- | ---------------------------------------------------------------------------- |
| Verify rendering density | Render 10k items with 400px container bounds | Fewer than 45 actual child DOM element nodes are rendered in document paths. |
| Test scrolling shifts    | Simulate scroll offset changes in testing    | `translateY` values update, and rendered item indexes change correctly.      |

---

## 7. AI Code Loop Prompt

```
TASK: F.1 — VirtualList

Create packages/core/src/components/VirtualList/VirtualList.tsx.
Pre-calculate cumulative heights into a memoized prefix-sum array on mount.
On scroll events, execute an O(log n) binary search lookup to locate the visible start index.
Apply translateY style properties on visible items, pre-rendering elements within overscan boundaries.
Create VirtualList.test.tsx containing visible node density counts, scroll simulations, and verification tests.
Update core index.ts to export VirtualList.
```
