# Phase F Agent Instructions — Tier 3 DSA Components

> **Agent:** Read `AGENT-CONTEXT.md` fully before starting this file.
> **Goal:** Build the high-performance, algorithmically deep components (VirtualList, CommandPalette, DataGrid) using optimal search, sorting, and virtual scroll indexing.
> **Commit target:** `feat(phase-F): Tier 3 DSA Components — VirtualList, CommandPalette, DataGrid`

---

## PHASE OVERVIEW

**What this phase produces:**
- `VirtualList` — A virtual scroll viewport using O(n) prefix-sums on mount and O(log n) binary search lookups on scroll to render only visible list items.
- `CommandPalette` — A search dialog overlay that scores and filters option tags using Sørensen-Dice trigram similarity calculations.
- `DataGrid` — Spreadsheet-style interactive tables supporting arrow key cell focus tracking (X, Y coordinates) and column sorting.

**Why this order matters:**
- CommandPalette and DataGrid must import `VirtualList` to render large lists cleanly.
- Grid navigability logic requires utilities to track coordinates, which must be fully validated.

**Skills to read first:**
- `.agents/skills/senior-frontend/SKILL.md`
- `.agents/skills/system-design/SKILL.md`

---

## DATA STRUCTURES & ALGORITHMS RULES (CRITICAL)

### 1. VirtualList: Prefix-Sum + Binary Search
We avoid O(n) linear scans inside scroll handlers, which degrade scroll performance at 60fps on large lists.
- Compute cumulative row heights on mount to build the prefix-sum array.
- On scroll events, run a binary search over the prefix-sum array to locate the visible bounds in O(log n) time.
```typescript
// Binary searchVisibleIndex (O(log n))
let lo = 0, hi = cumulativeHeights.length - 1;
while (lo < hi) {
  const mid = (lo + hi) >>> 1;
  if (cumulativeHeights[mid] < scrollTop) lo = mid + 1;
  else hi = mid;
}
```

### 2. CommandPalette: Sørensen-Dice Trigrams
Fuzzy matches should catch minor typos.
- Split words into 3-character slices (trigrams) on filter queries.
- Score options based on matching slices. Ignore items scoring below `0.2` and sort results in descending order.

---

## TASK EXECUTION SEQUENCE

---

### TASK F.1 — VirtualList
**File:** `Implementation Plan/Phase F - Tier 3 DSA Components/Task F.1 - VirtualList.md`

- **Technical Spec:**
  Dynamic virtualization container. Computes height indices to render only visible nodes.
- **Verification:**
  Assert that rendering 10,000 items mounts fewer than 50 visual DOM nodes. Verify scrolling is smooth.

---

### TASK F.2 — CommandPalette
**File:** `Implementation Plan/Phase F - Tier 3 DSA Components/Task F.2 - CommandPalette.md`

- **Technical Spec:**
  Search overlay box using Sørensen-Dice trigram calculations.
- **Keyboard navigation:**
  Keep focus on search input and map Arrow keys to navigate options via `aria-activedescendant`.
- **Verification:**
  Verify that typing "btn" returns "Button" options and that `aria-activedescendant` correctly tracks highlighted options.

---

### TASK F.3 — DataGrid
**File:** `Implementation Plan/Phase F - Tier 3 DSA Components/Task F.3 - DataGrid.md`

- **Technical Spec:**
  Virtualized spread-grid. Coordinate indices (X, Y) track cell-focus.
- **Accessibility:**
  Set `role="grid"`, `role="row"`, and `role="gridcell"`.
- **Verification:**
  Assert that Arrow keys navigate cell focus correctly. Assert column headers update `aria-sort` direction on click.

---

## PHASE F COMPLETION PROTOCOL

### Run Final Phase Check
```bash
pnpm lint
pnpm typecheck
pnpm test
```

### Create Walkthrough
Create `Walkthroughs/Phase F - Tier 3 DSA Components/Walkthrough.md` detailing:
1. Binary search complexity profiling.
2. Trigram indexing comparisons against standard substring regex matching.
3. Spreadsheet-style coordinate focus management logic.

### Git Commit
```bash
git add .
git commit -m "feat(phase-F): Tier 3 DSA Components — VirtualList, CommandPalette, DataGrid

- VirtualList: O(n) prefix-sums on mount, O(log n) binary search on scroll
- CommandPalette: Sørensen-Dice trigram similarity sorting thresholded at 0.2
- DataGrid: spreadsheet-style gridcell coordinates and column sorting
- Large dataset performance verified with under 50 visible DOM rows

Phase: F
Tasks: F.1, F.2, F.3
Tests: 12 unit | 6 axe | 2 integration
Breaking: none"

git push origin dev
```

### Update Master Index
Open `00-MASTER-INDEX.md` and mark all Phase F tasks as ✅.

---

## WHAT RECRUITER SEES IN THIS COMMIT

A recruiter reviewing this commit sees:
- **"They write high-performance UI components"** — binary search and prefix-sum optimizations show advanced computer science foundations applied to web views.
- **"They know fuzzy search math"** — using Sørensen-Dice trigram similarity sorting proves engineering maturity.
- **"They handle complex accessibility roles"** — cell coordinate focus tracking and `aria-activedescendant` updates prove senior ARIA capabilities.
