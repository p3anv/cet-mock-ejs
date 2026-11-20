---
title: CETPrep — Codebase Tour (For Incoming Maintainer)
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [engineers, maintainers]
source_of_truth: true
---

# CETPrep — Codebase Tour

> **Start here if you just inherited this codebase**. Module-by-module walkthrough with sharp edges highlighted.

---

## Entry Points

| File | Purpose | Loads |
|------|---------|-------|
| `index.html` | Main SPA (Dashboard, Create, My Tests, Samples, Import) | `<script type="module" src="/src/js/main.js">` |
| `test.html` | Exam interface (separate page) | `<script type="module" src="/src/js/test.js">` |

Both have `<body x-data="..." x-cloak>` — Alpine mounts on `body`.

---

## Module Map

```
src/js/
├── main.js       ← Dashboard app (Alpine 'app' + 'toast')
├── test.js       ← Exam app (Alpine 'testApp')
├── storage.js    ← localStorage CRUD (pure functions)
├── charts.js     ← Chart.js wrappers + paragraph parser
├── validate.js   ← JSON validation
├── csv.js        ← PapaParse CSV export
└── ui.js         ← Modal/toast utilities (DOM-based)
```

---

## main.js — Dashboard App (Alpine `app`)

**Size**: ~700 lines  
**Component**: `Alpine.data('app', () => ({ ... }))`  
**Mount**: `<body x-data="app" x-cloak>` in `index.html:10`

### State (Reactive)

| Property | Type | Purpose |
|----------|------|---------|
| `currentPage` | string | Active hash route: `'dashboard' \| 'create' \| 'tests' \| 'samples' \| 'import'` |
| `theme` | `'dark' \| 'light'` | Current theme (persisted) |
| `testName` | string | Create form: test name input |
| `testCategory` | string | Create form: category select |
| `jsonInput` | string | Create form: JSON textarea |
| `fileStatus` | string | Create form: file upload status |
| `categories` | string[] | `['Verbal Ability', 'Logical Reasoning', 'Quants', 'Misc']` |
| `activeTab` | string | My Tests: active category tab |
| `searchTerms` | Record<string,string> | Per-category search terms |
| `tests` | Test[] | Local copy of all tests (from localStorage) |
| `statTests` | number | Dashboard: test count |
| `statAttempts` | number | Dashboard: attempt count |
| `statCategories` | string | Dashboard: category count + '+' |
| `jsonSamples` | Sample[] | 7 hardcoded JSON samples |
| `testFolders` | FolderConfig[] | 4 GitHub folders (reading, vocab, di, lr) |
| `folderTests` | Record<string, FolderState> | Per-folder: tests[], loaded, loading, error, searchTerm, selectAll |
| `activeFolder` | string \| null | Import: selected folder |
| `globalSearchTerm` | string | Import: global search across folders |
| `selectedTests` | string[] | Import: selected test IDs for bulk import |
| `selectAllInFolder` | boolean | Import: select all checkbox |
| `importLoading` | boolean | Import: loading state |
| `importMessage` | string | Import: loading message |
| `importSuccess` | boolean | Import: success flag |
| `importError` | boolean | Import: error flag |
| `importErrorMessage` | string | Import: error details |
| `importedTestName` | string | Import: success message detail |
| `lastSyncTime` | string \| null | Import: last fetch timestamp |

### Key Methods

| Method | Lines | Purpose |
|--------|-------|---------|
| `init()` | 214-244 | Theme init, hash routing, load tests, init folder state |
| `loadTests()` | 246-249 | Refresh `this.tests` from `storage.getAllTests()` |
| `loadFromHash()` | 251-258 | Parse `window.location.hash` → `showPage()` |
| `showPage(page)` | 260-278 | Route change + scroll top + tab reset |
| `updateDashboardStats()` | 284-295 | Recompute stats from storage |
| `toggleTheme()` | 297-310 | Flip theme + persist + update icon |
| `generateTest()` | 334-362 | Validate + save + toast + reset form |
| `getFilteredTests(cat)` | 368-376 | Filter by category + search term |
| `attemptTest(id)` | 378-380 | Open `test.html?id=...` in new tab |
| `deleteTest(id)` | 386-394 | Confirm → storage.delete → update UI |
| `loadFolderTests(folderId)` | 430-498 | Fetch GitHub API + Raw for folder |
| `importTest(testId)` | 580-622 | Single test import from GitHub |
| `importSelectedTests()` | 624-696 | Bulk import with progress |

