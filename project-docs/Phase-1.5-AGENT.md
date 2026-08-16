# Phase 1.5 Agent Instructions — Dev Environment & CI Bootstrap

> **Agent:** Read `AGENT-CONTEXT.md` fully before starting this file.
> **Goal:** Validate the local monorepo environment, set up the continuous integration pipeline, establish cross-module integration/type tests, and formalize git branching/commit rules.
> **Commit target:** `feat(phase-1.5): Dev Environment & CI Bootstrap`

---

## PHASE OVERVIEW

**What this phase produces:**
- Programmatic script (`scripts/check-env.js`) verifying the local Node, pnpm, and Git configurations.
- A fully functional GitHub Actions CI pipeline (`.github/workflows/ci.yml`) enforcing code quality gates (linting, typechecking, building, and unit testing).
- Integration test suite under `packages/tokens` to prevent token drift (`token-drift.test.ts`), and placeholder configurations for type-level tests.
- Git commit message formatting rules (Husky + Commitlint configuration) to enforce Conventional Commits.

**Why this order matters:**
Before coding any complex components (Phases D–G), we must have automated safeguards to ensure that multiple packages in our workspace link and resolve types correctly, and that every developer contribution is verified. Setting up CI early prevents integration headaches later.

**Skills to read first:**
- `.agents/skills/architecture-patterns/SKILL.md`
- `.agents/skills/senior-backend/SKILL.md`

---

## TASK EXECUTION ORDER

Execute tasks in this exact sequence. Do not start the next task until the current one is verified.

---

### TASK 1.5.1 — Local Dev Verification
**File:** `Implementation Plan/Phase 1.5 - Dev Environment and CI/Task 1.5.1 - Local Dev Verification.md`

**What to build:**
Create a custom programmatic checker script `scripts/check-env.js` and add a workspace validation step.

**Verification:**
```bash
node scripts/check-env.js
# Must print: Env verification: Node 20+, pnpm 8+, and Git detected successfully.
```

**Checklist:**
- [ ] `check-env.js` runs in Node.js and exits with code 0 on success, code 1 on failure.
- [ ] Scripts in the root `package.json` include `pnpm check-env` referencing the script.
- [ ] Verified that `pnpm build:tokens` compiles the design tokens dist without warning.
- [ ] Verified that `pnpm typecheck` successfully checks all workspaces.

---

### TASK 1.5.2 — GitHub Actions CI Bootstrap
**File:** `Implementation Plan/Phase 1.5 - Dev Environment and CI/Task 1.5.2 - GitHub Actions CI Bootstrap.md`

**What to build:**
Create `.github/workflows/ci.yml` defining cache settings and parallel test configurations.

**Key Decisions:**
- Use Node 20 and caching via `pnpm/action-setup` to avoid long build times.
- Set up a sequential pipeline where `lint-and-typecheck` is a pre-requisite for running unit tests.
- Exclude Playwright and Chromatic credentials issues from blocking simple CI runs (use soft failure if needed or conditional checks for PRs from forks).

**Verification:**
- Run the yaml structure validation check.
- Push the CI configuration to a dev branch and inspect the GitHub Actions run results. All jobs (install, lint, typecheck, build-tokens, test) must pass.

**Checklist:**
- [ ] `.github/workflows/ci.yml` is correctly placed and uses standard action configurations.
- [ ] pnpm lockfile cache keys are defined.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm build:tokens`, and `pnpm test` run inside the CI pipeline.

---

### TASK 1.5.3 — Cross-Module Integration Tests
**File:** `Implementation Plan/Phase 1.5 - Dev Environment and CI/Task 1.5.3 - Cross-Module Integration Tests.md`

**What to build:**
Create `packages/tokens/src/__tests__/token-drift.test.ts` checking JSON mappings and configure type testing paths in core.

**Verification:**
```bash
pnpm test
# The token-drift.test.ts must run and pass.
# Temporarily edit packages/tokens/tokens.json to add a dummy top-level semantic category, then run pnpm test -> it must fail due to drift.
```

**Checklist:**
- [ ] Token drift test correctly compares source `tokens.json` to generated `tokens.ts`.
- [ ] Vitest test configuration is updated to handle `.test-d.ts` checks without breaking runtime tests.
- [ ] Running tests at the root level triggers the token-drift check.

---

### TASK 1.5.4 — Branch Strategy & Commit hook
**File:** `Implementation Plan/Phase 1.5 - Dev Environment and CI/Task 1.5.4 - Branch Strategy.md`

**What to build:**
Configure Commitlint and Husky hooks to intercept commits that do not match the Conventional Commits specifications.

**Verification:**
```bash
# Attempt to make a non-conforming commit message
git commit -m "fixed buttons"
# Must return an error and block the commit.

# Attempt a conforming message
git commit -m "fix(button): align focus ring parameters"
# Must succeed.
```

**Checklist:**
- [ ] `.husky/commit-msg` script calls commitlint rules correctly.
- [ ] Commitlint config file extends `@commitlint/config-conventional` standard.
- [ ] Developers cannot bypass rules without explicitly using `--no-verify`.

---

## PHASE 1.5 COMPLETION PROTOCOL

When ALL 4 tasks are verified:

### Run Final Phase Check
```bash
node scripts/check-env.js   # Must pass
pnpm lint                   # Must pass
pnpm typecheck              # Must pass
pnpm test                   # All tests pass (including token drift)
```

### Create Walkthrough
Create `Walkthroughs/Phase 1.5 - Dev Environment and CI/1.5 Walkthrough.md` explaining:
1. What scripts and workflows were created and why.
2. The caching strategies applied to GHA builds.
3. How type-level tests differ from runtime component tests.

### Git Commit
```bash
git add .
git commit -m "feat(phase-1.5): Dev Environment & CI Bootstrap

- Added check-env.js script to programmatically verify local developer dependencies
- Initialized GitHub Actions CI pipeline with pnpm store caching and step dependencies
- Implemented token drift check in packages/tokens to prevent stale compiles
- Enforced Conventional Commit format via Husky and Commitlint hooks

Phase: 1.5
Tasks: 1.5.1, 1.5.2, 1.5.3, 1.5.4
Tests: 1 unit (token drift)
Breaking: none"

git push origin dev
```

### Update Master Index
Open `00-MASTER-INDEX.md` and mark all Phase 1.5 tasks as ✅.

---

## WHAT RECRUITER SEES IN THIS COMMIT

A recruiter reviewing this commit sees:
- **"They write tests to prevent developer errors"** — the token drift guard shows understanding of monorepo build sync challenges.
- **"They optimize for CI efficiency"** — using pnpm caches and logical task chains shows engineering practicality.
- **"They maintain clean git hygiene"** — commitlint ensures the commit log remains readable and parseable for automated version bumps.
