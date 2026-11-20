# Contributing to CETPrep

> CETPrep is a browser-based CET mock test platform. This guide covers the contribution workflow for maintainers.

---

## Quick Start

```bash
# 1. Fork & clone
git clone https://github.com/p3anv/cet-mock-ejs.git
cd cet-mock-ejs

# 2. Install
npm install

# 3. Develop
npm run dev
# → Opens http://localhost:5500

# 4. Build check
npm run build

# 5. Submit PR
git checkout -b my-feature
# ... make changes ...
git commit -m "feat: description"
git push origin my-feature
# → Open PR to main
```

---

## Development Workflow

### Branching
- **Main branch**: `main` (protected, requires PR)
- **Feature branches**: `feat/description`, `fix/description`, `chore/description`
- **No direct commits to main** — all changes via PR

### Commit Messages
Follow Conventional Commits:
```
feat: add new chart type
fix: handle localStorage quota error
chore: update dependencies
docs: update architecture diagram
```

### PR Requirements
- [ ] `npm run build` passes
- [ ] `npm run preview` verified manually
- [ ] No console errors in browser
- [ ] Updated documentation (if user-facing change)
- [ ] Self-review completed

### Code Review
- All PRs require 1+ approval
- CI checks must pass (when implemented)
- No merge without review

---

## Code Standards

### JavaScript
- ES2022 modules (`import`/`export`)
- No TypeScript (currently)
- Alpine.js components via `Alpine.data()`
- Pure functions for utilities (`storage.js`, `charts.js`, `validate.js`, `csv.js`)

### CSS
- **FROZEN**: Only `[x-cloak] { display: none !important; }` at line 1 permitted
- Design system via CSS variables (`--bg`, `--accent`, etc.)
- BEM-ish class naming (`.block__element--modifier`)
- Responsive via media queries + CSS Grid/Flex

### HTML
- Alpine directives for interactivity (`x-data`, `x-show`, `x-for`, `@click`)
- Hash routing for SPA navigation
- Semantic HTML5

---

## Testing (Current State)

**No automated test suite exists.** Manual verification required:

```bash
# Smoke test checklist
npm run dev
# □ Dashboard loads
# □ Theme toggle works
# □ All 5 nav pages load
# □ Create Test: valid JSON saves
# □ Import: folders load
# □ Attempt test → exam opens
# □ Exam: timer, navigator, keyboard, charts, submit, CSV
# □ No console errors
```

---

## Architecture Overview

```
index.html (5 pages) → main.js (Alpine 'app')
test.html (exam)     → test.js (Alpine 'testApp')
                     → storage.js (localStorage)
                     → charts.js (Chart.js + parser)
                     → validate.js (JSON validation)
                     → csv.js (PapaParse)
                     → ui.js (modals/toasts)
```

See [Architecture](docs/01-architecture/architecture.md) and [Codebase Tour](docs/03-development/codebase-tour.md).

---

## Key Constraints

| Constraint | Details |
|------------|---------|
| **No backend** | Pure static site; all data in localStorage |
| **CSS frozen** | Visual changes require exception process |
| **GitHub API** | 60/hr unauthenticated; token via `VITE_GITHUB_TOKEN` |
| **localStorage quota** | ~5-10MB; silent fail on exceed (TD-002) |
| **No tests** | All verification manual (TD-001) |

---

## Priority Areas for Contribution

1. **Tests** — Vitest + Playwright (TD-001)
2. **Quota handling** — Check + toast before write (TD-002)
3. **GitHub token support** — `VITE_GITHUB_TOKEN` + backoff (TD-003)
4. **CI/CD** — GitHub Actions build + deploy (TD-019)
5. **Accessibility** — WCAG 2.1 AA (TD-018)
6. **Error boundary** — Global error tracking (TD-016)

See [Tech Debt Register](docs/03-development/tech-debt-register.md) for full list.

---

## Documentation

All documentation in `docs/`:
- [Overview](docs/00-overview/overview.md)
- [Architecture](docs/01-architecture/architecture.md)
- [API](docs/02-api/)
- [Development](docs/03-development/)
- [Operations](docs/04-operations/)
- [Security](docs/05-security/)
- [Support](docs/06-support/)
- [History](docs/07-history/)

Update relevant docs with any user-facing change.

---

## Security

- No secrets in code (see [SECURITY.md](SECURITY.md))
- Report vulnerabilities privately (see SECURITY.md)
- Dependencies scanned via `npm audit`

---

## License

MIT License — see `LICENSE` file.

---

## Questions?

- Check [FAQ](docs/06-support/faq.md)
- Check [Troubleshooting](docs/06-support/troubleshooting.md)
- Open GitHub Issue for bugs/features
- Open GitHub Discussion for questions