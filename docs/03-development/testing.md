---
title: CETPrep — Testing Strategy (As-Built)
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [engineers, maintainers, QA]
source_of_truth: true
---

# CETPrep — Testing Strategy

> **Current State**: Zero automated tests. All verification is manual.
> This documents what exists and what a test strategy would need to cover.

---

## Test Inventory

| Test Type | Status | Tool | Coverage | Location |
|-----------|--------|------|----------|----------|
| Unit | ❌ None | — | 0% | — |
| Integration | ❌ None | — | 0% | — |
| E2E | ❌ None | — | 0% | — |
| Visual Regression | ❌ None | — | 0% | — |
| Manual Smoke | ✅ Done | Browser | Ad-hoc | `phases.md` Phase 5 |
| Manual Visual Audit | ❌ Unchecked | Browser | — | `phases.md` Phase 5 |

---

## Verified Manual Tests (from `phases.md` Phase 5 Checklist)

| Check | Status | Notes |
|-------|--------|-------|
| Dashboard loads with stats | ✅ | Verified during dev |
| Create Test: valid JSON → saved + toast | ✅ | Verified |
| Create Test: invalid JSON → error toast | ✅ | Verified |
| Create Test: file upload → parsed + saved | ✅ | Verified |
| My Tests: list by category | ✅ | Verified |
| My Tests: search filter | ✅ | Verified |
| My Tests: attempt → opens test.html | ✅ | Verified |
| My Tests: history modal | ✅ | Verified |
| My Tests: delete → confirm → removed | ✅ | Verified |
| Samples: load 7 samples | ✅ | Verified |
| Import: load 4 folders | ✅ | Verified |
| Import: search + select + bulk import | ✅ | Verified |
| Exam: timer counts | ✅ | Verified |
| Exam: navigator clicks | ✅ | Verified |
| Exam: keyboard shortcuts (20+) | ✅ | Verified |
| Exam: mark for review | ✅ | Verified |
| Exam: explanation toast | ✅ | Verified |
| Exam: charts render (bar/line/pie/table) | ✅ | Verified |
| Exam: submit → score + CSV download | ✅ | Verified |
| Exam: theme toggle persists | ✅ | Verified |
| Theme: persists across reload | ✅ | Verified |

---

## What a Test Suite Would Need

### Unit Tests (Priority: High)

| Module | Functions to Test | Scenarios |
|--------|-------------------|-----------|
| `storage.js` | `getAllTests`, `saveTest`, `deleteTestById`, `getAllAttempts`, `saveAttempt`, `generateTestId`, `getTheme`, `setTheme` | Happy path, empty storage, corrupted JSON, quota exceeded, cascade delete |
| `validate.js` | `validateJSONStructure` | Valid array, empty array, missing fields, wrong option count, invalid correct index, chart data validation |
| `charts.js` | `renderBarGraph`, `renderLineGraph`, `renderPieChart`, `renderTable`, `renderParagraphWithVisualizations`, `destroyChart` | Valid data, empty data, missing canvas, color derivation (dark/light), parser state machine |
| `csv.js` | `generateCSV`, `downloadCSV` | Row structure, special chars in fields, blob creation, filename format |
| `ui.js` | `showToast`, `showConfirmModal`, `showHistoryModal` | DOM creation, cleanup, event handlers |

### Integration Tests (Priority: High)

| Flow | Modules | Scenarios |
|------|---------|-----------|
| Create → Save → List → Attempt | `main.js` + `storage.js` + `validate.js` | Full CRUD cycle |
| Attempt → Answer → Submit → Results | `test.js` + `storage.js` + `charts.js` + `csv.js` | Full exam flow |
| Import → GitHub → Save → List | `main.js` + `storage.js` + GitHub API (mocked) | Single + bulk import |
| Theme toggle | `main.js` + `test.js` + `storage.js` | Persist + cross-page |

### E2E Tests (Priority: Medium)

| User Journey | Steps | Assertions |
|--------------|-------|------------|
| New user creates test, takes it, sees results | 1. Open `/` → 2. Click Create → 3. Paste valid JSON → 4. Generate → 5. Go to My Tests → 6. Click Attempt → 7. Answer all → 8. Submit → 9. Verify score + CSV | Test saved, exam opens, timer runs, score correct, CSV downloads |
| Import from GitHub | 1. Open `/` → 2. Click Import → 3. Wait for folders → 4. Select test → 5. Import → 6. Verify in My Tests | Folder loads, test imports, appears in list |
| Theme persistence | 1. Toggle theme → 2. Refresh → 3. Open test.html → 4. Verify theme | Dark/light persists across pages + reload |

---

## Test Infrastructure (Not Present)

| Need | Recommendation |
|------|----------------|
| **Test Runner** | Vitest (Vite-native, fast, ES modules) |
| **Component Testing** | `@vue/test-utils` pattern adapted for Alpine, or mount Alpine components in JSDOM |
| **E2E** | Playwright (cross-browser, reliable) |
| **Visual Regression** | Playwright + pixelmatch or Percy |
| **Mocking** | MSW (Mock Service Worker) for GitHub API |
| **Coverage** | `@vitest/coverage-v8` |

### Example Vitest Config (Proposed)

