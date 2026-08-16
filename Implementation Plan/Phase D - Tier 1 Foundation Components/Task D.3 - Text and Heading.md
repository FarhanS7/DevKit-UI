# Task D.3 — Text and Heading

**Phase:** D — Tier 1 Foundation Components  
**Blocked by:** C.1, C.2, B.4  
**Blocks:** Component typography layouts  
**Week:** 4  
**AI Skill to use:** `senior-frontend`, `frontend-design`

---

## 1. What I'm Building

Polymorphic visual typography components (`Text` and `Heading`) configured to map token scales to native tags, with strict compile-time type verification.

---

## 2. Architectural Decisions & Trade-offs

- **Decoupled Visual and Semantic Representation**: The tag rendered (e.g. `<h1>`, `<p>`) and the visual variant styles (e.g. `heading-xl`, `body-sm`) are decoupled. This enables developers to preserve semantic structures (like maintaining consecutive heading outline tags: h1 -> h2 -> h3) regardless of the design layout sizing rules.
- **Strict Color Token constraint**: Constraining color properties via `ColorToken` types imported from Phase B (`packages/tokens`) prevents arbitrary inline CSS overrides.

---

## 3. Implementation Plan & Approach

### 1. Create `packages/core/src/components/Text/Text.tsx`

Create a polymorphic `Text` component. Set up variant mappings using CVA:

```typescript
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import type { PolymorphicComponentPropWithRef, PolymorphicRef } from '../../utils/polymorphic';

export const textVariants = cva('font-sans', {
  variants: {
    variant: {
      body: 'text-[var(--font-size-base)] font-[var(--font-weight-normal)] leading-[var(--line-height-normal)] text-[var(--color-text-primary)]',
      'body-sm': 'text-[var(--font-size-sm)] font-[var(--font-weight-normal)] leading-[var(--line-height-normal)] text-[var(--color-text-secondary)]',
      label: 'text-[var(--font-size-sm)] font-[var(--font-weight-medium)] leading-[var(--line-height-tight)]',
      caption: 'text-[var(--font-size-xs)] font-[var(--font-weight-normal)] leading-[var(--line-height-normal)] text-[var(--color-text-secondary)]',
      code: 'font-mono text-[var(--font-size-sm)] font-[var(--font-weight-normal)] leading-[var(--line-height-relaxed)] bg-[var(--color-background-subtle)] p-0.5 rounded-sm',
    },
    truncate: {
      true: 'truncate block',
    },
  },
  defaultVariants: {
    variant: 'body',
  },
});

export type TextOwnProps = VariantProps<typeof textVariants> & {
  children?: React.ReactNode;
};

export type TextProps<C extends React.ElementType = 'p'> = PolymorphicComponentPropWithRef<C, TextOwnProps>;

type TextComponent = <C extends React.ElementType = 'p'>(
  props: TextProps<C>
) => React.ReactElement | null;

export const Text: TextComponent = React.forwardRef(
  <C extends React.ElementType = 'p'>(
    { as, variant, truncate, className, children, ...rest }: TextProps<C>,
    ref?: PolymorphicRef<C>
  ) => {
    const Component = as ?? 'p';
    return (
      <Component
        ref={ref}
        className={cn(textVariants({ variant, truncate }), className)}
        {...rest}
      >
        {children}
      </Component>
    );
  }
) as unknown as TextComponent;
```

### 2. Create `packages/core/src/components/Heading/Heading.tsx`

Create a polymorphic `Heading` component. Restrict the generic `as` prop selection to valid heading tags:

```typescript
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import type { PolymorphicComponentPropWithRef, PolymorphicRef } from '../../utils/polymorphic';

export const headingVariants = cva('font-sans tracking-tight text-[var(--color-text-primary)]', {
  variants: {
    variant: {
      'heading-xl': 'text-[var(--font-size-4xl)] font-[var(--font-weight-bold)] leading-[var(--line-height-tight)]',
      'heading-lg': 'text-[var(--font-size-3xl)] font-[var(--font-weight-semibold)] leading-[var(--line-height-tight)]',
      'heading-md': 'text-[var(--font-size-2xl)] font-[var(--font-weight-semibold)] leading-[var(--line-height-snug)]',
      'heading-sm': 'text-[var(--font-size-xl)] font-[var(--font-weight-semibold)] leading-[var(--line-height-snug)]',
    },
  },
  defaultVariants: {
    variant: 'heading-md',
  },
});

export type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type HeadingOwnProps = VariantProps<typeof headingVariants> & {
  children?: React.ReactNode;
};

export type HeadingProps<C extends HeadingTag = 'h1'> = PolymorphicComponentPropWithRef<C, HeadingOwnProps>;

type HeadingComponent = <C extends HeadingTag = 'h1'>(
  props: HeadingProps<C>
) => React.ReactElement | null;

export const Heading: HeadingComponent = React.forwardRef(
  <C extends HeadingTag = 'h1'>(
    { as, variant, className, children, ...rest }: HeadingProps<C>,
    ref?: PolymorphicRef<C>
  ) => {
    const Component = as ?? 'h1';
    return (
      <Component
        ref={ref}
        className={cn(headingVariants({ variant }), className)}
        {...rest}
      >
        {children}
      </Component>
    );
  }
) as unknown as HeadingComponent;
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Do not let TS compile standard props on invalid tags**: Ensure that passing heading-only props (like `as="a"`) on `Heading` triggers type compilation errors. Constraining `HeadingProps` generic parameters to `HeadingTag` instead of general `React.ElementType` protects tag outline integrity.
- **Tailwind class resolution**: Ensure CVA string property mappings match CSS variable bindings from the Style Dictionary output.

---

## 5. Definition of Done

- [ ] `Text` and `Heading` components are written.
- [ ] Export is accessible from packages root barrel.
- [ ] `Text` default renders as a `<p>` tag; `Heading` default renders as an `<h1>` tag.
- [ ] TypeScript checks flag illegal tags (like putting `as="div"` inside `<Heading>`) correctly.

---

## 6. QA Test Scenarios

| Scenario                | Command                                        | Expected Result                                               |
| ----------------------- | ---------------------------------------------- | ------------------------------------------------------------- |
| Verify rendering output | Mount `<Heading as="h3" variant="heading-xl">` | HTML outputs `<h3>` tag styled with heading-xl token classes. |
| Test invalid tags       | Try `<Heading as="div">` inside code file      | TypeScript flags generic compiler type constraint error.      |
| Test Text polymorphism  | Mount `<Text as="span">`                       | HTML outputs `<span>` inline block.                           |

---

## 7. AI Code Loop Prompt

```
TASK: D.3 — Text and Heading

Create packages/core/src/components/Text/Text.tsx and packages/core/src/components/Heading/Heading.tsx.
Use polymorphic type patterns from polymorphic.ts.
Define variants mapping to design system tokens using cva.
Constrain Heading tag parameters to h1-h6 tags.
Write Vitest test files Text.test.tsx and Heading.test.tsx asserting tag output matching, class assignments, and include type tests (.test-d.ts) confirming compilation rules.
Update core index.ts to re-export both components.
```
