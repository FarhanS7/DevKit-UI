# Phase 3 — Code Review & Walkthrough
## Project: AI-Powered Design System & Component Library

> **Purpose:** After each Phase 2 session produces code, Phase 3 is the deliberate review step — reading and understanding what was built, validating it against Phase 0 architecture decisions, and preparing a clean PR for the record. This is also where you build interviewer-ready explanations of the code.

---

## 3.1 — The Review Protocol

Run this protocol for every task after Phase 2 produces the implementation.

### Step 1: Read the Code Top-to-Bottom, Out Loud

Literally read each file aloud (or narrate to yourself). This forces you to actually process the code instead of pattern-matching on familiar shapes. Stop at anything you cannot explain in plain English. That's a gap — either fix it or understand it before moving on.

Questions to ask at each line/block:
- What is this doing?
- Why is it doing it this way (and not another way)?
- What would break if I removed this?
- Does this match Phase 0's stated conventions? Which section?

---

### Step 2: Cross-Check Against Phase 0 Architecture

Go through this checklist for every component file:

**TypeScript Conventions (Phase 0 §0.4)**
- [ ] No `any` — zero. If you see `any`, replace it before merging.
- [ ] `exactOptionalPropertyTypes` compatible — no optional props assigned `undefined` explicitly
- [ ] Named export only — no `export default`
- [ ] Polymorphic components use types from `polymorphic.ts`, not inline re-implementations

