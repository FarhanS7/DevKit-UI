# Task H.3 — Bundle Analysis CI Gate

**Phase:** H — CI/CD & Release Pipeline  
**Blocked by:** H.1  
**Blocks:** H.4  
**Week:** 5  
**AI Skill to use:** `architecture-patterns`

---

## 1. What I'm Building

An automated bundle size gate (`scripts/check-bundle-size.js`) that measures built library code weights and fails the CI build if the gzipped library footprint exceeds a strict `80KB` budget.

---

## 2. Architectural Decisions & Trade-offs

- **Strict Bundle Weight Limits**: Adding library features can lead to bundle bloat. Running size audits in CI catches issues early.
- **Fail-Build on Over-budget**: Rather than just logging size reports, the check script exits with code 1 if sizes exceed limits, blocking PR merges.

---

## 3. Implementation Plan & Approach

### 1. Create `scripts/check-bundle-size.js`

Create this script in the workspace root. It should find the built js bundles, compute their gzip size, and check against the 80KB limit.

```javascript
// scripts/check-bundle-size.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const BUDGET_KB = 80;
const BUNDLE_PATH = path.resolve(__dirname, '../packages/core/dist/index.mjs');

function checkBundleSize() {
  console.log('📦 Auditing library bundle size...');

  if (!fs.existsSync(BUNDLE_PATH)) {
    console.error(`❌ Build output missing at: ${BUNDLE_PATH}`);
    console.error('Please run "pnpm build" inside core package first.');
    process.exit(1);
  }

  const fileContents = fs.readFileSync(BUNDLE_PATH);
  const gzipped = zlib.gzipSync(fileContents);
  const sizeBytes = gzipped.length;
  const sizeKb = sizeBytes / 1024;

  console.log(`✅ Compiled Bundle Size: ${sizeKb.toFixed(2)} KB (Gzipped)`);

  if (sizeKb > BUDGET_KB) {
    console.error(
      `❌ Size Budget Violated: Bundle is ${sizeKb.toFixed(2)} KB, budget is ${BUDGET_KB} KB!`
    );
    process.exit(1);
  }

  console.log(`🚀 Size budget passes: ${sizeKb.toFixed(2)} KB is under ${BUDGET_KB} KB limit.`);
  process.exit(0);
}

checkBundleSize();
```

### 2. Update Root `package.json`

Add script parameters inside the root `package.json`:

```json
"scripts": {
  "check-size": "node scripts/check-bundle-size.js"
}
```

### 3. Add to `.github/workflows/ci.yml`

Add the size check step to the `test-and-build` job in your CI workflow:

```yaml
- name: Run Bundle Size Audit
  run: pnpm check-size
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Run after build**: The script checks compiled assets in `dist/`. The bundle check must execute only after the library build finishes successfully.
- **External modules check**: Because React and Radix UI packages are external, their sizes are not included in this audit. The 80KB budget applies only to our library's custom code.

---

## 5. Definition of Done

- [ ] `scripts/check-bundle-size.js` is implemented at root.
- [ ] Running size check commands returns exit code 0 when sizes pass budget limits.
- [ ] Temporarily reducing budgets (e.g. to 1KB) returns exit code 1, failing the build.

---

## 6. QA Test Scenarios

| Scenario              | Command                                                      | Expected Result                                        |
| --------------------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| Verify size check     | `pnpm check-size`                                            | Logs current gzipped size and passes with exit code 0. |
| Test Budget Violation | Lower budget limits to `1` in `check-bundle-size.js` and run | Script logs a budget violation and exits with code 1.  |

---

## 7. AI Code Loop Prompt

```
TASK: H.3 — Bundle Analysis CI Gate

Create scripts/check-bundle-size.js in the root workspace.
Compute relative bundle paths to core's index.mjs library build output.
Measure file sizes using zlib.gzipSync, checking outputs against an 80KB limit.
Exit with code 1 on violations.
Update root package.json scripts to include "check-size": "node scripts/check-bundle-size.js".
Add a size audit step to the CI workflow file.
```
