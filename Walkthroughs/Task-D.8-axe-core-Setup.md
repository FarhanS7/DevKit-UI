# Task D.8 — axe-core Test Setup Walkthrough

## What Was Built

Automated accessibility test infrastructure using `jest-axe` integrated into Vitest.

## Implementation Details

1. **Global Setup** (`packages/core/src/test/setup.ts`):
   - `toHaveNoViolations` is extended globally so individual tests never need to call `expect.extend()` themselves.
   - DOM cleanup runs after every test via `@testing-library/react`'s `cleanup()`.

2. **Coverage Audit** — Every component has `axe()` assertions:
   - VisuallyHidden, Portal, Text, Heading, Label, Button, Input, Icon
   - Dialog, Checkbox, Tabs, Accordion
   - Multiple states tested where applicable (default, loading, error, disabled)

3. **Portalled Elements**: Dialog tests use `document.body` for axe scanning to catch portalled content outside the test container root.

## Test Metrics

- **16 test files**, **94 total tests**, **17+ axe assertions** across all component states
- Zero WCAG violations across all components
