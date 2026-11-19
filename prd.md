# Product Requirements Document (PRD): CETPrep Vite Migration

## 1. Overview
CETPrep is a browser-based mock test platform. The current architecture uses a single monolithic HTML/CSS/JS structure. The goal is to modernize the build and state management while keeping the application 100% frontend, lightweight, and free of heavy frameworks (React, Vue, Next.js).

## 2. Technical Stack
- **Build Tool**: Vite
- **State Management / Reactivity**: Alpine.js
- **Data Visualization**: Chart.js
- **CSV Parsing/Generation**: PapaParse
- **Styling**: Standard CSS (No Tailwind, no CSS-in-JS)

## 3. STRICT UI/UX CONSTRAINT (CRITICAL)
**The current CSS UI/UX must remain 100% intact.**
- Do NOT redesign, restyle, or alter the layout.
- Do NOT change HTML class names. Every `div`, `button`, and `input` must retain its exact current class names (e.g., `.test-card-item`, `.nav-btn`, `.option-item`, `.btn-primary`).
- The visual output must be pixel-perfect to the current application. 
- The only acceptable CSS addition is `[x-cloak] { display: none !important; }` to prevent Alpine.js template flashing on load.

## 4. Core Features to Retain
1. **Dashboard**: Shows stats (tests created, attempts, categories).
2. **Create Test**: Form to paste JSON, upload JSON, and save to `localStorage`.
3. **My Tests**: Tabs to filter by category, search, and display test cards with Attempt/History/Delete actions.
4. **Test Interface**: Question navigator, timer, radio options, "Mark for review", and "Show explanation" toasts.
5. **Charts**: Render Bar, Line, Pie, and Table charts from JSON paragraph data.
6. **Results Modal**: Shows score summary, detailed question review, and allows CSV export.
7. **Theme Toggle**: Dark/Light mode that persists across pages.

## 5. Data Constraints
- **No Backend**: All data must remain in `localStorage`.
- **Data Integrity**: The `localStorage` keys MUST remain exactly: `cet_mock_tests_v3`, `cet_test_attempts`, `cetprep-theme`.
- **JSON Format**: Do not alter the structure of the JSON required to create a test.