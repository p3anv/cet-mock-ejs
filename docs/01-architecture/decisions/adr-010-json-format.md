---
title: ADR-010: Immutable JSON Question Format with Chart Markup
status: accepted
date: 2026-11-19
deciders: [@pranav]
---

## Context

Need a portable, human-editable format for test questions that supports:
- Plain questions
- Reading comprehension (paragraph text)
- Data visualization questions (charts, tables)
- Explanations for learning

PRD constraint: "Do not alter the structure of the JSON required to create a test."

## Decision

**JSON format: Array of Question objects** with fixed schema:

```json
[
  {
    "paragraph": "[BARGRAPH]\\nSales Data\\nA: 120\\nB: 85\\nC: 200",
    "question": "Which product sold most?",
    "options": ["A","B","C","D","E"],
    "correct": 2,
    "explanation": "C sold 200 units."
  }
]
```

**Required fields** (enforced by `validate.js`):
- `question`: string (non-empty)
- `options`: string[5] (exactly 5)
- `correct`: 0-4 (integer index)
- `explanation`: string (non-empty)

**Optional field**:
- `paragraph`: string (may contain chart markup tags)

**Chart Markup Tags** (parsed by `charts.js:renderParagraphWithVisualizations`):
| Tag | Type | Format |
|-----|------|--------|
| `[BARGRAPH]` | Bar chart | Title line + `Label: Value` lines |
| `[LINEGRAPH]` | Line chart | Title line + `Label: Value` lines |
| `[PIEGRAPH]` | Pie chart | Title line + `Label: Value` lines |
| `[TABLE]` | HTML table | Title line + `Header1 \| Header2` rows |

## Consequences

### Positive
- Human-readable/writable — can edit in any text editor
- Version controllable — diffable JSON
- Extensible: new chart types = new tag + parser case
- Single source: same format for Create, Import, Samples
- Validation catches errors early (`validate.js`)

### Negative
- **Markup in string**: `paragraph` mixes plain text + structured data — parsing complexity
- **No schema enforcement** at rest — only runtime validation
- **Escape sequences**: `\\n` in JSON strings confusing for non-devs
- **Fragile parsing**: Line-based, whitespace-sensitive (`charts.js:312-410`)
- **No type safety** for chart data — runtime `parseFloat`

### Neutral
- Samples in `main.js:59-198` demonstrate all formats
- Import from GitHub uses same format

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Separate `chart` object** | Breaks existing format; PRD forbids structure change |
| **YAML** | Not native in browser; extra parser; JSON is universal |
| **Markdown** | Overkill; chart markup would need custom syntax anyway |
| **Database schema** | No backend; localStorage only |

## Evidence

- **PRD**: `prd.md:32` — "JSON Format: Do not alter the structure"
- **Validation**: `validate.js:3-57` — `validateJSONStructure()`
- **Parser**: `charts.js:312-410` — `renderParagraphWithVisualizations()`
- **Samples**: `main.js:59-198` — 7 sample JSONs covering all types
- **Create form**: `index.html:339-348` — textarea with example