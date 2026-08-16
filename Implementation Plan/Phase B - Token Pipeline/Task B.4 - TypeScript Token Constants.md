# Task B.4 — TypeScript Token Constants

**Phase:** B — Token Pipeline  
**Blocked by:** B.2  
**Blocks:** C.1, C.2, D.1–D.8  
**Week:** 2  
**AI Skill to use:** `senior-frontend`

---

## 1. What I'm Building

The generated TypeScript interface constants file mapping semantic tokens to variable string representations. This allows autocompletion of layout values at development time.

---

## 2. Architectural Decisions & Trade-offs

- **Strict Typing Layer:** Components use TypeScript constants rather than raw CSS variable names. This catches naming conflicts during compiling.
- **Export As const:** Declaring fields with `as const` retains exact property values within complex typing contexts.

---

## 3. Implementation Plan & Approach

1. Define a third output platform configuration under Style Dictionary to output `tokens.ts`.
2. Format layout properties to match ESModule export syntax.
3. Expose color and dimension values through a nested structure matching the semantic keys of `tokens.json`.

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Generated File Protection:** Generated JS/TS files should always include comments stating they are build-managed to prevent manual developer changes.

---

## 5. Definition of Done

- [ ] Running `pnpm build:tokens` produces `packages/tokens/dist/tokens.ts`.
- [ ] Exported variables compile within TypeScript environments.
- [ ] Component layouts can successfully resolve values via key auto-completion.

---

## 6. AI Code Loop Prompt

```
TASK: B.4 — TypeScript Token Constants

Add platform configuration to packages/tokens/sd.config.js to output packages/tokens/dist/tokens.ts. The generated file must export semantic values as ES6 constants.
```
