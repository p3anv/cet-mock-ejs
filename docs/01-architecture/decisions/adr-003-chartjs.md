---
title: ADR-003: Chart.js for Visualizations (Replace Manual Canvas)
status: accepted
date: 2026-11-19
deciders: [@pranav]
---

## Context

The original implementation had manual `<canvas>` drawing functions (`renderBarGraph`, `renderLineGraph`, etc.) written in vanilla Canvas API. Problems:

- **Brittle**: Custom drawing code for axes, labels, tooltips, animations
- **Inconsistent**: Each chart type had different visual style
- **No accessibility**: No keyboard nav, screen reader support
- **Maintenance burden**: Bug fixes duplicated across chart types
- **No responsive resizing**: Fixed dimensions

PRD Phase 2 explicitly required: "Replace manual `<canvas>` drawing functions with Chart.js instances. Ensure Chart.js uses the exact colors from the CSS variables."

## Decision

Adopt **Chart.js 4.x** for all chart types:

- **Bar charts**: `type: 'bar'` — vertical bars with rounded corners
- **Line charts**: `type: 'line'` — tension 0.3, area fill, point markers
- **Pie charts**: `type: 'pie'` — legend at bottom, pointStyle circles
- **Tables**: Custom HTML table renderer (Chart.js doesn't do tables)

All charts use **CSS variable colors** via `getChartColors()` in `charts.js:24-38`:
- Dark mode: `--color-accent` (#b8965c), `--color-success` (#4cc38a), etc.
- Light mode: `--color-accent` (#9a7d3a), `--color-success` (#16a34a), etc.

Chart instances tracked in `Map` for cleanup (`destroyChart`).

## Consequences

### Positive
- Consistent, professional visuals across chart types
- Built-in tooltips, animations, responsive resize (`maintainAspectRatio: false`)
- Accessibility: Chart.js has keyboard navigation, ARIA labels
- Theme-aware colors via CSS variables (auto-switch on theme toggle)
- Reduced code: ~400 lines `charts.js` vs. previous manual implementations
- Active maintenance (Chart.js 4.x current)

### Negative
- **Bundle size**: Chart.js ~60 KB gzipped (vs. ~10 KB manual)
- **Learning curve**: Chart.js config object complexity
- **Canvas-only**: No SVG option (Chart.js 4.x is canvas-only)
- **Timing complexity**: Must wait for canvas in DOM → `setTimeout(0)`, `$nextTick`, retry loop

### Neutral
- Tables remain custom HTML (not Chart.js)
- Chart colors derived from CSS — single source of truth

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **D3.js** | Steep learning curve; overkill for standard charts; larger bundle |
| **ApexCharts** | Similar size; Chart.js more popular/maintained |
| **uPlot** | Smaller but less features; no built-in pie; team unfamiliar |
| **Keep manual canvas** | PRD explicitly required replacement; maintenance burden |
| **SVG-based (Chartist, etc.)** | Chart.js canvas performance better for animations |

## Evidence

- **Phases**: `phases.md:17` — "Replace manual `<canvas>` drawing functions with Chart.js instances"
- **Code**: `charts.js` — all 5 render functions use `new Chart(canvas, {...})`
- **Colors**: `charts.js:3-38` — `CHART_COLORS`, `CHART_COLORS_LIGHT`, `getChartColors()`
- **Cleanup**: `charts.js:65-73` — `destroyChart` + `chartInstances` Map
- **Sizing**: `test.css:737-784` — CSS `data-count` scaling for bar/line/pie
- **Import**: `charts.js:1` — `import Chart from 'chart.js/auto'`