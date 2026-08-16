# Task G.4 — ComponentGenerator UI

**Phase:** G — AI Developer Tools  
**Blocked by:** G.1, D.5  
**Blocks:** Component creation tooling  
**Week:** 10  
**AI Skill to use:** `senior-frontend`, `frontend-design`, `frontend-ui-ux-engineer`

---

## 1. What I'm Building

The user interface inside Storybook that lets developers write text prompts, stream JSX outputs, and copy validated results to their clipboard.

---

## 2. Architectural Decisions & Trade-offs

- **Babel-Parser Validation Check:** Validating the generated JSX output client-side before copying ensures generated layouts compile cleanly.
- **Micro-animation Stream Renders:** Streamed blocks display inline using smooth layout transitions, enhancing visual feedback.

---

## 3. Implementation Plan & Approach

1. Create `apps/docs/components/ai-tools/ComponentGenerator.tsx`.
2. Construct text input forms and action buttons using core library components.
3. Configure `EventSource` or readable streams to process token increments.
4. Integrate `@babel/parser` to check JSX syntax rules.

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Streaming State Updates:** Triggering React re-renders on every token can cause input lag. Use refs or buffer updates to preserve 60fps rendering during fast streams.

---

## 5. Definition of Done

- [ ] UI displays in Storybook side panels.
- [ ] Text prompts trigger active stream loops.
- [ ] Copy actions validate JSX formatting parameters before saving.

---

## 6. AI Code Loop Prompt

```
TASK: G.4 — ComponentGenerator UI

Create apps/docs/components/ai-tools/ComponentGenerator.tsx. Bind SSE events to render layout tokens. Integrate @babel/parser checks to validate JSX.
```
