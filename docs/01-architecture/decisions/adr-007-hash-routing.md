---
title: ADR-007: Hash-Based SPA Routing in index.html
status: accepted
date: 2026-11-19
deciders: [@pranav]
---

## Context

`index.html` needs multiple "pages" (Dashboard, Create Test, My Tests, JSON Samples, Import) without a backend router. Options:
- **Hash routing** (`#dashboard`, `#create`, etc.) — no server config needed, works on static hosts
- **History API** (`/dashboard`, `/create`) — requires server fallback to `index.html`
- **Query params** (`?page=dashboard`) — less clean, no browser history

PRD requires deployment to static hosts (Cloudflare Pages, Netlify) with zero server config.

## Decision

Use **`window.location.hash` for client-side routing**:

- Routes: `#dashboard`, `#create`, `#tests`, `#samples`, `#import`
- Default: `#dashboard` (empty hash redirects)
- Navigation: `<a href="#create" @click.prevent="goTo('create')">`
- State sync: `hashchange` event listener updates Alpine state
- URL sharing: Direct links to `#tests` work

Implementation in `main.js:251-258`:
```javascript
loadFromHash() {
    const hash = window.location.hash.replace('#', '');
    if (['dashboard', 'create', 'tests', 'samples', 'import'].includes(hash)) {
        this.showPage(hash);
    } else {
        this.showPage('dashboard');
    }
}
```

## Consequences

### Positive
- Works on any static host (GitHub Pages, Netlify, Cloudflare, S3, nginx)
- No server-side routing config
- Browser back/forward buttons work
- Deep-linkable URLs
- Simple implementation (~20 lines)

### Negative
- Hash in URL (`#tests`) — less "clean" than path routing
- SEO irrelevant (app is private/behind login conceptually)
- Hash changes don't trigger full page reload (by design)

### Neutral
- `test.html` is separate entry point (not part of hash routing)
- `test.html?id=test_abc` uses query param for test ID

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **History API + `_redirects`** | Requires host-specific config (Netlify `_redirects`, Cloudflare `_routes`, Vercel `vercel.json`) |
| **Query params (`?page=tests`)** | No browser history; ugly URLs; same static host issue |
| **Single page, hide/show via JS only** | No deep linking; no back button; no shareable URLs |

## Evidence

- **Code**: `main.js:251-258` (`loadFromHash`), `main.js:260-278` (`showPage`), `main.js:280-282` (`goTo`)
- **HTML**: `index.html:32-76` — sidebar nav links with `@click.prevent="goTo('...')"`
- **Init**: `main.js:228-230` — `loadFromHash()` + `hashchange` listener
- **Vite**: `vite.config.js:11-14` — multi-page input (index.html + test.html separate)