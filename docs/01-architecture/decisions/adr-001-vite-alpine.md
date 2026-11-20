---
title: ADR-001: Vite + Alpine.js over Monolithic HTML/JS
status: accepted
date: 2026-11-19
deciders: [@pranav]
---

## Context

The original CETPrep implementation was a single monolithic HTML file with embedded CSS and JavaScript. This created several problems:

- **Unmaintainable**: 2000+ lines in one file; no module boundaries
- **No build process**: No linting, bundling, or optimization
- **Difficult testing**: No way to unit test isolated logic
- **Poor DX**: No hot module replacement, no source maps
- **Global namespace pollution**: All functions/variables in global scope

The PRD (Product Requirements Document) mandated modernization while keeping:
- 100% frontend, lightweight
- No heavy frameworks (React, Vue, Next.js)
- Exact CSS/UI parity

## Decision

Migrate to **Vite** as build tool with **Alpine.js** for reactivity:

- **Vite 8.x**: Dev server, ES module bundling, multi-page support (`index.html` + `test.html`), CSS/asset handling
- **Alpine.js 3.x**: Lightweight reactivity (`x-data`, `x-show`, `x-for`, `x-model`, `@click`) — ~15 KB gzipped
- **ES Modules**: All JavaScript split into `src/js/*.js` modules with `import`/`export`
- **CSS unchanged**: Existing `index.css` and `test.css` moved to `src/css/` with only `[x-cloak]` added

## Consequences

### Positive
- Clear module boundaries: `storage.js`, `charts.js`, `validate.js`, `csv.js`, `ui.js`, `main.js`, `test.js`
- Fast dev server with HMR
- Production build optimizes bundles (`dist/assets/*.js`)
- TypeScript-ready (JSDoc + ES modules)
- Alpine.js keeps HTML-centric approach — templates in HTML, logic in JS
- Multi-page build supports separate `index.html` and `test.html` entry points

### Negative
- Build step required (was zero-build before)
- `node_modules` + `package-lock.json` added (~30 MB)
- Alpine.js learning curve for team used to vanilla DOM manipulation
- Vite config complexity for multi-page + Cloudflare Pages compatibility

### Neutral
- Same runtime dependencies (Chart.js, PapaParse) — just bundled differently
- No change to CSS or visual output

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **React + Vite** | PRD: "free of heavy frameworks"; bundle size; overkill for this UI |
| **Vue + Vite** | Same as React; Alpine.js is lighter and HTML-centric |
| **Vanilla ES Modules (no build)** | No HMR, no optimization, browser compatibility issues with bare imports |
| **Parcel / Webpack** | Vite faster, simpler config, native ES modules |
| **Svelte** | Framework overhead; PRD forbids |

## Evidence

- **Commit**: `a3a8fc2` (first commit — scaffolded Vite + Alpine)
- **Phases**: `phases.md` Phase 1-2 document the migration plan
- **PRD**: `prd.md` Section 2 (Technical Stack) and Section 3 (UI/UX Constraint)
- **Config**: `vite.config.js` — multi-page input config
- **Code**: `src/js/main.js:1-2` imports Alpine + modules; `Alpine.data('app')` pattern