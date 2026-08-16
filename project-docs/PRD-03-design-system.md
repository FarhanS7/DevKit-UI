# PRD — Project 03: AI-Powered Design System & Component Library

> **Type:** Portfolio / Resume Project  
> **Target level:** Mid → Senior Frontend Engineer  
> **Estimated build time:** 10–12 weeks (solo)  
> **Primary signal:** Component API design · TypeScript generics · Accessibility · Frontend architecture · Developer experience  

---

## 1. Executive Summary

An open-source React component library — published to npm, documented in a public Storybook — built with accessibility-first primitives, a Figma-to-CSS token pipeline, and an AI-powered developer experience layer. This is the project that almost no portfolio has, yet every company above 50 engineers desperately needs someone who can build and maintain. It signals that you think at the platform/infrastructure level, not just the feature level.

The AI layer is differentiated: not a chatbot, but three tools directly tied to the design system's core value — a component generator (describe in English, get correct JSX with props), an accessibility checker (describe a failure, get a WCAG-compliant fix), and a theme builder (natural language → token values). These make the library genuinely useful to other developers, not just a showcase.

---

## 2. Problem Statement

Every engineering team above ~30 people eventually hits the same wall: inconsistent UI, duplicate components, accessibility regressions on every release, and no shared language between design and engineering. A well-built design system solves all four — but building one correctly requires deep knowledge of TypeScript generics, ARIA patterns, token pipelines, and visual regression testing. Most tutorials cover the surface; this project goes to the bottom.

---

## 3. Goals

### Primary Goals
- Build a published npm package that other developers can install and use (real install count is a talking point)
- Achieve 100% WCAG 2.1 AA compliance across all interactive components (axe-core + manual NVDA test)
- Implement a Figma → Style Dictionary → CSS custom properties token pipeline with dark-mode aliasing
- Demonstrate advanced TypeScript: polymorphic `as`-prop, discriminated unions, conditional types — zero `any`
- Build three AI-powered DX tools genuinely integrated into the library

### Secondary Goals
- Full visual regression CI via Chromatic (screenshot per Storybook story, diff on PR)
- Playwright component tests for complex ARIA patterns (combobox, dialog, data grid)
- Lighthouse score ≥ 95 on the Storybook documentation site
- Bundle size: total library < 80KB gzipped; individual component tree-shaking verified

### Non-Goals
- Native mobile components (web only)
- A no-code editor or drag-and-drop UI builder
- Figma plugin development
- Support for Vue or Angular (React only)

---

## 4. Target Users (for the product narrative)

| User | Need |
|------|------|
| Frontend developers on small teams | A production-ready component library they can install without building from scratch |
| Accessibility engineers | Components that meet WCAG 2.1 AA out of the box, keyboard and screen-reader tested |
| Designers | A token system that maps directly from Figma to code, no manual handoff |
| Engineering managers | Proof that a candidate can own frontend infrastructure, not just feature development |

---

## 5. Tech Stack

### Library Core
| Layer | Choice | Rationale |
|-------|--------|-----------|
| Language | TypeScript 5 (strict, `exactOptionalPropertyTypes`) | Maximum type safety; demonstrates TS mastery |
| Framework | React 18 | Hooks, concurrent features, RSC-compatible |
| Primitives | Radix UI (headless) | Unstyled, ARIA-correct behavior; WAI-ARIA patterns maintained by full-time team |
| Styling | Tailwind CSS + CSS custom properties | Utility classes + token-driven theming |
| Token pipeline | Style Dictionary | Design token transformation: JSON → CSS vars → TypeScript types |
| Build | Vite (library mode) + Rollup | ESM + CJS dual output; tree-shaking by default |
| Package manager | pnpm workspaces | Monorepo: library + docs + AI tools |

### Documentation
| Layer | Choice | Rationale |
|-------|--------|-----------|
| Docs site | Storybook 8 | Industry standard; visual testing integration |
| Visual regression | Chromatic | Screenshot per story, PR diff, managed baseline |
| Deployment | Chromatic hosted Storybook (free for open source) | Always-live public URL |
| Additional docs | MDX pages in Storybook | Usage guides, ADRs, migration guides |

### AI Developer Tools
| Layer | Choice | Rationale |
|-------|--------|-----------|
| Component generator | Anthropic SDK (claude-sonnet) | Streaming JSX output |
| Accessibility checker | Anthropic SDK | Context-aware WCAG fix suggestions |
| Theme builder | Anthropic SDK | Token value generation from design intent |
| API proxy | Next.js API routes (docs site) | Key management, rate limiting |

