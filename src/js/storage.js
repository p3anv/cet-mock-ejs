const STORAGE_KEY = 'cet_mock_tests_v3';
const ATTEMPTS_KEY = 'cet_test_attempts';
const THEME_KEY = 'cetprep-theme';

export function getAllTests() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try { return JSON.parse(raw); } catch(e) { return []; }
    }
    return [];
}

export function getTestById(id) {
    return getAllTests().find(t => t.id === id);
}

export function saveTest(test) {
    const tests = getAllTests();
    tests.push(test);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
}

export function deleteTestById(id) {
    let tests = getAllTests().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
    const attempts = getAllAttempts().filter(a => a.testId !== id);
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
}

export function getAllAttempts() {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    return raw ? JSON.parse(raw) : [];
}

export function getAttemptsForTest(testId) {
    return getAllAttempts().filter(a => a.testId === testId);
}

export function saveAttempt(attempt) {
    const attempts = getAllAttempts();
    attempts.push(attempt);
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
}

export function generateTestId() {
    return 'test_' + (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '_' + Math.random().toString(36).substr(2, 8));
}

export function getTheme() {
    return localStorage.getItem(THEME_KEY);
}

export function setTheme(mode) {
    localStorage.setItem(THEME_KEY, mode);
}

export const STORAGE_KEYS = { STORAGE_KEY, ATTEMPTS_KEY, THEME_KEY };