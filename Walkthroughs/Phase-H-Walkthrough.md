# Phase H — CI/CD Pipeline & Release Workflows Walkthrough

## Overview

Phase H established production-grade Continuous Integration (CI) and Continuous Delivery (CD) release workflows for `@devkit-ui/monorepo`.

## Workflows & Tools Summary

1. **GitHub Actions CI Pipeline** (`.github/workflows/ci.yml`):
   - Multi-job parallel execution: `lint-and-typecheck`, `test-and-build`, `playwright-tests`, and `chromatic-deployment`.
   - Setup Node.js 20, pnpm v9 store caching.

2. **Chromatic Visual Regression** (`.github/workflows/ci.yml`):
   - Published Storybook builds to Chromatic cloud visual testing for pixel diff detection on pull requests.

3. **Bundle Size Audit Gate** (`scripts/check-bundle-size.js`):
   - Computes gzipped bundle sizes for `@devkit-ui/core`.
   - Asserts against strict **80 KB** budget limit (currently **20.99 KB** gzipped).
   - Integrated into CI `test-and-build` job with `pnpm check-size`.

4. **Monorepo Versioning via Changesets** (`.changeset/config.json`):
   - Configured lockstep semver linking for `@devkit-ui/core` and `@devkit-ui/tokens`.
   - Markdown changelogs for pull requests.

5. **npm Automated Release Pipeline** (`.github/workflows/release.yml`):
   - Triggers on `main` push events.
   - Executes `changesets/action` to version packages and publish to the npm registry with `"publishConfig": { "access": "public" }`.

## Test & Build Verification

- **122 total unit & accessibility tests** passing 100%
- Gzipped library bundle size: **20.99 KB** (budget: 80 KB)
