# Database & Schema Design — AI-Powered Design System & Component Library

> **Note:** This project has **no traditional database** (no PostgreSQL, no MongoDB, no SQLite). "Database design" here means the **design token data model** — the structured JSON schema that is the source of truth for all visual values in the system. This is an equally important design decision that has cascading effects on every component.  
> **Why this still matters in an interview:** Token schema design demonstrates the same skills as database schema design — normalization, naming conventions, migration strategy, preventing data drift, and schema evolution.

---

## 1. The Token Schema: Why It's a Database Problem

A design token system is functionally equivalent to a database in several ways:

| Database Concept | Token Equivalent |
|---|---|
| **Table schema** | Token category structure (`color`, `spacing`, `typography`) |
| **Primary key** | Token path (`color.primitive.neutral.50`) |
| **Foreign key** | Alias reference (`{color.primitive.neutral.50}`) |
| **Normalization** | Primitive → semantic two-tier structure |
| **Migration strategy** | Additive-first rename policy |
| **Generated types** | TypeScript constants from `tokens.ts` |
| **Schema drift** | Token-drift CI test (Integration Test 5) |
| **Data integrity** | No circular aliases, no unresolved references |

---

## 2. Schema Structure: Two-Tier Normalization

The fundamental design principle: **primitives store values, semantics store meaning.**

```
tokens.json
│
├── color
│   ├── primitive          ← Raw hex values. Like a lookup table. Never used by components.
│   │   ├── neutral        ← Full grayscale ramp (11 stops)
│   │   ├── brand          ← Brand color ramp (primary, hover states)
│   │   └── status         ← Functional colors (success, warning, error, info)
│   │
│   └── semantic           ← Aliases that point to primitives. What components use.
│       ├── background     ← Surfaces (page, card, overlay)
│       ├── text           ← Copy (primary, secondary, disabled, inverse)
│       ├── border         ← Borders and dividers
│       └── interactive    ← Button/link states (default, hover, active, focus, disabled)
│
├── spacing                ← 4px grid system (1 unit = 4px)
├── radius                 ← Border radius scale
├── typography
│   ├── fontSize           ← Type scale
│   ├── fontWeight         ← Weight scale
│   └── lineHeight         ← Leading scale
└── shadow                 ← Elevation scale
```

**The Core Rule (stated once, enforced everywhere):**
```
Primitive tokens → contain raw values (hex, px, numbers)
Semantic tokens  → reference primitives ONLY (never hardcode values)
Components       → reference semantic tokens ONLY (via CSS custom properties)

Chain: Component → Semantic → Primitive → Value
Never: Component → Primitive → Value (direct)
Never: Component → hardcoded hex value
```

This rule is what makes dark mode work **without touching component code.** Dark mode simply remaps semantic tokens to different primitive values.

---

## 3. Full Token Schema (Complete JSON Structure)