### Testing
| Layer | Choice | Rationale |
|-------|--------|-----------|
| Unit + component | Vitest + React Testing Library | Vite-native, fast, same API as Jest |
| ARIA / a11y | axe-core (via jest-axe) | Programmatic WCAG checking per component |
| Visual regression | Chromatic | Per-story screenshot CI |
| Interaction | Playwright (component test mode) | Complex keyboard flows, focus management |
| Bundle | rollup-plugin-visualizer | Tree-shaking verification |

### CI/CD
| Layer | Choice |
|-------|--------|
| CI | GitHub Actions |
| Publish | Changesets (automated semantic versioning + changelog) |
| npm | Public package: `@yourusername/ui` |
| Storybook | Chromatic auto-deploy on merge to main |

---

## 6. Architecture

### Monorepo Structure

```
/
├── packages/
│   ├── core/                          # The npm-published library
│   │   ├── src/
│   │   │   ├── components/            # All components
│   │   │   ├── tokens/                # Token TypeScript types (generated)
│   │   │   ├── hooks/                 # Shared hooks (useFocusTrap, useId, etc.)
│   │   │   └── index.ts               # Public API barrel export
│   │   ├── vite.config.ts             # Library build config
│   │   └── package.json
│   │
│   └── tokens/                        # Token pipeline (separate package)
│       ├── tokens.json                # Source of truth (Figma export or manual)
│       ├── sd.config.js               # Style Dictionary config
│       └── dist/
│           ├── tokens.css             # CSS custom properties
│           ├── tokens.dark.css        # Dark mode overrides
│           └── tokens.ts             # TypeScript token constants
│
├── apps/
│   └── docs/                          # Storybook + AI tools
│       ├── .storybook/
│       ├── stories/                   # One story file per component
│       ├── ai-tools/                  # AI DX tools UI
│       │   ├── ComponentGenerator.tsx
│       │   ├── A11yChecker.tsx
│       │   └── ThemeBuilder.tsx
│       └── pages/                     # MDX docs pages
│
├── .changeset/                        # Changesets for release management
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── release.yml
└── pnpm-workspace.yaml
```

### Token Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Figma (Design Source)                      │
│   Colors, spacing, typography, radii, shadows defined here   │
└─────────────────────────┬───────────────────────────────────┘
                          │ Export (Figma Tokens plugin / manual)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    tokens.json (Source of Truth)             │
│                                                              │
│  {                                                           │
│    "color": {                                                │
│      "brand": { "primary": { "value": "#5B4CF5" } },        │
│      "semantic": {                                           │
│        "background": {                                       │
│          "default": { "value": "{color.neutral.0}" },        │  ← alias
│          "subtle":  { "value": "{color.neutral.50}" }        │
│        }                                                     │
│      }                                                       │
│    }                                                         │
│  }                                                           │
└─────────────────────────┬───────────────────────────────────┘
                          │ Style Dictionary transform
                          ▼
┌─────────────────────────────────────────────────────────────┐
│               Style Dictionary (sd.config.js)               │
│                                                              │
│  Transforms:                                                 │
│  - Resolve aliases (semantic → primitive → hex)             │
│  - Generate CSS custom properties                            │
│  - Generate TypeScript constants                            │
│  - Generate dark-mode override file                         │
└──────────┬────────────────────┬────────────────────────────┘
           ▼                    ▼
┌───────────────────┐  ┌────────────────────────────────────┐
│  tokens.css        │  │  tokens.ts (TypeScript)            │
│                    │  │                                    │
│  :root {           │  │  export const tokens = {           │
│    --color-bg-     │  │    color: {                        │
│      default:      │  │      bg: {                         │
│      #ffffff;      │  │        default: 'var(--color-bg-   │
│  }                 │  │          default)' as const        │
│  [data-theme=dark] │  │      }                             │
│  {                 │  │    }                               │
│    --color-bg-     │  │  } as const;                       │
│      default:      │  │                                    │
│      #0f0f10;      │  └────────────────────────────────────┘
│  }                 │
└───────────────────┘
```

### Component Architecture: Polymorphic `as`-prop

The most complex TypeScript pattern in the library — enables `<Button as="a" href="...">` while preserving all HTML attribute types:

```typescript
// Generic component props with polymorphism
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

// Usage in Button component
type ButtonOwnProps = {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
};

type ButtonProps<C extends React.ElementType = 'button'> =
  PolymorphicComponentPropWithRef<C, ButtonOwnProps>;

type ButtonComponent = <C extends React.ElementType = 'button'>(
  props: ButtonProps<C>
) => React.ReactElement | null;

