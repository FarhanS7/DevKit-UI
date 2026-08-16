# Walkthrough: Task D.6 — Input

## What was built

A fully accessible text input component (`Input`) with strict design system token integration, size variants, automatic label association, helper text support, and dynamic error state configurations.

## Why it was built this way

1.  **Strict Error Boundary Alignment**: Screen readers rely on `aria-describedby` to announce contextual information when fields are focused. The component conditionally maps `aria-describedby` to either the helper text ID or the error message ID. Crucially, we omit the helper text from the DOM and the ARIA tag when an error is active, ensuring the screen reader prioritize error descriptions and we avoid broken ID references.
2.  **Stable ID Generation**: Inputs require stable IDs to map correctly to `<label htmlFor="...">`. We use `React.useId()` as a fallback when an explicit ID is omitted. This guarantees deterministic rendering across SSR hydration loops without sacrificing accessibility.
3.  **Encapsulated Structure**: Rather than forcing developers to wire up `<Label>` and `<p>` error tags manually every time, the `Input` component encapsulates the entire visual structure in a column flexbox (`flex-col gap-1.5`), ensuring perfectly consistent spacing across all system forms.

## Verification

- **Tests**: Unit tests confirm label linkage, automatic ID generation, error string routing, `onChange` bubbling via `@testing-library/user-event`, and dynamic DOM node removal logic (helper text unmounting when an error appears).
- **Axe-Core**: Verified that the component triggers zero accessibility violations in automated scans across all three states (normal, helper text, error).
