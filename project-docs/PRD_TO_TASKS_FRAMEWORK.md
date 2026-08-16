# PRD → Tasks Framework

> A phased system for turning a PRD into senior-level implementation plans — and then into actual understanding, not just shipped code.

---

## Why This Exists (and what was wrong with doing it task-by-task)

If you take a PRD and run a full checklist — architecture, system design, DSA, database design, best practices, QA — **on every single task**, you get the same answer to "why Postgres" and "why this folder structure" repeated in every module, reworded slightly each time. That's not rigor, it's padding. It also means the actual per-task content (the specific function, the specific edge cases) gets buried under boilerplate.

The fix: split decisions by **how often they change**.

| Decision type | Changes per | Where it belongs |
|---|---|---|
| Catching PRD gaps/contradictions before they're built in | Once, before anything else | **Phase -1** |
| "Why NestJS over Express" | Once, for the whole project | **Phase 0** |
| "Why Postgres over Mongo" | Once, for the whole project | **Phase 0** |
| Full DB schema (all tables) | Once, for the whole project | **Phase 0** |
| "Why this module is a separate service" | Once per module | **Phase 1, module level** |
| What order tasks must be built in | Once, as tasks are identified | **Phase 1, dependency tagging** |
| "Why I used a heap here instead of sorting every time" | Once per task, only if relevant | **Phase 1, task level** |
| Local dev setup, CI, cross-module tests | Once, extended as modules land | **Phase 1.5** |
| The actual code spec | Once per task | **Phase 2 (AI Code Loop)** |
| Explaining the shipped code back to you | Once per task, after it passes | **Phase 3 (Review & Walkthrough)** |
| Getting it to production safely | Once per release | **Phase 4 (Deployment & Release)** |
| Keeping it observable, documented, versioned | Ongoing after launch | **Phase 5 (Post-Launch Operations)** |

Everything you asked for is still here — architecture, system design, DSA, DB design, best practices, real-world engineering, code review, QA — it's just placed where it's decided once instead of repeated.

```
Phase -1: PRD Sanity Check    (catch gaps/contradictions before they get built into the architecture)
    ↓
Phase 0: Project Foundation   (decided once, referenced everywhere)
    ↓
Phase 1: Modules → Tasks       (break PRD into a tree, scoped checklist per node, with dependencies)
    ↓
Phase 1.5: Integration & Environment (wire modules together, CI, local dev setup)
    ↓
Phase 2: AI Code Loop          (the actual prompt you paste into your IDE, per task)
    ↓
Phase 3: Review & Walkthrough  (after code exists — explain it back so you actually learn it)
    ↓
Phase 4: Deployment & Release  (get it from your machine to production, safely)
    ↓
Phase 5: Post-Launch Operations (monitoring, docs, versioning — keep it alive after ship)
```

---

## Phase -1 — PRD Sanity Check (before any architecture decision)

Phase 0 treats the PRD as ground truth. It usually isn't — PRDs have gaps, silent contradictions, and assumptions nobody stated out loud. If those get baked into Phase 0 decisions, you find out three modules later when something doesn't fit, and by then the fix is expensive. This phase catches that early, while it's still cheap to fix.

### -1.1 Ambiguity & Gap Scan

