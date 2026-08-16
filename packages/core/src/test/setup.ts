/**
 * Global Vitest test setup for @devkit-ui/core.
 *
 * This file is loaded before every test file via `setupFiles` in vite.config.ts.
 * It configures:
 *   1. jest-axe matchers — extends Vitest's `expect` with `toHaveNoViolations`
 *   2. DOM cleanup — prevents test pollution from leaked DOM nodes between tests
 */
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom/vitest';

// Extend Vitest matchers globally so individual tests never need to call
// `expect.extend(toHaveNoViolations)` themselves.
expect.extend(toHaveNoViolations);

// Automatically unmount React trees and clean up the DOM after each test.
afterEach(() => {
  cleanup();
});