```javascript
// vitest.config.js (proposed)
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './tests/setup.js',
        include: ['tests/**/*.test.js'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
        },
    },
});
```

### Example Test Setup (Proposed)

```javascript
// tests/setup.js (proposed)
import { JSDOM } from 'jsdom';
import Alpine from 'alpinejs';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost',
    pretendToBeVisual: true,
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element;
global.Node = dom.window.Node;
global.Event = dom.window.Event;
global.CustomEvent = dom.window.CustomEvent;
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Alpine needs window
Alpine.start();
global.Alpine = Alpine;
```

---

## Test Data Fixtures (Proposed)

```javascript
// tests/fixtures/test.js
export const validTest = {
    id: 'test_fixture_1',
    name: 'Sample Test',
    category: 'Quants',
    questions: [
        {
            question: 'What is 2+2?',
            options: ['3', '4', '5', '6', '7'],
            correct: 1,
            explanation: '2+2=4',
            paragraph: '[BARGRAPH]\nTitle: Test\nA: 1\nB: 2'
        }
    ],
    createdAt: '2026-01-01T00:00:00.000Z'
};

export const invalidTests = {
    notArray: 'not an array',
    emptyArray: [],
    missingQuestion: [{ options: ['a','b','c','d','e'], correct: 0, explanation: 'x' }],
    wrongOptionCount: [{ question: 'q', options: ['a','b'], correct: 0, explanation: 'x' }],
    invalidCorrect: [{ question: 'q', options: ['a','b','c','d','e'], correct: 5, explanation: 'x' }],
    missingExplanation: [{ question: 'q', options: ['a','b','c','d','e'], correct: 0 }],
    invalidChartData: [{ question: 'q', options: ['a','b','c','d','e'], correct: 0, explanation: 'x', paragraph: '[BARGRAPH]\nTitle: T\nA: not-a-number' }],
};
```

---

## CI/CD Integration (Not Present)

| Stage | Current | Proposed |
|-------|---------|----------|
| Pre-commit | None | `husky` + `lint-staged` (Prettier) |
| CI (GitHub Actions) | None | `npm install` → `npm run build` → `npm run test` |
| Preview Deploy | None | Netlify/Vercel preview on PR |
| Production Deploy | Manual `npm run build` → static host | Auto-deploy `main` to static host |

### Proposed GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml (proposed)
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npm run test
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Manual Test Checklist (For Releases)

Until automated tests exist, use this checklist before any release:

### Smoke Test (5 min)
- [ ] `npm run dev` starts without error
- [ ] Dashboard loads, shows stats
- [ ] Theme toggle works (dark ↔ light)
- [ ] Navigation: all 5 pages load

### Create Test Flow (3 min)
- [ ] Valid JSON → success toast + appears in My Tests
- [ ] Invalid JSON → error toast (try: not array, 4 options, correct=5)
- [ ] File upload (.json) → parsed + saved
- [ ] Empty name/category → validation (HTML5 required)

### My Tests Flow (3 min)
- [ ] Category tabs filter correctly
- [ ] Search filters within category
- [ ] Attempt button opens test.html in new tab
- [ ] History modal shows attempts
- [ ] Delete → confirm → removed from list + attempts cascade deleted

### Import Flow (5 min)
- [ ] All 4 folders load (reading, vocab, di, lr)
- [ ] Search filters folder contents
- [ ] Select all checkbox works
- [ ] Single import → success + appears in My Tests
- [ ] Bulk import → progress + success count

### Exam Flow (10 min)
- [ ] Timer starts on load, counts up
- [ ] Navigator: click jumps to question
- [ ] Keyboard: →/←/1-9/m/e/s/t/? all work
- [ ] Mark for review toggles flag
- [ ] Explanation toast shows
- [ ] Charts render: bar, line, pie, table
- [ ] Submit → confirm modal → results modal
- [ ] Results: score correct, CSV downloads
- [ ] Theme toggle in exam works + persists

### Cross-Page (2 min)
- [ ] Theme set in dashboard → persists in exam
- [ ] Theme set in exam → persists in dashboard
- [ ] localStorage keys present: `cet_mock_tests_v3`, `cet_test_attempts`, `cetprep-theme`

### Build Verification (2 min)
- [ ] `npm run build` completes without error
- [ ] `npm run preview` serves `dist/` correctly
- [ ] No console errors in preview

**Total**: ~30 minutes for full manual regression.

---

## Known Gaps (No Test Coverage)

| Gap | Risk | Mitigation |
|-----|------|------------|
| No unit tests | Refactoring breaks logic | Manual checklist above |
| No GitHub API mock | Import tests hit real API (rate limited) | Test offline; use cached responses |
| No Chart.js test | Visual regressions undetected | Screenshot comparison in E2E |
| No timer accuracy test | Background tab drift | Document as known limitation |
| No quota test | Silent data loss | Monitor localStorage size |
| No cross-tab test | Theme drift | Document as known gap |

---

## Related Documents

- [Codebase Tour](codebase-tour.md) — Modules to test
- [Conventions](conventions.md) — Patterns to test against
- [Setup](setup.md) — Verified commands
- [Tech Debt Register](tech-debt-register.md) — "No test suite" entry
- [ADR-003](01-architecture/decisions/adr-003-no-test-framework.md) — Decision record (proposed)