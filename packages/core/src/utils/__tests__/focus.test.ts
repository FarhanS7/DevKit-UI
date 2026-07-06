/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';

import { getFocusableElements, isElementFocusable, isElementVisible } from '../focus.js';

describe('Focus Utility Helpers', () => {
  it('correctly identifies visible elements', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    expect(isElementVisible(div)).toBe(true);

    div.style.display = 'none';
    expect(isElementVisible(div)).toBe(false);

    div.style.display = 'block';
    div.style.visibility = 'hidden';
    expect(isElementVisible(div)).toBe(false);

    document.body.removeChild(div);
  });

  it('correctly identifies focusable elements', () => {
    const btn = document.createElement('button');
    document.body.appendChild(btn);
    expect(isElementFocusable(btn)).toBe(true);

    btn.disabled = true;
    expect(isElementFocusable(btn)).toBe(false);

    document.body.removeChild(btn);
  });

  it('excludes anchor tags without href attributes', () => {
    const a = document.createElement('a');
    document.body.appendChild(a);
    expect(isElementFocusable(a)).toBe(false);

    a.href = '#';
    expect(isElementFocusable(a)).toBe(true);

    document.body.removeChild(a);
  });

  it('gets all focusable elements in a container in layout order', () => {
    const container = document.createElement('div');

    const input = document.createElement('input');
    const hiddenBtn = document.createElement('button');
    hiddenBtn.style.display = 'none';
    const a = document.createElement('a');
    a.href = 'https://example.com';
    const noHrefA = document.createElement('a');

    container.appendChild(input);
    container.appendChild(hiddenBtn);
    container.appendChild(a);
    container.appendChild(noHrefA);

    document.body.appendChild(container);

    const focusables = getFocusableElements(container);
    expect(focusables.length).toBe(2);
    expect(focusables[0]).toBe(input);
    expect(focusables[1]).toBe(a);

    document.body.removeChild(container);
  });
});
