---
title: CETPrep — Glossary
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [engineers, sre, security, architects, integrators, auditors, maintainers]
source_of_truth: true
---

# CETPrep — Glossary

## Domain Terms

| Term | Definition |
|------|------------|
| **CET** | Common Entrance Test — standardized entrance exams in India for professional courses (engineering, medical, management) |
| **Mock Test** | A practice exam simulating the real CET format, timing, and question types |
| **Question** | A single test item: question text, 5 options (A–E), correct index (0–4), explanation, optional paragraph/visualization |
| **Paragraph** | Optional context block above a question; may contain plain text or chart/table markup tags |
| **Test** | A collection of questions with metadata: `id`, `name`, `category`, `questions[]`, `createdAt` |
| **Attempt** | A user's completed test session: `testId`, `testName`, `score`, `total`, `percentage`, `date`, `answers[]`, `timeSeconds` |
| **Category** | Logical grouping of tests: `Verbal Ability`, `Logical Reasoning`, `Quants`, `Misc` |
| **Folder** | GitHub repository folder mapping to a category: `reading`→Verbal, `vocab`→Verbal, `di`→Quants, `lr`→Logical Reasoning |

## Technical Terms

| Term | Definition |
|------|------------|
| **localStorage** | Browser key-value store (5–10 MB) used for all persistence: tests, attempts, theme |
| **Alpine.js** | Lightweight reactivity library (3.14.x) — `x-data`, `x-show`, `x-for`, `x-model`, `@click` |
| **Chart.js** | Canvas-based charting library (4.4.x) — bar, line, pie charts rendered in `.chart-container` |
| **PapaParse** | CSV parser/generator (5.5.x) — used for `unparse()` in results export |
| **Vite** | Build tool (8.3.x) — dev server, ES module bundling, multi-page (`index.html` + `test.html`) |
| **ES Modules** | Native JavaScript modules (`import`/`export`) — all `src/js/*.js` are modules |
| **x-cloak** | Alpine directive hiding elements until Alpine initializes — prevents flash of unrendered templates |
| **$nextTick** | Alpine utility to run code after DOM updates — critical for Chart.js canvas rendering |

## Chart Markup Tags (in `paragraph`)

| Tag | Chart Type | Data Format |
|-----|------------|-------------|
| `[BARGRAPH]` | Vertical bar chart | Title line, then `Label: Value` lines |
| `[LINEGRAPH]` | Line chart with area fill | Title line, then `Label: Value` lines |
| `[PIEGRAPH]` | Pie chart with legend | Title line, then `Label: Value` lines |
| `[TABLE]` | Sortable HTML table | Title line, then `Header1 \| Header2 \| ...` rows |

**Example:**
```
[BARGRAPH]
Quarterly Sales 2024
Q1: 120
Q2: 85
Q3: 200
Q4: 145
```

## Storage Keys (Immutable)

| Key | Purpose | Schema Version |
|-----|---------|----------------|
| `cet_mock_tests_v3` | Array of Test objects | v3 (current) |
| `cet_test_attempts` | Array of Attempt objects | v1 (implicit) |
| `cetprep-theme` | `'dark'` or `'light'` | v1 |

## File/Module Map

| File | Responsibility |
|------|----------------|
| `src/js/storage.js` | All localStorage CRUD: tests, attempts, theme |
| `src/js/validate.js` | JSON structure validation for test creation |
| `src/js/charts.js` | Chart.js wrappers: bar, line, pie, table, paragraph parser |
| `src/js/csv.js` | PapaParse-based CSV generation + download |
| `src/js/ui.js` | Toast, confirm modal, history modal utilities |
| `src/js/main.js` | Dashboard, Create, My Tests, Samples, Import pages (Alpine `app`) |
| `src/js/test.js` | Exam interface: timer, navigator, answers, results (Alpine `testApp`) |
| `index.html` | Main SPA shell: sidebar nav, 5 pages |
| `test.html` | Exam page: header, navigator + question panel |
| `src/css/index.css` | Dashboard/builder/library/styles (design system) |
| `src/css/test.css` | Exam interface styles (design system) |

## Acronyms

| Acronym | Expansion |
|---------|-----------|
| **CET** | Common Entrance Test |
| **DI** | Data Interpretation (test category) |
| **LR** | Logical Reasoning (test category) |
| **RC** | Reading Comprehension (question type) |
| **SPA** | Single Page Application (index.html hash routing) |
| **CSV** | Comma-Separated Values |
| **DOM** | Document Object Model |
| **XSS** | Cross-Site Scripting |
| **SBOM** | Software Bill of Materials |

## Internal Jargon

| Term | Meaning |
|------|---------|
| **"The CSS is Law"** | Rule from `rules.md`: never modify CSS classes, layout, or visual output |
| **"Unslopped"** | PRD term for the import page: clean, enterprise-grade UI without AI-generated tells |
| **"Paragraph"** | Overloaded: means both plain text context AND the chart markup container |
| **"Question Navigator"** | The 5-column grid of numbered buttons showing answered/marked/current state |
| **"Explanation Toast"** | Bottom-right toast showing question explanation (not the top-right status toast) |
| **"Hash Routing"** | `window.location.hash` drives page changes in `index.html` (`#dashboard`, `#create`, etc.) |

---

## Related Documents

- [Overview](overview.md) — Business context and scope
- [System Context](system-context.md) — C4 Level 1 diagram
- [Data Model](01-architecture/data-model.md) — Entities and relationships