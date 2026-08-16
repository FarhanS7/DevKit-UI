# Task H.1 — GitHub Actions CI Workflow

**Phase:** H — CI/CD & Release Pipeline  
**Blocked by:** D.8  
**Blocks:** H.2, H.3  
**Week:** 5  
**AI Skill to use:** `architecture-patterns`

---

## 1. What I'm Building

A complete, production-grade GitHub Actions CI workflow (`.github/workflows/ci.yml`) that refines the initial bootstrap pipeline (1.5.2). It runs linting, strict typechecking, token compiles, Vitest unit tests, Playwright functional checks, and bundle size gates in parallel.

---

## 2. Architectural Decisions & Trade-offs

- **Parallelized Job Execution**: While linting and typechecking must run first to fail fast, jobs like Playwright tests, Chromatic, and Bundle Analysis run in parallel once code compiles. This minimizes total build-wait times for pull requests.
- **Workflow cache persistency**: Caching dependencies keeps pull request gates running in under 2 minutes.

---

## 3. Implementation Plan & Approach

Create or update `.github/workflows/ci.yml` to define the full multi-job check pipeline:

```yaml
name: Continuous Integration

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

jobs:
  lint-and-typecheck:
    name: Lint & Typecheck
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 8

      - name: Get pnpm Store
        id: pnpm-cache
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV

      - name: Cache pnpm
        uses: actions/cache@v4
        with:
          path: ${{ env.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint Codebase
        run: pnpm lint

      - name: Run Typecheck
        run: pnpm typecheck

  test-and-build:
    name: Build & Unit Test
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 8

      - name: Cache pnpm
        uses: actions/cache@v4
        with:
          path: ${{ env.STORE_PATH || '~/.local/share/pnpm/store/v3' }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Build Design Tokens
        run: pnpm build:tokens

      - name: Compile Core Packages
        run: pnpm build

      - name: Run Unit Tests
        run: pnpm test

  playwright-tests:
    name: Playwright E2E Tests
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 8

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright Browsers
        run: pnpm exec playwright install --with-deps chromium

      - name: Build Design Tokens
        run: pnpm build:tokens

      - name: Compile Core
        run: pnpm build

      - name: Run Playwright tests
        run: pnpm exec playwright test
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Playwright Browser Caching**: Downloading browsers on every E2E run is slow. We only install `chromium` to test keyboard focus, which keeps test times under 1 minute.
- **Dependency Caching**: If packages' build outputs or directories mismatch, run `pnpm store prune` to align cache indices.

---

## 5. Definition of Done

- [ ] `.github/workflows/ci.yml` implements sequential and parallel jobs.
- [ ] Pipeline executes lint, typecheck, build, unit test, and Playwright jobs successfully.
- [ ] Committing malformed code fails the pipeline and blocks pull request merges.

---

## 6. QA Test Scenarios

| Scenario                    | Command                               | Expected Result                                                             |
| --------------------------- | ------------------------------------- | --------------------------------------------------------------------------- |
| Verify PR pipeline triggers | Push commit to PR                     | Workflow triggers, displaying all job stages.                               |
| Test type check failures    | Commit type errors and check pipeline | Pipeline fails at the `Lint & Typecheck` stage, blocking subsequent builds. |

---

## 7. AI Code Loop Prompt

```
TASK: H.1 — GitHub Actions CI Workflow

Modify .github/workflows/ci.yml.
Extend workflow to set up Node 20, cache pnpm, and execute parallelized jobs.
Configure 'lint-and-typecheck', 'test-and-build', and 'playwright-tests' jobs.
Ensure playwright installs only chromium to verify keyboard accessibility, with 'test-and-build' and 'playwright-tests' waiting for 'lint-and-typecheck' success.
```
