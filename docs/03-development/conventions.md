---
title: CETPrep — Code Conventions (As-Built)
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [engineers, maintainers]
source_of_truth: true
---

# CETPrep — Code Conventions

> Documented from actual codebase patterns. No aspirational rules — only what exists.

---

## Language & Runtime

| Aspect | Convention | Evidence |
|--------|------------|----------|
| **Language** | ES2022 modules (`.js` files, `import`/`export`) | All `src/js/*.js` |
| **Runtime** | Browser only (no Node runtime code) | `vite.config.js`, `package.json` |
| **Module System** | ES modules via Vite (native in dev, bundled in prod) | `vite.config.js:4` |
| **Strict Mode** | Implicit via modules | All `.js` files |
| **TypeScript** | Not used | No `tsconfig.json`, no `.ts` files |

---

## File Organization

```
src/js/
├── main.js       # Dashboard app (2 Alpine components: 'app', 'toast')
├── test.js       # Exam app (1 Alpine component: 'testApp')
├── storage.js    # Pure functions (no Alpine)
├── charts.js     # Pure functions + Chart.js (no Alpine)
├── validate.js   # Pure functions (no Alpine)
├── csv.js        # Pure functions + PapaParse (no Alpine)
└── ui.js         # DOM utilities (not Alpine)
```

**Rule**: Each file = single responsibility. No circular imports.

---

## Naming Conventions

| Category | Convention | Examples |
|----------|------------|----------|
| **Files** | kebab-case | `main.js`, `storage.js`, `index.css` |
| **Exports** | camelCase functions | `getAllTests`, `renderBarGraph`, `validateJSONStructure` |
| **Constants** | UPPER_SNAKE_CASE | `STORAGE_KEY`, `GITHUB_API_BASE` |
| **Alpine Components** | PascalCase in `Alpine.data()` | `'app'`, `'testApp'`, `'toast'` |
| **CSS Classes** | kebab-case (BEM-ish) | `.chart-container`, `.nav-link--active` |
| **CSS Variables** | `--kebab-case` | `--bg`, `--accent-soft`, `--radius-lg` |
| **localStorage Keys** | `cet_*_vN` | `cet_mock_tests_v3`, `cet_test_attempts` |
| **ID Attributes** | kebab-case | `#paragraphBox`, `#resultsModal` |
| **Data Attributes** | `data-kebab-case` | `data-count`, `data-question-index` |

---

## JavaScript Patterns

### 1. Alpine Component Structure

```javascript
// main.js:10-15 (actual pattern)
Alpine.data('app', () => ({
    // --- State ---
    currentPage: 'dashboard',
    theme: 'dark',
    // ... 30+ properties

    // --- Init ---
    init() {
        // Theme, routing, data load
    },

    // --- Methods (alphabetical-ish) ---
    methodA() { ... },
    methodB() { ... },

    // --- Getters (computed) ---
    get timerDisplay() { ... },
}));
```

**Observed**:
- All reactive state at top (no `this.` in property declarations)
- `init()` called via `x-init="init()"` in HTML
- Methods grouped by feature area (routing, create, tests, import)
- Getters at bottom for computed values

### 2. Pure Module Pattern (storage.js, charts.js, validate.js, csv.js)

```javascript
// storage.js:1-5 (actual pattern)
const STORAGE_KEY = 'cet_mock_tests_v3';
const ATTEMPTS_KEY = 'cet_test_attempts';
const THEME_KEY = 'cetprep-theme';

export function getAllTests() { ... }
export function saveTest(test) { ... }
// ...
export const STORAGE_KEYS = { STORAGE_KEY, ATTEMPTS_KEY, THEME_KEY };
```

**Observed**:
- Constants at top (not exported individually)
- Named exports for functions
- Single default-like object export for constants (`STORAGE_KEYS`)
- No classes, no `this` — pure functions

### 3. Error Handling

| Pattern | Used In | Example |
|---------|---------|---------|
| `try/catch` + `return []` | `storage.js` JSON.parse | `catch { return []; }` |
| `try/catch` + silent fail | `storage.js` setItem quota | `catch (e) { if (e.name === 'QuotaExceededError') return; }` |
| Early return + error object | `validate.js` | `return { valid: false, error: '...' }` |
| Toast on failure | `main.js` GitHub fetch | `showToast(error, 'error')` |
| No global error boundary | — | Uncaught → console |

**Anti-pattern**: `storage.js` silently swallows `QuotaExceededError` — user never notified.

### 4. Async Patterns