**Component API Conventions (Phase 0 §0.4)**
- [ ] `React.forwardRef` is present — check for `React.forwardRef` wrapping, not just a `ref` prop on a component that ignores it
- [ ] `className` is merged via `cn()` — not overwritten (`className={myClasses}` instead of `className={cn(myClasses, props.className)}` is the bug)
- [ ] `...rest` is spread to the underlying element — check the JSX return statement
- [ ] `aria-*` props from `...rest` can reach the DOM element (they're not blocked by destructuring)

**Accessibility Convention (Phase 0 §0.4)**
- [ ] `focus-visible:ring-2 focus-visible:ring-offset-2` on interactive elements
- [ ] Animations wrapped in `@media (prefers-reduced-motion: no-preference)` or Tailwind's `motion-safe:` prefix
- [ ] Touch targets: `min-h-[44px] min-w-[44px]` on all interactive elements

**Styling Convention (Phase 0 §0.4)**
- [ ] No hardcoded hex values anywhere in the component
- [ ] No hardcoded px values for colors or spacing — only CSS custom properties or Tailwind classes that reference them
- [ ] `cva` used for variant definition (not inline ternaries for every variant combination)

---

### Step 3: Run the Test Suite with Verbose Output

```bash
pnpm test -- --reporter=verbose packages/core/src/components/[ComponentName]
```

Read each test description. Ask: does this test actually verify the behavior described? A test named "renders without crashing" that only calls `render(<Button>test</Button>)` is not a useful test — it will pass even if the component is a completely broken empty div.

**The axe test deserves special attention:**
```bash
pnpm test -- --reporter=verbose -- --testNamePattern="axe"
```

Check the axe test covers:
- The component's default/happy path state
- Error state (if applicable) — e.g. Input with `aria-invalid="true"`
- Interactive state — e.g. Dialog when open (not just the trigger button when closed)

---

### Step 4: Manual Accessibility Testing

This cannot be automated. Do it for every component before marking it done.

**Keyboard-only test:**
1. Open the component's story in Storybook
2. Disconnect your mouse (or use Tab to navigate exclusively)
3. Verify every interaction works: Tab to reach it, Enter/Space to activate, Escape to dismiss, Arrow keys to navigate (for Tabs, Accordion, Select)
4. Verify focus is always visible — if you cannot see where focus is at any point, the focus ring is missing

**Screen reader spot check (VoiceOver on macOS):**
1. Enable VoiceOver (`Cmd+F5`)
2. Navigate to the component in Storybook
3. Listen for: the component's role, its label, its state
4. Expected for Button: "Open dialog, button" (label + role). Actual: ?
5. Expected for Dialog: "Test Dialog, dialog" when opened (title + role). Actual: ?
6. If the screen reader announces something unexpected or confusing — fix it before merging

---

### Step 5: Storybook Story Review

Open the component's stories in Storybook (not just the story file — actually run Storybook and look at them).

Required stories per PRD §16:
- [ ] `Primary` — the most common usage
- [ ] `Secondary` / other named variants (if variant prop exists)
- [ ] `AllSizes` — if size prop exists
- [ ] `Loading` — if loading state exists
- [ ] `AsLink` — if polymorphic (Button as="a")
- [ ] `WithIcon` / `WithLeftIcon` — if icon slot exists
- [ ] `DarkMode` — all components must have a dark mode story
- [ ] `Disabled` — if disabled state exists
- [ ] `Error` / `Invalid` — if error state exists (Input, etc.)

Stories are checked against:
- [ ] Uses `args` and `argTypes` — not hardcoded JSX in the `render` function
- [ ] Has a meaningful `name` prop (not auto-generated from export name)
- [ ] Has JSDoc `/** */` comment on the component in the story file (Storybook shows this as the component description)

---

### Step 6: PR Description Template

Every task that produces code must have a PR. Use this template:

```markdown
## What This PR Does
[1–2 sentences. What task from Phase 1 does this implement?]

## Implementation Notes
[2–4 bullet points explaining any non-obvious decisions made.
Reference Phase 0 sections where relevant.
Example: "Button defaults to type='button' per Phase 0 §0.4 — prevents accidental form submission."]

## Accessibility
[What accessibility behavior does this component implement?
What was tested manually? VoiceOver? NVDA? Keyboard only?]

## Checklist
- [ ] TypeScript: zero errors (`pnpm typecheck`)
- [ ] Lint: zero violations (`pnpm lint`)
- [ ] Tests: all pass including axe-core (`pnpm test`)
- [ ] Stories: all required variants present in Storybook
- [ ] Chromatic: visual review complete (no unexpected diffs)
- [ ] Changeset added (`pnpm changeset`) if this is a public API change

## What's Next
[Which Phase 1 tasks does this PR unblock? Reference task IDs.]
```

---

## 3.2 — Module-Level Walkthrough (After Each Module is Complete)

After all tasks in a module are done (not just individual tasks), do a module-level walkthrough. This is the "zoom out" review.

### What a Module-Level Walkthrough Covers

**Module D (Tier 1) walkthrough checklist:**

1. **Barrel export audit:** Open `packages/core/src/index.ts`. Verify every Tier 1 component is exported. Verify no internal utilities are accidentally exported (they should be in `src/utils/` and NOT in `index.ts` unless intentional).

2. **Naming consistency:** Are all component files named `ComponentName.tsx` (PascalCase)? Are all test files `ComponentName.test.tsx`? Are all story files `ComponentName.stories.tsx`? Inconsistency here confuses IDE tooling.

3. **Import dependency check:** Do any Tier 1 components import from Tier 2? They should not — Tier 1 is the foundation. If you see `import { Dialog }` inside a Tier 1 component, there's a circular dependency problem.

4. **Token usage audit:** Run a grep for hardcoded hex values across all Tier 1 component files:
   ```bash
   grep -r "#[0-9a-fA-F]\{3,6\}" packages/core/src/components/
   ```
   Expected result: zero matches. Any matches are tokens that weren't applied correctly.

5. **Test coverage check:** `pnpm test --coverage` — check that Tier 1 components have > 85% statement coverage. Low coverage means tests are missing important code paths.

---

### Module E (Tier 2) Additional Walkthrough Items

1. **Radix UI usage audit:** Every Tier 2 component that uses Radix — verify the Radix primitive is actually doing the heavy lifting (keyboard navigation, ARIA attributes) and the implementation is not re-implementing things Radix already handles. Over-implementation of what Radix handles is redundant code; under-implementation (missing the Radix primitive entirely) is a bug.

2. **Focus management cross-check:** Verify the focus management chain is complete:
   - Dialog: trigger → dialog opens → first element focused → Escape → trigger refocused
   - Select: trigger → listbox opens → first option focused → Escape → trigger refocused
   - Tabs: tab triggers → arrow keys move → Tab moves to panel → Shift+Tab returns to tab list

3. **Cross-component integration test:** Render a Dialog that contains a Select inside it. Verify: focus trap contains the Select's dropdown. Verify: the Select can be opened via keyboard while focus is trapped. Verify: Escape closes the Select first, then a second Escape closes the Dialog (not both at once).

---

### Module F (Tier 3) Additional Walkthrough Items

1. **Algorithm complexity verification:** For each DSA component, state the complexity claim and verify it with a simple timing test:

   **VirtualList binary search:**
   ```typescript
   // In VirtualList.test.tsx — performance regression guard
   it('finds start index in O(log n) time', () => {
     const n = 100_000;
     const heights = Array(n).fill(40);
     const prefixSums = heights.reduce((acc, h) => {
       acc.push((acc[acc.length - 1] ?? 0) + h);
       return acc;
     }, [] as number[]);
     
     const start = performance.now();
     for (let i = 0; i < 1000; i++) {
       binarySearch(prefixSums, Math.random() * n * 40);
     }
     const elapsed = performance.now() - start;
     
     // 1000 binary searches on 100k items should take < 10ms total
     expect(elapsed).toBeLessThan(10);
   });
   ```

   **CommandPalette trigram search:**
   ```typescript
   it('scores "button" against "buton" with similarity > 0.5', () => {
     expect(trigramSimilarity('button', 'buton')).toBeGreaterThan(0.5);
   });
   
   it('scores "button" against "zzzzz" with similarity < 0.1', () => {
     expect(trigramSimilarity('button', 'zzzzz')).toBeLessThan(0.1);
   });
   ```

2. **DOM node count check:** Run VirtualList with 10,000 items and count actual rendered nodes:
   ```typescript
   const { container } = render(<VirtualList items={tenThousandItems} ... />);
   const nodes = container.querySelectorAll('[data-virtual-item]').length;
   expect(nodes).toBeLessThan(50); // 10 visible + overscan, never 10,000
   ```

---

## 3.3 — Interviewer-Ready Explanation Templates

For a portfolio project, code review is also preparation for technical interviews. After each module walkthrough, write a 2-minute verbal explanation for each component. Use this template:

```
COMPONENT: [Name]

What it does:
[One sentence — what problem does this solve for a consumer of the library?]

The interesting engineering problem:
[What was the hardest thing to get right? Focus trap? Polymorphic TypeScript? Binary search?]

The specific approach and why:
[What decision was made and what was the alternative that was rejected?
"We use X instead of Y because Z."]

The accessibility implementation:
[What ARIA pattern does it follow? Where is the WCAG criterion it satisfies?]

How a consumer uses it:
[1–3 lines of JSX — the most common usage pattern]
```

**Worked example for Dialog (E.3):**
```
COMPONENT: Dialog

What it does:
Renders a modal dialog that interrupts the user's workflow for a critical action,
with full keyboard support and screen reader compatibility.

The interesting engineering problem:
Focus management — when the dialog opens, focus must move inside it; when it closes,
focus must return to the element that triggered it. Getting this right with React portals
(the dialog renders outside the component tree) requires explicit ref tracking.

The specific approach and why:
useFocusTrap saves the currently-focused element before activating, then restores it
on deactivation. The alternative was relying on the browser's native focus return,
but that only works for some elements in some browsers — not reliable enough.

The accessibility implementation:
Follows WAI-ARIA Dialog Pattern (APG): role="dialog", aria-modal="true",
aria-labelledby linking to Dialog.Title. Focus trap prevents keyboard users from
reaching content behind the dialog (WCAG 2.1.2 — No Keyboard Trap requires that
trapped focus can be released via Escape, which we implement).

How a consumer uses it:
<Dialog>
  <Dialog.Trigger>Delete account</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Title>Confirm deletion</Dialog.Title>
    <p>This cannot be undone.</p>
    <Dialog.Close>Cancel</Dialog.Close>
    <Button variant="primary" onClick={handleDelete}>Delete</Button>
  </Dialog.Content>
</Dialog>
```

---

## 3.4 — When to Revisit and Rewrite

Some Phase 2 outputs will need significant revision. Know when to rewrite versus iterate:

**Iterate (fix specific issues):** The structure is correct, one or two details are wrong. TypeScript type is slightly off. An ARIA attribute is missing. A test is not thorough enough.

**Rewrite:** The fundamental approach is wrong. The compound component pattern was not used where it should be. The component has no `forwardRef`. The ARIA pattern implemented is wrong (e.g. using `role="menu"` for a list of links, which requires a completely different keyboard interaction model than `role="listbox"`).

**The rewrite signal:** If you are fixing a third issue in the same area after two previous fixes didn't solve the root problem, stop iterating and rewrite that component from the Phase 2 prompt template with the specific constraint stated explicitly: "The previous implementation had X problem — explicitly avoid this approach and use Y instead."

---

*Phase 3 runs in parallel with Phase 2 — every coding session ends with a review session. Not after all coding is done. After each task.*
