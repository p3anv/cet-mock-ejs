---
title: ADR-008: Full Keyboard Shortcuts for Exam Interface
status: accepted
date: 2026-11-19
deciders: [@pranav]
---

## Context

Exam interface needs efficient keyboard-driven interaction for test-taking:
- Power users want speed (no mouse for every action)
- Accessibility: keyboard-only operation
- Standard shortcuts expected (arrows, numbers, Enter, Escape)

## Decision

Implement **comprehensive keyboard shortcuts** in `test.js:70-150`:

| Key | Action | Guard |
|-----|--------|-------|
| `→` / `l` / `j` | Next question | Not in input/textarea/select |
| `←` / `h` / `k` | Previous question | Not in input/textarea/select |
| `Home` | First question | — |
| `End` | Last question | — |
| `1`–`9` | Select option 1–9 | Matches option count |
| `m` / `M` | Toggle mark for review | — |
| `e` / `E` | Show explanation | — |
| `s` / `S` | Submit test | — |
| `t` / `T` | Toggle theme | — |
| `?` | Show shortcuts help | — |

**Guards**: Ignore if `ctrlKey`, `metaKey`, `altKey` held (except `Shift+?`); ignore if typing in input/textarea/select.

Help modal (`?`) shows all shortcuts in categorized layout.

## Consequences

### Positive
- Fast test-taking for power users
- Accessibility: full keyboard operability
- Discoverable via `?` key
- No conflicts with browser shortcuts (guards on modifiers)

### Negative
- **Maintenance surface**: 20+ key bindings in single switch
- **No customization**: Hardcoded; no user remapping
- **Vim vs. Emacs bias**: `h/j/k/l` + arrows covers both
- **Mobile**: No keyboard → shortcuts irrelevant (touch works)

### Neutral
- Shortcuts work in both themes
- `showExplanation` creates toast (not modal) for non-blocking

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Mouse-only** | Slow for 50+ question tests; poor accessibility |
| **Minimal shortcuts (arrows only)** | Power users expect number keys for options |
| **Mousetrap / hotkeys-js library** | Extra dependency; native `keydown` is 20 lines |
| **Command palette (Cmd+K)** | Overkill; exam context is narrow |

## Evidence

- **Code**: `test.js:70-150` — `setupKeyboardShortcuts()`, `keyHandler`, `showShortcutsHelp()`
- **HTML**: `test.html:21-27` — Shortcuts button (`@click="showShortcutsHelp"`)
- **Guards**: `test.js:71-75` — tagName check, modifier key check
- **Actions**: `test.js:81-146` — switch cases for each key