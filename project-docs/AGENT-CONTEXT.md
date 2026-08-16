# AGENT CONTEXT — AI-Powered Design System & Component Library
> **READ THIS FILE FIRST. EVERY SESSION. WITHOUT EXCEPTION.**
> This is the permanent global context. It never changes between sessions.
> If you are a coding agent, IDE assistant, or AI tool — start here before touching any code.

---

## 0. WHO YOU ARE AND WHAT THIS PROJECT IS

You are building a **portfolio-grade, production-quality React component library** called `@yourname/ui`.

This is not a tutorial project. Every decision must be defensible in a senior engineering interview.
Every component must be WCAG 2.1 AA accessible. Every line of code must pass strict TypeScript.
Every phase gets a clean git commit so a recruiter can read the history and see engineering maturity.

**The person building this is a learner preparing for senior frontend/fullstack interviews.**
Your job is to help them produce output that looks like it came from a 5-year senior engineer.

---

## 1. PROJECT STRUCTURE

```
E:\Design Components\              ← monorepo root (this folder)
├── .agents/skills/                ← AI skill files (read these for deep technical guidance)
│   ├── senior-frontend/           ← Component patterns, React best practices
│   ├── frontend-design/           ← Design system, UI/UX patterns
│   ├── architecture-patterns/     ← Clean architecture, hexagonal, DDD
│   ├── system-design/             ← System design decisions
│   ├── senior-backend/            ← Backend API patterns
│   ├── nodejs-backend-patterns/   ← Express/Next.js patterns
│   └── vercel-react-best-practices/ ← Performance optimization
│
├── 00-MASTER-INDEX.md             ← Master task tracker with all phase links
├── AGENT-CONTEXT.md               ← THIS FILE — global context
│
├── architecture.md                ← Foundation: monorepo architecture decisions
├── system-design.md               ← Foundation: system design (AI tools, caching, etc.)
├── database-schema.md             ← Foundation: token schema, two-tier model
├── design-system.md               ← Foundation: color, typography, spacing, component APIs
├── product-engineering.md         ← Foundation: why this project, trade-offs, interview prep
│
├── PRD-03-design-system.md        ← Source of truth: full product requirements
├── PRD_TO_TASKS_FRAMEWORK.md      ← Source of truth: 7-phase SDLC framework
├── phase-0-project-foundation.md  ← Source of truth: monorepo scaffold, tsconfig
├── phase-1-modules-and-tasks.md   ← Source of truth: full task tree with checklists
├── phase-1-5-dev-environment-and-ci.md ← Source of truth: CI/CD setup
├── phase-2-ai-code-loop.md        ← Source of truth: AI coding session protocol
├── phase-3-code-review-and-walkthrough.md ← Source of truth: review standards
├── phase-4-and-5-deployment-and-operations.md ← Source of truth: deployment
│
├── Implementation Plan/           ← Individual task .md files (one per sub-task)
│   ├── Phase A - Monorepo & Infrastructure/
│   ├── Phase B - Token Pipeline/
│   ├── Phase C - Utility Layer/
│   ├── Phase D - Tier 1 Foundation Components/
│   ├── Phase E - Tier 2 Interactive Components/
│   ├── Phase F - Tier 3 DSA Components/
│   ├── Phase G - AI Developer Tools/
│   ├── Phase H - CICD and Release/
│   └── Phase I - Documentation/
│
├── Walkthroughs/                  ← Created AFTER coding (post-task explanations)
│
└── [monorepo code — created during Phase A]:
    ├── packages/core/             ← The npm library (@yourname/ui)
    ├── packages/tokens/           ← CSS token pipeline (@yourname/tokens)
    └── apps/docs/                 ← Storybook + AI tools (Next.js)
```

---

## 2. TECH STACK — NON-NEGOTIABLE

