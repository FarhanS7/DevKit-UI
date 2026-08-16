# Task D.4 — Label

**Phase:** D — Tier 1 Foundation Components  
**Blocked by:** C.1  
**Blocks:** D.5, D.6  
**Week:** 4  
**AI Skill to use:** `senior-frontend`

---

## 1. What I'm Building

An accessible text label wrapper component (`Label`) that binds metadata titles to input elements using standard HTML focus triggers, with strict type safety.

---

## 2. Architectural Decisions & Trade-offs

- **React useId Integration**: Using React 18's `useId` provides unique, deterministic identifiers that match across server rendering and client hydration. This avoids console hydration warning mismatches.
- **Strict Element Attributes**: Inheriting `React.LabelHTMLAttributes<HTMLLabelElement>` allows the element to pass standard triggers (like `htmlFor`) to associated elements naturally.

---

## 3. Implementation Plan & Approach

### 1. Create `packages/core/src/components/Label/Label.tsx`

Create the component using `React.forwardRef` and design system layout classes:

```typescript
import * as React from 'react';
import { cn } from '../../utils/cn';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'text-[var(--font-size-sm)] font-[var(--font-weight-medium)] leading-[var(--line-height-tight)] text-[var(--color-text-primary)] select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          className
        )}
        {...props}
      />
    );
  }
);

Label.displayName = 'Label';

export { Label };
```

### 2. Update Barrel Exports

Export the component from `packages/core/src/index.ts`:

```typescript
export { Label } from './components/Label/Label';
export type { LabelProps } from './components/Label/Label';
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Click-to-Focus trigger**: Clicking a label element must move the text insertion cursor focus to the associated input field. Ensure `htmlFor` targets the input's literal ID, not its name.
- **Avoid Math.random()**: Never use random string generations inside hydration loops, as this breaks screen reader accessibility tracking when server outputs mismatch client renders.

---

## 5. Definition of Done

- [ ] `Label` component is written.
- [ ] Export is accessible from packages root barrel.
- [ ] Clicking on the label moves focus to the target associated input field.
- [ ] Hydration checks run without warnings or mismatch errors.

---

## 6. QA Test Scenarios

| Scenario                   | Command                                                                            | Expected Result                                                  |
| -------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Verify rendering           | Mount in test suite                                                                | Renders as a `<label>` tag with correct class list styles.       |
| Focus Trigger Verification | Render `<Label htmlFor="input-id">` beside `<input id="input-id">` and click label | Click successfully moves cursor focus inside the input element.  |
| Axe accessibility check    | Run axe check on label                                                             | Label returns 0 violations (asserting correct link descriptors). |

---

## 7. AI Code Loop Prompt

```
TASK: D.4 — Label

Create packages/core/src/components/Label/Label.tsx.
Ensure it extends React.LabelHTMLAttributes and merges classNames using cn().
Apply spacing and font sizing styles using design system token custom variables.
Create packages/core/src/components/Label/Label.test.tsx containing click-to-focus triggers and axe accessibility validation tests.
Update core index.ts to export Label and LabelProps.
```
