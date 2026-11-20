---
title: CETPrep — SLOs / SLIs (As-Defined)
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [sre, engineers, maintainers, leadership]
source_of_truth: true
---

# CETPrep — Service Level Objectives

> **Current State**: No SLOs defined, no SLIs measured, no error budgets.
> This documents what *would* be appropriate for a static-site exam tool.

---

## Service Definition

| Attribute | Value |
|-----------|-------|
| **Service** | CETPrep Static Site |
| **Type** | Client-side only (no backend) |
| **Availability Target** | 99.9% (static host dependent) |
| **Latency Target** | N/A (client-side) |
| **Data Durability** | localStorage (browser-dependent, ~5-10MB) |

---

## Proposed SLIs (Service Level Indicators)

| SLI | Description | Measurement | Target |
|-----|-------------|-------------|--------|
| **Availability** | % of HTTP 200 responses for index.html, test.html, assets | Synthetic monitor (pingdom/uptimerobot) | 99.9% |
| **Build Success** | % of successful `npm run build` in CI | CI pipeline | 100% |
| **Deploy Success** | % of successful production deploys | Deploy pipeline | 100% |
| **JS Error Rate** | Uncaught errors per 1000 sessions | Error tracking (Sentry) | < 1 |
| **Import Success Rate** | Successful GitHub imports / total attempts | Custom event tracking | > 95% |
| **Chart Render Success** | Successful Chart.js renders / attempts | Custom event tracking | > 99% |
| **localStorage Write Success** | Successful saves / attempts | Custom event tracking | 100% |

---

## Proposed SLOs (Service Level Objectives)

| SLO | Target | Window | Error Budget |
|-----|--------|--------|--------------|
| **Availability** | 99.9% | 30 days | 43 min downtime/month |
| **Build Success** | 100% | Per commit | 0 failures |
| **Deploy Success** | 100% | Per deploy | 0 failures |
| **JS Error Rate** | < 0.1% | 7 days | ~100 errors/100k sessions |
| **Import Success** | > 95% | 7 days | 5% failure budget |
| **Chart Render** | > 99% | 7 days | 1% failure budget |
| **Data Persistence** | 100% | Continuous | 0 data loss events |

---

## Error Budget Policy

| Budget Consumed | Action |
|-----------------|--------|
| < 50% | Normal development |
| 50-90% | Prioritize reliability work |
| > 90% | Freeze features; only reliability fixes |
| 100% (exhausted) | Incident response; postmortem required |

---

## Current Measurement Reality

| SLI | Currently Measured? | How to Measure |
|-----|---------------------|----------------|
| Availability | ❌ | Add UptimeRobot (free) |
| Build Success | ❌ | Add GitHub Actions CI |
| Deploy Success | ❌ | Add deploy pipeline |
| JS Error Rate | ❌ | Add Sentry (free tier) |
| Import Success | ❌ | Add event tracking |
| Chart Render | ❌ | Add event tracking |
| Data Persistence | ❌ | Add quota tracking |

---

## Dependency SLOs (External)

| Dependency | Their SLO | Our Impact | Mitigation |
|------------|-----------|------------|------------|
| **GitHub API** | 99.9% (API) | Import feature down | Cache folder listings; show cached data |
| **GitHub Raw** | 99.9% | Import feature down | Same |
| **Static Host (Netlify/Vercel/Cloudflare)** | 99.99% | Site down | Multi-region CDN; DNS failover |
| **CDN (jsdelivr/npm)** | 99.9% | Dev server only | Vite bundles deps in prod |

---

## Incident Response SLOs

| Severity | Detection | Acknowledgment | Resolution |
|----------|-----------|----------------|------------|
| **Critical** (site down, data loss) | < 5 min (synthetic) | < 15 min | < 1 hour |
| **High** (feature broken) | < 15 min (user report) | < 1 hour | < 4 hours |
| **Medium** (degraded) | < 1 hour | < 4 hours | < 24 hours |
| **Low** (cosmetic) | Best effort | Next business day | Next sprint |

**Current**: No detection, no acknowledgment process, single maintainer.

---

## Reporting

| Report | Frequency | Audience | Status |
|--------|-----------|----------|--------|
| **SLO Dashboard** | Real-time | Team | Not implemented |
| **Error Budget Burn** | Weekly | Team | Not implemented |
| **Incident Retrospective** | Post-incident | Team | Not implemented |
| **Monthly Reliability Review** | Monthly | Leadership | Not implemented |

---

## Related Documents

- [Observability](observability.md) — Measurement implementation
- [Incident Response](incident-response.md) — Severity matrix
- [Deployment](deployment.md) — Pipeline (not implemented)
- [Runbooks](runbooks/) — Operational procedures
- [Tech Debt TD-019](03-development/tech-debt-register.md#td-019-no-cicd-pipeline)