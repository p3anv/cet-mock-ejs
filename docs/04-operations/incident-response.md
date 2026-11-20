---
title: CETPrep — Incident Response (As-Built)
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [sre, engineers, maintainers, leadership]
source_of_truth: true
---

# CETPrep — Incident Response

> **Current State**: No formal incident response process. Single maintainer handles issues ad-hoc.
> This documents the severity matrix and what a proper process would look like.

---

## Severity Definitions

| Severity | Name | Definition | Examples |
|----------|------|------------|----------|
| **SEV-1** | Critical | Site unavailable, data loss, security breach | Static host down, XSS exploited, malicious deploy |
| **SEV-2** | High | Major feature broken, many users affected | Import broken (rate limit), exam submit fails, build broken |
| **SEV-3** | Medium | Minor feature degraded, workaround exists | Chart render fails sometimes, theme not syncing, slow import |
| **SEV-4** | Low | Cosmetic, documentation, nice-to-have | Typo, color slightly off, missing tooltip |

---

## Response Targets

| Severity | Detection | Acknowledgment | Resolution | Communication |
|----------|-----------|----------------|------------|---------------|
| **SEV-1** | < 5 min (synthetic) | < 15 min | < 1 hour | Status page, stakeholder notify |
| **SEV-2** | < 15 min (user report) | < 1 hour | < 4 hours | Team notify |
| **SEV-3** | < 1 hour | < 4 hours | < 24 hours | Ticket |
| **SEV-4** | Best effort | Next business day | Next sprint | Ticket |

**Current Reality**: No detection, no acknowledgment process, single maintainer, no status page.

---

## Incident Lifecycle

### 1. Detection
- **SEV-1**: Uptime monitor (not configured) / user reports
- **SEV-2/3**: User reports via GitHub Issues / direct contact
- **SEV-4**: GitHub Issues / PR review

### 2. Triage
```
1. Assess severity (use matrix above)
2. Assign owner (currently: sole maintainer)
3. Create incident issue (GitHub Issue with `incident` label)
4. Start timeline (document in issue)
```

### 3. Investigation
- Check browser console (user)
- Check deploy logs (maintainer)
- Check GitHub API rate limit (if import)
- Check localStorage quota (if data loss)
- Reproduce locally

### 4. Resolution
- **Hotfix**: Code fix → build → deploy (5 min)
- **Rollback**: Revert commit → build → deploy (5 min)
- **Config**: Update env var → rebuild → deploy
- **Wait**: GitHub rate limit reset (60 min)

### 5. Communication

| Severity | Internal | External |
|----------|----------|----------|
| SEV-1 | Immediate (Slack/call) | Status page tweet/email (not set up) |
| SEV-2 | Within 1 hour | GitHub Issue update |
| SEV-3 | Within 4 hours | GitHub Issue update |
| SEV-4 | Next standup | GitHub Issue update |

**Template** (GitHub Issue):
```markdown
## Incident: [Title]

**Severity**: SEV-X
**Detected**: YYYY-MM-DD HH:MM UTC
**Owner**: @maintainer
**Status**: Investigating / Mitigating / Resolved

### Impact
- What's broken
- Who's affected
- Workaround (if any)

### Timeline
- HH:MM - Detected
- HH:MM - Investigating
- HH:MM - Root cause: ...
- HH:MM - Fix deployed
- HH:MM - Verified

### Root Cause
- What happened
- Why it happened

### Action Items
- [ ] Fix: ...
- [ ] Prevent: ...
- [ ] Document: ...
```

### 6. Postmortem (SEV-1, SEV-2)

**Required within 48 hours**:
- Timeline
- Root cause (5 Whys)
- Impact assessment
- Action items with owners
- Links to runbooks updated

**Template**: `docs/07-history/lessons-learned.md` format

---

## Runbook References by Symptom

| Symptom | Runbook |
|---------|---------|
| Site returns 5xx/404 | [Deploy](runbooks/deploy.md) → [Rollback](runbooks/rollback.md) |
| Import fails (403/429) | [GitHub Rate Limit](runbooks/github-rate-limit.md) |
| User data missing | [localStorage Quota](runbooks/localstorage-quota.md) |
| Old version showing | [Cache Invalidation](runbooks/cache-invalidation.md) |
| Build fails | [Dependency Update](runbooks/dependency-update.md) |
| Console errors | Check [Observability](observability.md) (not implemented) |

---

## War Room (Not Applicable)

Single maintainer — no war room. For team scale:
- Dedicated Slack channel `#incident-<id>`
- Video call link in incident issue
- Shared timeline doc

---

## Escalation Contacts

| Role | Name | Contact | Backup |
|------|------|---------|--------|
| **Primary Maintainer** | pranav | GitHub @pranav | — |
| **Security** | — | — | — |
| **Infrastructure** | — | Static host support | — |

---

## Tools Access

| Tool | Access | Credentials Location |
|------|--------|---------------------|
| GitHub | Maintainer | Personal account |
| Static Host (Netlify/Vercel) | Maintainer | Personal account |
| Domain Registrar | — | — |
| Monitoring | None | — |

---

## Current Gaps (To Fix)

- [ ] Add uptime monitoring (UptimeRobot free)
- [ ] Add error tracking (Sentry free)
- [ ] Add status page (GitHub Pages + static site)
- [ ] Document runbooks for all SEV-1/2 scenarios
- [ ] Define on-call rotation (when team > 1)
- [ ] Add incident issue template to repo
- [ ] Postmortem process documented

---

## Related Documents

- [Runbooks](runbooks/) — Specific procedures
- [SLOs](slo.md) — Targets and error budgets
- [Observability](observability.md) — Detection capability
- [Backup & DR](backup-and-dr.md) — Recovery procedures
- [Tech Debt](03-development/tech-debt-register.md) — Root causes