import Alpine from 'alpinejs';
import { getAllTests, getTestById, saveTest, deleteTestById, getAllAttempts, getAttemptsForTest, generateTestId, getTheme, setTheme } from './storage.js';
import { validateJSONStructure } from './validate.js';
import { showToast, showConfirmModal, showHistoryModal } from './ui.js';

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/p3anv/mock-app-data/main';
const GITHUB_API_BASE = 'https://api.github.com/repos/p3anv/mock-app-data/contents';

const TEST_FOLDERS = [
    { id: 'reading', label: 'Reading Comprehension', description: 'Passage-based questions', color: 'accent' },
    { id: 'vocab', label: 'Vocabulary', description: 'Word meaning, synonyms, antonyms', color: 'warning' },
    { id: 'di', label: 'Data Interpretation', description: 'Charts, tables, graphs', color: 'success' },
    { id: 'lr', label: 'Logical Reasoning', description: 'Puzzles, syllogisms, patterns', color: 'purple' }
];

window.Alpine = Alpine;

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, m => m === '&' ? '&' : (m === '<' ? '<' : '>'));
}

function getCategoryBadge(cat) {
    if (cat === 'Verbal Ability') return 'verbal';
    if (cat === 'Logical Reasoning') return 'logical';
    if (cat === 'Quants') return 'quants';
    return 'misc';
}

