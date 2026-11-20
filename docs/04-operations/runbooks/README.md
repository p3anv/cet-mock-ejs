---
title: CETPrep — Runbooks Index
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [sre, engineers, on-call]
source_of_truth: true
---

# CETPrep — Runbooks

> One runbook per critical operation. Current state: **No automated operations** — all manual.

---

## Runbook Catalog

| Runbook | Trigger | Frequency | Automation |
|---------|---------|-----------|------------|
| [Deploy](deploy.md) | New release / hotfix | On demand | Manual |
| [Rollback](rollback.md) | Bad deploy | Rare | Manual |
| [GitHub Rate Limit Recovery](github-rate-limit.md) | Import feature broken | ~Daily (unauth) | Manual (wait) |
| [localStorage Quota Recovery](localstorage-quota.md) | User reports data loss | Rare | Manual |
| [Cache Invalidation](cache-invalidation.md) | Stale assets reported | Rare | Manual |
| [Dependency Update](dependency-update.md) | Security advisory / new version | Monthly | Manual |

---

## Runbook Template

All runbooks follow this structure:

```markdown
---
title: CETPrep — [Operation Name]
owner: Platform Team
status: as-built
last_reviewed: YYYY-MM-DD
audience: [sre, engineers]
severity: [low|medium|high|critical]
---

# [Operation Name]

## Trigger
- What initiates this runbook

## Symptoms
- User-visible signs

## Diagnosis
- How to confirm

## Resolution
- Step-by-step fix

## Verification
- How to confirm fixed

## Prevention
- How to avoid recurrence
```

---

## Quick Reference Cards

### Deploy (5 min)
```bash
npm run build
npm run preview  # verify
# upload dist/ to static host
```

### Rollback (5 min)
```bash
git revert <bad-commit>
npm run build
# upload dist/ to static host
```

### GitHub Rate Limit (60 min wait)
```bash
# 1. Check: curl -I https://api.github.com/rate_limit
# 2. Wait until X-RateLimit-Reset
# 3. Or: add GITHUB_TOKEN to env
```

### localStorage Quota (User-action)
```
1. User: Clear browser data for site
2. Or: Dev: Add quota check + toast (TD-002)
```

---

## Escalation

| Severity | Response Time | Escalation |
|----------|---------------|------------|
| Critical (data loss, security) | Immediate | Direct to maintainer |
| High (feature broken) | < 1 hour | Maintainer |
| Medium (degraded) | < 4 hours | Next business day |
| Low (cosmetic) | Best effort | Next sprint |

**No on-call rotation exists** — single maintainer.

---

## Related Documents

- [Deployment](deployment.md) — Full deploy process
- [Configuration](configuration.md) — Config reference
- [Observability](observability.md) — Monitoring (not implemented)
- [Incident Response](incident-response.md) — Severity matrix
- [Tech Debt Register](03-development/tech-debt-register.md) — Root causes