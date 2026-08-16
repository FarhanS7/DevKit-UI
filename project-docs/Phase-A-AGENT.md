# Phase A Agent Instructions — Monorepo & Infrastructure

> **Agent:** Read `AGENT-CONTEXT.md` fully before starting this file.
> **Goal:** Build the monorepo scaffold. Nothing can be coded until this phase is done.
> **Commit target:** `feat(phase-A): Monorepo & Infrastructure`

---

## PHASE OVERVIEW

**What this phase produces:**
- A working pnpm monorepo with 3 workspaces: `packages/core`, `packages/tokens`, `apps/docs`
- A library build system (Vite) that outputs ESM + CJS
- Storybook 8 running at `localhost:6006` with the a11y addon
- Strict ESLint + Prettier enforced on commit

**Why this order matters:**
All other phases depend on the monorepo workspace links being correctly established. If workspace linking is wrong, TypeScript path resolution fails silently in dozens of places later.

**Skills to read first:**
- `.agents/skills/senior-frontend/SKILL.md`
- `.agents/skills/architecture-patterns/SKILL.md`

---

## TASK EXECUTION ORDER

Execute tasks in this exact sequence. Do not start the next task until the current one is verified.

---

### TASK A.1 — pnpm Workspace Scaffold
**File:** `Implementation Plan/Phase A - Monorepo & Infrastructure/Task A.1 - pnpm Workspace Scaffold.md`

**What to build:**
```
E:\Design Components\
├── package.json          (root — private: true, workspace scripts)
├── pnpm-workspace.yaml   (declares packages/*, apps/*)
├── .npmrc                (shamefully-hoist=false, strict-peer-dependencies=false)
├── tsconfig.base.json    (strict: true, exactOptionalPropertyTypes: true)
├── packages/
│   ├── core/
│   │   ├── package.json  (name: @yourname/ui, private: false)
│   │   └── src/index.ts  (empty barrel for now)
│   └── tokens/
│       ├── package.json  (name: @yourname/tokens, private: false)
│       └── src/index.ts  (empty)
└── apps/
    └── docs/
        └── package.json  (name: docs, private: true)
```

**Key decisions:**
- `"private": true` on root — prevents accidental publish of the monorepo root
- `workspace:*` protocol in core's dependency on tokens — links locally, not from npm
- `shamefully-hoist=false` — prevents phantom dependencies

**Verification:**
```bash
pnpm install                    # Must complete with 0 errors
pnpm ls --depth=1               # Shows all 3 workspaces
# Verify workspace link: packages/core/node_modules/@yourname/tokens
# should be a symlink to packages/tokens, NOT a downloaded npm package
```

**Checklist:**
- [ ] `pnpm-workspace.yaml` exists with `packages:` array
- [ ] `packages/core/package.json` has `"@yourname/tokens": "workspace:*"` in dependencies
- [ ] `tsconfig.base.json` has `"strict": true` and `"exactOptionalPropertyTypes": true`
- [ ] `pnpm install` completes without errors

---

### TASK A.2 — Vite Library Build Config
**File:** `Implementation Plan/Phase A - Monorepo & Infrastructure/Task A.2 - Vite Library Build Config.md`

**What to build:**
```
packages/core/
├── vite.config.ts       (lib mode, entry: src/index.ts)
├── tsconfig.json        (extends tsconfig.base.json, includes src/)
└── package.json         (exports field with ESM + CJS paths, sideEffects: false)
```

**Key decisions:**
- `"sideEffects": false` — enables tree-shaking in consumer bundlers
- External: `['react', 'react-dom', 'react/jsx-runtime']` — don't bundle React
- Both `.mjs` (ESM) and `.cjs` (CJS) outputs — supports Vite AND webpack consumers
- `declarationDir: dist/types` — TypeScript declarations for consumers

**Verification:**
```bash
cd packages/core && pnpm build
ls dist/
# Must see: index.mjs, index.cjs, types/index.d.ts
```

**Checklist:**
- [ ] `pnpm build` in `packages/core` produces 3 output files
- [ ] `package.json` `exports` field has both `import` and `require` paths
- [ ] `"sideEffects": false` in `packages/core/package.json`
- [ ] React is in `peerDependencies`, not `dependencies`

---

### TASK A.3 — Storybook 8 Setup
**File:** `Implementation Plan/Phase A - Monorepo & Infrastructure/Task A.3 - Storybook 8 Setup.md`

