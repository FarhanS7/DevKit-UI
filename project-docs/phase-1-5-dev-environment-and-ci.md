# Phase 1.5 — Dev Environment, CI Bootstrap & Integration Tests
## Project: AI-Powered Design System & Component Library

> **When to do this:** After Module A (monorepo scaffold) and Module B (token pipeline) are working. Do NOT wait for all Phase 1 tasks to be done. The earlier CI runs, the earlier it catches regressions. The dev environment setup here is a prerequisite for all Phase 2 coding sessions.

---

## 1.5.1 — Local Dev Environment Verification Checklist

This is not a task to build — it's a checklist to confirm the environment works before any serious coding begins. Run through this after A.1–A.4 and B.1–B.4 are done.

### System Prerequisites (verify once)

```bash
node --version      # Must be ≥ 20.x (LTS)
pnpm --version      # Must be ≥ 8.x
git --version       # Any recent version
```

**Do not use npm or yarn** in this project. `pnpm-lock.yaml` is the lockfile. If `package-lock.json` or `yarn.lock` appear, delete them immediately and add them to `.gitignore`.

### One-Command Setup (verify this actually works on a fresh clone)

```bash
git clone https://github.com/yourusername/ui.git
cd ui
pnpm install          # Should resolve all workspaces cleanly, no errors
pnpm build:tokens     # packages/tokens → dist/tokens.css, tokens.dark.css, tokens.ts
pnpm dev              # Starts Storybook at localhost:6006
```

If any of these fail on a fresh clone, the project is not contributor-ready. Fix before proceeding to Phase 2.

### Verify Each Package Builds

```bash
pnpm -r build         # Runs build in all packages (packages/core, packages/tokens)
```

Expected output:
- `packages/tokens/dist/tokens.css` — exists, non-empty, contains `:root {`
- `packages/tokens/dist/tokens.dark.css` — exists, non-empty, contains `[data-theme="dark"] {`
- `packages/tokens/dist/tokens.ts` — exists, non-empty, contains `export const tokens`
- `packages/core/dist/index.mjs` — exists (may be minimal at this stage)
- `packages/core/dist/index.cjs` — exists

### Verify Storybook

```bash
pnpm dev
# Open http://localhost:6006
```

Checklist:
- [ ] Storybook loads without console errors
- [ ] Dark mode toggle is visible in toolbar
- [ ] Toggling dark mode changes the preview background (token CSS is wired)
- [ ] The `@storybook/addon-a11y` tab is visible in the story panel

### Verify TypeScript Across All Packages

```bash
pnpm typecheck        # Runs tsc --noEmit in all packages
```

Must pass with zero errors. If there are errors at this stage (before any component code), fix them immediately — they indicate a misconfigured tsconfig, not a future problem.

### Verify Linting

```bash
pnpm lint             # ESLint across all packages
pnpm format --check   # Prettier check
```

Both must pass on the scaffold. If ESLint reports errors on generated/scaffold files, either fix them or add targeted `.eslintignore` entries — do not turn off rules globally.

### Verify Test Runner

```bash
pnpm test             # Vitest — should pass with 0 tests (no tests yet) or basic smoke tests
```

Expected output: `No test files found` or all green. A test runner that fails to start is a blocker for everything downstream.

### Verify the Token Pipeline Is Actually Used by Components

Create a temporary smoke test: add a single Tailwind class that uses a CSS custom property defined in tokens.css to a placeholder component. Open it in Storybook. If the token resolves correctly (you see the right color), the pipeline is wired end-to-end.

---

## 1.5.2 — CI Pipeline Bootstrap (GitHub Actions)

Set up the CI workflow **before** writing any component tests. The workflow file should exist and be green before meaningful component code is written — otherwise you're writing untested code for weeks before CI can validate it.

### Workflow Structure: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck

  test:
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build:tokens
      - run: pnpm test --coverage

  playwright:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build:tokens
      - run: pnpm build:storybook
      - run: npx playwright install --with-deps chromium
      - run: pnpm test:e2e

  chromatic:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0        # Required by Chromatic for git history comparison
      - uses: pnpm/action-setup@v3
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build:tokens
      - uses: chromaui/action@latest
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          buildScriptName: build:storybook

  bundle-analysis:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build:tokens
      - run: pnpm build
      - name: Check bundle size
        run: node scripts/check-bundle-size.js   # exits 1 if > 80KB gzip
