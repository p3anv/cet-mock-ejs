import Chart from 'chart.js/auto';

const CHART_COLORS = {
    primary: '#b8965c',
    success: '#4cc38a',
    danger: '#e5484d',
    warning: '#d9a441',
    info: '#5cb8e8',
};

const CHART_COLORS_LIGHT = {
    primary: '#9a7d3a',
    success: '#16a34a',
    danger: '#dc2626',
    warning: '#d97706',
    info: '#0284c7',
};

function getCSSVar(name, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
}

function getChartColors() {
    const isLight = document.body.classList.contains('light');
    const colorSet = isLight ? CHART_COLORS_LIGHT : CHART_COLORS;

    return {
        bar: colorSet.primary,
        line: colorSet.success,
        linePoints: colorSet.warning,
        pie: [colorSet.primary, colorSet.success, colorSet.warning, colorSet.danger, '#8b5cf6', '#0284c7'],
        text: getCSSVar('--color-text', isLight ? '#1f1b16' : '#ededed'),
        textSecondary: getCSSVar('--color-text-secondary', isLight ? '#5e554a' : '#a1a1a6'),
        gridColor: getCSSVar('--color-border', isLight ? '#e0dcd3' : '#2a2a2f'),
        backgroundColor: getCSSVar('--color-surface', isLight ? '#ffffff' : '#1a1a1d'),
    };
}

const defaultOptions = {
    maintainAspectRatio: false,
    responsive: true,
    animation: {
        duration: 300,
        easing: 'easeOutQuart'
    },
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            backgroundColor: getCSSVar('--color-surface-raised', '#2a2a30'),
            titleColor: getCSSVar('--color-text', '#ededed'),
            bodyColor: getCSSVar('--color-text-secondary', '#a1a1a6'),
            borderColor: getCSSVar('--color-border', '#2a2a2f'),
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            titleFont: { size: 13, weight: '500' },
            bodyFont: { size: 12 }
        }
    }
};

let chartInstances = new Map();

export function destroyChart(canvasId) {
    const existing = chartInstances.get(canvasId);
    if (existing) {
        existing.destroy();
        chartInstances.delete(canvasId);
    }
}

export function renderBarGraph(canvasId, title, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    destroyChart(canvasId);

    canvas.className = 'chart-canvas chart-bar';
    canvas.setAttribute('data-count', Object.keys(data).length);
    const colors = getChartColors();
    const labels = Object.keys(data);
    const values = Object.values(data);

    const chart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: title,
                data: values,
                backgroundColor: colors.bar,
                borderColor: colors.bar,
                borderWidth: 0,
                borderRadius: 6,
                borderSkipped: false,
            }]
        },
        options: {
            ...defaultOptions,
            plugins: {
                ...defaultOptions.plugins,
                title: {
                    display: true,
                    text: title,
                    color: colors.text,
                    font: { size: 14, weight: 'bold' },
                    padding: { bottom: 16 }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: colors.textSecondary, font: { size: 12 } }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: colors.gridColor },
                    ticks: { color: colors.textSecondary, font: { size: 12 } }
                }
            }
        }
    });

    chartInstances.set(canvasId, chart);
}

export function renderLineGraph(canvasId, title, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    destroyChart(canvasId);

    canvas.className = 'chart-canvas chart-line';
    canvas.setAttribute('data-count', Object.keys(data).length);
    const colors = getChartColors();
    const labels = Object.keys(data);
    const values = Object.values(data);

    const chart = new Chart(canvas, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: title,
                data: values,
                borderColor: colors.line,
                backgroundColor: colors.line + '20',
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointBackgroundColor: colors.linePoints,
                pointBorderColor: colors.linePoints,
                pointRadius: 5,
                pointHoverRadius: 7,
            }]
        },
        options: {
            ...defaultOptions,
            plugins: {
                ...defaultOptions.plugins,
                title: {
                    display: true,
                    text: title,
                    color: colors.text,
                    font: { size: 14, weight: 'bold' },
                    padding: { bottom: 16 }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: colors.textSecondary, font: { size: 12 } }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: colors.gridColor },
                    ticks: { color: colors.textSecondary, font: { size: 12 } }
                }
            }
        }
    });

    chartInstances.set(canvasId, chart);
}

export function renderPieChart(canvasId, title, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    destroyChart(canvasId);

    canvas.className = 'chart-canvas chart-pie';
    canvas.setAttribute('data-count', Object.keys(data).length);
    const colors = getChartColors();
    const labels = Object.keys(data);
    const values = Object.values(data);

    const chart = new Chart(canvas, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: colors.pie,
                borderWidth: 0,
            }]
        },
        options: {
            ...defaultOptions,
            plugins: {
                ...defaultOptions.plugins,
                title: {
                    display: true,
                    text: title,
                    color: colors.text,
                    font: { size: 14, weight: 'bold' },
                    padding: { bottom: 16 }
                },
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: colors.textSecondary,
                        font: { size: 11 },
                        padding: 16,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            }
        }
    });

    chartInstances.set(canvasId, chart);
}

