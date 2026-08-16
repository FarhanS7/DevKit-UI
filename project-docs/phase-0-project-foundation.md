# Phase 0 — Project Foundation
## Project: AI-Powered Design System & Component Library

> **Read once. Referenced everywhere.** Every task in Phase 1 pulls from this document instead of re-deriving decisions. Do not repeat these decisions in individual task notes — reference them.

---

## 0.1 Senior-Level Architecture

### Architecture Style: Monorepo with Package Boundaries

**Chosen:** Monorepo (pnpm workspaces) with two clearly-bounded packages and one app:

```
packages/core      → the published npm library (@yourusername/ui)
packages/tokens    → token pipeline package (Style Dictionary source + output)
apps/docs          → Storybook documentation site + AI tools UI (Next.js)
```

**Why this over alternatives:**
- **Single package (no monorepo):** Rejected. Tokens and components would be coupled in one build — consumers who only want the token CSS would still pull the full React tree. Separate `packages/tokens` allows consumers to install tokens independently.
- **Fully separate repos:** Rejected. Changes to tokens require coordinated PRs across repos. With pnpm workspaces, `packages/tokens` changes are instantly reflected in `packages/core` during development, and Changesets handles cross-package versioning on publish.
- **Microservices / serverless for AI tools:** Not applicable. The AI tools are a thin API proxy layer in `apps/docs` — Next.js API routes are sufficient and keep the architecture simple for a solo project.

### Module Boundaries

| Package/App | Responsibility | What it does NOT own |
|-------------|---------------|----------------------|
| `packages/tokens` | Token JSON source, Style Dictionary config, output files (CSS + TS) | No React, no component logic |
| `packages/core` | React components, hooks, TypeScript types, barrel export | No token transformation, no docs infrastructure |
| `apps/docs` | Storybook stories, MDX pages, AI tool UIs, Next.js API routes for AI proxy | No component implementation, no token generation |

### Communication Pattern Between Packages

- `packages/core` imports from `packages/tokens` (token constants for component styling) — direct package dependency, resolved by pnpm workspace protocol (`"@yourusername/tokens": "workspace:*"`)
- `apps/docs` imports from `packages/core` (for stories) and from `packages/tokens` (for AI Theme Builder live preview)
- AI tool API routes (`apps/docs/pages/api/ai/*`) call Anthropic API — one-directional, no callbacks
- No event bus, no shared state between packages — packages communicate only through their published TypeScript interfaces

---

## 0.2 System Design

### Request Flow — AI Tools

```
Browser (React component in Storybook/docs)
  → POST /api/ai/generate-component   (Next.js API route, apps/docs)
  → Anthropic API (claude-sonnet-4-6, streaming)
  → Server-Sent Events (SSE) stream back to browser
  → React reads stream → renders output progressively
```

**Why Next.js API routes as proxy (not direct Anthropic calls from browser):**  
The Anthropic API key must never be exposed to the browser. The Next.js API route acts as a thin proxy: validates input (Zod), applies rate limiting (IP-based, in-memory for demo; Redis-backed for production), forwards to Anthropic, and streams the response back.

### Sync vs. Async Boundaries

| Operation | Sync or Async | Reason |
|-----------|--------------|--------|
| Component rendering | Sync | React render cycle |
| Icon lazy-loading | Async (dynamic import) | Deferred on first render; cached by browser |
| AI tool API calls | Async + streaming (SSE) | LLM responses are slow; streaming gives progressive UX |
| Style Dictionary token build | Async (build-time script) | Not a runtime operation — runs in CI and during dev watch |
| axe-core in tests | Async (Promise-based) | DOM scan is async; awaited in Vitest/Jest |

No job queues (BullMQ, Redis) needed — the AI tool calls are user-initiated, short-lived, and handled directly by the SSE stream. Queuing would add infrastructure complexity with no benefit at this scale.

### Caching Strategy

| What | Where | Invalidation |
|------|-------|-------------|
| Lazy-loaded icon SVGs | Browser HTTP cache (immutable, content-hashed by Vite) | New build hash on change |
| Token CSS custom properties | CDN-level / browser cache (served as static file) | New deploy |
| AI tool responses | **Not cached** — each call is user-specific and low-volume | N/A |
| Storybook build | Chromatic (per-commit, content-addressed) | Automatic on new commit |

No Redis or in-memory application cache needed for v1. The AI tool is rate-limited, not cached — responses vary per input.

### Scaling Plan (Honest v1 Assessment)

Expected traffic: demo portfolio usage — tens of requests per day. No scaling concern for v1.

First bottleneck if traffic grows: the Anthropic API rate limit on the AI tools. Lever: per-user session tokens instead of shared API key, or a queue with backpressure. This is explicitly not built for v1.

---

## 0.3 "Database" Design — Token Schema and File Artifacts

This project has no traditional database. Persistent state lives in files:

### Token Source of Truth: `packages/tokens/tokens.json`

**Structure (two-tier: primitive → semantic):**

```
tokens.json
├── color
│   ├── primitive          (raw hex values: neutral.0 → neutral.950, brand.purple, etc.)
│   └── semantic           (aliases: background.default → {color.primitive.neutral.0})
├── spacing                (4px grid: spacing.1 = 4px, spacing.2 = 8px, ... spacing.16 = 64px)
├── radius                 (radius.none, radius.sm, radius.md, radius.lg, radius.full)
├── typography
│   ├── fontSize           (xs, sm, base, lg, xl, 2xl, 3xl)
│   ├── fontWeight         (normal: 400, medium: 500, semibold: 600, bold: 700)
│   └── lineHeight         (tight: 1.25, normal: 1.5, relaxed: 1.75)
└── shadow                 (shadow.sm, shadow.md, shadow.lg, shadow.xl)
```

