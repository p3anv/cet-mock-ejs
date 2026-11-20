---
title: CETPrep — Architecture Decision Records (ADRs)
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [architects, engineers, auditors]
source_of_truth: true
---

# Architecture Decision Records (ADRs)

> **Reconstructed from git history, PRD, and code** — marked `[reconstructed]` where not originally documented as ADRs.

## ADR Template

```markdown
---
title: ADR-XXX: <Short Title>
status: accepted | deprecated | superseded
date: YYYY-MM-DD
deciders: [@author1, @author2]
---

## Context
What is the issue that we're seeing that is motivating this decision or change?

## Decision
What is the change that we're proposing and/or doing?

## Consequences
What becomes easier or more difficult to do because of this change?

### Positive
- 

### Negative
- 

### Neutral
- 

## Alternatives Considered
What other options were evaluated?

## Evidence
Commit/PR: <hash or link>
```

---

## ADR Index

| ADR | Title | Status | Date | Evidence |
|-----|-------|--------|------|----------|
| [ADR-001](adr-001-vite-alpine.md) | Vite + Alpine.js over monolithic HTML/JS | Accepted | 2026-11-19 | `a3a8fc2`, `phases.md` |
| [ADR-002](adr-002-localstorage-only.md) | Zero backend — localStorage for all persistence | Accepted | 2026-11-19 | `prd.md:29-31`, `storage.js` |
| [ADR-003](adr-003-chartjs.md) | Chart.js for visualizations (replace manual canvas) | Accepted | 2026-11-19 | `phases.md:17`, `charts.js` |
| [ADR-004](adr-004-papaparse.md) | PapaParse for CSV generation | Accepted | 2026-11-19 | `phases.md:16`, `csv.js` |
| [ADR-005](adr-005-github-import.md) | GitHub repo as test content source | Accepted | 2026-11-19 | `main.js:6-14`, `phases.md` |
| [ADR-006](adr-006-css-parity.md) | CSS frozen — no class/layout changes | Accepted | 2026-11-19 | `rules.md`, `prd.md:13-18` |
| [ADR-007](adr-007-hash-routing.md) | Hash-based SPA routing in index.html | Accepted | 2026-11-19 | `main.js:251-258` |
| [ADR-008](adr-008-keyboard-shortcuts.md) | Full keyboard shortcuts for exam interface | Accepted | 2026-11-19 | `test.js:70-150` |
| [ADR-009](adr-009-theme-persistence.md) | Dark/Light theme in localStorage | Accepted | 2026-11-19 | `storage.js:49-55` |
| [ADR-010](adr-010-json-format.md) | Immutable JSON question format with chart markup | Accepted | 2026-11-19 | `validate.js`, `prd.md:32` |

---

## How to Add New ADRs

1. Copy the template above
2. Number sequentially (ADR-011, ADR-012...)
3. Place in `docs/01-architecture/decisions/`
4. Update this index table
5. Link from relevant architecture docs

---

## Related Documents

- [Architecture](architecture.md) — C4 diagrams referencing these decisions
- [Phases Plan](../phases.md) — Original implementation phases (source)
- [PRD](../prd.md) — Product requirements (source)