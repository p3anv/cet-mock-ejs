---
title: CETPrep — Troubleshooting Guide (As-Built)
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [support, engineers, users]
source_of_truth: true
---

# CETPrep — Troubleshooting Guide

> Symptom → Diagnosis → Fix mapping from real error strings and observed issues.

---

## Quick Index

| Symptom | Likely Cause | Jump To |
|---------|--------------|---------|
| "Failed to load folder: 403 Forbidden" | GitHub rate limit | [Import Errors](#import-errors) |
| Test created but gone on reload | localStorage quota | [Data Loss](#data-loss) |
| Charts not rendering | Canvas not ready / Chart.js error | [Chart Issues](#chart-issues) |
| Timer inaccurate | Background tab throttling | [Timer Issues](#timer-issues) |
| Theme not persisting | localStorage blocked / incognito | [Theme Issues](#theme-issues) |
| Import button does nothing | JS error / network | [Import Errors](#import-errors) |
| CSV not downloading | Popup blocked / blob error | [CSV Issues](#csv-issues) |
| Keyboard shortcuts not working | Focus in input / modifier key | [Keyboard Issues](#keyboard-issues) |
| "Must be an array" on create | Invalid JSON format | [Validation Errors](#validation-errors) |
| Page blank / white screen | JS error / CSP / build issue | [Blank Page](#blank-page) |

---

## Import Errors

### Symptom: "Failed to load folder: 403 Forbidden" or "Rate limit exceeded"

| Diagnosis | Fix |
|-----------|-----|
| `curl -I https://api.github.com/rate_limit` → `X-RateLimit-Remaining: 0` | Wait until reset (top of hour) OR add `VITE_GITHUB_TOKEN` to build env |
| Network tab shows 403 on `api.github.com/repos/p3anv/mock-app-data/contents/*` | Same — rate limited |
| Works in incognito but not main | Extension blocking? Disable extensions |

**Runbook**: [GitHub Rate Limit Recovery](04-operations/runbooks/github-rate-limit.md)

---

### Symptom: Import hangs / spinner forever

| Diagnosis | Fix |
|-----------|-----|
| Network tab: request pending > 30s | No timeout implemented — refresh page, retry |
| Console: `TypeError: Failed to fetch` | Network offline or CORS (shouldn't happen for GitHub) |

**Code Fix Needed**: Add `AbortController` timeout (TD-007).

---

### Symptom: "Failed to import test" after folder loads

| Diagnosis | Fix |
|-----------|-----|
| Network tab: 404 on `raw.githubusercontent.com/.../file.json` | File deleted from source repo; folder listing stale |
| Console: JSON parse error | Source file malformed; not our validation |

---

## Data Loss

### Symptom: Test created → success toast → gone after reload

| Diagnosis | Fix |
|-----------|-----|
| DevTools Console: `QuotaExceededError` (may be silent) | Clear old attempts: `localStorage.setItem('cet_test_attempts', JSON.stringify(JSON.parse(localStorage.getItem('cet_test_attempts') || '[]').slice(-50)))` |
| `localStorage.getItem('cet_mock_tests_v3')` returns `null` or truncated | Quota exceeded; data silently dropped (TD-002) |
| Incognito/private mode | Data cleared on close — expected |

**Runbook**: [localStorage Quota Recovery](04-operations/runbooks/localstorage-quota.md)

---

### Symptom: Attempt submitted → not in History

| Diagnosis | Fix |
|-----------|-----|
| Check `localStorage.getItem('cet_test_attempts')` | If missing/empty: quota exceeded or parse error |
| Console during submit: any red errors? | `saveAttempt` may have failed silently |

---

## Chart Issues

### Symptom: Chart area blank / white / no canvas

| Diagnosis | Fix |
|-----------|-----|
| Console: `Chart.js Error: "canvas" is not in the DOM` | Timing issue — code has retry loop; refresh page |
| Console: `getComputedStyle(...) is null` | CSS not loaded yet; refresh |
| `charts.js` color derivation fails | Ensure `:root` variables exist; check `index.css:1` |

**Root Cause**: `test.js:294-298` triple async (`$watch` → `$nextTick` → `setTimeout(0)`) — fragile but works on refresh.

---

### Symptom: Chart colors wrong (neon/ugly)

| Diagnosis | Fix |
|-----------|-----|
| Dark mode but light colors (or vice versa) | `getComputedStyle` read before CSS applied; refresh |
| Custom CSS override broke variables | Check `body.light` override in `index.css` |

---

### Symptom: Table shows as empty / broken

| Diagnosis | Fix |
|-----------|-----|
| `[TABLE]` markup in paragraph malformed | Must follow format: `Title: X\nCol1 | Col2\nVal1 | Val2` |
| Parser state machine confused | Check `charts.js:322-353` — strict line format required |

---

## Timer Issues

### Symptom: Timer runs slow / jumps / freezes

| Diagnosis | Fix |
|-----------|-----|
| User switched tabs | Browser throttles `setInterval` in background — **by design** (TD-006) |
| Timer shows wrong time after tab switch | Not persisted; uses `setInterval` only |
| `setInterval` not clearing on submit | Check `test.js:224-231` — `submitted` flag stops increment |

**No Fix Currently** — documented limitation. Future: use `performance.now()` + `visibilitychange`.

---

## Theme Issues

### Symptom: Theme reverts to dark on reload

| Diagnosis | Fix |
|-----------|-----|
| `localStorage.getItem('cetprep-theme')` returns `null` | Browser blocking localStorage (privacy mode, settings) |
| Incognito/private browsing | Expected — data not persisted |
| `cetprep-theme` value is `'light'` but page dark | Check `main.js:297-310` `toggleTheme()` — updates `body.classList` |

---

### Symptom: Theme toggle button shows wrong icon

| Diagnosis | Fix |
|-----------|-----|
| `x-html` binding stale | Alpine reactivity issue; click again |
| Console error in `themeIcon` getter | Check `main.js:304` — SVG string generation |

---

## CSV Issues

### Symptom: CSV download doesn't start / blocked

| Diagnosis | Fix |
|-----------|-----|
| Browser popup blocker | Allow popups for site |
| `downloadCSV` blob creation fails | Console error; check `csv.js:17-26` |
| Filename weird characters | `test.name` sanitized? `csv.js` uses raw name |

---

### Symptom: CSV opens with garbled data in Excel

| Diagnosis | Fix |
|-----------|-----|
| Commas in explanations | PapaParse handles RFC 4180 — should quote |
| Newlines in paragraphs | `generateCSV` flattens: `.replace(/\n/g, ' ')` |
| Special chars (accents, emoji) | UTF-8 BOM not added; Excel may misread |

**Fix**: Open in Google Sheets or use Data → From Text/CSV in Excel.

---

## Keyboard Issues

### Symptom: Shortcuts don't work (1-9, arrows, m, e, s, t, ?)

| Diagnosis | Fix |
|-----------|-----|
| Focus in `<input>`, `<textarea>`, `<select>` | Guards ignore — click empty area first |
| Holding `Ctrl` / `Meta` / `Alt` | Guards ignore modifiers — release keys |
| Caps Lock on | Keys are lowercase in handler (`e.key.toLowerCase()`) |
| Non-US keyboard layout | Key codes may differ; `e.key` handles most |

**Code**: `test.js:71-75` guards.

---

## Validation Errors

### Symptom: "Must be an array." on Create Test

| Cause | Fix |
|-------|-----|
| Pasted JSON is object, not array | Wrap in `[ ... ]` |
| Missing `[` `]` | Add brackets |

---

### Symptom: "Q3: need 5 options"

| Cause | Fix |
|-------|-----|
| Question has 4 or 6 options | Must be exactly 5 strings |
| Empty string in options | All 5 must be non-empty strings |

---

### Symptom: "Q2: correct 0-4"

| Cause | Fix |
|-------|-----|
| `correct` is 5 or -1 | Must be 0, 1, 2, 3, or 4 |
| `correct` is string `"1"` | Must be integer |

---

### Symptom: "Q1: chart values must be numbers, got 'abc'"

| Cause | Fix |
|-------|-----|
| Chart data line: `Category: abc` | Values must parse as numbers |
| Missing colon | Format: `Label: 123` |

---

## Blank Page

### Symptom: White screen, nothing loads

| Diagnosis | Fix |
|-----------|-----|
| Console: `Uncaught SyntaxError: import ...` | Build failed; run `npm run build` |
| Console: `Failed to load module script: MIME type` | Server serving `.js` as `text/html` — check static host config |
| Network: `index.html` 200 but `assets/index-*.js` 404 | Deploy `dist/` not root; check asset paths |
| CSP error: `refused to execute inline script` | `index.html` has no CSP — check host headers |

---

## Network Errors

### Symptom: "NetworkError when attempting to fetch resource"

| Diagnosis | Fix |
|-----------|-----|
| Offline | Check connection |
| GitHub blocked (corporate firewall) | Import feature unavailable |
| CORS error | Shouldn't happen for GitHub — check browser extension |

---

## Console Error Reference

| Error String | Source | Meaning |
|--------------|--------|---------|
| `QuotaExceededError` | `storage.js` | localStorage full (silent) |
| `SyntaxError: JSON.parse` | `storage.js` | Corrupted localStorage data |
| `Chart.js Error: canvas...` | `charts.js` | Canvas not ready |
| `getComputedStyle(...).getPropertyValue(...) is null` | `charts.js` | CSS vars not loaded |
| `Failed to load folder: 403` | `main.js` | GitHub rate limit |
| `Failed to import test` | `main.js` | GitHub Raw 404 or parse error |
| `Validation error: ...` | `validate.js` | JSON format invalid |
| `downloadCSV: blob creation failed` | `csv.js` | Browser blob API issue |

---

## Escalation

| If... | Then... |
|-------|---------|
| User data lost | Run [localStorage Quota Runbook](04-operations/runbooks/localstorage-quota.md) |
| Import broken for hours | Run [GitHub Rate Limit Runbook](04-operations/runbooks/github-rate-limit.md) |
| Site down | Run [Deploy Runbook](04-operations/runbooks/deploy.md) → [Rollback](04-operations/runbooks/rollback.md) |
| Security issue | Create SEV-1 incident per [Incident Response](04-operations/incident-response.md) |

---

## Related Documents

- [Runbooks](04-operations/runbooks/) — Step-by-step procedures
- [Known Limitations](known-limitations.md) — Documented unsupported cases
- [FAQ](faq.md) — Common questions
- [Tech Debt](03-development/tech-debt-register.md) — Root causes