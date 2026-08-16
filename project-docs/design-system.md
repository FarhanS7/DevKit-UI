# Design System — Visual Language & Component API Specification

> **This document defines:** The complete visual language of `@yourusername/ui`. Every color, spacing value, typography scale, animation, and component API variant. It is the single source of truth for "what does this design system look like and how do you use it."  
> **Relationship to tokens:** `database-schema.md` defines the token *data model*. This document defines *how those tokens are applied* to create a coherent visual language.

---

## 1. Design Philosophy

### Core Principles

1. **Accessible by default, not by configuration.** WCAG 2.1 AA compliance is built into the component — consumers shouldn't have to think about it.
2. **Tokens, not values.** No component ever hardcodes a color, spacing value, or font size. Every visual property is a CSS custom property reference.
3. **Composition over configuration.** Prefer composing small, focused components over adding more props to a large component. A `<FormField>` is `<Label>` + `<Input>` + error text, not a single component with 20 props.
4. **Predictable APIs.** Every interactive component supports `value`/`defaultValue` (controlled/uncontrolled), every component forwards its ref, every component merges `className`.

### Design Language

**Aesthetic target:** Clean, professional, and modern. Inspired by Linear, Vercel, and Radix Themes. Not flashy — precise. The kind of design system you'd find at a company that takes engineering seriously.

**Color personality:** Indigo as brand — authoritative but not aggressive. Warm neutrals — approachable. Status colors — clear and accessible (not relying on color alone).

---

## 2. Color System

### Brand Colors

| Token Name | CSS Variable | Value | Usage |
|---|---|---|---|
| `color.interactive.default` | `--color-interactive-default` | `#6366f1` (Indigo 500) | Primary buttons, links, active states |
| `color.interactive.hover` | `--color-interactive-hover` | `#4f46e5` (Indigo 600) | Hover states on interactive elements |
| `color.interactive.active` | `--color-interactive-active` | `#4338ca` (Indigo 700) | Pressed/active states |

### Semantic Color Mapping

| Semantic Intent | Light Mode | Dark Mode | CSS Variable |
|---|---|---|---|
| **Page background** | White (`#ffffff`) | Near-black (`#0f0f10`) | `--color-background-default` |
| **Card/panel background** | Off-white (`#fafafa`) | Dark gray (`#1a1a1b`) | `--color-background-subtle` |
| **Primary text** | Dark gray (`#171717`) | Near-white (`#fafafa`) | `--color-text-primary` |
| **Secondary text** | Medium gray (`#525252`) | Light gray (`#a3a3a3`) | `--color-text-secondary` |
| **Disabled text** | Light gray (`#a3a3a3`) | Dim gray (`#525252`) | `--color-text-disabled` |
| **Default border** | Light gray (`#e5e5e5`) | Dark border (`#262626`) | `--color-border-default` |
| **Strong border** | Medium gray (`#a3a3a3`) | Dark border (`#404040`) | `--color-border-strong` |
| **Focus ring** | Indigo (`#6366f1`) | Indigo (`#6366f1`) | `--color-border-focus` |

### Status Colors

| Status | Background Token | Foreground Token | Usage |
|---|---|---|---|
| **Success** | `--color-status-success-background` | `--color-status-success` | Success messages, valid states |
| **Warning** | `--color-status-warning-background` | `--color-status-warning` | Caution messages, warnings |
| **Error** | `--color-status-error-background` | `--color-status-error` | Error states, validation failures |
| **Info** | `--color-status-info-background` | `--color-status-info` | Informational messages |

### Accessibility: Color Contrast Ratios

All text/background combinations must meet WCAG 2.1 AA:

| Text Token | Background Token | Contrast Ratio | Passes AA? |
|---|---|---|---|
| `--color-text-primary` | `--color-background-default` | 15.8:1 | ✅ (AAA) |
| `--color-text-secondary` | `--color-background-default` | 7.0:1 | ✅ (AA) |
| `--color-text-disabled` | `--color-background-default` | 3.0:1 | ⚠️ AA exception (disabled text is exempt from contrast requirements per WCAG 1.4.3) |
| `--color-text-inverse` (white) | `--color-interactive-default` | 4.6:1 | ✅ (AA) |

