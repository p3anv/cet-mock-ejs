---
title: CETPrep — Changelog (Reconstructed)
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [engineers, maintainers, users]
source_of_truth: true
---

# CETPrep — Changelog

> Reconstructed from git history (8 commits, 2026-11-19 to 2026-11-20). No formal releases or tags exist.

---

## [Unreleased] — Current Main Branch

### Added
- Initial Vite + Alpine.js architecture (migration from monolithic HTML)
- Dashboard with 5 pages: Dashboard, Create Test, My Tests, Samples, Import
- Exam interface (`test.html`) with timer, navigator, keyboard shortcuts
- localStorage persistence (tests, attempts, theme)
- JSON validation with detailed error messages
- Chart.js integration: Bar, Line, Pie charts + HTML Tables
- Paragraph markup parser: `[BARGRAPH]`, `[LINEGRAPH]`, `[PIEGRAPH]`, `[TABLE]`
- PapaParse CSV export for exam results
- GitHub import: 4 folders (Reading, Vocabulary, Data Interpretation, Logical Reasoning)
- Dark/Light theme with localStorage persistence
- Toast notifications, confirm modals, history modal
- 20+ keyboard shortcuts for exam navigation
- Responsive CSS with design system (CSS variables)
- Chart container sizing by data count (bar/line scale, pie fixed)

### Changed
- **BREAKING**: localStorage key `cet_mock_tests` → `cet_mock_tests_v3` (no migration)
- **BREAKING**: Monolithic HTML/JS → Vite multi-page + ES modules
- **BREAKING**: Manual canvas charts → Chart.js 4.x
- **BREAKING**: Manual CSV string building → PapaParse
- Chart sizing: Fixed heights → responsive by data point count

### Fixed
- CSS rendering issues (multiple commits)
- Chart color derivation from CSS variables
- Theme toggle persistence

---

## Version History (Git Commits)

| Date | Commit | Message | Type |
|------|--------|---------|------|
| 2026-11-20 | `e5dd993` | `latest` | Chore |
| 2026-11-20 | `94a0c50` | `add` | Chore |
| 2026-11-19 | `fd6eea5` | `Increase chart sizes: bar/line scale with data count, pie stays compact` | Feat |
| 2026-11-19 | `62cc25c` | `css fixed` | Fix |
| 2026-11-19 | `499f27d` | `fix css` | Fix |
| 2026-11-19 | `a3a8fc2` | `add` | Feat (initial scaffold) |
| 2026-11-19 | `a3a8fc2^` | (initial commit) | Init |

---

## Release Notes Template (For Future)

```markdown
## [vX.Y.Z] - YYYY-MM-DD

### Added
- Feature description (#issue)

### Changed
- Behavior change description (#issue)

### Fixed
- Bug fix description (#issue)

### Security
- Vulnerability fix description (#issue)

### Deprecated
- Feature deprecation notice

### Removed
- Removed feature description
```

---

## Migration Notes

### v1.0.0 (Current) ← Pre-Migration

| Area | Before | After | Migration |
|------|--------|-------|-----------|
| Architecture | Single HTML + inline JS | Vite + ES modules + Alpine.js | Full rewrite |
| localStorage | `cet_mock_tests` / `_v2` | `cet_mock_tests_v3` | **None** — data lost |
| Charts | Manual `<canvas>` drawing | Chart.js 4.4.7 | Re-render on load |
| CSV | String concatenation | PapaParse 5.5.2 | Auto on next export |
| Import | N/A | GitHub API + Raw | New feature |

**No automated migration** — users on pre-migration lose all data.

---

## Related Documents

- [Breaking Changes](02-api/breaking-changes.md) — Detailed breaking change log
- [Timeline](timeline.md) — Milestone timeline
- [Lessons Learned](lessons-learned.md) — Retrospective
- [Completion Record](00-overview/completion-record.md) — As-built acceptance