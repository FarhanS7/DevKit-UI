# Phase H Agent Instructions — CI/CD & Release Pipeline

> **Agent:** Read `AGENT-CONTEXT.md` fully before starting this file.
> **Goal:** Automate pull request testing gates, visual regression tests, bundle size audits, and package publishing workflows.
> **Commit target:** `feat(phase-H): CI/CD Pipeline and Release Automation`

---

## PHASE OVERVIEW

**What this phase produces:**
- Full GitHub Actions CI pipeline (`.github/workflows/ci.yml`) extending step caches and running linting, typechecking, token builds, and Vitest runs.
- Automated Chromatic screenshot visual regression comparisons on every PR.
- Strict bundle size checker script (`scripts/check-bundle-size.js`) checking library outputs, failing the build if the bundle exceeds a strict `80KB` gzip budget.
- Changesets configurations (`.changeset/config.json`) automating semantic versioning.
- Auto-publish release pipeline (`.github/workflows/release.yml`) triggered on merging code to `main`.

**Why this order matters:**
- Changesets configurations and compile variables must be validated locally before push events to GHA can execute workflows.
- Bundle analysis checks must run on built library files.

**Skills to read first:**
- `.agents/skills/senior-backend/SKILL.md`
- `.agents/skills/nodejs-backend-patterns/SKILL.md`

---

## PIPELINE SECURITY & PERFORMANCE RULES

### 1. Unified Cache Strategy
CI builds must be fast. Utilize `actions/cache` matching lockfile hashes to persist the global `pnpm` store across runner nodes.

### 2. Strict Release Protection
- The release workflow only triggers on commits to the `main` branch.
- Packages are only published to the npm registry if all checks (linting, typechecking, unit tests, and bundle limits) pass successfully.

---

## TASK EXECUTION SEQUENCE

---

### TASK H.1 — GitHub Actions CI Workflow
**File:** `Implementation Plan/Phase H - CICD and Release/Task H.1 - GitHub Actions CI Workflow.md`

- **Technical Spec:**
  Construct the complete continuous integration pipeline in `.github/workflows/ci.yml`.
- **Verification:**
  Verify that git triggers run checkout, install, lint, typecheck, build, and test jobs in logical sequence.

---

### TASK H.2 — Chromatic Visual Regression CI
**File:** `Implementation Plan/Phase H - CICD and Release/Task H.2 - Chromatic Visual Regression CI.md`

- **Technical Spec:**
  Add a Chromatic job to the pipeline. Set `CHROMATIC_PROJECT_TOKEN` in the repository secrets.
- **Verification:**
  Verify that PR changes capture story snapshots and flag diff changes in Chromatic dashboards.

---

### TASK H.3 — Bundle Analysis CI Gate
**File:** `Implementation Plan/Phase H - CICD and Release/Task H.3 - Bundle Analysis CI Gate.md`

- **Technical Spec:**
  Create `scripts/check-bundle-size.js` to compute gzip weights on built library elements.
- **Rules:**
  If the gzipped output exceeds `80KB`, print an error and exit with code 1.
- **Verification:**
  Assert that running the script triggers size check computations. Temporarily lower the budget limit (e.g. to 1KB) to confirm it fails the build.

---

### TASK H.4 — Changesets Setup
**File:** `Implementation Plan/Phase H - CICD and Release/Task H.4 - Changesets Setup.md`

- **Technical Spec:**
  Initialize Changesets in the root folder (`pnpm changeset init`). Configure `.changeset/config.json`.
- **Verification:**
  Assert that running `pnpm changeset` opens input dialogues to capture version change logs.

---

### TASK H.5 — npm Publish Automation
**File:** `Implementation Plan/Phase H - CICD and Release/Task H.5 - npm Publish Automation.md`

- **Technical Spec:**
  Create `.github/workflows/release.yml`. Configures Changesets publish actions.
- **Verification:**
  Verify that merging code to `main` executes release pipelines, publishing packages to the npm registry.

---

## PHASE H COMPLETION PROTOCOL

### Run Final Phase Check
```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build:tokens && pnpm build
node scripts/check-bundle-size.js
```

### Create Walkthrough
Create `Walkthroughs/Phase H - CICD and Release/Walkthrough.md` detailing:
1. Continuous integration design patterns.
2. Visual regression screenshot capturing mechanisms.
3. Bundle size analysis logic.
4. Release pipeline setups.

### Git Commit
```bash
git add .
git commit -m "feat(phase-H): CI/CD Pipeline and Release Automation

- GHA workflow: caches pnpm dependencies and runs parallelized test jobs
- Chromatic integration: captures component story screenshot comparisons on PRs
- check-bundle-size.js: enforces strict 80KB gzip limit on core library builds
- Changesets initialized: configures linked versioning for packages
- Automated npm publish and github release notes generation workflows

Phase: H
Tasks: H.1, H.2, H.3, H.4, H.5
Tests: 2 configuration unit | GHA run success
Breaking: none"

git push origin dev
```

### Update Master Index
Open `00-MASTER-INDEX.md` and mark all Phase H tasks as ✅.

---

## WHAT RECRUITER SEES IN THIS COMMIT

A recruiter reviewing this commit sees:
- **"They automate workflows"** — GHA configurations caching files and running builds prove pipeline engineering expertise.
- **"They protect visuals"** — Chromatic visual regression check gates prove component library maintainer capabilities.
- **"They enforce size budgets"** — automated bundle audits prevent code bloat, proving senior system design pragmatism.
