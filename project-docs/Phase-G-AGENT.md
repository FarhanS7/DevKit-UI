# Phase G Agent Instructions — AI Developer Tools

> **Agent:** Read `AGENT-CONTEXT.md` fully before starting this file.
> **Goal:** Create Next.js API proxy routes and corresponding interactive UI widgets to query Claude via streaming Server-Sent Events (SSE).
> **Commit target:** `feat(phase-G): AI Developer Tools — Component Generator, A11y Checker, Theme Builder`

---

## PHASE OVERVIEW

**What this phase produces:**
- `/api/ai/generate-component` — Next.js SSE proxy streaming JSX component layouts.
- `/api/ai/check-accessibility` — Next.js SSE proxy streaming WCAG audits.
- `/api/ai/build-theme` — Next.js SSE proxy generating JSON token overrides.
- `ComponentGenerator` UI — Storybook workspace tool with Babel-parser checks.
- `AccessibilityChecker` UI — Visual panel splitting WCAG audits into markdown section cards.
- `ThemeBuilder` UI — Live theme overrides injector calculating color contrast.

**Why this order matters:**
- API routes must exist and be rate-limited before constructing UI widgets.
- The theme toggle and Style Dictionary variables must be ready in Storybook before theme overrides can be injected in real time.

**Skills to read first:**
- `.agents/skills/senior-backend/SKILL.md`
- `.agents/skills/nodejs-backend-patterns/SKILL.md`
- `.agents/skills/vercel-react-best-practices/SKILL.md`

---

## AI TOOLS ARCHITECTURE RULES

### 1. The SSE Streaming Proxy Pattern
API keys must never be exposed to the browser.
- Browser connects to `/api/ai/*` Next.js routes using `EventSource` or streaming fetches.
- Next.js route validates input with Zod, checks rate limits, calls the Anthropic API, and pipes the response as `text/event-stream`.
- Set matching SSE headers:
  ```typescript
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Prevent Nginx buffering
  ```

### 2. In-Memory Rate Limiting
- Block spam requests using an in-memory Map tracking IP request counts.
- Cap requests at 20 requests per hour per IP.

---

## TASK EXECUTION SEQUENCE

---

### TASK G.1 — Proxy Route: generate-component
**File:** `Implementation Plan/Phase G - AI Developer Tools/Task G.1 - Proxy Route generate-component.md`

- **Technical Spec:**
  Next.js SSE route. Uses Zod for input validation. Calls Anthropic SDK to stream JSX component layouts.
- **Verification:**
  Assert that route returns raw SSE token event data when queried via curl requests.

---

### TASK G.2 — Proxy Route: check-accessibility
**File:** `Implementation Plan/Phase G - AI Developer Tools/Task G.2 - Proxy Route check-accessibility.md`

- **Technical Spec:**
  API route. Instructs Claude to reference WCAG 2.1 AA rules and output structured audits (violations, code fixes).
- **Verification:**
  Verify that route returns structured WCAG analysis text blocks.

---

### TASK G.3 — Proxy Route: build-theme
**File:** `Implementation Plan/Phase G - AI Developer Tools/Task G.3 - Proxy Route build-theme.md`

- **Technical Spec:**
  API route. Returns a JSON token override dictionary.
- **Verification:**
  Assert that output matches valid JSON format and contains semantic tokens only (e.g. `color.semantic.background.default`).

---

### TASK G.4 — ComponentGenerator UI
**File:** `Implementation Plan/Phase G - AI Developer Tools/Task G.4 - ComponentGenerator UI.md`

- **Technical Spec:**
  UI widget in Storybook. Streams JSX outputs.
- **Babel-parser checks:**
  Uses `@babel/parser` to check JSX syntax rules before copying to clipboard, avoiding compiler crashes for users.
- **Verification:**
  Verify that prompts trigger SSE connections and display streaming layouts in real time.

---

### TASK G.5 — AccessibilityChecker UI
**File:** `Implementation Plan/Phase G - AI Developer Tools/Task G.5 - AccessibilityChecker UI.md`

- **Technical Spec:**
  UI widget in Storybook.
- **Verification:**
  Verify that the UI parses streamed markdown into visually distinct cards (Problem, Fix, Code).

---

### TASK G.6 — ThemeBuilder UI
**File:** `Implementation Plan/Phase G - AI Developer Tools/Task G.6 - ThemeBuilder UI.md`

- **Technical Spec:**
  UI widget in Storybook.
- **Visual Overrides Injection:**
  Injects generated JSON overrides directly into document styles as CSS custom properties (e.g. `document.documentElement.style.setProperty('--color-background-default', value)`).
- **Verification:**
  Verify that themes update in real time. Verify color pairs are validated against WCAG contrast thresholds (4.5:1 for normal text).

---

## PHASE G COMPLETION PROTOCOL

### Run Final Phase Check
```bash
pnpm lint
pnpm typecheck
pnpm test
```

### Create Walkthrough
Create `Walkthroughs/Phase G - AI Developer Tools/Walkthrough.md` detailing:
1. SSE streaming proxy architecture.
2. Prompt engineering techniques used to constrain Claude.
3. Babel-parser compilation checks.
4. Color contrast calculation math.

### Git Commit
```bash
git add .
git commit -m "feat(phase-G): AI Developer Tools — Component Generator, A11y Checker, Theme Builder

- Next.js API routes with IP-based in-memory rate limiting and SSE streams
- Zod schemas validating API parameters, system prompts for component library
- ComponentGenerator UI: Babel parser checks JSX compilation before copying
- AccessibilityChecker UI: streams WCAG audits into markdown section cards
- ThemeBuilder UI: calculates contrast ratios and injects CSS custom properties

Phase: G
Tasks: G.1, G.2, G.3, G.4, G.5, G.6
Tests: 8 unit | 4 mock integration
Breaking: none"

git push origin dev
```

### Update Master Index
Open `00-MASTER-INDEX.md` and mark all Phase G tasks as ✅.

---

## WHAT RECRUITER SEES IN THIS COMMIT

A recruiter reviewing this commit sees:
- **"They know API security patterns"** — server-side proxy routes prevent key leakage.
- **"They write smooth interactive UIs"** — SSE streaming combined with Babel syntax checks show advanced frontend engineering capabilities.
- **"They think in design system parameters"** — live CSS custom property injection and color contrast checks show platform-level maturity.