---

## 3. Typography System

### Type Scale

| Token | Size | Usage |
|---|---|---|
| `--font-size-xs` | 12px | Captions, helper text, labels on dense UIs |
| `--font-size-sm` | 14px | UI labels, metadata, secondary content |
| `--font-size-base` | 16px | Body text, default text size |
| `--font-size-lg` | 18px | Large body text, intro paragraphs |
| `--font-size-xl` | 20px | Small headings, card titles |
| `--font-size-2xl` | 24px | Page section headings (h3 visual size) |
| `--font-size-3xl` | 30px | Major section headings (h2 visual size) |
| `--font-size-4xl` | 36px | Page title (h1 visual size) |

### Font Weight Scale

| Token | Value | Usage |
|---|---|---|
| `--font-weight-normal` | 400 | Body text |
| `--font-weight-medium` | 500 | UI labels, slightly emphasized text |
| `--font-weight-semibold` | 600 | Headings, buttons, interactive labels |
| `--font-weight-bold` | 700 | Strong emphasis, marketing headings |

### Line Height Scale

| Token | Value | Usage |
|---|---|---|
| `--line-height-tight` | 1.25 | Headings (compact) |
| `--line-height-snug` | 1.375 | Short paragraphs |
| `--line-height-normal` | 1.5 | Body text (default) |
| `--line-height-relaxed` | 1.625 | Long-form reading content |

### Font Families

```css
--font-family-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-family-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
```

**Why Inter:** Designed for screen readability. Excellent metrics for UI (compact, legible at small sizes). Free, widely used in design tools, available on Google Fonts.

### Predefined Text Variants

The `<Text>` component maps variant names to token combinations:

| Variant | Font Size | Font Weight | Line Height | Usage |
|---|---|---|---|---|
| `body` | `base` (16px) | `normal` (400) | `normal` (1.5) | Default body text |
| `body-sm` | `sm` (14px) | `normal` (400) | `normal` (1.5) | Smaller body text |
| `label` | `sm` (14px) | `medium` (500) | `tight` (1.25) | Form labels, UI labels |
| `caption` | `xs` (12px) | `normal` (400) | `normal` (1.5) | Captions, helper text |
| `heading-xl` | `4xl` (36px) | `bold` (700) | `tight` (1.25) | Page titles (h1) |
| `heading-lg` | `3xl` (30px) | `semibold` (600) | `tight` (1.25) | Section headings (h2) |
| `heading-md` | `2xl` (24px) | `semibold` (600) | `snug` (1.375) | Sub-section headings (h3) |
| `heading-sm` | `xl` (20px) | `semibold` (600) | `snug` (1.375) | Card headings (h4) |
| `code` | `sm` (14px) | `normal` (400) | `relaxed` (1.625) | Inline code, monospace |

---

## 4. Spacing System

**Principle:** 4px grid. All spacing values are multiples of 4.

| Token | Value | Usage |
|---|---|---|
| `--spacing-1` | 4px | Icon gaps, micro-spacing |
| `--spacing-2` | 8px | Compact element padding, icon-to-text gap |
| `--spacing-3` | 12px | Tight element padding |
| `--spacing-4` | 16px | Standard element padding (default) |
| `--spacing-5` | 20px | Comfortable padding |
| `--spacing-6` | 24px | Section padding, card padding |
| `--spacing-8` | 32px | Large element spacing |
| `--spacing-10` | 40px | Section gaps |
| `--spacing-12` | 48px | Large section gaps |
| `--spacing-16` | 64px | Page-level spacing |

**Applied to components:**