| Pattern | Location | Notes |
|---------|----------|-------|
| `async/await` + `fetch` | `main.js` GitHub calls | No timeout, no retry |
| `Promise.all` | `main.js:400` `loadAllFolders()` | 4 parallel folder fetches |
| Sequential `for...of` + `await` | `main.js:654` `importSelectedTests()` | Avoids rate limit burst |
| `setTimeout(0)` | `charts.js:394`, `test.js:294` | Defer until DOM ready |
| `$nextTick` + `$watch` | `test.js:48-50` | Alpine reactivity → DOM → Chart.js |

### 5. DOM Manipulation

| Approach | Location | When Used |
|----------|----------|-----------|
| Alpine directives (`x-show`, `x-for`, `@click`) | `index.html`, `test.html` | 95% of UI |
| `document.createElement` | `ui.js`, `charts.js` (table), `test.js` (results modal) | Modals, dynamic charts/tables |
| `innerHTML` / `x-html` | `main.js:304` (theme icon), `charts.js:306` (table replace) | Dynamic SVG/HTML strings |
| Direct style manipulation | `charts.js:19-38` (`getComputedStyle`) | Reading CSS variables for Chart.js colors |

---

## CSS Conventions

### Design System (CSS Variables)

**Defined in**: `src/css/index.css:3-80` (`:root`) + `body.light` override

| Category | Naming | Example |
|----------|--------|---------|
| Colors | `--{role}` / `--{role}-{variant}` | `--accent`, `--accent-soft`, `--success-soft` |
| Spacing | `--space-{size}` | `--space-4` (not used directly; utility classes instead) |
| Radius | `--radius-{size}` | `--radius-md`, `--radius-full` |
| Shadows | `--shadow-{size}` | `--shadow-lg` |
| Transitions | `--transition` / `--transition-slow` | `--transition`: `150ms ease` |

**Usage**: Always via `var(--name)` in declarations. No raw hex/rgb in component styles.

### Class Naming (BEM-ish)

```
.block                /* .sidebar, .test-navigator, .chart-container */
.block__element       /* .sidebar__link, .navigator__btn */
.block--modifier      /* .nav-link--active, .btn--primary */
.block__element--modifier /* .chart-container--bar */
```

**Utility Classes** (in `index.css:85-200`):
- `.flex`, `.flex-col`, `.items-center`, `.justify-between`
- `.gap-{1-8}`, `.p-{1-8}`, `.m-{1-8}`
- `.text-{sm,base,lg,xl}`, `.font-{normal,medium,semibold,bold}`
- `.rounded-{sm,md,lg,full}`, `.shadow-{sm,md,lg,xl}`

### Frozen Rule

> **Only permitted CSS change**: `[x-cloak] { display: none !important; }` at line 1 of each file.
>
> **Evidence**: `rules.md`, `prd.md` "CSS is Law", commits `62cc25c`, `499f27d`

---

## HTML Conventions

### Alpine Directives

| Directive | Usage | Example |
|-----------|-------|---------|
| `x-data` | Component root | `<body x-data="app" x-cloak>` |
| `x-init` | Lifecycle | `<div x-init="init()">` |
| `x-show` | Conditional visibility | `<div x-show="currentPage === 'create'">` |
| `x-for` | List rendering | `<template x-for="test in getFilteredTests(cat)">` |
| `x-model` | Two-way binding | `<textarea x-model="jsonInput">` |
| `@click` / `@change` / `@input` | Events | `<button @click="generateTest()">` |
| `:class` / `:style` | Dynamic classes/styles | `:class="{ 'nav-link--active': activeTab === cat }"` |
| `x-html` | Raw HTML (⚠️ XSS risk) | `<span x-html="themeIcon"></span>` |
| `x-ref` | DOM reference | `<canvas x-ref="chartCanvas">` |
| `x-transition` | Animations | `<div x-transition:enter="transition-opacity">` |

### Hash Routing

```html
<!-- index.html:46-50 -->
<nav class="sidebar">
    <a href="#dashboard" class="nav-link" @click="showPage('dashboard')">Dashboard</a>
    <a href="#create" class="nav-link" @click="showPage('create')">Create Test</a>
    ...
</nav>
```

- Links use `href="#page"` + `@click="showPage('page')"`
- `showPage()` calls `history.replaceState(null, '', '#' + page)`
- `hashchange` listener in `init()` calls `loadFromHash()`

---

## Data Conventions

### Test Object (from `storage.js` + `validate.js`)

