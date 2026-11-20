---
title: ADR-005: GitHub Repo as Test Content Source
status: accepted
date: 2026-11-19
deciders: [@pranav]
---

## Context

Need a source of pre-built tests for users to import without manual JSON creation. Options considered:
- Bundle tests in app (increases bundle size, hard to update)
- Separate JSON files in `/public` (still bundled, version-locked)
- External API (cost, maintenance)
- **GitHub repository** — free hosting, version control, CDN raw access, public by default

## Decision

Use **`p3anv/mock-app-data` GitHub repository** as the test content source:

- **Structure**: 4 folders (`reading`, `vocab`, `di`, `lr`) each containing `.json` test files
- **Listing**: GitHub API v3 `GET /repos/p3anv/mock-app-data/contents/{folder}`
- **Fetching**: GitHub Raw `GET /raw.githubusercontent.com/p3anv/mock-app-data/main/{folder}/{file}.json`
- **Authentication**: None (public repo, unauthenticated, 60 req/hr limit)
- **Category mapping**: Hardcoded in `main.js:591-596`

## Consequences

### Positive
- Zero hosting cost
- Content updates via Git commit (no app deploy needed)
- Version history via Git
- CDN-backed raw delivery (fast, reliable)
- Public — no auth complexity

### Negative
- **Rate limit**: 60 req/hr unauthenticated — may block heavy import usage
- **External dependency**: Repo could be deleted/moved
- **No SLA**: Best-effort only
- **CORS**: Relies on GitHub's permissive CORS headers
- **Single point of failure**: If GitHub down, import unavailable

### Neutral
- Folder structure hardcoded — new folders require code change
- Question count fetched per file (extra request) for display

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| **Bundle tests in `/public`** | Increases bundle size; updates require deploy; no version history |
| **Separate CMS (Contentful, Sanity)** | Cost; overkill; external dependency anyway |
| **GitHub Gist** | No folder structure; 1 MB limit; harder to organize |
| **NPM package** | Publish step; version locking; same GitHub dependency |

## Evidence

- **Code**: `main.js:6-14` — `GITHUB_RAW_BASE`, `GITHUB_API_BASE`, `TEST_FOLDERS`
- **Fetch logic**: `main.js:430-498` — `loadFolderTests`, `loadAllFolders`, `refreshAllFolders`
- **Import**: `main.js:580-622` — `importTest`, `importSelectedTests`
- **Category map**: `main.js:591-596` — `folderToCategory` object
- **UI**: `index.html:478-698` — Import page two-pane layout