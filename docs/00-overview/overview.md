---
title: CETPrep — System Overview
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [engineers, sre, security, architects, integrators, auditors, maintainers]
source_of_truth: true
---

# CETPrep — System Overview

## What This System Does

CETPrep is a **browser-based mock test platform** for Common Entrance Test (CET) preparation. It enables users to:

1. **Create custom tests** from JSON — paste or upload question data with optional embedded visualizations (bar/line/pie charts, data tables)
2. **Practice in a realistic exam interface** — timed sessions, question navigator, mark-for-review, keyboard shortcuts, explanations
3. **Track progress** — attempt history, best scores, CSV export of results
4. **Import pre-built tests** from a GitHub-hosted repository (`p3anv/mock-app-data`) organized by category (Reading, Vocabulary, Data Interpretation, Logical Reasoning)

**Zero backend** — all data persists in `localStorage`. Works offline after first load.

---

## Business Context

| Aspect | Detail |
|--------|--------|
| **Product Name** | CETPrep |
| **Target Users** | Students preparing for CET (Common Entrance Test) exams in India |
| **Problem Solved** | No lightweight, free, offline-capable tool for creating/customizing mock tests with chart/table support |
| **Differentiator** | JSON-driven question format with inline Chart.js visualizations; pure client-side; no account required |
| **Monetization** | None — free, open deployment |

---

## Scope

### In Scope (Delivered v1.0.0)

| Feature | Description | Evidence |
|---------|-------------|----------|
| Dashboard | Stats (tests created, attempts, categories), quick actions | `index.html:#dashboard`, `main.js:updateDashboardStats()` |
| Test Builder | Form with name, category, JSON textarea, file upload, validation | `index.html:#create`, `main.js:generateTest()`, `validate.js` |
| My Tests Library | Category tabs, search, test cards with Attempt/History/Delete | `index.html:#tests`, `main.js:getFilteredTests()` |
| Exam Interface | Timer, navigator (5-col grid), options, mark-for-review, shortcuts | `test.html`, `test.js` |
| Visualizations | Bar, Line, Pie charts + Tables rendered from paragraph tags | `charts.js`, `test.css:.chart-container` |
| Results Modal | Score summary, question review, CSV export (PapaParse) | `test.js:showResultsModal()`, `csv.js` |
| Theme Toggle | Dark/Light persisted in `localStorage` (`cetprep-theme`) | `storage.js:setTheme()`, both HTML files |
| Import from GitHub | Folder tree (reading/vocab/di/lr), search, bulk import | `main.js:loadFolderTests()`, `index.html:#import` |
| JSON Samples | 7 copy/load samples covering all question formats | `main.js:jsonSamples` |
| Keyboard Shortcuts | Full shortcut set (nav, answer, actions, help) | `test.js:setupKeyboardShortcuts()` |

### Non-Goals (Explicitly Out of Scope)

| Non-Goal | Reason |
|----------|--------|
| Backend / Database | Simplicity, offline-first, zero cost |
| User Accounts / Auth | Frictionless usage; localStorage per browser |
| Real-time Collaboration | Single-user study tool |
| Question Authoring UI | JSON is the authoring format; samples provided |
| Mobile App | Responsive web works on mobile browsers |
| Analytics / Telemetry | Privacy; no tracking |
| Multi-language | English-only for MVP |
| Accessibility (WCAG 2.1 AA) | Not targeted; basic semantic HTML only |

---

## Technical Summary

| Dimension | Detail |
|-----------|--------|
| **Architecture** | Pure frontend, ES modules, Vite build, Alpine.js reactivity |
| **State** | Alpine.js components (`app`, `testApp`, `toast`); `localStorage` persistence |
| **Visualizations** | Chart.js 4.4 (bar, line, pie) + custom HTML table renderer |
| **Data Format** | JSON array of questions; each: `question`, `options[5]`, `correct(0-4)`, `explanation`, optional `paragraph` with chart tags |
| **Storage Keys** | `cet_mock_tests_v3`, `cet_test_attempts`, `cetprep-theme` (immutable) |
| **External Dependency** | GitHub API (`p3anv/mock-app-data`) for importable tests |
| **Build Output** | Static `dist/` — `index.html`, `test.html`, assets |
| **Deploy Target** | Any static host (Cloudflare Pages, Netlify, Vercel, GitHub Pages) |

---

## Related Documents

- [Glossary](glossary.md) — Domain terms and acronyms
- [System Context](system-context.md) — C4 Level 1 diagram
- [Completion Record](completion-record.md) — As-built acceptance summary
- [Architecture](01-architecture/architecture.md) — C4 L2/L3, module boundaries, flows
- [Data Model](01-architecture/data-model.md) — Entities, relationships, schema version