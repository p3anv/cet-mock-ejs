---
title: CETPrep — Architecture (As-Built C4 L2/L3)
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [engineers, architects, sre]
source_of_truth: true
---

# CETPrep — Architecture (As-Built)

## C4 Level 2 — Container Diagram

```mermaid
C4Container
title Container Diagram — CETPrep (As-Built)

Person(student, "Student", "Test taker")

System_Boundary(browser, "Browser (User's Device)") {
    Container(index, "index.html", "HTML + Alpine.js", "Dashboard, Builder, Library, Samples, Import")
    Container(test, "test.html", "HTML + Alpine.js", "Exam interface: timer, navigator, questions, results")
    ContainerDb(ls_tests, "localStorage: cet_mock_tests_v3", "Key-Value", "Test definitions (id, name, category, questions[], createdAt)")
    ContainerDb(ls_attempts, "localStorage: cet_test_attempts", "Key-Value", "Attempt records (testId, score, answers[], timeSeconds, date)")
    ContainerDb(ls_theme, "localStorage: cetprep-theme", "Key-Value", "Theme preference: 'dark' | 'light'")
}

System_Ext(github_api, "GitHub API", "REST API")
System_Ext(github_raw, "GitHub Raw", "Static file hosting")

Rel(student, index, "Uses", "HTTPS / Local")
Rel(student, test, "Takes exam", "HTTPS / Local")
Rel(index, ls_tests, "Reads/Writes", "localStorage API")
Rel(index, ls_attempts, "Reads", "localStorage API")
Rel(index, ls_theme, "Reads/Writes", "localStorage API")
Rel(test, ls_tests, "Reads", "localStorage API")
Rel(test, ls_attempts, "Writes", "localStorage API")
Rel(test, ls_theme, "Reads/Writes", "localStorage API")
Rel(index, github_api, "Lists test folders/files", "HTTPS / REST")
Rel(index, github_raw, "Fetches test JSON", "HTTPS / GET")
```

## C4 Level 3 — Component Diagram (index.html / main.js)

```mermaid
C4Component
title Component Diagram — index.html (Dashboard App)

Container(index, "index.html", "Alpine.js App", "Root: <body x-data='app'>")

Component(app, "Alpine Component: app", "main.js:Alpine.data('app')", "State: currentPage, theme, tests, searchTerms, folderTests, import state")
Component(storage, "storage.js", "ES Module", "getAllTests, saveTest, deleteTestById, getAllAttempts, getTheme, setTheme")
Component(validate, "validate.js", "ES Module", "validateJSONStructure(data)")
Component(ui, "ui.js", "ES Module", "showToast, showConfirmModal, showHistoryModal")
Component(charts, "charts.js", "ES Module", "renderBarGraph, renderLineGraph, renderPieChart, renderTable, renderParagraphWithVisualizations")

Rel(app, storage, "Imports", "ES Module")
Rel(app, validate, "Imports", "ES Module")
Rel(app, ui, "Imports", "ES Module")
Rel(app, charts, "Imports (indirect via test.js)", "ES Module")
```

## C4 Level 3 — Component Diagram (test.html / test.js)

```mermaid
C4Component
title Component Diagram — test.html (Exam App)

Container(test, "test.html", "Alpine.js App", "Root: <body x-data='testApp'>")

Component(testApp, "Alpine Component: testApp", "test.js:Alpine.data('testApp')", "State: test, currentIndex, answers[], markedForReview[], timer, submitted")
Component(storage, "storage.js", "ES Module", "getTestById")
Component(ui, "ui.js", "ES Module", "showToast")
Component(csv, "csv.js", "ES Module", "generateCSV, downloadCSV")
Component(charts, "charts.js", "ES Module", "renderBarGraph, renderLineGraph, renderPieChart, renderTable, renderParagraphWithVisualizations")

Rel(testApp, storage, "Imports", "ES Module")
Rel(testApp, ui, "Imports", "ES Module")
Rel(testApp, csv, "Imports", "ES Module")
Rel(testApp, charts, "Imports", "ES Module")
```

---

## Module Boundaries & Responsibilities

