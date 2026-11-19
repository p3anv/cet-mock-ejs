const supportedCharts = ['[BARGRAPH]', '[LINEGRAPH]', '[PIEGRAPH]', '[TABLE]'];

export function validateJSONStructure(data) {
    if (!Array.isArray(data)) return { valid: false, error: "Must be an array." };
    if (!data.length) return { valid: false, error: "At least one question required." };
    for (let i=0; i<data.length; i++) {
        const q = data[i];
        if (!q.question || typeof q.question !== 'string') return { valid: false, error: `Q${i+1}: missing question` };
        if (!Array.isArray(q.options) || q.options.length !== 5) return { valid: false, error: `Q${i+1}: need 5 options` };
        if (typeof q.correct !== 'number' || q.correct<0 || q.correct>4) return { valid: false, error: `Q${i+1}: correct 0-4` };
        if (!q.explanation || typeof q.explanation !== 'string') return { valid: false, error: `Q${i+1}: missing explanation` };
        if (q.hasOwnProperty('paragraph') && typeof q.paragraph !== 'string') return { valid: false, error: `Q${i+1}: paragraph must be string` };
        if (q.paragraph) {
            const lines = q.paragraph.split('\n');
            let chartFound = false;
            let currentChartType = null;
            let chartLineCount = 0;

            for (let j = 0; j < lines.length; j++) {
                const line = lines[j].trim();
                const upperLine = line.toUpperCase();

                // Check for chart type markers
                if (supportedCharts.some(c => upperLine.startsWith(c))) {
                    chartFound = true;
                    currentChartType = upperLine.split(']')[0].substring(1);
                    chartLineCount = 0;
                } else if (currentChartType) {
                    if (!currentChartType.startsWith('[TABLE')) {
                        // Title line for non-table charts
                        currentChartType = 'TITLE';
                    } else {
                        chartLineCount++;
                    }
                } else if (currentChartType === 'TITLE') {
                    // Data lines for non-table charts
                    if (line && line.includes(':')) {
                        const [, val] = line.split(':');
                        const numVal = parseFloat(val.trim());
                        if (isNaN(numVal)) {
                            return { valid: false, error: `Q${i+1}: chart values must be numbers, got '${val.trim()}'` };
                        }
                    }
                } else if (currentChartType && currentChartType.startsWith('TABLE')) {
                    // Table data lines
                    if (line && line.includes('|')) {
                        chartLineCount++;
                    }
                }
            }

            if (chartFound) {
                // Could add more validation here if needed
            }
        }
    }
    return { valid: true };
}