| Layer | Technology | Why |
|---|---|---|
| Package manager | pnpm workspaces | Phantom dependency prevention, disk efficiency |
| Language | TypeScript 5.x strict mode | `exactOptionalPropertyTypes: true`, zero `any` |
| UI framework | React 18.3 | Concurrent mode, `useId()`, `useTransition()` |
| Styling | Tailwind CSS + CVA | Utility-first, variant-safe, no runtime overhead |
| Token pipeline | Style Dictionary | JSON → CSS custom properties + TypeScript constants |
| Components | Radix UI primitives (Tier 2+) | ARIA-correct headless primitives |
| Build | Vite library mode | ESM + CJS dual output, tree-shaking |
| Stories | Storybook 8 + react-vite | Component documentation and visual testing |
| Testing | Vitest + jest-axe + Playwright | Unit + axe + E2E |
| Visual regression | Chromatic | Screenshot diff on every PR |
| CI/CD | GitHub Actions | Automated lint/test/build/publish pipeline |
| AI tools | Anthropic Claude SDK | Streaming via SSE |
| Release | Changesets | Monorepo-aware semantic versioning |

---

## 3. ABSOLUTE CODING RULES — NEVER VIOLATE THESE

### 3.1 TypeScript Rules
```typescript
// ✅ ALWAYS: Named exports only
export { Button };
export type { ButtonProps };

// ❌ NEVER: Default exports
export default Button;

// ✅ ALWAYS: forwardRef on all components
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(...);

// ✅ ALWAYS: Spread ...rest to the underlying element
<button {...rest} className={cn(baseClasses, className)} />

// ✅ ALWAYS: Merge classNames with cn() — never overwrite
className={cn(buttonVariants({ variant, size }), className)}

// ❌ NEVER: Hardcoded hex colors or pixel values
style={{ color: '#ff0000' }}
// ✅ ALWAYS: CSS custom properties from token pipeline
style={{ color: 'var(--color-interactive-default)' }}

// ✅ ALWAYS: CSS tokens via Tailwind arbitrary values in CVA
'bg-[var(--color-interactive-default)]'
```

### 3.2 Accessibility Rules
```typescript
// ✅ ALWAYS: Focus ring on all interactive elements
'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'

// ✅ ALWAYS: Minimum 44x44px touch targets
'min-h-[44px] min-w-[44px]'

// ✅ ALWAYS: aria-busy when loading
aria-busy={isLoading ? 'true' : undefined}

// ✅ ALWAYS: aria-invalid only when invalid (undefined when valid)
aria-invalid={hasError ? 'true' : undefined}  // NOT 'false'

// ✅ ALWAYS: Decorative icons are aria-hidden
<svg aria-hidden="true">...</svg>

// ✅ ALWAYS: axe-core test on EVERY component, EVERY state
```

### 3.3 File Structure Rules
Every component follows this exact structure:
```
packages/core/src/components/ComponentName/
├── ComponentName.tsx          ← implementation
├── ComponentName.test.tsx     ← unit + axe tests
├── ComponentName.test-d.ts    ← type tests (for polymorphic only)
└── index.ts                   ← re-export barrel
```

Every story follows this structure:
```
apps/docs/stories/ComponentName/
└── ComponentName.stories.tsx
```

### 3.4 Test Rules
EVERY component must have tests for:
1. **Happy path render** — renders without crashing
2. **axe-core** — `expect(await axe(container)).toHaveNoViolations()`
3. **Error/edge states** — error state, disabled state, loading state (where applicable)
4. **Keyboard interaction** — Tab, Enter, Escape (for interactive components)
5. **Type tests** — invalid prop combinations caught at compile time (polymorphic components)

---

## 4. THE AI CODE LOOP — HOW TO CODE EACH TASK

**For every sub-task, follow this exact sequence:**

```
STEP 1: READ
  → Open the task .md file from Implementation Plan/Phase X/Task X.Y - Name.md
  → Read: What I'm Building, Architecture Decisions, Approach, Gotchas, DoD checklist
  → Read the relevant .agents/skills/SKILL.md for technical depth
  → Read the relevant section of PRD-03-design-system.md for exact requirements

STEP 2: VERIFY DEPENDENCIES
  → Check every "Blocked by" item in the task file
  → Run: pnpm typecheck — must pass before writing new code
  → Confirm the blocking component/utility exists and exports correctly

STEP 3: CODE
  → Follow the AI Code Loop prompt from phase-2-ai-code-loop.md §2.1
  → Write: implementation file, test file, story file, barrel export update
  → No placeholders. No TODOs. No hardcoded values. Full implementation.

STEP 4: VERIFY
  → pnpm lint                        (0 violations)
  → pnpm typecheck                   (0 errors)
  → pnpm test                        (all pass, including axe)
  → Open Storybook and visually verify in light AND dark mode
  → Open @storybook/addon-a11y tab — 0 violations per story

STEP 5: COMMIT
  → See Section 6 of this file for exact git commit format
  → Commit ONLY when ALL verification steps pass
  → Never commit failing tests or TypeScript errors
```