export function renderTable(canvasId, title, rows) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    destroyChart(canvasId);

    const colors = getChartColors();

    const tableContainer = document.createElement('div');
    tableContainer.className = 'data-table-container';
    tableContainer.style.width = '100%';
    tableContainer.style.overflowX = 'auto';

    const table = document.createElement('table');
    table.className = 'data-table';

    const caption = document.createElement('caption');
    caption.textContent = title;
    caption.style.color = colors.text;
    caption.style.fontSize = '14px';
    caption.style.fontWeight = 'bold';
    caption.style.marginBottom = '12px';
    table.appendChild(caption);

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    rows[0].forEach(cell => {
        const th = document.createElement('th');
        th.textContent = cell;
        th.style.color = colors.textSecondary;
        th.style.background = colors.backgroundColor;
        th.style.borderBottom = `1px solid ${colors.gridColor}`;
        th.style.padding = '10px 12px';
        th.style.fontSize = '10px';
        th.style.fontWeight = '600';
        th.style.textTransform = 'uppercase';
        th.style.letterSpacing = '0.04em';
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    for (let i = 1; i < rows.length; i++) {
        const row = document.createElement('tr');
        rows[i].forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            td.style.padding = '10px 12px';
            td.style.borderBottom = i === rows.length - 1 ? 'none' : `1px solid ${colors.gridColor}`;
            td.style.color = colors.text;
            td.style.fontSize = '12px';
            row.appendChild(td);
        });
        row.style.transition = 'background 120ms';
        row.addEventListener('mouseenter', () => {
            row.style.background = colors.backgroundColor === '#1a1a1d' ? 'rgba(184, 150, 92, 0.12)' : 'rgba(154, 125, 58, 0.14)';
        });
        row.addEventListener('mouseleave', () => {
            row.style.background = 'transparent';
        });
        tbody.appendChild(row);
    }
    table.appendChild(tbody);

    tableContainer.appendChild(table);
    canvas.parentNode.replaceChild(tableContainer, canvas);
    tableContainer.id = canvasId;

    chartInstances.set(canvasId, { destroy: () => {} });
}

export function renderParagraphWithVisualizations(paragraphText, uniqueId) {
    if (!paragraphText) return '';

    const lines = paragraphText.split('\n');
    const visualizations = [];
    let currentChart = null;
    let chartLines = [];
    let plainTextLines = [];

    // Parse all chart blocks and plain text
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const upperLine = line.toUpperCase();

        // Check for chart type markers
        if (upperLine.startsWith('[BARGRAPH]') || upperLine.startsWith('[LINEGRAPH]') ||
            upperLine.startsWith('[PIEGRAPH]') || upperLine.startsWith('[TABLE]')) {
            // Save previous chart if exists
            if (currentChart) {
                visualizations.push({ type: currentChart.type, title: currentChart.title, data: chartLines, plainText: plainTextLines });
                plainTextLines = [];
            }
            const fullType = upperLine.split(']')[0].substring(1).toLowerCase();
            // Map full names to short names used by renderers
            const typeMap = { 'bargraph': 'bar', 'linegraph': 'line', 'piegraph': 'pie', 'table': 'table' };
            currentChart = { type: typeMap[fullType] || fullType, title: '' };
            chartLines = [];
        } else if (currentChart && !currentChart.title) {
            // This is the title line
            currentChart.title = line || 'Chart';
        } else if (currentChart) {
            // Chart data lines
            if (line) chartLines.push(lines[i]);
        } else {
            // Plain text before/after/between charts
            if (line) plainTextLines.push(lines[i]);
        }
    }
    // Save last chart
    if (currentChart) {
        visualizations.push({ type: currentChart.type, title: currentChart.title, data: chartLines, plainText: plainTextLines });
    }

    // If no charts found, return escaped plain text
    if (visualizations.length === 0) {
        return `<div>${escapeHtml(paragraphText)}</div>`;
    }

    // Build HTML with all visualizations
    let html = '';
    let vizIndex = 0;

    // Add any leading plain text
    if (visualizations[0].plainText.length > 0) {
        html += `<div class="paragraph-text">${escapeHtml(visualizations[0].plainText.join('\n'))}</div>`;
    }

    for (const viz of visualizations) {
        const canvasId = `${viz.type}Chart_${uniqueId}_${vizIndex++}`;

        if (viz.type === 'table') {
            const rows = [];
            for (const dataLine of viz.data) {
                const cols = dataLine.split('|').map(c => c.trim());
                if (cols.length > 1) rows.push(cols);
            }
            if (rows.length > 0) {
                setTimeout(() => renderTable(canvasId, viz.title, rows), 0);
                html += `<div class="chart-container"><table id="${canvasId}"></table></div>`;
            }
        } else {
            const data = {};
            for (const dataLine of viz.data) {
                const [key, val] = dataLine.split(':');
                if (key && val) {
                    let numVal = parseFloat(val.trim());
                    if (!isNaN(numVal)) {
                        data[key.trim()] = numVal;
                    }
                }
            }
            if (Object.keys(data).length > 0) {
                setTimeout(() => {
                    if (viz.type === 'bar') renderBarGraph(canvasId, viz.title, data);
                    else if (viz.type === 'line') renderLineGraph(canvasId, viz.title, data);
                    else if (viz.type === 'pie') renderPieChart(canvasId, viz.title, data);
                }, 0);
                html += `<div class="chart-container"><canvas id="${canvasId}"></canvas></div>`;
            }
        }

        // Add plain text after this chart
        if (viz.plainText.length > 0) {
            html += `<div class="paragraph-text">${escapeHtml(viz.plainText.join('\n'))}</div>`;
        }
    }

    return html;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, m => m === '&' ? '&' : (m === '<' ? '<' : '>'));
}