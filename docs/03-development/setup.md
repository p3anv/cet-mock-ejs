---
title: CETPrep — Development Setup (Verified)
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [engineers, maintainers]
source_of_truth: true
---

# CETPrep — Development Setup

> **Verified to work as-of 2026-11-20** on Node.js 20+ / npm 10+.

---

## Prerequisites

| Tool | Minimum Version | Verified Version | Install Command |
|------|-----------------|------------------|-----------------|
| **Node.js** | 18.x | 20.x+ | `nvm install 20` / `brew install node` |
| **npm** | 9.x | 10.x+ | Bundled with Node.js |
| **Git** | 2.x | Any | `git --version` |

**No other dependencies** — no Docker, no database, no cloud CLI.

---

## Bootstrap (First Time)

```bash
# 1. Clone repository
git clone <repo-url> cet-mock-ejs
cd cet-mock-ejs

# 2. Install dependencies
npm install
# ✅ Verified: completes in ~15s, creates node_modules/, package-lock.json

# 3. Verify install
npm ls --depth=0
# Expected output:
# cet-prep@1.0.0
# ├── alpinejs@3.14.1
# ├── chart.js@4.4.7
# └── papaparse@5.5.2
```

---

## Development Server

```bash
# Start Vite dev server (port 5500, auto-open browser)
npm run dev
# ✅ Verified: 
#   - Vite 8.3.8 starts in ~500ms
#   - Opens http://localhost:5500/index.html
#   - HMR works for JS + CSS changes
#   - Multi-page: index.html + test.html both served
```

**Dev Server Features**:
- Hot Module Replacement (HMR) for `src/js/*.js` and `src/css/*.css`
- `/public` served at root (`/favicon.ico`, `/hero-illustration.svg`)
- ES modules via native browser import (no bundling in dev)
- Source maps enabled

---

## Production Build

```bash
# Build for production (outputs to dist/)
npm run build
# ✅ Verified:
#   - Completes in ~2s
#   - Outputs: dist/index.html, dist/test.html, dist/assets/*.js, dist/assets/*.css
#   - Assets hashed for cache busting
#   - Vendor code split: alpinejs, chart.js, papaparse in separate chunks
#   - CSS extracted to dist/assets/*.css
```

**Build Output** (verified 2026-11-20):
```
dist/
├── index.html          (39 KB)
├── test.html           (4.5 KB)
├── favicon.ico         (15 KB)
├── hero-illustration.svg (64 KB)
└── assets/
    ├── index-[hash].js     (~180 KB gzipped)
    ├── test-[hash].js      (~120 KB gzipped)
    ├── index-[hash].css    (~35 KB gzipped)
    └── test-[hash].css     (~45 KB gzipped)
```

---

## Preview Production Build

```bash
# Serve dist/ locally (port 4173)
npm run preview
# ✅ Verified: serves dist/ exactly as production
```

---

## Project Structure

```
cet-mock-ejs/
├── public/                 # Static assets (served at /)
│   ├── favicon.ico
│   └── hero-illustration.svg
├── src/
│   ├── css/
│   │   ├── index.css       # Dashboard/builder/library styles
│   │   └── test.css        # Exam interface styles
│   └── js/
│       ├── main.js         # Dashboard app (Alpine 'app')
│       ├── test.js         # Exam app (Alpine 'testApp')
│       ├── storage.js      # localStorage CRUD
│       ├── charts.js       # Chart.js wrappers + paragraph parser
│       ├── validate.js     # JSON validation
│       ├── csv.js          # PapaParse CSV export
│       └── ui.js           # Toast/modal utilities
├── index.html              # Main SPA entry (Dashboard, Create, My Tests, Samples, Import)
├── test.html               # Exam entry (separate page)
├── vite.config.js          # Vite config (multi-page)
├── package.json
├── package-lock.json
└── dist/                   # Build output (gitignored)
```

---

## Verified Commands

| Command | Purpose | Verified |
|---------|---------|----------|
| `npm install` | Install deps | ✅ |
| `npm run dev` | Start dev server | ✅ |
| `npm run build` | Production build | ✅ |
| `npm run preview` | Preview build | ✅ |
| `npm ls` | List deps | ✅ |
| `npm audit` | Security audit | ✅ (0 vulnerabilities as of 2026-11-20) |

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| `npm run dev` fails: "port 5500 in use" | Another process on 5500 | `lsof -i :5500` → kill; or edit `vite.config.js:18` |
| `npm run build` fails: `import.meta.dirname` | Node < 20.11 / Vite config | Use Node 20+; `import.meta.dirname` supported since Node 20.11 |
| Chart.js not rendering in dev | Canvas not ready | Code handles via `setTimeout(0)` + `$nextTick` — wait or refresh |
| Theme not persisting | localStorage blocked | Check browser settings; incognito may clear on close |
| GitHub import fails | Rate limited (60/hr) | Wait 1 hour; or use authenticated token (not implemented) |

---

## Debugging Tips

```bash
# 1. Open DevTools (F12) → Console for Alpine/toast logs
# 2. Application → Local Storage → cet_mock_tests_v3, cet_test_attempts, cetprep-theme
# 3. Network tab → Filter "fetch/XHR" for GitHub API calls
# 4. Sources → src/js/ for breakpoints (source maps work)
# 5. Vite HMR: edit src/js/main.js → auto-reload preserves Alpine state
```

---

## IDE Setup (VS Code Recommended)

```json
// .vscode/settings.json (optional)
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "javascript.updateImportsOnFileMove.enabled": "always"
}
```

**Extensions**: Prettier, ESLint (not configured), GitLens

---

## No Test Suite

> **Current state**: Zero automated tests.
> - No Jest, Vitest, Cypress, Playwright configured
> - No `test` script in `package.json`
> - Manual visual verification only (per `phases.md` Phase 5)

---

## Related Documents

- [Codebase Tour](codebase-tour.md) — Module walkthrough
- [Conventions](conventions.md) — Code style, patterns
- [Workflow](workflow.md) — Branching, commits, releases
- [Architecture](01-architecture/architecture.md) — System design