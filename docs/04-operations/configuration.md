---
title: CETPrep — Configuration Reference (As-Deployed)
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [sre, engineers, maintainers]
source_of_truth: true
---

# CETPrep — Configuration Reference

> **No runtime configuration exists**. All configuration is compile-time constants or localStorage user preferences. This documents every configurable value in the codebase.

---

## Build-Time Constants (Source Code)

### `vite.config.js`

| Key | Value | Type | Description |
|-----|-------|------|-------------|
| `root` | `'.'` | string | Project root |
| `publicDir` | `'public'` | string | Static assets served at `/` |
| `build.outDir` | `'dist'` | string | Build output directory |
| `build.assetsDir` | `'assets'` | string | Hashed assets subdirectory |
| `build.sourcemap` | `true` | boolean | Generate source maps |
| `build.rollupOptions.input` | `{ index: 'index.html', test: 'test.html' }` | object | Multi-page entry points |
| `server.port` | `5500` | number | Dev server port |
| `server.open` | `true` | boolean | Auto-open browser on dev start |

---

### `src/js/main.js` — GitHub Import Configuration

| Constant | Value | Type | Description | Change Impact |
|----------|-------|------|-------------|---------------|
| `GITHUB_API_BASE` | `'https://api.github.com/repos/p3anv/mock-app-data/contents'` | string | GitHub Contents API base URL | Changing repo requires updating both this and `GITHUB_RAW_BASE` |
| `GITHUB_RAW_BASE` | `'https://raw.githubusercontent.com/p3anv/mock-app-data/main'` | string | GitHub Raw file base URL | Must match repo/branch |
| `TEST_FOLDERS` | `[...]` | array | 4 folders: reading, vocab, di, lr | Add/remove folders here + `folderToCategory` |
| `folderToCategory` | `{ reading: 'Verbal Ability', vocab: 'Verbal Ability', di: 'Quants', lr: 'Logical Reasoning' }` | object | Maps folder → test category | Must match `TEST_FOLDERS` keys |

**TEST_FOLDERS Structure** (actual):
```javascript
const TEST_FOLDERS = [
    { id: 'reading', name: 'Reading Comprehension', icon: '📖' },
    { id: 'vocab', name: 'Vocabulary', icon: '📝' },
    { id: 'di', name: 'Data Interpretation', icon: '📊' },
    { id: 'lr', name: 'Logical Reasoning', icon: '🧩' },
];
```

---

### `src/js/storage.js` — localStorage Keys

| Constant | Value | Type | Description | Migration |
|----------|-------|------|-------------|-----------|
| `STORAGE_KEY` | `'cet_mock_tests_v3'` | string | Tests array key | `_v3` suffix = version; no migration code |
| `ATTEMPTS_KEY` | `'cet_test_attempts'` | string | Attempts array key | No version suffix |
| `THEME_KEY` | `'cetprep-theme'` | string | Theme preference key | Values: `'dark'`, `'light'` |

---

### `src/js/validate.js` — Validation Rules (Implicit Config)

| Rule | Value | Type | Description |
|------|-------|------|-------------|
| Min questions | `1` | number | Array must be non-empty |
| Options per question | `5` | number | Exactly 5 strings required |
| Correct answer range | `0-4` | integer | Index into options array |
| Required fields | `question, options, correct, explanation` | array | All mandatory |

---

### `src/js/charts.js` — Chart Configuration

| Constant | Value | Type | Description |
|----------|-------|------|-------------|
| `chartInstances` | `new Map()` | Map | Live Chart.js instances (cleanup via `destroyChart`) |
| Default bar color (dark) | `'#b8965c'` | string | Derived from `--accent` CSS var |
| Default line color (dark) | `'#4cc38a'` | string | Derived from `--success` CSS var |
| Pie palette (dark) | `['#b8965c', '#4cc38a', '#d9a441', '#e5484d', '#7c3aed', '#06b6d4']` | array | 6 colors |
| Responsive bar heights | `data-count` based | CSS | See `test.css:737-784` |

