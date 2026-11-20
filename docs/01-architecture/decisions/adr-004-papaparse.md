---
title: ADR-004: PapaParse for CSV Generation
status: accepted
date: 2026-11-19
deciders: [@pranav]
---

## Context

The original implementation used manual CSV string concatenation:
```javascript
const csv = rows.map(r => r.join(',')).join('\n');
```
Problems:
- **No escaping**: Commas, quotes, newlines in data break CSV
- **No RFC 4180 compliance**: Excel/Sheets may misparse
- **Brittle**: Edge cases (embedded commas, line breaks in explanations) not handled

PRD Phase 2 required: "Replace the manual CSV string generation with PapaParse."

## Decision

Use **PapaParse 5.x** (`unparse` function only) for CSV generation:

```javascript
import { unparse } from 'papaparse';
const csv = unparse(rows); // rows: string[][]
```

- Handles escaping, quoting, line endings per RFC 4180
- Zero-config for basic array-of-arrays input
- Lightweight (~10 KB gzipped)
- Only `unparse` used (no parsing needed)

## Consequences

### Positive
- Robust CSV output — works in Excel, Google Sheets, LibreOffice
- Handles explanations with commas, quotes, newlines automatically
- Standard library — well-tested, maintained
- Single import, one-line usage

### Negative
- Extra dependency (~10 KB) for single function
- Full PapaParse includes parser (unused) — could use smaller lib

### Neutral
- CSV download via blob + `URL.createObjectURL` unchanged (`csv.js:17-26`)

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Manual with escaping** | Reinventing wheel; error-prone; maintenance burden |
| **csv-stringify** | Similar size; PapaParse more popular |
| **SheetJS (xlsx)** | Overkill; 200+ KB; CSV only needed |
| **Custom lightweight** | RFC 4180 edge cases are subtle |

## Evidence

- **Phases**: `phases.md:16` — "Replace the manual CSV string generation with PapaParse"
- **Code**: `csv.js:1` — `import { unparse } from 'papaparse'`
- **Usage**: `csv.js:4-14` — `generateCSV` builds rows array, calls `unparse`
- **Download**: `csv.js:17-26` — blob download unchanged
- **Package**: `package.json:14` — `"papaparse": "^5.5.2"`