// Implementation
const Button: ButtonComponent = React.forwardRef(
  <C extends React.ElementType = 'button'>(
    { as, variant = 'primary', size = 'md', isLoading, leftIcon, className, children, ...rest }: ButtonProps<C>,
    ref?: PolymorphicRef<C>
  ) => {
    const Component = as ?? 'button';
    return (
      <Component
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        aria-busy={isLoading}
        {...rest}
      >
        {leftIcon && <span aria-hidden="true">{leftIcon}</span>}
        {children}
      </Component>
    );
  }
);

// TypeScript inference result:
// <Button>Click</Button>               → props: ButtonHTMLAttributes
// <Button as="a" href="/path">         → props: AnchorHTMLAttributes (href required)
// <Button as={RouterLink} to="/path">  → props: RouterLink's own props
```

### ARIA Focus Trap Architecture (Dialog component)

```typescript
function useFocusTrap(ref: RefObject<HTMLElement>, isActive: boolean) {
  useEffect(() => {
    if (!isActive || !ref.current) return;

    const container = ref.current;
    const focusable = getFocusableElements(container);  // tabbable, not disabled
    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];

    // Save previously focused element to restore on close
    const previouslyFocused = document.activeElement as HTMLElement;
    firstFocusable?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      if (focusable.length === 0) { e.preventDefault(); return; }

      if (e.shiftKey) {
        // Tab backward: wrap from first to last
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab forward: wrap from last to first
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }

    // Lock scroll on body
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      // Restore scroll
      document.body.style.position = '';
      document.body.style.top = '';
      window.scrollTo(0, scrollY);
      // Restore focus
      previouslyFocused?.focus();
    };
  }, [isActive, ref]);
}
```

---

## 7. Component Inventory

### Tier 1 — Foundation (build first, everything else depends on these)

| Component | Key ARIA pattern | Key TypeScript challenge |
|-----------|-----------------|--------------------------|
| `Button` | `role="button"`, `aria-busy`, `aria-disabled` | Polymorphic `as`-prop with ref forwarding |
| `Input` | `aria-labelledby`, `aria-describedby`, `aria-invalid` | Discriminated union: `type="text"` vs `type="number"` |
| `Label` | `htmlFor` association | Compound component context pattern |
| `Text` / `Heading` | Semantic HTML, `aria-level` override | Polymorphic `as`-prop (h1–h6 variants) |
| `Icon` | `aria-hidden="true"` for decorative; `role="img"` + `aria-label` for semantic | Lazy-loaded icon set with dynamic import |
| `VisuallyHidden` | Screen-reader-only text | Simple but foundational |
| `Portal` | Renders into `document.body` | Required by Dialog, Tooltip, Popover |

### Tier 2 — Interactive Components (the hard ARIA work)

| Component | Key ARIA pattern | Key TypeScript challenge |
|-----------|-----------------|--------------------------|
| `Dialog` / `Modal` | `role="dialog"`, `aria-modal`, focus trap, scroll lock, `aria-labelledby` | `useFocusTrap` hook, portal composition |
| `Select` / `Combobox` | WAI-ARIA combobox pattern: `role="combobox"`, `role="listbox"`, `role="option"`, keyboard nav | Virtualized option list (own implementation) |
| `Tooltip` | `role="tooltip"`, `aria-describedby`, mouse + keyboard + touch triggers | Floating position calculation without a library |
| `Popover` | `aria-haspopup`, `aria-expanded`, `aria-controls` | Click outside detection with portal awareness |
| `Tabs` | `role="tablist"`, `role="tab"`, `role="tabpanel"`, arrow key navigation | Controlled + uncontrolled variants |
| `Accordion` | `aria-expanded`, `aria-controls`, `aria-labelledby` | Compound component with shared context |
| `Checkbox` / `Switch` | `role="checkbox"`, indeterminate state, `aria-checked` | Tri-state boolean type |

### Tier 3 — Complex Components (DSA required)

| Component | Key ARIA pattern | Key challenge |
|-----------|-----------------|---------------|
| `DataGrid` | `role="grid"`, `role="row"`, `role="gridcell"`, row selection, sort | Virtualized rows (own implementation), ARIA tree |
| `VirtualList` | No native ARIA (container is plain) | Binary search for visible range, ResizeObserver |
| `DatePicker` | `role="dialog"` + `role="grid"` (calendar), keyboard nav | Calendar grid algorithm, i18n |
| `CommandPalette` | `role="combobox"` + search + grouped options | Fuzzy search algorithm (trigram matching) |

### Tier 4 — AI DX Tools (unique differentiator)

| Tool | Description | Implementation |
|------|-------------|----------------|
| Component Generator | Describe component in English → get correct JSX + prop list | LLM with system prompt embedding library API |
| Accessibility Checker | Describe an accessibility issue → get WCAG criterion + code fix | LLM with WCAG 2.1 AA as context |
| Theme Builder | "I want a calm, professional blue theme for a fintech product" → get token values | LLM → Style Dictionary JSON → live CSS var update |

---

## 8. Feature Specification

### 8.1 Token System

| Feature | Description | Priority |
|---------|-------------|----------|
| Primitive tokens | Raw values: 50+ color stops, 8 spacing steps, 5 radii, 5 font sizes | P0 |
| Semantic tokens | Intent-based aliases: `color.background.default`, `color.text.primary` | P0 |
| Dark mode | `[data-theme="dark"]` selector overrides; auto via `prefers-color-scheme` | P0 |
| Brand tokens | Configurable primary/accent color ramp via CSS variable override | P0 |
| TypeScript types | Generated token type map — prevents use of arbitrary color strings | P1 |
| Figma export compatibility | tokens.json format compatible with Figma Tokens plugin | P1 |

### 8.2 Component API Standards

| Standard | Description | Priority |
|----------|-------------|----------|
| Polymorphic rendering | All text/interactive components support `as` prop | P0 |
| Ref forwarding | All components forward refs (`React.forwardRef`) | P0 |
| Controlled + uncontrolled | All stateful components support both patterns | P0 |
| `className` extension | All components accept and merge `className` via `clsx` | P0 |
| `data-*` passthrough | All unknown props passed to underlying element | P0 |
| Size variants | `sm`, `md`, `lg` on all interactive components | P1 |
| Loading state | `isLoading` on all form-submission components | P1 |

### 8.3 Accessibility Requirements

| Requirement | Standard | Priority |
|-------------|----------|----------|
| Keyboard navigability | Full keyboard access: Tab, Shift+Tab, Arrow keys, Enter, Escape, Space | P0 |
| Screen reader compatibility | NVDA + Chrome manual test for all Tier 2+ components | P0 |
| Focus visibility | `focus-visible` ring on all interactive elements, 3:1 contrast ratio | P0 |
| Color contrast | 4.5:1 for normal text, 3:1 for large text and UI components | P0 |
| Motion reduction | All animations wrapped in `@media (prefers-reduced-motion: reduce)` | P0 |
| axe-core zero violations | CI gate: zero axe violations on every component | P0 |
| Error messages | All form errors associated via `aria-describedby` | P0 |

### 8.4 AI Developer Tools

#### Component Generator
```
Input:  "A card with a title, body text, and a 'Learn more' button that links somewhere"
Output: 
  import { Card, Text, Button } from '@yourusername/ui';

  <Card>
    <Text variant="heading" as="h3">Title</Text>
    <Text variant="body">Body text goes here.</Text>
    <Button as="a" href="#" variant="secondary" size="sm">
      Learn more
    </Button>
  </Card>

