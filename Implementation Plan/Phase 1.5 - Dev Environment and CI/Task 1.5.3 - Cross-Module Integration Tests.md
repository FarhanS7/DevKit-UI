# Task 1.5.3 — Cross-Module Integration Tests

**Phase:** 1.5 — Dev Environment & CI Bootstrap  
**Blocked by:** A.1–A.4, B.1–B.5  
**Blocks:** C.1  
**Week:** After Week 2  
**AI Skill to use:** `senior-frontend`

---

## 1. What I'm Building

Cross-module integration tests inside the `packages/tokens` package that verify generated files match source tokens, preventing token drift. We also configure Vitest parameters to handle typecheck tests (`.test-d.ts`) cleanly.

---

## 2. Architectural Decisions & Trade-offs

- **Automated Drift Guard**: If a developer updates `tokens.json` but forgets to run `pnpm build:tokens`, the changes will not be reflected in the compiled `tokens.css` or `tokens.ts`. A drift test comparing files programmatically guarantees compiled constants match the JSON source of truth.
- **Type Test Segregation**: Keeping type-level test files `.test-d.ts` separate from standard `.test.tsx` runtime tests keeps execution runs clean and prevents tests running twice.

---

## 3. Implementation Plan & Approach

### 1. Create `packages/tokens/src/__tests__/token-drift.test.ts`

Implement this test file. It should load the source JSON and assert that the exported TS constants object contains matching keys.

```typescript
// packages/tokens/src/__tests__/token-drift.test.ts
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { tokens } from '../../dist/tokens';

describe('Token Drift Guard', () => {
  it('should match the source JSON token structure', () => {
    // 1. Load raw tokens.json
    const tokensJsonPath = path.resolve(__dirname, '../../../tokens.json');
    const rawTokens = JSON.parse(fs.readFileSync(tokensJsonPath, 'utf-8'));

    // 2. Extracted keys from source JSON
    const semanticColorsJson = Object.keys(rawTokens.color.semantic);

    // 3. Extracted keys from generated TS object
    const generatedSemanticColors = Object.keys(tokens.color);

    // 4. Assert generated keys match source keys
    expect(generatedSemanticColors).toEqual(expect.arrayContaining(semanticColorsJson));
  });

  it('should resolve all CSS variable references cleanly', () => {
    const cssPath = path.resolve(__dirname, '../../../dist/tokens.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    // Check for any unresolved Style Dictionary outputs or undefined outputs
    expect(cssContent).not.toContain('undefined');
    expect(cssContent).not.toContain('[object Object]');
  });
});
```

### 2. Configure package-level testing script

Update `packages/tokens/package.json` to configure the test script:

```json
"scripts": {
  "test": "vitest run"
}
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Build Sequence dependency**: The drift test references files in `dist/` (like `dist/tokens.ts`). If the build output is missing when Vitest runs, the import will fail. Vitest execution scripts must be preceded by `pnpm build:tokens` in the pipeline config.
- **Vitest Typecheck script configuration**: Ensure `packages/core` test script has typechecks enabled when running in CI:
  ```json
  "test:ci": "vitest run && vitest typecheck"
  ```

---

## 5. Definition of Done

- [ ] `packages/tokens/src/__tests__/token-drift.test.ts` is implemented.
- [ ] Running `pnpm test` in the tokens workspace executes and passes.
- [ ] Modifying a semantic property in `tokens.json` without recompiling causes the test to fail.
- [ ] Re-running `pnpm build:tokens` re-aligns the outputs and makes the test pass.

---

## 6. QA Test Scenarios

| Scenario           | Command                                                        | Expected Result                                                  |
| ------------------ | -------------------------------------------------------------- | ---------------------------------------------------------------- |
| Run Test suite     | `pnpm --filter @yourusername/tokens test`                      | Run completes successfully, asserting matching token structure.  |
| Test Failure Check | Edit a semantic color key in `tokens.json` and run `pnpm test` | Test fails, showing that generated keys do not match JSON.       |
| CSS Content Audit  | Run test suite with built outputs                              | Assertions check for `undefined` string artifacts in CSS output. |

---

## 7. AI Code Loop Prompt

```
TASK: 1.5.3 — Cross-Module Integration Tests

Create packages/tokens/src/__tests__/token-drift.test.ts.
Write a test that reads the raw packages/tokens/tokens.json file, parses it, and asserts that the keys of the exported semantic color tokens from packages/tokens/dist/tokens.ts match the keys of the semantic colors defined in the JSON.
Add a second assertion checking that packages/tokens/dist/tokens.css does not contain the strings 'undefined' or '[object Object]'.
```
