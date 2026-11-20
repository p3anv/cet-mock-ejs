---
title: CETPrep — External Integrations (As-Built)
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [engineers, security, architects, integrators]
source_of_truth: true
---

# CETPrep — External Integrations

> All external dependencies as shipped in v1.0.0. No other integrations exist.

---

## Integration Inventory

| # | Integration | Purpose | Status |
|---|-------------|---------|--------|
| 1 | **GitHub API** (`api.github.com`) | List test files in `p3anv/mock-app-data` repo folders | Active |
| 2 | **GitHub Raw** (`raw.githubusercontent.com`) | Fetch raw JSON content for selected test files | Active |
| 3 | **CDN (npm/esm.sh)** | Serve Alpine.js, Chart.js, PapaParse as ES modules (dev + build) | Active |
| 4 | **Browser localStorage** | Persistent storage for tests, attempts, theme | Active (built-in) |
| 5 | **Browser APIs** | `fetch`, `Clipboard`, `crypto.randomUUID`, `Canvas`, `URL.createObjectURL` | Active (built-in) |

---

## 1. GitHub API — `api.github.com`

| Attribute | Detail |
|-----------|--------|
| **Purpose** | List `.json` files in each folder (`reading`, `vocab`, `di`, `lr`) of `p3anv/mock-app-data` |
| **Protocol** | HTTPS REST (GitHub API v3) |
| **Endpoints Used** | `GET /repos/p3anv/mock-app-data/contents/{folder}` |
| **Authentication** | **None** — unauthenticated requests (60 req/hr rate limit) |
| **Request Headers** | `Accept: application/vnd.github.v3+json` (default) |
| **Response Format** | JSON array of file objects: `{name, type, path, size, download_url, ...}` |
| **Client Code** | `main.js:430-498` (`loadFolderTests`, `loadAllFolders`, `refreshAllFolders`) |
| **Constants** | `GITHUB_API_BASE = 'https://api.github.com/repos/p3anv/mock-app-data/contents'` |
| **SLA / Reliability** | Best-effort; GitHub status page; no contractual SLA |
| **Rate Limit** | 60 requests/hour per IP (unauthenticated) |
| **Failure Behavior** | Toast error: `Failed to load {folder} tests: {error.message}`; folder state shows error; user can retry via reload button |
| **Retry Logic** | None — manual retry via folder reload button only |
| **Caching** | Alpine state `folderTests[folderId].loaded` prevents re-fetch; `lastSyncTime` displayed |
| **Data Sensitivity** | Public repository — no sensitive data |
| **Compliance** | GitHub Terms of Service; no personal data sent |

### Error Handling (As-Built)

```javascript
// main.js:493-497
catch (error) {
    folderState.error = error.message;
    folderState.loading = false;
    showToast(`Failed to load ${folderId} tests: ${error.message}`, 'error');
}
```

### Known Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Rate limit exceeded | Medium (heavy import usage) | Import unavailable for ~1 hour | None implemented |
| Repository deleted/moved | Low | Import permanently broken | Fallback: manual JSON paste |
| CORS policy change | Low | Fetch fails | GitHub Raw supports CORS |
| API v3 deprecation | Low (long-term) | List endpoints stop working | Monitor GitHub developer blog |

---

## 2. GitHub Raw — `raw.githubusercontent.com`

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Fetch raw JSON content for a specific test file |
| **Protocol** | HTTPS GET |
| **Endpoints Used** | `GET /p3anv/mock-app-data/main/{folder}/{file}.json` |
| **Authentication** | None |
| **Response Format** | JSON array of question objects (direct file content) |
| **Client Code** | `main.js:475-481` (question count), `main.js:580-585` (import single), `main.js:655-659` (bulk import) |
| **Constants** | `GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/p3anv/mock-app-data/main'` |
| **SLA / Reliability** | Best-effort; CDN-backed; high availability |
| **Failure Behavior** | Toast error: `Import failed: {error.message}`; import modal shows error |
| **Retry Logic** | None |
| **Caching** | Browser HTTP cache (standard headers) |
| **Data Sensitivity** | Public test content only |

---

## 3. CDN — Vendor Libraries (Vite Bundled)

| Library | Version | Source | Usage |
|---------|---------|--------|-------|
| **Alpine.js** | 3.14.1 | npm → Vite bundle | Reactivity: `x-data`, `x-show`, `x-for`, `x-model`, `@click` |
| **Chart.js** | 4.4.7 | npm → Vite bundle | Bar, Line, Pie charts in exam interface |
| **PapaParse** | 5.5.2 | npm → Vite bundle | CSV generation (`unparse`) for results export |