### Sharp Edges

| Edge | Location | Why It's Sharp |
|------|----------|----------------|
| **Hash routing** | 251-258 | Manual `history.replaceState` + `hashchange` listener; no router lib |
| **GitHub API rate limit** | 430-498 | No backoff/retry; 60/hr unauth; user sees toast error |
| **Folder state machine** | 417-428, 430-498 | `loaded`/`loading`/`error` flags; easy to get out of sync |
| **Bulk import sequential** | 654-674 | Sequential `fetch` to avoid rate limit burst; slow for many tests |
| **Theme icon `x-html`** | 33, 304-309 | Dynamic SVG string via `x-html` — XSS surface if ever user-controlled |
| **`$watch` + `$nextTick` for charts** | 48-50 | Critical timing for Chart.js canvas rendering |

---

## test.js — Exam App (Alpine `testApp`)

**Size**: ~460 lines  
**Component**: `Alpine.data('testApp', () => ({ ... }))`  
**Mount**: `<body x-data="testApp" x-cloak>` in `test.html:9`

### State (Reactive)

| Property | Type | Purpose |
|----------|------|---------|
| `test` | Test \| null | Loaded test (from `storage.getTestById`) |
| `testId` | string \| null | From URL `?id=...` |
| `currentIndex` | number | Current question (0-based) |
| `answers` | (number\|null)[] | User selections per question |
| `markedForReview` | boolean[] | Mark-for-review flags |
| `timerInterval` | number \| null | `setInterval` handle |
| `timeSeconds` | number | Elapsed seconds |
| `submitted` | boolean | Prevents further answers/timer |
| `cleanupFns` | Function[] | Cleanup on destroy |
| `keyHandler` | Function \| null | Keydown listener ref |

### Key Methods

| Method | Lines | Purpose |
|--------|-------|---------|
| `init()` | 26-67 | Load test by ID; init arrays; start timer; keyboard shortcuts; wait for DOM |
| `setupKeyboardShortcuts()` | 69-150 | 20+ key bindings with guards |
| `startTimer()` | 224-231 | `setInterval` 1s increment |
| `renderVisualizations()` | 277-299 | Parse paragraph → charts/tables via `charts.js` |
| `submitTest()` | 301-305 | Confirm modal → `submitAndShowResults()` |
| `submitAndShowResults()` | 342-393 | Score calc + save attempt + CSV + results modal |
| `showResultsModal()` | 395-449 | Build results HTML + event listeners |
| `toggleTheme()` | 458-463 | Toggle `body.light` + persist |

### Computed / Getters

| Getter | Purpose |
|--------|---------|
| `timerDisplay` | `MM:SS` formatted |
| `themeIcon` | Dynamic SVG for theme toggle |
| `navButtons` | Array for navigator grid (answered/marked/current flags) |

### Sharp Edges

| Edge | Location | Why It's Sharp |
|------|----------|----------------|
| **`waitForParagraphBox` retry loop** | 52-61 | Polls `requestAnimationFrame` until `#paragraphBox` exists |
| **`$watch` + `$nextTick` + `setTimeout(0)`** | 48-50, 294-298 | Triple async safety for Chart.js — fragile but works |
| **Keyboard shortcut guards** | 71-75 | Ignores input/textarea/select; ignores ctrl/meta/alt |
| **Explanation toast (not Alpine)** | 261-275 | Creates DOM elements directly — not reactive |
| **Results modal (not Alpine)** | 395-449 | `document.createElement` + manual listeners — not `x-show` |
| **Timer in background tabs** | 224-231 | `setInterval` throttled by browser; time drifts |

---

