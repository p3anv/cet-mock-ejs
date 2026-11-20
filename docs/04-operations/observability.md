---
title: CETPrep — Observability (As-Deployed)
owner: Platform Team
status: as-built
last_reviewed: 2026-11-20
audience: [sre, engineers, maintainers]
source_of_truth: true
---

# CETPrep — Observability

> **Current State**: Zero observability infrastructure. No logs, metrics, traces, health checks, dashboards, or alerts.
> This documents what exists (browser console) and what a proper setup would need.

---

## What Exists Today

| Signal | Implementation | Coverage |
|--------|----------------|----------|
| **Logs** | `console.log/error/warn` in browser DevTools | Dev only; not persisted |
| **Errors** | Uncaught → browser console | No capture, no alerting |
| **Metrics** | None | — |
| **Traces** | None | — |
| **Health Checks** | None | — |
| **Dashboards** | None | — |
| **Alerts** | None | — |

---

## Browser Console Logging (Current)

### Instrumented Points

| Location | Logs | Level |
|----------|------|-------|
| `main.js:214-244` `init()` | Theme load, routing | `log` |
| `main.js:334-362` `generateTest()` | Validation result, save | `log` / `error` (via toast) |
| `main.js:430-498` `loadFolderTests()` | GitHub API responses | `log` / `error` (via toast) |
| `main.js:580-622` `importTest()` | Import progress | `log` / `error` |
| `test.js:26-67` `init()` | Test load, timer start | `log` |
| `test.js:342-393` `submitAndShowResults()` | Score, save attempt | `log` |
| `storage.js` | Silent failures (quota, parse) | **None** (swallowed) |

### Missing Logs (Should Add)

| Area | What to Log |
|------|-------------|
| `storage.js` | Quota exceeded, parse errors, cascade deletes |
| `charts.js` | Render failures, destroy calls |
| `validate.js` | Validation failures (already via return value) |
| `csv.js` | Download trigger, blob creation |
| `ui.js` | Modal open/close, toast shown |
| Global | Uncaught errors, unhandled rejections |

---

## Proposed Observability Stack

### Option A: Minimal (Privacy-First, No Cost)

| Component | Tool | Implementation |
|-----------|------|----------------|
| **Error Tracking** | Sentry (free tier) | `Sentry.init({ dsn: '...' })` in `main.js` + `test.js` |
| **Web Vitals** | `web-vitals` lib | Send to console / custom endpoint |
| **Custom Events** | `localStorage` buffer + periodic flush | Track: test_created, test_attempted, import_used, chart_rendered |
| **Health Check** | `/health.html` static page | Returns 200 + version |

### Option B: Standard (Full Visibility)

| Component | Tool | Cost |
|-----------|------|------|
| **Error Tracking** | Sentry / LogRocket | $0-29/mo |
| **Analytics** | Plausible / Umami (self-hosted) | $9/mo / free |
| **Performance** | Web Vitals + custom marks | Free |
| **Session Replay** | LogRocket / Highlight | $0-60/mo |
| **Uptime** | UptimeRobot / Better Uptime | Free |

### Option C: Enterprise (If Needed)

| Component | Tool |
|-----------|------|
| **Logs** | Datadog / New Relic / Grafana Cloud |
| **Metrics** | Prometheus + Grafana |
| **Traces** | Jaeger / Tempo |
| **Alerting** | PagerDuty / Opsgenie |

---

## Implementation Sketch (Option A - Minimal)

### 1. Error Boundary (Global)

```javascript
// src/js/observability.js (new file)
export function initObservability() {
    // Uncaught errors
    window.addEventListener('error', (e) => {
        logError('uncaught', e.error || e.message, { filename: e.filename, lineno: e.lineno });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
        logError('unhandledrejection', e.reason);
    });

    // Custom error logger
    function logError(type, error, context = {}) {
        const payload = {
            type,
            message: error?.message || String(error),
            stack: error?.stack,
            context,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            // No PII
        };
        // Send to Sentry / custom endpoint / localStorage buffer
        console.error('[Observability]', payload);
    }
}

// Usage in main.js, test.js:
import { initObservability } from './observability.js';
initObservability();
```

### 2. Custom Event Tracking

