---
title: CETPrep — Authentication & Authorization (As-Built)
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [security, engineers, auditors]
source_of_truth: true
---

# CETPrep — Authentication & Authorization

> **No authentication system exists**. No users, no sessions, no tokens, no roles.
> This documents the explicit absence and its implications.

---

## Identity Model

| Concept | Implementation |
|---------|----------------|
| **User Identity** | None — anonymous by default |
| **Session** | None — stateless |
| **Authentication** | None — no login, no credentials |
| **Authorization** | None — all features public |
| **Multi-tenancy** | None — single tenant (user's browser) |
| **Account Linking** | None |

---

## Access Control Matrix

| Feature | Auth Required | AuthZ Check | Notes |
|---------|---------------|-------------|-------|
| Dashboard | No | — | Public |
| Create Test | No | — | Public |
| My Tests | No | — | Shows all localStorage tests |
| Samples | No | — | Public |
| Import | No | — | Public (GitHub rate limited) |
| Attempt Test | No | — | Opens test.html |
| Exam Interface | No | — | Public |
| Submit Exam | No | — | Saves to localStorage |
| View History | No | — | Shows all localStorage attempts |
| Theme Toggle | No | — | Persists to localStorage |

---

## Data Isolation

**Per-Browser Isolation Only**: Each browser profile = separate data silo.

| Mechanism | Scope |
|-----------|-------|
| `localStorage` | Origin-bound (`https://domain/`) |
| No cross-device sync | By design |
| No account recovery | By design |

**Implication**: User clears browser data → **all data lost permanently**.

---

## Session / Token Lifecycle

**Not Applicable** — no sessions, no tokens.

---

## Privilege Escalation Paths

| Path | Possible? | Mitigation |
|------|-----------|------------|
| User → Admin | No admin role | N/A |
| Anonymous → Authenticated | No auth | N/A |
| Cross-user data access | No (per-browser) | N/A |
| XSS → Data Access | Yes (TD-005) | CSP, sanitization |

---

## Audit Trail

| Event | Logged | Where |
|-------|--------|-------|
| Test created | No | — |
| Test imported | No | — |
| Exam attempted | No | — |
| Exam submitted | No | — |
| Data deleted | No | — |
| Theme changed | No | — |

**No audit capability exists**.

---

## Compliance Implications

| Regulation | Requirement | Status | Gap |
|------------|-------------|--------|-----|
| GDPR | Right to access | ❌ | No export all data |
| GDPR | Right to erasure | ❌ | No delete all data UI |
| GDPR | Data portability | ❌ | CSV per attempt only |
| CCPA | Do not sell | ✅ | No data selling |
| SOC2 | Access control | ❌ | No auth |
| HIPAA | PHI protection | N/A | No health data |

---

## Future Auth Considerations (If Needed)

### Option 1: Local-First with Cloud Sync
- Add optional auth (email/password or OAuth)
- Sync localStorage to backend
- Conflict resolution (last-write-wins or CRDT)

### Option 2: Shared Tests (Multi-user)
- Backend for test sharing
- Public/private test visibility
- Attempt leaderboards

### Option 3: Institutional (School/Coaching)
- Admin creates tests
- Students join via code
- Centralized results

**All require**: Backend, database, auth system — major architecture change.

---

## Related Documents

- [Threat Model](threat-model.md) — STRIDE analysis
- [Data Classification](data-classification.md) — Asset tiers
- [Known Limitations](06-support/known-limitations.md) — No auth limitations
- [Tech Debt](03-development/tech-debt-register.md) — TD-018 (accessibility), TD-005 (XSS)