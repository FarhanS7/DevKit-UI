# Walkthrough: Task D.5 — Button

## What was built

A primary polymorphic button component (`Button`) incorporating strict type safety, variant configurations (primary, secondary, ghost, destructive), multiple sizes (sm, md, lg), loading/disabled state handling, and accessible loading states.

## Why it was built this way

1.  **Polymorphic Type Constraints**: Built on top of the `PolymorphicForwardRefComponent` utility, the Button defaults to a `<button type="button">` but can be cleanly overridden to an anchor tag `as="a"` without triggering TypeScript errors, all while forwarding the correct `HTMLButtonElement` or `HTMLAnchorElement` ref type.
2.  **`type="button"` Protection**: By explicitly hardcoding `type="button"` on the underlying native element when it renders as a `<button>`, we ensure that developers using this component inside forms don't accidentally trigger a form submission simply by using the button for layout toggles or actions.
3.  **Accessible Loading State**: When `isLoading` is passed, the button applies `aria-busy="true"`, safely prevents user interaction (`disabled`), and conditionally renders an animated CSS-border spinner icon using the same text color as the variant (`border-current`).
4.  **CVA Styling Integration**: Using `class-variance-authority`, variants seamlessly compose over shared structural constraints and token variables without conflicting classes.

## Verification

- **Tests**: Unit tests confirm native default rendering, variant class application, conditional loading logic preventing `userEvent.click` triggers, anchor rendering bypass of the `type` attribute, and icon slot functionality.
- **Axe-Core**: Verified that the component (both static and loading) triggers zero accessibility violations in automated scans.