```javascript
// src/js/analytics.js (new file)
const EVENT_BUFFER_KEY = 'cetprep_events';
const MAX_BUFFER = 100;

export function trackEvent(name, properties = {}) {
    const event = {
        name,
        properties,
        timestamp: Date.now(),
        sessionId: getSessionId(),
    };
    const buffer = JSON.parse(localStorage.getItem(EVENT_BUFFER_KEY) || '[]');
    buffer.push(event);
    if (buffer.length > MAX_BUFFER) buffer.shift();
    localStorage.setItem(EVENT_BUFFER_KEY, JSON.stringify(buffer));
}

// Flush on page unload / periodically
window.addEventListener('beforeunload', flushEvents);
setInterval(flushEvents, 30000);

async function flushEvents() {
    const buffer = JSON.parse(localStorage.getItem(EVENT_BUFFER_KEY) || '[]');
    if (!buffer.length) return;
    // Send to endpoint (if configured) or keep local
    localStorage.setItem(EVENT_BUFFER_KEY, '[]');
}

// Events to track:
// trackEvent('test_created', { category, questionCount })
// trackEvent('test_attempted', { testId, questionCount })
// trackEvent('test_submitted', { testId, score, timeSeconds })
// trackEvent('import_used', { folder, count })
// trackEvent('chart_rendered', { type, dataPoints })
// trackEvent('theme_changed', { theme })
```

### 3. Web Vitals

```html
<!-- index.html, test.html -->
<script type="module">
import { onCLS, onFID, onLCP, onTTFB } from 'https://cdn.jsdelivr.net/npm/web-vitals@4/+esm';
function send(metric) { console.log('[WebVital]', metric); }
onCLS(send); onFID(send); onLCP(send); onTTFB(send);
</script>
```

### 4. Health Check Endpoint

```html
<!-- public/health.html -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>CETPrep Health</title>
</head>
<body>
    <pre id="out"></pre>
    <script type="module">
        import { version } from '../package.json'; // Vite injects
        document.getElementById('out').textContent = JSON.stringify({
            status: 'ok',
            version,
            timestamp: new Date().toISOString(),
            buildTime: '__BUILD_TIME__' // Vite define
        }, null, 2);
    </script>
</body>
</html>
```

**Vite config addition**:
```javascript
// vite.config.js
export default defineConfig({
    define: {
        __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
});
```

---

## Key Metrics to Track (When Implemented)

| Metric | Type | Target | Source |
|--------|------|--------|--------|
| **Page Load (LCP)** | Web Vital | < 2.5s | `web-vitals` |
| **Interactivity (FID)** | Web Vital | < 100ms | `web-vitals` |
| **Visual Stability (CLS)** | Web Vital | < 0.1 | `web-vitals` |
| **JS Error Rate** | Counter | 0/min | Error boundary |
| **Test Create Success** | Counter | 100% | `trackEvent` |
| **Test Submit Success** | Counter | 100% | `trackEvent` |
| **Import Success Rate** | Ratio | > 95% | `trackEvent` |
| **Chart Render Failures** | Counter | 0 | `charts.js` wrapper |
| **localStorage Quota Errors** | Counter | 0 | `storage.js` wrapper |

---

## Dashboards (Not Implemented)

| Dashboard | Panels | Tool |
|-----------|--------|------|
| **Overview** | Error rate, active users, test creates, submits | Grafana / Sentry / Plausible |
| **Performance** | LCP, FID, CLS trends | Web Vitals |
| **Features** | Import success, chart renders, theme usage | Custom events |
| **Errors** | By type, page, browser | Sentry |

---

## Alerting (Not Implemented)

| Alert | Condition | Severity | Channel |
|-------|-----------|----------|---------|
| **JS Error Spike** | > 10 errors/5min | Critical | Email / Slack |
| **Import Failure Rate** | > 20% in 1hr | High | Email |
| **Build Failure** | CI fails | High | GitHub Actions |
| **Deploy Failure** | Deploy script fails | High | GitHub Actions |

---

## Privacy Considerations

- **No PII collected**: User tests/answers stored locally only
- **No tracking cookies**: localStorage only for app data
- **Analytics opt-out**: Respect `navigator.doNotTrack` or provide toggle
- **Data retention**: Event buffer auto-prunes (100 events)
- **GDPR/CCPA**: No personal data leaves browser unless error tracking enabled

---

## Related Documents

- [Deployment](deployment.md#monitoring-not-implemented)
- [Runbooks](runbooks/) — Operational procedures
- [Incident Response](incident-response.md) — Severity matrix
- [Tech Debt TD-016](03-development/tech-debt-register.md#td-016-no-error-boundary--global-error-handling)
- [Security: Data Classification](05-security/data-classification.md)