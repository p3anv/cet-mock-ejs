---
title: CETPrep — Breaking Changes History (As-Built)
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [engineers, maintainers, integrators]
source_of_truth: true
---

# CETPrep — Breaking Changes History

> Chronological list of breaking changes across versions. Since no formal releases exist, this is reconstructed from git history and code evidence.

---

## Version Timeline

| Version | Date | Commit | Type |
|---------|------|--------|------|
| **v1.0.0 (current)** | 2026-11-20 | `e5dd993` | Initial release (post-migration) |
| **Pre-migration (legacy)** | 2026-11-19 | `a3a8fc2` | Monolithic HTML/JS |

---

## Breaking Changes

### 1. localStorage Key Migration: `cet_mock_tests` → `cet_mock_tests_v3`

| Attribute | Detail |
|-----------|--------|
| **When** | Pre-migration (evidenced by `_v3` suffix) |
| **Type** | Data migration — key rename |
| **Impact** | All existing user tests lost (orphaned in old keys) |
| **Migration Code** | None — new key, old data abandoned |
| **Evidence** | `storage.js:1` — `STORAGE_KEY = 'cet_mock_tests_v3'` |

**Migration Note**: The `_v3` suffix implies at least 2 prior key versions (`cet_mock_tests`, `cet_mock_tests_v2`). No migration logic exists in codebase.

---

### 2. Architecture: Monolithic → Vite + Alpine.js Modules

| Attribute | Detail |
|-----------|--------|
| **When** | 2026-11-19 (commit `a3a8fc2`) |
| **Type** | Full rewrite / migration |
| **Impact** | - All global functions → ES module exports<br>- Inline event handlers → Alpine directives (`@click`, `x-model`)<br>- Manual DOM rendering → `x-for` templates<br>- `document.getElementById` → Alpine reactive state |
| **Migration Path** | Documented in `phases.md` (4 phases) |
| **Breaking For** | Any external script calling global functions (none known) |
| **Evidence** | `phases.md`, `a3a8fc2` (first commit with full scaffold) |

---

### 3. Chart Rendering: Manual Canvas → Chart.js

| Attribute | Detail |
|-----------|--------|
| **When** | 2026-11-19 (Phase 2) |
| **Type** | Library replacement |
| **Impact** | - Chart config API completely different<br>- Colors now from CSS variables (not hardcoded)<br>- Canvas sizing via CSS `data-count` + `:has()` selectors<br>- Tables now HTML `<table>` (not canvas) |
| **Visual Parity** | PRD required exact color match — verified via CSS variables |
| **Evidence** | `phases.md:17`, `charts.js`, `test.css:737-784` |

---

### 4. CSV Generation: Manual String → PapaParse

| Attribute | Detail |
|-----------|--------|
| **When** | 2026-11-19 (Phase 2) |
| **Type** | Library adoption |
| **Impact** | - Proper RFC 4180 escaping (commas, quotes, newlines in explanations)<br>- Output format identical for simple data<br>- No migration needed for consumers |
| **Evidence** | `phases.md:16`, `csv.js` |

---

### 5. Import System: New Feature (GitHub Integration)

| Attribute | Detail |
|-----------|--------|
| **When** | 2026-11-19 (Phase 3-4) |
| **Type** | New capability |
| **Impact** | - New external dependency (GitHub API)<br>- New UI page (`#import`)<br>- New Alpine state (`folderTests`, `importLoading`, etc.)<br>- No breaking change to existing features |
| **Evidence** | `main.js:6-14`, `index.html:478-698` |

---

### 6. Chart Sizing: Fixed → Data-Count Responsive

| Attribute | Detail |
|-----------|--------|
| **When** | 2026-11-19 (commit `fd6eea5`) |
| **Type** | Enhancement (post-migration) |
| **Impact** | - Bar/Line charts scale height by data point count<br>- Pie charts stay compact<br>- CSS `:has(.chart-bar[data-count="N"])` selectors |
| **Commit Message** | "Increase chart sizes: bar/line scale with data count, pie stays compact" |
| **Evidence** | `fd6eea5`, `test.css:737-784` |

---

### 7. CSS: Vite Asset Handling (No Functional Change)

| Attribute | Detail |
|-----------|--------|
| **When** | 2026-11-19 (commit `a3a8fc2`) |
| **Type** | Build change |
| **Impact** | - CSS moved to `src/css/`<br>- `[x-cloak]` prepended<br>- Vite processes as asset<br>- No class/selector changes |
| **Evidence** | `phases.md:10-11`, `src/css/index.css:1`, `src/css/test.css:1` |

---

## Migration Guides (For Future Changes)

### If Changing localStorage Key (v4)

```javascript
// 1. Add new key constant
const STORAGE_KEY_V4 = 'cet_mock_tests_v4';

// 2. Write migration in storage.js
export function migrateToV4() {
    const v3 = localStorage.getItem('cet_mock_tests_v3');
    if (v3) {
        localStorage.setItem(STORAGE_KEY_V4, v3);
        // Optionally remove v3 after verification
    }
}

// 3. Update STORAGE_KEY export
// 4. Deploy; users auto-migrate on first load
```

### If Changing JSON Question Format

```javascript
// 1. Update validate.js with new rules (additive preferred)
// 2. Add version field to Test object: { ..., formatVersion: 2 }
// 3. In main.js: detect old format, show migration UI
// 4. Provide "Upgrade Test" button per test
```

### If Removing GitHub Import

```javascript
// 1. Remove GITHUB_* constants from main.js
// 2. Remove importTest, importSelectedTests, loadFolderTests methods
// 3. Remove #import page from index.html
// 4. Remove TEST_FOLDERS, folderTests, activeFolder, etc. state
// 5. Update sidebar nav (remove Import link)
```

---

## Compatibility Matrix

| Client Version | localStorage Key | JSON Format | GitHub Import | Chart.js |
|----------------|------------------|-------------|---------------|----------|
| Pre-migration (legacy) | `cet_mock_tests` / `_v2` | Original | N/A | Manual canvas |
| v1.0.0 (current) | `cet_mock_tests_v3` | Frozen (PRD) | Active | 4.4.7 |

**No forward/backward compatibility** — each version uses distinct localStorage key.

---

## Related Documents

- [Data Model](01-architecture/data-model.md) — Current schemas
- [ADR-002](01-architecture/decisions/adr-002-localstorage-only.md) — localStorage decision
- [ADR-010](01-architecture/decisions/adr-010-json-format.md) — JSON format decision
- [Completion Record](00-overview/completion-record.md) — Delivery status