Props used:
  Card — no required props
  Text — variant: "heading" | "body" | "caption" | "label"
  Button — as, href, variant, size
```

System prompt strategy:
- Include the full component API (props, types, variants) in the system prompt
- Require output in two parts: JSX code block + prop explanation
- Validate generated JSX parses before showing to user (Babel `@babel/parser`)

#### Accessibility Checker
```
Input:  "My modal closes when I press Escape but it doesn't return focus to the button that opened it"
Output:
  WCAG Criterion: 2.4.3 Focus Order (Level A)
  
  Issue: Focus is lost after dialog dismissal. Screen reader users
  lose their place in the document.
  
  Fix: Store a ref to the trigger element before opening the dialog.
  Restore focus to it in the dialog's cleanup effect.
  
  Code fix:
  const triggerRef = useRef<HTMLButtonElement>(null);
  
  // In useFocusTrap cleanup:
  return () => {
    previouslyFocused?.focus();  // ← this is what you're missing
  };
  
  With this library's Dialog component:
  <Dialog.Trigger ref={triggerRef}>Open</Dialog.Trigger>
  // Focus is restored automatically on close — no extra code needed.
```

#### Theme Builder
```
Input:  "Professional, trustworthy, calm. Think banking or healthcare. 
         Primary color should be a deep teal. Slightly warm neutrals."

Output: (Style Dictionary JSON patch)
  {
    "color": {
      "brand": {
        "primary": { "value": "#0D6E6E" },
        "primary-hover": { "value": "#0A5757" },
        "primary-light": { "value": "#E0F4F4" }
      },
      "neutral": {
        "50":  { "value": "#FAFAF8" },
        "100": { "value": "#F2F1EE" },
        "900": { "value": "#1C1B18" }
      }
    }
  }

