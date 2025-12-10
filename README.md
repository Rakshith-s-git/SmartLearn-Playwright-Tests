# 🎯 SmartLearn Playwright Automation - Autonomous Testing Framework

> **Production-Ready Autonomous Testing Framework with 120+ Tests and 6-Phase Architecture**

[![Tests](https://github.com/Rakshith-s-git/SmartLearn-Playwright-Tests/actions/workflows/autonomous-tests.yml/badge.svg)](https://github.com/Rakshith-s-git/SmartLearn-Playwright-Tests/actions)
[![All Tests Passing](https://img.shields.io/badge/tests-120%2F120%20passing-brightgreen)](https://github.com/Rakshith-s-git/SmartLearn-Playwright-Tests)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## ✨ Overview

This is a **production-ready autonomous testing framework** built with Playwright that demonstrates:

✅ **120+ Tests Passing** - All tests running across 6 browser/device configurations  
✅ **Self-Healing Capabilities** - Smart selectors with automatic fallback strategies  
✅ **Intelligent Retry Logic** - Exponential backoff for flaky tests  
✅ **Comprehensive Reporting** - HTML dashboards with detailed metrics  
✅ **CI/CD Automation** - GitHub Actions with scheduled test runs  
✅ **Performance Monitoring** - Real-time timing and memory tracking  
✅ **Data Management** - Faker-based test data generation with auto-cleanup  
✅ **Error Analysis** - Intelligent error classification and recommendations  

## 🏗️ 6-Phase Autonomous Architecture

### **Phase 1: Self-Healing Utilities**
- `SelectorManager` - Smart selector discovery with fallback strategies
- `TestRetryManager` - Exponential backoff retry mechanism
- `SmartWait` - Context-aware intelligent wait strategies

### **Phase 2: Reporting & Analytics**
- `DashboardGenerator` - Beautiful HTML dashboard with statistics
- `ErrorAnalyzer` - Error classification and recovery recommendations

### **Phase 3: CI/CD Integration**
- `AutonomousTestScheduler` - Cron-based test scheduling
- GitHub Actions workflow - Multi-browser matrix testing

### **Phase 4: Data Management**
- `AutonomousDataFactory` - Faker.js test data generation
- `DataCleanupManager` - Automatic data lifecycle management

### **Phase 5: Performance Monitoring**
- `PerformanceMonitor` - Test timing and memory tracking
- `TestOptimizer` - Optimization recommendations

### **Phase 6: Configuration**
- `autonomousConfig.js` - Centralized feature management

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Rakshith-s-git/SmartLearn-Playwright-Tests.git
cd SmartLearn-Playwright-Tests

# Install dependencies
npm install

# Verify setup
npm test
```

## Tech Stack
- **Playwright Test** (@playwright/test v1.35.0+)
- **JavaScript** (ES6+)
- **GitHub Actions** (CI/CD automation)
- **Faker.js** (Test data generation)
- **Node.js** (14+ required)

## 📊 Test Results

| Component | Count | Status |
|-----------|-------|--------|
| **Total Tests** | 120 | ✅ All Passing |
| **Desktop Tests** | 72 | ✅ Chromium, Firefox, WebKit |
| **Mobile Tests** | 48 | ✅ Pixel 5, iPhone 12, Galaxy S9+ |
| **Pass Rate** | 100% | ✅ Production Ready |
| **Test Duration** | ~1.2 min | ✅ Optimized |

### Run Tests

```bash
# Run all tests (headless)
npm test

# Run tests in headed mode (see browser)
npm run test:headed

# Run specific test file
npx playwright test tests/login.spec.js

# View test report
npx playwright show-report
```

## 📁 Project Structure
- `tests/` - Playwright test suites (120+ tests)
- `pages/` - Page Object Model classes (4 POM files)
- `utils/` - Autonomous framework utilities (11 files)
  - `helpers/` - Self-healing utilities (SelectorManager, TestRetryManager, SmartWait)
  - `reporting/` - Reporting tools (DashboardGenerator, ErrorAnalyzer)
  - `data/` - Data management (AutonomousDataFactory, DataCleanupManager)
  - `monitoring/` - Performance tracking (PerformanceMonitor, TestOptimizer)
- `scripts/` - Automation scheduler (autonomousScheduler.js)
- `.github/workflows/` - GitHub Actions CI/CD (autonomous-tests.yml)
- `autonomousConfig.js` - Centralized configuration
- `playwright.config.js` - Playwright configuration

## 🎯 Key Features

### Smart Selectors with Fallbacks
```javascript
const SelectorManager = require('./utils/helpers/selectorManager');
const manager = new SelectorManager();
const element = await manager.smartSelectAny(page, 'Button', [
  '[data-test="submit"]',
  'button[type="submit"]',
  'button:has-text("Submit")'
]);
```

### Intelligent Retry Logic
```javascript
const TestRetryManager = require('./utils/helpers/testRetry');
await TestRetryManager.executeWithRetry(
  async () => { /* test code */ },
  { maxRetries: 3, testName: 'My Test' }
);
```

### Smart Wait Strategies
```javascript
const SmartWait = require('./utils/helpers/smartWait');
await SmartWait.waitForElement(page.locator(selector), { visible: true });
await SmartWait.waitForNetworkIdle(page, 30000);
await SmartWait.waitForPositionStable(page.locator('button'));
```

### Test Data Generation
```javascript
const DataFactory = require('./utils/data/autonomousDataFactory');
const user = DataFactory.generateUser();
const product = DataFactory.generateProduct();
const credentials = DataFactory.generateSauceDemoCredentials();
```

### Performance Monitoring
```javascript
const PerformanceMonitor = require('./utils/monitoring/performanceMonitor');
PerformanceMonitor.startTestMonitoring('Test Name', 5000);
// ... test code ...
PerformanceMonitor.endTestMonitoring();
```

## ⚙️ Configuration

Edit `autonomousConfig.js` to customize autonomous features:

```javascript
module.exports = {
  selfHealing: {
    selectorWaitTimeout: 5000,      // How long to try selectors
    maxRetries: 3,                  // Max retry attempts
    exponentialBackoff: 1.5         // Backoff multiplier
  },
  performance: {
    slowTestThreshold: 5000,        // Mark as slow if longer (ms)
    alertOnMemoryLeak: true,
    memoryLeakThreshold: 50         // MB increase
  },
  reporting: {
    dashboardPath: './reports/autonomous-dashboard.html',
    collectScreenshots: true,
    collectNetworkLogs: true
  },
  features: {
    enableSmartWait: true,
    enableRetryLogic: true,
    enablePerformanceMonitoring: true,
    enableErrorAnalysis: true
  }
};
```

## 🔄 GitHub Actions CI/CD

The project includes automated testing via GitHub Actions:

**Scheduled Runs:**
- ⏰ Hourly smoke tests (all tests)
- 📅 Daily comprehensive tests (multi-browser)

**Triggers:**
- Manual trigger (on-demand)
- Push to main/develop branches
- Pull requests

**Coverage:**
- ✅ Chromium, Firefox, WebKit (desktop)
- ✅ Pixel 5, iPhone 12, Galaxy S9+ (mobile)

**View Status:** [GitHub Actions](https://github.com/Rakshith-s-git/SmartLearn-Playwright-Tests/actions)

## 📚 Documentation

- **[AUTONOMOUS_QUICK_START.md](AUTONOMOUS_QUICK_START.md)** - Quick reference with code examples
- **[AUTONOMOUS_FRAMEWORK_GUIDE.md](AUTONOMOUS_FRAMEWORK_GUIDE.md)** - Complete 6-phase architecture
- **[autonomousConfig.js](autonomousConfig.js)** - All configuration options documented
- Individual utility files - JSDoc comments with detailed examples

## 🛠️ Setup

