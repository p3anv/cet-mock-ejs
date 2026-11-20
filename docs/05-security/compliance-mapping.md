---
title: CETPrep — Compliance Mapping (As-Built)
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [security, auditors, legal, leadership]
source_of_truth: true
---

# CETPrep — Compliance Mapping

> Mapping of regulatory frameworks to current controls. **No formal compliance program exists** — this is a gap analysis.

---

## Framework Coverage Summary

| Framework | Applicable? | Current Coverage | Status |
|-----------|-------------|------------------|--------|
| **GDPR** | Yes (EU users possible) | ~20% | Major gaps |
| **CCPA/CPRA** | Yes (CA users possible) | ~30% | Major gaps |
| **SOC 2 Type II** | No (no backend) | N/A | Not applicable |
| **ISO 27001** | No (no ISMS) | ~10% | Not certified |
| **PCI DSS** | No (no payments) | N/A | Not applicable |
| **HIPAA** | No (no PHI) | N/A | Not applicable |
| **FERPA** | No (no student records) | N/A | Not applicable |
| **WCAG 2.1 AA** | Yes (public web) | ~40% | Accessibility gaps |

---

## GDPR Article Mapping

| Article | Requirement | Current Control | Gap | Priority |
|---------|-------------|-----------------|-----|----------|
| **Art 5** | Lawfulness, fairness, transparency | No privacy notice | No notice, no lawful basis doc | High |
| **Art 6** | Lawful basis | None documented | No basis recorded | High |
| **Art 7** | Consent | No consent mechanism | No consent UI | High |
| **Art 12** | Transparent communication | No privacy policy | Missing | High |
| **Art 13/14** | Information at collection | None | Missing | High |
| **Art 15** | Right of access | Partial (DevTools) | No structured export | Medium |
| **Art 16** | Right to rectification | Yes (edit test) | — | ✅ |
| **Art 17** | Right to erasure | Yes (clear site data) | No "Delete All" UI | Medium |
| **Art 18** | Right to restriction | N/A | No processing beyond user | N/A |
| **Art 20** | Data portability | Partial (CSV per attempt) | No bulk JSON export | Medium |
| **Art 21** | Right to object | N/A | No automated processing | N/A |
| **Art 25** | Data protection by design | Local-first (good) | No DPIA | Medium |
| **Art 30** | Records of processing | None | No ROPA | High |
| **Art 32** | Security of processing | HTTPS, local-only | No CSP, no encryption | Medium |
| **Art 33** | Breach notification | No process | No detection, no 72hr process | High |
| **Art 35** | DPIA | Not done | Required for new tech | Medium |

**GDPR Verdict**: **Non-compliant** — missing privacy notice, lawful basis, consent, access/portability tooling, breach process.

---

## CCPA/CPRA Mapping

| Section | Requirement | Current Control | Gap |
|---------|-------------|-----------------|-----|
| **1798.100** | Right to know | Partial (localStorage view) | No structured disclosure |
| **1798.105** | Right to delete | Yes (clear site data) | No verified request process |
| **1798.110** | Right to access | Partial | No request portal |
| **1798.120** | Right to opt-out of sale | ✅ (no sale) | — |
| **1798.130** | Non-discrimination | ✅ | — |
| **1798.150** | Private right of action | Risk exists | No security controls for breach |

**CCPA Verdict**: **Partial** — no sale is compliant; access/delete rights not operationalized.

---

## WCAG 2.1 AA Mapping

| Criterion | Requirement | Current Status | Gap |
|-----------|-------------|----------------|-----|
| **1.1.1** | Non-text content | Charts have titles; no alt | Canvas charts need text fallback |
| **1.3.1** | Info and relationships | Semantic HTML mostly | Navigator grid needs ARIA |
| **1.4.3** | Contrast (minimum) | Custom colors; unverified | Need contrast audit |
| **1.4.4** | Resize text | Rem units; works | — |
| **2.1.1** | Keyboard | 20+ shortcuts (good) | Focus indicators weak |
| **2.1.2** | No keyboard trap | Modals trap? | Need focus trap in modals |
| **2.4.3** | Focus order | Logical mostly | Charts in paragraph break order |
| **2.4.7** | Focus visible | Default browser | Custom focus styles missing |
| **3.1.1** | Language of page | `lang="en"` missing | Add to HTML |
| **3.2.1** | On focus | No unexpected changes | — |
| **3.3.2** | Labels or instructions | Inputs have labels | — |
| **4.1.2** | Name, role, value | Custom components (Alpine) | Navigator buttons need ARIA |

