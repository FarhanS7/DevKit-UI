# Project Quick Reference — AI-Powered Design System
## @yourusername/ui

> This index maps the framework phases to their output documents. Use it as the starting point for every work session.

---

## Output Documents

| # | File | Contents | When to Use |
|---|------|----------|-------------|
| 1 | `phase-minus1-prd-sanity-check.md` | 8 gaps found in the PRD, scope line (in vs deferred), riskiest assumption | Read before starting any architecture decisions |
| 2 | `phase-0-project-foundation.md` | Monorepo architecture, module boundaries, token schema, all cross-cutting conventions | Referenced by every task in Phase 1 — do not re-derive decisions stated here |
| 3 | `phase-1-modules-and-tasks.md` | Full task tree (A–I), dependency tags, critical path, per-task checklists | The build plan — one task per Phase 2 session |
| 4 | `phase-1-5-dev-environment-and-ci.md` | Local dev verification checklist, CI workflow YAML, integration tests 1–5, branch strategy, scripts reference | Run after Modules A + B are done |
| 5 | `phase-2-ai-code-loop.md` | Prompt template, worked example (Button), session rhythm, task-specific variations, week-by-week schedule | Use before every coding session |
| 6 | `phase-3-code-review-and-walkthrough.md` | Review protocol (6 steps), module-level walkthrough checklists, PR template, interviewer-ready explanation template | Run after every Phase 2 session |
| 7 | `phase-4-and-5-deployment-and-operations.md` | Pre-release checklist, release procedure, smoke test, post-launch ops, portfolio presentation guide | Run when code is complete; reference ongoing for Phase 5 |

---

## Where to Start Today

**If you haven't started the project yet:**
1. Read `phase-minus1-prd-sanity-check.md` — understand the gaps and decisions made
2. Read `phase-0-project-foundation.md` — internalize the conventions
3. Open `phase-1-modules-and-tasks.md` → find Task A.1 → go to `phase-2-ai-code-loop.md` and fill in the prompt template

**If you're in the middle of the build:**
1. Open `phase-1-modules-and-tasks.md` — find where you are in the task tree
2. Verify all dependency tasks are done for the next task
3. Open `phase-2-ai-code-loop.md` → fill in the prompt template → code
4. After coding: run `phase-3-code-review-and-walkthrough.md` Step 1–6

**If you're about to deploy:**
1. Open `phase-4-and-5-deployment-and-operations.md` → §4.1 Pre-Release Checklist
2. Run the checklist completely before touching `npm publish`

---

## Task Status Tracker

Copy this table into your working notes and update as tasks are completed.

### Module A — Infrastructure
- [ ] A.1 — pnpm workspace, repo scaffold
- [ ] A.2 — Vite library build config
- [ ] A.3 — Storybook 8 setup
- [ ] A.4 — ESLint + Prettier + TypeScript

### Module B — Token Pipeline
- [ ] B.1 — tokens.json primitives + semantics
- [ ] B.2 — Style Dictionary → CSS (light mode)
- [ ] B.3 — Dark mode override file
- [ ] B.4 — TypeScript token constants
- [ ] B.5 — Storybook CSS integration + dark toggle

### Module C — Utilities
- [ ] C.1 — cn() utility
- [ ] C.2 — polymorphic.ts types
- [ ] C.3 — focus utility helpers

### Module D — Tier 1 Components
- [ ] D.1 — VisuallyHidden
- [ ] D.2 — Portal
- [ ] D.3 — Text / Heading
- [ ] D.4 — Label
- [ ] D.5 — Button
- [ ] D.6 — Input
- [ ] D.7 — Icon system
- [ ] D.8 — axe-core test setup + CI gate

### Module E — Tier 2 Interactive
- [ ] E.1 — useFocusTrap hook
- [ ] E.2 — useScrollLock hook
- [ ] E.3 — Dialog / Modal
- [ ] E.4 — Checkbox / Switch
- [ ] E.5 — Tabs
- [ ] E.6 — Accordion
- [ ] E.7 — Select / Combobox
- [ ] E.8 — Popover

### Module F — Tier 3 DSA
- [ ] F.1 — VirtualList (binary search)
- [ ] F.2 — CommandPalette (trigram fuzzy search)
- [ ] F.3 — DataGrid (ARIA grid + sort)

### Module G — AI Developer Tools
- [ ] G.1 — API route: generate-component
- [ ] G.2 — API route: check-accessibility
- [ ] G.3 — API route: build-theme
- [ ] G.4 — ComponentGenerator UI
- [ ] G.5 — AccessibilityChecker UI
- [ ] G.6 — ThemeBuilder UI

### Module H — CI/CD
- [ ] H.1 — GitHub Actions CI workflow
- [ ] H.2 — Chromatic visual regression CI
- [ ] H.3 — Bundle analysis CI gate
- [ ] H.4 — Changesets setup
- [ ] H.5 — npm publish automation

### Module I — Documentation
- [ ] I.1 — README
- [ ] I.2 — ADRs (001–005) as MDX
- [ ] I.3 — Story standards audit
- [ ] I.4 — Storybook polish + launch

---

## Key Decisions at a Glance

| Decision | Choice | Where Documented |
|----------|--------|-----------------|
| Monorepo tool | pnpm workspaces | Phase 0 §0.1 |
| Build tool | Vite (library mode) | Phase 0 §0.1 |
| Styling | Tailwind CSS + cva + CSS custom properties | Phase 0 §0.4 |
| Component primitives | Radix UI (Tier 2) | Phase 0 §0.1 |
| Token format | Style Dictionary (JSON → CSS + TS) | Phase 0 §0.3 |
| Dark mode | [data-theme="dark"] attribute toggle | Phase 0 §0.3 |
| Accessibility gate | jest-axe zero violations in CI | Phase 0 §0.4 |
| Versioning | Changesets + Semver | Phase 0 §0.4 |
| AI tools | Anthropic API via Next.js SSE proxy | Phase 0 §0.2 |
| Polymorphic types | Custom types in polymorphic.ts (not a library) | Phase 0 §0.4 |
| VirtualList algorithm | Binary search on prefix-sum array, O(log n) | Phase 1 F.1 |
| Fuzzy search algorithm | Trigram similarity, pre-computed at mount | Phase 1 F.2 |
| Figma integration | Deferred — document format compatibility only | Phase -1 §-1.2 |
| Browser support | Evergreen (last 2 Chrome, Firefox, Edge; Safari ≥ 16) | Phase -1 §-1.2 |

---

*This index is the starting point. Every session begins here.*
