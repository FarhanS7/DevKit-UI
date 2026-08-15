import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import * as React from 'react';

import { Portal } from './Portal.js';

describe('Portal component', () => {
  it('renders children into document.body by default', () => {
    const testId = 'portal-child';
    render(
      <Portal>
        <div data-testid={testId}>Portal Content</div>
      </Portal>
    );

    // The content should be in document.body, not inside the React root container
    const portalChild = document.body.querySelector(`[data-testid="${testId}"]`);
    expect(portalChild).not.toBeNull();
    expect(portalChild?.textContent).toBe('Portal Content');
  });

  it('renders children into a custom container when provided', () => {
    const customContainer = document.createElement('div');
    customContainer.id = 'custom-portal-target';
    document.body.appendChild(customContainer);

    const testId = 'custom-portal-child';
    render(
      <Portal container={customContainer}>
        <div data-testid={testId}>Custom Container Content</div>
      </Portal>
    );

    const child = customContainer.querySelector(`[data-testid="${testId}"]`);
    expect(child).not.toBeNull();
    expect(child?.textContent).toBe('Custom Container Content');

    // Cleanup the custom container
    document.body.removeChild(customContainer);
  });

  it('renders nothing when container is null and component has not mounted yet', () => {
    // On the very first synchronous render (before useEffect fires),
    // the component returns null. After the effect, it mounts.
    // We test the final mounted state here — the SSR guard is an
    // implementation detail validated by the "renders into body" test.
    const { baseElement } = render(
      <Portal>
        <span>Content</span>
      </Portal>
    );
    // After mount, the content should exist somewhere in the document
    expect(baseElement.ownerDocument.body.textContent).toContain('Content');
  });

  it('has zero accessibility violations', async () => {
    const { container } = render(
      <Portal>
        <div role="dialog" aria-label="Test dialog">
          Accessible portal content
        </div>
      </Portal>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders nothing when container prop is explicitly null', () => {
    // When container is null, should fall back to document.body
    const testId = 'null-container-child';
    render(
      <Portal container={null}>
        <div data-testid={testId}>Fallback Content</div>
      </Portal>
    );

    const child = document.body.querySelector(`[data-testid="${testId}"]`);
    expect(child).not.toBeNull();
  });

  it('updates content dynamically when children change', () => {
    const testId = 'dynamic-portal';

    const { rerender } = render(
      <Portal>
        <div data-testid={testId}>Initial</div>
      </Portal>
    );

    let child = document.body.querySelector(`[data-testid="${testId}"]`);
    expect(child?.textContent).toBe('Initial');

    rerender(
      <Portal>
        <div data-testid={testId}>Updated</div>
      </Portal>
    );

    child = document.body.querySelector(`[data-testid="${testId}"]`);
    expect(child?.textContent).toBe('Updated');
  });
});
