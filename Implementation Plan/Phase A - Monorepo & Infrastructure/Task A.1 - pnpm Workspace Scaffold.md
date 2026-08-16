# Task A.1 — pnpm Workspace, Repo Scaffold, Shared tsconfig

**Phase:** A — Monorepo & Infrastructure  
**Blocked by:** Nothing (start here)  
**Blocks:** A.2, A.3, A.4, B.1  
**Week:** 1  
**AI Skill to use:** `senior-frontend`, `architecture-patterns`

---

## 1. What I'm Building

The monorepo root scaffold. This is not a feature — it's the foundation that all other tasks sit on. After this task:

- `pnpm install` from root resolves all workspaces cleanly
- The three-package structure (`packages/core`, `packages/tokens`, `apps/docs`) exists
- TypeScript is configured across all packages with strict mode and shared path aliases
- ESLint/Prettier scaffolded (full config is A.4 — here we just establish the root structure)

**Files to create:**

```
pnpm-workspace.yaml
package.json (root)
tsconfig.json (root — base config)
packages/
  core/
    package.json
    tsconfig.json     (extends root)
    src/index.ts      (empty placeholder)
  tokens/
    package.json
    tsconfig.json     (extends root)
    tokens.json       (empty shell)
apps/
  docs/
    package.json
    tsconfig.json     (extends root, Next.js mode)
.gitignore
.npmrc
```

---

## 2. Architectural Decisions

### Why pnpm Workspaces

- `pnpm-workspace.yaml` declares `packages: ['packages/*', 'apps/*']` — all directories under those prefixes become workspaces.
- The workspace protocol (`"@yourusername/tokens": "workspace:*"`) in `packages/core/package.json` means: during development, resolve to the local `packages/tokens` directory, not the npm registry. On publish, Changesets rewrites `workspace:*` to the actual version number.
- **Why this matters:** A version mismatch between `packages/core` and `packages/tokens` becomes a **build error**, not a silent runtime mismatch. This is the correct behavior.

### Three tsconfigs, One Source of Truth

```
tsconfig.json (root)
  ├── packages/core/tsconfig.json      (extends "../..")
  ├── packages/tokens/tsconfig.json    (extends "../..")
  └── apps/docs/tsconfig.json          (extends "../..", adds Next.js options)
```

The root tsconfig sets all strict flags once. Package-level tsconfigs only add what differs:

- `packages/core`: `"module": "ESNext"`, `"target": "ES2020"` (library mode)
- `apps/docs`: `"jsx": "preserve"`, `"lib": ["DOM", "ESNext"]` (Next.js)

### Path Aliases

Root `tsconfig.json` defines:

```json
"paths": {
  "@yourusername/ui": ["packages/core/src/index.ts"],
  "@yourusername/tokens": ["packages/tokens/dist/tokens.ts"]
}
```

This means inside `apps/docs`, `import { Button } from '@yourusername/ui'` resolves to the local source during development — no build step required for cross-package imports.

### `.npmrc` Settings

```ini
strict-peer-dependencies=false
```

Radix UI's peer dependencies have some flexibility requirements. Without `strict-peer-dependencies=false`, pnpm throws on peer dep ranges it can't perfectly satisfy. This is a known requirement for Radix UI monorepos.

---

## 3. System Design Notes

Not applicable — no runtime behavior. This is purely build-time infrastructure.

---

## 4. DSA Notes

Not applicable.

---

## 5. Token/Database Notes

`packages/tokens/tokens.json` is created as an empty shell at this stage:

```json
{
  "$schema": "https://raw.githubusercontent.com/amzn/style-dictionary/main/docs/schema.json",
  "color": {
    "primitive": {},
    "semantic": {}
  },
  "spacing": {},
  "radius": {},
  "typography": {}
}
```

Full token definitions are B.1's job. The schema is established here to confirm the directory structure is correct.

---

## 6. Best Practices

