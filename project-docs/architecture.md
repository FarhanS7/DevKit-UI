# Software Architecture — AI-Powered Design System & Component Library

> **Document type:** Architecture Decision Record (ADR) + Structural Blueprint  
> **Status:** Baseline — update when a Phase 0 decision changes, note the date and reason  
> **Read this before:** every Phase 2 coding session. Do not re-derive these decisions in task notes — reference sections here.

---

## 1. Architecture Style: Monorepo with Package Boundaries

### Decision
**Monorepo using pnpm workspaces** — three independently-buildable units inside one git repository.

### Why Monorepo Over Alternatives

| Option | Rejected Reason |
|---|---|
| **Single package (everything together)** | Tokens and components become coupled. A consumer who only wants the CSS token file would pull the entire React tree. Bundle bloat for zero benefit. |
| **Fully separate repos** | Coordinated PRs across repos for a single token rename. Every cross-package change becomes a 2-repo ceremony. pnpm workspaces make `packages/tokens` changes instantly visible in `packages/core` during development. |
| **Microservices for AI layer** | Overkill. The AI tools are a thin proxy — three Next.js API routes. No state, no queues, no inter-service calls. Adding a separate service adds deployment overhead with zero scaling benefit at this traffic level. |

### The Three Units

```
@yourusername/ui (monorepo root)
│
├── packages/
│   ├── core/                     ← npm-published library (@yourusername/ui)
│   │   ├── src/
│   │   │   ├── components/       ← All React components (Tier 1–4)
│   │   │   ├── hooks/            ← Shared hooks (useFocusTrap, useScrollLock, useId)
│   │   │   ├── utils/            ← cn(), polymorphic.ts, focus.ts
│   │   │   └── index.ts          ← Public API barrel (named exports only)
│   │   ├── vite.config.ts        ← Library mode: ESM + CJS dual output
│   │   └── package.json
│   │
│   └── tokens/                   ← Standalone token pipeline (no React)
│       ├── tokens.json            ← Source of truth (Figma-export compatible)
│       ├── sd.config.js           ← Style Dictionary transform config
│       └── dist/
│           ├── tokens.css         ← :root { CSS custom properties }
│           ├── tokens.dark.css    ← [data-theme="dark"] { overrides }
│           └── tokens.ts          ← TypeScript typed constants
│
├── apps/
│   └── docs/                     ← Storybook + Next.js + AI tool UI
│       ├── .storybook/            ← Storybook config (Vite builder)
│       ├── stories/               ← One story file per component
│       ├── pages/
│       │   └── api/
│       │       └── ai/            ← Three API route proxies
│       │           ├── generate-component.ts
│       │           ├── check-accessibility.ts
│       │           └── build-theme.ts
│       └── components/
│           └── ai-tools/          ← AI tool UI React components
│               ├── ComponentGenerator.tsx
│               ├── A11yChecker.tsx
│               └── ThemeBuilder.tsx
│
├── .changeset/                    ← Automated semantic versioning
├── .github/
│   └── workflows/
│       ├── ci.yml                 ← lint → typecheck → test → playwright → chromatic → bundle
│       └── release.yml            ← changeset publish on main merge
├── scripts/
│   └── check-bundle-size.js       ← CI gate: fails if > 80KB gzip
└── pnpm-workspace.yaml
```

---

## 2. Module Boundaries (What Each Unit Owns)

This is the hardest rule in the project: **no cross-boundary leakage.**

| Package | Owns | Does NOT Own |
|---|---|---|
| `packages/tokens` | Token JSON schema, Style Dictionary config, output CSS + TS files | React, component logic, Storybook config |
| `packages/core` | React components, hooks, TypeScript types, barrel export | Token transformation, docs infrastructure, AI proxy logic |
| `apps/docs` | Storybook stories, MDX pages, AI tool UI, Next.js API routes (proxy only) | Component implementation, token generation |

### Communication Rules Between Packages

```
packages/tokens
       ↓ (workspace:*)
packages/core   →   imports tokens.ts for typed CSS var references
       ↓ (workspace:*)
apps/docs       →   imports core for stories; imports tokens for ThemeBuilder live preview

apps/docs pages/api/ai/*  →  Anthropic API  (one-directional, no callbacks)
```

- **No circular dependencies.** `packages/tokens` knows nothing about `packages/core`.
- **No event bus, no shared state** between packages at runtime — they communicate only through published TypeScript interfaces.
- **pnpm workspace protocol (`workspace:*`)** pins internal packages to the local version during development, so a mismatch between `packages/core` and `packages/tokens` is a **build error**, not a silent runtime mismatch. This is intentional.

---

## 3. Component Architecture