```json
{
  "color": {
    "primitive": {
      "neutral": {
        "0":   { "value": "#ffffff", "comment": "Pure white" },
        "50":  { "value": "#fafafa" },
        "100": { "value": "#f5f5f5" },
        "200": { "value": "#e5e5e5" },
        "300": { "value": "#d4d4d4" },
        "400": { "value": "#a3a3a3" },
        "500": { "value": "#737373" },
        "600": { "value": "#525252" },
        "700": { "value": "#404040" },
        "800": { "value": "#262626" },
        "900": { "value": "#171717" },
        "950": { "value": "#0a0a0a", "comment": "Near black" }
      },
      "brand": {
        "primary":       { "value": "#6366f1", "comment": "Indigo — main brand color" },
        "primary-hover": { "value": "#4f46e5", "comment": "Darker for hover states" },
        "primary-active":{ "value": "#4338ca", "comment": "Darkest for active/pressed states" },
        "primary-light": { "value": "#eef2ff", "comment": "Very light tint for backgrounds" },
        "primary-subtle":{ "value": "#c7d2fe", "comment": "Subtle tint for borders/accents" }
      },
      "status": {
        "success": { "value": "#22c55e" },
        "success-light": { "value": "#dcfce7" },
        "warning": { "value": "#f59e0b" },
        "warning-light": { "value": "#fef3c7" },
        "error":   { "value": "#ef4444" },
        "error-light": { "value": "#fee2e2" },
        "info":    { "value": "#3b82f6" },
        "info-light": { "value": "#dbeafe" }
      }
    },

    "semantic": {
      "background": {
        "default": { "value": "{color.primitive.neutral.0}",   "comment": "Page/app background" },
        "subtle":  { "value": "{color.primitive.neutral.50}",  "comment": "Cards, sidebars" },
        "overlay": { "value": "{color.primitive.neutral.900}", "comment": "Dialog backdrop" }
      },
      "text": {
        "primary":   { "value": "{color.primitive.neutral.900}", "comment": "Main body text" },
        "secondary": { "value": "{color.primitive.neutral.600}", "comment": "Supporting text, captions" },
        "disabled":  { "value": "{color.primitive.neutral.400}", "comment": "Disabled state" },
        "inverse":   { "value": "{color.primitive.neutral.0}",   "comment": "Text on dark backgrounds" },
        "brand":     { "value": "{color.primitive.brand.primary}", "comment": "Links, accent text" }
      },
      "border": {
        "default": { "value": "{color.primitive.neutral.200}", "comment": "Default borders" },
        "strong":  { "value": "{color.primitive.neutral.400}", "comment": "Emphasized borders" },
        "focus":   { "value": "{color.primitive.brand.primary}", "comment": "Focus rings" }
      },
      "interactive": {
        "default":  { "value": "{color.primitive.brand.primary}" },
        "hover":    { "value": "{color.primitive.brand.primary-hover}" },
        "active":   { "value": "{color.primitive.brand.primary-active}" },
        "disabled": { "value": "{color.primitive.neutral.300}" }
      },
      "status": {
        "success": { "value": "{color.primitive.status.success}" },
        "success-background": { "value": "{color.primitive.status.success-light}" },
        "warning": { "value": "{color.primitive.status.warning}" },
        "warning-background": { "value": "{color.primitive.status.warning-light}" },
        "error":   { "value": "{color.primitive.status.error}" },
        "error-background": { "value": "{color.primitive.status.error-light}" },
        "info":    { "value": "{color.primitive.status.info}" },
        "info-background": { "value": "{color.primitive.status.info-light}" }
      }
    }
  },

  "spacing": {
    "0":  { "value": "0px" },
    "1":  { "value": "4px",  "comment": "4px grid base unit" },
    "2":  { "value": "8px" },
    "3":  { "value": "12px" },
    "4":  { "value": "16px" },
    "5":  { "value": "20px" },
    "6":  { "value": "24px" },
    "8":  { "value": "32px" },
    "10": { "value": "40px" },
    "12": { "value": "48px" },
    "16": { "value": "64px" },
    "20": { "value": "80px" },
    "24": { "value": "96px" }
  },

  "radius": {
    "none": { "value": "0px" },
    "sm":   { "value": "4px" },
    "md":   { "value": "8px" },
    "lg":   { "value": "12px" },
    "xl":   { "value": "16px" },
    "full": { "value": "9999px", "comment": "Pill shape / circles" }
  },

  "typography": {
    "fontSize": {
      "xs":  { "value": "12px" },
      "sm":  { "value": "14px" },
      "base":{ "value": "16px", "comment": "Body text base" },
      "lg":  { "value": "18px" },
      "xl":  { "value": "20px" },
      "2xl": { "value": "24px" },
      "3xl": { "value": "30px" },
      "4xl": { "value": "36px" }
    },
    "fontWeight": {
      "normal":   { "value": "400" },
      "medium":   { "value": "500" },
      "semibold": { "value": "600" },
      "bold":     { "value": "700" }
    },
    "lineHeight": {
      "none":     { "value": "1" },
      "tight":    { "value": "1.25" },
      "snug":     { "value": "1.375" },
      "normal":   { "value": "1.5" },
      "relaxed":  { "value": "1.625" },
      "loose":    { "value": "2" }
    },
    "fontFamily": {
      "sans": { "value": "Inter, system-ui, sans-serif" },
      "mono": { "value": "JetBrains Mono, Fira Code, monospace" }
    }
  },

  "shadow": {
    "none": { "value": "none" },
    "sm":   { "value": "0 1px 2px 0 rgba(0,0,0,0.05)" },
    "md":   { "value": "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)" },
    "lg":   { "value": "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)" },
    "xl":   { "value": "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)" }
  }
}
```

---

## 4. Dark Mode Schema (Override Layer)