| Component | Padding |
|---|---|
| Button `sm` | 8px (top/bottom), 12px (left/right) |
| Button `md` | 10px (top/bottom), 16px (left/right) |
| Button `lg` | 12px (top/bottom), 20px (left/right) |
| Input | 10px (top/bottom), 12px (left/right) |
| Card | 24px all sides |
| Dialog | 24px padding, 16px header/footer padding |

---

## 5. Shape & Elevation System

### Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-none` | 0px | Square elements, table cells |
| `--radius-sm` | 4px | Badges, tags, small elements |
| `--radius-md` | 8px | Buttons, inputs, cards (default) |
| `--radius-lg` | 12px | Dialogs, popovers, large cards |
| `--radius-xl` | 16px | Modals, large panels |
| `--radius-full` | 9999px | Pills, avatar circles, switch thumb |

### Elevation / Shadow Scale

| Token | Value | Usage |
|---|---|---|
| `--shadow-none` | `none` | Flat elements |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift, focused inputs |
| `--shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1)` | Cards, dropdowns |
| `--shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1)` | Dialogs, modals |
| `--shadow-xl` | `0 20px 25px -5px rgba(0,0,0,0.1)` | Floating elements, tooltips |

---

## 6. Component API Specification

### Component API Contracts (Rules That Apply to Every Component)

```typescript
// Every component: these props always work
interface UniversalComponentProps {
  className?: string;          // Merged via cn(), not overwritten
  'data-testid'?: string;      // Passes through via ...rest
  ref?: React.Ref<Element>;    // Always forwarded via React.forwardRef
  // ...all native HTML attributes for the underlying element
}
```

### Button

**Purpose:** Primary interactive element. Most fundamental component in the library.

```typescript
interface ButtonOwnProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Polymorphic — can render as any element
type ButtonProps<C extends React.ElementType = 'button'> =
  PolymorphicComponentPropWithRef<C, ButtonOwnProps>;
```

| Variant | Visual | Usage |
|---|---|---|
| `primary` | Filled indigo background, white text | Main actions, submit buttons |
| `secondary` | Outlined with border, transparent background | Secondary actions |
| `ghost` | No border, no background (visible on hover only) | Tertiary actions, toolbar buttons |
| `destructive` | Red filled background | Delete, irreversible actions |

| Size | Height | Font Size | Use Case |
|---|---|---|---|
| `sm` | 32px | 14px | Dense UIs, table actions |
| `md` | 40px | 14px | Default size |
| `lg` | 48px | 16px | Prominent CTAs |

**ARIA:** `type="button"` default. `aria-busy="true"` + `disabled` when `isLoading`. Spinner is `aria-hidden="true"`. Loading text "Loading..." is `<VisuallyHidden>`.

### Input

**Purpose:** Text entry. Supports all text-like input types.

```typescript
// Discriminated union — type-safe props per input type
type InputProps =
  | ({ type: 'text' | 'email' | 'url' | 'tel' | 'search' | 'password' } & TextInputProps)
  | ({ type: 'number' } & NumberInputProps);  // number adds min, max, step

interface CommonInputProps {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
```

**ARIA:** `aria-invalid="true"` only when there's an error (never explicit `false`). Error message linked via `aria-describedby`. Label linked via `htmlFor` (explicit ID) or `aria-labelledby` (auto-generated ID via `useId`).

### Text & Heading

**Purpose:** Typography primitives. Polymorphic — semantic HTML independent of visual appearance.

```typescript
interface TextProps {
  variant?: 'body' | 'body-sm' | 'label' | 'caption' | 'code';
  color?: ColorToken;        // Only valid token values (TypeScript-enforced)
  truncate?: boolean;        // Single-line truncation with ellipsis
  as?: React.ElementType;    // Default: <p>
}

interface HeadingProps {
  variant?: 'heading-xl' | 'heading-lg' | 'heading-md' | 'heading-sm';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';  // Constrained: headings only
  // Key insight: visual variant (size) is decoupled from semantic element
  // <Heading as="h3" variant="heading-xl"> renders an h3 that LOOKS like h1
  // This is required for correct document outline + accessible heading hierarchy
}
```

