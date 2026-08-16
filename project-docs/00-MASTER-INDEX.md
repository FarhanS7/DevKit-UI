# Master Index — AI-Powered Design System Project

> **Your single starting point.** Every file in this project is reachable from here. Read this before every work session.

---

## Foundation Documents (Read Once, Reference Always)

| File | Purpose | When to Read |
|---|---|---|
| [architecture.md](./architecture.md) | Monorepo structure, component patterns, build system, dependency decisions | Before any task — understand the "shape" |
| [system-design.md](./system-design.md) | Request flows, caching, rate limiting, performance, scalability | Before AI tool tasks (G.x) |
| [database-schema.md](./database-schema.md) | Token data model, two-tier schema, Style Dictionary pipeline, migration strategy | Before any token task (B.x) |
| [design-system.md](./design-system.md) | Color system, typography, spacing, component API contracts, accessibility rules | Before any component task (D.x–G.x) |
| [product-engineering.md](./product-engineering.md) | Why this project, product decisions, engineering trade-offs, interview preparation | Before an interview or presentation |

---

## Source of Truth Files (Pre-Existing)

| File | Purpose |
|---|---|
| [PRD-03-design-system.md](./PRD-03-design-system.md) | Full product requirements — component specs, AI tool specs, story standards |
| [phase-0-project-foundation.md](./phase-0-project-foundation.md) | Monorepo scaffold, tsconfig, tooling decisions |
| [phase-1-modules-and-tasks.md](./phase-1-modules-and-tasks.md) | Complete task breakdown with dependency tree and per-task checklists |
| [phase-1-5-dev-environment-and-ci.md](./phase-1-5-dev-environment-and-ci.md) | Dev environment verification checklist, CI workflow, integration tests |
| [phase-2-ai-code-loop.md](./phase-2-ai-code-loop.md) | Per-session AI prompt template, worked example (Button), session rhythm |
| [phase-3-code-review-and-walkthrough.md](./phase-3-code-review-and-walkthrough.md) | Code review process, walkthrough documentation standards |
| [phase-4-and-5-deployment-and-operations.md](./phase-4-and-5-deployment-and-operations.md) | Deployment, monitoring, operations runbook |
| [PRD_TO_TASKS_FRAMEWORK.md](./PRD_TO_TASKS_FRAMEWORK.md) | The 7-phase SDLC framework that governs all coding sessions |

---

## Implementation Plan (Task-by-Task)

> Each task file contains: what to build, architectural decisions, system design notes, DSA notes, token notes, best practices, real-life gotchas, code review checklist, QA scenarios, AI code loop prompt.

### Phase A — Monorepo & Infrastructure (Week 1)
| Task | File | Status |
|---|---|---|
| A.1 — pnpm Workspace Scaffold | [Task A.1](./Implementation%20Plan/Phase%20A%20-%20Monorepo%20%26%20Infrastructure/Task%20A.1%20-%20pnpm%20Workspace%20Scaffold.md) | ✅ |
| A.2 — Vite Library Build Config | [Task A.2](./Implementation%20Plan/Phase%20A%20-%20Monorepo%20%26%20Infrastructure/Task%20A.2%20-%20Vite%20Library%20Build%20Config.md) | ✅ |
| A.3 — Storybook 8 Setup | [Task A.3](./Implementation%20Plan/Phase%20A%20-%20Monorepo%20%26%20Infrastructure/Task%20A.3%20-%20Storybook%208%20Setup.md) | ✅ |
| A.4 — ESLint + Prettier Config | [Task A.4](./Implementation%20Plan/Phase%20A%20-%20Monorepo%20%26%20Infrastructure/Task%20A.4%20-%20ESLint%20Prettier%20Config.md) | ✅ |

