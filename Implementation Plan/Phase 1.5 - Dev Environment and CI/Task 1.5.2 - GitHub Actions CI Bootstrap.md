# Task 1.5.2 — GitHub Actions CI Bootstrap

**Phase:** 1.5 — Dev Environment & CI Bootstrap  
**Blocked by:** A.1–A.4, B.1–B.5  
**Blocks:** H.1, H.5  
**Week:** After Week 2  
**AI Skill to use:** `architecture-patterns`, `senior-backend`

---

## 1. What I'm Building

The continuous integration pipeline script (`.github/workflows/ci.yml`) using GitHub Actions to run automated checks (install, lint, typecheck, build-tokens, test) on every pull request targeting `main` or `dev`.

---

## 2. Architectural Decisions & Trade-offs

- **Sequential Fail-Fast Strategy**: We run static code checks (`lint` and `typecheck`) first. Running these fast checks before building or unit-testing prevents allocating expensive runner resources to code that has trivial type errors or syntax mistakes.
- **Unified Cache Schema**: Caching both the root `pnpm` store and node_modules reduces CI run times from ~4 minutes to under 90 seconds.

---

## 3. Implementation Plan & Approach

Create `.github/workflows/ci.yml` with the following configuration:

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
          fetch-depth: 0 # Required for Chromatic visual tests later

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 8

      - name: Get pnpm Store Directory
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV

      - name: Cache pnpm Modules
        uses: actions/cache@v4
        with:
          path: ${{ env.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Run Environment Check
        run: pnpm check-env

      - name: Lint Codebase
        run: pnpm lint

      - name: Run TypeScript Typecheck
        run: pnpm typecheck

  test-and-build:
    name: Build & Test
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

      - name: Get pnpm Store Directory
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV

      - name: Cache pnpm Modules
        uses: actions/cache@v4
        with:
          path: ${{ env.STORE_PATH }}
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
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Token Compilation Sequence**: The `test` job depends on the token packages being compiled first. Because `packages/core` imports generated token definitions (`dist/tokens.ts`), running tests or builds before compiling design tokens will trigger compilation errors due to missing type files.
- **Frozen Lockfile Enforcement**: Always run `pnpm install --frozen-lockfile` in CI. If a developer forgets to commit their local lockfile modifications, this parameter will cause the build step to fail immediately, preventing lockfile drift.

---

## 5. Definition of Done

- [ ] `.github/workflows/ci.yml` is syntactically valid YAML.
- [ ] Pipeline sets up Node 20 and caches dependencies using lockfile checksum hashes.
- [ ] CI pipeline triggers automatically when committing to a test branch.
- [ ] Pipeline fails cleanly if `pnpm typecheck` or `pnpm test` fails.

---

## 6. QA Test Scenarios

| Scenario              | Command                              | Expected Result                                                                            |
| --------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------ |
| YAML Linter Check     | Use local tool or push configuration | GitHub parses and displays the action workflow without syntax errors.                      |
| Test Job Dependencies | View PR execution logs               | The `Build & Test` job waits and runs only after `Lint & Typecheck` finishes successfully. |
| Cache Check           | Inspect run execution steps          | Action logs show "Cache restored" or "Cache saved" on subsequent runs.                     |

---

## 7. AI Code Loop Prompt

```
TASK: 1.5.2 — GitHub Actions CI Bootstrap

Create a new directory .github/workflows in the root workspace.
Create .github/workflows/ci.yml. Set up a multi-job workflow containing 'lint-and-typecheck' and 'test-and-build'.
Install Node 20, setup pnpm version 8, configure actions/cache to cache the local pnpm store based on pnpm-lock.yaml hashing, and configure running linting, typechecking, building design tokens, building libraries, and running Vitest tests in sequence.
```
