# Walkthrough: Task D.7 — Icon System

## What was built

A high-performance lazy-loaded icon component (`Icon`) that pulls SVG assets dynamically only when rendered. The system includes a strict TypeScript discriminated union to enforce accessibility constraints at compile-time. We implemented an initial registry with `ArrowRight`, `Check`, and `X` SVG icons.

## Why it was built this way

1.  **Tiny Initial JS Bundle**: Statically importing hundreds of SVG icons causes enormous bundle bloat in standard UI libraries. By leveraging `React.lazy` and mapping it to a strict `iconRegistry`, we ensure Vite code-splits every individual SVG into its own tiny chunk. When you render `<Icon name="Check" />`, only the Check SVG chunk is downloaded by the browser.
2.  **Preventing Layout Shifts**: When an icon lazy-loads over a slow network, rendering an empty `null` would cause the surrounding layout (like Button paddings) to momentarily collapse, resulting in jarring layout shifts when the SVG finally arrives. We solved this by providing a `React.Suspense` fallback: a `span` strictly typed to `width` and `height` dimensions matching the requested `size` prop.
3.  **Compile-Time Accessibility**: If a developer tries to write `<Icon name="X" />` without ARIA descriptors, TypeScript fails the build. Our discriminated union forces the developer to choose between `aria-hidden="true"` (for decorative layout icons) or providing an `aria-label="Description"` (for standalone icon buttons). This makes creating inaccessible icons nearly impossible.

## Verification

- **Tests**: Unit tests confirm Suspense unmounting behavior, class merging, and dimension enforcement.
- **Type Assertions**: Created `.test-d.tsx` to strictly assert that TypeScript throws `expect-error` flags when accessibility rules are bypassed.
- **Axe-Core**: Verified that the component triggers zero accessibility violations in both decorative and labeled states.
