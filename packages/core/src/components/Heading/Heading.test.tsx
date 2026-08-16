import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import * as React from 'react';

import { Heading } from './Heading.js';

describe('Heading component', () => {
  it('renders as an <h1> element by default', () => {
    const { container } = render(<Heading>Title</Heading>);
    const el = container.firstChild as HTMLElement;
    expect(el.tagName).toBe('H1');
    expect(el.textContent).toBe('Title');
  });

  it('renders with the correct variant classes', () => {
    const { container } = render(<Heading variant="heading-xl">Big Title</Heading>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('[font-size:var(--font-size-4xl)]');
    expect(el.className).toContain('[font-weight:var(--font-weight-bold)]');
  });

  it('renders as a custom heading level via the "as" prop', () => {
    const { container } = render(<Heading as="h3">Section</Heading>);
    const el = container.firstChild as HTMLElement;
    expect(el.tagName).toBe('H3');
  });

  it('renders as h1 when specified', () => {
    const { container } = render(<Heading as="h1">Page Title</Heading>);
    const el = container.firstChild as HTMLElement;
    expect(el.tagName).toBe('H1');
  });

  it('merges custom className with variant classes', () => {
    const { container } = render(<Heading className="custom-heading">Styled</Heading>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('custom-heading');
    expect(el.className).toContain('tracking-tight');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLHeadingElement>();
    render(<Heading ref={ref}>Ref heading</Heading>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('H1');
  });

  it('spreads additional HTML attributes', () => {
    const { container } = render(
      <Heading data-testid="heading-el" id="main-heading">
        Props heading
      </Heading>
    );
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute('data-testid')).toBe('heading-el');
    expect(el.id).toBe('main-heading');
  });

  it('defaults to heading-md variant when no variant specified', () => {
    const { container } = render(<Heading>Default</Heading>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('[font-size:var(--font-size-2xl)]');
    expect(el.className).toContain('[font-weight:var(--font-weight-semibold)]');
  });

  it('renders all heading levels correctly', () => {
    const levels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
    for (const level of levels) {
      const { container, unmount } = render(<Heading as={level}>Level {level}</Heading>);
      const el = container.firstChild as HTMLElement;
      expect(el.tagName).toBe(level.toUpperCase());
      unmount();
    }
  });

  it('has zero accessibility violations', async () => {
    const { container } = render(<Heading as="h1">Accessible heading</Heading>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
