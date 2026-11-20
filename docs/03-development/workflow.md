---
title: CETPrep — Development Workflow (As-Built)
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [engineers, maintainers, leads]
source_of_truth: true
---

# CETPrep — Development Workflow

> Documents current (informal) workflow. No enforced process exists — this is what actually happens.

---

## Branching Strategy

**Current**: Single branch (`main`) — all commits directly to main.

| Branch | Purpose | Protection |
|--------|---------|------------|
| `main` | Only branch; receives all commits | None (no branch protection rules) |

**History**: 8 commits, all on `main`, single author.

**No**: Feature branches, release branches, hotfix branches, PRs, code review.

---

## Commit Workflow

```bash
# Current (observed)
git add .
git commit -m "message"  # Messages: "latest", "add", "fix css", "Increase chart sizes: ..."
git push origin main
```

**No**:
- Pre-commit hooks
- Commit message conventions (Conventional Commits, etc.)
- Signed commits
- `git commit --amend` (not observed)

---

## Release Process

**Current**: No release process. No tags. No versions beyond `package.json: "1.0.0"`.

| Artifact | Status |
|----------|--------|
| Git tags | None |
| GitHub Releases | None |
| Changelog | None (see `changelog.md` for reconstructed history) |
| Version bump | Manual `package.json` edit (not done) |
| Deployment | Manual `npm run build` → copy `dist/` to static host |

---

## Development Loop

```bash
# 1. Start dev server
npm run dev
# → Opens http://localhost:5500

# 2. Edit files (src/js/*.js, src/css/*.css, index.html, test.html)
# → Vite HMR auto-reloads (preserves Alpine state for JS)

# 3. Manual verify in browser
# → Check Console for errors
# → Test feature

# 4. Build check (occasionally)
npm run build
# → Verifies no build errors

# 5. Commit + push
git add -A
git commit -m "description"
git push
```

---

## Code Review

**Current**: None. Single author, direct commits.

**If team grows**: Would need:
- Branch protection on `main` (require PR)
- Required reviews (1+)
- Required status checks (build, test — when tests exist)
- `CODEOWNERS` file

---

## Dependency Management

| Action | Current | Recommended |
|--------|---------|-------------|
| Install | `npm install` (manual) | `npm ci` in CI |
| Update | Manual `npm update` / edit `package.json` | Dependabot / Renovate |
| Audit | Manual `npm audit` (ad-hoc) | CI step + scheduled |
| Lockfile | `package-lock.json` committed | Yes (current) |

**Current State** (2026-11-20):
- `npm audit`: 0 vulnerabilities
- All deps on latest compatible minor (`^3.14.1`, `^4.4.7`, `^5.5.2`, `^8.3.8`)

---

## Local Development Setup

```bash
# One-time
git clone <repo>
cd cet-mock-ejs
npm install

# Daily
npm run dev
# Edit → browser verifies → commit → push
```

**No**: Dev containers, Docker, standardized Node version enforcement (`.nvmrc` not present).

---

## Debugging Workflow

| Task | Method |
|------|--------|
| JS Debugging | DevTools Sources → `src/js/` (source maps work) |
| Alpine State | DevTools Console → `Alpine.$data(document.body)` |
| localStorage | DevTools Application → Local Storage |
| Network (GitHub) | DevTools Network → filter `fetch/XHR` |
| CSS | DevTools Elements → Styles (CSS variables visible) |
| Build Issues | `npm run build` → check output |

---

## Build & Deploy

### Build

```bash
npm run build
# → Vite builds to dist/
# → Multi-page: index.html + test.html
# → Code split: vendor chunks (alpinejs, chart.js, papaparse)
# → CSS extracted to assets/*.css
# → Assets hashed for cache busting
```

**Verified Output** (2026-11-20):
```
dist/
├── index.html          (39 KB)
├── test.html           (4.5 KB)
├── favicon.ico
├── hero-illustration.svg
└── assets/
    ├── index-[hash].js     (~180 KB gzipped)
    ├── test-[hash].js      (~120 KB gzipped)
    ├── index-[hash].css    (~35 KB gzipped)
    └── test-[hash].css     (~45 KB gzipped)
```

### Preview

```bash
npm run preview
# → Serves dist/ on port 4173
# → Exact production simulation
```

### Deploy (Manual)

```bash
# Current: Copy dist/ to static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3+CloudFront, etc.)
# No deploy script, no CI/CD pipeline
```

---

## Environment Management

| Environment | URL | Purpose | Deploy Trigger |
|-------------|-----|---------|----------------|
| Local Dev | `http://localhost:5500` | Development | `npm run dev` |
| Local Preview | `http://localhost:4173` | Build verification | `npm run preview` |
| Production | *Not configured* | Live users | Manual `dist/` upload |

**No**: Staging, preview deployments per PR, feature flags.

---

## Incident Response (Current)

| Scenario | Current Response |
|----------|------------------|
| Build broken | `npm run build` locally → fix → push |
| Runtime error | DevTools Console → fix → push |
| GitHub API rate limit | User sees toast error → wait 1 hour |
| localStorage quota | Silent fail → user data loss unnoticed |
| CSS visual bug | Edit `src/css/*.css` (frozen — verify `rules.md` first) |

**No**: On-call, runbooks, alerting, postmortems.

---

## Security Workflow

| Practice | Status |
|----------|--------|
| Dependency audit | Manual `npm audit` |
| SAST/DAST | None |
| Secrets scanning | None (no secrets in repo) |
| CSP | Not implemented |
| Penetration test | None |

---

## Documentation Workflow

| Doc | Update Trigger | Current |
|-----|----------------|---------|
| `README.md` | Manual | Minimal |
| `docs/*` (this set) | Manual (this initiative) | Being created |
| Code comments | Rare | Minimal |
| `CHANGELOG.md` | Never | None |

---

## Team Scaling Checklist (When Team > 1)

- [ ] Enable branch protection on `main`
- [ ] Require PR for all changes
- [ ] Add required status checks (build, lint, test)
- [ ] Set up Dependabot / Renovate
- [ ] Add GitHub Actions CI workflow
- [ ] Define Conventional Commits standard
- [ ] Add `CODEOWNERS`
- [ ] Document PR template
- [ ] Set up preview deployments (Netlify/Vercel)
- [ ] Add automated test suite (Vitest + Playwright)
- [ ] Define release process (semver, tags, changelog)
- [ ] Add security scanning (GitHub CodeQL, Dependabot alerts)
- [ ] Create on-call rotation + runbooks

---

## Related Documents

- [Setup](setup.md) — Verified bootstrap commands
- [Conventions](conventions.md) — Code style, patterns
- [Testing](testing.md) — Test strategy (current: none)
- [Tech Debt Register](tech-debt-register.md) — Known gaps including workflow
- [Architecture](01-architecture/architecture.md) — System context