| Attribute | Detail |
|-----------|--------|
| **Delivery** | Bundled into `dist/assets/*.js` by Vite — **self-contained in production** |
| **Dev Mode** | Served via Vite dev server from `node_modules` |
| **Integrity/Checksum** | Not pinned (package-lock.json provides version lock) |
| **License** | Alpine.js (MIT), Chart.js (MIT), PapaParse (MIT) |
| **Vulnerability Scanning** | `npm audit` recommended pre-deploy |
| **Update Policy** | Manual — update `package.json`, run `npm install`, rebuild |

---

## 4. Browser localStorage — Built-in Persistence

| Attribute | Detail |
|-----------|--------|
| **Purpose** | All application state persistence (tests, attempts, theme) |
| **API** | `localStorage.getItem`, `setItem`, `removeItem` (synchronous) |
| **Keys** | `cet_mock_tests_v3`, `cet_test_attempts`, `cetprep-theme` |
| **Quota** | 5–10 MB per origin (browser-dependent) |
| **Client Code** | `storage.js` (all access centralized) |
| **Failure Mode** | `QuotaExceededError` caught silently → returns `[]` / no-op |
| **Backup/Restore** | None automated; CSV export is manual backup |
| **Migration** | Key names immutable per PRD; schema version in key suffix (`_v3`) |

---

## 5. Browser APIs — Built-in Capabilities

| API | Usage | Location |
|-----|-------|----------|
| `fetch` | GitHub API/Raw requests | `main.js` |
| `navigator.clipboard.writeText` | Copy JSON samples | `main.js:406` |
| `crypto.randomUUID` | Test ID generation (fallback to Date+random) | `storage.js:46` |
| `CanvasRenderingContext2D` | Chart.js rendering | `charts.js` via Chart.js |
| `URL.createObjectURL` / `revokeObjectURL` | CSV blob download | `csv.js:18-26` |
| `FileReader` | JSON file upload | `main.js:312-324` |
| `localStorage` event | Theme sync across tabs (not implemented) | — |
| `beforeunload` | Warn on unsubmit test close | `test.js:215-222` |
| `keydown` / `keyup` | Keyboard shortcuts | `test.js:70-150` |

---

## Integration Architecture Diagram

```mermaid
flowchart LR
    subgraph Browser["Browser (User Device)"]
        CETPrep[CETPrep App]
        LS[(localStorage)]
        Clipboard[Clipboard API]
        Canvas[Canvas API]
        Crypto[Crypto API]
    end

    subgraph GitHub["GitHub (p3anv/mock-app-data)"]
        GH_API[GitHub API\napi.github.com]
        GH_RAW[GitHub Raw\nraw.githubusercontent.com]
    end

    subgraph CDN["CDN (npm/esm.sh)"]
        VENDOR[Alpine.js, Chart.js, PapaParse]
    end

    CETPrep --> LS
    CETPrep --> Clipboard
    CETPrep --> Canvas
    CETPrep --> Crypto
    CETPrep -.->|HTTPS REST| GH_API
    CETPrep -.->|HTTPS GET| GH_RAW
    CETPrep -.->|HTTPS (dev only)| VENDOR
    CETPrep -.->|HTTPS (build)| VENDOR
```

---

## Security Considerations

| Integration | Risk | Mitigation |
|-------------|------|------------|
| GitHub API | No auth — public repo only | No sensitive data exchanged |
| GitHub Raw | Content injection if repo compromised | JSON parsed via `response.json()` (safe); no `eval` |
| CDN | Supply chain attack | `package-lock.json` pins versions; build bundles vendors |
| localStorage | XSS → data theft | No user input stored unescaped; `escapeHtml` used in UI |
| Clipboard | Silent write | User-initiated only (Copy button) |

---

## Operational Notes

- **No secrets** — no API keys, tokens, or credentials in code or config
- **No environment variables** — all configuration in code constants
- **No backend services** — fully static deployment
- **Monitoring** — None; failures surface as user-visible toasts only
- **Debugging** — Open DevTools → Network tab for GitHub calls; Console for `localStorage` errors

---

## Related Documents

- [Architecture](architecture.md) — C4 diagrams, module boundaries
- [System Context](00-overview/system-context.md) — C4 Level 1
- [Data Model](data-model.md) — Entities stored in localStorage
- [Supply Chain](05-security/supply-chain.md) — Dependency licenses, vulnerabilities
- [Threat Model](05-security/threat-model.md) — STRIDE analysis