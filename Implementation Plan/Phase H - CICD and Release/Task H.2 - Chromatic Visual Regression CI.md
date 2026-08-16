# Task H.2 — Chromatic Visual Regression CI

**Phase:** H — CI/CD & Release Pipeline  
**Blocked by:** H.1  
**Blocks:** H.4  
**Week:** 5  
**AI Skill to use:** `architecture-patterns`

---

## 1. What I'm Building

Automated visual regression tests in the CI pipeline using Chromatic. It captures component screenshots for every story and flags layout diff changes on PRs.

---

## 2. Architectural Decisions & Trade-offs

- **Chromatic Storybook Snapshot validation**: Writing manual tests to assert CSS layouts and borders is brittle. Chromatic captures cloud-based visual snapshots of all Storybook stories, highlighting pixel diff changes on pull requests automatically.
- **Git Commit Baseline trees**: Chromatic requires complete Git log history (`fetch-depth: 0` in checkout actions) to resolve parent commit baselines.

---

## 3. Implementation Plan & Approach

### 1. Add Chromatic job to `.github/workflows/ci.yml`

Append the following job parameters under the `jobs` section in your CI workflow:

```yaml
chromatic-deployment:
  name: Chromatic Visual Regression
  runs-on: ubuntu-latest
  needs: lint-and-typecheck
  steps:
    - name: Checkout Code
      uses: actions/checkout@v4
      with:
        fetch-depth: 0 # Required for Chromatic history lookup

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

    - name: Build Design Tokens
      run: pnpm build:tokens

    - name: Build Core Library
      run: pnpm build

    - name: Publish to Chromatic
      uses: chromatichq/action@v11
      with:
        projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
        workingDir: apps/docs
        buildScriptName: build-storybook
```

### 2. Configure repository secrets

In your GitHub repository settings, navigate to **Secrets and variables > Actions** and add `CHROMATIC_PROJECT_TOKEN` containing your Chromatic project token.

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Unlimited depth check**: If you set `fetch-depth: 1` (default shallow checkout) in actions, Chromatic will throw errors because it cannot locate baseline history to compare pixels.
- **Storybook build scripts**: Ensure the `buildScriptName` maps to the script defined in `apps/docs/package.json` (usually `"build-storybook"`).

---

## 5. Definition of Done

- [ ] Chromatic job is added to the GHA pipeline.
- [ ] Committing to pull requests publishes Storybook builds to Chromatic.
- [ ] Pixels diffs flag review warnings on PRs, requiring manual baseline approvals.

---

## 6. QA Test Scenarios

| Scenario                 | Command                                                 | Expected Result                                                         |
| ------------------------ | ------------------------------------------------------- | ----------------------------------------------------------------------- |
| Verify PR deployment     | Commit visual changes to a button (e.g. padding offset) | Chromatic job finishes, showing a PR warning containing diff snapshots. |
| Verify baseline approval | Approve diff warning in Chromatic dashboard             | PR check changes to green (passed).                                     |

---

## 7. AI Code Loop Prompt

```
TASK: H.2 — Chromatic Visual Regression CI

Edit .github/workflows/ci.yml.
Add chromatic-deployment job to execute in parallel with other tests.
Verify it calls chromatichq/action actions using secrets.CHROMATIC_PROJECT_TOKEN.
Ensure checking out code uses fetch-depth 0.
```
