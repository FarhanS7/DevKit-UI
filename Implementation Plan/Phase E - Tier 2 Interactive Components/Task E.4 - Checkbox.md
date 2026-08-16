# Task E.4 — Checkbox

**Phase:** E — Tier 2 Interactive Components  
**Blocked by:** C.1, D.4, B.4  
**Blocks:** Form controls  
**Week:** 7  
**AI Skill to use:** `senior-frontend`

---

## 1. What I'm Building

An accessible tri-state checkbox component (`Checkbox`) supporting unchecked, checked, and indeterminate (mixed) state configurations, with standard form submit capability.

---

## 2. Architectural Decisions & Trade-offs

- **WAI-ARIA Mixed State mapping**: Indeterminate checkbox states must be marked with `aria-checked="mixed"`. We avoid custom string descriptors to comply with screen reader standards.
- **Hidden Native Input Proxy**: Visual designs use custom divs for checkbox variants, but custom divs do not submit forms or trigger standard focus checks. We render a visually hidden native input element as a proxy to handle focus indicators and native form submits.

---

## 3. Implementation Plan & Approach

### 1. Create `packages/core/src/components/Checkbox/Checkbox.tsx`

Create the custom tri-state component:

```typescript
import * as React from 'react';
import { cn } from '../../utils/cn';

export type CheckedState = boolean | 'indeterminate';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'checked' | 'defaultChecked' | 'onChange'> {
  checked?: CheckedState;
  defaultChecked?: CheckedState;
  onCheckedChange?: (checked: CheckedState) => void;
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked: controlledChecked, defaultChecked = false, onCheckedChange, label, id, disabled, ...props }, ref) => {
    const [uncontrolledChecked, setUncontrolledChecked] = React.useState<CheckedState>(defaultChecked);
    const checked = controlledChecked ?? uncontrolledChecked;
    const isIndeterminate = checked === 'indeterminate';
    const isChecked = checked === true;

    const defaultId = React.useId();
    const checkboxId = id ?? defaultId;
    const innerRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    React.useEffect(() => {
      if (innerRef.current) {
        innerRef.current.indeterminate = isIndeterminate;
      }
    }, [isIndeterminate]);

    const handleToggle = () => {
      if (disabled) return;

      let nextChecked: CheckedState;
      if (isIndeterminate) {
        nextChecked = true;
      } else {
        nextChecked = !checked;
      }

      if (controlledChecked === undefined) {
        setUncontrolledChecked(nextChecked);
      }
      onCheckedChange?.(nextChecked);
    };

    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          role="checkbox"
          id={`${checkboxId}-button`}
          aria-checked={isIndeterminate ? 'mixed' : isChecked}
          aria-disabled={disabled ? 'true' : undefined}
          disabled={disabled}
          onClick={handleToggle}
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[var(--color-interactive-default)] data-[state=checked]:border-[var(--color-interactive-default)] data-[state=checked]:text-[var(--color-text-inverse)] data-[state=indeterminate]:bg-[var(--color-interactive-default)] data-[state=indeterminate]:border-[var(--color-interactive-default)] data-[state=indeterminate]:text-[var(--color-text-inverse)]',
            className
          )}
          data-state={isIndeterminate ? 'indeterminate' : isChecked ? 'checked' : 'unchecked'}
        >
          {isChecked && (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          )}
          {isIndeterminate && (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
            </svg>
          )}
        </button>

        {/* Hidden native input for native form accessibility */}
        <input
          ref={innerRef}
          type="checkbox"
          id={checkboxId}
          checked={isChecked}
          disabled={disabled}
          onChange={() => {}}
          tabIndex={-1}
          className="sr-only"
          {...props}
        />

        {label && (
          <label
            htmlFor={`${checkboxId}-button`}
            className={cn(
              'text-[var(--font-size-sm)] font-[var(--font-weight-medium)] leading-[var(--line-height-tight)] text-[var(--color-text-primary)] select-none',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
```

### 2. Update Barrel Exports

Export the component from `packages/core/src/index.ts`:

```typescript
export { Checkbox } from './components/Checkbox/Checkbox';
export type { CheckboxProps, CheckedState } from './components/Checkbox/Checkbox';
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Tri-State toggles**: Clicking an indeterminate checkbox should resolve to the checked state, while subsequent clicks toggle between unchecked and checked.
- **Indeterminate DOM property**: In HTML, indeterminate is a DOM element _property_ (`element.indeterminate = true`), not an HTML attribute. It must be set programmatically using a React ref.

---

## 5. Definition of Done

- [ ] `Checkbox` component is written.
- [ ] Export is accessible from packages root barrel.
- [ ] Mixed state sets button's `aria-checked="mixed"`.
- [ ] Focus and spacebar activations toggle selections correctly.
- [ ] Axe-core check has 0 violations.

---

## 6. QA Test Scenarios

| Scenario                | Command                            | Expected Result                                                       |
| ----------------------- | ---------------------------------- | --------------------------------------------------------------------- |
| Verify rendering output | Mount `<Checkbox label="Agree" />` | HTML renders checkbox button and labels.                              |
| Test indeterminate      | Set `checked="indeterminate"`      | Checkbox button outputs `aria-checked="mixed"` containing dash icons. |
| Test Toggle             | Click indeterminate element        | Selection updates, triggering `onCheckedChange(true)`.                |

---

## 7. AI Code Loop Prompt

```
TASK: E.4 — Checkbox

Create packages/core/src/components/Checkbox/Checkbox.tsx.
Support controlled and uncontrolled modes for checked, defaultChecked, and indeterminate states.
Configure buttons with role="checkbox", mapping indeterminate to aria-checked="mixed" and visual dash icons.
Render a visually hidden input element (sr-only) synced via React.useImperativeHandle ref forwarding.
Create Checkbox.test.tsx containing tri-state click toggling checks, spacebar triggers, label bindings, and an accessibility scan.
Update core index.ts to export Checkbox.
```