## storage.js — Persistence Layer

**Size**: ~55 lines  
**Exports**: 11 functions + `STORAGE_KEYS` constant  
**Dependencies**: None (pure `localStorage`)

### Functions

| Function | Purpose |
|----------|---------|
| `getAllTests()` | Parse `cet_mock_tests_v3` → `Test[]` |
| `getTestById(id)` | Find test in array |
| `saveTest(test)` | Push + stringify + setItem |
| `deleteTestById(id)` | Filter tests + cascade delete attempts |
| `getAllAttempts()` | Parse `cet_test_attempts` → `Attempt[]` |
| `getAttemptsForTest(id)` | Filter attempts |
| `saveAttempt(attempt)` | Push + stringify + setItem |
| `generateTestId()` | `test_` + `crypto.randomUUID()` (fallback) |
| `getTheme()` | Get `cetprep-theme` |
| `setTheme(mode)` | Set `cetprep-theme` |

### Sharp Edges

| Edge | Location | Why It's Sharp |
|------|----------|----------------|
| **Silent quota failure** | 5-10, 18-21, 30-33 | `QuotaExceededError` caught → returns `[]` / no-op; user never knows |
| **No migration** | 1-3 | Key suffix `_v3` = version; no upgrade logic |
| **Cascade delete** | 23-27 | Deleting test removes attempts — irreversible |

---

## charts.js — Visualization Engine

**Size**: ~410 lines  
**Exports**: 6 functions  
**Dependencies**: `Chart` from `'chart.js/auto'`

### Functions

| Function | Purpose |
|----------|---------|
| `renderBarGraph(canvasId, title, data)` | Chart.js bar chart |
| `renderLineGraph(canvasId, title, data)` | Chart.js line chart |
| `renderPieChart(canvasId, title, data)` | Chart.js pie chart |
| `renderTable(canvasId, title, rows)` | Replaces `<canvas>` with HTML `<table>` |
| `renderParagraphWithVisualizations(text, uniqueId)` | **Core parser** — returns HTML with placeholders |
| `destroyChart(canvasId)` | Cleanup Chart.js instance |

### Paragraph Parser (`renderParagraphWithVisualizations`)

**Lines**: 312-410  
**Algorithm**: Single-pass line parser with state machine

```
States: NONE → CHART_TYPE → TITLE → DATA_LINES → NONE
Tags:   [BARGRAPH], [LINEGRAPH], [PIEGRAPH], [TABLE]
```

**Output**: HTML string with:
- `<div class="paragraph-text">` for plain text
- `<div class="chart-container"><canvas id="..."></canvas></div>` for charts
- `<div class="chart-container"><table id="..."></table></div>` for tables

**Async rendering**: `setTimeout(() => renderX(), 0)` for each chart/table

### Sharp Edges

| Edge | Location | Why It's Sharp |
|------|----------|----------------|
| **State machine parsing** | 322-353 | Complex nested conditions; easy to break with new tag |
| **`uniqueId` collision risk** | 296 | `crypto.randomUUID()` + `Date.now()` + random — very low but non-zero |
| **Table replaces canvas** | 306 | `canvas.parentNode.replaceChild(tableContainer, canvas)` — mutates DOM |
| **Color derivation from CSS** | 19-38 | `getComputedStyle` on `:root` — fails if called before CSS loaded |
| **Chart instance Map** | 65-73 | `destroyChart` required before re-render; memory leak if missed |

---

## validate.js — JSON Validation

**Size**: ~55 lines  
**Exports**: `validateJSONStructure(data)`  
**Dependencies**: None

### Validation Rules (in order)

1. Input is array
2. Array non-empty
3. Each question: `question` (string), `options` (5 strings), `correct` (0-4), `explanation` (string)
4. `paragraph` if present: string
5. Chart data lines: values parse as numbers

### Sharp Edges

| Edge | Location | Why It's Sharp |
|------|----------|----------------|
| **Chart validation minimal** | 13-54 | Only checks numeric values; doesn't validate structure completeness |
| **Error messages 1-indexed** | 8-11 | `"Q3: need 5 options"` — matches user mental model |
| **No schema version** | — | Can't detect format drift over time |