**Canvas Sizing (via CSS `data-count` attribute):**

| Chart | Data Points | Min Height | CSS Selector |
|-------|-------------|------------|--------------|
| Bar | 1-3 | 200px | `.chart-bar[data-count="1"], [data-count="2"], [data-count="3"]` |
| Bar | 4-6 | 260px | `[data-count="4"], [data-count="5"], [data-count="6"]` |
| Bar | 7-12 | 340px | `[data-count="7"]` through `[data-count="12"]` |
| Line | 1-6 | 220px | `.chart-line[data-count="1"]` through `[data-count="6"]` |
| Line | 7-12 | 300px | `[data-count="7"]` through `[data-count="12"]` |
| Pie | Any | 200px | `.chart-pie` (fixed) |

---

### `src/css/index.css` & `src/css/test.css` — Design System (CSS Variables)

**Defined in `:root` (dark mode default) + `body.light` override**

#### Background Variables

| Variable | Dark Value | Light Value | Usage |
|----------|------------|-------------|-------|
| `--bg` | `#0d0d0d` | `#fafafa` | Page background |
| `--bg-soft` | `#141414` | `#f5f5f5` | Card/surface background |
| `--sidebar` | `#111` | `#fff` | Sidebar background |
| `--surface` | `#1a1a1a` | `#fff` | Primary surface |
| `--surface-2` | `#222` | `#f5f5f5` | Secondary surface |
| `--surface-hover` | `#2a2a2a` | `#eee` | Hover state |
| `--surface-raised` | `#1e1e1e` | `#fff` | Modal/dropdown |

#### Border Variables

| Variable | Dark Value | Light Value |
|----------|------------|-------------|
| `--border` | `#333` | `#ddd` |
| `--border-light` | `#444` | `#eee` |
| `--border-focus` | `#b8965c` | `#9a7d3a` |

#### Text Variables

| Variable | Dark Value | Light Value |
|----------|------------|-------------|
| `--text` | `#e8e8e8` | `#1a1a1a` |
| `--text-secondary` | `#a0a0a0` | `#666` |
| `--text-muted` | `#666` | `#999` |

#### Accent Variables

| Variable | Dark Value | Light Value |
|----------|------------|-------------|
| `--accent` | `#b8965c` | `#9a7d3a` |
| `--accent-soft` | `rgba(184,150,92,0.15)` | `rgba(154,125,58,0.15)` |
| `--accent-strong` | `#d4b06c` | `#b8965c` |

#### Semantic Variables

| Variable | Dark Value | Light Value |
|----------|------------|-------------|
| `--success` | `#4cc38a` | `#16a34a` |
| `--success-soft` | `rgba(76,195,138,0.15)` | `rgba(22,163,74,0.15)` |
| `--danger` | `#e5484d` | `#dc2626` |
| `--danger-soft` | `rgba(229,72,77,0.15)` | `rgba(220,38,38,0.15)` |
| `--warning` | `#d9a441` | `#d97706` |
| `--warning-soft` | `rgba(217,164,65,0.15)` | `rgba(217,119,6,0.15)` |
| `--info` | `#7c3aed` | `#7c3aed` |
| `--info-soft` | `rgba(124,58,237,0.15)` | `rgba(124,58,237,0.15)` |

#### Radius Variables

| Variable | Value |
|----------|-------|
| `--radius-sm` | `4px` |
| `--radius-md` | `8px` |
| `--radius-lg` | `12px` |
| `--radius-xl` | `16px` |
| `--radius-full` | `9999px` |

#### Shadow Variables

