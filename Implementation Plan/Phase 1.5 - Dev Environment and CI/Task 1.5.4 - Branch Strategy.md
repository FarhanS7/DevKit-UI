# Task 1.5.4 — Branch Strategy & Commit hook

**Phase:** 1.5 — Dev Environment & CI Bootstrap  
**Blocked by:** A.1–A.4, B.1–B.5  
**Blocks:** C.1  
**Week:** After Week 2  
**AI Skill to use:** `architecture-patterns`

---

## 1. What I'm Building

Husky and Commitlint configuration settings to enforce Conventional Commits rules on all local commits. This guarantees clean git log history and makes release versioning automated via Changesets.

---

## 2. Architectural Decisions & Trade-offs

- **Pre-commit Gate for Formats**: Running `lint-staged` on pre-commit catches linting/formatting errors locally. This prevents developers from pushing broken code that would eventually fail CI checks anyway, saving actions runner resources.
- **Pre-commit Gate for Messages**: Running `commitlint` on the `commit-msg` git hook ensures commit messages match structured scopes before git writes them, preventing history rewrite loops later.

---

## 3. Implementation Plan & Approach

### 1. Configure Commitlint

Create `.commitlintrc.json` in the root folder. It must extend conventional rules:

```json
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "scope-enum": [
      2,
      "always",
      [
        "root",
        "core",
        "tokens",
        "docs",
        "phase-A",
        "phase-B",
        "phase-C",
        "phase-D",
        "phase-E",
        "phase-F",
        "phase-G",
        "phase-H",
        "phase-I",
        "phase-1.5"
      ]
    ]
  }
}
```

### 2. Configure Husky hooks

Initialize Husky and create two hooks under `.husky/`:

- `.husky/pre-commit`: Runs `pnpm lint-staged` (lints/formats only staged files).
- `.husky/commit-msg`: Intercepts and parses the commit message using commitlint.

```bash
# Setup Husky directory
pnpm husky install
```

Write `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm lint-staged
```

Write `.husky/commit-msg`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm commitlint --edit "${1}"
```

### 3. Update Root `package.json`

Add scripts to bootstrap husky on package install:

```json
"scripts": {
  "prepare": "husky install"
}
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Executable Hooks**: Under macOS and Linux, Husky files must be marked as executable. Run `chmod +x .husky/pre-commit` and `chmod +x .husky/commit-msg` after creation, otherwise git will bypass execution silently.
- **Windows Path Exceptions**: If Husky paths fail under Windows, ensure git bash is correctly registered in the system environment parameters.

---

## 5. Definition of Done

- [ ] `.commitlintrc.json` is created at the monorepo root.
- [ ] Husky is initialized and hooks (`pre-commit`, `commit-msg`) exist under `.husky/`.
- [ ] Commit message `git commit -m "temp"` is blocked by the commit-msg hook.
- [ ] Commit message `git commit -m "feat(core): setup button components"` succeeds.

---

## 6. QA Test Scenarios

| Scenario                       | Command                                                  | Expected Result                                                             |
| ------------------------------ | -------------------------------------------------------- | --------------------------------------------------------------------------- |
| Test Malformed Commit Message  | `git commit -m "work in progress"`                       | Hook runs, commitlint flags violation error, commit is blocked.             |
| Test Valid Commit Message      | `git commit -m "feat(phase-1.5): finalize commit hooks"` | Hook runs, message passes checks, commit succeeds.                          |
| Test Bypassing Hooks (Warning) | `git commit -m "temp" --no-verify`                       | Commit succeeds (this escape hatch should only be used in emergency loops). |

---

## 7. AI Code Loop Prompt

```
TASK: 1.5.4 — Branch Strategy & Commit hook

Install husky, commitlint, and @commitlint/config-conventional in the root workspace devDependencies.
Create .commitlintrc.json in the root extending config-conventional and setting standard scopes (core, tokens, docs, and phase scopes).
Initialize husky, create the pre-commit hook running pnpm lint-staged, and create the commit-msg hook running pnpm commitlint.
Update root package.json to run husky install in the prepare script.
```