```typescript
interface Test {
    id: string;                    // "test_" + UUID
    name: string;
    category: 'Verbal Ability' | 'Logical Reasoning' | 'Quants' | 'Misc';
    questions: Question[];
    createdAt: string;             // ISO 8601
    updatedAt?: string;            // ISO 8601 (not consistently set)
}

interface Question {
    question: string;              // Required
    options: string[5];            // Exactly 5
    correct: 0 | 1 | 2 | 3 | 4;    // Index
    explanation: string;           // Required
    paragraph?: string;            // Optional: contains [BARGRAPH], [LINEGRAPH], [PIEGRAPH], [TABLE]
}
```

### Attempt Object

```typescript
interface Attempt {
    id: string;                    // "attempt_" + UUID
    testId: string;                // Ref to Test.id
    testName: string;              // Denormalized
    testCategory: string;          // Denormalized
    date: string;                  // ISO 8601
    timeSeconds: number;           // Elapsed
    score: number;                 // Correct count
    total: number;                 // Question count
    percentage: number;            // 0-100
    answers: (number | null)[];    // User selections
    markedForReview: boolean[];    // Flags
}
```

### Chart Markup (in `Question.paragraph`)

```
Plain text paragraph.

[BARGRAPH]
Title: Category Scores
Category A: 85
Category B: 92
Category C: 78

[LINEGRAPH]
Title: Progress Over Time
Week 1: 60
Week 2: 72
Week 3: 85

[PIEGRAPH]
Title: Topic Distribution
Algebra: 30
Geometry: 25
Arithmetic: 45

[TABLE]
Title: Score Breakdown
Topic | Score | Weight
Algebra | 85 | 0.4
Geometry | 90 | 0.3
Arithmetic | 78 | 0.3
```

**Parser**: `charts.js:312-410` — line-based state machine.

---

## Git Conventions

### Commit Messages (from history)

| Commit | Message | Pattern |
|--------|---------|---------|
| `e5dd993` | `latest` | Terse, no conventional format |
| `94a0c50` | `add` | Terse |
| `fd6eea5` | `Increase chart sizes: bar/line scale with data count, pie stays compact` | Imperative, descriptive |
| `62cc25c` | `css fixed` | Terse |
| `499f27d` | `fix css` | Terse |

**Observed**: No consistent convention. Mix of terse and descriptive. No conventional commits (`feat:`, `fix:`).

### Branching

- Single branch: `main` (8 commits, all on main)
- No feature branches, no PRs in history
- Direct commits to main

---

## Dependency Conventions

| Dependency | Version Policy | Update Cadence |
|------------|----------------|----------------|
| `alpinejs` | `^3.14.1` (pinned minor) | Manual |
| `chart.js` | `^4.4.7` (pinned minor) | Manual |
| `papaparse` | `^5.5.2` (pinned minor) | Manual |
| `vite` | `^8.3.8` (dev dependency) | Manual |

**No** `package-lock.json` commitment policy documented. `npm audit` clean as of 2026-11-20.

---

## Security Conventions

| Practice | Status | Evidence |
|----------|--------|----------|
| CSP header | Not implemented | No `meta http-equiv` in HTML |
| XSS prevention | Partial | `x-html` used for theme icon (trusted); `innerHTML` in results modal (trusted data) |
| Input sanitization | None | JSON input parsed directly; GitHub data trusted |
| Secrets in code | None | No API keys, tokens in repo |
| Dependency audit | Manual | `npm audit` run ad-hoc |

---

## Anti-Patterns Documented (Do Not Repeat)

| Anti-Pattern | Location | Why It Exists | Risk |
|--------------|----------|---------------|------|
| Silent quota failure | `storage.js:8-10, 20-22, 32-34` | Simplicity | Data loss unnoticed |
| No cross-tab sync | Missing `storage` event | Not implemented | Theme drift across tabs |
| `x-html` with dynamic content | `main.js:304`, `charts.js:306` | Convenience | XSS if source ever user-controlled |
| No request timeout | `main.js` GitHub fetch | Simplicity | Hang on slow network |
| Sequential bulk import | `main.js:654` | Rate limit avoidance | Slow UX for many tests |
| Timer not persisted | `test.js:224` | By design (per PRD) | Lost on refresh |
| No test suite | — | Not prioritized | Regression risk |

---

## Related Documents

- [Codebase Tour](codebase-tour.md) — Module walkthrough with sharp edges
- [Setup](setup.md) — Verified bootstrap steps
- [Architecture](01-architecture/architecture.md) — System design
- [ADR-001](01-architecture/decisions/adr-001-alpinejs.md) — Alpine.js decision
- [ADR-007](01-architecture/decisions/adr-007-pure-frontend.md) — Pure frontend decision