| Variable | Value |
|----------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.3)` |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.4)` |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.5)` |
| `--shadow-xl` | `0 16px 48px rgba(0,0,0,0.6)` |

#### Transition Variables

| Variable | Value |
|----------|-------|
| `--transition` | `150ms ease` |
| `--transition-slow` | `300ms ease` |

---

### `package.json` — Project Metadata

| Field | Value | Description |
|-------|-------|-------------|
| `name` | `cet-prep` | Package name |
| `version` | `1.0.0` | SemVer (not updated post-release) |
| `type` | `module` | ES modules |
| `scripts.dev` | `vite` | Dev server |
| `scripts.build` | `vite build` | Production build |
| `scripts.preview` | `vite preview` | Preview build |
| `dependencies.alpinejs` | `^3.14.1` | Alpine.js v3 |
| `dependencies.chart.js` | `^4.4.7` | Chart.js v4 |
| `dependencies.papaparse` | `^5.5.2` | PapaParse v5 |
| `devDependencies.vite` | `^8.3.8` | Vite v8 |

---

## Runtime Configuration (localStorage)

### User Preferences

| Key | Values | Default | Description |
|-----|--------|---------|-------------|
| `cetprep-theme` | `'dark'`, `'light'` | `'dark'` (CSS default) | Theme preference; persists across sessions |

### User Data

| Key | Structure | Description |
|-----|-----------|-------------|
| `cet_mock_tests_v3` | `Test[]` | All created/imported tests |
| `cet_test_attempts` | `Attempt[]` | All exam attempts |

**No other runtime config exists.**

---

## Environment Variables (Not Currently Used)

| Variable | Example | Purpose | Implementation Status |
|----------|---------|---------|----------------------|
| `VITE_GITHUB_TOKEN` | `ghp_xxx` | Authenticated GitHub API (5000/hr) | **Not implemented** — code reads `import.meta.env.VITE_GITHUB_TOKEN` but doesn't use |
| `VITE_APP_VERSION` | `1.0.0` | Version display | **Not implemented** |

**To enable**: Add to `.env` (local) or CI secrets (build), then use in `main.js`:
```javascript
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || '';
const headers = GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {};
```

---

## Feature Flags

**None implemented.**

---

## Configuration Drift Risks

| Risk | Source | Mitigation |
|------|--------|------------|
| GitHub repo URL mismatch | `GITHUB_API_BASE` vs `GITHUB_RAW_BASE` | Single source of truth constant; validate at build |
| localStorage key version | `STORAGE_KEY` suffix `_v3` | Document migration process in [Breaking Changes](02-api/breaking-changes.md) |
| CSS variable vs Chart.js color drift | `getComputedStyle` in `charts.js` | Colors derived at render time; sync maintained |
| Category mismatch | `TEST_FOLDERS` vs `folderToCategory` | Unit test (when added) or manual verify |

---

## Changing Configuration

### To Change GitHub Import Source

1. Edit `src/js/main.js`:
   - `GITHUB_API_BASE` → new repo contents API URL
   - `GITHUB_RAW_BASE` → new repo raw URL
   - `TEST_FOLDERS` → new folder list
   - `folderToCategory` → new mapping
2. Run `npm run build`
3. Deploy `dist/`

### To Add localStorage Migration

1. Add new key constant in `storage.js` (e.g., `STORAGE_KEY_V4`)
2. Write `migrateToV4()` function
3. Call in `getAllTests()` / `getAllAttempts()` on load
4. Update `STORAGE_KEY` export
5. Document in [Breaking Changes](02-api/breaking-changes.md)

### To Change Theme Colors

1. Edit `src/css/index.css` `:root` and `body.light` variables
2. Chart colors auto-derive via `getComputedStyle` (no JS change needed)
3. Run `npm run build`
4. Deploy `dist/`

---

## Related Documents

- [Deployment](deployment.md) — Build and deploy process
- [Architecture](01-architecture/architecture.md) — System context
- [Codebase Tour](03-development/codebase-tour.md) — Module details
- [Breaking Changes](02-api/breaking-changes.md) — Migration history
- [Tech Debt](03-development/tech-debt-register.md) — TD-003, TD-010, TD-020