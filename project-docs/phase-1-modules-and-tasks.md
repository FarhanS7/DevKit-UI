# Phase 1 — Modules → Tasks
## Project: AI-Powered Design System & Component Library

> **How to read this document:**  
> Each module maps to a domain boundary from Phase 0. Each task is small enough to fit one AI Code Loop (Phase 2) prompt. Dependencies are tagged so you know what must exist before you can start each task. The per-task checklist uses the Phase 1.2 filter — categories that don't apply are noted as skipped, not silently omitted.

---

## 1.1 — Task Tree with Dependency Tags

```
Project: @yourusername/ui
│
├── Module A — Monorepo & Infrastructure Setup
│   ├── A.1 — pnpm workspace, repo scaffold, shared tsconfig          | blocked by: nothing (start here)
│   ├── A.2 — Vite library build config (packages/core)               | blocked by: A.1
│   ├── A.3 — Storybook 8 setup (apps/docs)                          | blocked by: A.1
│   └── A.4 — ESLint + Prettier + TypeScript strict config            | blocked by: A.1
│
├── Module B — Token Pipeline (packages/tokens)
│   ├── B.1 — tokens.json: primitive color + spacing + radius scale   | blocked by: A.1
│   ├── B.2 — Style Dictionary config: JSON → CSS vars (light mode)   | blocked by: B.1
│   ├── B.3 — Dark mode token file + [data-theme="dark"] override     | blocked by: B.2
│   ├── B.4 — TypeScript token constants generation (tokens.ts)       | blocked by: B.2
│   └── B.5 — Storybook global CSS integration + dark mode toggle     | blocked by: B.3, B.4, A.3
│
├── Module C — Utility Layer (packages/core/src/utils)
│   ├── C.1 — cn() utility (clsx + tailwind-merge)                    | blocked by: A.2
│   ├── C.2 — polymorphic.ts: PolymorphicComponentProp types          | blocked by: A.2
│   └── C.3 — getFocusableElements() + focus utility helpers          | blocked by: A.2
│
├── Module D — Tier 1: Foundation Components
│   ├── D.1 — VisuallyHidden component                                | blocked by: C.1
│   ├── D.2 — Portal component (renders to document.body)             | blocked by: C.1
│   ├── D.3 — Text / Heading (polymorphic, semantic HTML)             | blocked by: C.1, C.2, B.4
│   ├── D.4 — Label component (htmlFor association, compound context) | blocked by: C.1
│   ├── D.5 — Button (polymorphic as-prop, variants, isLoading)       | blocked by: C.1, C.2, B.4
│   ├── D.6 — Input (discriminated union text/number, a11y attrs)     | blocked by: C.1, D.4, B.4
│   ├── D.7 — Icon system (lazy-load, dynamic import, Suspense)       | blocked by: C.1, D.1
│   └── D.8 — axe-core test setup + zero-violation CI for Tier 1     | blocked by: D.1–D.7
│
├── Module E — Tier 2: Interactive Components
│   ├── E.1 — useFocusTrap hook                                       | blocked by: C.3
│   ├── E.2 — useScrollLock hook                                      | blocked by: C.1
│   ├── E.3 — Dialog / Modal (focus trap + scroll lock + portal)      | blocked by: D.2, E.1, E.2
│   ├── E.4 — Checkbox / Switch (tri-state, aria-checked)             | blocked by: C.1, D.4, B.4
│   ├── E.5 — Tabs (tablist/tab/tabpanel, arrow key nav)              | blocked by: C.1, B.4
│   ├── E.6 — Accordion (aria-expanded, compound context)             | blocked by: C.1, B.4
│   ├── E.7 — Select / Combobox (listbox, keyboard nav, Radix)        | blocked by: D.5, D.6, B.4
│   └── E.8 — Popover (aria-haspopup, click-outside, portal)         | blocked by: D.2, C.1
│
├── Module F — Tier 3: Complex / DSA Components
│   ├── F.1 — VirtualList (fixed-height, binary search, ResizeObserver) | blocked by: C.1
│   ├── F.2 — CommandPalette (fuzzy search via trigrams, Combobox)    | blocked by: E.7, F.1
│   └── F.3 — DataGrid (ARIA grid, row selection, column sort)        | blocked by: F.1, C.1
│
├── Module G — AI Developer Tools (apps/docs)
│   ├── G.1 — Anthropic API proxy route: generate-component           | blocked by: A.3 (Next.js routes exist)
│   ├── G.2 — Anthropic API proxy route: check-accessibility          | blocked by: G.1 (reuse proxy pattern)
│   ├── G.3 — Anthropic API proxy route: build-theme                  | blocked by: G.1
│   ├── G.4 — ComponentGenerator UI (streaming output, JSX validation) | blocked by: G.1
│   ├── G.5 — AccessibilityChecker UI                                 | blocked by: G.2
│   └── G.6 — ThemeBuilder UI (live CSS var injection into Storybook)  | blocked by: G.3, B.5
│
├── Module H — CI/CD & Release Pipeline
│   ├── H.1 — GitHub Actions CI workflow (lint, typecheck, vitest, axe) | blocked by: D.8
│   ├── H.2 — Chromatic visual regression CI                          | blocked by: D.5 (first story baseline)
│   ├── H.3 — Bundle analysis CI gate (< 80KB gzip, tree-shaking)    | blocked by: A.2
│   ├── H.4 — Changesets setup + release workflow                     | blocked by: A.1
│   └── H.5 — npm publish + GitHub Release automation                 | blocked by: H.1, H.4
│
└── Module I — Documentation
    ├── I.1 — README (what it is, local setup, deploy instructions)   | blocked by: Phase 1.5 setup
    ├── I.2 — ADRs (001–005 from PRD §15) as MDX pages in Storybook  | blocked by: A.3
    ├── I.3 — Story standards compliance audit (all variants per §16) | blocked by: all component tasks
    └── I.4 — Storybook polish + public launch                       | blocked by: I.1, I.2, I.3
```

---

## 1.1b — Critical Path & Sequencing

### Critical Path (longest blocking chain — determines earliest finish)

```
A.1 → B.1 → B.2 → B.3 → B.4 → B.5
                                  ↓
A.1 → A.2 → C.1 → C.2 → D.5 → E.7 → F.2 → G.4 → I.3 → I.4
```

The Token Pipeline (Module B) and Button/Combobox chain (D.5 → E.7) are the two critical paths that block the most downstream work.

### What to Build First (and why)

1. **A.1 first** — nothing is parallelizable without the monorepo scaffold
2. **B.1–B.4 in Week 2** — tokens unblock all component styling; doing this before any component avoids retrofitting
3. **C.1, C.2, C.3 before any Tier 1 component** — utilities must exist before components use them
4. **D.1 (VisuallyHidden) and D.2 (Portal) before D.5 (Button)** — foundational, low-risk, establish the pattern
5. **D.5 (Button) before any Tier 2 work** — most Tier 2 components trigger actions via buttons
6. **E.1 (useFocusTrap) before E.3 (Dialog)** — hook before the component that uses it
7. **F.1 (VirtualList) before F.2 (CommandPalette)** — CommandPalette uses VirtualList for option rendering
8. **G.1 (proxy route) before any AI tool UI** — shared pattern, build once