Read the PRD looking specifically for:
- **Underspecified behavior** — a feature is named but its edge cases aren't (e.g. "users can submit solutions" — what happens on a duplicate submission? a submission after the contest ends?)
- **Contradictions** — two sections imply incompatible things (e.g. one section implies real-time leaderboards, another implies async batch scoring — these can't both be true without reconciliation)
- **Missing non-functional requirements** — expected scale, latency expectations, who the users actually are (1 person vs. 10k concurrent) — these change Phase 0 architecture decisions significantly and are often just absent from PRDs

List each gap found as a question, not a guess. Don't silently assume an answer and move on — that assumption becomes invisible technical debt.

### -1.2 Explicit Scope Line (v1 vs. later)

For a PRD with more features than can reasonably ship at once (true for nearly every personal/startup project), draw an explicit line:
- **In scope for v1** — the minimum that makes the product actually usable end-to-end
- **Explicitly deferred** — named, not just omitted, so it doesn't quietly get re-added mid-build via scope creep
- **Why this line** — one sentence tying the cut to a real constraint (time, team size, unproven demand for that feature)

### -1.3 Riskiest Assumption

Name the single assumption in the PRD most likely to be wrong, and most expensive if it is — usually something about user behavior, a third-party API's actual capabilities, or expected data volume. If this assumption breaks, what in Phase 0 would need to be redone? Knowing this in advance tells you what to validate first (a quick spike or prototype) before committing the full architecture to it.

**Output of Phase -1:** a short list of open questions (answered or explicitly deferred), a scope line, and one named risk. This feeds directly into Phase 0 — every "why we chose X" in Phase 0 should be consistent with what got decided here.

---

## Phase 0 — Project Foundation (do this once)

Before touching any task, produce a single foundation document covering the things that don't change per-task. If you skip this, every later task will silently re-derive these decisions inconsistently.

### 0.1 Senior-Level Architecture

- **Architecture style** — monolith vs. modular monolith vs. microservices vs. serverless. State which one and *why*, against the project's actual scale (team size, expected traffic, deployment cadence) — not against a textbook ideal.
- **Alternatives considered** — name 1–2 real alternatives and the specific reason they lose for *this* project (e.g. "microservices rejected: solo/small-team project, would add deployment overhead with no scaling need yet").
- **Module boundaries** — what are the top-level domains (auth, billing, content, notifications...)? Each should be independently testable and have one clear owner-responsibility.
- **Communication pattern between modules** — direct function calls (monolith), internal REST/gRPC, or event bus (BullMQ/Kafka/Redis pub-sub). Justify against actual coupling needs, not hype.

### 0.2 System Design

- **Request flow** — client → gateway/load balancer → service → DB, including where caching, auth, and rate limiting sit in that pipeline.
- **Sync vs async boundaries** — which operations must be synchronous (return immediately) vs. which belong in a queue (BullMQ/Redis) because they're slow, retryable, or non-blocking for the user (emails, AI generation, image processing).
- **Caching strategy** — what's cached (session, hot reads, computed aggregates), where (Redis, in-memory, CDN), and invalidation strategy. State explicitly if nothing needs caching yet — don't add it speculatively.
- **Scaling plan** — what's the first bottleneck likely to be (DB reads, a specific external API, a CPU-bound job), and what's the lever for it later (read replica, queue worker scaling, caching). This is a paragraph, not a diagram — don't over-engineer for scale you don't have yet.

### 0.3 Database Design (whole project, one pass)

- **Engine choice** — relational (Postgres/MySQL) vs. document (Mongo) vs. hybrid, justified by the actual shape of the data (relational integrity needs vs. flexible/nested schemas) — not by default habit.
- **Full schema** — every table/collection, with:
  - Primary keys, foreign keys, and the relationship type (1:1, 1:N, N:N)
  - Indexes — which columns, and why (foreign keys, frequent WHERE/ORDER BY columns, unique constraints)
  - Multi-tenancy strategy if relevant (shared table + `tenant_id` column vs. schema-per-tenant vs. DB-per-tenant) — justify against expected tenant count and isolation needs
- **Alternatives considered** — e.g. "considered EAV pattern for flexible attributes, rejected: query complexity isn't worth it below 50 dynamic fields; a JSONB column covers this instead."
- **Migration strategy** — tool (Prisma Migrate, TypeORM migrations, raw SQL) and the rule for handling breaking schema changes in production (additive-first, backfill, then remove old column).

### 0.4 Cross-Cutting Best Practices (apply everywhere, state once)

- Error handling convention (typed errors with `code` field, global exception filter)
- Auth/authorization pattern (JWT + guards, RBAC, ownership checks)
- Logging/observability baseline (structured logs, request IDs, what gets logged at error vs. warn vs. info)
- Environment/config management (`.env` validation at boot, no secrets in code)
- API versioning/contract convention if it's a public API

**Output of Phase 0:** one `ARCHITECTURE.md` (or equivalent) covering the above. Every task in Phase 1 references this instead of re-deriving it.

---

## Phase 1 — Break the PRD into Modules → Tasks

### 1.1 Decomposition

Read the PRD and produce a tree, not a flat list:

```
Project
├── Module A (e.g. "Authentication")
│   ├── Task A.1 — Signup endpoint
│   ├── Task A.2 — Login + JWT issuance
│   └── Task A.3 — Refresh token rotation
├── Module B (e.g. "Billing")
│   ├── Task B.1 — ...
```

A **module** is a domain boundary from Phase 0 (0.1). A **task** is something small enough to fit one AI Code Loop prompt — typically one function, one endpoint, one focused class. If a "task" needs three subtasks just to describe its inputs/outputs, it's actually a module — split it.

### 1.1b Dependencies & Sequencing

The tree alone doesn't tell you what order to build in. Tag each task with what it's **blocked by**:

```
Task A.2 — Login + JWT issuance        | blocked by: A.1 (needs user records to exist)
Task C.4 — Leaderboard ranking query   | blocked by: C.1, C.2 (needs submissions + scoring to exist)
```

From this, identify:
- **The critical path** — the longest chain of blocking dependencies; this determines the earliest possible finish date regardless of how much else gets parallelized
- **What's parallelizable** — tasks with no shared dependency can be built in any order or interleaved, useful for batching similar work (e.g. all CRUD endpoints for one module) into one session
- **What to build first** — usually whatever the riskiest assumption from Phase -1.3 depends on, so you find out early if a core decision needs to change, rather than discovering it after five dependent tasks are already built on top of it

This matters more for solo/small-team work than it sounds — without it, it's easy to build the impressive-looking feature first and discover the boring prerequisite (auth, data model) needs rework underneath it.

### 1.2 Per-Task Scoped Checklist

For each task, answer **only the categories that actually apply** — don't force all eight onto every task. Use this as a filter, not a mandatory template:

| Category | Include when... | Skip when... |
|---|---|---|
| **Architecture note** | Task introduces a new pattern not covered in Phase 0 (e.g. first use of a queue worker) | Task is a standard CRUD operation already covered by Phase 0 patterns |
| **System design note** | Task has a non-trivial request flow (multi-step, calls external API, needs idempotency) | Task is a simple read/write |
| **DSA** | Task has real algorithmic weight (ranking, pathfinding, dedup at scale, custom sort/search) | Task is standard ORM query / CRUD — forcing DSA here produces filler like "we use array.map() which is O(n)" |
| **Database note** | Task touches schema not yet covered, or has a non-obvious query/index need | Schema already fully specified in Phase 0 |
| **Best practices** | Always include — but as a short checklist, not an essay, since the conventions are already set in Phase 0 |
| **Real-life engineering** | Task has a genuine production gotcha (race condition, rate limit, idempotency key, webhook retry) | Task has none — say so rather than inventing one |
| **Code review / refactor points** | Note 1–3 specific things to watch for in review (e.g. "verify discount applied before tax, not after") |
| **QA testing** | Always include — scenario list feeds directly into Phase 2's Tests section |

If a category is skipped, write one line saying so (e.g. "DSA: not applicable, standard lookup query") rather than omitting it silently — this keeps the plan auditable without bloating it.

---

## Phase 1.5 — Integration & Environment (wire it together, before and alongside building)

Phase 2 produces correct, isolated units of code. Nothing in the framework so far makes sure those units actually run together on a machine, or that a regression in task #3 gets caught before it's discovered in task #40. This phase is mostly set up once near the start, then maintained as tasks land.

### 1.5.1 Local Development Environment

- **One-command startup** — docker-compose (or equivalent) that brings up the app plus its dependencies (Postgres, Redis, etc.) so the environment isn't tribal knowledge living only in your head
- **Seed data** — a script that populates enough realistic data to actually exercise the features being built, instead of testing against an empty database every time
- **Environment variable contract** — a `.env.example` listing every required variable with a one-line description; the app should fail loudly at boot if a required one is missing, not fail confusingly at the first request that needs it

### 1.5.2 Continuous Integration

- **What runs on every push** — lint, typecheck, unit tests, at minimum. Build failure should be visible before code reaches the next task, not discovered days later when three more tasks are stacked on top of the broken one
- **Why this matters more for AI-assisted code specifically** — generated code can look correct and still violate a convention from Phase 0 (wrong error format, missed null check); CI catches this mechanically instead of relying on remembering to check by hand every time

### 1.5.3 Integration Testing Across Module Boundaries

Phase 2's tests are per-task and mock external dependencies — that's correct for unit-level confidence, but it means no test currently proves that Module A's output actually satisfies what Module B expects. Add a smaller number of integration tests that:
- Exercise a real flow across 2+ modules (e.g. signup → login → first authenticated request) without mocking the modules from each other
- Run against a real (test) database, not mocks, to catch schema/query mismatches that unit tests with mocked repositories would miss
- Run less frequently than unit tests (e.g. on PR merge, not every keystroke) since they're slower

**Output of Phase 1.5:** a working `docker-compose.yml`, a green CI pipeline, and a small integration test suite. This typically gets built once early (after the first 1–2 modules exist) and then extended as new modules land — it isn't a one-time gate before Phase 2 can start.

---

## Phase 2 — AI Code Loop (per task, the actual execution prompt)

Once a task is scoped via 1.2, convert it into this prompt and paste it into your IDE assistant. This is unchanged from your original framework — it's the proven part — just now fed by a properly-scoped task instead of a vague PRD line item. Once the code passes the Iteration Loop below, move to Phase 3 before starting the next task.

### Step 1 — Define the Goal

One sentence. Specific, measurable, no ambiguity. States what the output is, its inputs, and its output.

```
Write a [function | module | class | endpoint] that accepts [input]
and returns [output], where [key constraint].
```

### Step 2 — Write the Rules

Non-negotiable constraints, written as hard facts ("must", never "should"). Pull directly from:
- Phase 0 cross-cutting conventions (error format, auth pattern)
- Phase 1 task-specific notes (the real-life engineering gotchas, DB constraints)

```
Rules:
1. [Data integrity constraint]
2. [Security constraint]
3. [Error handling — typed errors, specific code]
4. [Edge case rule]
5. [Style/consistency rule from project conventions]
```

### Step 3 — Provide Examples

Minimum two input → output pairs: one happy path, one edge case. Exact values, not approximations, plus a one-line note on *why* the output is what it is.

```
Example 1 — [happy path]:
  Input:  [exact values]
  Output: [exact values]
  Notes:  [reasoning]

Example 2 — [edge case]:
  Input:  [exact values]
  Output: [exact values]
  Notes:  [reasoning]
```

### Step 4 — Types / Interfaces (typed languages)

Define input/output shapes and the function signature explicitly — don't let the AI invent shapes.

```typescript
interface Input { /* ... */ }
interface Output { /* ... */ }
function taskName(input: Input): Output
```

### Step 5 — Break Into Subtasks

Name the internal functions the implementation should expose, decomposed along natural seams (validate → compute → assemble). Each becomes independently testable.

```
Subtasks:
1. validateX(...)   — throws on bad input
2. computeY(...)    — pure calculation
3. assembleZ(...)    — final shape
Then compose in [mainFunctionName]().
```

### Step 6 — Ask for Tests

Pull scenarios straight from Phase 1's QA category for this task.

```
Write unit tests covering:
1. Happy path
2. [Edge case from Phase 1 QA notes]
3. [Error case — specific code expected]
4. [Real-life engineering gotcha, if flagged in Phase 1]
Use [Jest/Vitest/pytest]. Mock external dependencies.
```

### Complete Per-Task Prompt Template

```
## Goal
[One sentence: function/module/class, inputs, output.]

## Context (from Phase 0 / Phase 1 — paste relevant lines only)
- Architecture: [relevant pattern, e.g. "this runs as a BullMQ worker, not a request handler"]
- DB: [relevant table/columns this task touches]
- Real-life gotcha: [if flagged, e.g. "must be idempotent — webhook may retry"]

## Rules
1. ...
2. ...

## Types / Interfaces
[paste explicit types]

## Examples
Example 1 — [scenario]: Input / Output / Notes
Example 2 — [edge case]: Input / Output / Notes

## Subtasks
1. ...
2. ...
Then compose in [function].

## Tests
1. ...
2. ...
Use [framework]. Mock externals.

## Edge Cases to Explicitly Handle
- ...
```

---

## The Iteration Loop (after the AI responds)

```
[ ] Output matches all examples exactly
[ ] Every rule is respected in the code
[ ] All subtasks present as named functions
[ ] All tests pass
[ ] Errors are typed, not raw throw new Error("string")
[ ] Edge cases handled (empty input, null, zero values)
[ ] Code is consistent with Phase 0 conventions (naming, error format, auth pattern)
```

Unchecked box → targeted correction, not a re-prompt from scratch:

```
The [function] does not handle [specific case].
Given input [X], expected [Y], got [Z].
Fix only this behavior without changing the rest.
```

---

## Phase 3 — Review & Walkthrough (after the code passes, before moving on)

The Iteration Loop confirms the code is *correct*. This phase makes sure you actually *understand* it — the goal here is your learning, not the code's correctness. Don't skip straight to the next task once tests pass; a task isn't done until it's been explained back to you.

This runs once per task (or once per module, if several tasks were small and tightly related), right after that task clears the Iteration Loop checklist.

### 3.1 Line-by-Line / Block-by-Block Walkthrough

Go through the actual code that was written — not a generic description of the pattern — and explain:

- **What this block does**, in plain language, before any jargon
- **Why it's written this way** — what would break, or get worse, if it were written the obvious/naive way instead
- **What it's connecting to** — which Phase 0 convention, which DB table, which other task's output, so you can see how it fits the bigger picture instead of floating in isolation

Skip narrating lines that are self-evident (a simple variable assignment doesn't need a paragraph). Spend the explanation budget on the parts that *aren't* obvious — the reason for a particular guard clause, why a query is shaped the way it is, why a value gets transformed before storage.

### 3.2 Concept Extraction

For each task, pull out the **transferable concept**, separate from this specific code:

- Name the pattern/technique used (e.g. "this is the repository pattern", "this is optimistic locking", "this is a debounced queue consumer")
- One sentence on when you'd reach for this again in a *different* project, and one sentence on when you wouldn't
- If a rule from Step 2 (AI Code Loop) forced a specific implementation choice, point out which line of code exists *because of* that rule — connecting the spec back to the result closes the loop between "what I asked for" and "what I got"

### 3.3 Alternatives Not Taken (the road not traveled)

- What's at least one other way this could have been implemented?
- Why does the chosen approach win for *this* codebase, at *this* scale — and under what future condition would the alternative become the better choice? (e.g. "a simple loop is fine here under 10k rows; past that, this should move to a DB-level aggregation")

### 3.4 Refactor & Code Review Notes (explained, not just listed)

Phase 1's "code review / refactor points" (1.2) named *what* to watch for. Now that code exists, walk through it for real:

- Point to the actual line(s) where each flagged risk lives
- If something was refactored during review, show the before → after and explain *why* the after version is better (not just "cleaner" — what specific failure mode does it avoid?)
- Flag anything that's acceptable for now but would need revisiting at scale (technical debt called out on purpose, not by accident)

### 3.5 Check Your Understanding

Close the walkthrough with 2–4 questions you should be able to answer yourself before moving to the next task — these aren't busywork, they're how you catch a concept that was explained but not absorbed:

```
- If [input] were [edge case variant], what would this code do, and why?
- Why does [specific line] use [technique X] instead of [obvious alternative Y]?
- Which Phase 0 convention does this task depend on, and what would break if that convention changed?
```

If you can't answer one confidently, that's the signal to ask for that specific part to be re-explained — not to move on anyway.

---

## Phase 4 — Deployment & Release (getting it to production, safely)

Phase 3 confirms the code is understood. Nothing so far gets it in front of real users. This runs once Phase 1.5's CI is green and enough modules exist to form a usable slice — it doesn't have to wait for every task in the PRD to be done; a deployable v1 (per Phase -1.2's scope line) ships first.

### 4.1 Deployment Target & Process

- **Where it runs** — pick a concrete target (e.g. Railway, given prior use) and state why it fits the project's scale and budget over alternatives (a bare VM, a more complex k8s setup) — usually "simplest thing that meets the actual requirement" wins for a solo/small project
- **How code gets there** — push-to-deploy from a branch, or a manual trigger; state which, and why that level of automation is appropriate right now (full continuous deployment is great once you trust the test suite; manual-trigger-after-CI-green is often the right amount of caution earlier on)

### 4.2 Environment Promotion

- **Environments** — at minimum, a clear split between local, a staging/preview environment, and production; PRs or feature branches should be verifiable somewhere before they touch real data
- **Secrets per environment** — different API keys/credentials per environment, never the production secret used locally; state where secrets live (the deploy platform's secret manager, not committed `.env` files)
- **Config that differs by environment** — log verbosity, rate limits, feature flags — captured explicitly rather than left as accidental differences nobody wrote down

### 4.3 Database Migrations in Production

- Ties back to Phase 0's migration strategy (0.3) — restate the rule for *running* migrations safely: always additive-first (add new column/table, backfill, only then remove the old one), so a deploy never requires the old and new code to be incompatible mid-rollout
- State whether migrations run automatically on deploy or require a manual step — automatic is convenient but riskier for destructive changes; many teams gate destructive migrations behind a manual confirmation even if additive ones run automatically

### 4.4 Rollback Plan

- **What "broken" looks like** — a concrete trigger (error rate spike, failed health check, a specific broken user flow) that says "roll back now," decided in advance rather than improvised under pressure
- **How to roll back** — revert to the previous deploy (most platforms support this natively) vs. forward-fixing with a hotfix; state which is faster for the chosen deployment target and default to that
- **What doesn't roll back cleanly** — a destructive migration that already ran is the classic case; this is exactly why 4.3's additive-first rule exists

**Output of Phase 4:** a deploy actually running in production, a documented promotion path, and a rollback trigger condition written down before it's needed — not improvised during an incident.

---

## Phase 5 — Post-Launch Operations (keeping it alive after ship)

The framework so far ends at "code is deployed." A complete project needs a plan for what happens after that — otherwise small problems in production go unnoticed until they're big problems, and the project becomes undocumented the moment memory of building it fades.

### 5.1 Monitoring & Alerting

- Tie back to Phase 0's logging baseline (0.4) — that defined *what* gets logged; this defines what happens with those logs. At minimum: error-rate visibility and a way to be notified (even something as simple as an alert to email/Slack) when something fails repeatedly, rather than discovering it from a user complaint
- Pick 2–3 metrics that actually matter for this specific product (e.g. for Code Arena: submission processing latency, judge queue depth) over a generic dashboard with everything and therefore nothing prioritized

### 5.2 Documentation as Definition of Done

A task isn't actually finished when tests pass and Phase 3 explains it — it's finished when someone other than you (including future-you, six months from now) could pick it up. Minimum bar:
- **README** — what the project is, how to run it locally (should map directly to Phase 1.5's one-command setup), how to deploy it
- **API documentation** — even a lightweight one (OpenAPI spec, or a maintained Postman collection) for any endpoint other code or other people will call
- **ADRs for Phase 0 decisions** — you've already built this habit; this phase just confirms it's a hard requirement, not optional polish, since these are exactly what's impossible to reconstruct later from code alone

### 5.3 Versioning & Changelog

- A lightweight convention (semantic versioning, or just dated entries) for what changed between releases — even a personal project benefits from this the moment there's more than one deploy, since "what changed since last week" becomes a real question you'll otherwise have to answer by reading git log
- If the API is consumed by anything external (a frontend, another service, third-party integrators), a stated policy on breaking changes — even "breaking changes require a version bump, additive changes don't" is enough to prevent silent breakage downstream

**Output of Phase 5:** monitoring that would actually surface a real failure, documentation that survives you forgetting the details, and a changelog that answers "what changed" without spelunking through commit history.

---

## Anti-Patterns to Avoid

| Anti-Pattern | Why It Fails | Fix |
|---|---|---|
| Running the full 8-category checklist on every task | Same architecture/DB explanation repeated dozens of times; buries the actual task-specific content | Phase 0 once, scoped filter (1.2) per task |
| "Make a [whole module]" as one task | Hard to review, hard to test, hard to debug | Split at Phase 1 until each leaf fits one AI Code Loop prompt |
| Forcing DSA/architecture notes onto simple CRUD tasks | Produces filler ("this for loop is O(n)") that adds no value | Use the 1.2 filter — skip and say so |
| Giving examples without exact outputs | AI can't validate its own result | Always include both input and exact output |
| Skipping types in typed languages | AI invents interfaces that won't match your codebase | Always include Step 4 |
| Accepting code without tests | Edge cases surface in production instead | Always run Step 6, sourced from Phase 1 QA notes |
| Re-deriving DB schema or architecture decisions inside individual tasks | Inconsistency across tasks, wasted tokens | Reference Phase 0, don't re-decide |
| Moving to the next task as soon as tests pass | Code ships correct but you don't actually learn anything — same gaps resurface next project | Run Phase 3 before moving on; answer the Check Your Understanding questions for real |
| Jumping straight into Phase 0 architecture off a raw PRD | Ambiguities and contradictions get silently resolved by guessing, then surface mid-build as rework | Run Phase -1 first; turn gaps into explicit questions or scope decisions |
| Treating every task as independently orderable | Builds the impressive feature first, then discovers the boring prerequisite underneath needs rework | Tag dependencies in 1.1b; build the critical path and riskiest assumption first |
| Writing all the code before any CI or integration test exists | Module A/B mismatches surface late, after many tasks are already stacked on the broken assumption | Stand up Phase 1.5 early — after the first 1–2 modules, not after all of them |
| Deploying for the first time with no rollback plan decided | Incident response improvises under pressure instead of following a decided trigger/process | Define the rollback trigger and method in Phase 4 before the first real deploy |
| Treating "deployed" as "done" | No monitoring means failures are discovered by users, not by you; no docs means future-you can't reconstruct decisions | Phase 5 — monitoring, documentation, and a changelog are part of done, not extras |

---

## Quick Reference Card

```
PHASE -1 → PRD sanity check: gaps, contradictions, scope line, riskiest assumption. ONCE, FIRST.
PHASE 0  → Architecture, system design, full DB schema, cross-cutting conventions. ONCE.
PHASE 1  → PRD → Modules → Tasks. Dependencies tagged. Scoped checklist per task.
PHASE 1.5→ Local dev env, CI pipeline, cross-module integration tests. Early + ongoing.
PHASE 2  → AI Code Loop per task: Goal → Rules → Examples → Types → Subtasks → Tests.
PHASE 3  → Review & Walkthrough: explain the shipped code, extract concepts, check understanding.
PHASE 4  → Deployment & Release: target, environment promotion, migrations, rollback plan.
PHASE 5  → Post-Launch Ops: monitoring, documentation, versioning/changelog.
ITERATE  → Targeted corrections against the checklist, never re-prompt from scratch.
```

---

*One foundation, many tasks. Decide once, execute many times — then explain it back until it's actually yours.*
