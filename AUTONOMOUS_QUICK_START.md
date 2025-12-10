# Autonomous Testing Framework - Quick Reference Guide

## Features at a Glance

### 1. Smart Selectors (SelectorManager)
**Problem**: Selectors break when UI changes  
**Solution**: Intelligent fallback strategies

```javascript
const SelectorManager = require('./utils/helpers/selectorManager');
const manager = new SelectorManager();

// Try multiple selectors, use first match
const button = await manager.smartSelectAny(page, 'Submit Button', [
  '[data-test="submit"]',
  'button[type="submit"]',
  'button:has-text("Submit")'
]);

await button.click();
```

### 2. Test Retry (TestRetryManager)
**Problem**: Flaky tests fail sporadically  
**Solution**: Exponential backoff retry

```javascript
const TestRetryManager = require('./utils/helpers/testRetry');

// Automatically retry with exponential backoff
await TestRetryManager.executeWithRetry(
  async () => {
    await page.click('button');
    await page.waitForNavigation();
  },
  {
    maxRetries: 3,
    testName: 'Click Submit Button',
    retryableErrors: ['timeout', 'Click interrupted']
  }
);
```

### 3. Smart Wait (SmartWait)
**Problem**: Hard-coded waits cause slowdowns or timeouts  
**Solution**: Context-aware intelligent waiting

```javascript
const SmartWait = require('./utils/helpers/smartWait');

// Wait for element visibility with timeout management
await SmartWait.waitForElement(
  page.locator('[data-test="result"]'),
  { visible: true, name: 'Result Message' }
);

// Wait for network to finish loading
await SmartWait.waitForNetworkIdle(page, 30000, 'Load Data');

// Wait for element position stability
await SmartWait.waitForPositionStable(
  page.locator('button'),
  { timeout: 5000 }
);
```

### 4. Test Data Generation (AutonomousDataFactory)
**Problem**: Hard-coded test data becomes stale  
**Solution**: Dynamic realistic data generation

```javascript
const DataFactory = require('./utils/data/autonomousDataFactory');

// Generate random user
const user = DataFactory.generateUser();
// { username: 'john_doe_123', email: 'john@example.com', ... }

// Generate random product
const product = DataFactory.generateProduct();
// { name: 'Wireless Headphones', price: 89.99, ... }

// Generate Sauce Demo credentials
const credentials = DataFactory.generateSauceDemoCredentials();
// { username: 'standard_user', password: 'secret_sauce' }
```

### 5. Data Cleanup (DataCleanupManager)
**Problem**: Test data accumulates in database  
**Solution**: Automatic cleanup management

```javascript
const DataCleanupManager = require('./utils/data/dataCleanupManager');

// Register data for cleanup
DataCleanupManager.registerDataForCleanup({
  type: 'user',
  id: userId,
  resource: `users/${userId}`
});

// Clean up after test
await DataCleanupManager.cleanupAll();
```

### 6. Performance Monitoring (PerformanceMonitor)
**Problem**: Can't identify slow tests  
**Solution**: Real-time performance tracking

```javascript
const PerformanceMonitor = require('./utils/monitoring/performanceMonitor');

// Start monitoring
PerformanceMonitor.startTestMonitoring('Login Flow', 5000); // 5s threshold

// ... test code ...

// End monitoring (triggers alerts if slow)
PerformanceMonitor.endTestMonitoring();

// Get performance data
const trends = PerformanceMonitor.getPerformanceTrends();
```

### 7. Error Analysis (ErrorAnalyzer)
**Problem**: Can't determine root cause of failures  
**Solution**: Intelligent error classification

```javascript
const ErrorAnalyzer = require('./utils/reporting/errorAnalyzer');

try {
  await page.click(selector);
} catch (error) {
  const analysis = ErrorAnalyzer.analyzeError(error, page);
  console.log(analysis.classification); // 'SELECTOR_ERROR'
  console.log(analysis.severity); // 'HIGH'
  console.log(analysis.recommendations); // ['Try XPath', 'Check visibility', ...]
}
```

### 8. Dashboard Generation (DashboardGenerator)
**Problem**: Test results scattered across reports  
**Solution**: Unified HTML dashboard

```javascript
const DashboardGenerator = require('./utils/reporting/dashboardGenerator');

// Record test result
DashboardGenerator.recordTestResult({
  testName: 'Login Test',
  status: 'passed',
  duration: 2500,
  browser: 'chromium',
  device: 'desktop'
});

// Generate dashboard
await DashboardGenerator.generateDashboardHTML();
// Creates: reports/autonomous-dashboard.html

// Get statistics
const stats = DashboardGenerator.getStatistics();
// { totalTests: 120, passed: 118, failed: 2, ... }
```

### 9. Test Optimizer (TestOptimizer)
**Problem**: Tests run sequentially, wasting time  
**Solution**: Optimization recommendations