Live preview: CSS variables updated in Storybook iframe immediately.
Contrast ratios: all combinations checked, violations flagged.
```

---

## 9. DSA and Engineering Depth

### 9.1 VirtualList — Binary Search for Visible Range

```typescript
class VirtualList<T> {
  private itemHeights: number[];       // measured heights per item
  private cumulativeHeights: number[]; // prefix sum array

  // O(log n) — find first item whose cumulative height >= scrollTop
  getStartIndex(scrollTop: number): number {
    let lo = 0, hi = this.items.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (this.cumulativeHeights[mid] < scrollTop) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  // O(log n) — find last item whose cumulative height <= scrollTop + containerHeight
  getEndIndex(scrollTop: number, containerHeight: number): number {
    return this.getStartIndex(scrollTop + containerHeight);
  }
}
```

### 9.2 CommandPalette — Trigram Fuzzy Search

```typescript
function buildTrigrams(str: string): Set<string> {
  const s = `  ${str.toLowerCase()}  `;
  const trigrams = new Set<string>();
  for (let i = 0; i < s.length - 2; i++) {
    trigrams.add(s.slice(i, i + 3));
  }
  return trigrams;
}

function trigramSimilarity(a: string, b: string): number {
  const trigramsA = buildTrigrams(a);
  const trigramsB = buildTrigrams(b);
  let intersection = 0;
  for (const t of trigramsA) {
    if (trigramsB.has(t)) intersection++;
  }
  return (2 * intersection) / (trigramsA.size + trigramsB.size);
}

// Sort options by similarity score — O(n log n)
function fuzzySearch(query: string, options: Option[]): Option[] {
  return options
    .map(opt => ({ opt, score: trigramSimilarity(query, opt.label) }))
    .filter(({ score }) => score > 0.2)
    .sort((a, b) => b.score - a.score)
    .map(({ opt }) => opt);
}
```

### 9.3 Lazy-Loaded Icon Set (1000+ Icons, Zero Initial Bundle Cost)

```typescript
// icons/index.ts — no static imports
export const icons = {
  ArrowRight: lazy(() => import('./ArrowRight')),
  Check: lazy(() => import('./Check')),
  // ...1000+ icons
} as const;

export type IconName = keyof typeof icons;

// Icon component — dynamic import on first render
export function Icon({ name, size = 20, ...props }: IconProps) {
  const LazyIcon = icons[name];
  return (
    <Suspense fallback={<span style={{ width: size, height: size }} aria-hidden="true" />}>
      <LazyIcon size={size} {...props} />
    </Suspense>
  );
}
```

Result: **Zero icon bytes in initial bundle.** Each icon SVG is ~300 bytes; loaded on first use, cached thereafter.

### 9.4 Token Type System (Generated TypeScript)

Style Dictionary generates this file — never hand-edited:

```typescript
// tokens.ts (generated)
export const colorBackgroundDefault = 'var(--color-background-default)' as const;
export const colorTextPrimary       = 'var(--color-text-primary)' as const;
// ...

// Token type — exhaustive union
export type ColorToken =
  | typeof colorBackgroundDefault
  | typeof colorTextPrimary
  | /* all other color tokens */;

// Usage in components — prevents arbitrary color strings
type TextProps = {
  color?: ColorToken;  // only valid tokens accepted by TypeScript
};
```

### 9.5 Calendar Grid Algorithm (DatePicker)

```typescript
function buildCalendarGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1).getDay();  // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid: (Date | null)[][] = [];
  let week: (Date | null)[] = Array(firstDay).fill(null);  // leading nulls

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(new Date(year, month, day));
    if (week.length === 7) {
      grid.push(week);
      week = [];
    }
  }
  // Trailing nulls to complete last week
  if (week.length > 0) {
    grid.push([...week, ...Array(7 - week.length).fill(null)]);
  }
  return grid;  // 5-6 rows × 7 columns — renders as ARIA grid
}
```

---

## 10. Accessibility Test Matrix

Every Tier 2+ component must pass all of the following before merge:

| Test | Tool | Pass Criteria |
|------|------|---------------|
| Automated WCAG scan | axe-core (jest-axe) | Zero violations |
| Color contrast | axe-core + manual Colour Contrast Analyser | 4.5:1 normal text, 3:1 UI |
| Keyboard navigation | Manual test (no mouse) | All actions achievable via keyboard alone |
| Screen reader (Windows) | NVDA + Chrome | Correct role, state, label announced on each interaction |
| Screen reader (Mac) | VoiceOver + Safari | Same as above |
| Reduced motion | `prefers-reduced-motion: reduce` | All animations suppressed |
| Focus visible | Manual | Focus ring visible on all interactive elements |
| Touch target size | Manual | Minimum 44×44px touch target for all interactive elements |

---

## 11. API Design

### Package Exports (tree-shakeable)

```typescript
// packages/core/src/index.ts
// Named exports only — no default export (prevents bundler issues)
export { Button } from './components/Button';
export type { ButtonProps } from './components/Button';

