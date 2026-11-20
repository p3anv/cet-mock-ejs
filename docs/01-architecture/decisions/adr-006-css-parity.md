---
title: ADR-006: CSS Frozen — No Class/Layout Changes
status: accepted
date: 2026-11-19
deciders: [@pranav]
---

## Context

The PRD contains a **STRICT UI/UX CONSTRAINT (CRITICAL)**:

> "The current CSS UI/UX must remain 100% intact.
> - Do NOT redesign, restyle, or alter the layout.
> - Do NOT change HTML class names. Every `div`, `button`, and `input` must retain its exact current class names (e.g., `.test-card-item`, `.nav-btn`, `.option-item`, `.btn-primary`).
> - The visual output must be pixel-perfect to the current application.
> - The only acceptable CSS addition is `[x-cloak] { display: none !important; }` to prevent Alpine.js template flashing on load."

This constraint exists because:
- Visual regression testing is manual
- Stakeholders approved the exact current design
- Any CSS change risks subtle layout shifts

## Decision

**Treat CSS as immutable contract**:

1. **Move, don't modify**: Copy `index.css` → `src/css/index.css`, `test.css` → `src/css/test.css` verbatim
2. **Only addition**: Prepend `[x-cloak] { display: none !important; }` to both files
3. **HTML class names frozen**: Alpine templates must use exact same classes
4. **No new utility classes**: All styling via existing classes
5. **Responsive breakpoints frozen**: Media queries in CSS are law

## Consequences

### Positive
- Zero visual regression risk
- Stakeholder confidence — "looks exactly the same"
- Alpine migration focuses on logic, not styling
- CSS becomes a stable contract for JS module boundaries

### Negative
- **Technical debt locked in**: Any CSS improvement requires exception process
- **Class name coupling**: JS modules must know exact CSS class strings
- **No design system evolution**: Can't adopt new patterns (container queries, cascade layers, etc.)
- **Dead CSS persists**: Unused classes never removed

### Neutral
- `[x-cloak]` addition is standard Alpine practice
- Vite handles CSS as asset (no PostCSS, no Tailwind)

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Rewrite in Tailwind** | PRD explicitly forbids; "No Tailwind" |
| **CSS-in-JS (styled-components)** | Adds runtime; violates "standard CSS" in PRD |
| **Refactor CSS during migration** | PRD: "Do NOT redesign, restyle, or alter the layout" |
| **Extract CSS variables only** | Still changes class structure; PRD forbids |

## Evidence

- **PRD**: `prd.md:13-18` — STRICT UI/UX CONSTRAINT section
- **Rules**: `rules.md:3-7` — "The CSS is Law", "No Class Renaming", "No Layout Changes"
- **CSS files**: `src/css/index.css:1`, `src/css/test.css:1` — only `[x-cloak]` added
- **HTML**: `index.html`, `test.html` — all class names match original
- **Phases**: `phases.md:10-11` — "Move CSS files. Do not change any lines of code inside these CSS files."