---

## csv.js — CSV Export

**Size**: ~25 lines  
**Exports**: `generateCSV`, `downloadCSV`  
**Dependencies**: `{ unparse }` from `'papaparse'`

### `generateCSV(test, resultsDetail, summary)`

Builds rows array:
1. Header row
2. Summary row
3. Empty row
4. Detail header row
5. Per-question detail rows

Calls `unparse(rows)` → RFC 4180 compliant CSV string.

### Sharp Edges

| Edge | Location | Why It's Sharp |
|------|----------|----------------|
| **Paragraph newlines** | 11 | `.replace(/\n/g, ' ')` — flattens multiline paragraphs |
| **Options joined with ` \| `** | 10 | Custom delimiter; not standard CSV escaping (PapaParse handles) |

---

## ui.js — Modal/Toast Utilities

**Size**: ~110 lines  
**Exports**: `showToast`, `showConfirmModal`, `showHistoryModal`  
**Dependencies**: `storage.js` (for history)

### Pattern

All create DOM elements directly (`document.createElement`), append to `body`, attach listeners, remove on close. **Not Alpine components** (except `showToast` delegates to Alpine `toast`).

### Sharp Edges

| Edge | Location | Why It's Sharp |
|------|----------|----------------|
| **Modal cleanup** | 37-56, 98-108 | Manual `removeEventListener` + `modal.remove()` — easy to leak listeners |
| **`x-html` for toast icon** | — | Toast component uses `x-text` for icon (✓/✕/i/!) — safe |
| **History modal queries storage** | 59-62 | Calls `getTestById` + `getAllAttempts` — synchronous |

---

## CSS Files (Frozen)

| File | Size | Purpose |
|------|------|---------|
| `src/css/index.css` | ~2400 lines | Dashboard, builder, library, samples, import |
| `src/css/test.css` | ~2350 lines | Exam interface |

**Both**: Only change = `[x-cloak] { display: none !important; }` at line 1.

### Design System (CSS Variables)

Defined in `:root` (dark) and `body.light` override:

| Category | Variables |
|----------|-----------|
| Background | `--bg`, `--bg-soft`, `--sidebar`, `--surface`, `--surface-2`, `--surface-hover`, `--surface-raised` |
| Border | `--border`, `--border-light`, `--border-focus` |
| Text | `--text`, `--text-secondary`, `--text-muted` |
| Accent | `--accent`, `--accent-soft`, `--accent-strong` |
| Semantic | `--success`, `--danger`, `--warning`, `--info` (+ soft variants) |
| Radius | `--radius-sm` through `--radius-full` |
| Shadows | `--shadow-sm` through `--shadow-xl` |
| Transitions | `--transition`, `--transition-slow` |

---

## Navigation Map (Where to Look For...)

| Task | File(s) |
|------|---------|
| Add new chart type | `charts.js` (parser + render), `test.css` (sizing), `validate.js` (validation) |
| Change localStorage key | `storage.js` (constants), all consumers |
| Modify exam timer | `test.js` (`startTimer`, `timerDisplay`, `submitTest`) |
| Add keyboard shortcut | `test.js` (`setupKeyboardShortcuts`) |
| Change GitHub repo | `main.js` (`GITHUB_*_BASE`, `TEST_FOLDERS`, `folderToCategory`) |
| Modify JSON format | `validate.js`, `charts.js` (parser), `main.js` (samples) |
| Fix visual bug | `src/css/index.css` or `src/css/test.css` (frozen — verify first) |
| Add toast type | `ui.js` (`showToast`), `index.css` (`.toast.{type}`) |
| Debug import failure | `main.js` (`loadFolderTests`, `importTest`), Network tab |

---

## Related Documents

- [Setup](setup.md) — Verified bootstrap steps
- [Conventions](conventions.md) — Code style, patterns
- [Architecture](01-architecture/architecture.md) — System design
- [API Endpoints](02-api/endpoints.md) — Module interfaces