### 3.1 Tier System

Components are organized into four tiers by complexity, ARIA difficulty, and build dependency:

| Tier | Examples | Key Characteristic |
|---|---|---|
| **Tier 1 — Foundation** | Button, Input, Label, Text, Icon, Portal, VisuallyHidden | Every other component depends on these. Build first. |
| **Tier 2 — Interactive** | Dialog, Tabs, Accordion, Checkbox, Select, Popover | Heavy ARIA patterns. Radix UI primitives used for behavior. |
| **Tier 3 — Complex / DSA** | VirtualList, CommandPalette, DataGrid, DatePicker | Algorithm-heavy. Custom implementations (no Radix). |
| **Tier 4 — AI DX Tools** | ComponentGenerator, A11yChecker, ThemeBuilder | Unique product differentiator. LLM streaming output. |

### 3.2 Polymorphic `as`-Prop Pattern

**Problem:** A Button should be able to render as an `<a>` tag with `href`, or as a `RouterLink` with `to`. Naively, this means union types that grow unbounded and lose type safety.

**Solution:** Generic TypeScript that infers HTML attributes from the rendered element type.

```typescript
// packages/core/src/utils/polymorphic.ts
// (The canonical implementation — never re-implement this inline in components)

type PolymorphicRef<C extends React.ElementType> =
  React.ComponentPropsWithRef<C>['ref'];

type PolymorphicComponentProp<C extends React.ElementType, Props = {}> =
  Props &
  Omit<React.ComponentPropsWithoutRef<C>, keyof Props> & {
    as?: C;
  };

type PolymorphicComponentPropWithRef<C extends React.ElementType, Props = {}> =
  PolymorphicComponentProp<C, Props> & {
    ref?: PolymorphicRef<C>;
  };
```

**Why the cast is needed:**
```typescript
// TypeScript cannot infer generic types through React.forwardRef by default.
// The explicit cast to ButtonComponent is safe here because we've defined the
// exact types that go in and come out. Document this with a comment every time.
const Button = React.forwardRef(...) as ButtonComponent;
```

**Result:**
```typescript
<Button>Click</Button>              // props: ButtonHTMLAttributes — onClick, type, etc.
<Button as="a" href="/path">Link</Button>  // props: AnchorHTMLAttributes — href valid
<Button href="/path">Link</Button>  // TypeScript ERROR — href not valid on <button>
```

### 3.3 Component API Conventions (Apply to Every Component)

These are stated once here. Task notes say "per Phase 0 §3.3" instead of repeating:

1. **`React.forwardRef` on every component** — no exceptions, even simple wrappers like VisuallyHidden.
2. **`className` merged via `cn()`** (clsx + tailwind-merge) — never overwritten or concatenated with `+`.
3. **`...rest` spread to the underlying element** — components are never prop black holes.
4. **Named exports only** — never `export default`. This makes refactoring reliable and prevents bundler aliasing bugs.
5. **`type="button"` default on Button** — prevents accidental form submission inside `<form>` tags.
6. **`React.useId()` for auto-generated IDs** — never `Math.random()` (breaks SSR hydration).

### 3.4 Compound Component Pattern

Used by: Dialog, Tabs, Accordion (and any component with sub-components that share state).

```typescript
// Pattern structure — identical for all compound components:
const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const ctx = React.useContext(DialogContext);
  if (!ctx) throw new Error('useDialogContext must be used within <Dialog>');
  return ctx;
}

// Root component is the context provider
function Dialog({ children, ...props }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <DialogContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

// Sub-components consume context via static properties on the root
Dialog.Trigger = DialogTrigger;
Dialog.Content = DialogContent;
Dialog.Title = DialogTitle;
Dialog.Close = DialogClose;

// Consumer usage:
<Dialog>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Title>Title</Dialog.Title>
    <Dialog.Close>Close</Dialog.Close>
  </Dialog.Content>
</Dialog>
```

---

## 4. Build Architecture

### 4.1 Vite Library Mode