**Alias resolution rule:** Semantic tokens ALWAYS reference primitive tokens by path (e.g. `{color.primitive.neutral.0}`). Components ALWAYS reference semantic tokens (e.g. `var(--color-background-default)`). Components NEVER reference primitive tokens directly. This is the only rule that makes dark mode work without touching component code.

**Dark mode strategy:** `[data-theme="dark"]` selector in `tokens.dark.css` overrides only the semantic tokens. Primitive tokens do not change — only the mapping from semantic name to primitive value changes.

### Style Dictionary Output (generated — never hand-edited)

| Output File | Location | Consumer |
|------------|----------|----------|
| `tokens.css` | `packages/tokens/dist/` | Imported in Storybook global CSS; consumers import in their app root |
| `tokens.dark.css` | `packages/tokens/dist/` | Same — loaded alongside tokens.css |
| `tokens.ts` | `packages/tokens/dist/` | Imported by `packages/core` components for typed token constants |

**Migration strategy for token changes:**
- Additive changes (new token): no breaking change — publish as minor
- Rename: add new name first (one release), deprecate old name, remove in next major — never rename in one step
- Value change: always a patch (bug fix) or minor (intentional design change) — document in CHANGELOG via Changesets

---

## 0.4 Cross-Cutting Best Practices (apply everywhere, stated once)

### TypeScript Conventions

- **Strict mode + `exactOptionalPropertyTypes`**: enabled in all `tsconfig.json` files across all packages
- **Zero `any`**: CI gate (`tsc --noEmit`) fails on any `any`. Use `unknown` + type narrowing, or explicit casts with a comment explaining why
- **No default exports from components**: named exports only — prevents bundler aliasing issues and makes refactoring find-all reliable
- **Polymorphic `as`-prop pattern**: the canonical implementation lives in `packages/core/src/utils/polymorphic.ts`. All polymorphic components import from there — never re-implement the pattern inline

### Component API Conventions

- **Every component forwards its ref** using `React.forwardRef` — no exceptions, even for simple wrappers
- **`className` is always merged** via `clsx` + `tailwind-merge` (to handle Tailwind class conflicts safely), never overwritten
- **All unknown props are spread** to the underlying element (`...rest`) — components are never prop-black-holes
- **Controlled + uncontrolled**: stateful components (Checkbox, Tabs, Accordion, Select) support both patterns. The rule: if `value` prop is provided, it's controlled; if not, the component manages its own state via `useState`
- **`data-*` attributes pass through** via `...rest` — consumers use these for testing (`data-testid`) without special handling

### Error Handling Convention

There are no thrown errors in component code (components don't throw). Error handling applies to:
- **AI tool API routes**: all errors returned as `{ error: string, code: string }` JSON with appropriate HTTP status. Never expose raw Anthropic error messages to the client.
- **Style Dictionary build**: script exits with code 1 on token alias resolution failure — CI catches this
- **JSX validation (Component Generator)**: parse failure returns `{ valid: false, error: string }` — UI shows inline error, does not display invalid JSX

### Accessibility Convention (applies to every component)

- **axe-core zero violations**: enforced by `jest-axe` in every component test. This is a hard CI gate — not a recommendation.
- **`aria-*` props always pass through** to the underlying element via `...rest`
- **Focus visible**: use the CSS class `focus-visible:ring-2 focus-visible:ring-offset-2` (Tailwind) on all interactive elements. Never remove the default focus outline without providing an equivalent.
- **Motion**: every CSS animation/transition is wrapped in `@media (prefers-reduced-motion: no-preference)` — the default state is no animation
- **Touch targets**: minimum `min-h-[44px] min-w-[44px]` on all interactive elements (WCAG 2.5.5)

### Styling Convention

- **Tailwind for layout and variant styles** (via `cva` — class-variance-authority — for component variants)
- **CSS custom properties for token values** — components never hardcode hex values or raw spacing numbers
- **`cn()` utility function** = `clsx` + `tailwind-merge`, exported from `packages/core/src/utils/cn.ts`
- **No CSS-in-JS runtime** — no Emotion, no styled-components, no Stitches. Build-time only.

### Logging & Observability (AI tools only — components have no runtime logging)

- AI API routes log: request received (IP hash, not raw IP), Anthropic response time, error code if failed
- No PII logged — prompts are not persisted or logged (note in privacy section of README)
- Local dev: `console.log` is acceptable; production (Vercel/Chromatic): use `console.error` for actual errors only

### Environment & Config Convention

- `.env.example` at repo root lists every required variable with description
- Required variables: `ANTHROPIC_API_KEY` (AI tools only — never exposed client-side)
- The Next.js `apps/docs` app validates at startup that `ANTHROPIC_API_KEY` is set — if missing, AI tool routes return 503 with a clear error instead of crashing at request time
- No secrets in code, no secrets in git history — enforced by `.gitignore` and a pre-commit hook

### Versioning & Release Convention

- **Changesets** for all version bumps and changelog generation — no manual `npm version`
- **Semver policy:**
  - `patch`: bug fix, accessibility fix, token value correction
  - `minor`: new component, new variant, new token, new hook
  - `major`: breaking change to component API, token rename, removal
- **Every PR that changes public API requires a changeset** — CI checks for this via `changeset status`

---

## Phase 0 Output

This document is the `ARCHITECTURE.md` for the project. Every Phase 1 task references specific sections here instead of re-explaining decisions. The phrase "per Phase 0 conventions" in a task note means: look it up here.

---

*Last updated: Phase 0 baseline. Update this document when a Phase 0 decision changes — note the date and reason.*