Alpine.data('app', () => ({
    currentPage: 'dashboard',
    theme: 'dark',
    themeIcon: '<path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.5 6.5 0 0 0 21 12.8Z"/>',
    themeText: 'Dark',

    testName: 'RC Practice',
    testCategory: 'Verbal Ability',
    jsonInput: `[
  {
    "paragraph": "[BARGRAPH]\\nSales Data\\nA: 120\\nB: 85\\nC: 200",
    "question": "Which product sold most?",
    "options": ["A","B","C","D","E"],
    "correct": 2,
    "explanation": "C sold 200 units."
  }
]`,
    fileStatus: 'No file selected',

    categories: ['Verbal Ability', 'Logical Reasoning', 'Quants', 'Misc'],
    activeTab: 'Verbal Ability',
    searchTerms: {},

    tests: [],

    statTests: 0,
    statAttempts: 0,
    statCategories: '5+',

    jsonSamples: [
        {
            id: 'basic',
            title: 'Basic Question (No Paragraph)',
            type: 'Basic',
            description: 'Simplest format — just question, options, correct index, and explanation.',
            json: `[
  {
    "question": "What is the capital of France?",
    "options": ["London", "Paris", "Berlin", "Madrid", "Rome"],
    "correct": 1,
    "explanation": "Paris is the capital city of France."
  }
]`
        },
        {
            id: 'with-paragraph',
            title: 'Question with Paragraph (Reading Comprehension)',
            type: 'Paragraph',
            description: 'Includes a reading passage that appears above the question.',
            json: `[
  {
    "paragraph": "The Industrial Revolution began in Britain in the late 18th century. It marked a major turning point in history, transforming economies from agrarian to industrial.",
    "question": "Where did the Industrial Revolution begin?",
    "options": ["France", "Germany", "Britain", "USA", "Japan"],
    "correct": 2,
    "explanation": "The passage states it began in Britain."
  }
]`
        },
        {
            id: 'bargraph',
            title: 'Bar Graph Chart',
            type: 'Chart',
            description: 'Embed a bar chart using [BARGRAPH] tag. Data lines use "Label: Value" format.',
            json: `[
  {
    "paragraph": "[BARGRAPH]\\nQuarterly Sales 2024\\nQ1: 120\\nQ2: 85\\nQ3: 200\\nQ4: 145",
    "question": "Which quarter had the highest sales?",
    "options": ["Q1", "Q2", "Q3", "Q4", "All equal"],
    "correct": 2,
    "explanation": "Q3 had 200 units, the highest among all quarters."
  }
]`
        },
        {
            id: 'linegraph',
            title: 'Line Graph Chart',
            type: 'Chart',
            description: 'Embed a line chart using [LINEGRAPH] tag for trend data.',
            json: `[
  {
    "paragraph": "[LINEGRAPH]\\nMonthly Website Traffic\\nJan: 1200\\nFeb: 1900\\nMar: 1500\\nApr: 2100\\nMay: 1800\\nJun: 2400",
    "question": "What was the traffic in April?",
    "options": ["1500", "1800", "1900", "2100", "2400"],
    "correct": 3,
    "explanation": "April traffic was 2100 as shown in the line graph."
  }
]`
        },
        {
            id: 'piegraph',
            title: 'Pie Chart',
            type: 'Chart',
            description: 'Embed a pie chart using [PIEGRAPH] tag for proportional data.',
            json: `[
  {
    "paragraph": "[PIEGRAPH]\\nMarket Share Distribution\\nProduct A: 35\\nProduct B: 25\\nProduct C: 20\\nProduct D: 12\\nProduct E: 8",
    "question": "What is the combined market share of Products A and B?",
    "options": ["45%", "50%", "55%", "60%", "65%"],
    "correct": 3,
    "explanation": "Product A (35%) + Product B (25%) = 60% combined market share."
  }
]`
        },
        {
            id: 'table',
            title: 'Data Table',
            type: 'Chart',
            description: 'Embed a sortable table using [TABLE] tag. First row = headers, separated by |.',
            json: `[
  {
    "paragraph": "[TABLE]\\nEmployee Performance Data\\nName | Department | Sales | Rating\\nJohn | Sales | 1250 | 4.5\\nSarah | Marketing | 980 | 4.2\\nMike | Sales | 1100 | 4.0\\nEmily | Engineering | 850 | 4.7\\nDavid | Sales | 1320 | 4.8",
    "question": "Who has the highest sales figure?",
    "options": ["John", "Sarah", "Mike", "Emily", "David"],
    "correct": 4,
    "explanation": "David has the highest sales at 1320 units."
  }
]`
        },
        {
            id: 'mixed',
            title: 'Mixed Question Types (All Formats)',
            type: 'Complete',
            description: 'All question types in one test: basic, paragraph, bar, line, pie, table.',
            json: `[
  {
    "question": "What is 15 × 12?",
    "options": ["165", "175", "180", "190", "200"],
    "correct": 2,
    "explanation": "15 × 12 = 180."
  },
  {
    "paragraph": "The Industrial Revolution began in Britain in the late 18th century, transforming economies from agrarian to industrial.",
    "question": "Where did the Industrial Revolution begin?",
    "options": ["France", "Germany", "Britain", "USA", "Japan"],
    "correct": 2,
    "explanation": "The passage states it began in Britain."
  },
  {
    "paragraph": "[BARGRAPH]\\nQuarterly Sales 2024\\nQ1: 120\\nQ2: 85\\nQ3: 200\\nQ4: 145",
    "question": "Which quarter had the highest sales?",
    "options": ["Q1", "Q2", "Q3", "Q4", "All equal"],
    "correct": 2,
    "explanation": "Q3 had 200 units, the highest among all quarters."
  },
  {
    "paragraph": "[LINEGRAPH]\\nMonthly Website Traffic\\nJan: 1200\\nFeb: 1900\\nMar: 1500\\nApr: 2100\\nMay: 1800\\nJun: 2400",
    "question": "What was the traffic in April?",
    "options": ["1500", "1800", "1900", "2100", "2400"],
    "correct": 3,
    "explanation": "April traffic was 2100 as shown in the line graph."
  },
  {
    "paragraph": "[PIEGRAPH]\\nMarket Share Distribution\\nProduct A: 35\\nProduct B: 25\\nProduct C: 20\\nProduct D: 12\\nProduct E: 8",
    "question": "What is the combined market share of Products A and B?",
    "options": ["45%", "50%", "55%", "60%", "65%"],
    "correct": 3,
    "explanation": "Product A (35%) + Product B (25%) = 60% combined market share."
  },
  {
    "paragraph": "[TABLE]\\nProduct Inventory\\nProduct | Category | Stock | Price\\nLaptop | Electronics | 45 | 999\\nMouse | Electronics | 120 | 29\\nKeyboard | Electronics | 85 | 79\\nMonitor | Electronics | 30 | 299\\nHeadphones | Electronics | 60 | 149",
    "question": "What is the total stock count for all Electronics products?",
    "options": ["300", "340", "350", "360", "370"],
    "correct": 1,
    "explanation": "45 + 120 + 85 + 30 + 60 = 340 total units in stock."
  }
]`
        }
    ],

    testFolders: TEST_FOLDERS,
    folderTests: {},
    activeFolder: null,
    globalSearchTerm: '',
    selectedTests: [],
    selectAllInFolder: false,
    importLoading: false,
    importMessage: '',
    importSuccess: false,
    importError: false,
    importErrorMessage: '',
    importedTestName: '',
    lastSyncTime: null,

    init() {
        this.theme = getTheme() || 'dark';
        if (this.theme === 'light') {
            document.body.classList.add('light');
            this.updateThemeUI();
        }

        this.searchTerms = {
            'Verbal Ability': '',
            'Logical Reasoning': '',
            'Quants': '',
            'Misc': ''
        };

        this.loadTests();
        this.loadFromHash();
        window.addEventListener('hashchange', () => this.loadFromHash());

        this.updateDashboardStats();
        this.initFolderState();

        if (!this.jsonInput) {
            this.jsonInput = JSON.stringify([{
                paragraph: "[BARGRAPH]\\nSales in 2024\\nProduct A: 120\\nProduct B: 85\\nProduct C: 200\\nProduct D: 45",
                question: "Best selling product?",
                options: ["A","B","C","D","E"],
                correct: 2,
                explanation: "Product C sold 200 units."
            }], null, 2);
        }
    },

    loadTests() {
        this.tests = getAllTests();
        console.log('[loadTests] Loaded tests:', this.tests.length, this.tests);
    },

    loadFromHash() {
        const hash = window.location.hash.replace('#', '');
        if (['dashboard', 'create', 'tests', 'samples', 'import'].includes(hash)) {
            this.showPage(hash);
        } else {
            this.showPage('dashboard');
        }
    },

    showPage(pageName) {
        this.currentPage = pageName;
        history.replaceState(null, '', '#' + pageName);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (pageName === 'tests') {
            this.activeTab = 'Verbal Ability';
            this.searchTerms = {
                'Verbal Ability': '',
                'Logical Reasoning': '',
                'Quants': '',
                'Misc': ''
            };
            this.loadTests();
        }
        if (pageName === 'dashboard') {
            this.updateDashboardStats();
        }
    },

    goTo(pageName) {
        this.showPage(pageName);
    },

    updateDashboardStats() {
        const tests = getAllTests();
        const attempts = getAllAttempts();
        this.statTests = tests.length;
        this.statAttempts = attempts.length;
        let best = 0;
        attempts.forEach(a => {
            if (a.percentage > best) best = a.percentage;
        });
        const cats = new Set(tests.map(t => t.category || 'Misc'));
        this.statCategories = cats.size + '+';
    },

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        document.body.classList.toggle('light', this.theme === 'light');
        setTheme(this.theme);
        this.updateThemeUI();
    },

    updateThemeUI() {
        const isLight = this.theme === 'light';
        this.themeText = isLight ? 'Light' : 'Dark';
        this.themeIcon = isLight
            ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.93 19.07 1.41-1.41"/><path d="m17.66 6.34 1.41-1.41"/>'
            : '<path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.5 6.5 0 0 0 21 12.8Z"/>';
    },

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) {
            this.fileStatus = 'No file selected';
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            this.jsonInput = ev.target.result;
            this.fileStatus = file.name + ' loaded';
            showToast('File loaded', 'success');
        };
        reader.readAsText(file);
    },

    clearForm() {
        this.testName = '';
        this.jsonInput = '';
        this.fileStatus = 'No file selected';
        this.$refs.fileUpload.value = '';
    },

    generateTest() {
        const name = this.testName.trim();
        const cat = this.testCategory;
        const raw = this.jsonInput.trim();

        if (!name) { showToast('Test name required', 'error'); return; }
        if (!raw) { showToast('JSON required', 'error'); return; }

        let parsed;
        try { parsed = JSON.parse(raw); } catch(e) { showToast('Invalid JSON', 'error'); return; }

        const validation = validateJSONStructure(parsed);
        if (!validation.valid) { showToast(validation.error, 'error'); return; }

        const id = generateTestId();
        const newTest = { id, name, category: cat, questions: parsed, createdAt: new Date().toISOString() };
        console.log('[generateTest] Saving test:', newTest);
        saveTest(newTest);
        this.tests.push(newTest);
        console.log('[generateTest] this.tests now:', this.tests.length);
        showToast(`Test "${name}" created in ${cat}`, 'success');

        this.testName = 'RC Practice';
        this.jsonInput = '';
        this.fileStatus = 'No file selected';
        this.$refs.fileUpload.value = '';

        this.updateDashboardStats();
    },

    setActiveTab(cat) {
        this.activeTab = cat;
    },

    getFilteredTests(category) {
        const term = (this.searchTerms[category] || '').toLowerCase().trim();
        let tests = this.tests.filter(t => (t.category || 'Misc') === category);
        if (term) {
            tests = tests.filter(t => t.name.toLowerCase().includes(term));
        }
        console.log('[getFilteredTests]', category, '->', tests.length, 'tests');
        return tests;
    },

    attemptTest(testId) {
        window.open(`./test.html?id=${testId}`, '_blank');
    },

    viewHistory(testId) {
        showHistoryModal(testId);
    },

    deleteTest(testId) {
        const test = getTestById(testId);
        showConfirmModal(`Delete test "${escapeHtml(test?.name)}" permanently?`, () => {
            deleteTestById(testId);
            this.tests = this.tests.filter(t => t.id !== testId);
            this.updateDashboardStats();
            showToast('Test deleted', 'success');
        });
    },

    getBestPercentage(testId) {
        const attempts = getAttemptsForTest(testId);
        if (!attempts.length) return 0;
        return Math.max(...attempts.map(a => parseFloat(a.percentage)));
    },

    getAttemptCount(testId) {
        return getAttemptsForTest(testId).length;
    },

    copySample(json) {
        navigator.clipboard.writeText(json);
        showToast('JSON copied to clipboard', 'success');
    },

    loadSample(json) {
        this.jsonInput = json;
        this.goTo('create');
        showToast('Sample loaded in builder', 'success');
    },

    initFolderState() {
        this.testFolders.forEach(folder => {
            this.folderTests[folder.id] = {
                tests: [],
                loaded: false,
                loading: false,
                error: null,
                searchTerm: '',
                selectAll: false
            };
        });
    },

    async loadFolderTests(folderId) {
        const folderState = this.folderTests[folderId];
        if (!folderState) return;

        folderState.loading = true;
        folderState.error = null;

        try {
            const response = await fetch(`${GITHUB_API_BASE}/${folderId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    folderState.tests = [];
                    folderState.loaded = true;
                    folderState.loading = false;
                    return;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const files = await response.json();
            const jsonFiles = files.filter(f => f.type === 'file' && f.name.endsWith('.json'));

            const tests = [];
            for (const f of jsonFiles) {
                const id = `${folderId}-${f.name.replace('.json', '')}`;
                let title = f.name.replace('.json', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                if (id === 'reading-eagle-serpent') title = 'The Eagle & The Serpent';
                if (id === 'reading-banking-basics') title = 'Banking Fundamentals';
                if (id === 'vocab-vocab-1') title = 'Vocabulary Test 1';

                tests.push({
                    id,
                    title,
                    description: folderId === 'reading' ? 'Reading comprehension' :
                                folderId === 'vocab' ? 'Vocabulary' :
                                folderId === 'di' ? 'Data Interpretation' :
                                folderId === 'lr' ? 'Logical Reasoning' : 'Test',
                    questions: 0,
                    filename: `${folderId}/${f.name}`,
                    folder: folderId
                });
            }

            for (const test of tests) {
                try {
                    const res = await fetch(`${GITHUB_RAW_BASE}/${test.filename}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (Array.isArray(data)) {
                            test.questions = data.length;
                        }
                    }
                } catch (e) {
                    test.questions = '?';
                }
            }

            folderState.tests = tests;
            folderState.loaded = true;
            folderState.loading = false;

            this.lastSyncTime = new Date().toLocaleTimeString();

        } catch (error) {
            folderState.error = error.message;
            folderState.loading = false;
            showToast(`Failed to load ${folderId} tests: ${error.message}`, 'error');
        }
    },

    async loadAllFolders() {
        await Promise.all(this.testFolders.map(f => this.loadFolderTests(f.id)));
    },

    async refreshAllFolders() {
        this.testFolders.forEach(f => {
            this.folderTests[f.id].loaded = false;
            this.folderTests[f.id].loading = false;
        });
        await this.loadAllFolders();
        showToast('Refreshed all folders', 'success');
    },

    setActiveFolder(folderId) {
        this.activeFolder = folderId;
        this.selectedTests = [];
        this.selectAllInFolder = false;
    },

    getFilteredFolderTests(folderId) {
        const folderState = this.folderTests[folderId];
        if (!folderState) return [];

        const term = (folderState.searchTerm || '').toLowerCase().trim();
        let tests = folderState.tests;

        if (this.globalSearchTerm) {
            const globalTerm = this.globalSearchTerm.toLowerCase().trim();
            tests = tests.filter(t => t.title.toLowerCase().includes(globalTerm));
        }

        if (term) {
            tests = tests.filter(t => t.title.toLowerCase().includes(term));
        }

        return tests;
    },

    getFolderLabel(folderId) {
        const folder = this.testFolders.find(f => f.id === folderId);
        return folder ? folder.label : folderId;
    },

    get totalTestsCount() {
        let count = 0;
        for (const folderId of Object.keys(this.folderTests)) {
            count += this.folderTests[folderId].tests.length;
        }
        return count;
    },

    get totalFoldersCount() {
        return this.testFolders.length;
    },

    get anyFolderLoaded() {
        return Object.values(this.folderTests).some(f => f.loaded && f.tests.length > 0);
    },

    get isAnyFolderLoading() {
        return Object.values(this.folderTests).some(f => f.loading);
    },

    async importTest(testId) {
        let testMeta = null;
        for (const folderId of Object.keys(this.folderTests)) {
            const found = this.folderTests[folderId].tests.find(t => t.id === testId);
            if (found) {
                testMeta = found;
                break;
            }
        }
        if (!testMeta) return;

        this.importLoading = true;
        this.importMessage = `Fetching ${testMeta.title}...`;
        this.importSuccess = false;
        this.importError = false;

        try {
            const response = await fetch(`${GITHUB_RAW_BASE}/${testMeta.filename}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const questions = await response.json();

            if (!Array.isArray(questions) || questions.length === 0) {
                throw new Error('Invalid test data format');
            }

            const folderToCategory = {
                'reading': 'Verbal Ability',
                'vocab': 'Verbal Ability',
                'di': 'Quants',
                'lr': 'Logical Reasoning'
            };

            const testName = testMeta.title;
            const id = generateTestId();
            const newTest = {
                id,
                name: testName,
                category: folderToCategory[testMeta.folder] || 'Misc',
                questions,
                createdAt: new Date().toISOString()
            };
            saveTest(newTest);
            this.tests.push(newTest);

            this.importLoading = false;
            this.importSuccess = true;
            this.importedTestName = testName;
            this.updateDashboardStats();
            showToast(`Imported "${testName}" successfully`, 'success');

        } catch (error) {
            this.importLoading = false;
            this.importError = true;
            this.importErrorMessage = error.message || 'Failed to import test';
            showToast('Import failed: ' + this.importErrorMessage, 'error');
        }
    },

    async importSelectedTests() {
        if (this.selectedTests.length === 0) return;

        this.importLoading = true;
        this.importMessage = `Importing ${this.selectedTests.length} test${this.selectedTests.length > 1 ? 's' : ''}...`;
        this.importSuccess = false;
        this.importError = false;

        const folderToCategory = {
            'reading': 'Verbal Ability',
            'vocab': 'Verbal Ability',
            'di': 'Quants',
            'lr': 'Logical Reasoning'
        };

        let successCount = 0;
        let failCount = 0;
        const newTests = [];

        for (const testId of this.selectedTests) {
            let testMeta = null;
            for (const folderId of Object.keys(this.folderTests)) {
                const found = this.folderTests[folderId].tests.find(t => t.id === testId);
                if (found) {
                    testMeta = found;
                    break;
                }
            }
            if (!testMeta) continue;

            try {
                const response = await fetch(`${GITHUB_RAW_BASE}/${testMeta.filename}`);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const questions = await response.json();
                if (!Array.isArray(questions) || questions.length === 0) throw new Error('Invalid format');

                const id = generateTestId();
                const newTest = {
                    id,
                    name: testMeta.title,
                    category: folderToCategory[testMeta.folder] || 'Misc',
                    questions,
                    createdAt: new Date().toISOString()
                };
                newTests.push(newTest);
                successCount++;
            } catch (e) {
                failCount++;
            }
        }

        if (newTests.length > 0) {
            const allTests = getAllTests();
            allTests.push(...newTests);
            localStorage.setItem('cet_mock_tests_v3', JSON.stringify(allTests));
            this.tests.push(...newTests);
        }

        this.importLoading = false;
        this.selectedTests = [];
        this.selectAllInFolder = false;

        if (successCount > 0) {
            this.importSuccess = true;
            this.importedTestName = `${successCount} test${successCount > 1 ? 's' : ''} imported`;
            this.updateDashboardStats();
            showToast(`Imported ${successCount} test${successCount > 1 ? 's' : ''} successfully`, 'success');
        }
        if (failCount > 0) {
            showToast(`Failed to import ${failCount} test${failCount > 1 ? 's' : ''}`, 'error');
        }
    }
}));

Alpine.data('toast', () => ({
    show: false,
    message: '',
    type: 'success',
    title: '',
    timeout: null,

    showToast(message, type = 'success', title = '') {
        this.message = message;
        this.type = type;
        this.title = title || { success: 'Success', error: 'Error', info: 'Info', warning: 'Warning' }[type];
        this.show = true;

        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.show = false;
        }, 3500);
    }
}));

Alpine.start();