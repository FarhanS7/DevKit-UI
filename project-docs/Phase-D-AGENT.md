# Phase D Agent Instructions — Tier 1 Foundation Components

> **Agent:** Read `AGENT-CONTEXT.md` fully before starting this file.
> **Goal:** Build the basic visual and markup components (VisuallyHidden, Portal, Text/Heading, Label, Button, Input, Icon) with 100% axe-core coverage, named exports, forwardRef, prop spreading, and class merging.
> **Commit target:** `feat(phase-D): Tier 1 Foundation Components — WCAG 2.1 AA`

---

## PHASE OVERVIEW

**What this phase produces:**
- `VisuallyHidden` — Screen-reader-only utility to clip layouts visually but retain screen reader parsing.
- `Portal` — Client-safe ReactDOM mounting port to avoid parent DOM overflow clipping.
- `Text` and `Heading` — Generic, CVA-powered typography wrappers supporting the polymorphic `as` prop.
- `Label` — HTML label mapping with `useId` integration for reliable field binding.
- `Button` — Polymorphic variant-driven trigger supporting primary, secondary, ghost, and destructive visuals, with loading and disabled states.
- `Input` — Form input handling label references, custom sizes, focus borders, and dynamic error state `aria-invalid` configurations.
- `Icon` — Asset wrapper using dynamic React.lazy imports and Suspense layout wrappers.
- Automated `axe-core` test suite extensions on every foundation component.

**Why this order matters:**
- Buttons and Inputs depend directly on `Text`, `Label`, `Portal`, and `VisuallyHidden`.
- Portal is needed for dropdown overlays, and VisuallyHidden is needed to announce button loading states.
- Setting up the `axe-core` Vitest runner gate at the end (D.8) verifies all 7 components in all states prior to merging.

**Skills to read first:**
- `.agents/skills/senior-frontend/SKILL.md`
- `.agents/skills/frontend-design/SKILL.md`

---

## TIER 1 ARCHITECTURE RULES

### 1. The React.forwardRef Rule
Every single component in this phase must use `React.forwardRef` and cleanly pass the ref to the underlying HTML element. 
```typescript
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  // ...
});
```

### 2. Barrel Exports Only
Export components only as named exports. Do not use `export default`. Update `packages/core/src/index.ts` to export the component and its types at the end of each task.

### 3. Merging classNames
Never override the `className` prop directly. Always merge it using the `cn()` utility built in Phase C:
```typescript
className={cn(buttonVariants({ variant, size }), className)}
```

---

## TASK EXECUTION SEQUENCE

---

### TASK D.1 — VisuallyHidden
**File:** `Implementation Plan/Phase D - Tier 1 Foundation Components/Task D.1 - VisuallyHidden.md`

- **Technical Spec:**
  Renders a `span` with an absolute positioning clip box.
- **Visual & Style Requirements:**
  ```css
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
  ```
- **Programmatic Verification:**
  - Test file: `VisuallyHidden.test.tsx`.
  - Assert that the visual element width and height are mock-computed to `1px` (or have the appropriate inline CSS properties applied).
  - Verify that the inner text is accessible and present in the DOM tree.
  - Run `pnpm test` and assert 0 axe violations.

---

### TASK D.2 — Portal
**File:** `Implementation Plan/Phase D - Tier 1 Foundation Components/Task D.2 - Portal.md`

- **Technical Spec:**
  Uses `ReactDOM.createPortal` to render children into a target DOM node (defaulting to `document.body`).
  Must use a client-mounting check (`mounted` state in `useEffect`) to avoid executing `document` logic during Server-Side Rendering (SSR) compilation.
- **API Definition:**
  ```typescript
  interface PortalProps {
    children: React.ReactNode;
    container?: HTMLElement | null; // Defaults to document.body
  }
  ```
- **Programmatic Verification:**
  - Test file: `Portal.test.tsx`.
  - Verify that mounting the Portal appends the children to `document.body` by default.
  - Verify that passing a custom container node ref appends the children to that custom node.
  - Run `pnpm test` and assert 0 compile errors during simulated SSR runs (disable browser env simulation).

---

### TASK D.3 — Text and Heading
**File:** `Implementation Plan/Phase D - Tier 1 Foundation Components/Task D.3 - Text and Heading.md`

- **Technical Spec:**
  Polymorphic components rendering typography. Renders `<p>` by default for `Text` and `<h1>` for `Heading`.
- **API & Styling Definition:**
  - Typography variants must map exactly to tokens generated in Phase B:
    - Text: `body` | `body-sm` | `label` | `caption` | `code`
    - Heading: `heading-xl` | `heading-lg` | `heading-md` | `heading-sm`
  - Constraints: `Heading`'s `as` prop is constrained to `'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'`. Text's `as` prop supports any `React.ElementType`.
- **Programmatic Verification:**
  - Test file: `Text.test.tsx` and `Heading.test.tsx`.
  - Verify that the rendered HTML tag matches the `as` prop (e.g. `<Heading as="h3">` renders an `<h3>` tag).
  - Type-level check: Verify that passing an invalid prop (like `<Heading as="div">`) triggers a TypeScript compiler error.
  - Run `pnpm typecheck` and verify 0 type errors.

---

### TASK D.4 — Label
**File:** `Implementation Plan/Phase D - Tier 1 Foundation Components/Task D.4 - Label.md`

- **Technical Spec:**
  An HTML `<label>` wrapper mapping typographic tokens. Integrated with React 18's `useId` to automate input bindings.
- **API Definition:**
  ```typescript
  interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    htmlFor?: string;
  }
  ```
