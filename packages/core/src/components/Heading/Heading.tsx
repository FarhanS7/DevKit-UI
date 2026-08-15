import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn.js';
import type { PolymorphicForwardRefComponent } from '../../utils/polymorphic.js';

/**
 * CVA variant definitions for the Heading component.
 * Each variant maps directly to design-system token CSS custom properties.
 *
 * Uses `[font-size:...]` / `[font-weight:...]` / `[line-height:...]` syntax
 * instead of `font-[...]` to avoid tailwind-merge conflicts.
 */
export const headingVariants = cva(
  '[font-family:var(--font-family-sans)] tracking-tight text-[var(--color-text-primary)]',
  {
    variants: {
      variant: {
        'heading-xl':
          '[font-size:var(--font-size-4xl)] [font-weight:var(--font-weight-bold)] [line-height:var(--line-height-tight)]',
        'heading-lg':
          '[font-size:var(--font-size-3xl)] [font-weight:var(--font-weight-semibold)] [line-height:var(--line-height-tight)]',
        'heading-md':
          '[font-size:var(--font-size-2xl)] [font-weight:var(--font-weight-semibold)] [line-height:var(--line-height-snug)]',
        'heading-sm':
          '[font-size:var(--font-size-xl)] [font-weight:var(--font-weight-semibold)] [line-height:var(--line-height-snug)]',
      },
    },
    defaultVariants: {
      variant: 'heading-md',
    },
  }
);

/** Restricts the `as` prop to valid HTML heading elements only. */
export type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type HeadingOwnProps = VariantProps<typeof headingVariants> & {
  children?: React.ReactNode;
};

/**
 * Heading — a polymorphic heading component restricted to `h1`–`h6` tags.
 *
 * The `as` prop changes the rendered heading level (defaults to `<h2>`).
 * The `variant` prop controls visual sizing independently, so developers can
 * preserve the correct semantic heading outline while visually adjusting size.
 *
 * @example
 * <Heading as="h1" variant="heading-xl">Page Title</Heading>
 * <Heading as="h3" variant="heading-md">Section Title</Heading>
 */
const Heading = React.forwardRef(
  (
    {
      as,
      variant,
      className,
      children,
      ...rest
    }: HeadingOwnProps & { as?: HeadingTag; className?: string; [key: string]: unknown },
    ref: React.Ref<HTMLHeadingElement>
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
) as PolymorphicForwardRefComponent<'h1', HeadingOwnProps>;

(Heading as React.FC).displayName = 'Heading';

export { Heading };