```

### Bundle Size Check Script: `scripts/check-bundle-size.js`

```javascript
const { statSync } = require('fs');
const { execSync } = require('child_process');

const LIMIT_BYTES = 80 * 1024; // 80KB

// Gzip the ESM output and measure
execSync('gzip -k packages/core/dist/index.mjs');
const stats = statSync('packages/core/dist/index.mjs.gz');

console.log(`Bundle size: ${(stats.size / 1024).toFixed(2)} KB gzip`);

if (stats.size > LIMIT_BYTES) {
  console.error(`❌ Bundle exceeds 80KB gzip limit. Current: ${(stats.size / 1024).toFixed(2)} KB`);
  process.exit(1);
}

console.log(`✅ Bundle size within limit.`);
```

### CI Bootstrap Checklist

- [ ] `ci.yml` committed to `.github/workflows/`
- [ ] First push to `main` — CI runs and all jobs pass (with minimal code)
- [ ] Chromatic first run — baseline approved manually
- [ ] `CHROMATIC_PROJECT_TOKEN` added to GitHub repo secrets
- [ ] `NODE_AUTH_TOKEN` (npm token) added for release workflow (H.5)
- [ ] Bundle size check: passes at 0KB (no components yet), will grow as components are added

---

## 1.5.3 — Cross-Module Integration Tests

These are tests that cross package boundaries — they verify that the pieces work together, not in isolation. Write the first integration test after Module D (Tier 1 components) is done.

### Integration Test 1: Token → Component → Storybook Rendering

**What it verifies:** The full pipeline from `tokens.json` → CSS custom properties → component renders with correct visual style in Storybook.

**How to test:**
1. Change a token value in `tokens.json` (e.g. `color.primitive.brand.primary` from `#6366f1` to `#ff0000`)
2. Run `pnpm build:tokens`
3. Open Storybook — the Button primary variant should now be red
4. Revert the change

This is a manual test — not automated. Run it once to confirm the pipeline is truly end-to-end. Document the result in a comment in `tokens.json`.

**Automation approach (optional):** A Chromatic comparison between a tokens-changed branch and `main` will catch visual regressions automatically. This is the real automated version of this test.

---

### Integration Test 2: Polymorphic Button as Link — Type Safety Across Modules

**What it verifies:** The polymorphic types in `packages/core/src/utils/polymorphic.ts` (C.2) correctly constrain the Button API even when imported by a consumer outside the package.

**Test file:** `packages/core/src/components/Button/Button.test-d.ts`

```typescript
import { expectTypeOf } from 'vitest';
import { Button } from './Button';

// A plain button accepts onClick, not href
expectTypeOf(<Button onClick={() => {}}>Click</Button>).not.toBeNever();
expectTypeOf(<Button href="/path">Link</Button>).toBeNever(); // href not valid on button

// As an anchor, href is required
expectTypeOf(<Button as="a" href="/path">Link</Button>).not.toBeNever();
// @ts-expect-error — href required on anchor
expectTypeOf(<Button as="a">Link</Button>);
```

Run with: `pnpm test --typecheck` (Vitest supports `.test-d.ts` type testing via `expectTypeOf`).

---

### Integration Test 3: Dialog — Full Compound Component Flow

**What it verifies:** The Dialog compound component (E.3) works as a composed unit across its sub-components. This tests the React context plumbing across `Dialog`, `Dialog.Trigger`, `Dialog.Content`, `Dialog.Title`, `Dialog.Close`.

**Test file:** `apps/docs/tests/Dialog.integration.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Dialog } from '@yourusername/ui';

expect.extend(toHaveNoViolations);

describe('Dialog integration', () => {
  it('opens on trigger click, traps focus, closes on Escape', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Test Dialog</Dialog.Title>
          <button>Action</button>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Content>
      </Dialog>
    );

    // Dialog is not in DOM initially
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Click trigger
    await user.click(screen.getByText('Open'));

    // Dialog is now open
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Focus is inside the dialog
    expect(document.activeElement).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement);

    // Escape closes dialog
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Focus returns to trigger
    expect(document.activeElement).toBe(screen.getByText('Open'));
  });

  it('has zero axe violations when open', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Dialog>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Accessible Dialog</Dialog.Title>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Content>
      </Dialog>
    );

    await user.click(screen.getByText('Open'));
    const results = await axe(document.body);  // Note: axe on document.body, not container (portal renders outside container)
    expect(results).toHaveNoViolations();
  });
});
```

---

### Integration Test 4: VirtualList with Real Data — Performance Regression Guard