### What's Parallelizable (within a week, same session)

- A.3 (Storybook) and A.4 (lint config) can be done alongside A.2 (Vite config) in the same session
- D.1 (VisuallyHidden) + D.2 (Portal) can be done in one session — both are tiny
- D.3 (Text) + D.4 (Label) can be done in one session — both simple, similar pattern
- D.7 (Icon) + D.8 (axe test setup) can be paired in one session — icon tests validate the lazy-load pattern
- E.4 (Checkbox) + E.5 (Tabs) + E.6 (Accordion) are independent — parallelizable across sessions (Week 6–7)
- G.1, G.2, G.3 (all three proxy routes) follow the same pattern — do all three in one session

---

## 1.2 — Per-Task Scoped Checklist

> Format per task:  
> **Architecture | System Design | DSA | Database/Tokens | Best Practices | Real-life Engineering | Code Review Points | QA Testing**

---

### Module A — Monorepo & Infrastructure

---

#### A.1 — pnpm workspace, repo scaffold, shared tsconfig

**Architecture:** Establishes the monorepo boundary. `pnpm-workspace.yaml` defines `packages/*` and `apps/*`. Three tsconfigs: root (path aliases), `packages/core` (extends root, lib mode), `apps/docs` (extends root, Next.js mode).  
**System design:** N/A — no runtime behavior.  
**DSA:** N/A.  
**Tokens/DB:** N/A.  
**Best practices:** Root `package.json` should have no production dependencies — only workspace tooling (TypeScript, ESLint, Prettier, Changesets). Each package manages its own deps. `.npmrc` must set `strict-peer-dependencies=false` for Radix UI peer dep flexibility.  
**Real-life engineering:** pnpm workspace protocol (`workspace:*`) pins internal packages to local — this means a version mismatch between `packages/core` and `packages/tokens` is a build error, not a silent runtime mismatch. Set this up correctly from day one.  
**Code review points:** Verify `tsconfig.json` `paths` aliases are consistent across all packages. A missing alias here will produce confusing "module not found" errors three weeks later.  
**QA:** `pnpm install` from root resolves all packages cleanly. `pnpm -r build` succeeds on empty packages with placeholder `index.ts`.

---

#### A.2 — Vite library build config (packages/core)

**Architecture:** Library mode Vite config outputs ESM + CJS dual format. `rollup-plugin-visualizer` added for bundle analysis. External: React, ReactDOM, Radix packages — never bundled into the library output.  
**System design:** N/A — build-time only.  
**DSA:** N/A.  
**Tokens/DB:** N/A.  
**Best practices:** `build.lib.entry` points to `src/index.ts` (the barrel export). `build.rollupOptions.external` must include all peer dependencies — failure here bundles React twice in consumer apps, causing hook errors.  
**Real-life engineering:** The dual ESM/CJS output via `vite build` with two format passes. Verify `package.json` `exports` field has both `"import"` and `"require"` paths pointing to the correct output files — this is what allows both `import` and `require` consumers to work.  
**Code review points:** After first build, run `rollup-plugin-visualizer` and verify no peer dependencies appear in the bundle. A missed external entry here adds megabytes to consumers' bundles.  
**QA:** Build succeeds. Output has `dist/index.mjs` and `dist/index.cjs`. `node -e "require('./dist/index.cjs')"` does not throw. `package.json` `exports` field resolves correctly.

---

#### A.3 — Storybook 8 setup (apps/docs)

**Architecture:** Storybook runs inside `apps/docs` — not as a separate package. Stories live in `apps/docs/stories/`. The Storybook builder is Vite (not Webpack) — consistent with the library's build tooling.  
**System design:** N/A — dev/docs tooling.  
**DSA:** N/A.  
**Tokens/DB:** Token CSS files will be imported in `.storybook/preview.ts` global CSS — must be wired after B.5.  
**Best practices:** Install `@storybook/addon-a11y` from day one — it provides in-browser axe auditing per story. Also install `@storybook/addon-interactions` for play function tests.  
**Real-life engineering:** Storybook 8 with Vite builder requires `@storybook/react-vite`. The `preview.ts` must import the token CSS globally — otherwise all stories render unstyled. Don't forget this step.  
**Code review points:** Verify `main.ts` framework is `@storybook/react-vite`, not `@storybook/react-webpack5` (the default in older guides).  
**QA:** `pnpm storybook` starts without errors. Default story renders. No console errors in browser.

---

#### A.4 — ESLint + Prettier + TypeScript strict config

**Architecture:** N/A — tooling only.  
**System design:** N/A.  
**DSA:** N/A.  
**Tokens/DB:** N/A.  
**Best practices:** ESLint config: `@typescript-eslint/recommended-requiring-type-checking`, `jsx-a11y` plugin (catches ARIA mistakes statically), `import` plugin (catches missing exports). Prettier config: shared from root, all packages reference it. Pre-commit hook via `lint-staged` + `husky` runs lint + format on staged files only.  
**Real-life engineering:** `jsx-a11y` catches ~40% of common ARIA mistakes before tests run. Set it up as an error, not a warning — warnings get ignored.  
**Code review points:** Confirm `@typescript-eslint/no-explicit-any` is set to `error`. Confirm `jsx-a11y/aria-props` and `jsx-a11y/role-has-required-aria-props` are enabled.  
**QA:** `pnpm lint` passes on scaffold. `pnpm format --check` passes. TypeScript `strict: true` + `exactOptionalPropertyTypes: true` in all tsconfigs.

---

### Module B — Token Pipeline

---

#### B.1 — tokens.json: primitive and semantic token definitions

**Architecture:** N/A — data file, no runtime logic.  
**System design:** N/A.  
**DSA:** N/A.  
**Tokens/DB:** This is the schema. Establish the two-tier structure (primitives → semantics) per Phase 0 §0.3. Color scale: neutral (50–950), brand (primary, primary-hover, primary-light), status (success, warning, error, info). Semantic aliases cover: background (default, subtle, inverse), text (primary, secondary, disabled, inverse), border (default, strong), interactive (default, hover, active, focus).  
**Best practices:** Use Style Dictionary alias syntax (`{color.primitive.neutral.0}`) for all semantic tokens — never hardcode hex values in semantics. Add a comment block at the top of the JSON explaining the alias structure for future maintainers.  
**Real-life engineering:** The most common mistake: circular aliases. `color.semantic.X → color.semantic.Y → color.semantic.X` causes Style Dictionary to hang. Test resolution at the end of B.2.  
**Code review points:** Verify every semantic token resolves to a primitive (no alias chains > 2 levels). Verify dark mode has an override for every background, text, and border semantic token — a missing dark override means that token renders the same in both modes (silent bug).  
**QA:** Token count documented. JSON validates (run through `JSON.parse`). Every semantic token has a corresponding dark-mode override entry (checked via a simple script that diffs keys).

---

#### B.2 — Style Dictionary config: JSON → CSS custom properties (light mode)

