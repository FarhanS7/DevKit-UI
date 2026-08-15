/**
 * Type-level tests for Heading component.
 * These assertions are checked at compile time by `tsc --noEmit`.
 * They do NOT run at runtime — no Vitest import needed.
 */
import type { PolymorphicComponentPropWithRef } from '../../utils/polymorphic.js';
import type { HeadingOwnProps, HeadingTag } from './Heading.js';

// Helper type that constrains to HeadingTag only
type HeadingProps<C extends HeadingTag> = PolymorphicComponentPropWithRef<C, HeadingOwnProps>;

// ✅ Valid: h1–h6 are allowed
type _ValidH1 = HeadingProps<'h1'>;
type _ValidH2 = HeadingProps<'h2'>;
type _ValidH3 = HeadingProps<'h3'>;
type _ValidH4 = HeadingProps<'h4'>;
type _ValidH5 = HeadingProps<'h5'>;
type _ValidH6 = HeadingProps<'h6'>;

// ❌ Invalid: non-heading tags should fail
// @ts-expect-error - 'div' is not assignable to HeadingTag
type _InvalidDiv = HeadingProps<'div'>;

// @ts-expect-error - 'span' is not assignable to HeadingTag
type _InvalidSpan = HeadingProps<'span'>;

// @ts-expect-error - 'a' is not assignable to HeadingTag
type _InvalidAnchor = HeadingProps<'a'>;

// @ts-expect-error - 'p' is not assignable to HeadingTag
type _InvalidP = HeadingProps<'p'>;