export { Input } from './components/Input';
export type { InputProps } from './components/Input';

export { Dialog } from './components/Dialog';
export { DialogTrigger } from './components/Dialog';
export { DialogContent } from './components/Dialog';
export type { DialogProps } from './components/Dialog';

// Token utilities
export { tokens } from './tokens';
export type { ColorToken, SpacingToken } from './tokens';

// Hooks (public API)
export { useFocusTrap } from './hooks/useFocusTrap';
export { useId } from './hooks/useId';
```

### AI Tools API (Next.js routes in docs app)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/ai/generate-component` | NL → JSX component code (streaming) |
| `POST` | `/api/ai/check-accessibility` | Issue description → WCAG fix (streaming) |
| `POST` | `/api/ai/build-theme` | Design intent → token JSON (streaming) |

All routes implement:
- Rate limiting: 20 requests / hour per IP
- Input validation (Zod)
- Error handling: graceful degradation if LLM is unavailable
- Response streaming via SSE

---

## 12. Versioning & Release Strategy

Using **Changesets** for automated semantic versioning:

```bash
# Developer adds a changeset when making a notable change
pnpm changeset

# Output:
# ? Which packages should have a major bump? (none)
# ? Which packages should have a minor bump? @yourusername/ui
# ? Describe the change: Add VirtualList component with binary search virtualization
```

On merge to `main`:
1. GitHub Actions runs `changeset version` — bumps package.json, generates CHANGELOG.md
2. `changeset publish` — publishes to npm
3. Chromatic Storybook auto-deploys

### Version Policy
- `patch`: Bug fixes, accessibility fixes, token value corrections
- `minor`: New component, new variant, new token
- `major`: Breaking change to component API, token rename, removal

---

## 13. Testing Strategy

### Per-Component Test File Structure

```typescript
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from './Button';

expect.extend(toHaveNoViolations);

describe('Button', () => {
  // 1. Renders correctly
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  // 2. ARIA compliance (non-negotiable)
  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // 3. Polymorphic rendering
  it('renders as an anchor when as="a"', () => {
    render(<Button as="a" href="/path">Link</Button>);
    const link = screen.getByRole('link', { name: 'Link' });
    expect(link).toHaveAttribute('href', '/path');
  });

  // 4. Keyboard interaction
  it('fires onClick on Enter key', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledOnce();
  });

  // 5. Loading state
  it('shows aria-busy when isLoading', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });
});
```

### Playwright Component Tests (Complex ARIA)

```typescript
// Dialog.spec.ts
test('focus trap works correctly', async ({ mount, page }) => {
  const component = await mount(
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <input placeholder="First" />
        <input placeholder="Second" />
        <button>Close</button>
      </DialogContent>
    </Dialog>
  );

  await page.getByRole('button', { name: 'Open' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  // Tab through all focusable elements, confirm wrap-around
  await page.keyboard.press('Tab');
  await expect(page.getByPlaceholder('First')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByPlaceholder('Second')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Close' })).toBeFocused();
  await page.keyboard.press('Tab');
  // Should wrap back to first focusable element
  await expect(page.getByPlaceholder('First')).toBeFocused();

  // Escape closes dialog and restores focus
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Open' })).toBeFocused();
});
```

---

## 14. CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
on: [push, pull_request]

jobs:
  lint:
    steps:
      - ESLint (React + TypeScript strict rules)
      - Prettier check
      - tsc --noEmit (zero TypeScript errors, zero any)

  test:
    steps:
      - Vitest (unit + component tests)
      - jest-axe: zero axe violations across all component snapshots
      - Coverage: 80% lines, 75% branches

  playwright:
    steps:
      - Build Storybook
      - Playwright component tests (Dialog, Select, Combobox, DataGrid)

  chromatic:
    steps:
      - Build Storybook
      - Chromatic publish (visual regression, fail on unexpected diff)

  bundle-analysis:
    steps:
      - Build library
      - Assert: total gzip < 80KB
      - Assert: Button alone gzip < 3KB (tree-shaking verification)
      - rollup-plugin-visualizer output saved as artifact

# .github/workflows/release.yml
on:
  push:
    branches: [main]