**Architecture:** `sd.config.js` in `packages/tokens/`. Runs as a build script (`pnpm build:tokens`). Output: `dist/tokens.css` with `:root { --color-background-default: #ffffff; ... }`.  
**System design:** Build-time only — no runtime execution.  
**DSA:** N/A.  
**Tokens/DB:** Consumes B.1. Outputs the CSS file consumed by all components and by the docs app.  
**Best practices:** Add a `do-not-edit` comment header to all generated files. Set up a `prebuild` script in `packages/tokens/package.json` that deletes `dist/` before each build — prevents stale generated files.  
**Real-life engineering:** CSS custom property names must be kebab-case and globally unique across the design system. Use a consistent prefix (`--color-`, `--spacing-`, `--radius-`) to prevent collisions with consumer applications' CSS variables.  
**Code review points:** Verify the output CSS property names are readable and match what components will reference. A name mismatch between the generated CSS and a component's `var(--...)` call is a silent runtime styling bug.  
**QA:** `pnpm build:tokens` succeeds. `dist/tokens.css` exists. Open it and spot-check: `--color-background-default` exists with the correct value. No `undefined` or `[object Object]` values in the output.

---

#### B.3 — Dark mode token override file

**Architecture:** Second Style Dictionary output: `dist/tokens.dark.css` with `[data-theme="dark"] { --color-background-default: #0f0f10; ... }`. Only semantic tokens are overridden — primitive token CSS vars are not re-declared.  
**System design:** N/A — static CSS file.  
**DSA:** N/A.  
**Tokens/DB:** Same source as B.2, different Style Dictionary transform: filter to only semantic tokens, output with `[data-theme="dark"]` selector.  
**Best practices:** The `[data-theme="dark"]` attribute is set on the `<html>` or `<body>` element by the consumer — not scoped to a component. This means dark mode is always full-page. Document this constraint in the README.  
**Real-life engineering:** `prefers-color-scheme: dark` media query can be added as a CSS wrapper around the same overrides for automatic OS-level dark mode — add this as a commented block in the generated file as a documented extension point, but don't wire it by default for v1 (per Phase -1 scope decisions).  
**Code review points:** Verify the number of overridden properties in `tokens.dark.css` matches the number of semantic tokens. A lower count means some semantics have no dark override.  
**QA:** Set `data-theme="dark"` on `<body>` in browser devtools. Verify background, text, and border colors change correctly. Verify no component uses a hardcoded color that ignores the override.

---

#### B.4 — TypeScript token constants generation

**Architecture:** Third Style Dictionary output: `dist/tokens.ts` — exports typed string constants for every token. Components import from this file to get type-safe token references.  
**System design:** N/A — generated TypeScript file.  
**DSA:** N/A.  
**Tokens/DB:** Same source as B.2, different output format: TypeScript `as const` object.  
**Best practices:** The generated file exports two things: (1) the `tokens` object with nested structure matching the token JSON, (2) TypeScript union types (`ColorToken`, `SpacingToken`) derived from the `tokens` object values. Components use the union types to restrict prop values to valid tokens only.  
**Real-life engineering:** If a token is renamed in B.1 and B.4 is regenerated, every component that imported the old constant gets a TypeScript compile error. This is the intended behavior — it makes token renames a compile-time error instead of a silent runtime mismatch. Do not suppress these errors during a rename; fix them.  
**Code review points:** Verify the `ColorToken` union type contains all color token values and no extras. Verify `tokens.ts` is listed in `packages/tokens/package.json` exports.  
**QA:** Import `ColorToken` in `packages/core` — TypeScript resolves it correctly. Attempt to use an arbitrary hex string where `ColorToken` is expected — TypeScript should produce a type error.

---

#### B.5 — Storybook global CSS integration + dark mode toggle

**Architecture:** Wires the token CSS into Storybook. `.storybook/preview.ts` imports `tokens.css` and `tokens.dark.css`. A Storybook global toolbar button toggles `data-theme="dark"` on the preview `<body>`.  
**System design:** N/A — Storybook configuration.  
**DSA:** N/A.  
**Tokens/DB:** Depends on B.3 and B.4 outputs existing.  
**Best practices:** Use the Storybook `globals` and `decorators` API to manage the dark mode toggle — not a custom `document.body.setAttribute` in a story. This keeps it composable with the Chromatic visual regression CI (which can capture both light and dark story variants).  
**Real-life engineering:** The ThemeBuilder AI tool (G.6) will need to inject CSS variable overrides into the Storybook preview iframe for live preview. The channel for this is `@storybook/channels` `postMessage` API. Wire a stub listener now so G.6 can use it later.  
**Code review points:** Verify the dark mode toggle in Storybook actually changes component appearance (not just sets an attribute that nothing reads). Open any Tier 1 story in dark mode and confirm colors change.  
**QA:** Light mode stories render with correct token colors. Toggling dark mode changes backgrounds and text colors. No console errors about missing CSS custom properties.

---

### Module C — Utility Layer

---

#### C.1 — cn() utility (clsx + tailwind-merge)

**Architecture:** Single utility function. No class or complex logic.  
**System design:** N/A.  
**DSA:** N/A — string merging.  
**Tokens/DB:** N/A.  
**Best practices:** Export from `packages/core/src/utils/cn.ts`. Re-export in the public barrel (`index.ts`) so consumers can use the same utility for extending component classes. Keep it under 5 lines.  
**Real-life engineering:** `tailwind-merge` is required (not just `clsx`) because Tailwind generates atomic utility classes — `clsx("p-2", "p-4")` produces both classes in the output, and the browser applies the one that appears last in the Tailwind stylesheet (non-obvious). `tailwind-merge` resolves conflicts deterministically, keeping only `p-4`.  
**Code review points:** Verify the function signature accepts `...inputs: ClassValue[]` (clsx's type) — not `string[]`, which would reject conditional expressions.  
**QA:** `cn("p-2", "p-4")` returns `"p-4"`. `cn("p-2", condition && "p-4")` returns `"p-2"` when condition is false. `cn(undefined, "text-sm")` returns `"text-sm"`.

---

#### C.2 — polymorphic.ts: PolymorphicComponentProp types

**Architecture:** Three exported TypeScript types (per PRD §6): `PolymorphicRef`, `PolymorphicComponentProp`, `PolymorphicComponentPropWithRef`. Used by Button, Text/Heading, and any other polymorphic component.  
**System design:** N/A — types only, no runtime code.  
**DSA:** N/A.  
**Tokens/DB:** N/A.  
**Best practices:** This file has no runtime exports — it's types-only. Add a `// @ts-nocheck` block? No — this file should pass strict TypeScript. The types are complex but correct. Add a JSDoc comment explaining the purpose and usage with an example.  
**Real-life engineering:** The `forwardRef` + generic component interaction is the hardest TypeScript problem in the library. The canonical implementation uses `forwardRef` with an explicit cast (`as ButtonComponent`) because TypeScript cannot infer generic types through `forwardRef` by default. Document this cast with a comment explaining why it's safe.  
**Code review points:** Verify that `<Button as="a">` without `href` produces a TypeScript error (since `href` is required on `<a>`). Verify that `<Button as="a" href="/path">` is error-free. If both compile, the polymorphic types are not working correctly.  
**QA:** TypeScript type tests (using `@ts-expect-error` assertions in a `.test-d.ts` file): (1) `<Button>` — no error. (2) `<Button as="a">` — error (missing href). (3) `<Button as="a" href="/path">` — no error. (4) `<Button href="/path">` — error (button doesn't have href).

---

#### C.3 — getFocusableElements() + focus utility helpers

**Architecture:** Two utility functions exported from `packages/core/src/utils/focus.ts`: `getFocusableElements(container: HTMLElement): HTMLElement[]` and `isElementFocusable(el: HTMLElement): boolean`.  
**System design:** N/A.  
**DSA:** DOM traversal — `querySelectorAll` with a selector covering all tabbable elements (a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])). Filter for visible, not disabled.  
**Tokens/DB:** N/A.  
**Best practices:** The focusable selector must handle: `tabindex="-1"` (excluded), `tabindex="0"` (included), elements inside `display:none` or `visibility:hidden` ancestors (excluded), `disabled` attribute (excluded), `hidden` attribute (excluded). Missing any of these causes focus trap bugs in Dialog.  
**Real-life engineering:** `querySelectorAll` returns elements in DOM order, which is the correct tab order — don't sort. But be aware that elements with `tabindex > 0` break this (they appear first in tab order but not in DOM order). For v1, document that `tabindex > 1` is unsupported inside trapped containers, per WCAG best practice anyway.  
**Code review points:** Test with a Dialog containing a `<video controls>` — the video player controls are focusable but not returned by the basic selector. Add `video` and `audio` with controls to the selector.  
**QA:** `getFocusableElements(container)` returns: buttons, inputs, links. Does NOT return: `disabled` buttons, `display:none` elements, elements with `tabindex="-1"`.