- **Programmatic Verification:**
  - Test file: `Label.test.tsx`.
  - Verify that clicking the label triggers the focus handler on an input associated via `htmlFor`.
  - Verify that the element inherits typography styles from token classes (e.g., font size and weights).
  - Run `pnpm test` and assert 0 axe violations.

---

### TASK D.5 — Button
**File:** `Implementation Plan/Phase D - Tier 1 Foundation Components/Task D.5 - Button.md`

- **Technical Spec:**
  Polymorphic interactive element supporting primary, secondary, ghost, and destructive variants.
- **API & Style Definition:**
  ```typescript
  interface ButtonOwnProps {
    variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
  }
  ```
  - Default tag must be `'button'`, defaulting to `type="button"`.
- **Accessibility & State Mapping:**
  - When `isLoading` is true, apply `aria-busy="true"` and `disabled` to block interactions.
  - Hide visual loading spinner from screen readers using `aria-hidden="true"`, and render loading text wrapped in `VisuallyHidden`.
- **Programmatic Verification:**
  - Test file: `Button.test.tsx`.
  - Assert `type="button"` is set on the output button node.
  - Assert that click handlers do not fire when `isLoading` or `disabled` is active.
  - Verify polymorphic rendering: `<Button as="a" href="/target">` renders a valid anchor node.
  - Run `pnpm test` and assert 0 axe violations.

---

### TASK D.6 — Input
**File:** `Implementation Plan/Phase D - Tier 1 Foundation Components/Task D.6 - Input.md`

- **Technical Spec:**
  Accessible input component handling native types and error configurations.
- **API & Accessibility Specification:**
  ```typescript
  interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    helperText?: string;
    errorMessage?: string;
    size?: 'sm' | 'md' | 'lg';
  }
  ```
  - When `errorMessage` is passed, render it and link it to the input via `aria-describedby` (e.g. `aria-describedby="input-error-id"`).
  - Output `aria-invalid="true"` only when `errorMessage` is present, leaving it undefined when valid.
- **Programmatic Verification:**
  - Test file: `Input.test.tsx`.
  - Assert that an active error state renders the error message node and links the element via `aria-describedby`.
  - Assert that `aria-invalid="true"` is set on error, and is not present otherwise.
  - Verify focus styling overrides are applied when input is focused.

---

### TASK D.7 — Icon System
**File:** `Implementation Plan/Phase D - Tier 1 Foundation Components/Task D.7 - Icon System.md`

- **Technical Spec:**
  Dynamic SVG loader rendering SVG files asynchronously using `React.lazy` and `Suspense`.
- **Prop Constraints (Discriminated Union):**
  - An icon must compile with either `aria-hidden="true"` (for decorative uses) OR `aria-label="Description"` (for standalone icon buttons), but never neither.
  ```typescript
  type IconProps = {
    name: IconName;
    size?: number;
    className?: string;
  } & ({ 'aria-hidden': 'true' } | { 'aria-label': string });
  ```
- **Programmatic Verification:**
  - Test file: `Icon.test.tsx`.
  - Verify that the loader requests the SVG file lazily on mount.
  - Verify that TypeScript compilation blocks instances lacking both label and hidden settings.
  - Run `pnpm typecheck` to confirm type constraints.

---

### TASK D.8 — axe-core Test Setup
**File:** `Implementation Plan/Phase D - Tier 1 Foundation Components/Task D.8 - axe-core Test Setup.md`

- **Technical Spec:**
  Integrate `jest-axe` in Vitest to run automated audits on components during testing cycles.
- **Testing Script Setup:**
  Add a global helper or custom test utility to configure custom `axe` rules.
- **Programmatic Verification:**
  - Assert that running `pnpm test` triggers axe validations across all states (empty, active, focus, error, loading) for all Tier 1 components.
  - The build gate must fail if any component runs fail contrast or DOM validation rules.

---

## PHASE D COMPLETION PROTOCOL

### Run Final Phase Check
```bash
pnpm install
pnpm build:tokens
pnpm lint
pnpm typecheck
pnpm test
# Ensure Storybook runs without warning
pnpm --filter docs dev
```

### Create Walkthrough
Create a walkthrough file `Walkthroughs/Phase D - Tier 1 Foundation Components/Walkthrough.md` detailing:
1. Polymorphic type cast safety reasons.
2. How input fields associate labels and describe errors programmatically.
3. The lazy-loading footprint analysis showing SVG asset footprints are zero until rendered.

### Git Commit
```bash
git add .
git commit -m "feat(phase-D): Tier 1 Foundation Components — WCAG 2.1 AA

- VisuallyHidden, Portal, Text/Heading, Label, Button, Input, Icon
- Button: polymorphic as-prop, variant states, loading with aria-busy
- Input: error state associations with aria-describedby and selective aria-invalid
- Icon: lazy-loaded with React.lazy and Suspense layout fallbacks
- Full automated axe accessibility audits added to all component tests

Phase: D
Tasks: D.1, D.2, D.3, D.4, D.5, D.6, D.7, D.8
Tests: 24 unit | 16 axe | 0 e2e
Breaking: none"

git push origin dev
```

### Update Master Index
Open `00-MASTER-INDEX.md` and mark all Phase D tasks as ✅.

---

## WHAT RECRUITER SEES IN THIS COMMIT

A recruiter reviewing this commit sees:
- **"They design bulletproof APIs"** — using strict polymorphic generic constraints and discriminated unions prevents layout errors.
- **"They know web standards inside out"** — precise aria configurations and focus wrapping show true senior accessibility engineering capabilities.
- **"They protect code quality"** — integrating automated axe audits ensures components are accessible by default, not by configuration.
