---
title: ADR-009: Dark/Light Theme Persistence in localStorage
status: accepted
date: 2026-11-19
deciders: [@pranav]
---

## Context

Users need comfortable testing in any lighting condition. Theme must:
- Persist across sessions
- Apply to both `index.html` and `test.html`
- Switch instantly without flash
- Use CSS variables for all colors (design system)

## Decision

**Theme stored in `localStorage` key `cetprep-theme`** with values `'dark' | 'light'`:

- **Default**: `'dark'` (if no stored value)
- **Toggle**: `document.body.classList.toggle('light')` + `localStorage.setItem`
- **Init**: Both `main.js:214-219` and `test.js:63-66` read on load
- **CSS**: `:root` variables for dark; `body.light` overrides for light

```javascript
// storage.js:49-55
export function getTheme() { return localStorage.getItem(THEME_KEY); }
export function setTheme(mode) { localStorage.setItem(THEME_KEY, mode); }
```

## Consequences

### Positive
- Instant persistence — no server needed
- Works offline
- Both pages share same key — consistent across tabs
- CSS variable approach — single color definition, automatic component update

### Negative
- **No cross-device sync** — localStorage per browser
- **Flash risk**: If `localStorage` read happens after paint, brief wrong theme shows
  - Mitigated: `index.html:10` and `test.html:9` have `x-cloak` on `<body>`
- **No system preference detection** — doesn't respect `prefers-color-scheme`

### Neutral
- Theme icon SVG swapped via `x-html` (dynamic string)
- Chart.js colors auto-update via `getChartColors()` reading CSS variables

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Cookie** | Overkill; sent with every request; 4 KB limit |
| **IndexedDB** | Async; overkill for single boolean |
| **URL param (`?theme=dark`)** | Not persistent; ugly URLs |
| **`prefers-color-scheme` only** | No user override; PRD requires toggle |

## Evidence

- **Storage**: `storage.js:49-55` — `getTheme`, `setTheme`, `THEME_KEY`
- **Main init**: `main.js:214-219` — reads theme, applies `body.classList`
- **Test init**: `test.js:63-66` — reads theme, sets `themeIcon`
- **Toggle**: `main.js:297-310`, `test.js:458-463` — `toggleTheme()`
- **CSS**: `src/css/index.css:7-78`, `src/css/test.css:11-104` — `:root` + `body.light`
- **Chart colors**: `charts.js:24-38` — `getChartColors()` reads CSS vars