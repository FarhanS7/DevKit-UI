# Product Engineering — AI-Powered Design System & Component Library

> **Document type:** Product + Engineering perspective.  
> **What this covers:** The *why* behind the project — user personas, product decisions, engineering trade-offs, and the reasoning a PM or senior engineer would give when asked "why did you build this, and why like this?"  
> **Use this for:** Interview prep. When asked "walk me through this project" — start with §1. When asked "why did you make X decision" — reference the relevant section.

---

## 1. The 30-Second Pitch

> *"I built an open-source React component library called `@yourusername/ui`. It's published on npm, documented in a live Storybook, and fully accessible — 100% WCAG 2.1 AA across all interactive components. What makes it different is the AI layer: three tools built into the library itself — a component generator, an accessibility checker, and a theme builder — all powered by Claude and streamed to the browser via SSE. The project signals that I think at the platform level, not just the feature level."*

---

## 2. Why This Project (Product Rationale)

### The Real Problem

Every engineering team above ~30 people hits the same four problems:

1. **Inconsistent UI** — different engineers build similar components differently. A button in the checkout flow looks different from a button in the dashboard.
2. **Duplicate components** — teams re-implement the same `Modal` component five times, each with different accessibility behavior.
3. **Accessibility regressions** — every new feature is tested for visual correctness, almost never for screen reader behavior.
4. **Design → Engineering handoff friction** — designers define values in Figma that engineers re-implement by hand in CSS, with inevitable drift.

A design system solves all four. But most design system tutorials cover the surface level (how to export a Storybook). This project goes to the bottom (ARIA patterns, TypeScript generics, token pipelines, visual regression CI).

### Why Anyone Would Actually Use This

The library is genuinely useful to other developers, not just a portfolio showcase:

- **Real npm package** — consumers can `npm install @yourusername/ui` and get production-ready components immediately.
- **Token system** — compatible with Figma Tokens plugin export format. Design → code handoff is a file copy.
- **AI tools** — not a chatbot bolted on. Three tools that solve real problems developers face when using a design system:
  - *"I need a card with a button — what's the correct JSX?"* → Component Generator.
  - *"My modal doesn't return focus to the trigger — what WCAG criterion am I violating?"* → Accessibility Checker.
  - *"We want a calm, professional blue theme for our fintech product"* → Theme Builder.

### Why This Signals Senior-Level Thinking

Most portfolios have feature projects (a Todo app, a blog, a chat app). Very few have platform projects. A design system is a **platform** — it's infrastructure that other teams build on top of. Building one correctly requires:

- Component API design (TypeScript generics, polymorphism, compound components)
- ARIA expertise (not just adding `aria-label`, but implementing focus traps, live regions, keyboard patterns)
- Token pipeline architecture (Style Dictionary, CSS custom properties, dark mode strategy)
- Developer experience (tree-shaking, bundle analysis, Storybook, versioning)
- CI/CD for a library (visual regression, bundle gates, automated npm publish)

This is exactly the skillset that engineering managers above 50-person teams are hiring for.

---

## 3. Target Users

### Primary Users

| User | Pain Point | How This Helps |
|---|---|---|
| **Frontend developers on small teams** | No time to build accessible components from scratch | Install the library, get WCAG 2.1 AA compliance out of the box |
| **Accessibility engineers** | Have to audit and re-audit the same components repeatedly | axe-core + manual NVDA tests are run on every CI build — violations block merge |
| **Designers** | Figma values don't match what's in production | Style Dictionary pipeline: Figma Tokens → tokens.json → CSS → components. One source of truth. |
| **Engineering managers** | Need to assess whether a candidate can own infrastructure | The project demonstrates system thinking, not just feature shipping |

### Secondary Users (v2 and beyond)

- **Design system maintainers** at medium companies who need a reference implementation
- **Developers learning ARIA** who want to read production-quality accessibility code
- **Library authors** who want to see a well-structured Vite library mode config

---

## 4. Product Decisions (The "Why" Behind Features)

