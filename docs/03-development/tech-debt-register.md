---
title: CETPrep — Technical Debt Register (As-Built)
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [engineers, maintainers, leads, architects]
source_of_truth: true
---

# CETPrep — Technical Debt Register

> Catalog of known technical debt, categorized by severity and impact. Each entry includes evidence, risk, and remediation sketch.

---

## Severity Definitions

| Severity | Definition | SLA |
|----------|------------|-----|
| **Critical** | Data loss, security vulnerability, complete feature break | Fix immediately |
| **High** | Major UX regression, silent failure, scaling blocker | Fix within 1 sprint |
| **Medium** | Maintainability burden, known bug with workaround | Fix within 3 sprints |
| **Low** | Code smell, missing nicety, future-proofing | Fix when convenient |

---

## Register

### TD-001: No Automated Test Suite
| Attribute | Detail |
|-----------|--------|
| **Severity** | **Critical** |
| **Category** | Quality / Risk |
| **Evidence** | `package.json` has no `test` script; no Jest/Vitest/Playwright/Cypress; `phases.md` Phase 5 unchecked |
| **Impact** | Every change risks regression; no CI gate; manual testing only (~30 min/release) |
| **Root Cause** | Not prioritized during initial build (Phases 1-4) |
| **Remediation** | 1. Add Vitest + JSDOM for unit/integration<br>2. Add Playwright for E2E<br>3. Add GitHub Actions CI<br>4. Target 70% coverage on `storage.js`, `validate.js`, `charts.js`, `csv.js` |
| **Effort** | ~2 weeks (setup + core coverage) |
| **Related** | [Testing Strategy](testing.md), [ADR-003 (proposed)](01-architecture/decisions/adr-003-no-test-framework.md) |

---

