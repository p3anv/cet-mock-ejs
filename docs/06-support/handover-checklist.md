---
title: CETPrep — Handover Checklist (As-Built)
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [incoming-maintainer, leads, managers]
source_of_truth: true
---

# CETPrep — Handover Checklist

> Concrete runbook for transferring ownership. Complete each item before handover.

---

## Pre-Handover (Outgoing Maintainer)

### Code & Repository
- [ ] Push all commits to `main`
- [ ] Verify `npm run build` passes
- [ ] Verify `npm run preview` works locally
- [ ] Confirm `package-lock.json` committed
- [ ] No uncommitted changes (`git status` clean)
- [ ] Document any local `.env` values needed

### Access & Credentials (Transfer Ownership)
- [ ] **GitHub Repo**: Transfer ownership or add incoming as admin
- [ ] **Static Host** (Netlify/Vercel/Cloudflare): Transfer site ownership or add collaborator
- [ ] **Domain Registrar** (if custom domain): Transfer or share credentials
- [ ] **GitHub Personal Access Token** (if used for import): Revoke old, incoming creates new
- [ ] **npm Account** (if publishing): Transfer or share (not needed currently)

### Documentation
- [ ] All docs in `docs/` current (this checklist last)
- [ ] `README.md` updated with current status
- [ ] `CHANGELOG.md` updated (see [Changelog](07-history/changelog.md))
- [ ] Any tribal knowledge documented in [Tribal Knowledge](07-history/tribal-knowledge.md)

### Operational
- [ ] Run [Deploy Runbook](04-operations/runbooks/deploy.md) once to verify
- [ ] Run [Rollback Runbook](04-operations/runbooks/rollback.md) once to verify
- [ ] Confirm monitoring (if any) alerts go to incoming
- [ ] Confirm incident escalation contacts updated

---

## Day 1 (Incoming Maintainer)

### Environment Setup
- [ ] Clone repo: `git clone <repo-url>`
- [ ] Install: `npm install`
- [ ] Dev server: `npm run dev` → verify `http://localhost:5500`
- [ ] Build: `npm run build` → verify `dist/` created
- [ ] Preview: `npm run preview` → verify `http://localhost:4173`

### Access Verification
- [ ] GitHub: Can push to `main`, create branches, manage settings
- [ ] Static Host: Can deploy, view logs, manage env vars
- [ ] Domain: Can manage DNS (if applicable)
- [ ] npm: Can publish (if applicable)

### System Understanding
- [ ] Read [Overview](00-overview/overview.md) — business context
- [ ] Read [Architecture](01-architecture/architecture.md) — system design
- [ ] Read [Codebase Tour](03-development/codebase-tour.md) — module walkthrough
- [ ] Read [Setup](03-development/setup.md) — verified commands
- [ ] Read [Tech Debt Register](03-development/tech-debt-register.md) — known issues

### Operational Readiness
- [ ] Read [Deployment](04-operations/deployment.md)
- [ ] Read [Runbooks](04-operations/runbooks/) — all 6 runbooks
- [ ] Read [Incident Response](04-operations/incident-response.md)
- [ ] Read [Observability](04-operations/observability.md) — current gaps

---

## Week 1 (Incoming Maintainer)

### Hands-On
- [ ] Create a test via UI → verify saves
- [ ] Import a test from GitHub → verify works
- [ ] Attempt a test → verify timer, navigator, charts, submit, CSV
- [ ] Toggle theme → verify persists across reload
- [ ] Trigger GitHub rate limit → verify error handling
- [ ] Fill localStorage near quota → verify behavior (TD-002)

### Code Familiarity
- [ ] Trace `main.js` `init()` → understand routing + state
- [ ] Trace `test.js` `init()` → understand exam flow
- [ ] Trace `storage.js` → understand data persistence
- [ ] Trace `charts.js` parser → understand chart markup
- [ ] Read `validate.js` → understand JSON rules

### Security Review
- [ ] Read [Threat Model](05-security/threat-model.md)
- [ ] Read [Data Classification](05-security/data-classification.md)
- [ ] Verify no secrets in repo (`git log --all -p | grep -i token` etc.)
- [ ] Enable GitHub Secret Scanning (repo settings)

### Process Setup
- [ ] Enable Dependabot (repo settings → Security)
- [ ] Enable Dependabot Alerts
- [ ] Add `npm audit` to CI (when CI added)
- [ ] Set up uptime monitoring (UptimeRobot free)

---

## Month 1 (Incoming Maintainer)

### Technical Debt Triage
- [ ] Prioritize [Tech Debt Register](03-development/tech-debt-register.md) top 5
- [ ] Create GitHub Issues for each with labels
- [ ] Estimate effort for TD-001 (tests), TD-002 (quota), TD-003 (rate limit)

### Infrastructure
- [ ] Set up CI/CD pipeline (GitHub Actions → deploy)
- [ ] Add preview deployments for PRs
- [ ] Add error tracking (Sentry free tier)
- [ ] Add uptime monitoring

### Documentation
- [ ] Update any stale docs discovered
- [ ] Add missing runbooks if new scenarios found
- [ ] Document any tribal knowledge learned

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Outgoing Maintainer | | | |
| Incoming Maintainer | | | |
| Technical Lead | | | |

---

## Emergency Contacts (Post-Handover)

| System | Contact | Access |
|--------|---------|--------|
| GitHub | Incoming Maintainer | Admin |
| Static Host | Incoming Maintainer | Admin |
| Domain | Incoming Maintainer | Admin |
| Previous Maintainer | [Name] | Advisory (30 days) |

---

## Related Documents

- [Overview](00-overview/overview.md) — Business context
- [Completion Record](00-overview/completion-record.md) — As-built acceptance
- [Tech Debt Register](03-development/tech-debt-register.md) — Prioritized issues
- [Incident Response](04-operations/incident-response.md) — Escalation
- [Tribal Knowledge](07-history/tribal-knowledge.md) — Unwritten rules