`packages/core` uses Vite in library mode — not app mode.

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',       // Single entry point — the public barrel
      formats: ['es', 'cjs'],       // ESM for bundlers, CJS for require() users
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: [                   // NEVER bundle these — they must come from the consumer
        'react',
        'react-dom',
        'react/jsx-runtime',
        /^@radix-ui\/.*/,           // All Radix packages are external
      ],
    },
  },
});
```

**Why external dependencies matter:** If React is bundled into the library, the consumer's app will have **two React instances** — one from the library, one from their app. This causes `useState` and other hooks to silently fail. Making React external forces the consumer to provide their own React instance.

### 4.2 Dual ESM + CJS Output

Both formats are required because:
- **ESM (`index.mjs`)**: Used by modern bundlers (Vite, webpack 5, Rollup). Enables tree-shaking.
- **CJS (`index.cjs`)**: Used by `require()` in Node.js environments (testing, SSR, older toolchains).

The `package.json` `exports` field maps them:
```json
{
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  }
}
```

### 4.3 Tree-Shaking

Tree-shaking works when:
1. The library uses **named exports** (not default exports with side effects).
2. The library is built as **ESM** (`"type": "module"` or `.mjs` extension).
3. The library marks itself as **side-effect free** in `package.json`: `"sideEffects": false`.

Without `"sideEffects": false`, bundlers assume importing any component might have side effects, and they bundle the entire library. With it, they can eliminate unused components.

---

## 5. AI Tools Architecture

### 5.1 The Proxy Pattern (Why It Exists)

```
Browser (React in Storybook)
  ↓ POST /api/ai/generate-component
Next.js API Route (apps/docs)    ← The proxy layer
  ↓ Anthropic SDK call
Anthropic API (claude-sonnet)
  ↑ Streaming response
Next.js API Route
  ↑ Server-Sent Events (SSE)
Browser React component         ← Reads stream, renders output progressively
```

**Why the proxy and not direct browser calls:**
- The Anthropic API key **must never be in the browser** — it would be visible in network requests and JS source.
- The proxy layer adds: input validation (Zod), rate limiting (IP-based), error normalization, and the ability to switch LLM providers without touching the frontend.
- SSE is used instead of regular JSON responses because LLM outputs are slow (3–15 seconds). SSE streams tokens progressively, giving users immediate visual feedback rather than a blank loading state.

### 5.2 The Three API Routes

Each route follows the same structural pattern (build G.1 once, reuse the pattern for G.2 and G.3):

```typescript
// Pattern: apps/docs/pages/api/ai/[tool].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';

const inputSchema = z.object({
  prompt: z.string().min(1).max(2000),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Method check
  if (req.method !== 'POST') return res.status(405).end();

  // 2. Input validation (Zod — never trust raw req.body)
  const parsed = inputSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  // 3. API key guard
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: 'AI service unavailable' });

  // 4. Rate limiting (IP-based, in-memory for demo)
  // [Rate limiter implementation per task G.1]

  // 5. Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // 6. Stream Anthropic response
  const client = new Anthropic();
  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,             // Tool-specific system prompt
    messages: [{ role: 'user', content: parsed.data.prompt }],
  });

  // 7. Pipe stream to SSE
  for await (const event of stream) {
    if (event.type === 'content_block_delta') {
      res.write(`data: ${JSON.stringify({ delta: event.delta.text })}\n\n`);
    }
  }
  res.write('data: [DONE]\n\n');
  res.end();
}
```

### 5.3 Rate Limiting Architecture

```
Per-IP: 20 requests per hour
Storage: In-memory Map<string, { count: number; resetAt: number }>
Reset: Rolling window — resets 1 hour from first request in the window

For production/scale: Replace with Redis + sliding window algorithm
Why not Redis for v1: In-memory is fine for demo traffic (tens of requests/day).
   Redis adds a deployment dependency and cost for zero practical benefit at this scale.
```

---

## 6. TypeScript Architecture

### 6.1 Compiler Configuration

All packages inherit from the root `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true,    // Prevents { prop?: string } from accepting undefined
    "noUncheckedIndexedAccess": true,      // array[i] returns T | undefined (safer)
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@yourusername/ui": ["packages/core/src/index.ts"],
      "@yourusername/tokens": ["packages/tokens/dist/tokens.ts"]
    }
  }
}
```

**`exactOptionalPropertyTypes` matters:** Without it, `{ size?: 'sm' | 'md' | 'lg' }` accepts `{ size: undefined }` which TypeScript normally treats as equivalent to omitting `size`. With it, explicitly passing `undefined` is a type error — components can rely on the actual type of optional props.

### 6.2 Zero `any` Policy

- `@typescript-eslint/no-explicit-any` is set to `error` in ESLint config.
- CI runs `tsc --noEmit` — a single `any` breaks the build.
- Permitted escape hatch: `as unknown as TargetType` with a JSDoc comment explaining why the cast is safe. These are tracked and periodically reviewed.

### 6.3 Type Tests (`.test-d.ts` files)

For polymorphic components and complex generics, runtime tests are insufficient — we need to verify TypeScript **rejects** certain patterns:

```typescript
// Button.test-d.ts — run with: pnpm test --typecheck
import { expectTypeOf } from 'vitest';
import { Button } from './Button';

