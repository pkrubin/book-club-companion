/**
 * Simple In-Memory Logger for Debugging
 * Allows capturing logs and downloading them as a file.
 */
window.Logger = (function () {
    const logs = [];
    const maxLogs = 1000;

    function log(level, message, data = null) {
        const entry = {
            timestamp: new Date().toISOString(),
            level: level,
            message: message,
            data: data ? JSON.stringify(data, null, 2) : null
        };
        logs.push(entry);
        if (logs.length > maxLogs) logs.shift();

        // Also log to console for immediate visibility
        const styles = {
            INFO: 'color: #0ea5e9; font-weight: bold;',
            ERROR: 'color: #f43f5e; font-weight: bold;',
            WARN: 'color: #f59e0b; font-weight: bold;'
        };
        console.log(`%c[${level}] ${message}`, styles[level] || '', data || '');
    }

    return {
        info: (msg, data) => log('INFO', msg, data),
        error: (msg, data) => log('ERROR', msg, data),
        warn: (msg, data) => log('WARN', msg, data),

        getLogs: () => logs,

        download: () => {
            if (logs.length === 0) {
                alert('No logs to download.');
                return;
            }
            const blob = new Blob([logs.map(l => `[${l.timestamp}] [${l.level}] ${l.message} ${l.data || ''}`).join('\n')], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `book_club_debug_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };
})();
