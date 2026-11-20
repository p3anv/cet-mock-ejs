---
title: CETPrep — Deployment Guide (As-Deployed)
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [sre, engineers, maintainers]
source_of_truth: true
---

# CETPrep — Deployment Guide

> **Current State**: No automated deployment. Manual `npm run build` → upload `dist/` to static host.
> This documents the as-built process and what a proper pipeline would need.

---

## Environments

| Environment | URL | Purpose | Deploy Method | Status |
|-------------|-----|---------|---------------|--------|
| **Local Dev** | `http://localhost:5500` | Development | `npm run dev` | Active |
| **Local Preview** | `http://localhost:4173` | Build verification | `npm run preview` | Active |
| **Production** | *Not configured* | Live users | Manual `dist/` upload | **Not deployed** |

**No**: Staging, preview-per-PR, feature flag environments.

---

## Build Process

```bash
# 1. Install dependencies (clean)
npm ci

# 2. Production build
npm run build
# → Vite 8.3.8 builds to dist/
# → Multi-page: index.html + test.html
# → Code split: vendor chunks (alpinejs, chart.js, papaparse)
# → CSS extracted, minified
# → Assets hashed for cache busting
# → Source maps generated

# 3. Verify build
npm run preview
# → Serves dist/ on port 4173
# → Test in browser
```

### Build Output (Verified 2026-11-20)

```
dist/
├── index.html              (39 KB)      # Main SPA
├── test.html               (4.5 KB)     # Exam page
├── favicon.ico             (15 KB)
├── hero-illustration.svg   (64 KB)
└── assets/
    ├── index-[hash].js         (~180 KB gzipped)  # Dashboard app + vendors
    ├── test-[hash].js          (~120 KB gzipped)  # Exam app + vendors
    ├── index-[hash].css        (~35 KB gzipped)   # Dashboard styles
    └── test-[hash].css         (~45 KB gzipped)   # Exam styles
```

### Vite Config (Source of Truth)

```javascript
// vite.config.js (actual)
import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    publicDir: 'public',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: true,
        rollupOptions: {
            input: {
                index: 'index.html',
                test: 'test.html',
            },
        },
    },
    server: {
        port: 5500,
        open: true,
    },
});
```

---

## Deployment Targets (Compatible)

CETPrep is a **pure static site** (HTML + JS + CSS). No server-side runtime.

| Target | Config Notes |
|--------|--------------|
| **Netlify** | `npm run build` → publish `dist/`; auto-detects SPA redirect |
| **Vercel** | `npm run build` → output `dist/`; `vercel.json` for SPA fallback |
| **Cloudflare Pages** | `npm run build` → output `dist/`; `_redirects` for SPA |
| **GitHub Pages** | `npm run build` → push `dist/` to `gh-pages` branch; base path config |
| **AWS S3 + CloudFront** | `npm run build` → sync `dist/` to bucket; CloudFront for HTTPS + SPA fallback |
| **Azure Static Web Apps** | `npm run build` → output `dist/`; GitHub Actions integration |
| **Firebase Hosting** | `npm run build` → `firebase deploy`; `firebase.json` for SPA |
| **Surge.sh** | `npm run build` → `surge dist/` |
| **Any static host** | Upload `dist/` contents to document root |

### SPA Fallback Required

Since `index.html` uses hash routing (`#dashboard`, `#create`, etc.), **no server-side fallback needed** — hash routes work on any static host without config.

**Exception**: `test.html` is a separate entry point — direct link works natively.

---

## Manual Deploy Steps (Current)

```bash
# 1. Build
npm run build

# 2. Verify locally
npm run preview
# → Open http://localhost:4173
# → Test: dashboard, create, my tests, samples, import, exam

# 3. Deploy to chosen host
# Example (Netlify CLI):
npx netlify deploy --prod --dir=dist

# Example (Vercel CLI):
npx vercel --prod dist

# Example (rsync to server):
rsync -avz dist/ user@server:/var/www/cetprep/

# Example (GitHub Pages):
git checkout --orphan gh-pages
git rm -rf .
cp -r dist/* .
git add .
git commit -m "Deploy $(date)"
git push origin gh-pages --force
```

---

