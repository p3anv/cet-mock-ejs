import { unparse } from 'papaparse';

export function generateCSV(test, resultsDetail, summary) {
    const rows = [];
    rows.push(['Test Name', 'Category', 'Date', 'Time Taken (seconds)', 'Score', 'Total', 'Percentage']);
    rows.push([test.name, test.category || 'Misc', summary.date, summary.timeSeconds, summary.score, summary.total, summary.percentage + '%']);
    rows.push([]);
    rows.push(['Question #', 'Question', 'Your Answer', 'Correct Answer', 'Result', 'Options', 'Explanation', 'Paragraph/Data']);
    resultsDetail.forEach((d, i) => {
        const optionsStr = d.options.join(' | ');
        const paragraphStr = d.paragraph ? d.paragraph.replace(/\n/g, ' ') : '';
        rows.push([i + 1, d.question, d.userAnswer, d.correctAnswer, d.isCorrect ? 'Correct' : 'Incorrect', optionsStr, d.explanation, paragraphStr]);
    });
    return unparse(rows);
}

export function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 100);
}