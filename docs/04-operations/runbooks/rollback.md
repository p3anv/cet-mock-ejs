---
title: CETPrep — Rollback Runbook
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [sre, engineers]
severity: high
---

# Rollback Runbook

## Trigger
- Production deploy causes regression
- Critical bug reported post-deploy
- Performance degradation

## Symptoms
- User reports: "Feature X broken after update"
- Console errors in production
- GitHub import stops working
- Exam submission fails

## Diagnosis
1. Check browser console on production
2. Compare `dist/` asset hashes with last known good
3. Check `git log --oneline -10` for recent commits

## Resolution

### Option 1: Git Revert + Rebuild (Preferred)
```bash
# 1. Identify bad commit
git log --oneline -10
# → e.g., a1b2c3d "Increase chart sizes..."

# 2. Revert
git revert a1b2c3d
# → Creates new commit undoing changes

# 3. Build
npm run build

# 4. Deploy (see Deploy Runbook)
npx netlify deploy --prod --dir=dist
# or your deploy method
```

### Option 2: Static Host Rollback (Fastest)
| Host | Method |
|------|--------|
| Netlify | Dashboard → Deploys → "Publish deploy" on previous |
| Vercel | Dashboard → Deployments → "Promote to Production" on previous |
| Cloudflare Pages | Dashboard → Deployments → "Rollback" |
| GitHub Pages | `git push origin gh-pages --force` with previous commit |
| S3/CloudFront | Invalidate cache + re-sync previous `dist/` |

### Option 3: Hotfix Forward
```bash
# 1. Create fix commit on main
git checkout main
# ... make fix ...
git commit -am "Hotfix: ..."
npm run build
# deploy
```

## Verification
- Production smoke test passes (see Deploy Runbook)
- Specific reported issue resolved
- No new console errors

## Prevention
- Add CI/CD with required checks
- Add preview deployments for PRs
- Test locally with `npm run preview` before deploy

---

## RTO/RPO
- **RTO**: ~5 minutes (git revert + build + deploy)
- **RPO**: 0 (no server-side data; user data in localStorage unaffected)

---

## Related
- [Deploy Runbook](deploy.md)
- [Deployment Guide](deployment.md)