### Decision 1: Radix UI for Primitives (Not DIY ARIA)

**What we chose:** Radix UI headless primitives for Tier 2 interactive components (Dialog, Tabs, Accordion, Select, Popover, Checkbox).

**Why not DIY:**
- WAI-ARIA compliance for complex widgets (combobox, dialog, tabs) is extremely hard to get right. The ARIA Authoring Practices Guide has 30+ pages on the dialog pattern alone.
- Radix's ARIA implementation is maintained by a full-time team and tested against multiple screen readers. Our own ARIA implementation would have bugs for months.
- The signal of using Radix is still strong — knowing *which* tool to use and *how to style* it is senior-level. Radix is unstyled; all visual design is our own.

**Why not use a pre-styled library (MUI, Chakra):**
- Pre-styled libraries don't demonstrate component API design or TypeScript generics — the hard parts.
- Their styles are hard to override cleanly and tend to conflict with token systems.
- We want to own the visual layer completely (token-driven styling, dark mode, brand customization).

**Trade-off acknowledged:** Radix's bundle size is a concern. Each Radix primitive adds ~2–8KB to the consumer's bundle. This is acceptable because (a) Radix packages are externalized — they're peer dependencies, not bundled into our library, and (b) consumers only pay for the Radix packages of the components they use (tree-shaking at the package level).

### Decision 2: SSE Streaming for AI Tools (Not WebSockets, Not Polling)

**What we chose:** Server-Sent Events (SSE) via Next.js API routes.

**Why SSE over WebSockets:**
- WebSockets are bidirectional — the client and server can both send messages. For LLM responses, we only need server → client (one direction). SSE is simpler, lighter, and doesn't require a WebSocket server.
- WebSockets don't work on serverless (Vercel Functions) — connections close after a few seconds. SSE works fine because each SSE response is a single HTTP response that streams.
- SSE reconnects automatically on connection drop (built into the browser `EventSource` API). No reconnection logic needed.

