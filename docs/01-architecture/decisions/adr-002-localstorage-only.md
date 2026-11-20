---
title: ADR-002: Zero Backend — localStorage for All Persistence
status: accepted
date: 2026-11-19
deciders: [@pranav]
---

## Context

The PRD explicitly requires:
- "No Backend: All data must remain in `localStorage`"
- "Data Integrity: The `localStorage` keys MUST remain exactly: `cet_mock_tests_v3`, `cet_test_attempts`, `cetprep-theme`"
- Offline capability after first load
- Zero operational cost
- No user accounts / auth friction

## Decision

Use **browser `localStorage` exclusively** for all persistent data:

| Key | Purpose | Structure |
|-----|---------|-----------|
| `cet_mock_tests_v3` | Test definitions | `Test[]` |
| `cet_test_attempts` | Attempt records | `Attempt[]` |
| `cetprep-theme` | Theme preference | `'dark' \| 'light'` |

All access centralized in `src/js/storage.js` — no direct `localStorage` calls elsewhere.

## Consequences

### Positive
- Zero backend infrastructure (no servers, databases, auth, hosting costs)
- Works fully offline after initial load
- Instant reads/writes (synchronous API)
- Simple mental model — single source of truth per browser
- Easy to debug: `localStorage.getItem('cet_mock_tests_v3')` in DevTools

### Negative
- **5-10 MB quota** — limits test/attempt count (~500-1000 tests)
- **No cross-device sync** — data trapped in browser
- **No concurrent write safety** — last write wins (rare for single-user)
- **No query/index** — full array parse on every read
- **Silent failure on quota** — `QuotaExceededError` caught but not surfaced
- **No migration tooling** — version encoded in key suffix (`_v3`)

### Neutral
- `JSON.parse/stringify` on every access (acceptable for <1000 items)
- Cascade delete: deleting test removes its attempts (`storage.js:23-27`)

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **IndexedDB** | Overkill; async API; no PRD requirement for large data |
| **Firebase / Supabase** | Backend = cost, auth, network dependency; violates PRD |
| **localForage / Dexie** | Extra dependency; `localStorage` API sufficient |
| **Server + SQLite** | Violates "No Backend" constraint |

## Evidence

- **PRD**: `prd.md:29-32` — explicit constraints
- **Code**: `storage.js` — all 11 exports wrap `localStorage`
- **Keys**: `storage.js:1-3` — `STORAGE_KEY`, `ATTEMPTS_KEY`, `THEME_KEY` constants
- **Error handling**: `storage.js:5-10` — `try/catch` on parse
- **Cascade delete**: `storage.js:23-27` — test deletion removes attempts