### Dialog (Compound Component)

**Purpose:** Accessible modal dialog with focus trap, scroll lock, and ARIA.

```typescript
// Usage API — compound component pattern
<Dialog>
  <Dialog.Trigger asChild>
    <Button>Open Dialog</Button>
  </Dialog.Trigger>
  <Dialog.Content aria-describedby="description-id">
    <Dialog.Title>Dialog Title</Dialog.Title>
    <p id="description-id">Dialog description.</p>
    <Dialog.Close>Close</Dialog.Close>
  </Dialog.Content>
</Dialog>

// Props
interface DialogProps {
  open?: boolean;                      // Controlled
  defaultOpen?: boolean;               // Uncontrolled
  onOpenChange?: (open: boolean) => void;
}

interface DialogContentProps {
  onEscapeKeyDown?: (e: KeyboardEvent) => void;
  onInteractOutside?: (e: Event) => void;  // Click backdrop
}
```

**ARIA:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to `Dialog.Title`. Focus trap active when open. Scroll locked. Focus restored to trigger on close.

### Checkbox (Tri-State)

```typescript
type CheckedState = boolean | 'indeterminate';

interface CheckboxProps {
  checked?: CheckedState;
  defaultChecked?: CheckedState;
  onCheckedChange?: (checked: CheckedState) => void;
  isDisabled?: boolean;
  isRequired?: boolean;
  // Must pair with a <Label> or provide aria-label
}
```

**ARIA:** `aria-checked="true"`, `aria-checked="false"`, or `aria-checked="mixed"` (for indeterminate). **Never `aria-checked="undefined"`** — this is the most common Checkbox ARIA mistake.

### Tabs

```typescript
// Usage API — Radix-based
<Tabs defaultValue="tab1">
  <Tabs.List>
    <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
    <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="tab1">Content 1</Tabs.Content>
  <Tabs.Content value="tab2">Content 2</Tabs.Content>
</Tabs>

interface TabsProps {
  value?: string;          // Controlled
  defaultValue?: string;   // Uncontrolled (required if uncontrolled)
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  activationMode?: 'automatic' | 'manual';  // Focus follows tab vs requires Enter
}
```

**Keyboard:** Arrow Left/Right (horizontal) or Up/Down (vertical) to move between tabs. Tab key moves focus to the active panel content.

### VirtualList (DSA Component)

```typescript
interface VirtualListProps<T> {
  items: T[];
  itemHeight: number | ((index: number) => number);  // Fixed or variable height
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;         // Extra items above/below viewport (default: 3)
  onScroll?: (scrollTop: number) => void;
  'data-virtual-item'?: string;  // Attribute on rendered items (for testing)
}
```

**DSA:** Binary search on prefix-sum array for O(log n) visible range calculation. ResizeObserver for container height changes.

### CommandPalette (DSA Component)

```typescript
interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder?: string;
  onSelect?: (value: string) => void;
  children: React.ReactNode;
}

interface CommandGroupProps {
  heading?: string;
  children: React.ReactNode;
}

interface CommandItemProps {
  value: string;           // Used for filtering and selection
  keywords?: string[];     // Additional search terms beyond the label text
  disabled?: boolean;
  onSelect?: (value: string) => void;
  children: React.ReactNode;
}

// Usage:
<CommandPalette open={open} onOpenChange={setOpen}>
  <CommandGroup heading="Pages">
    <CommandItem value="home" keywords={['index', 'start']}>Home</CommandItem>
    <CommandItem value="settings">Settings</CommandItem>
  </CommandGroup>
</CommandPalette>
```

**DSA:** Trigram fuzzy search — O(n log n) per query. Scores each item, filters below threshold 0.2, sorts by descending score.

---

## 7. Animation & Motion System

### Motion Philosophy

