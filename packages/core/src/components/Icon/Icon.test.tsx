import { describe, expect, it } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import * as React from 'react';

import { Icon } from './Icon.js';

describe('Icon component', () => {
  it('renders a Suspense fallback initially, then resolves to the SVG', async () => {
    const { container } = render(<Icon name="Check" aria-hidden="true" size={32} />);

    // Initially, it should render the span fallback from Suspense
    const fallback = container.querySelector('span');
    expect(fallback).not.toBeNull();
    expect(fallback?.style.width).toBe('32px');
    expect(fallback?.style.height).toBe('32px');

    // Wait for the dynamic import to resolve and swap the span for an svg
    await waitFor(() => {
      const svg = container.querySelector('svg');
      expect(svg).not.toBeNull();
      expect(svg?.getAttribute('aria-hidden')).toBe('true');
      expect(svg?.style.width).toBe('32px');
      expect(svg?.style.height).toBe('32px');
    });
  });

  it('renders with custom aria-label when not hidden', async () => {
    const { getByLabelText } = render(<Icon name="ArrowRight" aria-label="Go forward" />);

    await waitFor(() => {
      const svg = getByLabelText('Go forward');
      expect(svg.tagName).toBe('svg');
      expect(svg.getAttribute('aria-hidden')).toBeNull();
    });
  });

  it('spreads custom className strings properly', async () => {
    const { container } = render(
      <Icon name="X" aria-hidden="true" className="custom-icon-class text-red-500" />
    );

    await waitFor(() => {
      const svg = container.querySelector('svg');
      expect(svg?.className.baseVal).toContain('custom-icon-class');
      expect(svg?.className.baseVal).toContain('text-red-500');
    });
  });

  it('has zero accessibility violations when hidden', async () => {
    const { container } = render(<Icon name="Check" aria-hidden="true" />);

    // Wait for render to complete
    await waitFor(() => {
      expect(container.querySelector('svg')).not.toBeNull();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has zero accessibility violations when labeled', async () => {
    // In order for a standalone labeled element to be perfectly valid in Axe,
    // it usually helps to have `role="img"` on SVGs if they are standalone,
    // but React.SVGProps types accept aria-label.
    const { container } = render(<Icon name="X" aria-label="Close dialog" role="img" />);

    await waitFor(() => {
      expect(container.querySelector('svg')).not.toBeNull();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
