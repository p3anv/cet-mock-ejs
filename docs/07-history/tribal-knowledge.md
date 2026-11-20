---
title: CETPrep — Tribal Knowledge (Unwritten Rules)
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [incoming-maintainer, engineers]
source_of_truth: true
---

# CETPrep — Tribal Knowledge

> Things not in code, not in docs, only in maintainer's head. Written here so they survive handover.

---

## Why X Is Weird

### `charts.js` Parser State Machine
**The thing**: `renderParagraphWithVisualizations()` uses a hand-rolled line parser with states (NONE → CHART_TYPE → TITLE → DATA_LINES).
**Why**: Started simple for `[BARGRAPH]`, kept adding `[LINEGRAPH]`, `[PIEGRAPH]`, `[TABLE]` without refactoring.
**Gotcha**: Adding `[NEWCHART]` requires editing 3 places in the state machine + `validate.js` + `test.css`.
**Don't**: Add regex parsing without tests — current parser has zero tests.

### `test.js` Triple Async for Charts
**The thing**: `$watch('currentIndex')` → `$nextTick()` → `setTimeout(0)` → `renderVisualizations()` → `waitForParagraphBox()` retry loop.
**Why**: Chart.js needs canvas in DOM + measured. Alpine updates DOM async. Vite HMR adds timing variance.
**Gotcha**: Removing any layer breaks charts silently. The `waitForParagraphBox` polls `requestAnimationFrame` — it's the safety net.
**Don't**: Simplify to just `$nextTick` — it fails on cold load.

### `storage.js` Silent Quota Swallow
**The thing**: `catch (e) { if (e.name === 'QuotaExceededError') return; }` — no toast, no log.
**Why**: Added for JSON parse errors; quota not considered.
**Gotcha**: User creates test → toast "Created!" → reload → test gone. No error anywhere.
**Fix**: TD-002 — quota check + toast.

### `main.js` Theme Icon `x-html`
**The thing**: `themeIcon` getter returns SVG string → rendered via `<span x-html="themeIcon">`.
**Why**: Quick way to swap sun/moon icons without two `<template>` blocks.
**Gotcha**: XSS surface if `themeIcon` ever becomes user-influenced. Currently safe (hardcoded).
**Don't**: Use `x-html` for anything dynamic.

### `test.js` Results Modal — Not Alpine
**The thing**: `showResultsModal()` builds entire modal via `document.createElement`, manual event listeners.
**Why**: Needed dynamic CSV download + complex result grid; easier in vanilla JS at the time.
**Gotcha**: Not reactive; cleanup manual; focus trap missing.
**Don't**: Add more vanilla modals — use Alpine `x-show` + `x-transition`.

---

## Unwritten Rules

### CSS: Never Touch Without Verifying `rules.md`
- Only permitted change: `[x-cloak] { display: none !important; }` at line 1
- Design system variables in `:root` / `body.light` — don't add new colors without updating both
- Chart container sizing via `data-count` attribute — don't hardcode heights

### GitHub Import: Respect Rate Limit
- Sequential bulk import (not `Promise.all`) to avoid 429 burst
- No retry logic — user sees toast error, must click again
- Folder listing cached in `folderTests[folderId].loaded` — no auto-refresh

### localStorage: Version in Key Name
- `cet_mock_tests_v3` — `_v3` = version
- No migration code — new version = new key = data loss
- Attempts key has no version (`cet_test_attempts`) — oversight

### Keyboard Shortcuts: Guard Everything
- `test.js:71-75`: Ignore if `input/textarea/select` focused
- Ignore `ctrlKey`, `metaKey`, `altKey`
- Keys normalized to lowercase (`e.key.toLowerCase()`)
- Caps Lock = lowercase still works

### Chart Colors: Derive, Don't Duplicate
- `charts.js:getChartColors()` reads `--accent`, `--success`, etc. from `:root`
- Dark/light automatic via `body.light` CSS override
- Never hardcode hex in chart config

---

## Gotchas That Bit Us

### 1. Vite `import.meta.dirname` Needs Node 20.11+
**Symptom**: `npm run build` fails with "import.meta.dirname is not defined"
**Fix**: Use Node 20+ (LTS). Don't downgrade Vite.

### 2. Chart.js Canvas Not Ready on First Render
**Symptom**: Blank charts on first exam load; refresh fixes
**Cause**: Canvas inserted by parser but not measured yet
**Fix**: The `setTimeout(0)` + `$nextTick` + retry loop — don't remove

### 3. GitHub Raw URL Case Sensitivity
**Symptom**: Import 404s for folders with uppercase in repo
**Cause**: `raw.githubusercontent.com` paths are case-sensitive
**Fix**: `TEST_FOLDERS` ids must match repo folder names exactly (lowercase)

### 4. PapaParse `unparse` Escapes Correctly
**Symptom**: CSV has weird quotes
**Cause**: It's RFC 4180 compliant — Excel sometimes misreads without BOM
**Fix**: Open in Google Sheets or use Data → From Text/CSV

### 5. `crypto.randomUUID()` Not in Safari < 15
**Symptom**: `TypeError: crypto.randomUUID is not a function`
**Fix**: Fallback in `storage.js:generateTestId()` uses timestamp + random
**Don't**: Remove fallback — Safari 14 still in use

### 6. Hash Routing + `history.replaceState`
**Symptom**: Back button doesn't work as expected
**Cause**: `showPage()` calls `history.replaceState(null, '', '#' + page)` — no history entry
**Fix**: By design for SPA; user uses nav links, not browser back

---

## Debugging Secrets

### Alpine State in Console
```javascript
// Dashboard
Alpine.$data(document.body)  // → app component state

// Exam
Alpine.$data(document.body)  // → testApp component state

// Toast
Alpine.$data(document.querySelector('[x-data="toast"]'))
```

### localStorage Inspection
```javascript
// Tests
JSON.parse(localStorage.getItem('cet_mock_tests_v3'))

// Attempts
JSON.parse(localStorage.getItem('cet_test_attempts'))

// Theme
localStorage.getItem('cetprep-theme')
```

### Force Reload Charts
```javascript
// In exam console:
location.reload()
// Or manually trigger:
document.querySelector('#paragraphBox')?.dispatchEvent(new Event('render'))
```

### Check GitHub Rate Limit
```bash
curl -I https://api.github.com/rate_limit
# X-RateLimit-Remaining: 0 = blocked
```

---

## Things We'd Do Differently

1. **Add tests before Phase 2** — would have caught quota bug, rate limit bug
2. **Use IndexedDB from start** — localStorage quota is a hard ceiling
3. **Mirror GitHub test data** — single point of failure (TD-015)
4. **Add `formatVersion` to Test/Attempt** — migration path for schema changes
5. **Global error boundary** — errors currently only in console
6. **Accessibility from day one** — retrofitting is painful
7. **CI/CD from first deploy** — manual process doesn't scale

---

## Related Documents

- [Codebase Tour](03-development/codebase-tour.md#sharp-edges) — Sharp edges per module
- [Tech Debt Register](03-development/tech-debt-register.md) — Formalized as debt
- [Lessons Learned](lessons-learned.md) — Retrospective
- [Troubleshooting](06-support/troubleshooting.md) — Symptom → fix