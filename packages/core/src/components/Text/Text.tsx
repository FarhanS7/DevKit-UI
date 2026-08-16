import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn.js';
import type { PolymorphicForwardRefComponent } from '../../utils/polymorphic.js';

/**
 * CVA variant definitions for the Text component.
 * Each variant maps directly to design-system token CSS custom properties.
 *
 * We use `[font-family:...]` / `[font-weight:...]` syntax instead of `font-[...]`
 * because `tailwind-merge` treats all `font-[...]` as the same utility group,
 * which causes conflicts between font-family and font-weight arbitrary values.
 */
export const textVariants = cva('[font-family:var(--font-family-sans)]', {
  variants: {
    variant: {
      body: '[font-size:var(--font-size-base)] [font-weight:var(--font-weight-normal)] [line-height:var(--line-height-normal)] text-[var(--color-text-primary)]',
      'body-sm':
        '[font-size:var(--font-size-sm)] [font-weight:var(--font-weight-normal)] [line-height:var(--line-height-normal)] text-[var(--color-text-secondary)]',
      label:
        '[font-size:var(--font-size-sm)] [font-weight:var(--font-weight-medium)] [line-height:var(--line-height-tight)]',
      caption:
        '[font-size:var(--font-size-xs)] [font-weight:var(--font-weight-normal)] [line-height:var(--line-height-normal)] text-[var(--color-text-secondary)]',
      code: '[font-family:var(--font-family-mono)] [font-size:var(--font-size-sm)] [font-weight:var(--font-weight-normal)] [line-height:var(--line-height-relaxed)] bg-[var(--color-background-subtle)] p-0.5 rounded-sm',
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

/**
 * Text — a polymorphic typography component for body copy, labels, captions, and code.
 *
 * The `as` prop changes the rendered HTML element (defaults to `<p>`).
 * The `variant` prop controls visual styling independently from semantics,
 * so developers can use the correct semantic tag without sacrificing design control.
 *
 * @example
 * <Text variant="body">Paragraph text</Text>
 * <Text as="span" variant="caption">Small caption</Text>
 * <Text as="code" variant="code">const x = 1;</Text>
 */
const Text = React.forwardRef(
  (
    {
      as,
      variant,
      truncate,
      className,
      children,
      ...rest
    }: TextOwnProps & { as?: React.ElementType; className?: string; [key: string]: unknown },
    ref: React.Ref<HTMLElement>
  ) => {
    const Component = as ?? 'p';
    return (
      <Component ref={ref} className={cn(textVariants({ variant, truncate }), className)} {...rest}>
        {children}
      </Component>
    );
  }
) as PolymorphicForwardRefComponent<'p', TextOwnProps>;

(Text as React.FC).displayName = 'Text';

export { Text };
