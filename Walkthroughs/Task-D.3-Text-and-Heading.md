# Walkthrough: Task D.3 — Text and Heading

## What was built

Polymorphic visual typography components (`Text` and `Heading`) configured to map token scales to native tags, with strict compile-time type verification.

## Why it was built this way

1.  **Decoupled Semantics and Visuals**: Often, the correct semantic HTML tag (e.g., `<h3>`) doesn't visually match the design required (e.g., it needs to look like a massive hero title). By using the polymorphic `as` prop combined with the `variant` prop, we allow developers to choose the semantically correct tag for screen readers and SEO, while independently applying the correct visual styles defined by our design system tokens.
2.  **Tailwind Merge Conflict Avoidance**: Initially, we attempted to use Tailwind arbitrary values like `font-[var(--font-family-sans)]` and `font-[var(--font-weight-bold)]`. However, `tailwind-merge` (used inside our `cn` utility) treats all `font-[...]` classes as belonging to the same utility group, causing them to incorrectly overwrite each other. We solved this by using explicit CSS property syntax (`[font-family:...]` and `[font-weight:...]`) in our CVA variants, ensuring styles compose correctly.
3.  **Strict Type Safety**: The `Heading` component uses a generic constraint (`HeadingTag`) to ensure that developers can only pass valid heading elements (`h1` through `h6`) to the `as` prop. Attempting to render a `<Heading as="div">` will result in a TypeScript compilation error. We use `PolymorphicForwardRefComponent` from our utilities to ensure the `ref` type is perfectly inferred based on the chosen tag.

## Verification

- **Tests**: Unit tests verify that the correct tags are rendered by default (`<p>` for `Text`, `<h1>` for `Heading`), that variants apply the correct classes, and that custom classes are merged correctly.
- **Type Tests**: We introduced `.test-d.ts` files to explicitly assert that invalid tags (like `span` or `div` for `Heading`) fail at compile-time.
- **Axe-Core**: Both components pass automated accessibility checks.