**What to build:**
```
apps/docs/
├── .storybook/
│   ├── main.ts          (framework: react-vite, stories glob, addons)
│   └── preview.ts       (global decorators, parameters — empty for now)
├── package.json         (storybook deps)
└── stories/
    └── Introduction.mdx (welcome page)
```

**Key decisions:**
- `@storybook/react-vite` framework (not webpack) — faster builds, same Vite config
- `@storybook/addon-a11y` — axe-core in the browser panel (mandatory)
- `@storybook/addon-themes` — for the dark mode toggle (B.5 will configure it)
- Stories glob: `../stories/**/*.stories.@(ts|tsx|mdx)` — picks up all story formats

**Verification:**
```bash
cd apps/docs && pnpm dev
# Browser opens localhost:6006
# Shows Storybook with the Introduction page
# No console errors
# Accessibility panel is visible in the addon tabs
```

**Checklist:**
- [ ] Storybook starts with `pnpm dev` in `apps/docs`
- [ ] `@storybook/addon-a11y` is registered in `main.ts`
- [ ] No console errors on startup
- [ ] Introduction.mdx page renders

---

### TASK A.4 — ESLint + Prettier Config
**File:** `Implementation Plan/Phase A - Monorepo & Infrastructure/Task A.4 - ESLint Prettier Config.md`

**What to build:**
```
root/
├── .eslintrc.json       (extends: recommended, react-hooks, jsx-a11y — ALL as error)
├── .prettierrc          (singleQuote: true, semi: false, printWidth: 100)
├── .eslintignore
├── .prettierignore
└── package.json         (lint-staged + husky configuration)
```

**Key decisions:**
- `eslint-plugin-jsx-a11y` rules are set to `"error"` not `"warn"` — accessibility violations block commits
- `lint-staged` runs lint and format on STAGED FILES ONLY (not the whole codebase) — fast pre-commit
- `husky` runs lint-staged on `pre-commit` hook

**Verification:**
```bash
pnpm lint         # 0 violations on the current scaffold
pnpm format:check # 0 formatting issues
# Test the hook: make a deliberate jsx-a11y violation, try to commit → must be blocked
```

**Checklist:**
- [ ] `pnpm lint` passes with 0 violations
- [ ] `pnpm format:check` passes
- [ ] Pre-commit hook blocks commits with jsx-a11y violations
- [ ] `jsx-a11y/alt-text` is set to `"error"` (not `"warn"`)

---

## PHASE A COMPLETION PROTOCOL

When ALL 4 tasks are verified:

### Run Final Phase Check
```bash
# From monorepo root:
pnpm install            # Clean install
pnpm build:tokens       # Will fail (tokens don't exist yet — this is EXPECTED)
pnpm lint               # Must pass
pnpm typecheck          # Must pass
pnpm --filter docs dev  # Storybook must start
```

### Create Walkthrough
After all tasks pass, create:
`Walkthroughs/Phase A - Monorepo & Infrastructure/A.1 Walkthrough.md` through `A.4 Walkthrough.md`

In each walkthrough, explain:
1. What was built and why each decision was made
2. What would break if you did it differently
3. The 2-minute interview-ready explanation

### Git Commit
```bash
git add .
git commit -m "feat(phase-A): Monorepo & Infrastructure

- pnpm workspaces with packages/core, packages/tokens, apps/docs
- Vite library mode: ESM + CJS dual output with TypeScript declarations
- Storybook 8 with react-vite adapter, a11y and themes addons
- ESLint strict with jsx-a11y as errors, Prettier, lint-staged pre-commit
- TypeScript strict mode with exactOptionalPropertyTypes across all workspaces

Phase: A
Tasks: A.1, A.2, A.3, A.4
Tests: 0 (scaffold — no components yet)
Breaking: none"

git push origin main
```

### Update Master Index
Open `00-MASTER-INDEX.md` and change Phase A task statuses from ⬜ to ✅.

---

## WHAT RECRUITER SEES IN THIS COMMIT

A recruiter reviewing this commit sees:
- **"They know modern monorepo tooling"** — pnpm workspaces, not npm/yarn workspaces
- **"They understand the difference between devDependencies and peerDependencies"**
- **"They care about accessibility from day zero"** — jsx-a11y as errors on commit hooks
- **"They set up strict TypeScript"** — `exactOptionalPropertyTypes` shows advanced TS knowledge
