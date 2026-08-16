# Phase B Agent Instructions — Token Pipeline

> **Agent:** Read `AGENT-CONTEXT.md` fully before starting this file.
> **Prerequisite:** Phase A commit must exist and all A tasks must be ✅ in `00-MASTER-INDEX.md`.
> **Goal:** Transform `tokens.json` into CSS custom properties, TypeScript constants, and a Storybook dark mode toggle.
> **Commit target:** `feat(phase-B): Token Pipeline — Figma to CSS custom properties`

---

## PHASE OVERVIEW

**What this phase produces:**
- `tokens.json` — the single source of truth for every visual value (colors, spacing, typography, radius)
- `dist/tokens.css` — CSS custom properties for light mode (`:root { --color-... }`)
- `dist/tokens.dark.css` — dark mode overrides (`[data-theme="dark"] { --color-... }`)
- `dist/tokens.ts` — TypeScript constants (`export const colorBackgroundDefault = 'var(--color-background-default)'`)
- Storybook dark mode toolbar toggle that uses `data-theme` on `<html>`

**Why this comes before any component:**
Components reference CSS custom properties like `var(--color-interactive-default)`. If tokens don't exist, components fail to build. No exceptions — tokens first.

**The Two-Tier Architecture (CRITICAL — memorize this):**
```
Primitives: raw values — color.primitive.neutral.50 = #fafafa
Semantics: aliases   — color.semantic.background.default = {color.primitive.neutral.0}
```
Components ONLY use semantic tokens. Dark mode ONLY changes which primitive the semantic points to.
This means dark mode requires ZERO component code changes.

**Skills to read first:**
- `.agents/skills/senior-frontend/SKILL.md`
- `.agents/skills/frontend-design/SKILL.md`

---

## TASK EXECUTION ORDER

---

### TASK B.1 — tokens.json Schema
**File:** `Implementation Plan/Phase B - Token Pipeline/Task B.1 - tokens.json Schema.md`

**What to build:** `packages/tokens/tokens.json`

**Required token categories (all must exist):**
```json
{
  "color": {
    "primitive": {
      "neutral": { "0": {"value": "#ffffff"}, "50": ..., "950": {"value": "#0a0a0a"} },
      "brand": { "primary": ..., "secondary": ... },
      "status": { "success": ..., "warning": ..., "error": ..., "info": ... }
    },
    "semantic": {
      "background": { "default": {"value": "{color.primitive.neutral.0}"}, "subtle": ..., "inverse": ... },
      "text": { "primary": ..., "secondary": ..., "disabled": ..., "inverse": ... },
      "border": { "default": ..., "strong": ..., "focus": ... },
      "interactive": { "default": ..., "hover": ..., "pressed": ..., "disabled": ... }
    }
  },
  "spacing": { "1": {"value": "4px"}, "2": ..., "24": {"value": "96px"} },
  "typography": {
    "fontSize": { "xs": ..., "sm": ..., "base": ..., "lg": ..., "xl": ..., "2xl": ..., "3xl": ..., "4xl": ... },
    "fontWeight": { "normal": ..., "medium": ..., "semibold": ..., "bold": ... },
    "lineHeight": { "tight": ..., "normal": ..., "relaxed": ... },
    "fontFamily": { "sans": ..., "mono": ... }
  },
  "radius": { "none": ..., "sm": ..., "md": ..., "lg": ..., "xl": ..., "full": ... },
  "shadow": { "none": ..., "sm": ..., "md": ..., "lg": ..., "xl": ... }
}
```

**Validation script — run after writing the JSON:**
```bash
node -e "JSON.parse(require('fs').readFileSync('packages/tokens/tokens.json', 'utf8')); console.log('Valid JSON')"
```

**Checklist:**
- [ ] `tokens.json` is valid JSON (no trailing commas)
- [ ] Every semantic token uses `{category.primitive.name}` alias syntax, NOT hardcoded hex
- [ ] Neutral ramp has at least 10 stops (0, 50, 100, 200, 300, 400, 500, 600, 800, 950)
- [ ] Spacing scale uses 4px increments (spacing.1=4px, spacing.2=8px, ...)

---

### TASK B.2 — Style Dictionary Config
**File:** `Implementation Plan/Phase B - Token Pipeline/Task B.2 - Style Dictionary Config.md`

**What to build:** `packages/tokens/sd.config.js` and update `packages/tokens/package.json`

**Key implementation:**
```javascript
// packages/tokens/sd.config.js
const StyleDictionary = require('style-dictionary');

module.exports = {
  source: ['tokens.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      prefix: '',
      buildPath: 'dist/',
      files: [{
        destination: 'tokens.css',
        format: 'css/variables',
        selector: ':root',
        options: { outputReferences: false }  // IMPORTANT: resolve all aliases
      }]
    }
  }
};
```

**Token → CSS var naming:**
- `color.semantic.background.default` → `--color-background-default`
- `spacing.4` → `--spacing-4`
- `typography.fontSize.base` → `--font-size-base`

**Verification:**
```bash
pnpm --filter @yourname/tokens build:tokens
cat packages/tokens/dist/tokens.css | head -20
# Must show: :root { --color-background-default: #ffffff; ...
grep "undefined" packages/tokens/dist/tokens.css   # Must return NOTHING
```

**Checklist:**
- [ ] `pnpm build:tokens` completes without errors
- [ ] `dist/tokens.css` exists with `:root {` selector
- [ ] No `undefined` or `[object Object]` values in output
- [ ] All CSS var names are kebab-case

---

### TASK B.3 — Dark Mode Override File
**File:** `Implementation Plan/Phase B - Token Pipeline/Task B.3 - Dark Mode Override File.md`

**What to build:** Add a second platform to `sd.config.js` producing `dist/tokens.dark.css`

