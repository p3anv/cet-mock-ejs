---
title: CETPrep — GitHub Rate Limit Recovery Runbook
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [sre, engineers]
severity: medium
---

# GitHub Rate Limit Recovery Runbook

## Trigger
- User clicks "Import" → toast "Failed to load folder: 403 Forbidden" or "Rate limit exceeded"
- Import page shows error state for all folders
- `loadFolderTests` fails silently with toast error

## Symptoms
- Import feature completely non-functional
- Console: `GET https://api.github.com/repos/... 403 (Forbidden)`
- Response headers: `X-RateLimit-Remaining: 0`

## Diagnosis
```bash
# Check current rate limit status
curl -I https://api.github.com/rate_limit

# Expected response when limited:
# X-RateLimit-Limit: 60
# X-RateLimit-Remaining: 0
# X-RateLimit-Reset: <unix-timestamp>
# X-RateLimit-Used: 60

# Convert reset time
date -d @<X-RateLimit-Reset>
```

## Resolution

### Immediate: Wait for Reset
- Unauthenticated limit: 60 requests/hour
- Reset occurs at top of hour (usually)
- User must wait — no workaround without token

### Short-term: Add GitHub Token (Maintainer)
1. Create GitHub Personal Access Token (classic):
   - Settings → Developer settings → Personal access tokens → Generate new token
   - Scopes: `public_repo` (read public repos)
2. Add to deployment environment:
   - Netlify: Site settings → Environment variables → `VITE_GITHUB_TOKEN`
   - Vercel: Project settings → Environment variables → `VITE_GITHUB_TOKEN`
   - Other: Set `VITE_GITHUB_TOKEN` at build time
3. Update `main.js` to use token (code change required):
```javascript
// main.js - add near GITHUB_API_BASE
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || '';
const GITHUB_HEADERS = GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {};

// In loadFolderTests, importTest, importSelectedTests:
const response = await fetch(url, { headers: GITHUB_HEADERS });
```
4. Rebuild and deploy

**Authenticated limit**: 5000 requests/hour (vs 60 unauthenticated)

### Long-term: Implement Backoff + Retry (Code Change)
```javascript
// Proposed: main.js fetch wrapper
async function githubFetch(url, options = {}) {
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const response = await fetch(url, options);
        if (response.status === 429 || response.status === 403) {
            const reset = response.headers.get('X-RateLimit-Reset');
            const waitSeconds = reset ? Math.max(0, reset - Date.now() / 1000) : 60;
            if (attempt < maxRetries) {
                await new Promise(r => setTimeout(r, waitSeconds * 1000));
                continue;
            }
        }
        return response;
    }
}
```

## Verification
- Import page loads folders without error
- Single test import works
- Bulk import works
- Rate limit headers show `X-RateLimit-Remaining > 0`

## Prevention
- Implement `VITE_GITHUB_TOKEN` support (TD-003)
- Add exponential backoff on 429/403
- Show rate limit remaining in UI
- Cache folder listings in localStorage (TTL 1hr)

---

## Related
- [Tech Debt TD-003](03-development/tech-debt-register.md#td-003-github-api-rate-limit-60hr-unauthenticated)
- [Configuration](configuration.md#environment-variables-not-currently-used)
- [Deployment](deployment.md#environment-variables-build-time)