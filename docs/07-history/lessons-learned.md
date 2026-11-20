---
title: CETPrep — Lessons Learned (Retrospective)
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [engineers, maintainers, leads]
source_of_truth: true
---

# CETPrep — Lessons Learned

> Retrospective on what worked, what didn't, and what the next team should do differently.

---

## What Worked Well

### 1. Local-First Architecture
**Decision**: No backend, all data in localStorage.
**Outcome**: ✅ Zero infrastructure cost, zero auth complexity, instant loads, total user privacy.
**Why it worked**: Scope matched tool purpose (personal study aid). No scale requirements.

### 2. Vite + Alpine.js + ES Modules
**Decision**: Lightweight stack over React/Vue/Next.
**Outcome**: ✅ 500ms dev startup, ~300KB gzipped bundle, no build step friction, easy debugging.
**Why it worked**: Requirements were simple reactive UI + Chart.js canvas — Alpine's `x-data`/`x-for`/`@click` mapped 1:1 to mental model.

### 3. Chart.js via CSS Variables
**Decision**: Derive chart colors from `--accent`, `--success` CSS variables at render time.
**Outcome**: ✅ Charts perfectly match theme (dark/light) without duplicate color config.
**Why it worked**: `getComputedStyle` reads live CSS; single source of truth for design system.

### 4. Paragraph Markup for Charts
**Decision**: Embed `[BARGRAPH]`, `[LINEGRAPH]`, `[PIEGRAPH]`, `[TABLE]` in question `paragraph` field.
**Outcome**: ✅ Rich visualizations inline with questions; single JSON field; no separate chart config.
**Why it worked**: Parser is self-contained; markdown-like syntax familiar; extensible.

### 5. Phased Implementation (phases.md)
**Decision**: 5-phase plan with checkboxes.
**Outcome**: ✅ Phases 1-4 completed systematically; clear progress tracking.
**Why it worked**: Each phase had concrete deliverables; no scope creep within phases.

### 6. Frozen CSS (PRD + rules.md)
**Decision**: "CSS is Law" — only `[x-cloak]` change allowed.
**Outcome**: ✅ Visual consistency guaranteed; no design drift; fast UI decisions.
**Why it worked**: Removed subjective debates; forced creativity within constraints.

---

## What Didn't Work / Pain Points

### 1. No Automated Tests (Critical)
**Issue**: Zero test suite. All verification manual (~30 min/release).
**Impact**: Every refactor risky; GitHub rate limit bug (TD-003) shipped; quota bug (TD-002) shipped.
**Root Cause**: Not in phases.md; "Phase 5: Visual Audit" only manual.
**Fix**: Add Vitest + Playwright immediately (TD-001).

### 2. Silent localStorage Quota Failure (Critical)
**Issue**: `QuotaExceededError` caught → no-op → user thinks save worked.
**Impact**: Data loss unnoticed until reload.
**Root Cause**: Error handling added for parse errors, not quota.
**Fix**: Quota check before write + toast (TD-002).

### 3. GitHub Rate Limit Unhandled (High)
**Issue**: 60/hr unauthenticated → import breaks daily for active users.
**Impact**: Feature unreliable; no retry/backoff; no token support.
**Root Cause**: "Good enough for demo" → shipped to prod.
**Fix**: `VITE_GITHUB_TOKEN` + backoff (TD-003).

### 4. No CI/CD Pipeline (High)
**Issue**: Manual `npm run build` → upload `dist/`. No gates.
**Impact**: Broken code reaches prod; no preview deployments.
**Root Cause**: Single maintainer, "fast enough".
**Fix**: GitHub Actions (TD-019).

### 5. Chart Rendering Timing Fragility
**Issue**: Triple async (`$watch` → `$nextTick` → `setTimeout(0)` + retry loop) for Chart.js canvas.
**Impact**: Occasional blank charts on first load; hard to debug.
**Root Cause**: Chart.js needs canvas in DOM + measured; Alpine reactivity + Vite HMR timing.
**Fix**: More robust mount detection; consider `IntersectionObserver`.

### 6. Parser State Machine Complexity
**Issue**: `charts.js:322-353` nested if/else for `[TAG]` parsing.
**Impact**: Adding new chart type = high bug risk; hard to unit test.
**Root Cause**: Iterative feature adds without refactor.
**Fix**: Extract parser class; regex-based; add tests (TD-012).

