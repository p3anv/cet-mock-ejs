---
title: CETPrep — Internal Module Interfaces (As-Shipped)
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [engineers, integrators]
source_of_truth: true
---

# CETPrep — Internal Module Interfaces

> **No REST endpoints exist**. This documents the ES module exports that serve as internal "APIs" between modules.

---

## `storage.js` — Persistence Layer

**File**: `src/js/storage.js`  
**Imports**: None (pure `localStorage` wrapper)  
**Consumers**: `main.js`, `test.js`, `ui.js`

### Exports

| Function | Signature | Description |
|----------|-----------|-------------|
| `getAllTests` | `(): Test[]` | Returns all tests; `[]` on parse error |
| `getTestById` | `(id: string): Test \| undefined` | Finds test by `id` |
| `saveTest` | `(test: Test): void` | Appends to array; writes to `localStorage` |
| `deleteTestById` | `(id: string): void` | Removes test; cascades deletes attempts |
| `getAllAttempts` | `(): Attempt[]` | Returns all attempts; `[]` on parse error |
| `getAttemptsForTest` | `(testId: string): Attempt[]` | Filters attempts by `testId` |
| `saveAttempt` | `(attempt: Attempt): void` | Appends to attempts; writes to `localStorage` |
| `generateTestId` | `(): string` | Returns `"test_" + crypto.randomUUID()` (fallback: timestamp+random) |
| `getTheme` | `(): 'dark' \| 'light' \| null` | Reads `cetprep-theme` |
| `setTheme` | `(mode: 'dark' \| 'light'): void` | Writes `cetprep-theme` |
| `STORAGE_KEYS` | `{ STORAGE_KEY, ATTEMPTS_KEY, THEME_KEY }` | Constants for key names |

### Error Handling

- All `JSON.parse` wrapped in `try/catch` → return `[]` / `undefined`
- `QuotaExceededError` on `setItem` caught silently → no-op (data loss)

---

## `validate.js` — JSON Validation

**File**: `src/js/validate.js`  
**Imports**: None  
**Consumers**: `main.js` (Create Test)

### Exports

| Function | Signature | Description |
|----------|-----------|-------------|
| `validateJSONStructure` | `(data: unknown): { valid: boolean; error?: string }` | Validates test JSON array |

### Validation Rules

| Rule | Error Message |
|------|---------------|
| Input must be array | `"Must be an array."` |
| Array non-empty | `"At least one question required."` |
| Each `question` exists + string | `"Q{N}: missing question"` |
| Each `options` array length === 5 | `"Q{N}: need 5 options"` |
| Each `correct` integer 0-4 | `"Q{N}: correct 0-4"` |
| Each `explanation` exists + string | `"Q{N}: missing explanation"` |
| Each `paragraph` if present is string | `"Q{N}: paragraph must be string"` |
| Chart data values parse as numbers | `"Q{N}: chart values must be numbers, got 'X'"` |

---

## `charts.js` — Visualization Rendering

**File**: `src/js/charts.js`  
**Imports**: `Chart` from `'chart.js/auto'`  
**Consumers**: `test.js` (exam), `main.js` (indirect via import preview)

### Exports

| Function | Signature | Description |
|----------|-----------|-------------|
| `renderBarGraph` | `(canvasId: string, title: string, data: Record<string, number>): void` | Creates Chart.js bar chart |
| `renderLineGraph` | `(canvasId: string, title: string, data: Record<string, number>): void` | Creates Chart.js line chart |
| `renderPieChart` | `(canvasId: string, title: string, data: Record<string, number>): void` | Creates Chart.js pie chart |
| `renderTable` | `(canvasId: string, title: string, rows: string[][]): void` | Replaces `<canvas>` with HTML `<table>` |
| `renderParagraphWithVisualizations` | `(paragraphText: string, uniqueId: string): string` | Parses markup, returns HTML with `<canvas>`/`<table>` placeholders |
| `destroyChart` | `(canvasId: string): void` | Destroys Chart.js instance for `canvasId` |

### Chart Colors (via `getChartColors()`)

| Mode | Primary (Bar) | Success (Line) | Warning (Line Points) | Danger | Pie Palette |
|------|---------------|----------------|----------------------|--------|-------------|
| Dark | `#b8965c` | `#4cc38a` | `#d9a441` | `#e5484d` | 6-color array |
| Light | `#9a7d3a` | `#16a34a` | `#d97706` | `#dc2626` | 6-color array |

### Canvas Sizing (CSS `data-count`)

| Chart | Data Points | Min Height |
|-------|-------------|------------|
| Bar | 1-3 | 200px |
| Bar | 4-6 | 260px |
| Bar | 7-12 | 340px |
| Line | 1-6 | 220px |
| Line | 7-12 | 300px |
| Pie | Any | 200px (fixed) |