### Phase 1.5 — Dev Environment & CI Bootstrap (after A complete)
| Task | File | Status |
|---|---|---|
| 1.5.1 — Local Dev Verification | [Task 1.5.1](./Implementation%20Plan/Phase%201.5%20-%20Dev%20Environment%20and%20CI/Task%201.5.1%20-%20Local%20Dev%20Verification.md) | ✅ |
| 1.5.2 — GitHub Actions CI Bootstrap | [Task 1.5.2](./Implementation%20Plan/Phase%201.5%20-%20Dev%20Environment%20and%20CI/Task%201.5.2%20-%20GitHub%20Actions%20CI%20Bootstrap.md) | ✅ |
| 1.5.3 — Integration Tests | [Task 1.5.3](./Implementation%20Plan/Phase%201.5%20-%20Dev%20Environment%20and%20CI/Task%201.5.3%20-%20Cross-Module%20Integration%20Tests.md) | ✅ |
| 1.5.4 — Branch Strategy | [Task 1.5.4](./Implementation%20Plan/Phase%201.5%20-%20Dev%20Environment%20and%20CI/Task%201.5.4%20-%20Branch%20Strategy.md) | ✅ |

### Phase B — Token Pipeline (Week 2)
| Task | File | Status |
|---|---|---|
| B.1 — tokens.json Schema | [Task B.1](./Implementation%20Plan/Phase%20B%20-%20Token%20Pipeline/Task%20B.1%20-%20tokens.json%20Schema.md) | ✅ |
| B.2 — Style Dictionary Config | [Task B.2](./Implementation%20Plan/Phase%20B%20-%20Token%20Pipeline/Task%20B.2%20-%20Style%20Dictionary%20Config.md) | ✅ |
| B.3 — Dark Mode Override File | [Task B.3](./Implementation%20Plan/Phase%20B%20-%20Token%20Pipeline/Task%20B.3%20-%20Dark%20Mode%20Override%20File.md) | ✅ |
| B.4 — TypeScript Token Constants | [Task B.4](./Implementation%20Plan/Phase%20B%20-%20Token%20Pipeline/Task%20B.4%20-%20TypeScript%20Token%20Constants.md) | ✅ |
| B.5 — Storybook Global CSS + Toggle | [Task B.5](./Implementation%20Plan/Phase%20B%20-%20Token%20Pipeline/Task%20B.5%20-%20Storybook%20Global%20CSS%20+%20Toggle.md) | ✅ |

### Phase C — Utility Layer (Week 3)
| Task | File | Status |
|---|---|---|
| C.1 — cn() Utility | [Task C.1](./Implementation%20Plan/Phase%20C%20-%20Utility%20Layer/Task%20C.1%20-%20cn%28%29%20Utility.md) | ✅ |
| C.2 — Polymorphic Types | [Task C.2](./Implementation%20Plan/Phase%20C%20-%20Utility%20Layer/Task%20C.2%20-%20Polymorphic%20Types.md) | ✅ |
| C.3 — Focus Utility Helpers | [Task C.3](./Implementation%20Plan/Phase%20C%20-%20Utility%20Layer/Task%20C.3%20-%20Focus%20Utility%20Helpers.md) | ✅ |