### 7. No Cross-Tab Theme Sync
**Issue**: Theme change in Tab A doesn't update Tab B.
**Impact**: Minor UX annoyance.
**Root Cause**: `storage` event listener never added.
**Fix**: 2-line addition (TD-004).

### 8. Timer Drift in Background Tabs
**Issue**: `setInterval` throttled → exam time inaccurate.
**Impact**: User sees wrong elapsed time if they switch tabs.
**Root Cause**: Browser behavior; not handled.
**Fix**: `performance.now()` + `visibilitychange` (TD-006).

---

## What Next Team Should Do Differently

### 1. Start with Tests (Not After)
```
Priority 1: Vitest unit tests for storage.js, validate.js, charts.js, csv.js
Priority 2: Playwright E2E for critical flows (create → attempt → submit)
Priority 3: CI gate on test pass
```
**Don't ship without test infrastructure.**

### 2. Treat External APIs as Unreliable
```
- Always add timeout (AbortController)
- Always add retry with backoff
- Always add auth token support (env var)
- Always cache responses locally
- Show rate limit status in UI
```
**GitHub API is not "free unlimited" — it's 60/hr.**

### 3. Design for Data Growth from Day 1
```
- Add localStorage quota monitoring
- Implement migration strategy (formatVersion field)
- Plan for IndexedDB if >5MB needed
- Add "Export All / Import All" UI
```
**5MB fills fast with attempts + charts.**

### 4. Accessibility Is Not Optional
```
- Add ARIA labels during component creation
- Test with screen reader (NVDA/VoiceOver)
- Verify keyboard focus management
- Run axe-core in CI
```
**Retrofitting a11y is 10x harder.**

### 5. Observability from Start
```
- Global error boundary → Sentry (free)
- Custom events → localStorage buffer → flush
- Web Vitals → console / endpoint
- Health check endpoint
```
**You can't fix what you can't see.**

### 6. Document Decisions as ADRs Immediately
```
- ADR-001: Alpine.js (done retroactively)
- ADR-002: localStorage only (done retroactively)
- ADR-003: No test framework (should exist)
- ADR-004: GitHub import (should exist)
```
**Git history ≠ architectural decision record.**

### 7. Plan for Handover from Day 1
```
- Write setup.md as you go
- Document sharp edges in code comments
- Keep tribal-knowledge.md updated
- Runbook for every external dependency
```
**Bus factor = 1 until documented.**

---

## Technical Decisions to Revisit

| Decision | Current | Revisit When |
|----------|---------|--------------|
| No backend | ✅ Good for now | Multi-device sync needed |
| Alpine.js | ✅ Good for now | Team prefers React/Vue |
| localStorage only | ⚠️ Quota risk | >200 tests/user |
| GitHub for test data | ⚠️ SPOF | Own CDN / bundle |
| Hash routing | ✅ Simple | Need deep linking / SEO |
| Frozen CSS | ✅ Consistent | Design refresh needed |

---

## Metrics We Wish We Had

| Metric | Why | How to Add |
|--------|-----|------------|
| Tests created per user | Adoption | `trackEvent('test_created')` |
| Attempts per test | Engagement | `trackEvent('test_submitted')` |
| Import success rate | Reliability | `trackEvent('import_success/fail')` |
| Chart render failures | Quality | `charts.js` error wrapper |
| localStorage quota hits | Data loss | `storage.js` quota check |
| JS error rate | Stability | Global error boundary |
| Page load (LCP) | Performance | `web-vitals` lib |

---

## Summary

**CETPrep succeeded as a focused, local-first tool** — the architecture matches the problem perfectly. The stack (Vite/Alpine/Chart.js) is appropriate and maintainable.

**The gaps are operational, not architectural**: no tests, no CI/CD, no monitoring, no error handling for external deps. These are fixable incrementally without rewriting.

**Next maintainer's first week should be**: Tests → CI → Monitoring → Quota fix → Rate limit fix. Everything else is polish.

---

## Related Documents

- [Tech Debt Register](03-development/tech-debt-register.md) — Prioritized fixes
- [Tribal Knowledge](tribal-knowledge.md) — Unwritten rules
- [Timeline](timeline.md) — What happened when
- [Changelog](changelog.md) — What changed