---

## `csv.js` — CSV Export

**File**: `src/js/csv.js`  
**Imports**: `{ unparse }` from `'papaparse'`  
**Consumers**: `test.js` (results modal)

### Exports

| Function | Signature | Description |
|----------|-----------|-------------|
| `generateCSV` | `(test: Test, resultsDetail: ResultDetail[], summary: Summary): string` | Builds rows, calls `unparse` |
| `downloadCSV` | `(content: string, filename: string): void` | Creates blob, triggers download |

### CSV Row Structure

| Row | Columns |
|-----|---------|
| 1 | Test Name, Category, Date, Time Taken (seconds), Score, Total, Percentage |
| 2 | [test.name, test.category, summary.date, summary.timeSeconds, summary.score, summary.total, summary.percentage + '%'] |
| 3 | (empty) |
| 4 | Question #, Question, Your Answer, Correct Answer, Result, Options, Explanation, Paragraph/Data |
| 5+ | Per-question detail rows |

---

## `ui.js` — Modal & Toast Utilities

**File**: `src/js/ui.js`  
**Imports**: `getTestById`, `getAllAttempts` from `storage.js`  
**Consumers**: `main.js`, `test.js`

### Exports

| Function | Signature | Description |
|----------|-----------|-------------|
| `showToast` | `(message: string, type?: 'success'\|'error'\|'info'\|'warning', title?: string): void` | Delegates to Alpine `toast` component |
| `showConfirmModal` | `(message: string, onConfirm: () => void, onCancel?: () => void): void` | Creates DOM modal with Confirm/Cancel |
| `showHistoryModal` | `(testId: string): void` | Fetches attempts, renders history modal |

### Toast Types

| Type | Border Color | Icon |
|------|--------------|------|
| `success` | `--color-success` (green) | ✓ |
| `error` | `--color-danger` (red) | ✕ |
| `warning` | `--color-warning` (amber) | ! |
| `info` | `--color-accent` (gold) | i |

---

## `main.js` — Dashboard App (Alpine `app`)

**File**: `src/js/main.js`  
**Exports**: `Alpine.data('app')`, `Alpine.data('toast')`  
**State**: See [Codebase Tour](03-development/codebase-tour.md#mainjs)

### Key Methods (Internal API)

| Method | Purpose |
|--------|---------|
| `loadTests()` | Refresh `this.tests` from `storage.getAllTests()` |
| `updateDashboardStats()` | Recompute statTests, statAttempts, statCategories |
| `generateTest()` | Validate + save new test |
| `getFilteredTests(category)` | Filter by category + search term |
| `attemptTest(testId)` | Open `test.html?id=${testId}` in new tab |
| `viewHistory(testId)` | Call `ui.showHistoryModal(testId)` |
| `deleteTest(testId)` | Confirm → `storage.deleteTestById` → update UI |
| `loadFolderTests(folderId)` | Fetch from GitHub API + Raw |
| `importTest(testId)` | Fetch JSON → save as new test |
| `importSelectedTests()` | Bulk import with progress |

---

## `test.js` — Exam App (Alpine `testApp`)

**File**: `src/js/test.js`  
**Exports**: `Alpine.data('testApp')`  
**State**: See [Codebase Tour](03-development/codebase-tour.md#testjs)

### Key Methods (Internal API)

| Method | Purpose |
|--------|---------|
| `init()` | Load test by ID from URL; init answers/marked arrays; start timer |
| `renderVisualizations()` | Parse paragraph → charts/tables via `charts.js` |
| `goToQuestion(idx)` | Navigate to question index |
| `toggleMark()` | Toggle `markedForReview[currentIndex]` |
| `showExplanation()` | Show explanation toast |
| `submitTest()` | Confirm → calculate score → save attempt → show results modal |
| `showResultsModal()` | Build results HTML + CSV download |
| `toggleTheme()` | Toggle `body.light` + persist |

### Keyboard Shortcuts (Internal Event Handler)

| Key | Action |
|-----|--------|
| `→` `l` `j` | Next question |
| `←` `h` `k` | Previous question |
| `Home` | First question |
| `End` | Last question |
| `1`-`9` | Select option |
| `m` `M` | Toggle mark |
| `e` `E` | Show explanation |
| `s` `S` | Submit test |
| `t` `T` | Toggle theme |
| `?` | Show help modal |

---

## Related Documents

- [API README](README.md) — Auth, versioning, errors, rate limits
- [Events & Webhooks](events-and-webhooks.md) — Async contracts
- [Data Model](01-architecture/data-model.md) — TypeScript interfaces
- [Codebase Tour](03-development/codebase-tour.md) — Module walkthrough