**Default state: no animations.** All animations are wrapped in `@media (prefers-reduced-motion: no-preference)`. This inverts the typical pattern (animations on by default, reduced motion as an override) — here, reduced motion is the default, which is a stronger WCAG compliance stance.

```css
/* Default: no animation (reduced motion first) */
.dialog-overlay {
  opacity: 0;
  /* No transition by default */
}

/* Only animate if user has NOT requested reduced motion */
@media (prefers-reduced-motion: no-preference) {
  .dialog-overlay {
    transition: opacity 150ms ease;
  }
  .dialog-overlay[data-state="open"] {
    opacity: 1;
  }
}
```

### Animation Tokens (Future — Not in v1 Token Schema)

For documentation purposes, here is the planned animation token structure:

| Token | Value | Usage |
|---|---|---|
| `--duration-fast` | `100ms` | Micro-interactions (hover state changes) |
| `--duration-normal` | `150ms` | Most UI transitions (open/close) |
| `--duration-slow` | `300ms` | Complex animations (page transitions) |
| `--easing-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Most transitions |
| `--easing-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful, bouncy interactions |

**Why deferred to v2:** Animation tokens add schema complexity. The v1 goal is zero accessibility violations and zero hardcoded values — animation refinement is a polish concern.

---

## 8. Dark Mode Design Decisions

### Toggle Mechanism

```typescript
// Recommended consumer implementation:
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### What Dark Mode Changes

1. **Backgrounds** — inverted (white → near-black).
2. **Text** — inverted (near-black → near-white).
3. **Borders** — adjusted for contrast on dark surfaces.

### What Dark Mode Does NOT Change

1. **Brand/interactive colors** — Indigo remains Indigo. Consistency of brand identity across themes.
2. **Status colors** — Error red, success green, warning amber. These are semantically meaningful and universally understood.
3. **Focus rings** — Always indigo, always visible.

### Icon Handling in Dark Mode

Icons use `currentColor` for their SVG fill/stroke. This means they automatically inherit the text color of their parent element — no token reference needed in the icon itself, and dark mode works automatically.

---

## 9. Storybook Story Standards

Every component must have stories covering these variants (per PRD §16):

| Story Name | What It Shows |
|---|---|
| `Default` | Component in its default state, no required props |
| `AllVariants` | All `variant` prop values in a grid |
| `AllSizes` | All `size` prop values |
| `Loading` / `Disabled` | State-based variants |
| `AsLink` | Polymorphic rendering (for applicable components) |
| `DarkMode` | Component in `[data-theme="dark"]` context |
| `WithError` | Error state (for form components) |
| `KeyboardOnly` | Description of keyboard interaction (static story with docs) |
| `ScreenReaderAnnouncement` | Description of what is announced (docs only) |

**Story file template:**
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@yourusername/ui';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select' },
    size: { control: 'select' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: { children: 'Click me' },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
};
```

---

## 10. Accessibility Design Rules

These rules are design decisions (visual), not just implementation notes:

| Rule | Why It's a Design Decision |
|---|---|
| **Focus ring: 3px solid, 2px offset** | The 2px offset creates visual separation from the element. 3px width ensures 3:1 contrast ratio with both white and dark backgrounds per WCAG 1.4.11. |
| **Minimum touch target: 44×44px** | WCAG 2.5.5 Success Criterion. Small buttons (32px height) get invisible touch target padding to meet this. |
| **Color is never the only signal** | Error states always have both color AND an icon or text. This is a design constraint enforced by the component API (not just a code choice). |
| **Icon-only buttons require `aria-label`** | TypeScript enforcement: if `children` is empty and `aria-label` is absent, it's a type error. Design and code are aligned. |
| **Disabled elements retain visual affordance** | Disabled opacity is 40% (not 10% which would be invisible). Contrast ratio for disabled text is exempt from WCAG, but the element must still be identifiable as the disabled version of the active element. |

---

*The design system is complete when every pixel is from a token and every interaction is keyboard-accessible. These are not stretch goals — they are the definition of done.*
