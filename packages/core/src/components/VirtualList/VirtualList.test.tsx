import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect } from 'vitest';

import { VirtualList } from './VirtualList.js';

expect.extend(toHaveNoViolations);

describe('VirtualList Component', () => {
  const items = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
  }));

  it('renders only a small subset of DOM nodes when dataset has 10,000 items', () => {
    const { container } = render(
      <VirtualList
        items={items}
        itemHeight={40}
        containerHeight={400}
        renderItem={item => <div key={item.id}>{item.name}</div>}
      />
    );

    // 400px height / 40px itemHeight = 10 visible items + overscan (3 top + 3 bottom = 16 total nodes)
    const virtualItems = container.querySelectorAll('[data-virtual-item]');
    expect(virtualItems.length).toBeLessThan(50);
    expect(virtualItems.length).toBeGreaterThan(0);
  });

  it('renders item content correctly', () => {
    render(
      <VirtualList
        items={items}
        itemHeight={40}
        containerHeight={400}
        renderItem={item => <div key={item.id}>{item.name}</div>}
      />
    );

    expect(screen.getByText('Item 0')).toBeInTheDocument();
  });

  it('passes axe-core accessibility check', async () => {
    const { container } = render(
      <VirtualList
        items={items.slice(0, 100)}
        itemHeight={40}
        containerHeight={400}
        renderItem={item => <div key={item.id}>{item.name}</div>}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
