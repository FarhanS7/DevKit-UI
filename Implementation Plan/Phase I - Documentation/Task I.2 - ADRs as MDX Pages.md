# Task I.2 — ADRs as MDX Pages

**Phase:** I — Documentation & Launch  
**Blocked by:** I.1  
**Blocks:** I.3  
**Week:** 11  
**AI Skill to use:** `senior-frontend`, `frontend-design`

---

## 1. What I'm Building

5 Architecture Decision Records (ADRs) written as MDX documentation pages inside Storybook. They document the design decisions and trade-offs made during the project.

---

## 2. Architectural Decisions & Trade-offs

- **ADRs as Living Documentation**: Documenting decisions (such as using monorepos or Radix primitives) in MDX files alongside components makes the context accessible to new contributors.
- **Storybook MDX standard**: Writing records in MDX allows them to render cleanly in the Storybook sidebar directory.

---

## 3. Implementation Plan & Approach

Create 5 MDX files under `apps/docs/stories/adrs/`:

- `ADR-001-Monorepo.mdx` — Monorepo using pnpm workspaces (packages/core, packages/tokens, apps/docs).
- `ADR-002-Token-Pipeline.mdx` — Two-tier token schema and Style Dictionary transformations.
- `ADR-003-Radix-Primitives.mdx` — Radix UI unstyled primitives for Tier 2 behaviors.
- `ADR-004-Polymorphic-Components.mdx` — Polymorphic `as`-prop pattern and TypeScript generic typings.
- `ADR-005-SSE-Streaming.mdx` — Server-Sent Events (SSE) Next.js proxies for streaming Claude responses.

Each ADR file must follow the standard structure:

```markdown
# ADR-00X: [Title]

## Status

Approved

## Context

What problem did we face? What alternatives did we consider?

## Decision

What choice did we make? How does it resolve the problem?

## Consequences

What are the positive and negative trade-offs?
```

Verify your Storybook main configurations (`main.ts`) includes the path:

```typescript
stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'];
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **MDX Import Errors**: Ensure MDX pages use valid Markdown syntax and contain no unescaped HTML characters that could break Storybook builds.
- **Sidebar Ordering**: Use Storybook's `meta` headers to control the sidebar hierarchy:
  ```markdown
  import { Meta } from '@storybook/addon-docs';
  <Meta title="ADRs/001 Monorepo" />
  ```

---

## 5. Definition of Done

- [ ] 5 MDX files are created in the docs app.
- [ ] Storybook builds successfully without compiler warnings.
- [ ] ADR pages render cleanly in the Storybook sidebar menu.

---

## 6. QA Test Scenarios

| Scenario               | Command                          | Expected Result                                                                    |
| ---------------------- | -------------------------------- | ---------------------------------------------------------------------------------- |
| Verify Storybook build | `pnpm build-storybook`           | The build finishes successfully, generating a static build in `storybook-static/`. |
| Verify navigability    | Open Storybook and check sidebar | "ADRs" section is visible and lists the 5 documents in order.                      |

---

## 7. AI Code Loop Prompt

```
TASK: I.2 — ADRs as MDX Pages

Create stories/adrs directory in apps/docs.
Create 5 MDX files: Monorepo, Token Pipeline, Radix, Polymorphism, and SSE streaming.
Document status, context, decision, and consequences in each file.
Use Storybook Meta headers to organize them in the sidebar.
Confirm Storybook compiles and runs cleanly.
```