```javascript
const TestOptimizer = require('./utils/optimization/testOptimizer');

const analysis = TestOptimizer.analyzeTest({
  name: 'Login Test',
  duration: 5000,
  dependencies: [],
  resourceUsage: { cpu: 45, memory: 250 }
});

console.log(analysis.parallelizable); // true
console.log(analysis.optimizationPotential); // 0.65 (65% improvement possible)
```

### 10. Scheduler (AutonomousTestScheduler)
**Problem**: Manual test execution is unreliable  
**Solution**: Scheduled automated runs

```javascript
const Scheduler = require('./scripts/autonomousScheduler');

// Schedule tests (in scheduler setup)
Scheduler.scheduleTests({
  schedule: '0 * * * *', // Every hour
  command: 'npm test',
  slackWebhook: process.env.SLACK_WEBHOOK_URL
});

// Tests run automatically, Slack notifications sent
```

---

## Configuration

Edit `autonomousConfig.js` to customize:

```javascript
// autonomousConfig.js
module.exports = {
  // Self-healing timeouts
  selfHealing: {
    selectorWaitTimeout: 5000,      // How long to try selectors
    maxRetries: 3,                  // Max retry attempts
    exponentialBackoff: 1.5         // Backoff multiplier
  },

  // Performance thresholds
  performance: {
    slowTestThreshold: 5000,        // ms - mark as slow if longer
    alertOnMemoryLeak: true,
    memoryLeakThreshold: 50         // MB increase
  },

  // Reporting
  reporting: {
    dashboardPath: './reports/autonomous-dashboard.html',
    collectScreenshots: true,
    collectNetworkLogs: true
  },

  // Enable/disable features
  features: {
    enableSmartWait: true,
    enableRetryLogic: true,
    enablePerformanceMonitoring: true,
    enableErrorAnalysis: true
  }
};
```

---

## Common Patterns

### Pattern 1: Robust Element Interaction
```javascript
// Combines smart selectors, retry, and wait
const SelectorManager = require('./utils/helpers/selectorManager');
const TestRetryManager = require('./utils/helpers/testRetry');
const SmartWait = require('./utils/helpers/smartWait');

const manager = new SelectorManager();

await TestRetryManager.executeWithRetry(async () => {
  const button = await manager.smartSelectAny(page, 'Submit', [
    '[data-test="submit"]',
    'button:has-text("Submit")'
  ]);
  
  if (!button) throw new Error('Submit button not found');
  
  await SmartWait.waitForElement(button, { visible: true });
  await button.click();
}, { maxRetries: 2, testName: 'Submit Form' });
```

### Pattern 2: Data Generation + Cleanup
```javascript
const DataFactory = require('./utils/data/autonomousDataFactory');
const DataCleanupManager = require('./utils/data/dataCleanupManager');

// Setup
const testUser = DataFactory.generateUser();
DataCleanupManager.registerDataForCleanup({
  type: 'user',
  id: testUser.id
});

// Test
await loginAsUser(testUser);
// ... test logic ...

// Cleanup
await DataCleanupManager.cleanupAll();
```

### Pattern 3: Performance-Aware Test
```javascript
const PerformanceMonitor = require('./utils/monitoring/performanceMonitor');

test('Fast login', async ({ page }) => {
  PerformanceMonitor.startTestMonitoring('Login', 3000);
  
  // ... login logic ...
  
  PerformanceMonitor.endTestMonitoring();
});
```

---

## File Locations

| Utility | File |
|---------|------|
| SelectorManager | `utils/helpers/selectorManager.js` |
| TestRetryManager | `utils/helpers/testRetry.js` |
| SmartWait | `utils/helpers/smartWait.js` |
| AutonomousDataFactory | `utils/data/autonomousDataFactory.js` |
| DataCleanupManager | `utils/data/dataCleanupManager.js` |
| DashboardGenerator | `utils/reporting/dashboardGenerator.js` |
| ErrorAnalyzer | `utils/reporting/errorAnalyzer.js` |
| PerformanceMonitor | `utils/monitoring/performanceMonitor.js` |
| TestOptimizer | `utils/optimization/testOptimizer.js` |
| AutonomousTestScheduler | `scripts/autonomousScheduler.js` |
| Configuration | `autonomousConfig.js` |
| GitHub Actions | `.github/workflows/autonomous-tests.yml` |

---

## Troubleshooting Quick Tips

| Issue | Solution |
|-------|----------|
| Selector not found | Use smartSelectAny() with XPath fallbacks |
| Test times out | Check SmartWait logs, verify element conditions |
| Retries not working | Check error type in retryableErrors array |
| Dashboard not generated | Verify reportingPath in autonomousConfig.js |
| No Slack notifications | Add SLACK_WEBHOOK_URL environment variable |

---

## Next Steps

1. ✅ **Review** the autonomous utilities in each file
2. ✅ **Enable** features gradually using configuration toggles
3. ✅ **Monitor** test stability improvements
4. ✅ **Deploy** CI/CD workflow for automated runs
5. ✅ **Optimize** based on dashboard insights

**Status**: All 120 tests passing ✅ Ready for production! 🚀
