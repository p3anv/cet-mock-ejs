---
title: CETPrep — Dependency Update Runbook
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [engineers, maintainers]
severity: low
---

# Dependency Update Runbook

## Trigger
- `npm audit` reports vulnerabilities
- New minor/patch version available
- Dependabot alert (if enabled)

## Symptoms
- `npm audit` output shows vulnerabilities
- GitHub security alerts (if configured)

## Diagnosis
```bash
# 1. Audit
npm audit

# 2. Check outdated
npm outdated

# 3. Check specific package
npm view alpinejs versions --json
npm view chart.js versions --json
npm view papaparse versions --json
npm view vite versions --json
```

## Resolution

### 1. Patch/Minor Updates (Safe)
```bash
# Update to latest compatible per package.json (^)
npm update

# Or specific package
npm install alpinejs@latest chart.js@latest papaparse@latest

# Verify
npm run build
npm run preview  # smoke test
```

### 2. Major Updates (Breaking Risk)
| Package | Current | Risk | Migration Notes |
|---------|---------|------|-----------------|
| `alpinejs` | 3.14.x | Medium | v4 may change directive syntax |
| `chart.js` | 4.4.x | High | v5 changes API, types |
| `papaparse` | 5.5.x | Low | v6 unlikely soon |
| `vite` | 8.3.x | Medium | v9 may change config |

**Process for major**:
1. Read changelog / migration guide
2. Create feature branch
3. Update `package.json`
4. Run `npm install`
5. Fix breaking changes
6. Full regression test
7. PR + review

### 3. Security Updates (Urgent)
```bash
# If npm audit fix works
npm audit fix

# If not, manual update vulnerable dep
npm install <package>@<fixed-version>

# Verify no regressions
npm run build
npm run preview
```

## Verification
- `npm audit` → 0 vulnerabilities (or only dev deps)
- `npm run build` passes
- Smoke test passes (see Deploy Runbook)

## Prevention
- Enable Dependabot (GitHub repo settings → Security → Dependabot alerts + auto PRs)
- Add `npm audit` to CI pipeline
- Schedule monthly dependency review

---

## Current Versions (2026-11-20)

| Package | Current | Latest | Status |
|---------|---------|--------|--------|
| `alpinejs` | 3.14.1 | 3.14.x | ✅ Latest minor |
| `chart.js` | 4.4.7 | 4.4.x | ✅ Latest minor |
| `papaparse` | 5.5.2 | 5.5.x | ✅ Latest minor |
| `vite` | 8.3.8 | 8.3.x | ✅ Latest minor |

---

## Related
- [Configuration](configuration.md#packagejson---project-metadata)
- [Tech Debt TD-013](03-development/tech-debt-register.md#td-013-no-dependency-update-automation)
- [Workflow](03-development/workflow.md#dependency-management)