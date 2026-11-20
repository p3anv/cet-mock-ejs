---
title: CETPrep — Supply Chain Security (As-Built)
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [security, engineers, auditors]
source_of_truth: true
---

# CETPrep — Supply Chain Security

> Analysis of dependency risk, SBOM, and known vulnerabilities. No automated scanning configured.

---

## Dependency Inventory (Production)

| Package | Version | License | Purpose | Risk |
|---------|---------|---------|---------|------|
| `alpinejs` | 3.14.1 | MIT | Reactive UI framework | Low (mature, widely used) |
| `chart.js` | 4.4.7 | MIT | Chart rendering | Low (mature, widely used) |
| `papaparse` | 5.5.2 | MIT | CSV generation | Low (mature, widely used) |

**Total production deps**: 3 (minimal surface)

---

## Dependency Inventory (Development)

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| `vite` | 8.3.8 | MIT | Build tool / dev server |
| `@vitejs/plugin-legacy` | (not used) | — | — |
| `esbuild` | (transitive) | MIT | Bundler (via Vite) |

**Total dev deps**: 1 direct (Vite pulls ~200 transitive)

---

## SBOM (Software Bill of Materials)

### Generated via `npm sbom` (Proposed)

```bash
# Install sbom tool
npm install -g @cyclonedx/bom

# Generate
npx @cyclonedx/bom . -o sbom.json
```

### Current (Manual Snapshot - 2026-11-20)

```json
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "serialNumber": "urn:uuid:cetprep-2026-11-20",
  "version": 1,
  "metadata": {
    "timestamp": "2026-11-20T00:00:00Z",
    "tools": [{"name": "manual", "version": "1.0"}],
    "component": {
      "type": "application",
      "name": "cet-prep",
      "version": "1.0.0"
    }
  },
  "components": [
    {"name": "alpinejs", "version": "3.14.1", "license": "MIT", "purl": "pkg:npm/alpinejs@3.14.1"},
    {"name": "chart.js", "version": "4.4.7", "license": "MIT", "purl": "pkg:npm/chart.js@4.4.7"},
    {"name": "papaparse", "version": "5.5.2", "license": "MIT", "purl": "pkg:npm/papaparse@5.5.2"},
    {"name": "vite", "version": "8.3.8", "license": "MIT", "purl": "pkg:npm/vite@8.3.8"}
  ],
  "dependencies": [
    {"ref": "pkg:npm/cet-prep@1.0.0", "dependsOn": [
      "pkg:npm/alpinejs@3.14.1",
      "pkg:npm/chart.js@4.4.7",
      "pkg:npm/papaparse@5.5.2"
    ]},
    {"ref": "pkg:npm/cet-prep@1.0.0", "dependsOn": ["pkg:npm/vite@8.3.8"]}
  ]
}
```

---

## Vulnerability Scan (Current)

```bash
# Run manually
npm audit
# → 0 vulnerabilities found (2026-11-20)

# With details
npm audit --json
```

**Result**: Clean as of 2026-11-20.

---

## License Compliance

| Package | License | SPDX | Compatible? | Notes |
|---------|---------|------|-------------|-------|
| `alpinejs` | MIT | MIT | ✅ | Permissive |
| `chart.js` | MIT | MIT | ✅ | Permissive |
| `papaparse` | MIT | MIT | ✅ | Permissive |
| `vite` | MIT | MIT | ✅ | Permissive (dev only) |

**All MIT** — no copyleft, no attribution required in binary (but good practice).

---

## Known Vulnerabilities (Historical)

| Package | CVE | Version Fixed | Current Status |
|---------|-----|---------------|----------------|
| `alpinejs` | None known | — | ✅ 3.14.1 clean |
| `chart.js` | None known | — | ✅ 4.4.7 clean |
| `papaparse` | None known | — | ✅ 5.5.2 clean |
| `vite` | None known | — | ✅ 8.3.8 clean |

**Source**: `npm audit`, GitHub Advisories, NVD (checked 2026-11-20).

---

## Supply Chain Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Typosquatting** | Low | Critical | Lockfile (`package-lock.json`) commits exact versions |
| **Dependency Confusion** | Low | Critical | No private registry; all public npm |
| **Malicious Maintainer** | Very Low | Critical | 3 deps only; all mature projects |
| **Abandoned Package** | Low | Medium | All active (Alpine 2024, Chart.js 2024, PapaParse 2023) |
| **Transitive Vulnerability** | Medium | High | Vite has many transitive; `npm audit` catches |
| **Build Compromise** | Very Low | Critical | Vite from npm; CI runs in clean env |

---

## Proposed Protections

### 1. Enable Dependabot
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

### 2. Enable GitHub Dependency Graph + Alerts
- Repo Settings → Security → Dependency graph ✅
- Repo Settings → Security → Dependabot alerts ✅

### 3. Add `npm audit` to CI
```yaml
# .github/workflows/ci.yml
- run: npm audit --audit-level=high
```

### 4. Pin Transitive Deps (Optional)
```bash
# npm ci uses package-lock.json (already committed)
# For stricter: npm shrinkwrap (not needed)
```

### 5. SRI for CDN (If Ever Used)
```html
<!-- Not needed — Vite bundles all deps -->
```

---

## Build Integrity

### Reproducible Builds
```bash
# Same commit → same dist/ (mostly)
npm ci
npm run build
# → Hashes depend on content; Vite 8.x is reproducible
```

### Verification
```bash
# Compare two builds
npm run build
cp -r dist dist-1
npm run build
diff -r dist-1 dist
# → Only timestamps differ (if any)
```

---

## External Service Dependencies

| Service | Purpose | Risk | Fallback |
|---------|---------|------|----------|
| **GitHub API** | Test import listing | Rate limit, downtime | Cache in localStorage |
| **GitHub Raw** | Test content fetch | Downtime, repo deletion | Mirror data locally |
| **Static Host** | Serve app | Downtime | Multi-host deploy |
| **npm Registry** | Dependency install | Downtime | Lockfile + offline cache |

---

## Related Documents

- [Configuration](04-operations/configuration.md) — Dependency versions
- [Deployment](04-operations/deployment.md) — Build process
- [Secrets & Keys](secrets-and-keys.md) — NPM token
- [Threat Model](threat-model.md) — T20 Supply Chain
- [Tech Debt TD-013](03-development/tech-debt-register.md#td-013-no-dependency-update-automation)
- [Compliance Mapping](compliance-mapping.md) — Supply chain controls