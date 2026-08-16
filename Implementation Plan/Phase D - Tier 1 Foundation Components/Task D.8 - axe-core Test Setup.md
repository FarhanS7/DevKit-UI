# Task D.8 — axe-core Test Setup

**Phase:** D — Tier 1 Foundation Components  
**Blocked by:** D.1–D.7  
**Blocks:** H.1  
**Week:** 5  
**AI Skill to use:** `senior-frontend`

---

## 1. What I'm Building

Automated accessibility test setup inside Vitest using `jest-axe`. It extends Vitest assertions with `toHaveNoViolations` to run WCAG audits on all components across all states (empty, active, focus, disabled, loading).

---

## 2. Architectural Decisions & Trade-offs

- **Automated CI Gate**: Programmatic check gates in our test suite ensure that accessibility checks run on every local code change and PR build. If a code change degrades a component's accessibility (such as a focus border contrast drop or missing landmark links), the test suite fails the build immediately.
- **Environment Isolation**: Cleaning up mounted DOM portals between checks prevents test pollution, which could trigger false positive violations.

---

## 3. Implementation Plan & Approach

### 1. Install packages in `packages/core`

Install `jest-axe` and its types:

```bash
cd packages/core && pnpm add -D jest-axe @types/jest-axe
```

### 2. Configure `packages/core/src/test/setup.ts`

Extend Vitest's expect matchers:

```typescript
// packages/core/src/test/setup.ts
import { expect, cleanup } from 'vitest';
import { toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom/vitest';

// Extend matchers
expect.extend(toHaveNoViolations);

// Cleanup after each test run
afterEach(() => {
  cleanup();
});
```

Verify your root or workspace `vitest.config.ts` loads this setup file:

```typescript
setupFiles: ['./src/test/setup.ts'],
```

### 3. Write typical axe-core test check

Create an example test case inside `packages/core/src/components/Button/Button.test.tsx` (and similarly for other components):

```typescript
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Button } from './Button';

describe('Button Accessibility', () => {
  it('should have zero accessibility violations in default state', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have zero violations in loading state', async () => {
    const { container } = render(<Button isLoading>Loading</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Do not bypass rules blindly**: If a third-party primitive triggers an issue, resolve the markup layout or pass correct labels rather than disabling the rule inside `jest-axe` configuration options.
- **Portalled Element Audits**: Because portals mount children outside the test container's root node, calling `axe(container)` will miss portalled overlays (like Dialog contents). You must pass `document.body` or query the specific portalled target node:
  ```typescript
  const results = await axe(document.body);
  ```

---

## 5. Definition of Done

- [ ] `jest-axe` is configured inside the core package.
- [ ] Setup configurations extend Vitest's `expect` rules cleanly.
- [ ] Running `pnpm test` triggers accessibility audits on Button and Input elements.
- [ ] All Tier 1 components compile and pass the axe audits in all states with 0 violations.

---

## 6. QA Test Scenarios

| Scenario                 | Command                                            | Expected Result                                                       |
| ------------------------ | -------------------------------------------------- | --------------------------------------------------------------------- |
| Run accessibility checks | `pnpm --filter @yourusername/core test`            | Tests execute, passing `toHaveNoViolations` checks.                   |
| Test failure validation  | Mount an input lacking labels in a test and assert | `jest-axe` returns violation (missing label link) and fails the test. |

---

## 7. AI Code Loop Prompt

```
TASK: D.8 — axe-core Test Setup

Install jest-axe and @types/jest-axe as devDependencies in packages/core.
Configure packages/core/src/test/setup.ts to extend Vitest with toHaveNoViolations.
Verify vitest.config.ts points to this setupFiles location.
Add axe tests to packages/core/src/components/Button/Button.test.tsx and Input.test.tsx using the 'axe' validator.
```