**Key implementation — filter only semantic color tokens:**
```javascript
// Additional platform in sd.config.js
css_dark: {
  transformGroup: 'css',
  buildPath: 'dist/',
  files: [{
    destination: 'tokens.dark.css',
    format: 'css/variables',
    selector: '[data-theme="dark"]',
    options: { outputReferences: false },
    filter: (token) =>
      token.path[0] === 'color' &&
      token.path[1] === 'semantic'
  }]
}
```

**Dark mode values MUST be different primitives, NOT the same primitive with opacity:**
```
dark: color.semantic.background.default → color.primitive.neutral.950 (NOT rgba(255,255,255,0.1))
dark: color.semantic.text.primary → color.primitive.neutral.50
```

**Verification:**
```bash
cat packages/tokens/dist/tokens.dark.css | head -5
# Must show: [data-theme="dark"] {
grep "primitive" packages/tokens/dist/tokens.dark.css   # Must return NOTHING (no primitives in dark file)
```

**Checklist:**
- [ ] `dist/tokens.dark.css` uses `[data-theme="dark"]` selector
- [ ] Only semantic color tokens appear (no primitives, no spacing, no typography)
- [ ] Dark mode values are distinct primitives (not opacity variations)

---

### TASK B.4 — TypeScript Token Constants
**File:** `Implementation Plan/Phase B - Token Pipeline/Task B.4 - TypeScript Token Constants.md`

**What to build:** Add a third platform producing `dist/tokens.ts`

**Expected output shape:**
```typescript
// dist/tokens.ts — DO NOT EDIT (generated by Style Dictionary)
export const colorBackgroundDefault = 'var(--color-background-default)' as const;
export const colorTextPrimary = 'var(--color-text-primary)' as const;
// ...all semantic tokens

export const tokens = {
  color: {
    background: { default: colorBackgroundDefault },
    text: { primary: colorTextPrimary }
  }
} as const;

export type ColorToken = typeof colorBackgroundDefault | typeof colorTextPrimary; // | all others
```

**Verification:**
```bash
# In a test file, verify type safety:
import { ColorToken } from '@yourname/tokens';
const valid: ColorToken = 'var(--color-background-default)';  // Should compile
const invalid: ColorToken = '#ff0000';  // Should be a TypeScript ERROR
```

**Checklist:**
- [ ] `dist/tokens.ts` exists with named exports
- [ ] `ColorToken` union type is exported
- [ ] Using an arbitrary string where `ColorToken` is expected → TypeScript error
- [ ] Nested `tokens` object matches the semantic token structure

---

### TASK B.5 — Storybook Global CSS + Dark Mode Toggle
**File:** `Implementation Plan/Phase B - Token Pipeline/Task B.5 - Storybook Global CSS + Toggle.md`

**What to build:** Update `apps/docs/.storybook/preview.ts`

```typescript
// apps/docs/.storybook/preview.ts
import '@yourname/tokens/dist/tokens.css';
import '@yourname/tokens/dist/tokens.dark.css';
import type { Preview } from '@storybook/react';

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Color theme',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      document.documentElement.setAttribute('data-theme', context.globals.theme);
      return <Story />;
    },
  ],
};

export default preview;
```

**Verification:**
```bash
cd apps/docs && pnpm dev
# Open localhost:6006
# 1. Toolbar shows a sun/moon icon for theme switching
# 2. Toggle dark → all backgrounds change
# 3. Toggle light → all backgrounds change back
# 4. Open browser DevTools → <html data-theme="dark"> is set on the html element
# 5. No console errors about missing CSS custom properties
```

**Checklist:**
- [ ] Theme toggle is visible in the Storybook toolbar
- [ ] Toggling dark changes background/text colors visually
- [ ] `data-theme` is set on `<html>` not `<body>`
- [ ] No console errors about missing CSS

---

## PHASE B COMPLETION PROTOCOL

### Run Final Phase Check
```bash
pnpm build:tokens      # All 3 files must generate
pnpm --filter docs dev # Storybook loads with dark mode toggle
# Manual: toggle dark mode, verify colors change
# Manual: Check DevTools — no missing var() references
```

### Token Smoke Test (Run This Before Committing)
```bash
# Change a token value in tokens.json temporarily
# e.g., change color.primitive.brand.primary to #ff0000
pnpm build:tokens
# Open Storybook → the brand color should now be red
# Revert and rebuild
```

### Create Walkthroughs
After passing all checks, create walkthrough files in `Walkthroughs/Phase B - Token Pipeline/`:
- `B.1 Walkthrough.md` — Explain the two-tier token schema design and why primitives ≠ semantics
- `B.2 Walkthrough.md` — Explain Style Dictionary transforms and `outputReferences: false`
- `B.3 Walkthrough.md` — Explain why dark mode only overrides semantic tokens
- `B.4 Walkthrough.md` — Explain why TypeScript constants prevent token drift bugs
- `B.5 Walkthrough.md` — Explain the Storybook globalTypes + decorator pattern

### Git Commit
```bash
git add .
git commit -m "feat(phase-B): Token Pipeline — Figma to CSS custom properties

- Two-tier token schema: primitives (raw hex) + semantics (aliases) in tokens.json
- Style Dictionary compiles JSON to CSS custom properties with outputReferences=false
- Dark mode override with [data-theme=dark] selector, semantic-only overrides
- TypeScript constants with ColorToken union type for compile-time token safety
- Storybook global CSS + toolbar toggle for light/dark mode preview

Phase: B
Tasks: B.1, B.2, B.3, B.4, B.5
Tests: 1 (token drift guard)
Breaking: none"

git push origin main
```

### Update Master Index
Open `00-MASTER-INDEX.md` and mark all B tasks ✅.
