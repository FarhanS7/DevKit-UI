# System Design — AI-Powered Design System & Component Library

> **Scope:** This document covers runtime behavior, data flows, scalability, performance, and infrastructure decisions. For structural/code architecture, see `architecture.md`. For token schema, see `database-schema.md`.  
> **Audience:** Developer + technical interviewer. Written to be the reference document for "how does this system work end-to-end" questions.

---

## 1. System Overview

This is a **two-product system** in one monorepo:

1. **`@yourusername/ui`** — A published npm library. No runtime system. Installed by consumers, runs in their apps. Has no server, no database, no API. Its "system" is the build pipeline and the browser.
2. **AI Developer Tools** — Three web-based tools hosted in the Storybook docs site. These have a real request/response system: browser → Next.js API route → Anthropic API → browser.

Most system design questions in this project are about the **AI tools layer**, because that's the only part with actual runtime infrastructure.

---

## 2. Request Flow Diagrams

### 2.1 Library Consumer Flow (No Server)

```
Developer installs: npm install @yourusername/ui

Their app bundler (Vite/webpack):
  imports { Button } from '@yourusername/ui'
       ↓
  Reads: packages/core/dist/index.mjs   (ESM)
       ↓
  Tree-shakes: Only Button's code included in their bundle
       ↓
  Browser: CSS custom properties from tokens.css applied at :root
       ↓
  Button renders with correct theme colors from CSS vars
```

No network requests at runtime. The library is static code + CSS.

### 2.2 AI Tool Flow (Component Generator)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Browser (Storybook docs site)                                          │
│  ComponentGenerator.tsx                                                 │
│                                                                         │
│  User types: "A card with a title and a button"                        │
│  → fetch POST /api/ai/generate-component { prompt: "..." }             │
│  → Opens SSE stream (EventSource)                                       │
│  → Renders tokens as they arrive (progressive display)                 │
└───────────────────────────┬─────────────────────────────────────────────┘
                            │ HTTP POST (same origin — docs site)
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Next.js API Route: pages/api/ai/generate-component.ts                  │
│                                                                         │
│  1. Validate input (Zod schema)                                        │
│  2. Check rate limit (IP-based, in-memory Map)                         │
│  3. Verify ANTHROPIC_API_KEY env var exists                            │
│  4. Set SSE response headers                                           │
│  5. Call Anthropic SDK with streaming enabled                          │
│  6. Pipe tokens → SSE events → client                                  │
│  7. Send [DONE] sentinel when stream ends                              │
└───────────────────────────┬─────────────────────────────────────────────┘
                            │ HTTPS to Anthropic API
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Anthropic API (claude-sonnet-4-6)                                      │
│                                                                         │
│  Receives: system prompt (component API) + user prompt                 │
│  Generates: JSX code token by token                                    │
│  Returns: streaming response (Server-Sent Events from Anthropic SDK)   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Token Pipeline Flow (Build Time, Not Runtime)

```
tokens.json (source of truth)
      ↓  pnpm build:tokens
Style Dictionary (sd.config.js)
      ↓
  ┌───────────────────────────────────────────┐
  │   Transform 1: Light mode                 │
  │   tokens.json → tokens.css               │
  │   :root { --color-background-default: #fff; ... }  │
  └───────────────────────────────────────────┘
  ┌───────────────────────────────────────────┐
  │   Transform 2: Dark mode                  │
  │   tokens.json (semantic only) →           │
  │   tokens.dark.css                         │
  │   [data-theme="dark"] { --color-background-default: #0f0f10; }  │
  └───────────────────────────────────────────┘
  ┌───────────────────────────────────────────┐
  │   Transform 3: TypeScript                 │
  │   tokens.json → tokens.ts                 │
  │   export const colorBackgroundDefault =   │
  │     'var(--color-background-default)';    │
  └───────────────────────────────────────────┘
      ↓ (only at dev startup or CI)
Storybook imports tokens.css + tokens.dark.css in preview.ts
packages/core imports tokens.ts for typed CSS var references
```

---