| Module | Exports | Responsibility | Consumers |
|--------|---------|----------------|-----------|
| `storage.js` | `getAllTests, getTestById, saveTest, deleteTestById, getAllAttempts, getAttemptsForTest, saveAttempt, generateTestId, getTheme, setTheme, STORAGE_KEYS` | All `localStorage` CRUD; key constants | `main.js`, `test.js`, `ui.js` |
| `validate.js` | `validateJSONStructure(data)` | Validates test JSON: array, 5 options, correct 0-4, explanation, paragraph string, chart data numbers | `main.js` (Create Test) |
| `charts.js` | `renderBarGraph, renderLineGraph, renderPieChart, renderTable, renderParagraphWithVisualizations, destroyChart` | Chart.js wrappers + paragraph parser for `[BARGRAPH]`/`[LINEGRAPH]`/`[PIEGRAPH]`/`[TABLE]` | `test.js` (exam), `main.js` (import preview - indirect) |
| `csv.js` | `generateCSV(test, resultsDetail, summary), downloadCSV(content, filename)` | PapaParse CSV generation + blob download | `test.js` (results export) |
| `ui.js` | `showToast, showConfirmModal, showHistoryModal` | Reusable modal/toast utilities (DOM-based, not Alpine) | `main.js`, `test.js` |
| `main.js` | `Alpine.data('app')`, `Alpine.data('toast')` | Dashboard, Create, My Tests, Samples, Import pages; hash routing; GitHub import | `index.html` |
| `test.js` | `Alpine.data('testApp')` | Exam interface: timer, navigator, answers, mark-for-review, shortcuts, results modal | `test.html` |

---

## Request / Data Flows

### 1. Create Test Flow

```mermaid
sequenceDiagram
    participant User
    participant main.js as Alpine app
    participant validate.js
    participant storage.js
    participant localStorage

    User->>main.js: Fill form (name, category, JSON)
    User->>main.js: Click "Create test"
    main.js->>validate.js: validateJSONStructure(parsed)
    alt Invalid JSON
        validate.js-->>main.js: {valid: false, error}
        main.js->>User: showToast(error, 'error')
    else Valid
        main.js->>storage.js: generateTestId()
        main.js->>storage.js: saveTest(newTest)
        storage.js->>localStorage: SET cet_mock_tests_v3
        main.js->>main.js: this.tests.push(newTest)
        main.js->>User: showToast('Test created', 'success')
        main.js->>main.js: updateDashboardStats()
    end
```

### 2. Take Test Flow

```mermaid
sequenceDiagram
    participant User
    participant test.html as Alpine testApp
    participant storage.js
    participant charts.js
    participant localStorage

    User->>test.html: Opens test.html?id=test_abc
    test.html->>storage.js: getTestById(id)
    storage.js->>localStorage: GET cet_mock_tests_v3
    localStorage-->>storage.js: Test JSON
    storage.js-->>test.html: Test object
    test.html->>test.html: Init answers[], markedForReview[], timer
    loop Per question navigation
        User->>test.html: Click nav button / keyboard shortcut
        test.html->>test.html: Update currentIndex
        test.html->>charts.js: renderParagraphWithVisualizations(paragraph)
        charts.js->>test.html: HTML with <canvas> / <table>
    end
    User->>test.html: Click "Submit test"
    test.html->>test.html: Calculate score, build resultsDetail
    test.html->>storage.js: saveAttempt(attemptData) via localStorage
    storage.js->>localStorage: SET cet_test_attempts
    test.html->>csv.js: generateCSV(test, resultsDetail, summary)
    test.html->>User: Show results modal + CSV download
```

### 3. Import from GitHub Flow

```mermaid
sequenceDiagram
    participant User
    participant main.js as Alpine app
    participant GitHub API
    participant GitHub Raw
    participant storage.js
    participant localStorage

    User->>main.js: Navigate to #import
    User->>main.js: Click folder (reading/vocab/di/lr)
    main.js->>GitHub API: GET /repos/p3anv/mock-app-data/contents/{folder}
    GitHub API-->>main.js: File list (JSON)
    main.js->>GitHub Raw: GET /raw.githubusercontent.com/.../{folder}/{file}.json
    GitHub Raw-->>main.js: Question array
    User->>main.js: Click "Import" on test
    main.js->>storage.js: generateTestId()
    main.js->>storage.js: saveTest(newTest)
    storage.js->>localStorage: SET cet_mock_tests_v3
    main.js->>User: showToast('Imported successfully', 'success')
```