---

### Module D — Tier 1: Foundation Components

---

#### D.1 — VisuallyHidden component

**Architecture:** Renders a `<span>` with CSS that hides it visually but keeps it in the accessibility tree. A single CSS class applied via `cn()`.  
**System design:** N/A — trivially simple.  
**DSA:** N/A.  
**Tokens/DB:** N/A — no token usage (the hiding CSS is hard-coded behavior, not themed).  
**Best practices:** Use the canonical visually-hidden CSS: `position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border-width: 0`. Do NOT use `display: none` or `visibility: hidden` — these remove content from the accessibility tree.  
**Real-life engineering:** N/A — genuinely simple.  
**Code review points:** Verify the component passes `...rest` to the underlying `<span>` so consumers can add `aria-*` props.  
**QA:** Rendered element is not visible. Screen reader (VoiceOver) announces the text. `axe-core` produces zero violations.

---

#### D.2 — Portal component

**Architecture:** Uses `ReactDOM.createPortal` to render children into `document.body` (or a configurable container). Mounts/unmounts cleanly.  
**System design:** Required by Dialog, Tooltip, Popover — any component that must escape `overflow: hidden` ancestors.  
**DSA:** N/A.  
**Tokens/DB:** N/A.  
**Best practices:** The Portal must guard against SSR — `document` is not available in Next.js server render. Use `typeof document !== 'undefined'` guard or a `useEffect`-based mount that defers portal creation to the client.  
**Real-life engineering:** A common bug: rendering a portal in Storybook causes React warnings because Storybook's story container may not have `document.body` ready at first render. The `useEffect` + `useState(false)` mount guard pattern fixes this.  
**Code review points:** Verify the component handles unmounting cleanly — no leaked DOM nodes after the portal's parent component unmounts.  
**QA:** Renders children outside the nearest ancestor. Works in Storybook. No SSR crash in Next.js docs app.

---

#### D.3 — Text / Heading component (polymorphic)

**Architecture:** Uses `C.2` polymorphic types. Default element: `<p>` for Text, `<h2>` for Heading. `as` prop overrides. `variant` prop controls typography token application.  
**System design:** N/A.  
**DSA:** N/A.  
**Tokens/DB:** Uses `B.4` token constants for `fontSize`, `fontWeight`, `lineHeight` tokens. Variants map to token combinations: `body` → `fontSize.base + lineHeight.normal + fontWeight.normal`, `heading` → `fontSize.xl + lineHeight.tight + fontWeight.semibold`, etc.  
**Best practices:** The `as` prop for Text should not be constrained to only block elements — consumers may need `<Text as="span">` for inline text. Heading should accept `h1`–`h6` only, and the `level` (visual size) should be decoupled from the semantic element (e.g. `<Heading as="h3" variant="h1">` renders an h3 that looks like an h1).  
**Real-life engineering:** The visual level / semantic level decoupling is a real WCAG requirement — heading hierarchy in the DOM must be correct (no skipping h2 → h4), but visual size is a design decision. Build this decoupling in from the start.  
**Code review points:** Verify TypeScript narrows correctly — `<Text as="a">` should accept `href`, `<Text as="button">` should accept `onClick`. Run the type tests from C.2.  
**QA:** Renders correct HTML element. `axe-core` zero violations. Heading level hierarchy test: h1 → h2 → h3 in sequence produces no axe violations; h1 → h3 (skip) produces a violation.

---

#### D.4 — Label component

**Architecture:** Wraps `<label>`. The compound component context pattern is used when Label + Input are composed together — Label registers its `htmlFor` in a context so Input can auto-associate via `aria-labelledby` when explicit `htmlFor` is not provided.  
**System design:** N/A — but the compound context pattern is a new pattern not covered in Phase 0. Note: this pattern will be reused by FormField (a potential future wrapper component).  
**DSA:** N/A.  
**Tokens/DB:** Typography tokens for label size and weight.  
**Best practices:** Always prefer `<label htmlFor="input-id">` (explicit association) over `aria-labelledby`. The compound context is a fallback for the wrapping composition pattern. Document both usage patterns in the story.  
**Real-life engineering:** IDs in React must be stable across renders. Use `React.useId()` (React 18+) for auto-generated IDs — never `Math.random()` which breaks SSR hydration.  
**Code review points:** Verify the Label renders as a `<label>` element (not a `<div>` or `<span>`) — `axe-core` will catch this, but verify manually too.  
**QA:** `<Label htmlFor="my-input">` + `<input id="my-input">` — clicking Label focuses the Input. `axe-core` zero violations.

---

#### D.5 — Button (polymorphic, variants, isLoading, forwardRef)

**Architecture:** Uses C.2 polymorphic types. Variants via `cva` (class-variance-authority): `variant` (primary, secondary, ghost) × `size` (sm, md, lg). `isLoading` disables the button and sets `aria-busy`. `leftIcon` renders an icon inside the button.  
**System design:** N/A.  
**DSA:** N/A.  
**Tokens/DB:** All colors via CSS custom properties (token-driven). No hardcoded hex values.  
**Best practices:** When `isLoading` is true: set `aria-busy="true"`, set `disabled` attribute, render a spinner (via VisuallyHidden text "Loading..." for screen readers). The visible spinner is decorative (`aria-hidden="true"`).  
**Real-life engineering:** `<button type="button">` must be the default type — not `type="submit"`. A Button inside a `<form>` without explicit `type` defaults to `submit` and will submit the form unexpectedly. Always default to `type="button"`.  
**Code review points:** (1) Polymorphic types correct (see C.2 QA). (2) `type="button"` default. (3) `isLoading` disables interaction. (4) `leftIcon` is `aria-hidden`. (5) Focus ring visible in all variants.  
**QA:** Renders as `<button>`. Renders as `<a>` with `href` when `as="a"`. `aria-busy` set when loading. Keyboard: Enter and Space trigger onClick. axe-core zero violations. Bundle size: Button alone < 3KB gzip (verified by H.3).

