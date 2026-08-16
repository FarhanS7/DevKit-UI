# Walkthrough: Task D.4 — Label

## What was built

An accessible `<label>` wrapper component (`Label`) that binds metadata titles to input elements using standard HTML focus triggers, with strict type safety and design system token integration.

## Why it was built this way

1.  **Semantic Association**: Extending `React.LabelHTMLAttributes<HTMLLabelElement>` allows developers to naturally use `htmlFor` to bind the label to any input's `id`. This correctly passes the focus to the input when the user clicks on the text.
2.  **Tailwind Merge Conflict Avoidance**: Similar to the `Text` and `Heading` components, the font properties were constructed using explicit inline property arbitrary values (`[font-family:var(--font-family-sans)]`, `[font-size:...]`, etc.) rather than grouped `font-[...]` utilities, effectively neutralizing `tailwind-merge` class conflict issues.
3.  **State Modifiers**: Added `peer-disabled:cursor-not-allowed` and `peer-disabled:opacity-70`. When used alongside inputs that utilize Tailwind's `peer` class, this allows the label to automatically dim and update its cursor when its associated input field is marked as disabled.

## Verification

- **Tests**: Unit tests confirm proper HTML tag rendering, attribute spreading, ref forwarding, and class merging.
- **Interaction**: Integrated `@testing-library/user-event` to simulate natural click-to-focus behavior, confirming the label forwards focus to the associated input.
- **Axe-Core**: Verified that the component triggers zero accessibility violations in automated scans.
