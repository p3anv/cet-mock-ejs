---
title: CETPrep — Known Limitations (As-Built)
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [engineers, maintainers, users, integrators, auditors]
source_of_truth: true
---

# CETPrep — Known Limitations

> Documented technical constraints, scaling ceilings, and out-of-scope behaviors. Not bugs — design boundaries.

---

## Data Limits (Browser Enforced)

| Limit | Value | Source | Impact |
|-------|-------|--------|--------|
| **localStorage Quota** | ~5-10 MB per origin | Browser | Tests + attempts + theme must fit; silent fail on exceed (TD-002) |
| **Max Tests** | ~200 (at 50KB each) | Derived | Practical limit before quota |
| **Max Attempts** | ~500 (at 10KB each) | Derived | History grows unbounded |
| **Max Questions/Test** | ~200 | Chart.js DOM + memory | Rendering slows, navigator crowded |
| **Question Text Length** | No hard limit | — | Very long questions break layout |

---

## Functional Limitations

### No Cross-Device Sync
- Data trapped in browser profile
- No account system, no cloud backup
- Workaround: Manual JSON export/import via DevTools

### No Concurrent Editing
- Single user per browser
- No conflict resolution
- Two tabs editing same test → last write wins

### Import Rate Limited
- GitHub API: 60 requests/hour (unauthenticated)
- Blocks bulk import after ~60 tests
- Fix: `VITE_GITHUB_TOKEN` for 5000/hr (TD-003)

### Timer Inaccuracy in Background
- `setInterval` throttled by browser
- Background tab → timer runs slow
- No `visibilitychange` compensation (TD-006)

### No Server-Side Validation
- All validation client-side (`validate.js`)
- User can bypass via DevTools
- By design (local-first)

### No Real-Time Collaboration
- No multi-user, no shared tests
- No live exam proctoring

---

## Chart Rendering Limits

| Chart Type | Max Data Points | Performance |
|------------|-----------------|-------------|
| Bar | 12 (CSS sized) | Good |
| Line | 12 (CSS sized) | Good |
| Pie | 6 (palette size) | Good |
| Table | 50 rows | DOM heavy > 50 |

**Parser**: Single-pass line parser — malformed markup → silent skip (no error).

---

## Browser Compatibility

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | 90+ | ✅ | Primary target |
| Firefox | 88+ | ✅ | Full support |
| Safari | 15+ | ✅ | `crypto.randomUUID` needs 15+ |
| Edge | 90+ | ✅ | Chromium-based |
| Mobile Chrome | 90+ | ⚠️ | Touch targets small |
| Mobile Safari | 15+ | ⚠️ | Touch targets small |
| IE11 | — | ❌ | No ES modules, no `crypto.randomUUID` |

**Polyfills**: None. Requires modern browser (ES2022 modules, `crypto.randomUUID`, `fetch`, `localStorage`).

---

## Accessibility Gaps (WCAG 2.1 AA)

| Gap | Criterion | Impact |
|-----|-----------|--------|
| No `lang` attribute on `<html>` | 3.1.1 | Screen readers default language |
| Navigator buttons lack ARIA labels | 4.1.2 | Screen reader can't identify |
| Charts (canvas) no text fallback | 1.1.1 | Blind users can't access data |
| Focus indicators weak/removed | 2.4.7 | Keyboard users lose focus |
| Modals no focus trap | 2.1.2 | Tab escapes modal |
| Color contrast unverified | 1.4.3 | May fail AA |
| No skip links | 2.4.1 | Keyboard users tab through all |

---

## Security Limitations

| Limitation | Risk | Mitigation |
|------------|------|------------|
| No CSP header | XSS impact higher | TD-011 |
| No `referrerPolicy` on fetch | Referer leaks to GitHub | Easy fix |
| `x-html` with dynamic content | XSS if source compromised | TD-005 |
| No subresource integrity | Supply chain risk | Bundled deps mitigate |
| No error boundary | Errors silent in prod | TD-016 |

---

## Operational Limitations

| Limitation | Impact |
|------------|--------|
| No CI/CD | Manual deploy, no gate |
| No automated tests | Regression risk |
| No monitoring | Issues detected by users |
| No alerting | No proactive detection |
| No staging env | Deploy = production |
| Single maintainer | Bus factor = 1 |

---

## Out of Scope (Will Not Implement)

| Feature | Reason |
|---------|--------|
| User accounts / auth | Local-first philosophy |
| Cloud sync | Requires backend, costs, privacy |
| Real-time multiplayer | Requires backend, WebSockets |
| Server-side rendering | Static site only |
| Progressive Web App (offline install) | Not requested |
| Plugin system | No extension points |
| Internationalization (i18n) | English only |
| Right-to-left (RTL) layout | Not required |
| Audio/text-to-speech | Not required |
| Print/PDF export | CSV is primary export |

---

## Scaling Ceilings

| Dimension | Ceiling | What Breaks |
|-----------|---------|-------------|
| **Tests per user** | ~200 | localStorage quota |
| **Attempts per user** | ~500 | localStorage quota |
| **Questions per test** | ~200 | Chart rendering, navigator UI |
| **Concurrent users** | Unlimited | Static host scales |
| **Import per hour** | 60 (unauth) / 5000 (auth) | GitHub API limit |
| **Build time** | ~2s | Vite fast; grows with deps |
| **Bundle size** | ~300KB gzipped | Adds deps → grows |

---

## Technical Debt as Limitations

See [Tech Debt Register](03-development/tech-debt-register.md) for 20 tracked items including:
- TD-001: No tests (blocks safe changes)
- TD-002: Silent quota failure (data loss)
- TD-003: GitHub rate limit (feature break)
- TD-005: XSS surface (security)
- TD-010: No schema migration (future break)
- TD-018: Accessibility gaps (compliance)

---

## Related Documents

- [Troubleshooting](troubleshooting.md) — Symptom → fix for limitations
- [FAQ](faq.md) — User-facing explanations
- [Tech Debt Register](03-development/tech-debt-register.md) — Root causes
- [Compliance Mapping](05-security/compliance-mapping.md) — Regulatory gaps
- [Architecture](01-architecture/architecture.md) — Design boundaries