---
title: CETPrep — Cache Invalidation Runbook
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [sre, engineers]
severity: low
---

# Cache Invalidation Runbook

## Trigger
- User reports: "Old version still showing after deploy"
- Styles/scripts not updated
- "Hard refresh fixes it" (Ctrl+Shift+R)

## Symptoms
- `index.html` loads but references old asset hashes
- CSS/JS 404 or loads stale version
- Service worker (if any) serving old cache

## Diagnosis
```bash
# 1. Check HTML references current hash
curl -s https://<domain>/ | grep -o 'assets/index-[^"]*'

# 2. Compare with dist/ build
ls dist/assets/index-*.js
# → Should match

# 3. Check Cache-Control headers
curl -I https://<domain>/assets/index-<hash>.js
# → Should have: Cache-Control: public, max-age=31536000, immutable

# 4. Check HTML Cache-Control
curl -I https://<domain>/
# → Should have: Cache-Control: no-cache, must-revalidate
```

## Resolution

### 1. Verify Build Output Has New Hashes
```bash
npm run build
ls dist/assets/
# → New hashes generated
```

### 2. Re-deploy (Ensures HTML Updated)
```bash
# Deploy dist/ again — HTML must be updated to reference new hashes
npx netlify deploy --prod --dir=dist
# or your deploy method
```

### 3. CDN/Edge Cache Purge (If Applicable)
| Host | Purge Method |
|------|--------------|
| Cloudflare | Dashboard → Caching → Purge Everything |
| CloudFront | Invalidation → `/*` |
| Netlify | Automatic on deploy (usually) |
| Vercel | Automatic on deploy |
| AWS S3 | No cache (unless CloudFront in front) |

### 4. Browser Cache (User Action)
- Hard refresh: `Ctrl+Shift+R` (Win/Linux) / `Cmd+Shift+R` (Mac)
- Or: DevTools → Application → Clear storage

## Verification
- `curl` shows new hashes in HTML
- Browser loads without hard refresh
- No console 404s for assets

## Prevention
- **Never** change asset filenames without rebuilding HTML (Vite handles this)
- Ensure `Cache-Control: no-cache` on HTML
- Ensure `Cache-Control: immutable` on hashed assets
- Don't use service workers unless cache strategy documented

---

## Related
- [Deployment](deployment.md#cache-strategy)
- [Deploy Runbook](deploy.md)