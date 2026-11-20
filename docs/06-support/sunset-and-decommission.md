---
title: CETPrep — Sunset & Decommission Plan (As-Built)
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [engineers, maintainers, leads, legal]
source_of_truth: true
---

# CETPrep — Sunset & Decommission Plan

> **Current Status**: Active project — not sunsetting.
> This documents the procedure if/when decommission is needed.

---

## Sunset Triggers

| Trigger | Decision Authority |
|---------|-------------------|
| Business decision to discontinue | Product/Leadership |
| Zero active users for 12 months | Analytics (not implemented) |
| Security vulnerability unfixable | Security Team |
| Technology stack EOL (no migration path) | Engineering |
| Legal/compliance requirement | Legal |

---

## Decommission Phases

### Phase 1: Announcement (T-90 days)

| Action | Owner | Artifact |
|--------|-------|----------|
| Internal announcement | Lead | Slack/Email |
| User-facing banner in app | Engineer | `index.html` banner component |
| Export data guide published | Engineer | [Export Guide](#user-data-export) |
| Static host renewal cancelled | Ops | Calendar reminder |

### Phase 2: Read-Only (T-30 days)

| Action | Owner | Artifact |
|--------|-------|----------|
| Disable Create Test | Engineer | Feature flag / code change |
| Disable Import | Engineer | Feature flag / code change |
| Disable new Attempts | Engineer | Feature flag / code change |
| Keep: View Tests, View History, Export | Engineer | — |
| Update banner: "Read-only mode" | Engineer | — |

### Phase 3: Shutdown (T-0)

| Action | Owner | Artifact |
|--------|-------|----------|
| Deploy final "Sunset" page | Engineer | `sunset.html` in `dist/` |
| Disable static host | Ops | Host dashboard |
| Archive GitHub repo | Lead | GitHub Settings → Archive |
| Cancel domain renewal | Ops | Registrar |
| Remove from monitoring | Ops | UptimeRobot/Sentry |

### Phase 4: Post-Shutdown (T+90 days)

| Action | Owner |
|--------|-------|
| Delete static host project | Ops |
| Delete CI/CD pipelines | Ops |
| Remove secrets from CI | Ops |
| Final repo archive (immutable) | Lead |

---

## User Data Export

### Automated Export (If Built)

```javascript
// Proposed: sunset export feature
function exportAllUserData() {
    const tests = JSON.parse(localStorage.getItem('cet_mock_tests_v3') || '[]');
    const attempts = JSON.parse(localStorage.getItem('cet_test_attempts') || '[]');
    const theme = localStorage.getItem('cetprep-theme');
    
    const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        tests,
        attempts,
        theme
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `cetprep-export-${Date.now()}.json`);
}
```

### Manual Export (Current)

1. Open DevTools Console
2. Run:
```javascript
const data = {
    tests: JSON.parse(localStorage.getItem('cet_mock_tests_v3') || '[]'),
    attempts: JSON.parse(localStorage.getItem('cet_test_attempts') || '[]'),
    theme: localStorage.getItem('cetprep-theme')
};
copy(JSON.stringify(data, null, 2));
```
3. Paste into file → save as `cetprep-backup.json`

### Import to Alternative

No alternative exists. Data format documented in [Data Model](01-architecture/data-model.md).

---

## Asset Disposition

| Asset | Disposition |
|-------|-------------|
| **Source Code** | Archive GitHub repo (read-only) |
| **Build Artifacts** | Delete (reproducible from source) |
| **GitHub Test Data** | Keep fork / mirror if org-owned |
| **Documentation** | Keep in archived repo |
| **Domain** | Release / transfer |
| **Static Host Project** | Delete |
| **Monitoring/Alerting** | Delete |
| **Secrets** | Revoke all |

---

## Communication Templates

### Internal Announcement
```
Subject: CETPrep Sunset - Effective [DATE]

Team,

We are sunsetting CETPrep effective [DATE]. 

Timeline:
- [T-90] Announcement + export guide
- [T-30] Read-only mode
- [T-0] Shutdown
- [T+90] Cleanup

Reason: [Business/Technical/Legal]

Action required: [Export data / Migrate / None]

Questions: [Contact]
```

### User-Facing Banner
```html
<!-- Injected at top of index.html / test.html -->
<div class="sunset-banner" style="background: var(--warning-soft); border: 1px solid var(--warning); padding: 12px; text-align: center;">
    <strong>⚠️ CETPrep is sunsetting on [DATE].</strong>
    <br>
    Export your data: <a href="#export-guide">Guide</a> | 
    <a href="https://github.com/.../issues">Support</a>
</div>
```

### Final Page (`sunset.html`)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>CETPrep — Sunset</title>
    <style>
        body { font-family: system-ui; max-width: 600px; margin: 100px auto; padding: 20px; text-align: center; }
        .icon { font-size: 64px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="icon">📚</div>
    <h1>CETPrep has been retired</h1>
    <p>Thank you for using CETPrep. The service was discontinued on <strong>[DATE]</strong>.</p>
    <p>Your data remains in your browser's localStorage. You can export it via DevTools Console:</p>
    <pre style="text-align:left; background:#f5f5f5; padding:16px; border-radius:8px;">
copy(JSON.stringify({
    tests: JSON.parse(localStorage.getItem('cet_mock_tests_v3') || '[]'),
    attempts: JSON.parse(localStorage.getItem('cet_test_attempts') || '[]'),
    theme: localStorage.getItem('cetprep-theme')
}, null, 2))
    </pre>
    <p>Source code: <a href="https://github.com/.../cet-mock-ejs">GitHub (archived)</a></p>
</body>
</html>
```

---

## Legal & Compliance

| Requirement | Status |
|-------------|--------|
| Data retention law compliance | Review with Legal |
| User notification period | 90 days (this plan) |
| Data deletion request handling | Manual (localStorage user-controlled) |
| Contract termination (hosting) | Per provider terms |

---

## Rollback Plan (If Sunset Reversed)

| Time | Action |
|------|--------|
| T-30 to T-0 | Re-enable features, remove banner, redeploy |
| T-0 to T+7 | Re-deploy from archived `dist/` or rebuild from `main` |
| T+7+ | Full rebuild from archived repo |

---

## Related Documents

- [Backup & DR](04-operations/backup-and-dr.md) — Data recovery
- [Handover Checklist](handover-checklist.md) — Ownership transfer
- [Data Classification](05-security/data-classification.md) — Data handling
- [Known Limitations](known-limitations.md) — Export gaps