**Why SSE over polling:**
- Polling introduces artificial latency (you wait for the next poll interval after the server has data).
- Polling generates unnecessary requests (you're asking "is there data?" when there might not be).
- SSE is push-based — data arrives as soon as the server has it.

**Trade-off:** SSE is unidirectional — no client → server mid-stream. If we wanted to implement cancellation ("stop generating"), we'd need a separate DELETE request to cancel the operation. This is a known limitation, documented for v2.

### Decision 3: Style Dictionary (Not Manual CSS Vars)

**What we chose:** Style Dictionary to transform `tokens.json` → CSS custom properties + TypeScript constants.

**Why not maintain CSS vars manually:**
- Manual maintenance of CSS custom properties across light and dark mode means two files that can drift. If you add a semantic token in light mode and forget the dark override, dark mode silently shows the light value. This is a silent, hard-to-catch bug.
- The TypeScript token types (`ColorToken` union type) cannot be generated manually at scale — you'd have to update a type union every time you change a token name.
- Style Dictionary is a build step, not a runtime dependency — it adds zero bytes to the consumer's bundle.

**Why Figma compatibility matters:**
- `tokens.json` in Style Dictionary format is compatible with the Figma Tokens plugin (now Tokens Studio). This means a designer can export tokens directly from Figma and drop the file into the repo — the pipeline handles the rest. This is a real productivity win and a strong talking point.

**Trade-off:** Style Dictionary has a learning curve and requires a build step before development. The `pnpm dev` script runs `pnpm build:tokens` first — this means developers must wait ~2 seconds for tokens to build before Storybook starts. This is an acceptable trade-off for the integrity guarantees.

### Decision 4: Polymorphic `as`-Prop (Not Separate Components)

**What we chose:** The `as` prop pattern — `<Button as="a" href="...">` renders an anchor, `<Button>` renders a button.

**Why not separate `ButtonLink` and `Button` components:**
- A `ButtonLink` component is a maintenance burden — any new prop added to `Button` (new variant, new size) must be duplicated in `ButtonLink`.
- Consumers frequently need a button that "looks like" one thing but "is" another — a navigation action that should be an `<a>` tag for semantics, but looks like a button for UX.
- The polymorphic pattern is the industry standard (MUI's `component` prop, Chakra's `as` prop). Demonstrating it shows TypeScript mastery.

**Trade-off:** The polymorphic TypeScript types are complex. The `forwardRef` + generic type interaction requires an explicit cast. This is documented with comments in the source, but it's genuinely a hard TypeScript pattern that requires explanation. That's fine — it's the point.

### Decision 5: In-Memory Rate Limiting (Not Redis)

**What we chose:** JavaScript `Map` in the Next.js API route for rate limiting.

**Why not Redis for v1:**
- Redis adds a deployment dependency (need to provision a Redis instance), cost, and infrastructure complexity.
- The AI tools are rate-limited to 20 requests/hour per IP. For demo traffic (tens of requests/day), the in-memory map is never a bottleneck.
- Serverless functions on Vercel have warm instances — the in-memory map persists between invocations on the same instance. For low traffic, this is effectively correct.

**Why this is documented as a known limitation:**
- If deployed with multiple Vercel function instances, each instance has its own map. A user could make 20 requests to instance A and 20 more to instance B. The rate limit doesn't hold across instances.
- This is explicitly documented in the README and in the code. The fix (Redis) is a 2-hour task, documented in `system-design.md §4`.

**The honest engineering answer for interviews:** "I made a deliberate trade-off — Redis for a demo with tens of requests per day would be over-engineering. I've documented exactly where this breaks down and what the fix is. Choosing the simple solution and documenting the scale boundary is itself a senior engineering skill."

---

## 5. Engineering Trade-offs

### Trade-off 1: Bundle Size vs. Feature Richness

**The constraint:** < 80KB gzip for the full library.

**What this means in practice:**
- No runtime CSS-in-JS (Emotion, styled-components) — these add 15–30KB.
- Icons are lazy-loaded (zero bytes in initial bundle, ~300 bytes per icon on demand).
- Radix UI packages are external (peer dependencies) — their sizes are the consumer's responsibility, not ours.
- The `sideEffects: false` flag enables tree-shaking so consumers who import only `Button` don't pay for `VirtualList`.

**The trade-off:** Tailwind CSS requires a PostCSS build step in the consumer's app. If the consumer doesn't use Tailwind, they need to configure PostCSS. This is documented in the README. An alternative (pure CSS Modules) would have been more universal but harder to maintain.

### Trade-off 2: Accessibility Rigor vs. Build Speed

**The constraint:** Zero axe violations on every CI run.

**What this means in practice:**
- axe-core runs on every component test. This adds ~200ms per component to the test suite.
- NVDA + Chrome manual tests are required before marking Tier 2 components done. This takes time.
- Some components (Dialog, Combobox, DataGrid) have genuinely complex ARIA requirements that take hours to get right.

**The trade-off:** The test suite is slower than a library without axe testing. The components take longer to build. The payoff: every component shipped is WCAG 2.1 AA compliant. This is the entire point of the project — not just shipping components, but shipping *accessible* components.

### Trade-off 3: Radix Dependency vs. Full Control

**The constraint:** Using Radix UI means accepting Radix's API surface and update cadence.

**What this means in practice:**
- If Radix changes its API, our components may need updates.
- Radix's ARIA implementation is excellent but not infinitely configurable — if we need a behavior Radix doesn't support, we have to work around it.
- Radix packages are external — consumers must install them as peer dependencies, which means 5–10 additional packages in their `node_modules`.

**The trade-off:** The alternative — implementing ARIA from scratch — is a 3-6 month project just for correct ARIA. The portfolio goal is to demonstrate the full design system lifecycle in 10–12 weeks. Radix solves the hard ARIA problem so we can spend time on what differentiates this library: the TypeScript generics, the token pipeline, and the AI tools.

---

## 6. Engineering Decisions That Demonstrate Senior Thinking

These are the specific decisions that a senior engineer asks about in an interview. Know why each one was made:

### "Why pnpm workspaces instead of a single package?"

Token consumers (who just want the CSS file) shouldn't have to install React to get the tokens. `packages/tokens` is a standalone, publishable package with no React dependency.

### "Why did you use `exactOptionalPropertyTypes` in tsconfig?"

Without it, `{ size?: 'sm' | 'md' }` allows `{ size: undefined }`. Components that check `size ?? 'md'` would receive `undefined` (which is falsy) and default correctly — but this masks a bug where the caller explicitly passed `undefined` thinking it was equivalent to not passing the prop. `exactOptionalPropertyTypes` makes this a compile error.

### "Why Server-Sent Events and not WebSockets?"

Because LLM streaming is unidirectional (server → client), SSE is the correct primitive. WebSockets are bidirectional, which adds complexity for zero benefit here. SSE also works natively in browsers without a library and reconnects automatically.

### "Why do you cast `Button` with `as ButtonComponent` after `forwardRef`?"

TypeScript's type inference doesn't propagate generic type parameters through `React.forwardRef`. The resulting type would be `ForwardRefExoticComponent<...>` which loses the generic. The explicit cast to the fully-typed `ButtonComponent` restores the correct inference — `<Button as="a">` correctly infers anchor props. The cast is safe because we've defined the exact input and output types.

### "Why Changesets for versioning instead of semantic-release?"

Changesets is **monorepo-aware** — it handles cross-package versioning (if `packages/core` depends on `packages/tokens` and you update tokens, Changesets knows to bump both). semantic-release is single-package-focused and requires plugins for monorepo support. Changesets also enforces that every PR with a public API change has a written changelog entry — this habit is valuable beyond the tooling.

### "Why mark icons as `aria-hidden` by default?"

Icons used alongside text are purely decorative — the text conveys the meaning. If a screen reader also announces "checkmark icon" before "Submit", the user hears redundant information. `aria-hidden="true"` on decorative icons is the WCAG-recommended pattern. When icons are used alone (without adjacent text), they must have `aria-label` on the wrapper — our TypeScript enforces this via a discriminated union on the Icon component's props.

### "Why use `position: fixed; top: -${scrollY}px` for scroll lock?"

The naive approach (`document.body.overflow = 'hidden'`) works on most pages but fails when there's a scrollable parent that's not `body`. The `position: fixed` approach works universally because it takes the body out of the layout flow, preventing all scrolling. The `top: -${scrollY}px` compensates for the page jumping to the top (fixed elements start at the viewport top, not the current scroll position). On cleanup, we `window.scrollTo(0, scrollY)` to restore the position.

---

## 7. What I Would Do Differently (Growth Mindset for Interviews)

Being able to critique your own work is a signal of seniority. Here are honest retrospective notes:

1. **Token naming convention** — The `color.text.primary` naming can be confused with "primary brand color" instead of "primary text color." A clearer naming like `color.text.default` vs `color.text.subdued` would be less ambiguous.

2. **More integration tests earlier** — I started writing integration tests after the first few components were done, but should have set up the test infrastructure in Week 1 alongside CI. This would have caught a few cross-package type issues earlier.

3. **Storybook play functions** — I wrote Playwright tests for keyboard interaction, but Storybook's play functions (using `@storybook/testing-library`) would let me write interaction tests inside the story file itself, making them visible in the Storybook UI. More discoverable for future contributors.

4. **DatePicker complexity** — The DatePicker is the most complex component (calendar grid algorithm + ARIA grid pattern + i18n). In retrospect, this should have been a separate phase (v1.5) — the complexity of correctly implementing WAI-ARIA calendar grid was underestimated in the initial planning.

5. **Rate limiter should be extractable** — The rate limiter is currently inline in each API route file. It should be a shared middleware function from the start. Not a bug, but an architectural regret.

---

*This document is the "story" behind the project. Code tells you what was built. This document tells you why.*
