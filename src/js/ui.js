import { getTestById, getAllAttempts } from './storage.js';

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, m => m === '&' ? '&' : (m === '<' ? '<' : '>'));
}

function getToastComponent() {
    const el = document.querySelector('[x-data="toast"]');
    return el ? Alpine.$data(el) : null;
}

export function showToast(message, type = 'success', title = '') {
    const toast = getToastComponent();
    if (toast && typeof toast.showToast === 'function') {
        toast.showToast(message, type, title);
    } else {
        console.warn('Toast component not ready');
    }
}

export function showConfirmModal(message, onConfirm, onCancel = null) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-box">
            <h3>Confirm</h3>
            <p>${escapeHtml(message)}</p>
            <div class="modal-actions">
                <button class="btn btn-secondary" id="modalCancel">Cancel</button>
                <button class="btn btn-danger" id="modalConfirm">Confirm</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const cancelHandler = () => {
        modal.remove();
        if(onCancel) onCancel();
    };
    const confirmHandler = () => {
        modal.remove();
        onConfirm();
    };
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            if(onCancel) onCancel();
            document.removeEventListener('keydown', escHandler);
        }
    };

    document.getElementById('modalCancel').addEventListener('click', cancelHandler);
    document.getElementById('modalConfirm').addEventListener('click', confirmHandler);
    document.addEventListener('keydown', escHandler);
    modal.addEventListener('remove', () => document.removeEventListener('keydown', escHandler), { once: true });
}

export function showHistoryModal(testId) {
    const test = getTestById(testId);
    if (!test) return;
    const attempts = getAllAttempts().filter(a => a.testId === testId);
    if (!attempts.length) {
        showToast('No attempts yet.', 'info');
        return;
    }
    const modal = document.createElement('div');
    modal.className = 'modal-overlay history-modal';
    modal.innerHTML = `
        <div class="modal-box">
            <div class="history-header">
                <h3>${escapeHtml(test.name)}</h3>
                <button class="history-close" id="closeHistoryBtn">&times;</button>
            </div>
            <div class="history-list">
                ${attempts.map((a, i) => `
                    <div class="attempt-item">
                        <div class="attempt-header">
                            <span class="attempt-number">Attempt #${attempts.length - i}</span>
                            <span class="attempt-date">${new Date(a.date).toLocaleString()}</span>
                        </div>
                        <div class="attempt-score">
                            Score: <span>${a.score}/${a.total}</span>
                        </div>
                        <div class="attempt-percentage">
                            ${a.percentage}% &bull; ${a.percentage >= 70 ? 'Excellent' : (a.percentage >= 40 ? 'Good' : 'Keep practicing')}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="history-footer">
                <button class="btn btn-secondary" id="closeFooterBtn">Close</button>
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
    document.getElementById('closeHistoryBtn')?.addEventListener('click', closeModal);
    document.getElementById('closeFooterBtn')?.addEventListener('click', closeModal);
}