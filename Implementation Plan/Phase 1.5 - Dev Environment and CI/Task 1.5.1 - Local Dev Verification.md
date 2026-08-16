# Task 1.5.1 — Local Dev Verification

**Phase:** 1.5 — Dev Environment & CI Bootstrap  
**Blocked by:** A.1–A.4, B.1–B.5 (Monorepo scaffold and Token Pipeline complete)  
**Blocks:** C.1, C.2, C.3  
**Week:** After Week 2  
**AI Skill to use:** `senior-frontend`

---

## 1. What I'm Building

A programmatic environment checker script (`scripts/check-env.js`) and root scripts to verify the local monorepo environment is contributor-ready before writing any component code. This ensures all workspaces resolve dependencies natively and packages compile correctly.

---

## 2. Architectural Decisions & Trade-offs

- **Programmatic Environment Assertion**: Relying on developers to read README instructions and check versions leads to human errors. A script that fails the build (returns exit code 1) on incorrect environments guarantees consistency across local setups and CI run containers.
- **Root-level Dependency Guard**: The script checks if local locks have been corrupted by verify-running check-env during the `preinstall` or workspace boostrap phase.

---

## 3. Implementation Plan & Approach

### 1. Create `scripts/check-env.js`

Create this script in the root under `scripts/check-env.js`. It should programmatically verify:

- Node.js version matches `^20` (Node 20 LTS).
- pnpm version is `>=8`.
- The root `pnpm-lock.yaml` file exists.

```javascript
// scripts/check-env.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function checkEnv() {
  console.log('🔍 Checking local development environment...');

  // 1. Check Node.js Version
  const nodeVersion = process.versions.node;
  const majorNode = parseInt(nodeVersion.split('.')[0], 10);
  if (majorNode !== 20) {
    console.error(`❌ Invalid Node version: Expected Node 20.x, found ${nodeVersion}`);
    process.exit(1);
  }
  console.log(`✅ Node.js Version: ${nodeVersion}`);

  // 2. Check pnpm Version
  try {
    const pnpmVersion = execSync('pnpm --version').toString().trim();
    const majorPnpm = parseInt(pnpmVersion.split('.')[0], 10);
    if (majorPnpm < 8) {
      console.error(`❌ Invalid pnpm version: Expected pnpm >= 8.x, found ${pnpmVersion}`);
      process.exit(1);
    }
    console.log(`✅ pnpm Version: ${pnpmVersion}`);
  } catch (err) {
    console.error('❌ pnpm is not installed. Please run: npm install -g pnpm');
    process.exit(1);
  }

  // 3. Verify pnpm-lock.yaml existence
  const lockfilePath = path.join(__dirname, '..', 'pnpm-lock.yaml');
  if (!fs.existsSync(lockfilePath)) {
    console.error(
      '❌ Missing pnpm-lock.yaml at root directory. Run "pnpm install" to generate it.'
    );
    process.exit(1);
  }
  console.log('✅ pnpm-lock.yaml detected.');

  console.log('🚀 Environment is 100% operational and contributor-ready!');
  process.exit(0);
}

checkEnv();
```

### 2. Update Root `package.json`

Add script references inside the root `package.json`:

```json
"scripts": {
  "check-env": "node scripts/check-env.js",
  "preinstall": "node scripts/check-env.js"
}
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Dynamic Lockfile Deletion**: If a developer runs `npm install` inside a package folder, it generates a localized `package-lock.json` file which bypasses pnpm workspace link resolutions. Add git protection rules and check-scripts in CI to locate and fail the build if a `package-lock.json` or `yarn.lock` is detected in any workspace directory.
- **Node engine enforcement**: Also ensure the root `package.json` contains the `"engines"` configuration:
  ```json
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  }
  ```

---

## 5. Definition of Done

- [ ] `scripts/check-env.js` exists and outputs success logs.
- [ ] Root `package.json` scripts contain `"check-env"` and run it on `"preinstall"`.
- [ ] Running `pnpm check-env` exits with code 0 on Node 20 + pnpm >= 8.
- [ ] Attempting to run the script on Node 18 or Node 22 exits with code 1.

---

## 6. QA Test Scenarios

| Scenario              | Command                                                                | Expected Result                                            |
| --------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------- |
| Run validation script | `pnpm check-env`                                                       | Script exits with 0 and prints env version logs.           |
| Missing lockfile      | Temporarily rename `pnpm-lock.yaml` and run `pnpm check-env`           | Script prints error for missing lockfile and exits with 1. |
| Node version mismatch | Run script using node 18/22: `nvm use 22 && node scripts/check-env.js` | Script prints version error and exits with 1.              |

---

## 7. AI Code Loop Prompt

```
TASK: 1.5.1 — Local Dev Verification

Create a scripts directory in the workspace root if it does not exist.
Create scripts/check-env.js with programmatic Node version (exactly 20.x check), pnpm version (>= 8.x check), and root pnpm-lock.yaml file existence checking logic.
Update the root package.json scripts configuration to include "check-env": "node scripts/check-env.js" and add it as a "preinstall" step.
```