---

#### D.6 — Input (discriminated union, full accessibility attributes)

**Architecture:** Discriminated union TypeScript: `type="text"` variant vs `type="number"` variant — each has different valid props (e.g. `min`/`max`/`step` only on number). `aria-labelledby`, `aria-describedby`, `aria-invalid`, `aria-required` all supported.  
**System design:** N/A.  
**DSA:** N/A.  
**Tokens/DB:** Border, text, background tokens. Error state uses status token (`--color-status-error`).  
**Best practices:** Input should never manage its own label — always pair with Label (D.4). The `id` prop is required (or auto-generated via `useId`) to enable `<label htmlFor>` association. An Input without an accessible label is an axe violation.  
**Real-life engineering:** `aria-invalid="true"` is only valid on form elements in an invalid state — do not set it to `false` explicitly (omit the attribute entirely when valid, per the spec). Setting `aria-invalid="false"` is valid but redundant; `aria-invalid` with no value defaults to `false`.  
**Code review points:** Error message element must be linked via `aria-describedby` on the input. Verify ID matches. Error message should not be in a `role="alert"` unless it appears dynamically after submission (live region considerations).  
**QA:** Type-safe discriminated union: `<Input type="number" min={0} />` — no TS error. `<Input type="text" min={0} />` — TS error. axe-core zero violations with label. axe-core violation without label (confirm the violation is caught, not silenced).

---

#### D.7 — Icon system (lazy-load, dynamic import, Suspense)

**Architecture:** Dynamic imports per icon via `React.lazy`. `Icon` component wraps in `Suspense` with a sized placeholder fallback. `IconName` union type is generated from the icon map keys.  
**System design:** Zero bytes in initial bundle for icons — each SVG loaded on first render, cached by browser HTTP cache thereafter.  
**DSA:** N/A — the icon lookup is a dictionary access O(1).  
**Tokens/DB:** Icon size uses spacing tokens if standardized (e.g. `size="sm"` → 16px, `size="md"` → 20px, `size="lg"` → 24px).  
**Best practices:** Decorative icons: `aria-hidden="true"`. Semantic icons (used without adjacent text): require `aria-label` on the Icon or its parent. The `Icon` component should accept both patterns with TypeScript enforcing: if `aria-hidden` is not set, `aria-label` becomes required.  
**Real-life engineering:** The Suspense fallback must be a sized placeholder (same dimensions as the icon) — a zero-size fallback causes layout shift when the icon loads. Use `display: inline-block; width: {size}px; height: {size}px`.  
**Code review points:** Verify the Suspense boundary is at the Icon component level, not at the page level. A page-level Suspense boundary would show a full-page loading state while a single icon loads.  
**QA:** First render: network request for the icon SVG. Second render: no network request (cached). `aria-hidden="true"` on decorative icons. Missing `aria-label` on semantic icon without text: TypeScript error.

---

#### D.8 — axe-core test setup + zero-violation CI for Tier 1

