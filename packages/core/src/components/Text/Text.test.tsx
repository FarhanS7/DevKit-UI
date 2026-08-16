import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import * as React from 'react';

import { Text } from './Text.js';

describe('Text component', () => {
  it('renders as a <p> element by default', () => {
    const { container } = render(<Text>Hello</Text>);
    const el = container.firstChild as HTMLElement;
    expect(el.tagName).toBe('P');
    expect(el.textContent).toBe('Hello');
  });

  it('renders with the correct variant classes', () => {
    const { container } = render(<Text variant="body-sm">Small text</Text>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('[font-size:var(--font-size-sm)]');
  });

  it('renders as a custom element via the "as" prop', () => {
    const { container } = render(<Text as="span">Inline</Text>);
    const el = container.firstChild as HTMLElement;
    expect(el.tagName).toBe('SPAN');
  });

  it('merges custom className with variant classes', () => {
    const { container } = render(<Text className="custom-class">Styled text</Text>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('custom-class');
    // Should still have the default variant base class
    expect(el.className).toContain('[font-family:var(--font-family-sans)]');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLParagraphElement>();
    render(<Text ref={ref}>Ref text</Text>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('P');
  });

  it('spreads additional HTML attributes', () => {
    const { container } = render(
      <Text data-testid="text-el" id="my-text">
        Props text
      </Text>
    );
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute('data-testid')).toBe('text-el');
    expect(el.id).toBe('my-text');
  });

  it('applies truncate variant when set', () => {
    const { container } = render(<Text truncate>Long text</Text>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('truncate');
    expect(el.className).toContain('block');
  });

  it('renders code variant with mono font', () => {
    const { container } = render(
      <Text as="code" variant="code">
        const x = 1;
      </Text>
    );
    const el = container.firstChild as HTMLElement;
    expect(el.tagName).toBe('CODE');
    expect(el.className).toContain('[font-family:var(--font-family-mono)]');
  });

  it('has zero accessibility violations', async () => {
    const { container } = render(<Text>Accessible text content</Text>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
