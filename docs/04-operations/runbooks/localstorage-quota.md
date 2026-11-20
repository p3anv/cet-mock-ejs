---
title: CETPrep — localStorage Quota Recovery Runbook
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [sre, engineers, support]
severity: high
---

# localStorage Quota Recovery Runbook

## Trigger
- User reports: "Test created but not showing after reload"
- User reports: "Attempt submitted but not in history"
- Console: `QuotaExceededError` (may be silent — see TD-002)

## Symptoms
- `saveTest` / `saveAttempt` appears to succeed (toast shows success)
- Data disappears on page refresh
- localStorage shows `cet_mock_tests_v3` or `cet_test_attempts` truncated or missing

## Diagnosis
```javascript
// In DevTools Console:
// 1. Check current usage
JSON.stringify(localStorage.getItem('cet_mock_tests_v3')).length
// → bytes used by tests

JSON.stringify(localStorage.getItem('cet_test_attempts')).length
// → bytes used by attempts

// 2. Check total quota (browser-dependent, ~5-10MB)
try {
    localStorage.setItem('test', 'x'.repeat(10_000_000));
} catch (e) {
    console.log('Quota:', e.name); // QuotaExceededError
}

// 3. Inspect data
JSON.parse(localStorage.getItem('cet_mock_tests_v3'))
JSON.parse(localStorage.getItem('cet_test_attempts'))
```

## Resolution

### For User (Immediate)
1. **Clear old attempts** (preserves tests):
```javascript
// In DevTools Console:
const attempts = JSON.parse(localStorage.getItem('cet_test_attempts') || '[]');
// Keep last 50
const keep = attempts.slice(-50);
localStorage.setItem('cet_test_attempts', JSON.stringify(keep));
```

2. **Clear all data** (nuclear):
```javascript
localStorage.removeItem('cet_mock_tests_v3');
localStorage.removeItem('cet_test_attempts');
localStorage.removeItem('cetprep-theme');
location.reload();
```

### For Maintainer (Code Fix - TD-002)
1. Add quota check before write:
```javascript
// storage.js - proposed
function checkQuota(key, newData) {
    const current = localStorage.getItem(key) || '[]';
    const estimated = JSON.stringify(JSON.parse(current).concat(newData)).length;
    // Rough limit: 4.5MB (leave buffer)
    if (estimated > 4_500_000) {
        throw new Error('STORAGE_QUOTA_EXCEEDED');
    }
}
```

2. Show toast on quota error:
```javascript
// storage.js - proposed
export function saveTest(test) {
    try {
        checkQuota(STORAGE_KEY, [test]);
        // ... existing save logic
    } catch (e) {
        if (e.message === 'STORAGE_QUOTA_EXCEEDED') {
            // Import showToast dynamically to avoid circular dep
            import('./ui.js').then(m => m.showToast(
                'Storage full. Clear old attempts in My Tests → History.',
                'error',
                'Storage Full'
            ));
        }
        throw e;
    }
}
```

## Verification
- User can create new test → persists after reload
- User can submit attempt → appears in history
- No `QuotaExceededError` in console

## Prevention
- Implement TD-002 (quota check + toast)
- Add "Clear old attempts" button in History modal
- Consider IndexedDB for larger storage (future)
- Monitor localStorage size in telemetry (future)

---

## Related
- [Tech Debt TD-002](03-development/tech-debt-register.md#td-002-silent-localstorage-quota-failure)
- [Storage Module](03-development/codebase-tour.md#storagejs)
- [Data Model](01-architecture/data-model.md)