**Architecture:** Not a component — a test infrastructure task. Sets up `jest-axe` in Vitest, adds `toHaveNoViolations` matcher to all test files via a global setup file, writes axe tests for every Tier 1 component.  
**System design:** CI gate — all axe tests run in H.1's GitHub Actions workflow.  
**DSA:** N/A.  
**Tokens/DB:** N/A.  
**Best practices:** The axe test for each component should test the component in its most common rendered state AND its error state (if applicable). An axe test on only the happy path misses ARIA issues that appear in error states.  
**Real-life engineering:** `jest-axe` requires the component to be rendered into a real DOM (via `@testing-library/react`'s `render`). It cannot test virtual DOM or snapshot output. Run `checkA11y` after interactions (e.g. after typing into an input) not just on initial render.  
**Code review points:** Verify every Tier 1 component has an axe test. Verify the test fails if you manually add `role="button"` to a `<div>` (a common mistake) — axe should catch missing keyboard interaction.  
**QA:** `pnpm test` runs all axe tests and passes. Intentional violation (e.g. remove `htmlFor` from Label test) causes test failure. CI workflow (H.1) runs these tests and blocks merge on failure.

---

### Module E — Tier 2: Interactive Components

---

#### E.1 — useFocusTrap hook

**Architecture:** Custom hook. Per C.3's `getFocusableElements` utility. Activates/deactivates based on `isActive: boolean`. Returns nothing — purely a side effect.  
**System design:** See Phase 0 §0.2. Focus trap is a UI behavior, not a data flow concern.  
**DSA:** N/A — DOM list traversal.  
**Tokens/DB:** N/A.  
**Best practices:** The hook must save and restore the previously-focused element. Store it in a `useRef` at the moment `isActive` becomes true — not at mount time (the trigger element may not yet be focused at mount).  
**Real-life engineering:** The cleanup function (returned from `useEffect`) must remove the keydown listener AND restore focus AND restore scroll lock. Missing any of these causes: (a) keydown handler staying active after dialog closes, (b) focus lost in document, (c) page locked in scrolled position. All three are WCAG failures.  
**Code review points:** Verify the keydown listener is removed in cleanup. Verify focus is restored even if the dialog closes via a prop change (not just via the Escape key). Verify the hook handles the case where `focusable` is empty (nothing to trap within — just prevent Tab, don't throw).  
**QA:** Focus moves to first focusable element on activation. Tab wraps from last to first. Shift+Tab wraps from first to last. Deactivation restores focus to the previously-focused element. Works when no focusable elements are in the container.

---

#### E.2 — useScrollLock hook

**Architecture:** Custom hook. Sets `document.body` to `position: fixed` with a saved `scrollY` offset. Restores on cleanup.  
**System design:** N/A — pure DOM side effect.  
**DSA:** N/A.  
**Tokens/DB:** N/A.  
**Best practices:** The `position: fixed` approach works cross-browser. The scroll position must be saved before locking and restored on unlock — otherwise the page jumps to the top when the lock is removed.  
**Real-life engineering:** When `position: fixed` is applied, the browser removes the element from flow and the page appears to scroll to top. Compensate with `top: -${scrollY}px`. On unlock, remove both `position: fixed` and `top`, then call `window.scrollTo(0, scrollY)`.  
**Code review points:** Test with a long page, open a Dialog from a scrolled position, close it — the page must return to the same scroll position.  
**QA:** Page does not jump on Dialog open. Scroll position is restored on Dialog close. Multiple nested scroll-locked modals restore correctly (using a counter, not a boolean).

---

#### E.3 — Dialog / Modal (focus trap + scroll lock + portal + ARIA)

**Architecture:** Compound component: `Dialog`, `Dialog.Trigger`, `Dialog.Content`, `Dialog.Title`, `Dialog.Close`. Uses Portal (D.2), useFocusTrap (E.1), useScrollLock (E.2). ARIA: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` linking to `Dialog.Title`.  
**System design:** The compound component pattern shares state via React context. `Dialog` is the context provider. `Dialog.Trigger` toggles `isOpen`. `Dialog.Content` renders conditionally via Portal when `isOpen`.  
**DSA:** N/A.  
**Tokens/DB:** Background overlay color, dialog background, shadow — all token-driven.  
**Best practices:** `Escape` key must close the dialog and is handled in `Dialog.Content`'s keydown handler (not in useFocusTrap). `aria-modal="true"` tells screen readers to ignore content outside the dialog — this requires the dialog to be in a portal (rendered at body level), otherwise screen readers can still navigate behind it.  
**Real-life engineering:** The NVDA + Chrome test is mandatory for this component before marking it done. VoiceOver + Safari announces `role="dialog"` + `aria-labelledby` correctly but NVDA + Chrome has known quirks with `aria-modal` in older versions. Test both.  
**Code review points:** (1) Focus trap active when open. (2) Scroll locked when open. (3) Escape closes. (4) Focus returns to trigger on close. (5) `aria-labelledby` matches `Dialog.Title` id. (6) Click on overlay closes (confirm this is the intended behavior — document it either way).  
**QA:** All E.1 focus trap QA applies. Playwright test: `Dialog.spec.ts` from PRD §13. axe-core zero violations in open and closed state. NVDA manual test: dialog role announced, first interactive element receives focus, Escape closes.

---

#### E.4 — Checkbox / Switch (tri-state, aria-checked)

**Architecture:** Radix UI `Checkbox` primitive for behavior, styled with tokens. Tri-state: `checked` prop is `boolean | 'indeterminate'`. TypeScript type reflects tri-state: `CheckedState = boolean | 'indeterminate'`.  
**System design:** N/A.  
**DSA:** N/A.  
**Tokens/DB:** Check color, border, background tokens. Indeterminate state uses a separate visual indicator (dash, not check).  
**Best practices:** `aria-checked="mixed"` for indeterminate state (not `aria-checked="false"`). The indeterminate state is only communicable via `aria-checked="mixed"` — CSS alone does not convey it to screen readers.  
**Real-life engineering:** Controlled vs uncontrolled: if `checked` prop is undefined, the component manages its own state. If provided, it's fully controlled and `onCheckedChange` must update it externally. Document both patterns in the story.  
**Code review points:** Verify `aria-checked` values: `true`, `false`, `mixed` — not `true`, `false`, `undefined`.  
**QA:** axe-core zero violations. Keyboard: Space toggles state. Indeterminate: `aria-checked="mixed"` confirmed in DOM. Controlled: state does not change without `onCheckedChange` handler updating the prop.

---

#### E.5 — Tabs (tablist/tab/tabpanel, arrow key navigation)

**Architecture:** Radix UI `Tabs` primitive styled with tokens. Compound: `Tabs`, `Tabs.List`, `Tabs.Trigger`, `Tabs.Content`. Arrow key navigation is handled by Radix — verify it matches WAI-ARIA tabs pattern (Left/Right arrows move between tabs, Tab key moves to tabpanel content).  
**System design:** Controlled + uncontrolled (Radix handles both via `value` / `defaultValue`).  
**DSA:** N/A.  
**Tokens/DB:** Active tab indicator, text color, border tokens.  
**Best practices:** The active tab indicator (underline or background) must have 3:1 contrast ratio with its adjacent non-active state (WCAG 1.4.11, non-text contrast). This is easy to miss — test with the Colour Contrast Analyser.  
**Real-life engineering:** Screen readers announce `role="tab"` with `aria-selected` state. Verify "selected" vs "not selected" is announced — Radix handles this, but confirm in NVDA.  
**Code review points:** Verify `aria-controls` on each Tab matches the id of its corresponding `TabPanel`. Radix manages this automatically — verify it's not broken by custom id props.  
**QA:** axe-core zero violations. Arrow key navigation works. Tab key moves focus into the active panel. `aria-selected` correct on active tab.

---

#### E.6 — Accordion (aria-expanded, aria-controls, compound context)

**Architecture:** Radix UI `Accordion` primitive. Compound: `Accordion`, `Accordion.Item`, `Accordion.Trigger`, `Accordion.Content`. `type` prop: `"single"` (one open at a time) or `"multiple"` (many open).  
**System design:** N/A.  
**DSA:** N/A.  
**Tokens/DB:** Trigger background, border, content background tokens.  
**Best practices:** `Accordion.Trigger` renders as a `<button>` inside an `<h3>` (or configurable heading level). Do NOT render `<button>` outside of a heading for accordion headers — this violates heading structure and is an axe violation.  
**Real-life engineering:** Animation on content expand/collapse must be suppressed via `@media (prefers-reduced-motion: reduce)`. Radix provides a `data-state="open|closed"` attribute that can drive CSS transitions.  
**Code review points:** Heading element wrapping the trigger button must be present and at the correct level in the page heading hierarchy.  
**QA:** axe-core zero violations. `aria-expanded` toggles correctly. Content is hidden/shown. Animation suppressed in reduced-motion mode.

---

#### E.7 — Select / Combobox (Radix, keyboard nav, virtualized options)

**Architecture:** Radix UI `Select` for the simple Select case. Custom Combobox using Radix `Combobox` primitives for the filterable case. Option list uses `VirtualList` (F.1) when option count > 50.  
**System design:** Keyboard navigation: Arrow Up/Down to navigate options, Enter to select, Escape to close, Type-ahead to jump to option. All handled by Radix for Select; Combobox keyboard nav requires custom implementation layered on Radix.  
**DSA:** N/A for Select. Combobox: simple string filter (`option.label.toLowerCase().includes(query)`) for v1 — no fuzzy search here (fuzzy search is in CommandPalette via F.2's trigram algorithm).  
**Tokens/DB:** Trigger styles, dropdown background, option hover/selected state tokens.  
**Best practices:** The Combobox's input must have `role="combobox"`, `aria-expanded`, `aria-autocomplete="list"`, and `aria-controls` pointing to the listbox. Radix's Combobox primitive manages this — verify the output ARIA is correct in the DOM.  
**Real-life engineering:** Screen reader announcement of the number of available options (`"N options available"`) should be communicated via a live region that updates when the filter changes. This is a common omission that makes filterable selects nearly unusable for screen reader users.  
**Code review points:** Live region for option count. Keyboard navigation works without a mouse. Options longer than the dropdown width are truncated but fully announced by screen readers (use title attribute or clipping CSS that doesn't clip the accessibility tree).  
**QA:** axe-core zero violations. Playwright test: keyboard-only selection of an option. Live region announces option count after filtering. NVDA: option role and selected state announced.

---

#### E.8 — Popover (aria-haspopup, click-outside, portal awareness)

**Architecture:** Radix UI `Popover` primitive for positioning and open/close behavior. Renders into Portal (D.2) to escape overflow clipping. Floating positioning: Radix's built-in positioning (based on Floating UI) handles placement and collision avoidance.  
**System design:** Click-outside detection via Radix's `onInteractOutside` callback. Portal awareness is automatic since Radix renders its content into a portal by default.  
**DSA:** N/A.  
**Tokens/DB:** Popover background, border, shadow tokens.  
**Best practices:** `aria-haspopup="dialog"` on the trigger if the popover contains interactive content, `aria-haspopup="listbox"` if it contains a list. Do not use `aria-haspopup="true"` (deprecated).  
**Real-life engineering:** The Popover must close on Escape. Radix handles this — verify it doesn't conflict with any parent Dialog's Escape handler (nested Escape handling requires `stopPropagation`).  
**Code review points:** Focus management: when Popover opens, focus should move to the first interactive element inside. When it closes, focus should return to the trigger.  
**QA:** axe-core zero violations. Click outside closes the Popover. Escape closes the Popover. Focus management correct.

---

### Module F — Tier 3: Complex Components

---

#### F.1 — VirtualList (fixed-height, binary search, ResizeObserver)

**Architecture:** A pure React component — no Radix dependency. Renders only the visible slice of a large list, plus an overscan buffer (typically 3 items above/below). Uses a prefix-sum array for O(log n) visible range calculation.  
**System design:** The container has a fixed height with `overflow-y: auto`. A spacer div with height equal to `totalItems * itemHeight` creates the correct scrollbar. Only visible items are rendered into the DOM.  
**DSA:** Binary search on the cumulative height prefix-sum array. O(log n) per scroll event to find the start and end index of the visible range. Without binary search: O(n) per scroll — noticeable lag at 10k+ items. With binary search: O(log n) — imperceptible even at 1M items.  
**Tokens/DB:** N/A — VirtualList is layout-only; consumers style their item content.  
**Best practices:** Overscan buffer (3–5 items beyond visible range) prevents flickering when scrolling fast. The overscan items are rendered but hidden below the fold, so they're ready before the user scrolls to them.  
**Real-life engineering:** `ResizeObserver` on the container detects when the container's height changes (e.g. browser resize, panel resize). On resize, recalculate the visible range. Without this, a window resize leaves the wrong number of items rendered.  
**Code review points:** The spacer div's height must be exactly `totalItems * itemHeight`. If this is wrong by even 1px, the scrollbar will be the wrong size and cause a visual glitch.  
**QA:** Renders 10,000 items with < 100 DOM nodes. Scroll performance: no jank at 60fps. Binary search test: `getStartIndex(scrollTop)` returns correct index at various scroll positions. ResizeObserver: shrinking the container recalculates visible items.

---

#### F.2 — CommandPalette (fuzzy search, grouped options, keyboard nav)

**Architecture:** Composed from E.7's Combobox pattern + F.1's VirtualList for the option list. Opens via a global keyboard shortcut (Cmd+K / Ctrl+K). Uses trigram fuzzy search (PRD §9.2) instead of simple contains-filter.  
**System design:** Keyboard shortcut registration via a global `keydown` listener on `document`. The CommandPalette renders via Portal (D.2). When open, a focus trap (E.1) keeps focus within the palette.  
**DSA:** Trigram fuzzy search — O(n) build of trigram sets per option, O(n log n) sort by similarity score. Threshold: similarity > 0.2 to appear in results. Sorting by descending score puts best matches first. Pre-build trigram sets for all options at mount time, not on every keystroke.  
**Tokens/DB:** N/A — uses existing Combobox tokens.  
**Best practices:** The input must have `role="combobox"`, `aria-expanded`, and `aria-controls`. Results list must be `role="listbox"` with `role="option"` items. Grouped options use `role="group"` with `aria-label`.  
**Real-life engineering:** Pre-computing trigram sets for all options at mount (not on keystroke) is essential for performance. For 500 options, computing trigrams on every keystroke adds ~5–10ms per keystroke — noticeable. Pre-computed and stored in a `useMemo`, the per-keystroke cost is just the similarity comparison, which is fast.  
**Code review points:** Verify the global shortcut listener does not fire when focus is inside an `<input>` or `<textarea>` (user is typing). Check `e.target` before acting on the shortcut.  
**QA:** Trigram similarity test: `trigramSimilarity("button", "buton")` returns > 0.5. Results sorted by score (best match first). Keyboard: arrow keys navigate options, Enter selects, Escape closes, focus returns to trigger.

---

#### F.3 — DataGrid (ARIA grid, row selection, column sort)

**Architecture:** Custom implementation using F.1 VirtualList for row virtualization. ARIA: `role="grid"`, `role="row"`, `role="columnheader"`, `role="gridcell"`. Row selection via `aria-selected`. Column sort via `aria-sort` on column headers.  
**System design:** Sort state lives in the DataGrid component (controlled or uncontrolled). Sorting is purely client-side for v1 — no server-side sort pagination.  
**DSA:** Array sort is O(n log n). For large datasets (10k+ rows), sort runs on the full dataset and results are cached in `useMemo` — sort only re-runs when the data or sort column changes.  
**Tokens/DB:** Header background, row hover, selected row highlight, border tokens.  
**Best practices:** Keyboard navigation in a grid follows the ARIA grid pattern: Arrow keys navigate cells (not Tab). Tab moves focus out of the grid entirely. This is different from a table — document it clearly.  
**Real-life engineering:** Virtualized grids with variable column widths require each row to render inside the same fixed-width container. Use CSS `display: grid` with `grid-template-columns` matching the column widths. This ensures column alignment across all virtualized rows.  
**Code review points:** `aria-sort` must be set on the sorted column header (`ascending` or `descending`). Unsorted columns must have `aria-sort="none"` (not omitted — omitting means "not sortable", which is incorrect).  
**QA:** axe-core zero violations. Row selection toggles `aria-selected`. Column sort updates `aria-sort`. Keyboard navigation: Arrow keys navigate cells. 10,000 rows render with < 200 DOM nodes via VirtualList.

---

### Module G — AI Developer Tools

---

#### G.1 — Anthropic API proxy: generate-component route

**Architecture:** Next.js API route at `POST /api/ai/generate-component`. Accepts `{ prompt: string }`. Validates with Zod. Calls Anthropic SDK with streaming. Returns SSE stream.  
**System design:** System prompt embeds the full component API (Button, Input, Dialog props + variants) so the LLM generates library-accurate JSX. Streaming via `ReadableStream` converted to SSE events. The route is the single point for API key management and rate limiting.  
**DSA:** N/A.  
**Tokens/DB:** N/A.  
**Best practices:** Zod validation rejects empty prompts and prompts > 500 characters. Rate limiting: in-memory `Map<ip, {count, resetAt}>` for demo — note in README this is not production-grade. If `ANTHROPIC_API_KEY` is missing, return 503 with `{ error: "AI tools unavailable", code: "MISSING_KEY" }`.  
**Real-life engineering:** SSE (Server-Sent Events) over Next.js API routes requires the response headers `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`. Without these, the browser buffers the response and the streaming UX doesn't work.  
**Code review points:** Verify the route does not log the user's prompt (privacy). Verify the Anthropic API key is accessed via `process.env` (server-only) and never appears in client-side code or Next.js `publicRuntimeConfig`.  
**QA:** POST with a valid prompt returns a streaming SSE response. POST with missing prompt returns 400. POST without API key returns 503. Rate limit exceeded returns 429.

---

#### G.2 — G.3 — Accessibility Checker + Theme Builder proxy routes

**Architecture:** Same pattern as G.1. Reuse the SSE streaming helper function. Differ only in: (a) system prompt content, (b) input validation schema.  
**System design:** Accessibility Checker system prompt: curated list of WCAG 2.1 AA criteria (all 50 Level AA success criteria, condensed) + instruction to cite criterion number + provide code fix. Theme Builder system prompt: token structure schema + instruction to output valid Style Dictionary JSON patch.  
**DSA:** N/A.  
**Tokens/DB:** N/A.  
**Best practices:** Extract the SSE streaming logic into a shared `streamAnthropicResponse(systemPrompt, userPrompt, res)` helper. G.1, G.2, G.3 all call it — no duplication.  
**Real-life engineering:** The Theme Builder output is JSON — but LLMs sometimes wrap JSON in markdown code fences (```json ... ```). Strip these in the response handler before the client attempts to `JSON.parse`.  
**Code review points:** Verify the accessibility checker system prompt actually includes the WCAG criteria list and does not rely on the model's training data alone.  
**QA:** Accessibility Checker: input describing a focus management issue returns a response citing a WCAG criterion. Theme Builder: input describing a color palette returns valid JSON that passes `JSON.parse`. Code fence stripping: response with ` ```json {...}``` ` is correctly parsed.

---

#### G.4 — ComponentGenerator UI

**Architecture:** React component in `apps/docs/ai-tools/ComponentGenerator.tsx`. `<textarea>` input, Submit button, streaming output display. Uses `EventSource` (SSE) to receive the streaming response. Babel parser validation on the complete response before rendering as a code block.  
**System design:** Streaming UX: display tokens as they arrive (character by character). On stream complete, run Babel parse. If parse succeeds, show formatted code. If parse fails, show the raw text with an error banner.  
**DSA:** N/A.  
**Tokens/DB:** N/A.  
**Best practices:** Use `EventSource` for SSE reading, not `fetch` with a reader (though both work). `EventSource` handles reconnect automatically, which is useful for long-running generations.  
**Real-life engineering:** The Babel parser (`@babel/parser`) is a large dependency (~500KB). Import it dynamically (`import('@babel/parser')`) so it doesn't bloat the initial Storybook bundle. Parse only on stream completion, not on every token.  
**Code review points:** Verify the generated JSX is displayed in a `<pre><code>` block with syntax highlighting (Prism.js or similar). Verify the error state is clearly distinguishable from the success state.  
**QA:** Valid prompt: streams output, final result is valid JSX, rendered in code block. Invalid JSX output: error banner appears with "Generated code could not be validated." Copy button copies the output to clipboard.

---

#### G.5 — AccessibilityChecker UI + G.6 — ThemeBuilder UI

**Architecture:** Same pattern as G.4. ThemeBuilder additionally applies the returned JSON as CSS variable overrides to the Storybook preview iframe via `@storybook/channels` `postMessage` API.  
**System design:** ThemeBuilder live preview: the `apps/docs` app and the Storybook preview iframe share a Storybook channel. The ThemeBuilder UI posts a `THEME_UPDATE` event with the CSS variable overrides. A decorator in `.storybook/preview.ts` listens for this event and applies the CSS variables to the document root.  
**DSA:** N/A.  
**Tokens/DB:** ThemeBuilder outputs a subset of the token schema — only the tokens being overridden, not the full schema.  
**Best practices:** Contrast ratio validation: after generating a theme, check all foreground/background token combinations for WCAG 4.5:1 (normal text) and 3:1 (large text/UI). Flag violations with a warning in the UI. Use the `wcag-contrast` npm package for the calculation.  
**Real-life engineering:** The Storybook channel `postMessage` approach works only when both the outer page and the Storybook iframe are on the same origin (which they are in local dev and Chromatic). Document this constraint.  
**Code review points:** Verify that theme changes are ephemeral (session only) — the tokens.json is not modified. Verify a "Reset to default theme" button exists.  
**QA:** Accessibility Checker: describe a focus management issue → response cites a WCAG criterion. ThemeBuilder: input describing a blue teal theme → valid JSON generated → CSS variables update in Storybook preview → component colors change.

---

### Module H — CI/CD & Release Pipeline

---

#### H.1 — GitHub Actions CI workflow

**Architecture:** `.github/workflows/ci.yml`. Jobs: lint, typecheck, test (Vitest + jest-axe), playwright, chromatic, bundle-analysis. Jobs run in parallel where possible (lint + typecheck together; test after; playwright + chromatic after test).  
**System design:** CI is the mechanical enforcement of Phase 0 conventions. Every convention has a CI gate — no exceptions.  
**DSA:** N/A.  
**Tokens/DB:** N/A.  
**Best practices:** Cache `node_modules` and `pnpm store` between runs using GitHub Actions cache keyed on `pnpm-lock.yaml` hash. Without caching, every CI run reinstalls all packages (~2 min overhead).  
**Real-life engineering:** Chromatic requires a `CHROMATIC_PROJECT_TOKEN` secret in the GitHub repo. The first Chromatic run establishes the visual baseline — subsequent runs diff against it. On the first run, approve all baselines manually.  
**Code review points:** Verify the `bundle-analysis` job actually fails if the bundle exceeds 80KB gzip — not just reports the size.  
**QA:** Push a commit that violates a lint rule — CI fails at the lint step. Push a commit that breaks a test — CI fails at the test step. Push a commit that increases bundle size over 80KB — CI fails at bundle-analysis.

---

#### H.2–H.5 — Chromatic, Bundle Analysis, Changesets, npm publish

**Architecture:** These are configuration tasks, not code tasks.  
**System design:** Release flow: developer adds a changeset (`pnpm changeset`) → PR merges to `main` → GitHub Actions runs `changeset version` (bumps `package.json`, generates CHANGELOG) → `changeset publish` → npm publish → GitHub Release created.  
**DSA:** N/A.  
**Tokens/DB:** N/A.  
**Best practices:** The `release.yml` workflow should only run on `main` branch, triggered by push. It should NOT run on PR — version bumps on PRs create noise and conflicts. Changesets use a bot PR pattern: the action opens a "Release PR" with the version bumps, and publishing happens when that PR is merged.  
**Real-life engineering:** npm publish requires a `NODE_AUTH_TOKEN` (npm access token) stored as a GitHub Actions secret. Set `registry-url: 'https://registry.npmjs.org'` in the setup-node step, or publish will fail silently.  
**Code review points:** Verify `package.json` `files` field only includes the `dist/` directory — not `src/`, not `node_modules/`, not test files. Publishing unnecessary files bloats the install size.  
**QA:** Run Changesets locally: `pnpm changeset` → select a package → write a description → verify `.changeset/*.md` file created. `pnpm changeset version` → verify `package.json` version bumped and `CHANGELOG.md` updated.

---

### Module I — Documentation

---

#### I.1–I.4 — README, ADRs, Story compliance, Storybook polish

**Architecture:** Documentation tasks — no component code.  
**Best practices:** README must contain: project description, install instructions (`npm install @yourusername/ui`), basic usage example with code, local dev setup (one command), contributing guidelines, license. Each ADR (001–005) lives as a `docs/adr-00N.mdx` file in `apps/docs`, rendered as Storybook pages.  
**Real-life engineering:** The Storybook story standard from PRD §16 must be applied to ALL components before launch — the chromatic visual regression baseline requires all story variants to exist. Run an audit: for each component, verify Primary, Secondary (if applicable), Loading, AsLink (if polymorphic), AllSizes, and DarkMode stories all exist.  
**QA:** `pnpm storybook:build` succeeds without warnings. All component stories render without errors. Dark mode toggle works on all stories. Chromatic build passes.

---

*Task tree complete. Move to Phase 1.5 after the first 1–2 modules (Module A + Module B) are implemented — do not wait for all tasks to be done before setting up CI and local dev environment.*
