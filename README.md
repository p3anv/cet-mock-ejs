# CETPrep — Smart Practice Platform

A lightweight, browser-based mock test platform for focused exam preparation with custom question sets, embedded data visualizations, and performance tracking.

CETPrep is a frontend-first exam preparation application that lets you create custom mock tests from JSON question data, attempt tests with an exam-style interface, review detailed performance analytics, and import tests from a curated repository.

Built with vanilla JavaScript, Alpine.js, and Vite — no React, no build complexity, runs directly in the browser.

---

## Features

### Mock Test Creation

Create custom mock tests using structured JSON question data.

- Custom test name and category selection (Verbal Ability, Logical Reasoning, Quants, Misc)
- Paste JSON directly or upload `.json` files
- Real-time validation with descriptive error messages
- Supports embedded visualizations: bar charts, line graphs, pie charts, and tables
- Instant test creation with local persistence

### Exam-Style Test Interface

Take tests in a dedicated, distraction-free environment.

- Full-screen test layout with question navigator
- Multiple-choice questions with radio selection
- Mark questions for review
- Real-time timer (elapsed time)
- Question navigation grid showing answered/marked/current status
- Theme toggle (dark/light) during test

### Data Visualizations in Questions

Embed charts and tables directly in question paragraphs using special markers:

```
[BARGRAPH]
Quarterly Sales 2024
Q1: 120
Q2: 85
Q3: 200

[LINEGRAPH]
Monthly Traffic
Jan: 1200
Feb: 1900
Mar: 1500

[PIEGRAPH]
Market Share
Product A: 35
Product B: 25
Product C: 40

[TABLE]
Employee Data
Name | Dept | Sales
John | Sales | 1250
Jane | Mktg | 980
```

Charts render inline using Chart.js with responsive sizing and theme-aware colors.

### My Tests Library

Manage all created tests in an organized, filterable interface.

- Category tabs: Verbal Ability, Logical Reasoning, Quants, Misc
- Per-category search
- Test cards show: name, category badge, question count, best score, attempt count
- Actions: Attempt (opens in new tab), View History, Delete

### Performance Tracking

Detailed analytics across all test attempts.

- Dashboard stats: categories, tests created, attempts logged
- Per-test history modal with: date, score, percentage, time taken
- CSV export of results with full question breakdown

### Import Tests from Repository

Browse and import pre-built tests from the `p3anv/mock-app-data` GitHub repository.

- Four curated folders: Reading Comprehension, Vocabulary, Data Interpretation, Logical Reasoning
- Two-pane layout: folder tree (left) + test table (right)
- Load folders on demand, search within folder or globally
- Single or bulk import with progress feedback
- Imported tests saved locally with category mapping

### Dark / Light Mode

Full theme support across all pages.

- Dark-first design with warm amber accent system
- Light mode uses warm paper tones
- Persisted in localStorage
- Toggle available in sidebar and during tests

### JSON Samples Reference

Built-in library of copy-ready JSON examples:

- Basic questions
- Reading comprehension with paragraphs
- Bar graphs, line graphs, pie charts
- Data tables
- Mixed-format complete test

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Alpine.js 3 (reactive UI) |
| Charts | Chart.js 4 |
| CSV Export | PapaParse 5 |
| Build Tool | Vite 5 |
| Language | Vanilla JavaScript (ES Modules) |
| Styling | Custom CSS with CSS Custom Properties |
| Data | localStorage (tests, attempts, theme) |
| External Data | GitHub API (mock-app-data repository) |

**No React, Vue, Next.js, Tailwind, or Node.js runtime required.** The production build is static files.

---

## Project Structure