jobs:
  release:
    steps:
      - changeset version (if changesets present)
      - changeset publish → npm
      - Create GitHub Release with CHANGELOG
      - Chromatic Storybook deploy (public URL)
```

---

## 15. Architecture Decision Records (ADRs)

### ADR-001: Radix UI primitives over building from scratch
**Decision:** Use Radix UI as the unstyled behavior layer for complex components  
**Alternatives considered:** React Aria (Adobe), Headless UI (Tailwind Labs), fully custom  
**Rationale:** Radix implements WAI-ARIA patterns correctly and is maintained full-time by a dedicated team. WAI-ARIA combobox, dialog, and tabs are subtle — getting them wrong in all browser/screen-reader combinations takes months. Radix solves the hard parts; we own the styling and the API surface. React Aria is also excellent but requires more boilerplate; Headless UI is less feature-complete.  
**Trade-offs:** Dependency on Radix versioning; mitigated by pinning major version and wrapping in our own API.

### ADR-002: Style Dictionary over CSS-in-JS token systems
**Decision:** Tokens are CSS custom properties, generated by Style Dictionary from a JSON source  
**Alternatives considered:** Stitches, vanilla-extract, Emotion themes  
**Rationale:** CSS custom properties work in any rendering environment (SSR, islands, web components, iframe embeds). They cascade correctly and can be overridden by consumers without library knowledge. Style Dictionary is the industry standard for multi-platform token transformation (CSS, iOS, Android from one source). CSS-in-JS runtime solutions add runtime overhead and don't work in RSC.  
**Trade-offs:** Token changes require a build step; no runtime theme switching beyond what CSS cascade allows (which is sufficient for light/dark).

### ADR-003: Polymorphic `as`-prop over component composition
**Decision:** Use the polymorphic `as`-prop for rendering flexibility  
**Alternatives considered:** Separate `ButtonLink` / `ButtonButton` variants, `asChild` (Radix pattern)  
**Rationale:** `as`-prop preserves the full TypeScript type of the target element, including required props. `asChild` (Radix's slot API) is more flexible but sacrifices TypeScript inference. Separate components `ButtonButton` + `ButtonLink` scale poorly — every new element type doubles the component count.  
**Trade-offs:** Complex TypeScript implementation (see conditional types above); worth it for the interview demonstration value and the DX it provides.

### ADR-004: Changesets over semantic-release or manual versioning
**Decision:** Changesets for release management  
**Alternatives considered:** semantic-release (commit message parsing), manual npm publish  
**Rationale:** Changesets are explicit — each PR contributor intentionally declares the change type. Semantic-release can silently bump major versions from a merge commit phrasing. Manual versioning is error-prone. Changesets also generate excellent per-package changelogs in a monorepo.

### ADR-005: Lazy-loaded icons over icon font or bundled SVGs
**Decision:** Dynamic `import()` per icon, bundled as individual SVG components  
**Alternatives considered:** Icon font (Tabler, FontAwesome), sprite sheet, bundled all SVGs  
**Rationale:** Icon fonts require loading the entire font file regardless of icons used. Sprite sheets are difficult to tree-shake. Bundling all SVGs in one file adds ~300KB to the library. Dynamic import means zero initial bundle cost — each icon is ~300 bytes, loaded on first render, cached forever.  
**Trade-offs:** First render of a new icon has a small network request. Mitigated by: preload hints for commonly used icons, and the fact that icon requests are parallelized.

---

## 16. Storybook Story Standards

Every component must have these story variants:

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    a11y: { config: { rules: [{ id: 'color-contrast', enabled: true }] } },
  },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost'] },
    size:    { control: 'select', options: ['sm', 'md', 'lg'] },
    isLoading: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { children: 'Primary button', variant: 'primary' } };
export const Secondary: Story = { args: { children: 'Secondary button', variant: 'secondary' } };
export const Ghost: Story = { args: { children: 'Ghost button', variant: 'ghost' } };
export const Loading: Story = { args: { children: 'Loading', isLoading: true } };
export const AsLink: Story = { args: { as: 'a', href: '#', children: 'Link button' } };
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};
export const DarkMode: Story = {
  parameters: { backgrounds: { default: 'dark' } },
  decorators: [(Story) => <div data-theme="dark"><Story /></div>],
  args: { children: 'Dark mode button' },
};
```

---

## 17. Resume Bullets (Final)

