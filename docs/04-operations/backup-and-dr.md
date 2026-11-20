---
title: CETPrep — Backup & Disaster Recovery (As-Built)
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [sre, engineers, maintainers, auditors]
source_of_truth: true
---

# CETPrep — Backup & Disaster Recovery

> **Current State**: No automated backups. User data lives in browser localStorage only.
> This documents the data topology and what DR would entail.

---

## Data Topology

| Data | Location | Size | Persistence | Backup |
|------|----------|------|-------------|--------|
| **User Tests** | `localStorage: cet_mock_tests_v3` | ~100KB/test | Browser profile | None |
| **User Attempts** | `localStorage: cet_test_attempts` | ~50KB/attempt | Browser profile | None |
| **User Theme** | `localStorage: cetprep-theme` | ~10 bytes | Browser profile | None |
| **App Code** | Git repo (`main` branch) | ~500KB | GitHub | Git history |
| **Build Artifacts** | `dist/` (generated) | ~2MB | CI artifact (30 days) | Manual |
| **GitHub Test Data** | `p3anv/mock-app-data` (external) | ~500KB | GitHub | GitHub |

---

## Recovery Scenarios

### Scenario 1: User Clears Browser Data
| Impact | Recovery | RTO | RPO |
|--------|----------|-----|-----|
| All tests, attempts, theme lost | **None** — data gone permanently | N/A | Total loss |

**Mitigation**: Export CSV (attempts), JSON (tests) — manual user action.

### Scenario 2: Browser Profile Corrupted
| Impact | Recovery | RTO | RPO |
|--------|----------|-----|-----|
| All localStorage lost | **None** — data gone permanently | N/A | Total loss |

### Scenario 3: GitHub Repo Deleted
| Impact | Recovery | RTO | RPO |
|--------|----------|-----|-----|
| Source code lost | Restore from local clone / forks | ~1 hour | 0 (git is distributed) |

### Scenario 4: GitHub Test Data Repo Deleted (`p3anv/mock-app-data`)
| Impact | Recovery | RTO | RPO |
|--------|----------|-----|-----|
| Import feature broken | Mirror data to own repo / bundle in app | ~1 day | N/A (feature loss only) |

### Scenario 5: Static Host Down (Netlify/Vercel/Cloudflare)
| Impact | Recovery | RTO | RPO |
|--------|----------|-----|-----|
| Site unavailable | Re-deploy `dist/` to another host | ~5 min | 0 (static assets) |

### Scenario 6: Malicious Code Deployed
| Impact | Recovery | RTO | RPO |
|--------|----------|-----|-----|
| User data at risk (XSS) | Rollback deploy; users clear localStorage | ~5 min | 0 (if rolled back fast) |

---

## Backup Procedures (Manual)

### User-Initiated Backup (Current)

**Export Tests (JSON)**:
1. Open My Tests page
2. No bulk export UI — user must copy from DevTools:
```javascript
// DevTools Console:
copy(JSON.parse(localStorage.getItem('cet_mock_tests_v3')))
```

**Export Attempts (CSV)**:
1. Open History modal for a test
2. CSV download available per test (not bulk)

**Proposed**: Add "Export All Data" button in Settings (future).

### Maintainer-Initiated Backup

**Code + History**:
```bash
# Full repo clone (includes all history)
git clone --mirror <repo-url> cet-mock-ejs-backup-$(date +%Y%m%d)
```

**Build Artifacts**:
```bash
# After successful build
npm run build
tar -czf dist-backup-$(date +%Y%m%d).tar.gz dist/
```

**GitHub Test Data Mirror**:
```bash
# Clone test data repo
git clone https://github.com/p3anv/mock-app-data.git cet-test-data-backup-$(date +%Y%m%d)
```

---

## Disaster Recovery Procedures

### DR-001: Site Down (Static Host Failure)
1. Verify host status page
2. If prolonged: Deploy `dist/` to backup host
   - Netlify → Vercel: `npx vercel --prod dist`
   - Or: `rsync dist/ user@backup-server:/var/www/cetprep/`
3. Update DNS if needed (CNAME switch)
4. **RTO**: ~5-15 minutes

### DR-002: Repo Compromised / Force-Pushed
1. Identify last known good commit (`git reflog` or GitHub UI)
2. Force-push clean state: `git push origin <good-commit>:main --force`
3. Rebuild & deploy
4. **RTO**: ~10 minutes
5. **RPO**: 0 (git history)

### DR-003: User Data Loss (localStorage)
**No recovery possible** — data only in user's browser.
- Document limitation in [Known Limitations](06-support/known-limitations.md)
- Future: Add cloud sync / IndexedDB export

### DR-004: GitHub Test Data Unavailable
1. Create mirror repo under org account
2. Update `main.js` constants (`GITHUB_*_BASE`)
3. Rebuild & deploy
4. **RTO**: ~1 hour

---

## RTO / RPO Summary

| Scenario | RTO (Target) | RPO (Target) | Achievable Today |
|----------|--------------|--------------|------------------|
| Site down | 15 min | 0 | ✅ 5 min |
| Repo loss | 1 hour | 0 | ✅ (git distributed) |
| Test data repo loss | 4 hours | N/A | ⚠️ Manual |
| User data loss | N/A | Total loss | ❌ Impossible |
| Malicious deploy | 15 min | 0 | ✅ 5 min rollback |

---

## Backup Schedule (Proposed)

| Asset | Frequency | Retention | Method |
|-------|-----------|-----------|--------|
| Git repo (mirror) | Daily | 90 days | `git clone --mirror` cron |
| Build artifacts | Per deploy | 30 days | CI artifact upload |
| Test data mirror | Weekly | 90 days | `git pull` cron |
| User data export | On demand | User-controlled | UI feature (future) |

---

## Testing DR (Not Done)

| Test | Frequency | Status |
|------|-----------|--------|
| Deploy to backup host | Quarterly | ❌ Never |
| Repo mirror restore | Quarterly | ❌ Never |
| GitHub data mirror sync | Monthly | ❌ Never |
| User export/import | Per release | ❌ No UI |

---

## Related Documents

- [Deployment](deployment.md) — Deploy process
- [Rollback Runbook](runbooks/rollback.md) — Fast recovery
- [Known Limitations](06-support/known-limitations.md) — User data loss
- [Tech Debt TD-002](03-development/tech-debt-register.md#td-002-silent-localstorage-quota-failure)
- [Architecture](01-architecture/architecture.md) — Data flow