### Phase D — Tier 1: Foundation Components (Weeks 3–5)
| Task | File | Status |
|---|---|---|
| D.1 — VisuallyHidden | [Task D.1](./Implementation%20Plan/Phase%20D%20-%20Tier%201%20Foundation%20Components/Task%20D.1%20-%20VisuallyHidden.md) | ✅ |
| D.2 — Portal | [Task D.2](./Implementation%20Plan/Phase%20D%20-%20Tier%201%20Foundation%20Components/Task%20D.2%20-%20Portal.md) | ✅ |
| D.3 — Text / Heading | [Task D.3](./Implementation%20Plan/Phase%20D%20-%20Tier%201%20Foundation%20Components/Task%20D.3%20-%20Text%20and%20Heading.md) | ✅ |
| D.4 — Label | [Task D.4](./Implementation%20Plan/Phase%20D%20-%20Tier%201%20Foundation%20Components/Task%20D.4%20-%20Label.md) | ✅ |
| D.5 — Button (main Tier 1 component) | [Task D.5](./Implementation%20Plan/Phase%20D%20-%20Tier%201%20Foundation%20Components/Task%20D.5%20-%20Button.md) | ✅ |
| D.6 — Input | [Task D.6](./Implementation%20Plan/Phase%20D%20-%20Tier%201%20Foundation%20Components/Task%20D.6%20-%20Input.md) | ✅ |
| D.7 — Icon System | [Task D.7](./Implementation%20Plan/Phase%20D%20-%20Tier%201%20Foundation%20Components/Task%20D.7%20-%20Icon%20System.md) | ✅ |
| D.8 — axe-core Test Setup | [Task D.8](./Implementation%20Plan/Phase%20D%20-%20Tier%201%20Foundation%20Components/Task%20D.8%20-%20axe-core%20Test%20Setup.md) | ⬜ |

### Phase E — Tier 2: Interactive Components (Weeks 6–7)
| Task | File | Status |
|---|---|---|
| E.1 — useFocusTrap Hook | [Task E.1](./Implementation%20Plan/Phase%20E%20-%20Tier%202%20Interactive%20Components/Task%20E.1%20-%20useFocusTrap%20Hook.md) | ⬜ |
| E.2 — useScrollLock Hook | [Task E.2](./Implementation%20Plan/Phase%20E%20-%20Tier%202%20Interactive%20Components/Task%20E.2%20-%20useScrollLock%20Hook.md) | ⬜ |
| E.3 — Dialog / Modal (hardest) | [Task E.3](./Implementation%20Plan/Phase%20E%20-%20Tier%202%20Interactive%20Components/Task%20E.3%20-%20Dialog.md) | ⬜ |
| E.4 — Checkbox / Switch | [Task E.4](./Implementation%20Plan/Phase%20E%20-%20Tier%202%20Interactive%20Components/Task%20E.4%20-%20Checkbox.md) | ⬜ |
| E.5 — Tabs | [Task E.5](./Implementation%20Plan/Phase%20E%20-%20Tier%202%20Interactive%20Components/Task%20E.5%20-%20Tabs.md) | ⬜ |
| E.6 — Accordion | [Task E.6](./Implementation%20Plan/Phase%20E%20-%20Tier%202%20Interactive%20Components/Task%20E.6%20-%20Accordion.md) | ⬜ |
| E.7 — Select / Combobox | [Task E.7](./Implementation%20Plan/Phase%20E%20-%20Tier%202%20Interactive%20Components/Task%20E.7%20-%20Select%20and%20Combobox.md) | ⬜ |
| E.8 — Popover | [Task E.8](./Implementation%20Plan/Phase%20E%20-%20Tier%202%20Interactive%20Components/Task%20E.8%20-%20Popover.md) | ⬜ |

### Phase F — Tier 3: DSA Components (Week 8)
| Task | File | Status |
|---|---|---|
| F.1 — VirtualList (Binary Search) | [Task F.1](./Implementation%20Plan/Phase%20F%20-%20Tier%203%20DSA%20Components/Task%20F.1%20-%20VirtualList.md) | ⬜ |
| F.2 — CommandPalette (Trigram Fuzzy) | [Task F.2](./Implementation%20Plan/Phase%20F%20-%20Tier%203%20DSA%20Components/Task%20F.2%20-%20CommandPalette.md) | ⬜ |
| F.3 — DataGrid (ARIA Grid) | [Task F.3](./Implementation%20Plan/Phase%20F%20-%20Tier%203%20DSA%20Components/Task%20F.3%20-%20DataGrid.md) | ⬜ |