The dark mode token file (`tokens.dark.css`) is a **partial override** — only semantic tokens that change in dark mode. Primitive tokens never change (they're raw values, not contextual).

### Dark Mode Overrides Table

| Semantic Token | Light Value | Dark Value | Primitive Source |
|---|---|---|---|
| `color.background.default` | `#ffffff` | `#0f0f10` | `neutral.950` |
| `color.background.subtle` | `#fafafa` | `#1a1a1b` | `neutral.900` |
| `color.background.overlay` | `#171717` | `#000000` | `neutral.950` |
| `color.text.primary` | `#171717` | `#fafafa` | `neutral.50` |
| `color.text.secondary` | `#525252` | `#a3a3a3` | `neutral.400` |
| `color.text.disabled` | `#a3a3a3` | `#525252` | `neutral.600` |
| `color.border.default` | `#e5e5e5` | `#262626` | `neutral.800` |
| `color.border.strong` | `#a3a3a3` | `#404040` | `neutral.700` |

**What does NOT change in dark mode:**
- `color.interactive.*` — Brand colors remain the same in dark mode (the brand is consistent).
- `color.status.*` — Status colors (error, success, etc.) remain the same.
- All spacing, typography, radius, shadow tokens — purely structural, not visual.

**How dark mode is activated:**
```html
<!-- Consumer app: set on <html> or <body> -->
<html data-theme="dark">

<!-- Or via CSS media query (commented block in tokens.dark.css) -->
@media (prefers-color-scheme: dark) {
  :root { /* same overrides */ }
}
```

The `[data-theme="dark"]` approach is **explicit** (user toggle). The `@media` approach is **automatic** (OS setting). Both can coexist. The library provides both; the consumer chooses which to load.

---

## 5. Style Dictionary Transform Pipeline

`sd.config.js` defines three separate transforms from the same `tokens.json` source:

```javascript
// packages/tokens/sd.config.js
const StyleDictionary = require('style-dictionary');

module.exports = {
  source: ['tokens.json'],

  platforms: {
    // Transform 1: CSS custom properties (light mode)
    css: {
      transformGroup: 'css',
      buildPath: 'dist/',
      files: [{
        destination: 'tokens.css',
        format: 'css/variables',
        options: {
          selector: ':root',
          outputReferences: false,  // Resolve aliases → raw values in output
        },
        filter: (token) => true,    // All tokens
      }],
    },

    // Transform 2: Dark mode overrides
    cssDark: {
      transformGroup: 'css',
      buildPath: 'dist/',
      files: [{
        destination: 'tokens.dark.css',
        format: 'css/variables',
        options: {
          selector: '[data-theme="dark"]',
          outputReferences: false,
        },
        filter: (token) =>
          token.path[0] === 'color' &&     // Only color tokens
          token.path[1] === 'semantic',     // Only semantic layer (not primitives)
      }],
      // Transform values to dark mode equivalents
      // (Custom transform registered separately)
    },

    // Transform 3: TypeScript constants
    ts: {
      transformGroup: 'js',
      buildPath: 'dist/',
      files: [{
        destination: 'tokens.ts',
        format: 'javascript/es6',
        filter: (token) => token.path[0] === 'color' && token.path[1] === 'semantic',
      }],
    },
  },
};
```

### CSS Custom Property Naming Convention

The naming convention is: `--{category}-{subcategory}-{variant}`

```css
:root {
  /* Color tokens */
  --color-background-default: #ffffff;
  --color-background-subtle: #fafafa;
  --color-text-primary: #171717;
  --color-text-secondary: #525252;
  --color-border-default: #e5e5e5;
  --color-interactive-default: #6366f1;

  /* Spacing tokens */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-4: 16px;

  /* Typography tokens */
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-weight-semibold: 600;
  --line-height-normal: 1.5;

  /* Radius tokens */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-full: 9999px;

  /* Shadow tokens */
  --shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
}
```

### TypeScript Constants Output

```typescript
// packages/tokens/dist/tokens.ts (generated — never hand-edit)

// Named exports for each semantic color token
export const colorBackgroundDefault = 'var(--color-background-default)' as const;
export const colorBackgroundSubtle  = 'var(--color-background-subtle)' as const;
export const colorTextPrimary       = 'var(--color-text-primary)' as const;
export const colorTextSecondary     = 'var(--color-text-secondary)' as const;
export const colorBorderDefault     = 'var(--color-border-default)' as const;
export const colorInteractiveDefault = 'var(--color-interactive-default)' as const;
// ...all other semantic tokens

// Nested object for ergonomic access
export const tokens = {
  color: {
    background: {
      default: colorBackgroundDefault,
      subtle:  colorBackgroundSubtle,
    },
    text: {
      primary:   colorTextPrimary,
      secondary: colorTextSecondary,
    },
    border: {
      default: colorBorderDefault,
    },
    interactive: {
      default: colorInteractiveDefault,
    },
  },
} as const;

// Union types — prevents arbitrary color strings in component props
export type ColorToken = typeof colorBackgroundDefault
  | typeof colorBackgroundSubtle
  | typeof colorTextPrimary
  | typeof colorTextSecondary
  | typeof colorBorderDefault
  | typeof colorInteractiveDefault;
  // ...all color tokens

export type SpacingToken = 'var(--spacing-1)' | 'var(--spacing-2)' | 'var(--spacing-4)';
// ...etc.
```

---

## 6. Schema Integrity Rules

These are enforced at different levels:

| Rule | Where Enforced | What Breaks If Violated |
|---|---|---|
| **No circular aliases** | Style Dictionary build (exits code 1) | Build hangs or crashes |
| **Alias depth ≤ 2** | Manual audit + CI script | Hard to debug, slow resolution |
| **No hardcoded values in semantics** | Code review + linting rule | Dark mode silently breaks |
| **No primitives in components** | ESLint rule (custom) / Code review | Component requires code changes for dark mode |
| **Generated files never hand-edited** | `// DO NOT EDIT` header + git hooks | Generates get overwritten, manual changes lost |
| **All semantic tokens have dark overrides** | Integration Test 5 (key diff) | Some elements don't change in dark mode (silent bug) |
| **Token names are kebab-case** | Style Dictionary transformer | CSS var names break if camelCase |

### Token Drift Guard (Integration Test 5)

```typescript
// packages/tokens/src/__tests__/token-drift.test.ts
import { tokens } from '../dist/tokens';
import rawTokens from '../tokens.json';

it('all semantic color categories in JSON exist in generated TypeScript', () => {
  const semanticCategories = Object.keys(rawTokens.color.semantic);
  for (const category of semanticCategories) {
    expect(Object.keys(tokens.color)).toContain(category);
  }
});
```

This test fails if `tokens.json` is updated but `pnpm build:tokens` was not run before commit.

---

## 7. Migration Strategy (Schema Evolution)

Tokens are part of the public API once the library is published. Renaming a token is a breaking change for consumers who reference it in their own CSS overrides.

### The Three-Phase Rename Process

**Example:** Renaming `color.text.primary` → `color.text.foreground`

```
Phase 1 (minor release): Add new name, keep old name
  tokens.json: add "foreground": { "value": "..." }
  tokens.json: keep "primary": { "value": "..." } with @deprecated comment

Phase 2 (next minor release): Deprecate old name
  README/CHANGELOG: document the deprecation
  tokens.ts: export colorTextForeground (new), keep colorTextPrimary with JSDoc @deprecated

Phase 3 (next major release): Remove old name
  tokens.json: delete "primary"
  tokens.ts: remove colorTextPrimary export
  MIGRATION.md: document the rename with before/after examples
```

**Why additive-first:**
- Consumers' apps that reference the old CSS var (`var(--color-text-primary)`) continue working.
- Only consumers using the TypeScript constant get a deprecation warning at compile time.
- No consumer app breaks silently on a minor version update.

### What Triggers Each Semver Bump

| Change Type | Version Bump | Example |
|---|---|---|
| Token value correction (wrong hex) | `patch` | `#6366f1` → `#6467f1` (slight shade fix) |
| New token added | `minor` | Adding `color.background.brand` |
| New token category | `minor` | Adding entire `animation` category |
| Token renamed (old name kept) | `minor` | Adding alias to old name |
| Token renamed (old name removed) | `major` | Final phase of rename |
| Token removed | `major` | Any deletion |
| Alias structure changed | `major` | Restructuring the two-tier hierarchy |

---

## 8. File Artifacts Summary

These are all the "database" files and their relationships:

```
packages/tokens/
├── tokens.json              ← SOURCE OF TRUTH (hand-maintained or Figma export)
├── sd.config.js             ← Transform rules (hand-maintained)
└── dist/                    ← GENERATED (never hand-edit, committed to git)
    ├── tokens.css            ← Imported by Storybook, consumer apps
    ├── tokens.dark.css       ← Imported alongside tokens.css
    └── tokens.ts             ← Imported by packages/core components
```

**Why generated files are committed to git:**
- Consumers who install `@yourusername/tokens` (the tokens-only package) get the generated CSS and TS files. If they're not committed, the package has no usable output.
- CI's token-drift test (`Integration Test 5`) compares the committed generated files to what would be generated from the current `tokens.json`. If they differ, CI fails.
- Alternative: generate on `npm prepare` (pre-publish hook). This is also valid — the choice is documented in case it's questioned.

---

*Token schema is a database. Treat token renames like column renames — additive first, never atomic.*
