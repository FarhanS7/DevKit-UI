# Phase 2 — AI Code Loop
## Project: AI-Powered Design System & Component Library

> **Purpose:** This is the repeating loop — run it once per Phase 1 task. Each session has a defined prompt structure, a completion contract, and an exit criteria. Do not start a new task until the current one passes its checklist.

---

## 2.0 — The Coding Session Contract

Before every coding session, answer these three questions:

1. **What is the one task I am doing?** (reference the task ID from Phase 1, e.g. "E.3 — Dialog")
2. **What must exist before I start?** (check all dependency tags from Phase 1 task tree — they must be done)
3. **What does "done" look like?** (the task's QA checklist from Phase 1 — every item must pass)

If you cannot answer all three, you are not ready to start the session.

---

## 2.1 — The Prompt Template

Use this template for every task. Fill in the bracketed sections. Do not skip sections.

```
═══════════════════════════════════════════════════════════════
TASK: [Task ID + Name from Phase 1]
═══════════════════════════════════════════════════════════════

## Project Context
This is a solo-built, portfolio-grade React component library (packages/core) in a pnpm monorepo.
- React 18.3, TypeScript 5.x, strict mode + exactOptionalPropertyTypes
- Tailwind CSS (class-variance-authority for variants), NO CSS-in-JS runtime
- CSS custom properties from packages/tokens (never hardcode colors or spacing)
- All components: forwardRef, named exports only, spread ...rest props
- Polymorphic components use types from packages/core/src/utils/polymorphic.ts
- cn() utility at packages/core/src/utils/cn.ts (clsx + tailwind-merge)
- axe-core zero violations mandatory (jest-axe in Vitest)
- Storybook 8 + @storybook/react-vite

## Architecture Constraints (from Phase 0)
[Paste the relevant Phase 0 sections that apply to this task.
For component tasks: §0.4 Best Practices. For AI tool tasks: §0.2 System Design.]

## What Already Exists (Dependencies Completed)
[List the files/exports that already exist from completed dependency tasks.
Example: "C.1 cn() at packages/core/src/utils/cn.ts — exports cn(...inputs: ClassValue[]): string"
Example: "E.1 useFocusTrap at packages/core/src/hooks/useFocusTrap.ts — exports useFocusTrap(containerRef, isActive)"]

## The Task
Build: [Exact task name]
File(s) to create:
- [packages/core/src/components/ComponentName/ComponentName.tsx]
- [packages/core/src/components/ComponentName/ComponentName.test.tsx]
- [packages/core/src/components/ComponentName/index.ts (re-export)]
- [apps/docs/stories/ComponentName/ComponentName.stories.tsx]

## Functional Requirements
[Paste the relevant section from the PRD (PRD-03-design-system.md).
For component tasks: the component's description from §7 or §8.
Keep it verbatim — the AI should implement what the PRD says, not what it infers.]

## Phase 1 Checklist for This Task
[Paste the per-task checklist from Phase 1 for this exact task.
Architecture / System Design / DSA / Tokens / Best Practices / Real-life Engineering / Code Review Points / QA]

## Output Contract
Produce:
1. Full implementation file(s) — no placeholders, no TODOs
2. Full test file with: unit tests, axe test, type tests (if polymorphic)
3. Storybook story file with all required variants (see §16 of PRD for story standards)
4. Barrel export update for packages/core/src/index.ts

## Definition of Done (verify before responding)
- [ ] TypeScript: zero errors (tsc --noEmit passes)
- [ ] Lint: zero ESLint violations
- [ ] Tests: all pass, including axe-core zero violations
- [ ] Stories: all required variants from PRD §16 exist
- [ ] No hardcoded colors, spacing, or font sizes (CSS custom properties only)
- [ ] forwardRef implemented
- [ ] ...rest spread implemented
- [ ] Named export only (no default export)
- [ ] Barrel export (index.ts) updated
═══════════════════════════════════════════════════════════════
```

---

## 2.2 — Worked Example: Task D.5 (Button)

This is the template filled in for a real task. Use as a reference.

```
═══════════════════════════════════════════════════════════════
TASK: D.5 — Button (polymorphic, variants, isLoading, forwardRef)
═══════════════════════════════════════════════════════════════

## Project Context
This is a solo-built, portfolio-grade React component library (packages/core) in a pnpm monorepo.
- React 18.3, TypeScript 5.x, strict mode + exactOptionalPropertyTypes
- Tailwind CSS with cva (class-variance-authority) for variants, NO CSS-in-JS runtime
- CSS custom properties from packages/tokens (never hardcode colors or spacing)
- All components: forwardRef, named exports only, spread ...rest props
- Polymorphic components use types from packages/core/src/utils/polymorphic.ts
- cn() utility at packages/core/src/utils/cn.ts (clsx + tailwind-merge)
- axe-core zero violations mandatory (jest-axe in Vitest)

## Architecture Constraints (from Phase 0)
From §0.4 Component API Conventions:
- Every component forwards its ref using React.forwardRef — no exceptions
- className is always merged via cn() utility, never overwritten
- All unknown props are spread to the underlying element (...rest)
- Controlled + uncontrolled: Button is stateless so this doesn't apply
- data-* attributes pass through via ...rest

From §0.4 Styling Convention:
- Tailwind for layout and variant styles (via cva)
- CSS custom properties for token values
- cn() = clsx + tailwind-merge, exported from packages/core/src/utils/cn.ts

From §0.4 Accessibility Convention:
- Focus visible: focus-visible:ring-2 focus-visible:ring-offset-2 on all interactive elements
- Touch targets: minimum min-h-[44px] min-w-[44px] on all interactive elements

## What Already Exists (Dependencies Completed)
- C.1: cn() at packages/core/src/utils/cn.ts
  export function cn(...inputs: ClassValue[]): string
- C.2: polymorphic.ts at packages/core/src/utils/polymorphic.ts
  export type PolymorphicComponentProp<C extends React.ElementType, Props = {}>
  export type PolymorphicComponentPropWithRef<C extends React.ElementType, Props = {}>
  export type PolymorphicRef<C extends React.ElementType>
- D.1: VisuallyHidden at packages/core/src/components/VisuallyHidden/index.ts
  export { VisuallyHidden }
- B.4: Token constants at packages/tokens/dist/tokens.ts (CSS custom properties available as var(--color-*), var(--spacing-*), etc.)

## The Task
Build the Button component. Polymorphic (as-prop), three variants (primary, secondary, ghost),
three sizes (sm, md, lg), isLoading state, leftIcon slot, full forwardRef, full a11y.

Files to create:
- packages/core/src/components/Button/Button.tsx
- packages/core/src/components/Button/Button.test.tsx
- packages/core/src/components/Button/Button.test-d.ts (type tests)
- packages/core/src/components/Button/index.ts
- apps/docs/stories/Button/Button.stories.tsx

## Functional Requirements (from PRD §7 Tier 1)
Button component:
- Polymorphic: as-prop defaults to <button>, can render as <a> or any element
- Variants: primary (filled brand color), secondary (outlined), ghost (transparent)
- Sizes: sm (32px height), md (40px height), lg (48px height)
- isLoading: boolean — when true, renders spinner + VisuallyHidden "Loading...", sets aria-busy, disables interaction
- leftIcon: ReactNode — renders before label, aria-hidden on the icon element
- Default type="button" to prevent accidental form submission
- Full forwardRef
- All aria-* props pass through

## Phase 1 Checklist for D.5
Architecture: Polymorphic types from C.2. Variants via cva.
System design: N/A.
DSA: N/A.
Tokens/DB: All colors via CSS custom properties. No hardcoded hex.
Best practices:
  - type="button" is the default
  - isLoading sets aria-busy="true" and disabled attribute
  - spinner is aria-hidden="true"; loading text is VisuallyHidden
  - leftIcon is aria-hidden="true"
Real-life engineering:
  - type="button" default prevents form submission
  - polymorphic cast via (ButtonWithRef as ButtonComponent) with comment explaining why
Code review points:
  - Polymorphic types correct (see C.2 QA)
  - type="button" default
  - isLoading disables interaction
  - leftIcon is aria-hidden
  - Focus ring visible in all variants
QA:
  - Renders as <button>
  - Renders as <a> with href when as="a"
  - aria-busy set when loading
  - Keyboard: Enter and Space trigger onClick
  - axe-core zero violations
  - TypeScript: <Button href="/path"> is a TS error (href not valid on button)
  - TypeScript: <Button as="a" href="/path"> is not a TS error

## Output Contract
Produce:
1. packages/core/src/components/Button/Button.tsx — full implementation
2. packages/core/src/components/Button/Button.test.tsx — unit + axe tests
3. packages/core/src/components/Button/Button.test-d.ts — type tests
4. packages/core/src/components/Button/index.ts — re-exports Button
5. apps/docs/stories/Button/Button.stories.tsx — all variants per PRD §16

## Definition of Done
- [ ] TypeScript: zero errors
- [ ] Lint: zero ESLint violations
- [ ] Tests: all pass, including axe zero violations
- [ ] Stories: Primary, Secondary, Ghost, AllSizes, Loading, AsLink, WithLeftIcon, DarkMode
- [ ] No hardcoded colors or spacing
- [ ] forwardRef implemented
- [ ] ...rest spread implemented
- [ ] Named export only
- [ ] Barrel export (packages/core/src/index.ts) updated with Button
═══════════════════════════════════════════════════════════════
```

---

## 2.3 — Session Rhythm

Each Phase 2 session follows this order:

### Before Coding
1. Pull latest `dev` branch — confirm you're not working on a stale branch
2. Check the dependency tasks are actually done (not just marked done — run the code)
3. Fill in the prompt template from §2.1 for the current task
4. Read the Phase 1 checklist one more time before starting

### During Coding
5. Generate the implementation via AI Code Loop (send the filled prompt)
6. Review the generated code against the Phase 1 checklist — line by line
7. Run locally: `pnpm typecheck`, `pnpm lint`, `pnpm test`
8. Open Storybook: verify all stories render correctly in light and dark mode
9. If any checklist item fails: identify the specific gap, fix it, re-run

### After Coding
10. Commit with a conventional commit message
11. Push to feature branch, open PR to `dev`
12. Confirm CI passes (all jobs green in GitHub Actions)
13. Merge PR
14. Mark the task as done in Phase 1 — update dependency status for any blocked tasks

---

## 2.4 — Task-Specific Prompt Variations

Some task categories need additional sections in the prompt. Add these when relevant:

### For DSA-Heavy Tasks (F.1 VirtualList, F.2 CommandPalette)

Add this section after "Functional Requirements":

```
## DSA Requirements
[Task ID] requires the following algorithm:
- Algorithm name: [e.g. Binary search on prefix-sum array]
- Purpose: [e.g. O(log n) visible range calculation per scroll event]
- Input: [e.g. scrollTop: number, itemHeights: number[], containerHeight: number]
- Output: [e.g. { startIndex: number, endIndex: number }]
- Complexity target: [e.g. O(log n) per scroll, O(n) at mount]
- Why this algorithm (not a simpler one): [e.g. O(n) scan per scroll is noticeable at 10k+ items; binary search eliminates the lag]

Implement the algorithm in a pure function (no React dependencies) that is independently unit-testable.
The React component wraps this function — keep the algorithm and the rendering logic separate.
```

---

### For AI Tool Tasks (G.1–G.6)

Add this section after "Functional Requirements":

```
## System Prompt Content
The Anthropic API call must include this system prompt. Include it verbatim in the implementation:

[SYSTEM PROMPT FOR THIS TOOL — e.g. for G.4 ComponentGenerator:]

You are an expert React developer specializing in accessible design systems.
You generate JSX code using the @yourusername/ui component library.

Available components and their props:
[Full API table — paste from PRD or generate from the TypeScript types]

Rules:
1. Only use components from the list above. Never import from other libraries.
2. All text content must be wrapped in <Text> or <Heading> components.
3. Interactive elements must have accessible labels.
4. Return only the JSX component code, no import statements, no prose explanation.
5. The component must be a named export.

[END SYSTEM PROMPT]

## Streaming Implementation
This route uses Server-Sent Events (SSE). Use the shared streamAnthropicResponse() helper from:
apps/docs/lib/ai/stream.ts

The helper signature:
streamAnthropicResponse(systemPrompt: string, userPrompt: string, res: NextApiResponse): Promise<void>
```

---

### For Compound Component Tasks (E.3 Dialog, E.5 Tabs, E.6 Accordion)

Add this section after "Functional Requirements":

```
## Compound Component Pattern
This component uses React Context for sub-component communication. Follow this pattern exactly:

1. Create a Context:
   const DialogContext = React.createContext<DialogContextValue | null>(null);
   
2. Create a hook that asserts context is available:
   function useDialogContext() {
     const ctx = React.useContext(DialogContext);
     if (!ctx) throw new Error('useDialogContext must be used within Dialog');
     return ctx;
   }
   
3. The root component (<Dialog>) is the context provider
4. Sub-components (<Dialog.Content>, <Dialog.Title>, etc.) consume the context

The component tree is attached to the root component as static properties:
Dialog.Trigger = DialogTrigger;
Dialog.Content = DialogContent;
Dialog.Title = DialogTitle;
Dialog.Close = DialogClose;

Export only Dialog (the root). Consumers use Dialog.Trigger, Dialog.Content, etc.
```

---

## 2.5 — The "Stuck" Protocol

When a generated implementation fails a checklist item repeatedly (more than 2 attempts), use this protocol instead of continuing to prompt variations:

**Step 1: Isolate the failing item**
Write a minimal reproduction: the smallest possible code that demonstrates the failure. Strip everything else out.

**Step 2: Understand the root cause**
Ask specifically about the root cause, not the fix: "Why does `aria-checked='mixed'` not get announced by NVDA even though it's in the DOM?"

**Step 3: Research the constraint**
Search for the exact combination (NVDA + Chrome + aria-checked, or React forwardRef + generic TypeScript, etc.). The answer is almost always in the ARIA Authoring Practices Guide, MDN, or a Stack Overflow thread.

**Step 4: Fix the specific issue**
Once the root cause is known, fix that specific thing in the implementation. Do not re-generate the entire component.

**Step 5: Verify the fix in isolation**
Confirm the minimal reproduction passes before re-integrating into the full component.

---

## 2.6 — Week-by-Week Task Assignment

This maps Phase 1 tasks to the 12-week build schedule from the PRD:

| Week | Tasks | Modules |
|------|-------|---------|
| 1 | A.1, A.2, A.3, A.4 | Monorepo + Tooling |
| 2 | B.1, B.2, B.3, B.4, B.5 | Token Pipeline |
| 3 | C.1, C.2, C.3, D.1, D.2 | Utilities + Foundation primitives |
| 4 | D.3, D.4, D.5, D.6, D.7 | Tier 1 components |
| 5 | D.8, H.1, H.2, H.3 + Phase 1.5 CI bootstrap | axe tests + CI |
| 6 | E.1, E.2, E.3 | Dialog (hardest Tier 2 component) |
| 7 | E.4, E.5, E.6, E.7, E.8 | Remaining Tier 2 components |
| 8 | F.1, F.2, F.3 | Tier 3 DSA components |
| 9 | G.1, G.2, G.3 (spike + implementation) | AI tool API routes |
| 10 | G.4, G.5, G.6 | AI tool UIs |
| 11 | H.4, H.5, I.1, I.2 | Release pipeline + docs |
| 12 | I.3, I.4 + polish | Story audit + launch |

---

*The loop repeats until all Phase 1 tasks are done. Each iteration: prompt → generate → review → test → commit → CI green → next task.*
