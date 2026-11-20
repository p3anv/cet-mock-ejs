---
title: CETPrep — Secrets & Keys Management (As-Built)
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [security, engineers, auditors]
source_of_truth: true
---

# CETPrep — Secrets & Keys Management

> **No secrets exist in the codebase**. No API keys, no tokens, no certificates, no encryption keys.
> This documents the explicit absence and what would be needed if added.

---

## Current Secret Inventory

| Secret Type | Present? | Location | Rotation |
|-------------|----------|----------|----------|
| **GitHub Token** | ❌ (planned: `VITE_GITHUB_TOKEN`) | — | — |
| **API Keys** | ❌ | — | — |
| **Database Credentials** | ❌ (no DB) | — | — |
| **JWT Signing Keys** | ❌ (no auth) | — | — |
| **TLS Certificates** | ❌ (host managed) | Static Host | Host managed |
| **Encryption Keys** | ❌ (no app encryption) | — | — |
| **Service Account Keys** | ❌ | — | — |
| **Webhook Secrets** | ❌ (no webhooks) | — | — |

---

## Secret Storage (If Added)

### Build-Time Secrets (Vite)

```bash
# .env (local, gitignored)
VITE_GITHUB_TOKEN=ghp_xxxxxxxxxxxx

# CI/CD (GitHub Actions, Netlify, Vercel, etc.)
# Set as encrypted environment variable
```

**Access in code**:
```javascript
// main.js
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || '';
```

**Rules**:
- Prefix with `VITE_` for Vite exposure
- Never commit `.env` files
- Use CI/CD secret store for production

### Runtime Secrets (Not Applicable)

No backend = no runtime secrets.

---

## Key Management

### TLS Certificates
- **Managed by**: Static host (Netlify/Vercel/Cloudflare/GitHub Pages)
- **Type**: Let's Encrypt / Cloudflare Universal SSL / Custom
- **Rotation**: Automatic (host managed)
- **Access**: None (host only)

### Subresource Integrity (Not Implemented)

```html
<!-- Proposed: Add SRI for CDN assets if any -->
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.1/dist/cdn.min.js"
        integrity="sha384-..."
        crossorigin="anonymous"></script>
```

**Current**: All deps bundled by Vite → no external script tags in production.

---

## Rotation Policy (When Secrets Exist)

| Secret | Rotation Frequency | Process |
|--------|-------------------|---------|
| GitHub Token | 90 days / on leak | Generate new → update CI → revoke old |
| TLS Cert | Auto (90 days) | Host managed |
| NPM Token | On publish / leak | `npm token revoke` + create new |

---

## Access Control

| Role | Secrets Access |
|------|----------------|
| **Maintainer** | CI/CD secret store, local `.env` |
| **CI/CD Pipeline** | Build-time secrets only |
| **Static Host** | TLS certs only |
| **Developers** | Local `.env` only (no prod) |

**Principle**: Least privilege — no human accesses production secrets directly.

---

## Leak Response

| Scenario | Response |
|----------|----------|
| GitHub Token in commit | 1. Revoke token immediately 2. Rotate 3. Check audit log 4. Force-push clean history |
| `.env` committed | 1. `git filter-repo` / BFG to purge 2. Rotate secret 3. Force-push |
| NPM Token leaked | 1. `npm token revoke` 2. Create new 3. Update CI |

---

## Audit Trail

| Action | Logged |
|--------|--------|
| Secret created | CI/CD provider audit log |
| Secret rotated | CI/CD provider audit log |
| Secret accessed (build) | CI/CD build log (masked) |
| Secret leaked | GitHub secret scanning alert |

**Enable**: GitHub Secret Scanning (repo settings → Security → Secret scanning).

---

## Related Documents

- [Configuration](04-operations/configuration.md#environment-variables-not-currently-used)
- [Deployment](04-operations/deployment.md#environment-variables-build-time)
- [Threat Model](threat-model.md) — T20 Supply Chain
- [Supply Chain](supply-chain.md) — Dependency secrets
- [Compliance Mapping](compliance-mapping.md) — Secret management controls