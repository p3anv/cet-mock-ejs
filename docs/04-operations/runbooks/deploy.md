---
title: CETPrep — Deploy Runbook
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [sre, engineers]
severity: medium
---

# Deploy Runbook

## Trigger
- New feature merged to `main`
- Hotfix needed
- Configuration change

## Symptoms
- N/A (planned operation)

## Diagnosis
- Verify `main` branch has intended changes
- Check `npm run build` passes locally

## Resolution

### 1. Pre-Deploy Checklist
```bash
# Verify clean working tree
git status
# → Should be clean (no uncommitted changes)

# Verify on main
git branch
# → * main

# Pull latest
git pull origin main

# Install deps (clean)
npm ci

# Build
npm run build
# → Must complete without errors

# Preview locally
npm run preview
# → Open http://localhost:4173
# → Run smoke test (see below)
```

### 2. Smoke Test (Local Preview)
- [ ] Dashboard loads, stats display
- [ ] Theme toggle works (dark ↔ light)
- [ ] Navigation: all 5 pages load
- [ ] Create Test: valid JSON → success toast
- [ ] Import: folders load (GitHub API)
- [ ] Attempt test → opens test.html
- [ ] Exam: timer, navigator, keyboard, charts, submit, CSV
- [ ] No console errors

### 3. Deploy to Production

**Option A: Netlify CLI**
```bash
npx netlify deploy --prod --dir=dist
# → Enter site ID if first time
# → Wait for "Website deployed" message
```

**Option B: Vercel CLI**
```bash
npx vercel --prod dist
```

**Option C: rsync to Server**
```bash
rsync -avz --delete dist/ user@server:/var/www/cetprep/
# → Ensure nginx/Apache serves /var/www/cetprep/
```

**Option D: GitHub Pages**
```bash
# Requires gh-pages branch setup
git checkout --orphan gh-pages
git rm -rf .
cp -r dist/* .
git add .
git commit -m "Deploy $(date '+%Y-%m-%d %H:%M')"
git push origin gh-pages --force
git checkout main
```

**Option E: Cloudflare Pages / AWS S3 / Azure / Firebase**
- Use respective CLI or dashboard
- Upload `dist/` contents

### 4. Post-Deploy Verification
```bash
# 1. Check production URL loads
curl -s -o /dev/null -w "%{http_code}" https://<domain>/
# → 200

# 2. Check test.html loads
curl -s -o /dev/null -w "%{http_code}" https://<domain>/test.html
# → 200

# 3. Verify assets load (hash changed)
curl -s https://<domain>/ | grep -o 'assets/index-[^"]*'
# → Should show new hash

# 4. Browser test: repeat smoke test on production URL
```

## Verification
- Production URL returns 200
- All smoke test steps pass on production
- No console errors
- Theme persists across pages

## Prevention
- Add GitHub Actions CI/CD (see [Deployment](deployment.md#proposed-cicd-pipeline))
- Require build pass before deploy
- Add preview deployments for PRs

---

## Rollback
See [Rollback Runbook](rollback.md)

---

## Related
- [Deployment Guide](deployment.md)
- [Configuration](configuration.md)