## 3. Sync vs. Async Boundaries

This table is the definitive answer to "why is X synchronous/async":

| Operation | Pattern | Why |
|---|---|---|
| **Component rendering** | Sync (React render cycle) | React renders synchronously by default. No I/O involved. |
| **Icon lazy-loading** | Async (`React.lazy` + dynamic import) | Deferred on first render to keep initial bundle size zero. Browser caches after first load. |
| **AI tool API calls** | Async + streaming (SSE) | LLM responses take 3–15 seconds. SSE streams tokens progressively — user sees output immediately rather than waiting for the full response. |
| **Token build** | Async (build-time script, not runtime) | Style Dictionary is a build tool. It runs in CI and during `pnpm dev`, never at request time. |
| **axe-core tests** | Async (Promise-based DOM scan) | DOM accessibility scan is inherently async — it must wait for all React renders to settle before analyzing. |
| **Playwright E2E tests** | Async (browser automation) | Real browser, real keyboard events, real focus management. |

**Key insight:** The AI tool is the **only place** in this system with a slow external call at runtime. Everything else is either sync (components) or build-time (tokens). This simplicity is intentional — no queues, no background jobs, no caches for v1.

---

## 4. Caching Strategy

**What's cached:**

| Resource | Cache Location | TTL / Invalidation |
|---|---|---|
| **Icon SVGs** | Browser HTTP cache | Permanent (content-hashed filenames from Vite build, new hash on change) |
| **Token CSS files** | CDN / browser cache | On new deploy (Chromatic/Vercel serves new file) |
| **Storybook build** | Chromatic (content-addressed) | Per commit — Chromatic stores snapshots, not the full build |
| **npm package** | npm registry + consumer CDN (jsDelivr, unpkg) | Per version — consumers pin to a version |

**What's NOT cached:**

| Resource | Why Not |
|---|---|
| **AI tool responses** | Every call is user-specific (different prompts). Responses are low-volume (rate-limited to 20/hour). Cache complexity > benefit at this traffic level. |
| **Component render output** | React handles its own render optimization via reconciliation. Application-level caching of renders is almost never correct. |

