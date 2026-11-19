import Alpine from 'alpinejs';
import { getTestById } from './storage.js';
import { showToast } from './ui.js';
import { generateCSV, downloadCSV } from './csv.js';
import { renderBarGraph, renderLineGraph, renderPieChart, renderTable, renderParagraphWithVisualizations } from './charts.js';

window.Alpine = Alpine;

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, m => m === '&' ? '&' : (m === '<' ? '<' : '>'));
}

Alpine.data('testApp', () => ({
    test: null,
    testId: null,
    currentIndex: 0,
    answers: [],
    markedForReview: [],
    timerInterval: null,
    timeSeconds: 0,
    submitted: false,
    cleanupFns: [],
    keyHandler: null,

    init() {
        const params = new URLSearchParams(window.location.search);
        this.testId = params.get('id');
        if (!this.testId || this.testId.trim() === '') {
            this.test = null;
            showToast('No test ID provided.', 'error');
            return;
        }

        this.test = getTestById(this.testId);
        if (!this.test) {
            showToast('Test not found.', 'error');
            return;
        }

        this.answers = new Array(this.test.questions.length).fill(null);
        this.markedForReview = new Array(this.test.questions.length).fill(false);

        this.enableBeforeUnload();
        this.startTimer();
        this.setupKeyboardShortcuts();

        this.$watch('currentIndex', () => {
            this.$nextTick(() => this.renderVisualizations());
        });

        // Robust: wait for paragraphBox to exist in DOM, then render
        const waitForParagraphBox = () => {
            const box = document.getElementById('paragraphBox');
            if (box && this.test) {
                this.renderVisualizations();
            } else {
                requestAnimationFrame(waitForParagraphBox);
            }
        };
        requestAnimationFrame(waitForParagraphBox);

        const themeIcon = document.body.classList.contains('light')
            ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.93 19.07 1.41-1.41"/><path d="m17.66 6.34 1.41-1.41"/>'
            : '<path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.5 6.5 0 0 0 21 12.8Z"/>';
        this.themeIcon = themeIcon;
    },

    setupKeyboardShortcuts() {
        this.keyHandler = (e) => {
            // Ignore if typing in input/textarea/select
            const tag = e.target.tagName.toLowerCase();
            if (['input', 'textarea', 'select'].includes(tag)) return;
            // Ignore if modifier keys held (except Shift for ?)
            if (e.ctrlKey || e.metaKey || e.altKey) return;

            const totalQuestions = this.test?.questions?.length || 0;
            const currentQuestion = this.test?.questions?.[this.currentIndex];
            const optionCount = currentQuestion?.options?.length || 0;

            switch (e.key) {
                // Navigation
                case 'ArrowRight':
                case 'l':
                case 'j':
                    e.preventDefault();
                    this.nextQuestion();
                    break;
                case 'ArrowLeft':
                case 'h':
                case 'k':
                    e.preventDefault();
                    this.prevQuestion();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToQuestion(0);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToQuestion(totalQuestions - 1);
                    break;

                // Answer selection (1-9)
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9': {
                    const idx = parseInt(e.key, 10) - 1;
                    if (idx >= 0 && idx < optionCount) {
                        e.preventDefault();
                        this.answers[this.currentIndex] = idx;
                    }
                    break;
                }

                // Actions
                case 'm':
                case 'M':
                    e.preventDefault();
                    this.toggleMark();
                    break;
                case 'e':
                case 'E':
                    e.preventDefault();
                    this.showExplanation();
                    break;
                case 's':
                case 'S':
                    e.preventDefault();
                    this.submitTest();
                    break;
                case 't':
                case 'T':
                    e.preventDefault();
                    this.toggleTheme();
                    break;
                case '?':
                    e.preventDefault();
                    this.showShortcutsHelp();
                    break;
            }
        };
        document.addEventListener('keydown', this.keyHandler);
        this.cleanupFns.push(() => document.removeEventListener('keydown', this.keyHandler));
    },

    showShortcutsHelp() {
        const help = `
            <div style="font-size:0.85rem; line-height:1.8; max-width:320px;">
                <strong>Keyboard Shortcuts</strong><br>
                <span style="color:var(--color-text-muted)">Navigation</span><br>
                <kbd>←</kbd> / <kbd>h</kbd> / <kbd>k</kbd> — Previous question<br>
                <kbd>→</kbd> / <kbd>l</kbd> / <kbd>j</kbd> — Next question<br>
                <kbd>Home</kbd> — First question<br>
                <kbd>End</kbd> — Last question<br>
                <br>
                <span style="color:var(--color-text-muted)">Answers</span><br>
                <kbd>1</kbd>–<kbd>9</kbd> — Select option<br>
                <br>
                <span style="color:var(--color-text-muted)">Actions</span><br>
                <kbd>m</kbd> — Mark/unmark for review<br>
                <kbd>e</kbd> — Show explanation<br>
                <kbd>s</kbd> — Submit test<br>
                <kbd>t</kbd> — Toggle theme<br>
                <kbd>?</kbd> — Show this help
            </div>
        `;
        const modal = document.createElement('div');
        modal.className = 'modal-overlay shortcuts-modal';
        modal.innerHTML = `
            <div class="modal-box" style="max-width:360px;">
                <div class="modal-header">
                    <h3>Keyboard Shortcuts</h3>
                    <button class="modal-close" id="closeShortcutsBtn" aria-label="Close">&times;</button>
                </div>
                <div class="modal-body">
                    ${help}
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const closeModal = () => {
            modal.remove();
            document.removeEventListener('keydown', escHandler);
        };
        const escHandler = (e) => {
            if (e.key === 'Escape') closeModal();
        };
        document.addEventListener('keydown', escHandler);
        document.getElementById('closeShortcutsBtn')?.addEventListener('click', closeModal);
        modal.querySelector('.modal-overlay')?.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    },

    get timerDisplay() {
        const mins = Math.floor(this.timeSeconds / 60);
        const secs = this.timeSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    get themeIcon() {
        return document.body.classList.contains('light')
            ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.93 19.07 1.41-1.41"/><path d="m17.66 6.34 1.41-1.41"/>'
            : '<path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.5 6.5 0 0 0 21 12.8Z"/>';
    },

    enableBeforeUnload() {
        window.addEventListener('beforeunload', (e) => {
            if (!this.submitted) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    },

    startTimer() {
        this.timerInterval = setInterval(() => {
            if (!this.submitted) {
                this.timeSeconds++;
            }
        }, 1000);
        this.cleanupFns.push(() => { if (this.timerInterval) clearInterval(this.timerInterval); });
    },

    get navButtons() {
        if (!this.test) return [];
        return this.test.questions.map((q, idx) => ({
            number: idx + 1,
            answered: this.answers[idx] !== null,
            marked: this.markedForReview[idx],
            current: idx === this.currentIndex
        }));
    },

    goToQuestion(idx) {
        this.currentIndex = idx;
    },

    prevQuestion() {
        if (this.currentIndex > 0) this.currentIndex--;
    },

    nextQuestion() {
        if (this.currentIndex < this.test.questions.length - 1) this.currentIndex++;
    },

    toggleMark() {
        this.markedForReview[this.currentIndex] = !this.markedForReview[this.currentIndex];
        const state = this.markedForReview[this.currentIndex] ? 'marked' : 'unmarked';
        showToast(`Question ${this.currentIndex + 1} ${state}`, 'info');
    },

    showExplanation() {
        const q = this.test.questions[this.currentIndex];
        const container = document.getElementById('explanationToastContainer') || (() => {
            const div = document.createElement('div');
            div.id = 'explanationToastContainer';
            div.className = 'explanation-toast-container';
            document.body.appendChild(div);
            return div;
        })();
        const toast = document.createElement('div');
        toast.className = 'explanation-toast';
        toast.innerHTML = `<div class="explanation-title">Explanation</div><div style="font-size:0.85rem; color:var(--color-text-secondary);">${escapeHtml(q.question.substring(0, 80))}${q.question.length > 80 ? '...' : ''}</div><div class="explanation-text">${escapeHtml(q.explanation)}</div>`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    },

    renderVisualizations() {
        const paragraphBox = document.getElementById('paragraphBox');
        if (!paragraphBox) {
            // Retry after a short delay if element not ready
            setTimeout(() => this.renderVisualizations(), 50);
            return;
        }

        if (!this.test || !this.test.questions || this.currentIndex >= this.test.questions.length) {
            paragraphBox.innerHTML = '';
            return;
        }

        const q = this.test.questions[this.currentIndex];
        if (!q.paragraph) {
            paragraphBox.innerHTML = '';
            return;
        }

        const uniqueId = `q${this.currentIndex}_${crypto.randomUUID ? crypto.randomUUID() : Date.now() + '_' + Math.random().toString(36).substr(2, 8)}`;
        const visualHtml = renderParagraphWithVisualizations(q.paragraph, uniqueId);
        paragraphBox.innerHTML = visualHtml;
    },

    submitTest() {
        if (this.submitted) return;
        const unansweredCount = this.answers.filter(a => a === null).length;
        this.showConfirmModal(unansweredCount);
    },

    showConfirmModal(unansweredCount) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        let warningText = unansweredCount > 0 ? `<p style="color: var(--color-warning); margin-bottom: 1rem;">You have ${unansweredCount} unanswered question(s).</p>` : '';
        modal.innerHTML = `
            <div class="modal-box">
                <h3>Submit test?</h3>
                ${warningText}
                <p>Are you sure you want to submit? You won't be able to change your answers after submission.</p>
                <div class="modal-actions">
                    <button class="btn btn-secondary" id="cancelSubmit">Cancel</button>
                    <button class="btn btn-danger" id="confirmSubmit">Yes, submit</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const cancelHandler = () => {
            modal.remove();
            showToast('Submission cancelled.', 'info');
        };
        const confirmHandler = () => {
            modal.remove();
            this.submitAndShowResults();
        };
        const escHandler = (e) => {
            if (e.key === 'Escape') cancelHandler();
        };

        document.getElementById('cancelSubmit').addEventListener('click', cancelHandler);
        document.getElementById('confirmSubmit').addEventListener('click', confirmHandler);
        document.addEventListener('keydown', escHandler);
        modal.addEventListener('remove', () => document.removeEventListener('keydown', escHandler), { once: true });
    },

    submitAndShowResults() {
        this.submitted = true;
        if (this.timerInterval) clearInterval(this.timerInterval);

        let correctCount = 0;
        const resultsDetail = [];
        for (let idx = 0; idx < this.test.questions.length; idx++) {
            const q = this.test.questions[idx];
            const userAnswer = this.answers[idx];
            const isCorrect = (userAnswer !== null && userAnswer === q.correct);
            if (isCorrect) correctCount++;
            resultsDetail.push({
                question: q.question,
                userAnswer: userAnswer !== null ? q.options[userAnswer] : 'Not answered',
                correctAnswer: q.options[q.correct],
                isCorrect,
                explanation: q.explanation,
                paragraph: q.paragraph || '',
                options: q.options
            });
        }

        const total = this.test.questions.length;
        const percentage = ((correctCount / total) * 100).toFixed(1);
        const score = correctCount;
        const attemptData = {
            testId: this.test.id,
            testName: this.test.name,
            score,
            total,
            percentage,
            date: new Date().toISOString(),
            answers: this.answers,
            timeSeconds: this.timeSeconds
        };

        const attempts = JSON.parse(localStorage.getItem('cet_test_attempts') || '[]');
        attempts.push(attemptData);
        localStorage.setItem('cet_test_attempts', JSON.stringify(attempts));

        showToast(`Test submitted! Score: ${score}/${total} (${percentage}%)`, 'success', 'Test completed');

        const csvContent = generateCSV(this.test, resultsDetail, {
            score,
            total,
            percentage,
            date: attemptData.date,
            timeSeconds: this.timeSeconds
        });

        this.showResultsModal(csvContent, resultsDetail, { correctCount, total, percentage, score });
    },

    showResultsModal(csvContent, resultsDetail, summary) {
        const modalDiv = document.createElement('div');
        modalDiv.className = 'results-modal';
        modalDiv.innerHTML = `
            <div class="results-card">
                <div class="results-header">
                    <h2>
                        <svg width="25px" height="25px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 5a1 1 0 100 2h2.586l-3.293 3.293a1 1 0 101.414 1.414L13 8.414V11a1 1 0 102 0V6c0-.025 0-.05-.003-.075A1 1 0 0014 5H9zM1 14.5A1.5 1.5 0 012.5 13h3A1.5 1.5 0 017 14.5v3A1.5 1.5 0 015.5 19h-3A1.5 1.5 0 011 17.5v-3z" fill="#5C5F62"/>
                            <path d="M2.5 1A1.5 1.5 0 001 2.5V11h2V3h14v14H9v2h8.5a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0017.5 1h-15z" fill="#5C5F62"/>
                        </svg>
                        Test results
                    </h2>
                    <p>${escapeHtml(this.test.name)} &bull; ${new Date().toLocaleDateString()}</p>
                </div>
                <div class="score-summary">
                    <div class="score-card correct"><div class="score-value">${summary.correctCount}/${summary.total}</div><div class="score-label">Correct</div></div>
                    <div class="score-card incorrect"><div class="score-value">${summary.total - summary.correctCount}/${summary.total}</div><div class="score-label">Incorrect</div></div>
                    <div class="score-card percentage"><div class="score-value">${summary.percentage}%</div><div class="score-label">Score</div></div>
                </div>
                <div class="results-content">
                    ${resultsDetail.map((d, i) => `
                        <div class="question-review-item ${d.isCorrect ? 'correct' : 'incorrect'}">
                            <div class="q-text">Q${i+1}: ${escapeHtml(d.question)}</div>
                            <div class="answer-detail">Your answer: ${escapeHtml(d.userAnswer)}</div>
                            ${!d.isCorrect ? `<div class="answer-detail">Correct: ${escapeHtml(d.correctAnswer)}</div>` : ''}
                            <div class="explanation-box"><strong>Explanation:</strong> ${escapeHtml(d.explanation)}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="results-footer">
                    <button class="btn btn-secondary" id="exportCsvBtn">
                        <svg width="20px" height="20px" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                            <path class="cls-1" d="M325,105H250a5,5,0,0,1-5-5V25a5,5,0,1,1,10,0V95h70a5,5,0,0,1,0,10Z"/>
                            <path class="cls-1" d="M325,154.83a5,5,0,0,1-5-5V102.07L247.93,30H100A20,20,0,0,0,80,50v98.17a5,5,0,0,1-10,0V50a30,30,0,0,1,30-30H250a5,5,0,0,1,3.54,1.46l75,75A5,5,0,0,1,330,100v49.83A5,5,0,0,1,325,154.83Z"/>
                            <path class="cls-1" d="M300,380H100a30,30,0,0,1-30-30V275a5,5,0,0,1,10,0v75a20,20,0,0,0,20,20H300a20,20,0,0,0,20-20V275a5,5,0,0,1,10,0v75A30,30,0,0,1,300,380Z"/>
                            <path class="cls-1" d="M275,280H125a5,5,0,1,1,0-10H275a5,5,0,0,1,0,10Z"/>
                            <path class="cls-1" d="M200,330H125a5,5,0,1,1,0-10h75a5,5,0,0,1,0,10Z"/>
                            <path class="cls-1" d="M325,280H75a30,30,0,0,1-30-30V173.17a30,30,0,0,1,30-30h.2l250,1.66a30.09,30.09,0,0,1,29.81,30V250A30,30,0,0,1,325,280ZM75,153.17a20,20,0,0,0-20,20V250a20,20,0,0,0,20,20H325a20,20,0,0,0,20-20V174.83a20.06,20.06,0,0,0-19.88-20l-250-1.66Z"/>
                            <path class="cls-1" d="M168.48,217.48l8.91,1a20.84,20.84,0,0,1-6.19,13.18q-5.33,5.18-14,5.18-7.31,0-11.86-3.67a23.43,23.43,0,0,1-7-10,37.74,37.74,0,0,1-2.46-13.87q0-12.19,5.78-19.82t15.9-7.64a18.69,18.69,0,0,1,13.2,4.88q5.27,4.88,6.64,14l-8.91.94q-2.46-12.07-10.86-12.07-5.39,0-8.38,5t-3,14.55q0,9.69,3.2,14.63t8.48,4.94a9.3,9.3,0,0,0,7.19-3.32A13.25,13.25,0,0,0,168.48,217.48Z"/>
                            <path class="cls-1" d="M179.41,223.15l9.34-2q1.68,7.93,12.89,7.93,5.12,0,7.87-2a6.07,6.07,0,0,0,2.75-5,7.09,7.09,0,0,0-1.25-4q-1.25-1.85-5.35-2.91l-10.2-2.66a25.1,25.1,0,0,1-7.73-3.11,12.15,12.15,0,0,1-4-4.9,15.54,15.54,0,0,1-1.5-6.76,14,14,0,0,1,5.31-11.46q5.31-4.32,13.59-4.32a24.86,24.86,0,0,1,12.29,3,13.56,13.56,0,0,1,6.89,8.52l-9.14,2.27q-2.11-6.05-9.84-6.05-4.49,0-6.86,1.88a5.83,5.83,0,0,0-2.36,4.77q0,4.57,7.42,6.41l9.06,2.27q8.24,2.07,11.05,6.11a15.29,15.29,0,0,1,2.81,8.93,14.7,14.7,0,0,1-5.92,12.36q-5.92,4.51-15.33,4.51a28,28,0,0,1-13.89-3.32A16.29,16.29,0,0,1,179.41,223.15Z"/>
                            <path class="cls-1" d="M250.31,236h-9.77L224.1,182.68h10.16l12.23,40.86L259,182.68h8Z"/>
                        </svg>
                        Export CSV
                    </button>
                    <button class="btn btn-primary" id="homeBtn">
                        <svg fill="#000000" width="20px" height="20px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.5 14.69h-1.25V7.78a.62.62 0 0 0-.25-.47L8.4 2.7a.65.65 0 0 0-.81 0L2 7.31a.62.62 0 0 0-.22.47v6.91H.5V7.78a1.87 1.87 0 0 1 .68-1.44l5.62-4.6a1.88 1.88 0 0 1 2.39 0l5.63 4.6a1.87 1.87 0 0 1 .68 1.44z"/>
                            <path d="M11.05 12.11H9.8A1.72 1.72 0 0 0 8 10.49a1.72 1.72 0 0 0-1.8 1.62H5a3 3 0 0 1 3-2.87 3 3 0 0 1 3.05 2.87zm-6.1 0H6.2v2.58H4.95zm4.85 0h1.25v2.58H9.8z"/>
                        </svg>
                        Go home
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modalDiv);

        const exportHandler = () => downloadCSV(csvContent, `CETPrep_${this.test.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
        const homeHandler = () => { modalDiv.remove(); window.location.href = 'index.html'; };
        document.getElementById('exportCsvBtn')?.addEventListener('click', exportHandler);
        document.getElementById('homeBtn')?.addEventListener('click', homeHandler);
    },

    toggleTheme() {
        document.body.classList.toggle('light');
        const isLight = document.body.classList.contains('light');
        localStorage.setItem('cetprep-theme', isLight ? 'light' : 'dark');
        showToast(`${isLight ? 'Light' : 'Dark'} mode`, 'info');
    }
}));

Alpine.start();