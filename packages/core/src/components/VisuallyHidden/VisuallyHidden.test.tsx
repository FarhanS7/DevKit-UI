/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import * as React from 'react';

import { VisuallyHidden } from './VisuallyHidden.js';

expect.extend(toHaveNoViolations);

describe('VisuallyHidden component', () => {
  it('renders a span element with correct styles', () => {
    const { container } = render(<VisuallyHidden>Hidden Text</VisuallyHidden>);
    const span = container.firstChild as HTMLSpanElement;
    expect(span.tagName).toBe('SPAN');
    expect(span.className).toContain('absolute');
    expect(span.className).toContain('w-px');
    expect(span.style.clip).toBe('rect(0px, 0px, 0px, 0px)');
  });

  it('merges custom styles and classNames', () => {
    const { container } = render(
      <VisuallyHidden className="custom-class" style={{ top: 0 }}>
        Hidden Text
      </VisuallyHidden>
    );
    const span = container.firstChild as HTMLSpanElement;
    expect(span.className).toContain('custom-class');
    expect(span.className).toContain('absolute');
    expect(span.style.top).toBe('0px');
  });

  it('has zero accessibility violations', async () => {
    const { container } = render(<VisuallyHidden>Hidden Text</VisuallyHidden>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