```
cet-mock-ejs/
├── public/
│   └── favicon.ico
├── src/
│   ├── css/
│   │   ├── index.css      # Main app styles (design system, layout, components)
│   │   └── test.css       # Test-taking page styles
│   └── js/
│       ├── main.js        # Dashboard, create, library, import, samples
│       ├── test.js        # Test-taking page logic
│       ├── storage.js     # localStorage helpers (tests, attempts, theme)
│       ├── validate.js    # JSON structure validation
│       ├── ui.js          # Toast, confirm modal, history modal
│       ├── charts.js      # Chart.js renderers (bar, line, pie, table)
│       └── csv.js         # CSV generation and download
├── index.html             # Main app (dashboard, create, tests, samples, import)
├── test.html              # Test-taking page
├── hero-illustration.svg  # Hero visual
├── package.json
├── vite.config.js
└── README.md
```

### Key Files

| File | Purpose |
|------|---------|
| `index.html` | SPA with 5 pages: Dashboard, Create Test, My Tests, JSON Samples, Import |
| `test.html` | Dedicated test-taking interface (opens in new tab) |
| `src/js/main.js` | Alpine component for main app (all 5 pages) |
| `src/js/test.js` | Alpine component for test page |
| `src/js/storage.js` | All localStorage read/write (keys: `cet_mock_tests_v3`, `cet_test_attempts`, `cetprep-theme`) |
| `src/js/charts.js` | Visualization rendering from paragraph markers |
| `src/css/index.css` | Complete design system (colors, spacing, components, responsive) |

---

## Running the Project

### Prerequisites

- Node.js 18+ (for dev server and build)
- Modern browser (Chrome, Firefox, Edge, Safari)

### Development

```bash
# Install dependencies
npm install

# Start dev server (opens at http://localhost:5500)
npm run dev
```

### Production Build

```bash
# Build to /dist
npm run build

# Preview production build
npm run preview
```

The build outputs static files to `dist/` — deploy anywhere (Netlify, Vercel, GitHub Pages, any static host).

---

## JSON Question Format

Questions are an array of objects. Each question supports:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `paragraph` | string | No | Supporting text, can contain visualization markers |
| `question` | string | Yes | Question text |
| `options` | string[] | Yes | Answer choices (minimum 2) |
| `correct` | number | Yes | Zero-based index of correct option |
| `explanation` | string | Yes | Shown during review |

### Example

```json
[
  {
    "paragraph": "[BARGRAPH]\nQuarterly Sales 2024\nQ1: 120\nQ2: 85\nQ3: 200\nQ4: 145",
    "question": "Which quarter had the highest sales?",
    "options": ["Q1", "Q2", "Q3", "Q4", "All equal"],
    "correct": 2,
    "explanation": "Q3 had 200 units, the highest among all quarters."
  },
  {
    "question": "What is 15 × 12?",
    "options": ["165", "175", "180", "190", "200"],
    "correct": 2,
    "explanation": "15 × 12 = 180."
  }
]
```

### Visualization Markers

| Marker | Format | Example |
|--------|--------|---------|
| `[BARGRAPH]` | `Label: Value` per line | `Q1: 120` |
| `[LINEGRAPH]` | `Label: Value` per line | `Jan: 1200` |
| `[PIEGRAPH]` | `Label: Value` per line | `Product A: 35` |
| `[TABLE]` | Header row with `\|`, data rows with `\|` | `Name \| Dept \| Sales` |

Markers must be at the **start** of the paragraph. Multiple visualizations can appear in one paragraph (rendered sequentially).

---

## Data Persistence

All data lives in `localStorage`:

| Key | Contents |
|-----|----------|
| `cet_mock_tests_v3` | Array of test objects `{ id, name, category, questions[], createdAt }` |
| `cet_test_attempts` | Array of attempt objects `{ testId, testName, score, total, percentage, date, answers[], timeSeconds }` |
| `cetprep-theme` | `'dark'` or `'light'` |

No server, no accounts, no cloud sync. Data is browser-local.

---

## Import from GitHub Repository

The **Import** page fetches tests from `https://github.com/p3anv/mock-app-data`.

### Folder Structure (in that repo)