expectTypeOf(<Button>Click</Button>).not.toBeNever();
// @ts-expect-error — href is not a valid prop on <button>
const invalid = <Button href="/path">Link</Button>;
expectTypeOf(<Button as="a" href="/path">Link</Button>).not.toBeNever();
```

---

## 7. Testing Architecture

### 7.1 Test Layers

| Layer | Tool | What It Tests | When It Runs |
|---|---|---|---|
| **Unit + Component** | Vitest + React Testing Library | Single component behavior, ARIA output | Every commit (local + CI) |
| **Accessibility** | jest-axe (axe-core) | WCAG 2.1 AA violations | Every commit — **hard gate** |
| **Type tests** | Vitest `--typecheck` | TypeScript constraints (`.test-d.ts`) | Every commit |
| **Visual regression** | Chromatic | Screenshot diff per story per PR | Every PR |
| **Integration** | RTL across components | Compound component context flows | Every PR |
| **E2E / Interaction** | Playwright | Complex keyboard flows (Dialog, Select) | Every PR |

### 7.2 Per-Component Test Structure

Every component has exactly these three files:
```
ComponentName/
  ComponentName.tsx         ← Implementation
  ComponentName.test.tsx    ← Vitest + RTL + jest-axe
  ComponentName.test-d.ts   ← Type tests (polymorphic components only)
  index.ts                  ← Re-export (barrel for this component)
```

The test file always follows this order:
1. Renders correctly (smoke test)
2. axe-core zero violations (`await axe(container)`)
3. Polymorphic rendering (if applicable)
4. Keyboard interaction
5. ARIA state assertions
6. Edge cases (error state, loading state, empty state)

---

## 8. CI/CD Pipeline Architecture

```
Push to any branch
       ↓
lint-and-typecheck   (ESLint + tsc --noEmit)
       ↓
test                 (Vitest unit + axe + type tests, coverage report)
       ↓ (parallel)
playwright           (E2E keyboard + focus trap tests, Chromium only)
chromatic            (Visual regression, full git history fetch)
bundle-analysis      (gzip check: fails if > 80KB)
       ↓ (all pass)
Merge to main allowed
       ↓
release.yml          (changeset version + publish to npm + Chromatic Storybook deploy)
```

**Why the ordering matters:**
- Lint and typecheck run first and are fast (< 30 seconds). They block more expensive jobs.
- Playwright and Chromatic run in parallel after tests pass. They're independent — a Playwright failure does not block Chromatic and vice versa.
- Bundle analysis runs on every PR, not just releases — catching bundle bloat early is cheaper than finding it after the feature is merged.

---

## 9. Dependency Decision Log

| Dependency | Version | Why Chosen | Alternatives Rejected |
|---|---|---|---|
| **React** | 18 | Concurrent features, `useId`, RSC-compatible | React 19 (not stable at project start) |
| **TypeScript** | 5.x strict | Maximum type safety, `satisfies`, `exactOptionalPropertyTypes` | — |
| **Radix UI** | latest | Unstyled, ARIA-correct, maintained by full-time team | Headless UI (fewer components), Ariakit (smaller community), DIY (too expensive for ARIA correctness) |
| **Tailwind CSS** | 3.x | Utility classes + `cva` for variants, no runtime | CSS Modules (poor component API DX), Emotion/styled-components (runtime cost, SSR complexity) |
| **Style Dictionary** | 3.x | Industry standard token transform, Figma export compatible | Manual CSS vars (maintenance burden), Theo (deprecated) |
| **Vite** | 5.x | Library mode, fast HMR, same tool as Storybook builder | Rollup (lower-level), webpack (slow, complex config) |
| **pnpm** | 8.x | Disk-efficient, strict peer deps, workspace protocol | npm workspaces (slower), yarn (different lockfile) |
| **Storybook** | 8.x | Industry standard, Chromatic integration, `@storybook/addon-a11y` | Docz (dead), Styleguidist (limited features) |
| **Vitest** | latest | Vite-native, Jest-compatible API, fast | Jest (Babel config overhead with Vite) |
| **Playwright** | latest | Component test mode, keyboard simulation, focus assertions | Cypress (component mode less mature for this use case) |
| **Chromatic** | hosted | Visual regression CI, free for open source | Percy (paid), Manual screenshots (not scalable) |
| **Anthropic SDK** | latest | claude-sonnet streaming, best code output quality | OpenAI (worse at JSX generation), Gemini (API instability) |
| **Changesets** | latest | Monorepo-aware semantic versioning, PR-based workflow | Manual npm version (error-prone), semantic-release (config complexity) |

---

*Last updated: Project baseline. When a decision in this document changes, record the date, old decision, new decision, and reason here.*
