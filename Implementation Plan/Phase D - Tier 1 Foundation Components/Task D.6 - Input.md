# Task D.6 — Input

**Phase:** D — Tier 1 Foundation Components  
**Blocked by:** C.1, D.4, B.4  
**Blocks:** E.4, E.7  
**Week:** 4  
**AI Skill to use:** `senior-frontend`

---

## 1. What I'm Building

An accessible text input component (`Input`) with custom sizes (sm, md, lg), focus border rings, validation handlers, helpers, and dynamic error state configurations, with strict type safety.

---

## 2. Architectural Decisions & Trade-offs

- **Selective Aria-invalid**: We only output `aria-invalid="true"` when an active error exists, leaving it undefined when valid. This reduces screen reader confusion on standard fields.
- **Explicit Describedby Linkage**: Linking helper and error text to the input via `aria-describedby` ensures screen readers read context updates when users focus the input field.

---

## 3. Implementation Plan & Approach

### 1. Create `packages/core/src/components/Input/Input.tsx`

Create the component:

```typescript
import * as React from 'react';
import { cn } from '../../utils/cn';
import { Label } from '../Label/Label';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, helperText, errorMessage, size = 'md', id, ...props }, ref) => {
    const defaultId = React.useId();
    const inputId = id ?? defaultId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    const hasError = !!errorMessage;
    const describedBy = cn(
      helperText && helperId,
      hasError && errorId
    ) || undefined;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && <Label htmlFor={inputId}>{label}</Label>}
        <input
          id={inputId}
          ref={ref}
          type={type}
          aria-describedby={describedBy}
          aria-invalid={hasError ? 'true' : undefined}
          className={cn(
            'flex w-full rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-transparent px-3 py-1 text-[var(--font-size-base)] shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--color-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            size === 'sm' && 'h-8 text-xs',
            size === 'md' && 'h-10 px-3 py-2',
            size === 'lg' && 'h-12 px-4 py-3 text-lg',
            hasError && 'border-[var(--color-status-error)] focus-visible:ring-[var(--color-status-error)]',
            className
          )}
          {...props}
        />
        {helperText && !hasError && (
          <p id={helperId} className="text-xs text-[var(--color-text-secondary)]">
            {helperText}
          </p>
        )}
        {hasError && (
          <p id={errorId} className="text-xs text-[var(--color-status-error)]">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
```

### 2. Update Barrel Exports

Export the component from `packages/core/src/index.ts`:

```typescript
export { Input } from './components/Input/Input';
export type { InputProps } from './components/Input/Input';
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Error Describedby Alignment**: Ensure that the input's `aria-describedby` lists the ID of both the helper text and error message if both are rendered. If you miss the ID mapping, the screen reader will not announce changes when the field is focused.
- **Auto-generated IDs**: Always use React's `useId` to generate fallback IDs for the elements so they remain stable across SSR hydration.

---

## 5. Definition of Done

- [ ] `Input` component is written.
- [ ] Export is accessible from packages root barrel.
- [ ] Error messages trigger `aria-invalid="true"`.
- [ ] Active error nodes link to inputs via matching `aria-describedby` attributes.
- [ ] Axe-core check verifies zero accessibility errors.

---

## 6. QA Test Scenarios

| Scenario                | Command                                                | Expected Result                                                                         |
| ----------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Verify rendering output | Mount `<Input label="Name" helperText="Input text" />` | HTML outputs a styled label and input containing `aria-describedby="input-id-helper"`.  |
| Verify error states     | Render input with `errorMessage="Required"`            | HTML renders error text, setting `aria-invalid="true"` and matching `aria-describedby`. |
| Verify input focus      | Focus the input field                                  | Focus outlines apply with appropriate custom variable ring colors.                      |

---

## 7. AI Code Loop Prompt

```
TASK: D.6 — Input

Create packages/core/src/components/Input/Input.tsx.
Ensure it uses React.forwardRef and integrates the Label component.
Support size variants (sm, md, lg) and customize error bounds.
If errorMessage is present, apply aria-invalid="true" and map aria-describedby to link input to error description text.
Create packages/core/src/components/Input/Input.test.tsx containing value validation checks, error linkage verifications, and an accessibility scan.
Update core index.ts to export Input and InputProps.
```