## Environment Variables (Build Time)

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `VITE_GITHUB_TOKEN` | No | — | GitHub API auth for import (higher rate limit) |
| `VITE_APP_VERSION` | No | `package.json` version | Display in footer / debug |

**Usage in code** (not yet implemented):
```javascript
// main.js (proposed)
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || '';
const headers = GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {};
```

**Current**: No env vars used. GitHub API calls are unauthenticated.

---

## Runtime Configuration

**None**. All configuration is:
- Build-time constants in `main.js` (GitHub URLs, folder list)
- localStorage (user theme, tests, attempts)
- No server-side config, no feature flags, no remote config.

---

## Cache Strategy

| Asset | Cache-Control | Reason |
|-------|---------------|--------|
| `index.html`, `test.html` | `no-cache, must-revalidate` | HTML changes = new entry points |
| `assets/*.js`, `assets/*.css` | `public, max-age=31536000, immutable` | Hashed filenames = cache forever |
| `favicon.ico`, `hero-illustration.svg` | `public, max-age=86400` | Rarely change |

**Implementation**: Configure on static host (Netlify `_headers`, Vercel `headers`, Cloudflare `Cache Rules`, etc.).

---

## Health Checks

**No automated health checks exist**.

### Manual Smoke Test (Post-Deploy)

```bash
# 1. Load index.html
curl -s -o /dev/null -w "%{http_code}" https://<domain>/
# → Expect 200

# 2. Load test.html
curl -s -o /dev/null -w "%{http_code}" https://<domain>/test.html
# → Expect 200

# 3. Verify JS loads
curl -s https://<domain>/ | grep -c 'src="/assets/index-'
# → Expect 1+

# 4. Verify CSS loads
curl -s https://<domain>/ | grep -c 'href="/assets/index-'
# → Expect 1+
```

### Browser Verification Checklist

- [ ] Dashboard loads, shows stats (0 if empty)
- [ ] Theme toggle works (dark ↔ light)
- [ ] All 5 nav pages load: Dashboard, Create, My Tests, Samples, Import
- [ ] Create Test: valid JSON saves + toast
- [ ] Import: GitHub folders load (rate limited)
- [ ] Attempt test → opens test.html → timer runs
- [ ] Exam: navigator, keyboard, charts, submit, CSV download
- [ ] No console errors

---

## Rollback

**Current**: No automated rollback.

### Manual Rollback

```bash
# Option 1: Re-deploy previous build artifact (if archived)
# Option 2: Revert commit + rebuild
git revert <bad-commit>
npm run build
# → Deploy dist/

# Option 3: Static host rollback (Netlify/Vercel/Cloudflare have UI)
```

**RTO**: ~5 minutes (build + deploy)
**RPO**: 0 (no data server-side; user data in localStorage)

---

## Scaling Limits

| Dimension | Limit | Notes |
|-----------|-------|-------|
| **Concurrent users** | Unlimited (static) | CDN handles |
| **Test size** | ~5MB localStorage | Browser quota (~5-10MB) |
| **Questions per test** | ~200 (practical) | Chart rendering, DOM size |
| **Attempts stored** | ~1000 (practical) | localStorage quota |
| **GitHub API calls** | 60/hr (unauth) | Hard limit; token → 5000/hr |

---

## Monitoring (Not Implemented)

| Metric | Current | Desired |
|--------|---------|---------|
| Uptime | None | 99.9% via pingdom/uptimerobot |
| Build success | Manual | CI badge |
| JS errors | None | Sentry / LogRocket |
| Page load | None | Web Vitals (LCP, CLS, FID) |
| Feature usage | None | Plausible / GA4 (privacy-friendly) |

---

## Proposed CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml (proposed)
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
          retention-days: 30

  deploy-preview:
    needs: build
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      - uses: netlify/actions/cli@master
        with:
          args: deploy --dir=dist --alias=pr-${{ github.event.number }}
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=dist
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## Related Documents

- [Setup](03-development/setup.md) — Build commands verified
- [Configuration](configuration.md) — All config keys
- [Runbooks](runbooks/) — Operational procedures
- [Backup & DR](backup-and-dr.md) — Data protection
- [Architecture](01-architecture/architecture.md) — System context