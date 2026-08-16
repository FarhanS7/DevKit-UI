# Task I.3 — Story Standards Compliance Audit

**Phase:** I — Documentation & Launch  
**Blocked by:** I.2  
**Blocks:** I.4  
**Week:** 12  
**AI Skill to use:** `senior-frontend`, `frontend-design`

---

## 1. What I'm Building

An audit checklist and compliance sweep inside Storybook stories to verify all components render correctly in light/dark mode and have 0 violations under the `@storybook/addon-a11y` browser panel.

---

## 2. Architectural Decisions & Trade-offs

- **Manual Story Auditing**: Programmatic testing (like `jest-axe` in Vitest) can fail to catch violations in dynamic overlay elements (like portalled modals). Auditing components manually inside the Storybook browser sandbox ensures WAI-ARIA states are verified at runtime.
- **Light & Dark mode validations**: Ensuring all components render with correct contrast ratios under both light (`:root`) and dark (`[data-theme="dark"]`) variables, avoiding hardcoded styling issues.

---

## 3. Implementation Plan & Approach

Conduct an audit of all components (VisuallyHidden, Portal, Text/Heading, Label, Button, Input, Icon, Dialog, Checkbox, Tabs, Accordion, Select, Combobox, Popover, VirtualList, CommandPalette, DataGrid) checking the following rules:

### 1. Color Contrast Checklist

- Text to background contrast must be at least `4.5:1` (WCAG AA).
- Focus outlines and interactive borders must be at least `3:1`.
- Toggle between light and dark modes in Storybook and verify color variable transitions.

### 2. Interaction Checklist

- Verify all interactive controls can be focused via `Tab` or Arrow keys.
- Focus rings must display during keyboard navigation.
- Verify `Escape` closes popups and dialog overlays.

### 3. Screen Reader announcements

- Ensure icons have correct hidden settings or label descriptors.
- Verify inputs have labels or `aria-label` settings.

### 4. Storybook A11y Panel check

- Select each component story in the Storybook sidebar.
- Open the **Accessibility** panel in the bottom tabs.
- Ensure the panel reports **0 violations**.

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Dynamic elements checks**: For elements containing overlays (like Dialog or Popover), the a11y panel only evaluates active nodes. You must open the modal trigger to mount the content portal, and check the a11y panel when the modal is active.
- **Contrast calculations exceptions**: Disabled buttons are exempt from contrast requirements, but they must still declare `disabled` and `aria-disabled="true"` to prevent keyboard triggers.

---

## 5. Definition of Done

- [ ] All component stories are reviewed inside Storybook.
- [ ] Storybook `@storybook/addon-a11y` panel reports 0 violations for all components in all states.
- [ ] Visual look has 0 hardcoded colors or spacing issues.

---

## 6. QA Test Scenarios

| Scenario                    | Command                                | Expected Result                                                   |
| --------------------------- | -------------------------------------- | ----------------------------------------------------------------- |
| Verify Storybook A11y Panel | Open Storybook and select Dialog story | Bottom accessibility panel returns a checkmark with 0 violations. |
| Test modal active state     | Click Dialog Trigger and inspect panel | Portalled content is analyzed, returning 0 violations.            |

---

## 7. AI Code Loop Prompt

```
TASK: I.3 — Story Standards Compliance Audit

Open Storybook and select each component story.
Review the bottom Accessibility panel.
If any violations exist (such as missing labels or contrast errors), modify the component source code to fix the root cause.
Toggle light and dark themes to verify stylesheet updates.
```