### Phase G — AI Developer Tools (Weeks 9–10)
| Task | File | Status |
|---|---|---|
| G.1 — Proxy Route: generate-component | [Task G.1](./Implementation%20Plan/Phase%20G%20-%20AI%20Developer%20Tools/Task%20G.1%20-%20Proxy%20Route%20generate-component.md) | ⬜ |
| G.2 — Proxy Route: check-accessibility | [Task G.2](./Implementation%20Plan/Phase%20G%20-%20AI%20Developer%20Tools/Task%20G.2%20-%20Proxy%20Route%20check-accessibility.md) | ⬜ |
| G.3 — Proxy Route: build-theme | [Task G.3](./Implementation%20Plan/Phase%20G%20-%20AI%20Developer%20Tools/Task%20G.3%20-%20Proxy%20Route%20build-theme.md) | ⬜ |
| G.4 — ComponentGenerator UI | [Task G.4](./Implementation%20Plan/Phase%20G%20-%20AI%20Developer%20Tools/Task%20G.4%20-%20ComponentGenerator%20UI.md) | ⬜ |
| G.5 — AccessibilityChecker UI | [Task G.5](./Implementation%20Plan/Phase%20G%20-%20AI%20Developer%20Tools/Task%20G.5%20-%20AccessibilityChecker%20UI.md) | ⬜ |
| G.6 — ThemeBuilder UI | [Task G.6](./Implementation%20Plan/Phase%20G%20-%20AI%20Developer%20Tools/Task%20G.6%20-%20ThemeBuilder%20UI.md) | ⬜ |

### Phase H — CI/CD & Release (Weeks 5 + 11)
| Task | File | Status |
|---|---|---|
| H.1 — GitHub Actions CI | [Task H.1](./Implementation%20Plan/Phase%20H%20-%20CICD%20and%20Release/Task%20H.1%20-%20GitHub%20Actions%20CI%20Workflow.md) | ⬜ |
| H.2 — Chromatic Visual Regression | [Task H.2](./Implementation%20Plan/Phase%20H%20-%20CICD%20and%20Release/Task%20H.2%20-%20Chromatic%20Visual%20Regression%20CI.md) | ⬜ |
| H.3 — Bundle Analysis Gate | [Task H.3](./Implementation%20Plan/Phase%20H%20-%20CICD%20and%20Release/Task%20H.3%20-%20Bundle%20Analysis%20CI%20Gate.md) | ⬜ |
| H.4 — Changesets Setup | [Task H.4](./Implementation%20Plan/Phase%20H%20-%20CICD%20and%20Release/Task%20H.4%20-%20Changesets%20Setup.md) | ⬜ |
| H.5 — npm Publish Automation | [Task H.5](./Implementation%20Plan/Phase%20H%20-%20CICD%20and%20Release/Task%20H.5%20-%20npm%20Publish%20Automation.md) | ⬜ |

### Phase I — Documentation (Weeks 11–12)
| Task | File | Status |
|---|---|---|
| I.1 — README | [Task I.1](./Implementation%20Plan/Phase%20I%20-%20Documentation/Task%20I.1%20-%20README.md) | ⬜ |
| I.2 — ADRs (MDX pages) | [Task I.2](./Implementation%20Plan/Phase%20I%20-%20Documentation/Task%20I.2%20-%20ADRs%20as%20MDX%20Pages.md) | ⬜ |
| I.3 — Story Standards Audit | [Task I.3](./Implementation%20Plan/Phase%20I%20-%20Documentation/Task%20I.3%20-%20Story%20Standards%20Compliance%20Audit.md) | ⬜ |
| I.4 — Launch | [Task I.4](./Implementation%20Plan/Phase%20I%20-%20Documentation/Task%20I.4%20-%20Storybook%20Polish%20and%20Public%20Launch.md) | ⬜ |

---

## Walkthroughs (To Be Created After Coding Each Task)

> Walkthroughs will be created in the `Walkthroughs` directory *after* the coding phase of each respective task is complete, explaining what was built and why.

---

