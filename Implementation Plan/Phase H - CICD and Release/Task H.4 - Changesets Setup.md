# Task H.4 — Changesets Setup

**Phase:** H — CI/CD & Release Pipeline  
**Blocked by:** A.1, H.1  
**Blocks:** H.5  
**Week:** 11  
**AI Skill to use:** `architecture-patterns`

---

## 1. What I'm Building

Coordinated package versioning and changelog management configurations in the root directory using Changesets.

---

## 2. Architectural Decisions & Trade-offs

- **Monorepo-aware Semantic versioning**: Changesets parses changes in monorepos. If a change is committed in `packages/tokens` and `packages/core` depends on it, Changesets automatically bumps the version of both packages.
- **PR-driven Changelogs**: Developers add a markdown changelog entry when modifying a public API, ensuring changes are documented before merging to `main`.

---

## 3. Implementation Plan & Approach

### 1. Initialize Changesets

Bootstrap Changesets in the root folder:

```bash
pnpm changeset init
```

This generates `.changeset/config.json`.

### 2. Configure `.changeset/config.json`

Update the configuration:

```json
{
  "$schema": "https://unpkg.com/@changesets/config@2.3.1/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [["@yourusername/ui", "@yourusername/tokens"]],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["docs"]
}
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Linked Packages**: We link core and tokens (`["@yourusername/ui", "@yourusername/tokens"]`) so their version numbers stay synced (lockstep versioning). This prevents version mismatches for consumers.
- **Commit parameter**: We set `"commit": false` to allow developers to review generated changeset descriptions before writing commits.

---

## 5. Definition of Done

- [ ] `.changeset/` directory exists in the workspace root.
- [ ] Linked packages are configured in `.changeset/config.json`.
- [ ] Running `pnpm changeset` opens input dialogues to select packages and write changelog logs.

---

## 6. QA Test Scenarios

| Scenario                | Command                  | Expected Result                                                                                              |
| ----------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Verify changeset wizard | `pnpm changeset`         | Command line wizard opens, prompts for packages to bump, and generates a markdown changeset file.            |
| Test release dry-run    | `pnpm changeset version` | Bumps version numbers in `package.json` files and updates CHANGELOG files. (Discard changes after checking). |

---

## 7. AI Code Loop Prompt

```
TASK: H.4 — Changesets Setup

Install @changesets/cli in the root workspace devDependencies.
Initialize Changesets using pnpm changeset init.
Edit .changeset/config.json to link core and tokens packages.
Set access to public, baseBranch to main, and ignore the docs app.
```