```
• Architected and published an open-source React + TypeScript component library (@yourusername/ui, 
  npm) with full WCAG 2.1 AA compliance across all interactive components — validated via 
  jest-axe (zero violations) and manual NVDA + VoiceOver testing.

• Engineered a polymorphic as-prop system using TypeScript conditional types and 
  ComponentPropsWithRef generics — zero any; TypeScript correctly narrows href as required 
  on <Button as="a">, with full intellisense for any HTML element or React component.

• Built a Figma → Style Dictionary → CSS custom properties token pipeline with semantic 
  dark-mode aliasing; consumers override brand tokens via CSS variable cascade without 
  forking the library. Generated TypeScript token types prevent arbitrary color string usage 
  at compile time.

• Integrated three AI developer tools (component generator, accessibility checker, theme 
  builder) using streaming LLM API — component generator validates generated JSX with 
  Babel parser before display; accessibility checker cites WCAG criterion + code fix.

• Set up Chromatic visual regression CI (per-story screenshots, PR diff), Playwright 
  component tests for complex ARIA flows (focus trap, keyboard wrap), and Changesets 
  automated semantic versioning + npm publish. Total library gzip < 80KB; individual 
  component tree-shaking verified via bundle analysis CI gate.
```

---

## 18. Interview Talking Points

**"Tell me about the hardest TypeScript problem you solved."**  
> "The polymorphic `as`-prop. The goal is: `<Button as="a" href="...">` renders an `<a>` with `href` correctly typed as required, but `<Button>` renders a `<button>` with no `href`. TypeScript has to infer the element type from the `as` prop and narrow all HTMLAttributes accordingly — including required props like `href` on anchors. The naive approach with `React.ComponentProps<typeof as>` loses the inference when you have your own props. I used a conditional type: `PolymorphicComponentProp` merges the custom props with `React.ComponentPropsWithoutRef<C>` using `Omit` to prevent key collisions, then wraps with `forwardRef` using a cast to preserve generics through the ref forwarding. Zero `any` in the implementation. I can walk through exactly why each type operator is necessary."

**"How did you handle accessibility for the Dialog component?"**  
> "Three separate problems. First, the focus trap: on open, you need to get all tabbable elements inside the dialog, store the currently focused element, move focus to the first tabbable element, and intercept Tab/Shift+Tab to wrap within the container. On close, restore focus to the stored element — without this, screen reader users lose their place in the document. That's WCAG 2.4.3. Second, scroll lock: when the dialog is open, the body scroll shouldn't move — I set `position: fixed` on body and store `window.scrollY` to restore on close. Third, the portal: the dialog content renders into `document.body` via a portal so it's never clipped by `overflow: hidden` ancestors. I tested all of this manually with NVDA on Chrome and VoiceOver on Safari."

**"How does your token pipeline work end-to-end?"**  
> "The source of truth is a tokens.json file that can be exported directly from Figma via the Figma Tokens plugin. It uses aliases — semantic tokens like `color.background.default` point to primitive tokens like `color.neutral.50`, which holds the actual hex value. Style Dictionary processes this file at build time. It resolves the aliases, then outputs three files: a CSS file with `:root` custom properties for light mode, a second CSS file with `[data-theme='dark']` selector overrides, and a TypeScript file with typed string constants. The TypeScript types ensure that if you rename a token in the JSON, every component that used the old name gets a compile error — you can't have a typo reach production."

---

## 19. Build Timeline

| Week | Milestone |
|------|-----------|
| 1 | Monorepo setup (pnpm workspaces), Vite library config, Storybook 8, TypeScript strict |
| 2 | Token pipeline: tokens.json → Style Dictionary → CSS vars + TypeScript types, dark mode |
| 3 | Tier 1 foundation: Button (polymorphic), Input, Label, Text, VisuallyHidden, Portal |
| 4 | Tier 1 continued: Icon lazy-load system, 50+ icons, axe-core tests for all Tier 1 |
| 5 | Tier 2 Dialog: focus trap, scroll lock, portal, ARIA dialog pattern, NVDA test |
| 6 | Tier 2 Select / Combobox: virtualized options, keyboard nav, screen reader test |
| 7 | Tier 2 Tooltip, Popover, Tabs, Accordion: ARIA patterns, Playwright tests |
| 8 | Tier 3 VirtualList (binary search), DataGrid (ARIA grid, sorting), CommandPalette (fuzzy search) |
| 9 | AI tools: Component Generator, Accessibility Checker, Theme Builder |
| 10 | Chromatic setup, visual regression baseline, Changesets, npm publish (`@yourusername/ui`) |
| 11 | CI/CD pipeline: lint → test → axe → chromatic → bundle analysis → auto-publish |
| 12 | Documentation (MDX pages, usage guides, ADRs), Storybook polish, public launch |

---

*Last updated: June 2026 · Built for senior frontend and frontend-platform roles at companies including Amazon, Microsoft, Capital One, and design-system-heavy product companies*