---

## 5. SKILLS TO USE — HOW TO INVOKE .AGENTS/SKILLS

Before coding each task, read the relevant skill file from `.agents/skills/`:

| When you're building... | Read this skill |
|---|---|
| Any component (D.x, E.x, F.x) | `.agents/skills/senior-frontend/SKILL.md` |
| Visual design, tokens, Storybook | `.agents/skills/frontend-design/SKILL.md` |
| Complex component patterns (Dialog, Compound) | `.agents/skills/architecture-patterns/SKILL.md` |
| VirtualList, CommandPalette (DSA) | `.agents/skills/system-design/SKILL.md` |
| API routes (G.x) | `.agents/skills/senior-backend/SKILL.md` |
| Next.js API routes, streaming | `.agents/skills/nodejs-backend-patterns/SKILL.md` |
| Bundle optimization, performance | `.agents/skills/vercel-react-best-practices/SKILL.md` |
| UI layout, component design | `.agents/skills/frontend-ui-ux-engineer/SKILL.md` |

**Read the SKILL.md before writing the first line of code for that task.**

---

## 6. GIT COMMIT PROTOCOL — MANDATORY FORMAT

**One commit per phase.** After ALL sub-tasks in a phase pass their verification steps:

```bash
# Stage everything in the phase
git add .

# Commit with this EXACT format:
git commit -m "feat(phase-X): [Phase Name] — [one-line summary]

[3-5 bullet points describing what was built]

Phase: X
Tasks: X.1, X.2, X.3...
Tests: [x unit | y axe | z e2e]
Breaking: none"

# Push to GitHub
git push origin main
```

### Commit Message Examples by Phase:

```bash
# Phase A
git commit -m "feat(phase-A): Monorepo & Infrastructure

- pnpm workspace with packages/core, packages/tokens, apps/docs
- Vite library mode with ESM + CJS dual output and type declarations
- Storybook 8 with react-vite adapter and a11y addon
- ESLint + Prettier with jsx-a11y rules as errors
- TypeScript strict mode across all workspaces

Phase: A
Tasks: A.1, A.2, A.3, A.4
Tests: 0 unit (scaffold only)
Breaking: none"

# Phase B
git commit -m "feat(phase-B): Token Pipeline — Figma to CSS custom properties

- Two-tier token schema (primitives + semantics) in tokens.json
- Style Dictionary compiles JSON to CSS custom properties (light mode)
- Dark mode override file with [data-theme=dark] selector
- TypeScript token constants for type-safe CSS var references
- Storybook global CSS integration with light/dark toolbar toggle

Phase: B
Tasks: B.1, B.2, B.3, B.4, B.5
Tests: 1 token drift guard test
Breaking: none"

# Phase D (example for component phases)
git commit -m "feat(phase-D): Tier 1 Foundation Components — WCAG 2.1 AA

- VisuallyHidden, Portal, Text/Heading, Label, Button, Input, Icon
- All components: forwardRef, named exports, ...rest spread, cn() merge
- Button: polymorphic as-prop, CVA variants, isLoading with aria-busy
- Icon: lazy-loaded with React.lazy, discriminated union for a11y
- axe-core zero violations across all 8 components in all states

Phase: D
Tasks: D.1, D.2, D.3, D.4, D.5, D.6, D.7, D.8
Tests: 24 unit | 16 axe | 0 e2e
Breaking: none"
```

---

## 7. WHAT RECRUITERS WILL SEE IN GIT HISTORY

When a recruiter looks at the git log, they should see:

```
feat(phase-I): Documentation, Story Audit, and Public Launch
feat(phase-H): CI/CD Pipeline and Release Automation
feat(phase-G): AI Developer Tools — Component Generator, A11y Checker, Theme Builder
feat(phase-F): Tier 3 DSA Components — VirtualList, CommandPalette, DataGrid
feat(phase-E): Tier 2 Interactive Components — Dialog, Tabs, Accordion, Select, Popover
feat(phase-D): Tier 1 Foundation Components — WCAG 2.1 AA
feat(phase-C): Utility Layer — cn(), Polymorphic Types, Focus Helpers
feat(phase-B): Token Pipeline — Figma to CSS custom properties
feat(phase-1.5): Dev Environment & CI Bootstrap
feat(phase-A): Monorepo & Infrastructure
chore: initial project foundation and documentation
```

Each commit tells a story of **engineering progression**. A recruiter who knows React can look at:
- Phase A: "They know monorepo setup and build configuration."
- Phase B: "They understand design token pipelines."
- Phase D: "They know WCAG accessibility, polymorphic TypeScript, and component APIs."
- Phase F: "They can implement binary search and trigram algorithms in production components."
- Phase G: "They know server-side AI streaming, rate limiting, and API security."

---

## 8. PHASE DEPENDENCY ORDER — NEVER SKIP

```
Phase A (Monorepo scaffold)
    ↓
Phase 1.5 (CI Bootstrap — partial, wire it up after A)
    ↓
Phase B (Token pipeline — all tokens before any component)
    ↓
Phase C (Utilities — cn(), polymorphic types, focus helpers)
    ↓
Phase D (Tier 1: VisuallyHidden → Portal → Text → Label → Button → Input → Icon → axe)
    ↓
Phase E (Tier 2: hooks first → Dialog → Tabs, Accordion, Select, Popover, Checkbox)
    ↓
Phase F (Tier 3 DSA: VirtualList → CommandPalette → DataGrid)
    ↓
Phase G (AI Tools: proxy routes → UIs)
    ↓
Phase H (Full CI pipeline + Release)
    ↓
Phase I (Docs, Story audit, Launch)
```

**NEVER start a phase whose dependency is not committed and verified.**

---

## 9. DEFINITION OF DONE — PHASE LEVEL

A phase is complete when ALL of the following are true:

```
[ ] All sub-task .md checklists are checked off
[ ] pnpm lint → 0 violations
[ ] pnpm typecheck → 0 TypeScript errors
[ ] pnpm test → all tests pass (including axe-core)
[ ] Storybook: all stories render in light AND dark mode
[ ] Storybook a11y addon: 0 violations per story
[ ] No hardcoded colors, spacing, or font sizes anywhere
[ ] All components have named exports + forwardRef + ...rest
[ ] Git commit made with correct conventional commit format
[ ] Git pushed to GitHub (origin main)
[ ] Walkthrough .md created for each sub-task (post-coding explanation)
```

---

## 10. ERROR RECOVERY — IF SOMETHING BREAKS

**TypeScript error after adding a new file:**
1. Check the barrel export in `packages/core/src/index.ts`
2. Check that `packages/tokens/dist/tokens.ts` is up to date (`pnpm build:tokens`)
3. Run `pnpm typecheck` at the workspace root, not in a subdirectory

**axe violation in a test:**
1. Open the test output — it will tell you exactly which WCAG rule failed
2. Look up the rule in `design-system.md §8 — Accessibility Standards`
3. Fix the component, re-run the test
4. NEVER suppress an axe violation with `.toHaveNoViolations({ ...rules... })` — fix the root cause

**Storybook won't start:**
1. Check that `pnpm build:tokens` has been run
2. Check that the import path in `preview.ts` matches the actual dist file path
3. Check that no circular imports exist between components

**CI fails:**
1. Read the failing job log in GitHub Actions
2. The jobs run in order: lint → typecheck → test → playwright → chromatic
3. Fix the first failing job before looking at later ones

---

## 11. CONTEXT RESET PROTOCOL — IF THE AGENT LOSES CONTEXT

If you (the AI agent) are resumed mid-session and have lost context, do this:

```
1. Read this file (AGENT-CONTEXT.md) fully
2. Read 00-MASTER-INDEX.md to find current phase and task
3. Check which sub-tasks have ⬜ (not done) vs ✅ (done)
4. Open the current task's .md file from Implementation Plan/
5. Run: pnpm typecheck to see current code state
6. Continue from the first uncompleted task
```

Do NOT re-do completed tasks. Do NOT start fresh. Resume from where you stopped.
