---
title: CETPrep — API & Interfaces (As-Shipped)
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [integrators, engineers, architects]
source_of_truth: true
---

# CETPrep — API & Interfaces

> **No REST API exists** — this is a pure frontend application. This section documents internal module interfaces, data contracts, and async events.

---

## Auth Model

**None**. No authentication, authorization, tokens, sessions, or API keys.

- No user accounts
- No login/logout
- Data scoped to browser `localStorage` (per origin)
- Theme preference is the only "session" state

---

## Versioning

**N/A** — no versioned API. Module interfaces are internal and change with code deployments.

| Interface | Versioning Strategy |
|-----------|---------------------|
| `storage.js` exports | Breaking change = new localStorage key suffix (`_v4`) |
| `validate.js` | Additive only (new rules don't break valid input) |
| `charts.js` | Additive (new chart types); existing render signatures stable |
| `csv.js` | Stable — `generateCSV(test, resultsDetail, summary)` |
| `ui.js` | Stable — toast/modal signatures |
| JSON question format | **Frozen** per PRD — cannot change |

---

## Error Format

### Internal Module Errors

| Module | Error Pattern | Example |
|--------|---------------|---------|
| `validate.js` | `{ valid: false, error: string }` | `{ valid: false, error: "Q3: need 5 options" }` |
| `storage.js` | Silent `try/catch` → returns `[]` / no-op | `getAllTests()` returns `[]` on corrupt JSON |
| `charts.js` | Early return if canvas not found | `renderBarGraph('missing', ...)` → no-op |
| `fetch` (GitHub) | Toast: `Failed to load X: {message}` | Network error, 404, rate limit |

### User-Visible Errors (Toasts)

All surfaced via `ui.js:showToast(message, type, title)`:

| Type | Use Case | Title |
|------|----------|-------|
| `success` | Test created, imported, submitted | "Success" |
| `error` | Invalid JSON, import failed, test not found | "Error" |
| `warning` | Rate limit, quota near | "Warning" |
| `info` | Theme toggle, no attempts yet | "Info" |

---

## Pagination

**N/A** — no paginated endpoints. All data loaded in memory:

- `getAllTests()` → full array
- `getAllAttempts()` → full array
- GitHub folder listing → full file list (typically <50 files/folder)

---

## Rate Limits

| Source | Limit | Handling |
|--------|-------|----------|
| GitHub API (unauth) | 60 req/hr per IP | No backoff; toast error; manual retry |
| GitHub Raw | No published limit | Standard CDN limits |
| localStorage | 5-10 MB quota | Silent fail on `QuotaExceededError` |
| `navigator.clipboard` | Browser-dependent | Fails silently if denied |

---

## Idempotency

| Operation | Idempotent? | Notes |
|-----------|-------------|-------|
| `saveTest(test)` | **No** — appends to array | Duplicate IDs possible if called twice |
| `deleteTestById(id)` | **Yes** — filter removes | Safe to call multiple times |
| `saveAttempt(attempt)` | **No** — appends | Each submit = new attempt |
| `importTest(testId)` | **No** — creates new test | Generates new `test_` ID each time |
| Theme toggle | **Yes** — overwrites | `setTheme('dark')` × N = same result |

---

## Deprecation Policy

**No formal policy** — internal project. Breaking changes deployed with version bump in `package.json`.

| Change Type | Example | Migration |
|-------------|---------|-----------|
| localStorage key rename | `cet_mock_tests_v3` → `_v4` | Manual — old data orphaned |
| JSON format change | New required field | `validate.js` updated; old tests invalid |
| Module export removed | `storage.js` function dropped | Compile-time error in consumers |

---

## Current Supported Versions

| Component | Version | Status |
|-----------|---------|--------|
| **CETPrep App** | 1.0.0 | Active |
| **Vite** | 8.3.8 | Current |
| **Alpine.js** | 3.14.1 | Current |
| **Chart.js** | 4.4.7 | Current |
| **PapaParse** | 5.5.2 | Current |
| **Node.js** | 18+ (implied) | Required for build |

---

## Internal Module Interfaces (Reference)

### `storage.js`

```typescript
// Test CRUD
getAllTests(): Test[]
getTestById(id: string): Test | undefined
saveTest(test: Test): void
deleteTestById(id: string): void
generateTestId(): string

// Attempt CRUD
getAllAttempts(): Attempt[]
getAttemptsForTest(testId: string): Attempt[]
saveAttempt(attempt: Attempt): void

// Theme
getTheme(): 'dark' | 'light' | null
setTheme(mode: 'dark' | 'light'): void

// Constants
STORAGE_KEYS: { STORAGE_KEY, ATTEMPTS_KEY, THEME_KEY }
```

### `validate.js`

```typescript
validateJSONStructure(data: unknown): { valid: boolean; error?: string }
```

### `charts.js`

```typescript
renderBarGraph(canvasId: string, title: string, data: Record<string, number>): void
renderLineGraph(canvasId: string, title: string, data: Record<string, number>): void
renderPieChart(canvasId: string, title: string, data: Record<string, number>): void
renderTable(canvasId: string, title: string, rows: string[][]): void
renderParagraphWithVisualizations(paragraphText: string, uniqueId: string): string
destroyChart(canvasId: string): void
```

### `csv.js`

```typescript
generateCSV(test: Test, resultsDetail: ResultDetail[], summary: Summary): string
downloadCSV(content: string, filename: string): void
```

### `ui.js`

```typescript
showToast(message: string, type: 'success'|'error'|'info'|'warning', title?: string): void
showConfirmModal(message: string, onConfirm: () => void, onCancel?: () => void): void
showHistoryModal(testId: string): void
```

---

## Async Events / Webhooks

**None** — no webhooks, no event streaming, no message queues.

### Internal Async Events

| Event | Source | Consumers |
|-------|--------|-----------|
| `hashchange` | Browser | `main.js:loadFromHash()` |
| `beforeunload` | Browser | `test.js:enableBeforeUnload()` |
| `keydown` | Browser | `test.js:keyHandler` |
| `fetch` complete | GitHub API/Raw | `main.js` async functions |
| `setInterval` tick | Timer | `test.js:startTimer()` |
| `localStorage` change | Other tab | **Not listened** (gap) |

---

## Related Documents

- [Endpoints](endpoints.md) — Internal module interface reference
- [Events & Webhooks](events-and-webhooks.md) — Async contracts detail
- [Breaking Changes](breaking-changes.md) — Historical breaking changes
- [Data Model](01-architecture/data-model.md) — Entity schemas