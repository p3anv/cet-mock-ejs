---
title: CETPrep Documentation Index
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [engineers, sre, security, architects, integrators, auditors, maintainers]
source_of_truth: true
---

# CETPrep Documentation

> **As-built documentation** for the CET Mock Test Platform — a browser-based, zero-backend exam preparation tool. This documentation reflects the system as shipped (v1.0.0, 2026-11-20), not as originally designed.

---

## Quick Start by Role

| Role | Start Here | Then Read |
|------|------------|-----------|
| **New Maintainer** | [Setup Guide](03-development/setup.md) | [Codebase Tour](03-development/codebase-tour.md) → [Architecture](01-architecture/architecture.md) |
| **SRE / On-call** | [Deployment](04-operations/deployment.md) | [Runbooks](04-operations/runbooks/) → [Observability](04-operations/observability.md) |
| **Security Reviewer** | [Threat Model](05-security/threat-model.md) | [Authn/Authz](05-security/authn-authz.md) → [Supply Chain](05-security/supply-chain.md) |
| **Auditor** | [Completion Record](00-overview/completion-record.md) | [Data Model](01-architecture/data-model.md) → [Compliance](05-security/compliance-mapping.md) |
| **Integrator** | [System Context](00-overview/system-context.md) | [Data Model](01-architecture/data-model.md) → [Known Limitations](06-support/known-limitations.md) |

---

## Document Map

### 00 — Overview
| Doc | Description |
|-----|-------------|
| [overview.md](00-overview/overview.md) | What this system does, business context, scope, non-goals |
| [glossary.md](00-overview/glossary.md) | Domain terms, acronyms, internal jargon |
| [system-context.md](00-overview/system-context.md) | C4 Level 1: actors, external systems (Mermaid) |
| [completion-record.md](00-overview/completion-record.md) | As-built acceptance summary: delivered, status, version, sign-off |

### 01 — Architecture (As-Built)
| Doc | Description |
|-----|-------------|
| [architecture.md](01-architecture/architecture.md) | C4 L2/L3, module boundaries, request/data flows, failure modes, scaling limits |
| [integrations.md](01-architecture/integrations.md) | External dependencies: GitHub API (purpose, protocol, auth, SLA, failure behavior) |
| [data-model.md](01-architecture/data-model.md) | Entities, relationships (Mermaid ERD), ownership, PII classification, retention, schema version |
| [decisions/](01-architecture/decisions/) | ADR template + backfilled ADRs reconstructed from git history |

### 02 — API & Interfaces (As-Shipped)
| Doc | Description |
|-----|-------------|
| [README.md](02-api/README.md) | Auth model (none), versioning (N/A), error format, internal module interfaces |
| [endpoints.md](02-api/endpoints.md) | Internal module interfaces (no REST API) |
| [events-and-webhooks.md](02-api/events-and-webhooks.md) | Async contracts: localStorage sync, keyboard shortcuts |
| [breaking-changes.md](02-api/breaking-changes.md) | JSON format changes, localStorage migrations, Alpine/Chart.js upgrades |

### 03 — Development (For Incoming Maintainer)
| Doc | Description |
|-----|-------------|
| [setup.md](03-development/setup.md) | Prerequisites, bootstrap, dev server, build, preview — **verified to work** |
| [codebase-tour.md](03-development/codebase-tour.md) | Module-by-module walkthrough, sharp edges, where logic lives |
| [conventions.md](03-development/conventions.md) | Code style, error handling, logging standards, CSS class usage |
| [testing.md](03-development/testing.md) | Test pyramid (manual only), how to run, fixtures, coverage (0%) |
| [workflow.md](03-development/workflow.md) | Branching, commit convention, PR/review, release & versioning |
| [tech-debt-register.md](03-development/tech-debt-register.md) | TODOs/FIXMEs, dead code, feature flags, workarounds |

### 04 — Operations (As-Deployed)
| Doc | Description |
|-----|-------------|
| [deployment.md](04-operations/deployment.md) | Environments, pipeline, redeploy, rollback |
| [configuration.md](04-operations/configuration.md) | Every config key: purpose, type, default, secret?, required? |
| [runbooks/](04-operations/runbooks/) | One runbook per critical operation |
| [observability.md](04-operations/observability.md) | Logs, metrics, traces, health checks, dashboards, alerts |
| [slo.md](04-operations/slo.md) | Historical SLIs/SLOs (N/A — not defined) |
| [backup-and-dr.md](04-operations/backup-and-dr.md) | Backup scope, cadence, restore procedure, RTO/RPO |
| [incident-response.md](04-operations/incident-response.md) | Severity matrix, escalation, comms templates |

### 05 — Security & Compliance (As-Built Audit)
| Doc | Description |
|-----|-------------|
| [threat-model.md](05-security/threat-model.md) | Assets, trust boundaries (Mermaid), STRIDE threats, mitigations |
| [authn-authz.md](05-security/authn-authz.md) | Identity model, roles/permissions, session/token lifecycle |
| [data-classification.md](05-security/data-classification.md) | Classification tiers, handling rules, PII/PHI inventory |
| [secrets-and-keys.md](05-security/secrets-and-keys.md) | Where secrets live, rotation policy, access control |
| [supply-chain.md](05-security/supply-chain.md) | Dependency scan, SBOM, license inventory, known vulns |
| [compliance-mapping.md](05-security/compliance-mapping.md) | Control mapping to "none" regime |

### 06 — Support & Handover
| Doc | Description |
|-----|-------------|
| [troubleshooting.md](06-support/troubleshooting.md) | Symptom → diagnosis → fix table from real error strings |
| [faq.md](06-support/faq.md) | Likely maintainer/integrator questions |
| [known-limitations.md](06-support/known-limitations.md) | Technical debt, scaling ceilings, out-of-scope behavior |
| [handover-checklist.md](06-support/handover-checklist.md) | Concrete handover runbook: access, credentials, dashboards, tribal knowledge |
| [sunset-and-decommission.md](06-support/sunset-and-decommission.md) | N/A — active project |

### 07 — Project History & Retrospective
| Doc | Description |
|-----|-------------|
| [changelog.md](07-history/changelog.md) | Reconstructed changelog from tags/commits, newest first |
| [timeline.md](07-history/timeline.md) | Dated milestone timeline: releases, pivots, incidents, team changes |
| [lessons-learned.md](07-history/lessons-learned.md) | Retrospective: what worked, what didn't, what next team should do differently |
| [tribal-knowledge.md](07-history/tribal-knowledge.md) | Gotchas, unwritten rules, why-X-is-weird notes |

---

## Maintenance Policy

- **Status**: Active development / recently completed migration (Vite + Alpine.js)
- **Update cadence**: Docs updated with each significant change; review quarterly
- **Source of truth**: This `docs/` directory — code comments are supplementary only
- **No marketing language**: Tables, bullet lists, and Mermaid diagrams over prose
- **Evidence-based**: Every claim traceable to file path, commit, or config in repo
- **Divergences documented**: Intent vs. as-built differences called out explicitly

---

## Related Documents
- [Overview](00-overview/overview.md) — Business context and scope
- [Completion Record](00-overview/completion-record.md) — As-built acceptance summary