**WCAG Verdict**: **Fails AA** — missing landmarks, focus management, contrast verification, alt text for charts.

---

## SOC 2 (Not Applicable - Reference)

| Trust Criterion | Relevance | Note |
|-----------------|-----------|------|
| **Security** | Partial | Client-side only; no server controls |
| **Availability** | Host-dependent | Static host SLA |
| **Confidentiality** | N/A | No confidential data |
| **Processing Integrity** | N/A | No server processing |
| **Privacy** | Partial | GDPR gaps apply |

---

## ISO 27001 Annex A (Sampling)

| Control | Status | Gap |
|---------|--------|-----|
| **A.5.1** | Policies | None documented |
| **A.6.1** | Roles | None defined |
| **A.8.1** | Asset inventory | [Data Classification](data-classification.md) exists |
| **A.8.2** | Info classification | [Data Classification](data-classification.md) done |
| **A.9.1** | Access control | None (no auth) |
| **A.12.1** | Operational procedures | [Runbooks](04-operations/runbooks/) partial |
| **A.12.6** | Vulnerability mgmt | `npm audit` manual only |
| **A.14.2** | Secure development | No SDLC, no code review |
| **A.16.1** | Incident mgmt | [Incident Response](04-operations/incident-response.md) draft |
| **A.18.1** | Compliance | This document |

---

## Current Control Inventory

| Control | Implemented? | Evidence |
|---------|--------------|----------|
| HTTPS Enforcement | ✅ | Static host default |
| HSTS | ✅ | Host default |
| CSP Header | ❌ | TD-011 |
| Subresource Integrity | ❌ | Not needed (bundled) |
| Dependency Scanning | ❌ | Manual `npm audit` only |
| Secret Scanning | ❌ | Not enabled |
| Code Review | ❌ | Single maintainer |
| CI/CD Pipeline | ❌ | Manual deploy |
| Vulnerability Management | ❌ | Ad-hoc |
| Incident Response Plan | Draft | [Incident Response](04-operations/incident-response.md) |
| Business Continuity | Draft | [Backup & DR](04-operations/backup-and-dr.md) |
| Data Classification | ✅ | [Data Classification](data-classification.md) |
| Encryption at Rest | Platform | Browser/localStorage |
| Encryption in Transit | ✅ | TLS 1.2+ |
| Access Logging | ❌ | No backend |
| Audit Trail | ❌ | No audit log |
| Privacy Notice | ❌ | Missing |
| Consent Management | ❌ | Missing |
| Data Subject Rights | Partial | Local UI only |
| Breach Notification | ❌ | No process |
| Accessibility (WCAG) | Partial | Known gaps |
| Secure Headers | Partial | Missing CSP, Referrer-Policy |

---

## Remediation Roadmap

| Quarter | Focus | Key Deliverables |
|---------|-------|------------------|
| **Q1** | Privacy Foundation | Privacy notice, lawful basis, consent banner, ROPA |
| **Q2** | Data Rights | Export All / Delete All UI, structured access |
| **Q3** | Security Hardening | CSP, Dependabot, secret scanning, error tracking |
| **Q4** | Accessibility | WCAG 2.1 AA audit + fixes |
| **Ongoing** | Operations | CI/CD, monitoring, incident process maturation |

---

## Attestation

> This mapping reflects the as-built state as of 2026-11-20. No third-party assessment has been performed. Gaps are self-identified.

---

## Related Documents

- [Data Classification](data-classification.md) — Asset inventory
- [Threat Model](threat-model.md) — Risk assessment
- [Authn/Authz](authn-authz.md) — Access control gaps
- [Supply Chain](supply-chain.md) — Dependency risk
- [Incident Response](04-operations/incident-response.md) — Breach process
- [Backup & DR](04-operations/backup-and-dr.md) — Continuity
- [Tech Debt](03-development/tech-debt-register.md) — Control gaps as debt