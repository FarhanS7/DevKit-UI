# Task H.5 — npm Publish Automation

**Phase:** H — CI/CD & Release Pipeline  
**Blocked by:** H.4  
**Blocks:** I.1  
**Week:** 11  
**AI Skill to use:** `architecture-patterns`

---

## 1. What I'm Building

The automated release workflow pipeline (`.github/workflows/release.yml`) that versions, updates changelogs, and publishes built packages to the npm registry when code is merged to `main`.

---

## 2. Architectural Decisions & Trade-offs

- **Automated Publishing Gates**: Publishing from local terminals can lead to version errors. Running releases in CI ensures that packages are only published if all checks pass.
- **Lockstep release triggers**: The workflow calls Changesets CLI commands to handle publishing and automatically generate GitHub releases for tagged versions.

---

## 3. Implementation Plan & Approach

### 1. Create `.github/workflows/release.yml`

Configure the GitHub Actions workflow:

```yaml
name: Release Pipeline

on:
  push:
    branches:
      - main

concurrency: ${{ github.workflow }}-${{ github.ref }}

jobs:
  release:
    name: Version & Publish
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

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Build Design Tokens
        run: pnpm build:tokens

      - name: Build Core Library
        run: pnpm build

      - name: Version or Publish
        id: changesets
        uses: changesets/action@v1
        with:
          publish: pnpm release
          version: pnpm changeset version
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 2. Configure project token secrets

In your GitHub repository settings, navigate to **Secrets and variables > Actions** and add `NPM_TOKEN` containing your npm registry token.

### 3. Add release scripts to root `package.json`

Add the following command to the root scripts:

```json
"scripts": {
  "release": "changeset publish"
}
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **NPM Access permissions**: When publishing packages under a scope (e.g. `@yourusername/ui`), npm defaults to private access. Ensure that packages configure `"publishConfig": { "access": "public" }` in their package.json, otherwise publishing will fail.
- **Workflow Permissions**: The `release.yml` workflow requires write permissions to create pull requests and commit changelog updates. Ensure repository settings grant write permissions to the default `GITHUB_TOKEN`.

---

## 5. Definition of Done

- [ ] `.github/workflows/release.yml` exists.
- [ ] npm credentials (`NPM_TOKEN`) are configured in repository secrets.
- [ ] Merging a branch containing changeset files to `main` triggers versions bumps and publishes packages to npm.

---

## 6. QA Test Scenarios

| Scenario                     | Command                                    | Expected Result                                                                                     |
| ---------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Verify Release pipeline runs | Merge PR containing changeset file to main | GHA release job starts, bumps package versions, commits updates, and publishes to the npm registry. |

---

## 7. AI Code Loop Prompt

```
TASK: H.5 — npm Publish Automation

Create .github/workflows/release.yml.
Configure workflow triggers on push events targeting main.
Integrate changesets/action, passing pnpm release and pnpm changeset version commands.
Add GITHUB_TOKEN and NPM_TOKEN env variables to the release script step.
Update root package.json to run changeset publish on "release" scripts.
```
