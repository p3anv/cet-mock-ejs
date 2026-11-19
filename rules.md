# Development Rules & AI Constraints

## 1. The Golden Rule: UI/UX Parity
- **The CSS is Law**: You are strictly forbidden from rewriting, refactoring, or "cleaning up" the CSS. Move the existing `index.css` and `test.css` exactly as they are.
- **No Class Renaming**: Use the exact existing CSS classes in your HTML and Alpine.js templates (e.g., `.stat-card`, `.nav-btn`, `.action-btn`, `.option-item`).
- **No Layout Changes**: The flexbox/grid structures and responsive breakpoints must remain identical.

## 2. Architectural Rules
- **Strictly Vanilla**: Do not use React, Vue, Svelte, or Tailwind CSS.
- **Modularity**: Keep JavaScript files separated by concern (`storage.js`, `charts.js`, `main.js`, `test.js`).
- **No Inline Logic**: Do not put massive JavaScript blocks inside HTML attributes. Put complex logic in the ES modules and call them from Alpine.js.
- **State Management**: Let Alpine.js handle all DOM updates. Do not use `document.getElementById('...').innerHTML = ...` to render lists or modals.

## 3. Data & Storage Rules
- **Preserve LocalStorage**: The keys `cet_mock_tests_v3`, `cet_test_attempts`, and `cetprep-theme` must never change.
- **JSON Format**: Do not alter the structure of the JSON required to create a test.

## 4. Library Specific Rules
### Alpine.js
- Use `x-data` on the root `<body>` or main container.
- Use `x-cloak` on elements that depend on Alpine data to prevent raw HTML from flashing before Alpine loads.
- For rendering lists, always use `<template x-for="...">` to avoid rendering the template element itself.
- Use `:class="..."` to toggle classes dynamically, rather than manipulating `classList` in JavaScript.

### Chart.js
- Import only necessary modules (`import Chart from 'chart.js/auto'`).
- Always set `maintainAspectRatio: false` in the Chart options so it fills the `.chart-container` properly.
- **Crucial**: When rendering a chart inside a dynamic container (like an Alpine `x-show` modal), use `$nextTick(() => { ... })` to ensure the canvas element is fully in the DOM before Chart.js draws.

### PapaParse
- Use `Papa.unparse(arrayOfArrays)` for CSV generation.
- Ensure the generated CSV handles commas and line breaks properly (PapaParse does this automatically).