**For v2 / scale:**
- If AI tool usage grows, add a Redis cache with a hash of the prompt as the key. TTL: 24 hours (prompts don't change often, but responses should stay fresh).
- Add a distributed rate limiter (Redis INCR + EXPIRE) to replace the in-memory Map. Current in-memory solution resets on every server restart/redeploy.

---

## 5. Rate Limiting Architecture

### Current (v1): In-Memory

```typescript
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const WINDOW_MS = 60 * 60 * 1000;  // 1 hour
  const LIMIT = 20;                   // 20 requests per IP per hour

  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: LIMIT - 1 };
  }

  if (entry.count >= LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: LIMIT - entry.count };
}
```

**Why this is acceptable for v1:**
- Portfolio demo traffic: tens of requests per day, not thousands.
- Deploying to Vercel: each serverless function invocation is stateless, BUT Vercel reuses function instances (warm starts). For this traffic level, the in-memory map persists long enough.
- The risk: a server restart clears all rate limit counters. For a demo, this is acceptable.

### Production Path (v2):

```
Redis INCR + EXPIRE per IP key
Pattern: "ratelimit:{ip}:{window}" → counter
Window: 1 hour sliding window using two keys (current + previous window)
```

---

## 6. Error Handling Architecture

### Library Components (No Thrown Errors)

Components do not throw errors in the render path. Errors are:
- Compile-time TypeScript errors (preferred — caught at author time).
- Runtime prop validation via console.error in development mode only.

There is no ErrorBoundary wrapping library components — that's the consumer's responsibility.

### AI Tool API Routes

All errors are normalized to a consistent shape:

```typescript
// Error response type — always this shape, never raw Error objects
type ApiError = {
  error: string;   // Human-readable message (safe to display)
  code: string;    // Machine-readable code for client-side handling
};

// HTTP status codes used:
// 400 — Bad request (validation failure, Zod parse error)
// 405 — Method not allowed (GET instead of POST)
// 429 — Rate limit exceeded
// 503 — Service unavailable (missing API key, Anthropic API down)
// 500 — Internal server error (unexpected failures)

// Never expose:
// - Raw Anthropic SDK error messages (may contain request details)
// - Stack traces (security risk)
// - Environment variable names
```

### Style Dictionary Build Errors

The token build script (`pnpm build:tokens`) exits with code 1 on:
- Circular alias references (A → B → A)
- Missing alias targets (reference to a token that doesn't exist)
- Invalid JSON in `tokens.json`

CI catches exit code 1 and marks the build as failed. No silent failures.

---

## 7. Performance Architecture

### 7.1 Library Bundle Performance

**Target:** Core library < 80KB gzip. Single Button component < 3KB gzip.

**How we achieve it:**

1. **Tree-shaking:** Named exports + ESM format + `"sideEffects": false` in `package.json`. Consumers who import only `Button` get only Button's code.

2. **No runtime CSS:** No Emotion, no styled-components. CSS custom properties are loaded once as a static file. Components use Tailwind utility classes (build-time).

3. **Lazy icon loading:** `React.lazy` + dynamic imports. Zero icon bytes in the initial bundle. Each icon is ~300 bytes and loads on first use.

4. **External dependencies:** React, ReactDOM, and all Radix packages are externalized. The 80KB target is for the library's own code, not peer dependencies.

**CI enforcement:** `scripts/check-bundle-size.js` gzips the output and fails the CI job if > 80KB.

### 7.2 Storybook / Docs Site Performance

**Target:** Lighthouse score ≥ 95 on the Storybook documentation site.

**How we achieve it:**

1. **Vite builder for Storybook** — faster than webpack, better code splitting.
2. **Content-hashed assets** — CSS, JS, icon SVGs all get fingerprinted filenames from Vite. Browser caches aggressively.
3. **MDX pages** — Static HTML at build time. No client-side data fetching.
4. **AI tools are opt-in** — they're separate pages in Storybook, not loaded by default. No impact on component story performance.

### 7.3 VirtualList Performance (Tier 3 Component)

The `VirtualList` component is the most performance-sensitive piece of code in the library. It's specifically designed to render 10,000+ items without lag.

**Approach: Prefix-Sum Array + Binary Search**

```typescript
// At mount: O(n) — build the lookup structure once
const cumulativeHeights = itemHeights.reduce<number[]>((acc, h, i) => {
  acc.push((acc[i - 1] ?? 0) + h);
  return acc;
}, []);

// On every scroll event: O(log n) — binary search instead of linear scan
function getStartIndex(scrollTop: number): number {
  let lo = 0, hi = items.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;  // Unsigned right shift = fast Math.floor(mid/2)
    if (cumulativeHeights[mid] < scrollTop) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
```

**Why not O(n) linear scan:**
- At 10,000 items, a linear scan on every scroll event (which fires 60 times per second) = 600,000 comparisons per second. Noticeable lag at 30fps.
- Binary search at 10,000 items = ~14 comparisons per scroll event. Imperceptible.

**ResizeObserver:** The container's height is observed with a `ResizeObserver`. If the container resizes (window resize, layout shift), the visible range recalculates. This keeps the component correct during dynamic layouts.

---

## 8. Scalability Analysis

### Current State (v1)

| Dimension | Current Capacity | Bottleneck |
|---|---|---|
| **npm downloads** | Unlimited | npm CDN (effectively infinite) |
| **Storybook site traffic** | ~1000 concurrent visitors | Chromatic CDN (scales automatically) |
| **AI tool requests** | 20/hour per IP | Anthropic API rate limit + in-memory rate limiter |
| **AI tool latency** | 3–15 seconds per request | Anthropic model inference time (not our code) |

### First Bottleneck If Traffic Grows

**The AI tools.** The Anthropic API rate limit and our in-memory rate limiter are the first constraints that would break under real traffic.

**Levers (in order of simplicity):**
1. **Increase Anthropic rate limit** — paid plan upgrade. Zero code changes.
2. **Replace in-memory rate limiter with Redis** — survives server restarts and horizontal scaling. ~2 hours of work.
3. **Add response streaming cache (Redis)** — for identical or very similar prompts. More complex, requires prompt normalization.
4. **Add a queue with backpressure (BullMQ)** — for sustained high traffic. Full infrastructure change.

**The library itself does not scale** — it's npm-hosted static files. No scaling concern.

---

## 9. Security Architecture

### API Key Management

```
ANTHROPIC_API_KEY
  → Stored in: Vercel environment variables (encrypted at rest)
  → Accessed by: Next.js API routes only (server-side)
  → Never: exposed to browser, logged, included in error responses
  → Validated at: API route startup (fails with 503 if missing, not at first request)
```

### Input Validation

All AI tool API routes validate input with Zod before touching any other logic:

```typescript
const schema = z.object({
  prompt: z.string()
    .min(1, 'Prompt cannot be empty')
    .max(2000, 'Prompt too long')
    .regex(/^[^<>]*$/, 'HTML not allowed'),  // Basic XSS prevention
});
```

### Prompt Injection Defense

The system prompt is hardcoded in the API route and never user-controlled. User input goes only in the `messages[0].content` field. Anthropic's own safety layers provide additional defense.

### Privacy

- User prompts are **not logged or persisted** — every request is stateless.
- IP addresses used for rate limiting are never logged in plain text (hash before storing if logging is added).
- A privacy note is included in the README: "Prompts sent to the AI tools are not stored and are only used for generating responses."

---

## 10. Deployment Architecture

### Hosting

| Unit | Hosting | Why |
|---|---|---|
| `@yourusername/ui` (npm) | npm registry + CDN (jsDelivr, unpkg auto-host) | Standard npm publish. Free. Global CDN. |
| Storybook docs + AI tools | Chromatic (Storybook hosting) | Free for open source. Auto-deploys on merge to main. Visual regression history stored. |
| Optional: docs site | Vercel | Free tier, Next.js native, zero-config deploy. |

### Release Automation

```
Developer runs: pnpm changeset
  → Adds a .changeset/*.md file describing the change
  → Commits to feature branch

PR merged to main
  → GitHub Actions release.yml triggers
  → changeset version runs: bumps package.json, generates CHANGELOG.md
  → changeset publish runs: npm publish @yourusername/ui
  → Chromatic auto-deploys Storybook build
```

### Rollback Strategy

| Scenario | Rollback Method |
|---|---|
| **Bad npm release** | `npm deprecate @yourusername/ui@X.Y.Z "broken release"`. Consumers on specific version unaffected. New consumers won't get the bad version. Then publish a patch. |
| **Bad Storybook deploy** | Chromatic keeps history of all builds. One click to restore previous baseline. |
| **Bad AI tool deploy** | Vercel instant rollback to previous deployment. Zero downtime. |

**Rollback trigger:** Error rate spike (> 5% of AI tool requests returning 500), or a critical ARIA regression reported by a screen reader user.

---

## 11. Monitoring & Observability (v1 Baseline)

This is a portfolio project — not production infrastructure. Monitoring is minimal but honest:

| Signal | Tool | What Triggers Review |
|---|---|---|
| **Build failures** | GitHub Actions email notification | Any CI job fails |
| **npm download count** | npm dashboard | Weekly check — real usage signal |
| **Chromatic visual diffs** | Chromatic PR comments | Any new visual diff on PR |
| **AI tool errors** | Vercel function logs | Manual check if a user reports an issue |
| **Bundle size** | CI check-bundle-size.js | CI fails if > 80KB |

**What's NOT monitored (and why):**
- Real-time error rate: Not worth the infrastructure for demo traffic.
- User sessions: Privacy concern — portfolio users aren't consenting to analytics.
- AI response quality: Manual review of a sample of outputs is more useful than automated metrics for this use case.

---

*System design is honest about v1 constraints. Scale levers are documented but not built until needed. The goal is "simplest thing that is correct" — not "most impressive architecture on paper."*