**What it verifies:** VirtualList (F.1) renders a large dataset without performance regression. This is a lightweight smoke test — real performance testing requires a profiler — but it catches obvious regressions like "forgot to virtualize, now rendering 10k DOM nodes."

**Test file:** `packages/core/src/components/VirtualList/VirtualList.integration.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { VirtualList } from './VirtualList';

const items = Array.from({ length: 10_000 }, (_, i) => ({ id: i, label: `Item ${i}` }));

describe('VirtualList integration', () => {
  it('renders far fewer DOM nodes than items (virtualization is active)', () => {
    const { container } = render(
      <VirtualList
        items={items}
        itemHeight={40}
        containerHeight={400}
        renderItem={(item) => <div key={item.id}>{item.label}</div>}
      />
    );

    // With 10k items and 400px container / 40px rows = 10 visible + overscan
    // Max DOM nodes should be < 50 (much less than 10,000)
    const renderedItems = container.querySelectorAll('[data-virtual-item]');
    expect(renderedItems.length).toBeLessThan(50);
    expect(renderedItems.length).toBeGreaterThan(5); // Sanity: some items rendered
  });
});
```

---

### Integration Test 5: Token TypeScript Constants — No Breaking Drift Between JSON and Generated TS

**What it verifies:** After a `pnpm build:tokens`, the generated `tokens.ts` constants match what's in `tokens.json`. This catches the case where `tokens.json` is updated but `build:tokens` was not run before the commit.

**This test is run in CI as part of the `test` job:**

```typescript
// packages/tokens/src/__tests__/token-drift.test.ts
import { tokens } from '../dist/tokens';
import rawTokens from '../tokens.json';

describe('Token drift guard', () => {
  it('generated tokens.ts includes all top-level token categories from tokens.json', () => {
    const jsonTopLevel = Object.keys(rawTokens);
    const generatedTopLevel = Object.keys(tokens);

    for (const category of jsonTopLevel) {
      expect(generatedTopLevel).toContain(category);
    }
  });
});
```

**CI enforcement:** Add a `prebuild` hook in `packages/tokens/package.json` that runs `pnpm build:tokens` before `pnpm test`. If the generated output is stale, the test will fail. If the test fails in CI, the developer is reminded to run `pnpm build:tokens` before committing.

---

## 1.5.4 — Branch Strategy

Keep it simple for a solo project:

| Branch | Purpose |
|--------|---------|
| `main` | Stable, always passes CI, always publishable |
| `dev` | Active development branch — PRs merge here first |
| `feat/module-X-task-Y` | Feature branches — one per Phase 1 task |

**PR flow:** `feat/*` → `dev` (after local CI passes) → `main` (weekly, when dev is stable)

**Commit message convention:** [Conventional Commits](https://www.conventionalcommits.org)
- `feat(button): add isLoading prop with aria-busy` — triggers `minor` version bump
- `fix(dialog): restore focus on close when trigger is removed from DOM` — triggers `patch`
- `chore(ci): add bundle analysis step` — no version bump
- `docs(storybook): add DarkMode story for all Tier 1 components` — no version bump

Changesets reads these commit messages to suggest the appropriate version bump.

---

## 1.5.5 — Developer Experience: Scripts Reference

All scripts are defined in the root `package.json`. Every developer (including future-you two months from now) should be able to run these without consulting documentation:

```json
{
  "scripts": {
    "dev":              "pnpm build:tokens && pnpm -F apps/docs storybook",
    "build":            "pnpm build:tokens && pnpm -F packages/core build",
    "build:tokens":     "pnpm -F packages/tokens build",
    "build:storybook":  "pnpm -F apps/docs build-storybook",
    "test":             "pnpm -r test",
    "test:e2e":         "pnpm -F apps/docs playwright test",
    "typecheck":        "pnpm -r typecheck",
    "lint":             "eslint . --ext .ts,.tsx",
    "format":           "prettier --write .",
    "format:check":     "prettier --check .",
    "changeset":        "changeset",
    "version":          "changeset version",
    "release":          "pnpm build && changeset publish"
  }
}
```

**The `dev` script runs `build:tokens` first** — this ensures the token CSS is always fresh when Storybook starts. Without this, a stale `dist/tokens.css` would make components render incorrectly in Storybook after a token change.

---

*Phase 1.5 complete. CI is green. Local dev works from a fresh clone. Integration test structure is established. Begin Phase 2 (AI Code Loop) for individual tasks.*