- Root `package.json` has **no production dependencies** — only workspace tooling. Each package manages its own deps.
- `"private": true` in root `package.json` — prevents accidentally publishing the monorepo root.
- `.gitignore` covers: `node_modules`, `dist`, `*.mjs.gz`, `.env`, `.env.local`, `.changeset/*.md` (changesets files are committed, not ignored).
- `engines.node: ">=20.0.0"` in root `package.json` — enforces Node 20 LTS.

---

## 7. Real-Life Engineering Gotchas

1. **pnpm lockfile is the source of truth.** If `package-lock.json` or `yarn.lock` appear in the repo (e.g., a contributor runs npm/yarn), add them to `.gitignore` immediately and delete them. Mixing package managers corrupts the lockfile.

2. **Path alias resolution differs between runtime and tsc.** `tsconfig.json` path aliases work for TypeScript type checking, but the runtime bundler (Vite, Next.js) also needs to know about them. Vite reads from `tsconfig.json` automatically. Next.js requires `jsconfig.json` or its own config. Verify this is wired correctly in `apps/docs` before proceeding.

3. **The `workspace:*` protocol.** When Changesets publishes a release, it rewrites `"@yourusername/tokens": "workspace:*"` to `"@yourusername/tokens": "1.0.0"` in the published `packages/core/package.json`. This is automatic — do not manually specify version numbers for internal workspace dependencies.

---

## 8. Code Review Checklist (Before Marking Done)

- [ ] `pnpm install` from repo root completes with no errors
- [ ] `pnpm -r build` completes (even with empty placeholder `index.ts` files)
- [ ] Root `tsconfig.json` has `strict: true` AND `exactOptionalPropertyTypes: true`
- [ ] Path aliases in root `tsconfig.json` resolve to the correct files
- [ ] `packages/core/tsconfig.json` extends `"../../tsconfig.json"` (relative path)
- [ ] `apps/docs/tsconfig.json` has Next.js-required options (`"jsx": "preserve"`)
- [ ] Root `package.json` has `"private": true`
- [ ] `.npmrc` has `strict-peer-dependencies=false`
- [ ] `.gitignore` includes `node_modules`, `dist`, `.env*`

---

## 9. QA Test Scenarios

| Scenario           | Command                                             | Expected Result                                |
| ------------------ | --------------------------------------------------- | ---------------------------------------------- |
| Fresh install      | `pnpm install`                                      | No errors, all workspaces linked               |
| Build all packages | `pnpm -r build`                                     | Each package's build step runs (even if empty) |
| TypeScript check   | `pnpm typecheck`                                    | Zero errors on scaffold                        |
| Workspace protocol | In `packages/core`, `import` from `packages/tokens` | Resolves to local directory, not npm           |
| Path alias         | In `apps/docs`, `import from '@yourusername/ui'`    | Resolves to `packages/core/src/index.ts`       |

---

## 10. AI Code Loop Prompt

```
TASK: A.1 — pnpm workspace, repo scaffold, shared tsconfig

Project Context:
This is a portfolio React component library monorepo.
- pnpm workspaces (NOT npm, NOT yarn)
- Three workspaces: packages/core, packages/tokens, apps/docs
- TypeScript 5.x strict mode across all packages
- Root tsconfig.json as the shared base

Rules:
1. Root package.json must be private:true with no production dependencies
2. .npmrc must have strict-peer-dependencies=false
3. All tsconfigs must extend the root tsconfig.json
4. Root tsconfig must include: strict, exactOptionalPropertyTypes, noUncheckedIndexedAccess
5. Path aliases: @yourusername/ui → packages/core/src/index.ts, @yourusername/tokens → packages/tokens/dist/tokens.ts
6. pnpm-workspace.yaml declares packages/* and apps/*
7. Each package.json must have "type": "module" where appropriate
8. apps/docs tsconfig.json must include Next.js-specific options

Output:
- pnpm-workspace.yaml
- package.json (root)
- tsconfig.json (root)
- packages/core/package.json + tsconfig.json + src/index.ts (empty)
- packages/tokens/package.json + tsconfig.json + tokens.json (empty shell)
- apps/docs/package.json + tsconfig.json
- .gitignore
- .npmrc
```
