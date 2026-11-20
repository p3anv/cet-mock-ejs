# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x (current) | ✅ |

## Reporting a Vulnerability

**Do not open a public issue for security vulnerabilities.**

Email: **security@[domain]** (replace with actual contact)

Or use GitHub Security Advisories (private reporting):
1. Go to repo → Security → Advisories → "Report a vulnerability"
2. Fill in details
3. Maintainer will respond within 48 hours

## Scope

CETPrep is a **pure client-side static site** with:
- No backend, no database, no authentication
- No server-side processing
- User data stored only in browser `localStorage`
- External dependency: GitHub API (public repo, read-only)

### In Scope
- XSS via imported test content (paragraph markup)
- XSS via `x-html` / `innerHTML` usage
- Supply chain (npm dependencies)
- localStorage data integrity
- GitHub API rate limit / availability

### Out of Scope
- Server infrastructure (none)
- Authentication/authorization (none)
- Payment processing (none)
- PII handling (none collected)

## Known Security Considerations

| Issue | Status | Tracking |
|-------|--------|----------|
| No CSP header | Open | TD-011 |
| `x-html` with dynamic SVG | Mitigated (trusted) | TD-005 |
| No referrerPolicy on GitHub fetch | Open | Easy fix |
| Silent localStorage quota failure | Open | TD-002 (Critical) |
| GitHub rate limit (60/hr) | Open | TD-003 (High) |
| No error boundary / tracking | Open | TD-016 |
| No dependency scanning automation | Open | TD-013 |

## Disclosure Timeline

- **Day 0**: Report received
- **Day 1-2**: Triage + confirm
- **Day 3-7**: Fix developed + tested
- **Day 7-14**: Deploy fix
- **Day 14+**: Public disclosure (if applicable)

## Safe Harbor

We support safe harbor for security researchers who:
- Make good faith effort to avoid privacy violations, data destruction, service interruption
- Only interact with own accounts/data
- Report vulnerabilities promptly
- Give reasonable time to fix before disclosure

## Contact

For security questions: **security@[domain]**

For general questions: GitHub Issues / Discussions