```
mock-app-data/
├── reading/      # Reading Comprehension → maps to "Verbal Ability"
├── vocab/        # Vocabulary → maps to "Verbal Ability"
├── di/           # Data Interpretation → maps to "Quants"
└── lr/           # Logical Reasoning → maps to "Logical Reasoning"
```

Each folder contains `.json` files matching the question format above.

### Import Flow

1. Click a folder in the left pane → "Load tests" button fetches file list from GitHub API
2. Click "Load" to fetch each test's question count (from raw JSON)
3. Search/filter in the right pane table
4. Click "Import" on a row, or select multiple → "Import Selected"
5. Imported tests appear in **My Tests** with mapped category

---

## Design System (CSS)

The project uses a custom design system in `src/css/index.css` built on CSS custom properties.

### Color Philosophy

**Dark mode (default):** Warm graphite backgrounds (`#141415`, `#18181a`) with amber/gold accent (`#b8965c`) — evokes a desk lamp glow on paper.

**Light mode:** Warm paper tones (`#f5f2eb`, `#ebe7df`) with deeper amber (`#9a7d3a`).

### Key Tokens

```css
:root {
  --bg: #141415;
  --surface: #1a1a1d;
  --surface-2: #1f1f23;
  --border: #2a2a2f;
  --text: #ededed;
  --text-secondary: #a1a1a6;
  --accent: #b8965c;        /* amber/gold */
  --accent-soft: rgba(184, 150, 92, 0.12);
  --success: #4cc38a;
  --danger: #e5484d;
  --warning: #d9a441;
  --radius-md: 10px;
  --shadow-md: 0 8px 24px rgba(0,0,0,0.35);
  --transition: 160ms cubic-bezier(0.22, 1, 0.36, 1);
}
```

### Components

- Buttons: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-sm`
- Cards: `.stat-card`, `.feature-card`, `.test-card-item`, `.sample-card`
- Form: `.form-group`, inputs, textarea, select, file upload
- Tables: `.test-table` with checkbox selection
- Modals: `.modal-overlay`, `.results-modal`, `.import-result`
- Toasts: `.toast` (success, error, info, warning)

---

## Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Edge | 90+ |
| Safari | 14+ |

Requires: ES Modules, `localStorage`, `fetch`, `CSS Custom Properties`, `IntersectionObserver` (for Alpine).

---

## Development Notes

### Adding a New Page

1. Add `<section id="newpage" class="page" x-show="currentPage === 'newpage'" x-cloak>` in `index.html`
2. Add nav item in sidebar with `@click.prevent="goTo('newpage')"`
3. Add logic in `Alpine.data('app')` in `main.js`

### Adding a Visualization Type

1. Add renderer in `charts.js` (e.g., `renderScatterPlot`)
2. Register in `VISUALIZATION_RENDERERS` map
3. Add marker parsing in `renderParagraphWithVisualizations`

### Theme Colors

Modify `--accent`, `--accent-soft`, `--accent-strong` in `:root` and `body.light` in `index.css`. All components use these tokens.

---

## Future Improvements

- [ ] Persistent cloud storage / user accounts
- [ ] Server-side test storage and sharing
- [ ] Advanced analytics (weak-topic detection, time-per-question)
- [ ] Question bookmarking during tests
- [ ] Timed mock tests with auto-submit
- [ ] Import/export test collections (JSON backup)
- [ ] Progressive Web App (offline support)
- [ ] More visualization types (scatter, area, radar)
- [ ] Mobile-specific layout optimizations
- [ ] Question search and filtering in library
- [ ] Keyboard shortcuts for test navigation

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes to `src/` files
4. Test in browser (`npm run dev`)
5. Build: `npm run build`
6. Commit: `git commit -m "Add your feature"`
7. Push and open a Pull Request

---

## License

Distributed under the MIT License. See `LICENSE` file (or add one before publishing).

---

## Author

**Pranav Kamble**

Built as a lightweight exam-preparation and mock-test platform.

---

## CETPrep

**Practice smarter. Track progress. Improve consistently.**# cet-mock-ejs
