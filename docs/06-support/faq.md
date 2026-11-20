---
title: CETPrep — FAQ (As-Built)
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [support, engineers, users, maintainers]
source_of_truth: true
---

# CETPrep — Frequently Asked Questions

> Questions likely from maintainers, integrators, and power users. Answers based on as-built system.

---

## For Maintainers / Engineers

### Q: Why is there no backend?
**A**: By design (PRD + ADR-007). CETPrep is a **local-first, client-only** tool. All data lives in the user's browser `localStorage`. This eliminates server costs, auth complexity, and data privacy concerns. Trade-off: no cross-device sync, no server-side validation, no centralized analytics.

### Q: Why Alpine.js and not React/Vue/Svelte?
**A**: ADR-001. Requirements: tiny bundle, no build step for dev (ES modules), direct DOM access for Chart.js canvas, minimal learning curve. Alpine 3.x is ~15KB, works with Vite HMR, and `x-data`/`x-for`/`@click` map 1:1 to the previous vanilla JS patterns.

### Q: Why Vite and not Webpack/Parcel/Next?
**A**: Vite 8.x: native ES modules in dev (fast HMR), zero-config multi-page (`index.html` + `test.html`), tiny config, built-in CSS handling. No SSR needed (pure SPA).

### Q: Can I add a new chart type?
**A**: Yes, but touch 3 files:
1. `charts.js` — add `renderXGraph()` + parser case in `renderParagraphWithVisualizations()` (state machine)
2. `validate.js` — add validation for new chart data format
3. `test.css` — add `data-count` sizing rules (see `.chart-bar[data-count]`)
4. `main.js` — if preview needs it, update import logic

### Q: Why does `storage.js` silently swallow `QuotaExceededError`?
**A**: TD-002 (Critical). Original implementation prioritized simplicity. **Fix required**: add quota check before write + toast notification.

### Q: How does the exam timer work? Is it accurate?
**A**: `setInterval` + 1000ms increment (`test.js:224-231`). **Not accurate in background tabs** — browsers throttle to ≥1000ms. TD-006 documents this. Future: use `performance.now()` + `visibilitychange`.

### Q: Why are there two HTML files (`index.html` + `test.html`)?
**A**: Exam interface (`test.html`) needs full-screen, no sidebar, different CSS (`test.css`), separate Alpine component (`testApp`). Hash routing in `index.html` only covers 5 dashboard pages. Separate entry = cleaner separation.

### Q: How do I add a new GitHub import folder?
**A**: Edit `main.js`:
1. Add to `TEST_FOLDERS` array (id, name, icon)
2. Add mapping in `folderToCategory`
3. Ensure folder exists in `p3anv/mock-app-data` repo with `.json` files
4. Rebuild + deploy

### Q: What's the `uniqueId` in `charts.js` for?
**A**: Prevents canvas ID collision when multiple charts render. Uses `crypto.randomUUID()` + `Date.now()` + random. Collision risk: negligible.

### Q: Why does `charts.js` read CSS variables via `getComputedStyle`?
**A**: Design requirement — charts must match theme colors exactly. Colors derived at render time from `--accent`, `--success`, etc. Works because CSS loads before JS executes in browser.

### Q: Is there any TypeScript?
**A**: No. Pure ES2022 modules. JSDoc types in `data-model.md` for reference only.

---

## For Users / Power Users

### Q: Where is my data stored?
**A**: In your browser's `localStorage` under three keys:
- `cet_mock_tests_v3` — your created/imported tests
- `cet_test_attempts` — your exam attempts (answers, scores, times)
- `cetprep-theme` — dark/light preference

**No cloud storage. No account. No server.**

### Q: Can I use CETPrep on multiple devices?
**A**: Not automatically. Each browser = separate data. Workaround: Export tests (DevTools → copy `localStorage.getItem('cet_mock_tests_v3')`) and import on other device via Create Test → Paste JSON.

### Q: What happens if I clear browser data?
**A**: **All tests, attempts, and theme preference are permanently deleted.** No recovery possible. Export important data first.

### Q: Why does Import stop working after ~60 tests?
**A**: GitHub API unauthenticated limit: 60 requests/hour. Wait an hour or ask maintainer to add `VITE_GITHUB_TOKEN` for 5000/hr limit.

### Q: Can I create tests with more than 5 options?
**A**: No. Validation requires exactly 5 options per question (`validate.js`). This is frozen per PRD.

### Q: How do I add a chart to a question?
**A**: In the question's `paragraph` field, use markup:
```
[BARGRAPH]
Title: My Chart
Label1: 10
Label2: 20

[LINEGRAPH]
Title: Progress
Week1: 50
Week2: 75

[PIEGRAPH]
Title: Distribution
A: 30
B: 70

[TABLE]
Title: Scores
Topic | Score
Math | 90
English | 85
```

### Q: Why does the timer keep running when I switch tabs?
**A**: It doesn't — it **slows down**. Browsers throttle `setInterval` in background tabs. The displayed time will be lower than real elapsed. This is a known limitation (TD-006).

### Q: Can I change the theme to something other than dark/light?
**A**: No UI for this. You can edit CSS variables in DevTools (`--accent`, `--bg`, etc.) but changes won't persist. Only dark/light toggle persists.

### Q: How do I export all my data at once?
**A**: No bulk export UI yet. Per-attempt CSV: History modal → Download CSV. For tests: DevTools Console → `copy(JSON.parse(localStorage.getItem('cet_mock_tests_v3')))`.

### Q: Does CETPrep work offline?
**A**: Yes, once loaded. `index.html` + `test.html` + JS + CSS cached by browser. **Import requires internet** (GitHub API). Exam, dashboard, create test work fully offline.

---

## For Integrators

### Q: Can I embed CETPrep in an iframe?
**A**: Yes, but:
- `localStorage` access requires same-origin or `allow-same-origin` sandbox
- Theme may not persist if third-party cookies blocked
- Keyboard shortcuts may be captured by parent

### Q: Is there an API to programmatically create tests?
**A**: No REST API. Direct `localStorage` manipulation:
```javascript
// In browser console on CETPrep domain:
const test = { id: 'test_' + crypto.randomUUID(), name: 'API Test', category: 'Quants', questions: [...], createdAt: new Date().toISOString() };
const tests = JSON.parse(localStorage.getItem('cet_mock_tests_v3') || '[]');
tests.push(test);
localStorage.setItem('cet_mock_tests_v3', JSON.stringify(tests));
```

### Q: Can I host the GitHub test data myself?
**A**: Yes. Fork `p3anv/mock-app-data`, update `main.js` constants:
- `GITHUB_API_BASE` → your fork's contents API
- `GITHUB_RAW_BASE` → your fork's raw URL
- `TEST_FOLDERS` / `folderToCategory` → your structure
Rebuild + deploy.

---

## Related Documents

- [Codebase Tour](03-development/codebase-tour.md) — Module details
- [Troubleshooting](troubleshooting.md) — Symptom → fix
- [Known Limitations](known-limitations.md) — What doesn't work
- [Tech Debt](03-development/tech-debt-register.md) — Known issues