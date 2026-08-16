# Phase E Agent Instructions — Tier 2 Interactive Components

> **Agent:** Read `AGENT-CONTEXT.md` fully before starting this file.
> **Goal:** Build interactive overlay and form components (Dialog, Tabs, Accordion, Checkbox, Select, Popover) with correct keyboard navigation, scroll locking, and focus containment.
> **Commit target:** `feat(phase-E): Tier 2 Interactive Components — Dialog, Tabs, Accordion`

---

## PHASE OVERVIEW

**What this phase produces:**
- `useFocusTrap` — Hook containing keyboard trapping listeners.
- `useScrollLock` — Hook locking body scrolling with layout offset adjustments.
- `Dialog` — Compound component matching dialog overlay boundaries.
- `Checkbox` — Tri-state custom input mapping to standard form structures.
- `Tabs` — Tab-driven panel wrappers.
- `Accordion` — progressive disclosure header panels.
- `Select` / `Combobox` — Dropdown selections and filter list interfaces.
- `Popover` — Floating overlay containers with collision detection properties.

**Why this order matters:**
- Dialog depends directly on `useFocusTrap` and `useScrollLock`.
- Select and Combobox utilize Popover elements to render dropdown menus.
- Keyboard navigation rules must be validated sequentially to preserve focus order standards.

**Skills to read first:**
- `.agents/skills/senior-frontend/SKILL.md`
- `.agents/skills/architecture-patterns/SKILL.md`

---

## TIER 2 INTERACTIVE PATTERNS

### 1. Compound Component Pattern
Always use Context to coordinate states between compound elements. Renders must throw errors if sub-elements (like `Dialog.Content`) are placed outside their parent providers.
```typescript
const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be nested within a <Dialog> provider');
  }
  return context;
}
```

### 2. Standard Keyboard Bindings (Mandatory)
Every interactive element must support correct keyboard interactions:
- **Escape**: Closes active Popovers and Dialogs, restoring focus to the triggering element.
- **Arrow Keys**: Move focus between Tabs triggers, Accordion headers, and Select option items.
- **Enter/Space**: Activates actions and toggles Checkbox selections.

---

## TASK EXECUTION SEQUENCE

---

### TASK E.1 — useFocusTrap Hook
**File:** `Implementation Plan/Phase E - Tier 2 Interactive Components/Task E.1 - useFocusTrap Hook.md`

- **Technical Spec:**
  Listens for keydown triggers. When active, it bounds focus to elements returned by `getFocusableElements()` (C.3).
- **Verification:**
  Assert that tab keypresses wrap focus (last element -> first element, first element -> last element with Shift).

---

### TASK E.2 — useScrollLock Hook
**File:** `Implementation Plan/Phase E - Tier 2 Interactive Components/Task E.2 - useScrollLock Hook.md`

- **Technical Spec:**
  Locks body scroll by setting `position: fixed` and `top: -${scrollY}px`. Applies matching padding offsets to prevent page jumping.
- **Verification:**
  Assert that layout scroll position is locked on active triggers, and restored correctly on unmount.

---

### TASK E.3 — Dialog
**File:** `Implementation Plan/Phase E - Tier 2 Interactive Components/Task E.3 - Dialog.md`

- **Technical Spec:**
  Compound overlay component. Uses portals, `useFocusTrap`, and `useScrollLock`.
- **API Spec:**
  `Dialog.Trigger`, `Dialog.Content`, `Dialog.Title`, `Dialog.Close`.
- **Accessibility:**
  Set `role="dialog"`, `aria-modal="true"`, and link titles using `aria-labelledby`.
- **Verification:**
  Assert that focus trap activates on open, backdrop click triggers close hooks, and focus returns to the trigger on close.

---

### TASK E.4 — Checkbox
**File:** `Implementation Plan/Phase E - Tier 2 Interactive Components/Task E.4 - Checkbox.md`

- **Technical Spec:**
  Custom styled checkbox supporting tri-state checkboxes (`true` | `false` | `'indeterminate'`).
- **Accessibility:**
  Mixed state must map to `aria-checked="mixed"`.
- **Verification:**
  Assert state changes, form submission integration, and axe validation success.

---

### TASK E.5 — Tabs
**File:** `Implementation Plan/Phase E - Tier 2 Interactive Components/Task E.5 - Tabs.md`

- **Technical Spec:**
  Horizontal navigation layout managing triggers and content.
- **Keyboard Pattern:**
  Arrows toggle active triggers, while Tab key enters the active panel.
- **Verification:**
  Verify that keys navigate correctly and that axe-core returns zero violations.

---

### TASK E.6 — Accordion
**File:** `Implementation Plan/Phase E - Tier 2 Interactive Components/Task E.6 - Accordion.md`

- **Technical Spec:**
  Progressive disclosure lists. Triggers must be nested inside HTML heading components (`h2`, `h3`, etc.) to provide correct landmarks.
- **Verification:**
  Verify slide transition animations respect the `prefers-reduced-motion` media queries.

---

### TASK E.7 — Select and Combobox
**File:** `Implementation Plan/Phase E - Tier 2 Interactive Components/Task E.7 - Select and Combobox.md`

- **Technical Spec:**
  Filtered lists. Use `aria-live="polite"` live regions to announce search counts when filtering.
- **Verification:**
  Verify option items use `role="option"` and highlight states are manageable via keyboards.

---

### TASK E.8 — Popover
**File:** `Implementation Plan/Phase E - Tier 2 Interactive Components/Task E.8 - Popover.md`

- **Technical Spec:**
  Floating containers. Click-outside handler must ignore elements rendered inside portals.
- **Verification:**
  Verify ESC closes the popover and click outside dismisses layouts.

---

## PHASE E COMPLETION PROTOCOL

### Run Final Phase Check
```bash
pnpm lint
pnpm typecheck
pnpm test
```

### Create Walkthrough
Create `Walkthroughs/Phase E - Tier 2 Interactive Components/Walkthrough.md` detailing:
1. Keyboard mapping implementations.
2. Scroll lock state implementations.
3. Accessible dropdown rendering techniques.

### Git Commit
```bash
git add .
git commit -m "feat(phase-E): Tier 2 Interactive Components — Dialog, Tabs, Accordion

- focus-trap hook supporting backward shift+tab wrapping
- scroll-lock hook supporting page position offset compensations
- Dialog: portal rendering sibling structures with focus containment
- Checkbox: custom input with aria-checked='mixed' indeterminate state
- Tabs: arrow keyboard navigation triggers, panels tab-accessible
- Accordion, Popover, Select, Combobox custom list selectors

Phase: E
Tasks: E.1, E.2, E.3, E.4, E.5, E.6, E.7, E.8
Tests: 18 unit | 12 axe | 4 integration
Breaking: none"

git push origin dev
```

### Update Master Index
Open `00-MASTER-INDEX.md` and mark all Phase E tasks as ✅.

---

## WHAT RECRUITER SEES IN THIS COMMIT

A recruiter reviewing this commit sees:
- **"They write high-quality custom hooks"** — scroll lock and focus containment hook logic show deep DOM API proficiency.
- **"They know WAI-ARIA standards"** — correct keyboard navigation rules and context hooks prove advanced layout comprehension.
- **"They write comprehensive integration tests"** — mock keyboard events in testing suites verify real-life interactions.