---

## Sync vs Async

| Operation | Sync/Async | Details |
|-----------|------------|---------|
| `localStorage` reads/writes | **Sync** (blocking) | `localStorage.getItem/setItem` — synchronous API |
| `fetch` to GitHub API/Raw | **Async** | `await fetch()` in `main.js:loadFolderTests()`, `importTest()` |
| Chart.js rendering | **Async** (microtask) | `setTimeout(() => renderX(), 0)` in `charts.js:renderParagraphWithVisualizations()` |
| Alpine `$nextTick` | **Async** (microtask) | Used in `test.js` for chart rendering after DOM update |
| Timer `setInterval` | **Async** (macrotask) | 1-second tick in `test.js:startTimer()` |
| CSV blob download | **Sync** | `URL.createObjectURL` + `link.click()` |

---

## Failure Modes

| Component | Failure Scenario | Current Handling | Gap |
|-----------|------------------|------------------|-----|
| `localStorage` | QuotaExceededError (5-10 MB) | `try/catch` in `storage.js` returns `[]` / silent fail | No user notification; data loss silent |
| `localStorage` | Corrupted JSON | `try/catch` in `getAllTests()` returns `[]` | App recovers with empty state |
| GitHub API | Rate limit (60 req/hr unauth) | No retry/backoff; shows error toast | User must wait/retry manually |
| GitHub API | 404 / repo moved | Error toast with message | Import unavailable |
| GitHub Raw | Network error / CORS | Error toast | Import fails |
| Chart.js | Canvas not ready | `waitForParagraphBox` + `$nextTick` + `setTimeout` retry | Robust but complex |
| Chart.js | Destroy previous instance | `destroyChart(canvasId)` via `Map` | Works |
| Alpine | Component not ready | `x-cloak` hides until init | Works |
| Theme toggle | `localStorage` unavailable | Falls back to default (dark) | Works |

---

## Scaling Limits (As-Built)

| Dimension | Limit | Basis |
|-----------|-------|-------|
| **Tests in localStorage** | ~500-1000 | 5-10 MB quota; avg test ~5-10 KB |
| **Attempts in localStorage** | ~1000-2000 | 5-10 MB quota; avg attempt ~2-5 KB |
| **Questions per test** | Unlimited (practical: <200) | `nav-grid` 5-col; memory for answers[] |
| **Chart data points** | ~50 per chart | Chart.js performance; CSS `data-count` scaling up to 12 |
| **GitHub API calls** | 60/hr (unauth) | GitHub unauthenticated rate limit |
| **Import folder depth** | Flat only | `main.js` assumes `folder/*.json` |
| **Concurrent tabs** | Unlimited | Each tab independent; shared `localStorage` |

---

## Sharp Edges / Known Complexity

| Area | Complexity | Location |
|------|------------|----------|
| Paragraph parsing | Regex + state machine for 4 chart types + tables + plain text | `charts.js:312-410` |
| Chart rendering timing | `setTimeout(0)`, `$nextTick`, `waitForParagraphBox` retry loop | `charts.js:394`, `test.js:48-61` |
| Theme icon SVG | `x-html` with dynamic SVG string (XSS surface if uncontrolled) | `main.js:33`, `test.js:63` |
| Hash routing | `window.location.hash` + `hashchange` event | `main.js:251-258` |
| Keyboard shortcuts | 20+ key bindings with guard conditions | `test.js:70-150` |
| Chart instance cleanup | `Map` of canvasId → Chart instance; `destroyChart()` | `charts.js:65-73` |
| Bulk import | Sequential fetches + single `localStorage` write | `main.js:624-696` |

---

## Related Documents

- [System Context](00-overview/system-context.md) — C4 Level 1
- [Integrations](integrations.md) — External dependency deep dive
- [Data Model](data-model.md) — Entities, relationships, schema
- [Decisions](decisions/) — ADRs for key architectural choices
- [Codebase Tour](03-development/codebase-tour.md) — Module walkthrough for maintainers