## Critical Path (Build These in Order — Don't Skip)

```
A.1 (scaffold)
  ↓
A.2 + A.3 + A.4 (parallel — all Week 1)
  ↓
B.1 → B.2 → B.3 → B.4 → B.5 (sequential — all Week 2)
  ↓
C.1 + C.2 + C.3 (can be done together)
  ↓
D.1 → D.2 → D.3 → D.4 → D.5 (Button is the critical path node)
  ↓
D.5 unblocks → D.6, D.7, D.8 AND E.1–E.8 AND F.1–F.3 AND G.x
  ↓
Phase 1.5 CI (H.1–H.3) — start in Week 5, run parallel to later component work
  ↓
E.1 → E.2 → E.3 (Dialog — sequential, hardest Tier 2)
  ↓
G.1 → G.2 → G.3 → G.4 → G.5 → G.6 (AI tools — Weeks 9–10)
  ↓
H.4 → H.5 (Release — Week 11)
  ↓
I.1 → I.2 → I.3 → I.4 (Docs & Launch — Week 12)
```

**Never start a task whose dependency is not 100% done and verified.**  
"Done" means: code written, tests passing, stories rendering, axe zero violations, CI green.

---

## Weekly Schedule Reference

| Week | Tasks | Deliverable |
|---|---|---|
| 1 | A.1, A.2, A.3, A.4 | Monorepo compiles, Storybook runs |
| 2 | B.1–B.5 | Tokens → CSS/TS, dark mode in Storybook |
| 3 | C.1, C.2, C.3, D.1, D.2 | Utilities + first components |
| 4 | D.3, D.4, D.5, D.6, D.7 | All Tier 1 components |
| 5 | D.8, H.1–H.3, Phase 1.5 | CI green, axe on all Tier 1 |
| 6 | E.1, E.2, E.3 | Dialog complete (hardest task) |
| 7 | E.4–E.8 | All Tier 2 components |
| 8 | F.1, F.2, F.3 | DSA components |
| 9 | G.1, G.2, G.3 | All 3 AI proxy routes |
| 10 | G.4, G.5, G.6 | All 3 AI UIs |
| 11 | H.4, H.5, I.1, I.2 | Release pipeline, README, ADRs |
| 12 | I.3, I.4 | Story audit + launch |

---

## Before Every Coding Session — Checklist

```
□ Read the task file (Implementation Plan/Phase X/...)
□ Check: are all dependency tasks actually done? (run the code, don't just check the box)
□ Read the relevant section in the foundation doc (architecture.md / design-system.md / etc.)
□ Copy the AI Code Loop prompt from the task file and fill in the bracketed sections
□ After coding: fill in the Walkthrough section for this task
□ Run: pnpm lint && pnpm typecheck && pnpm test
□ Verify: stories render in Storybook (light + dark mode)
□ Verify: @storybook/addon-a11y panel shows zero violations per story
□ Commit with conventional commit message
□ Update status in this index (⬜ → ✅)
```

---

## Interview Quick-Reference

These are the explanations you need to be able to give cold (no notes):

| Topic | Where the full answer lives |
|---|---|
| "Walk me through this project" | `product-engineering.md §1` |
| "Why a monorepo?" | `architecture.md §1` |
| "How does dark mode work?" | `database-schema.md §4` |
| "Explain your token pipeline" | `database-schema.md §5` |
| "What is a polymorphic component?" | `architecture.md §3.2` + C.2 walkthrough |
| "How does the Dialog work?" | E.3 walkthrough + `architecture.md §3.4` |
| "Why SSE for the AI tools?" | `system-design.md §3` + G.1 walkthrough |
| "How does VirtualList work?" | `system-design.md §7.3` + F.1 walkthrough |
| "How does CommandPalette search?" | F.2 walkthrough |
| "What trade-offs did you make?" | `product-engineering.md §5` |
| "What would you do differently?" | `product-engineering.md §7` |