### TD-002: Silent localStorage Quota Failure
| Attribute | Detail |
|-----------|--------|
| **Severity** | **Critical** |
| **Category** | Data Integrity |
| **Evidence** | `storage.js:8-10, 20-22, 32-34` — `catch (e) { if (e.name === 'QuotaExceededError') return; }` |
| **Impact** | User creates test/attempt → appears to succeed → data lost on reload; no user notification |
| **Root Cause** | Simplicity; no error UI pattern for storage failures |
| **Remediation** | 1. Detect quota before write (estimate JSON size)<br>2. Show toast error on quota exceeded<br>3. Offer "Clear old attempts" action<br>4. Consider IndexedDB for larger storage |
| **Effort** | ~3 days |
| **Related** | [Storage Module](codebase-tour.md#storagejs), [Data Model](01-architecture/data-model.md) |

---

### TD-003: GitHub API Rate Limit (60/hr Unauthenticated)
| Attribute | Detail |
|-----------|--------|
| **Severity** | **High** |
| **Category** | Reliability / External Dependency |
| **Evidence** | `main.js:430-498` — `fetch` to `api.github.com` with no auth, no retry, no backoff |
| **Impact** | Import feature completely broken after 60 requests/hour; user sees generic toast error |
| **Root Cause** | No GitHub token configured; unauthenticated limit is 60/hr |
| **Remediation** | 1. Add `GITHUB_TOKEN` env var support (Vite `import.meta.env`)<br>2. Add `Authorization: Bearer` header when token present<br>3. Implement exponential backoff on 429<br>4. Show rate limit remaining in UI |
| **Effort** | ~2 days |
| **Related** | [Import Flow](codebase-tour.md#mainjs), [Events & Webhooks](02-api/events-and-webhooks.md#github-api-async-flow) |

---

### TD-004: No Cross-Tab Theme Sync
| Attribute | Detail |
|-----------|--------|
| **Severity** | **Medium** |
| **Category** | UX / Consistency |
| **Evidence** | Missing `window.addEventListener('storage', ...)` for `cetprep-theme` key |
| **Impact** | User toggles theme in Tab A → Tab B stays old theme until refresh |
| **Root Cause** | Not implemented; low priority |
| **Remediation** | Add `storage` event listener in `main.js:init()` and `test.js:init()` to sync `theme` state |
| **Effort** | ~2 hours |
| **Related** | [Events & Webhooks](02-api/events-and-webhooks.md#storage-cross-tab-sync-not-implemented) |

---

### TD-005: XSS Surface via `x-html` / `innerHTML`
| Attribute | Detail |
|-----------|--------|
| **Severity** | **Medium** |
| **Category** | Security |
| **Evidence** | `main.js:304` (themeIcon), `charts.js:306` (table replace), `test.js:410` (results modal HTML) |
| **Impact** | If any data source becomes user-controlled (imported test paragraph, GitHub data), XSS possible |
| **Root Cause** | Convenience for dynamic SVG/HTML; all current sources trusted |
| **Remediation** | 1. Audit all `x-html` / `innerHTML` uses<br>2. Replace themeIcon with Alpine `<template>` + `x-show`<br>3. Sanitize GitHub import data (DOMPurify)<br>4. Add CSP header (`meta http-equiv`) |
| **Effort** | ~3 days |
| **Related** | [Security Conventions](conventions.md#security-conventions), [Threat Model](05-security/threat-model.md) |

---

### TD-006: Timer Drifts in Background Tabs
| Attribute | Detail |
|-----------|--------|
| **Severity** | **Medium** |
| **Category** | Correctness |
| **Evidence** | `test.js:224-231` — `setInterval` 1000ms; browsers throttle to 1000ms+ in background |
| **Impact** | User switches tabs → timer slows → elapsed time inaccurate |
| **Root Cause** | Browser timer throttling; no `visibilitychange` handling |
| **Remediation** | 1. Use `performance.now()` + `visibilitychange` to track actual elapsed<br>2. Or: store `startTime` + compute on demand<br>3. Persist to `sessionStorage` for refresh recovery |
| **Effort** | ~2 days |
| **Related** | [Exam App](codebase-tour.md#testjs), [Timer Contract](02-api/events-and-webhooks.md#timer-contract) |

---

### TD-007: No Request Timeout on GitHub Fetch
| Attribute | Detail |
|-----------|--------|
| **Severity** | **Medium** |
| **Category** | Reliability |
| **Evidence** | `main.js:430-498, 580-622, 624-696` — `fetch` with no `AbortController` / timeout |
| **Impact** | Slow/hanging network → UI frozen indefinitely; no user feedback |
| **Root Cause** | Simplicity; fetch default timeout ~300s |
| **Remediation** | Add `AbortController` with 10-15s timeout; show toast on timeout |
| **Effort** | ~1 day |
| **Related** | [GitHub API Flow](02-api/events-and-webhooks.md#github-api-async-flow) |

---

### TD-008: Sequential Bulk Import (Slow UX)
| Attribute | Detail |
|-----------|--------|
| **Severity** | **Low** |
| **Category** | Performance / UX |
| **Evidence** | `main.js:654-674` — `for (const id of selected) { await importTest(id); }` |
| **Impact** | 10 tests = 10 sequential requests = ~10-30s; user waits with progress spinner |
| **Root Cause** | Intentional to avoid rate limit burst |
| **Remediation** | 1. Add token auth (TD-003) → higher rate limit<br>2. Batch with `Promise.all` + concurrency limit (p-limit)<br>3. Show per-test progress |
| **Effort** | ~2 days (depends on TD-003) |
| **Related** | [Bulk Import](codebase-tour.md#mainjs) |

---

### TD-009: Chart.js Memory Leak Risk
| Attribute | Detail |
|-----------|--------|
| **Severity** | **Medium** |
| **Category** | Resource Management |
| **Evidence** | `charts.js:65-73` — `chartInstances` Map; `destroyChart` must be called before re-render |
| **Impact** | Navigating questions rapidly → old charts not destroyed → memory grows |
| **Root Cause** | Manual cleanup required; async rendering race conditions |
| **Remediation** | 1. Wrap render in `try/finally` with destroy<br>2. Use `AbortController` pattern for render cancellation<br>3. Add periodic cleanup on `beforeunload` |
| **Effort** | ~2 days |
| **Related** | [Charts Module](codebase-tour.md#chartsjs), [Chart Rendering](02-api/events-and-webhooks.md#chart-rendering-async-contract) |

---

### TD-010: No Schema Versioning / Migration
| Attribute | Detail |
|-----------|--------|
| **Severity** | **Medium** |
| **Category** | Data Integrity / Maintainability |
| **Evidence** | `storage.js:1` — `STORAGE_KEY = 'cet_mock_tests_v3'`; no migration code |
| **Impact** | Format changes require new key → all user data orphaned; no upgrade path |
| **Root Cause** | `_v3` suffix suggests prior migrations were manual key changes |
| **Remediation** | 1. Add `formatVersion` field to Test/Attempt objects<br>2. Write `migrate()` function in `storage.js`<br>3. Auto-migrate on load<br>4. Document in [Breaking Changes](02-api/breaking-changes.md) |
| **Effort** | ~3 days |
| **Related** | [Breaking Changes](02-api/breaking-changes.md#1-localstorage-key-migration), [Data Model](01-architecture/data-model.md) |

---

### TD-011: No CSP Header
| Attribute | Detail |
|-----------|--------|
| **Severity** | **Low** |
| **Category** | Security |
| **Evidence** | No `Content-Security-Policy` meta tag in `index.html` or `test.html` |
| **Impact** | Reduced defense-in-depth against XSS |
| **Root Cause** | Not implemented |
| **Remediation** | Add `<meta http-equiv="Content-Security-Policy" content="...">` allowing `unsafe-inline` for Alpine styles, `self` for scripts/styles, `githubusercontent.com` for images |
| **Effort** | ~4 hours |
| **Related** | [Security Conventions](conventions.md#security-conventions) |

---

### TD-012: Chart Parser State Machine Fragile
| Attribute | Detail |
|-----------|--------|
| **Severity** | **Medium** |
| **Category** | Maintainability |
| **Evidence** | `charts.js:322-353` — nested `if/else` state machine for `[TAG]` parsing |
| **Impact** | Adding new chart type = high risk of parser bugs; hard to test |
| **Root Cause** | Iterative feature addition without refactor |
| **Remediation** | 1. Extract parser to separate class/function<br>2. Use regex-based line classification<br>3. Add unit tests for each tag type<br>4. Consider markdown-style ` ```chart ` fences |
| **Effort** | ~3 days |
| **Related** | [Charts Module](codebase-tour.md#chartsjs), [Validate.js](codebase-tour.md#validatejs) |

---

### TD-013: No Dependency Update Automation
| Attribute | Detail |
|-----------|--------|
| **Severity** | **Low** |
| **Category** | Maintenance |
| **Evidence** | No Dependabot, no Renovate, no scheduled `npm audit` |
| **Impact** | Security patches missed; breaking updates surprise |
| **Root Cause** | Not configured |
| **Remediation** | Enable Dependabot in GitHub; add `npm audit` to CI |
| **Effort** | ~1 hour |
| **Related** | [Workflow](workflow.md#dependency-management) |

---

### TD-014: CSS Frozen — No Visual Changes Possible
| Attribute | Detail |
|-----------|--------|
| **Severity** | **Low** (by design) |
| **Category** | Process / Constraint |
| **Evidence** | `rules.md`, `prd.md`, commits `62cc25c`, `499f27d` — only `[x-cloak]` change allowed |
| **Impact** | Any visual improvement requires process exception; tech debt in CSS cannot be fixed |
| **Root Cause** | PRD requirement: "CSS is Law" — visual parity with design mandatory |
| **Remediation** | Document exception process; consider design system tokens for controlled changes |
| **Effort** | Process only |
| **Related** | [Conventions](conventions.md#frozen-rule), [Architecture](01-architecture/architecture.md) |

---

### TD-015: Single-Point-of-Failure: GitHub Raw Hosting
| Attribute | Detail |
|-----------|--------|
| **Severity** | **Medium** |
| **Category** | Reliability / Vendor Lock-in |
| **Evidence** | `main.js:6-14` — `GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/p3anv/mock-app-data/main'` |
| **Impact** | If repo deleted/moved/private → import feature permanently broken |
| **Root Cause** | Simple free hosting choice |
| **Remediation** | 1. Mirror test data to own CDN / static host<br>2. Add fallback URL config<br>3. Bundle sample tests in app (already 7 in `main.js`) |
| **Effort** | ~2 days |
| **Related** | [Import System](codebase-tour.md#mainjs), [Architecture](01-architecture/architecture.md#external-dependencies) |

---

### TD-016: No Error Boundary / Global Error Handling
| Attribute | Detail |
|-----------|--------|
| **Severity** | **Low** |
| **Category** | Observability |
| **Evidence** | No `window.onerror`, no `unhandledrejection` handler; errors → console only |
| **Impact** | Production errors invisible; no alerting |
| **Root Cause** | No observability infrastructure |
| **Remediation** | Add global error handler → toast + log to console + (future) send to error service |
| **Effort** | ~4 hours |
| **Related** | [Observability](04-operations/observability.md) |

---

### TD-017: Attempt Data Denormalized (testName, testCategory)
| Attribute | Detail |
|-----------|--------|
| **Severity** | **Low** |
| **Category** | Data Integrity |
| **Evidence** | `Attempt` interface includes `testName`, `testCategory` (copied at submit time) |
| **Impact** | If test renamed/deleted, attempt shows stale name/category |
| **Root Cause** | Simplicity; avoids join at render time |
| **Remediation** | Acceptable trade-off; document. Or: remove denormalized fields, join at render. |
| **Effort** | ~1 day |
| **Related** | [Data Model](01-architecture/data-model.md#attempt) |

---

### TD-018: No Accessibility Audit
| Attribute | Detail |
|-----------|--------|
| **Severity** | **Medium** |
| **Category** | Compliance / UX |
| **Evidence** | No ARIA labels on navigator buttons, chart canvas, modals; keyboard shortcuts but no focus management |
| **Impact** | Screen reader users cannot use exam; keyboard-only navigation incomplete |
| **Root Cause** | Not prioritized |
| **Remediation** | 1. Run axe-core audit<br>2. Add ARIA labels to navigator, charts, modals<br>3. Ensure focus trap in modals<br>4. Add skip links |
| **Effort** | ~1 week |
| **Related** | [Compliance Mapping](05-security/compliance-mapping.md) |

---

### TD-019: No CI/CD Pipeline
| Attribute | Detail |
|-----------|--------|
| **Severity** | **High** |
| **Category** | Process / Risk |
| **Evidence** | No GitHub Actions, no automated build/test/deploy; `workflow.md` documents manual process |
| **Impact** | Broken code reaches production; no preview deployments; manual deploy |
| **Root Cause** | Not set up |
| **Remediation** | 1. Add GitHub Actions: build + test (when tests exist)<br>2. Add preview deploy (Netlify/Vercel)<br>3. Add production deploy on main<br>4. Require status checks on PR |
| **Effort** | ~2 days |
| **Related** | [Workflow](workflow.md), [Testing](testing.md) |

---

### TD-020: Chart Color Derivation from CSS (Fragile)
| Attribute | Detail |
|-----------|--------|
| **Severity** | **Low** |
| **Category** | Maintainability |
| **Evidence** | `charts.js:19-38` — `getComputedStyle(document.documentElement).getPropertyValue('--accent')` |
| **Impact** | If CSS loads after charts.js runs → colors wrong; SSR would break |
| **Root Cause** | Design requirement: charts match CSS theme exactly |
| **Remediation** | 1. Pass colors as params (decouple from CSS)<br>2. Or: ensure CSS loads first (current: works in browser) |
| **Effort** | ~1 day |
| **Related** | [Charts Module](codebase-tour.md#chartsjs), [CSS Conventions](conventions.md#design-system) |

---

## Debt by Category

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Quality/Risk | 1 (TD-001) | 1 (TD-019) | 0 | 1 (TD-013) | 3 |
| Data Integrity | 1 (TD-002) | 0 | 1 (TD-010) | 1 (TD-017) | 3 |
| Reliability | 0 | 1 (TD-003) | 2 (TD-006, TD-007) | 1 (TD-015) | 4 |
| Security | 0 | 0 | 1 (TD-005) | 1 (TD-011) | 2 |
| UX/Compliance | 0 | 0 | 2 (TD-004, TD-018) | 0 | 2 |
| Maintainability | 0 | 0 | 2 (TD-009, TD-012) | 2 (TD-014, TD-020) | 4 |
| Performance | 0 | 0 | 0 | 1 (TD-008) | 1 |
| Observability | 0 | 0 | 0 | 1 (TD-016) | 1 |
| **Total** | **2** | **2** | **8** | **8** | **20** |

---

## Remediation Priority Order

1. **TD-001** (No tests) — Blocks all other safe refactoring
2. **TD-002** (Silent quota failure) — Active data loss risk
3. **TD-003** (GitHub rate limit) — Breaks import feature regularly
4. **TD-019** (No CI/CD) — Process risk, enables safe delivery
5. **TD-005** (XSS surface) — Security hygiene
6. **TD-009** (Chart memory leak) — Stability
7. **TD-010** (No migration) — Future-proofing
8. **TD-006** (Timer drift) — Correctness
9. **TD-007** (No timeout) — Reliability
10. **TD-012** (Parser fragile) — Maintainability
11. **TD-018** (Accessibility) — Compliance
12. **TD-004** (Cross-tab sync) — UX polish
13. **TD-015** (GitHub Raw SPOF) — Vendor risk
14. **TD-008** (Sequential import) — UX perf
15. **TD-016** (Error boundary) — Observability
16. **TD-020** (Color derivation) — Maintainability
17. **TD-011** (CSP) — Security depth
18. **TD-013** (Dependabot) — Maintenance
19. **TD-017** (Denormalized) — Data hygiene
20. **TD-014** (CSS frozen) — By design

---

## Related Documents

- [Codebase Tour](codebase-tour.md) — Sharp edges (source of many entries)
- [Testing](testing.md) — TD-001 detail
- [Breaking Changes](02-api/breaking-changes.md) — TD-010 context
- [Security](05-security/threat-model.md) — TD-005, TD-011 context
- [Workflow](workflow.md) — TD-013, TD-019 context
- [Architecture](01-architecture/architecture.md) — TD-015 context