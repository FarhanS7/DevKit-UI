# Task D.5 — Button

**Phase:** D — Tier 1 Foundation Components  
**Blocked by:** C.1, C.2, B.4  
**Blocks:** D.6, E.1–E.8, F.2, G.4  
**Week:** 4  
**AI Skill to use:** `senior-frontend`, `frontend-design`

---

## 1. What I'm Building

The primary polymorphic button component (`Button`) with variant controls (primary, secondary, ghost, destructive), sizes (sm, md, lg), and loading/disabled state handlers, with strict type safety.

---

## 2. Architectural Decisions & Trade-offs

- **Button Type Defaulting**: Defaulting the tag type to `button` instead of defaulting to forms' submit actions prevents accidental form submissions inside layouts.
- **Aria-busy Indicator**: Using `aria-busy="true"` and disabling interactions during loading states blocks clicks while announcing the active processing status to screen readers.
- **Icon Margins**: Conditionally rendering icon margins ensures spacing stays correct when only icons are rendered (icon-only button triggers).

---

## 3. Implementation Plan & Approach

### 1. Create `packages/core/src/components/Button/Button.tsx`

Create the polymorphic component:

```typescript
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import type { PolymorphicComponentPropWithRef, PolymorphicRef } from '../../utils/polymorphic';

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-md)] text-[var(--font-size-sm)] font-[var(--font-weight-medium)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--color-interactive-default)] text-[var(--color-text-inverse)] hover:bg-[var(--color-interactive-hover)] active:bg-[var(--color-interactive-active)]',
        secondary: 'border border-[var(--color-border-default)] bg-transparent hover:bg-[var(--color-background-subtle)] active:bg-[var(--color-border-default)] text-[var(--color-text-primary)]',
        ghost: 'hover:bg-[var(--color-background-subtle)] text-[var(--color-text-primary)] active:bg-[var(--color-border-default)]',
        destructive: 'bg-[var(--color-status-error)] text-[var(--color-text-inverse)] hover:bg-[var(--color-status-error)] hover:opacity-90 active:opacity-100',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 px-8 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonOwnProps extends VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export type ButtonProps<C extends React.ElementType = 'button'> = PolymorphicComponentPropWithRef<C, ButtonOwnProps>;

type ButtonComponent = <C extends React.ElementType = 'button'>(
  props: ButtonProps<C>
) => React.ReactElement | null;

export const Button: ButtonComponent = React.forwardRef(
  <C extends React.ElementType = 'button'>(
    { as, variant, size, isLoading, leftIcon, rightIcon, className, children, disabled, ...rest }: ButtonProps<C>,
    ref?: PolymorphicRef<C>
  ) => {
    const Component = as ?? 'button';
    const isButton = Component === 'button';

    // Default to type="button" on native buttons
    const extraProps = isButton ? { type: 'button' } : {};
    const isDisabled = disabled || isLoading;

    return (
      <Component
        ref={ref}
        disabled={isDisabled}
        aria-busy={isLoading ? 'true' : undefined}
        className={cn(buttonVariants({ variant, size }), className)}
        {...extraProps}
        {...rest}
      >
        {isLoading && (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
        )}
        {!isLoading && leftIcon && <span className="mr-2 inline-flex" aria-hidden="true">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2 inline-flex" aria-hidden="true">{rightIcon}</span>}
      </Component>
    );
  }
) as unknown as ButtonComponent;
```

### 2. Update Barrel Exports

Export the component from `packages/core/src/index.ts`:

```typescript
export { Button } from './components/Button/Button';
export type { ButtonProps } from './components/Button/Button';
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Explicit Type default**: When rendering a button inside a `<form>` layout, unless `type="button"` is set, the browser defaults to `type="submit"`. Ensure that native button elements explicitly configure `type="button"`.
- **Keyboard accessibility**: Anchor links (`as="a"`) styled as buttons must support `Space` key triggers to comply with WCAG recommendations.

---

## 5. Definition of Done

- [ ] `Button` component is implemented in core.
- [ ] Render default matches an HTML button tag with `type="button"`.
- [ ] Active loading displays spinner and applies `aria-busy="true"`.
- [ ] Renders as custom tags when using the `as` prop parameter.
- [ ] Axe-core check verifies zero accessibility errors.

---

## 6. QA Test Scenarios

| Scenario                 | Command                                                | Expected Result                                    |
| ------------------------ | ------------------------------------------------------ | -------------------------------------------------- |
| Verify rendering output  | Mount `<Button>`                                       | HTML outputs `<button type="button" class="...">`. |
| Verify disabled click    | Mount `<Button disabled onClick={handler}>` and click  | Click handler does not trigger.                    |
| Verify loading click     | Mount `<Button isLoading onClick={handler}>` and click | Click handler does not trigger, spinner visible.   |
| Test anchor polymorphism | Mount `<Button as="a" href="/target">`                 | HTML outputs `<a>` tag with href attributes.       |

---

## 7. AI Code Loop Prompt

```
TASK: D.5 — Button

Create packages/core/src/components/Button/Button.tsx.
Use React.forwardRef and polymorphic typings from polymorphic.ts.
Map visual options (variant, size) using class-variance-authority.
Setup loading states mapping to spinner icons and applying aria-busy rules.
Create packages/core/src/components/Button/Button.test.tsx containing click validation tests, loading checks, polymorphic render tests, and a jest-axe accessibility scan.
Update core index.ts to export Button and ButtonProps.
```
