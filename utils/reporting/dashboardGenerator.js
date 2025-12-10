/**
 * DashboardGenerator - Autonomous Test Dashboard Generation
 * 
 * Generates beautiful HTML dashboards with:
 * - Test execution summaries
 * - Pass/fail rates by browser
 * - Execution time analytics
 * - Device-specific statistics
 * - Trend analysis
 */

const fs = require('fs');
const path = require('path');

class DashboardGenerator {
  constructor(outputDir = 'test-reports') {
    this.outputDir = outputDir;
    this.testResults = [];
    this.startTime = null;
    this.endTime = null;

    // Create output directory if not exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Record a test result
   * @param {Object} testResult
   */
  recordTestResult(testResult) {
    const {
      testName,
      status, // 'passed', 'failed', 'skipped'
      duration,
      browser,
      device,
      error,
      retries,
      tags,
    } = testResult;

    this.testResults.push({
      testName,
      status,
      duration: duration || 0,
      browser: browser || 'unknown',
      device: device || 'desktop',
      error: error || null,
      retries: retries || 0,
      tags: tags || [],
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Set test execution start time
   */
  startTestRun() {
    this.startTime = Date.now();
    this.testResults = [];
  }

  /**
   * Set test execution end time
   */
  endTestRun() {
    this.endTime = Date.now();
  }

  /**
   * Calculate aggregated statistics
   */
  getStatistics() {
    const stats = {
      totalTests: this.testResults.length,
      passed: 0,
      failed: 0,
      skipped: 0,
      totalDuration: 0,
      averageDuration: 0,
      passRate: '0%',
      byBrowser: {},
      byDevice: {},
      failedTests: [],
      slowestTests: [],
    };

    // Calculate basic stats
    this.testResults.forEach((result) => {
      if (result.status === 'passed') stats.passed++;
      else if (result.status === 'failed') stats.failed++;
      else if (result.status === 'skipped') stats.skipped++;

      stats.totalDuration += result.duration;

      // Track by browser
      if (!stats.byBrowser[result.browser]) {
        stats.byBrowser[result.browser] = {
          total: 0,
          passed: 0,
          failed: 0,
        };
      }
      stats.byBrowser[result.browser].total++;
      if (result.status === 'passed') {
        stats.byBrowser[result.browser].passed++;
      } else if (result.status === 'failed') {
        stats.byBrowser[result.browser].failed++;
      }

      // Track by device
      if (!stats.byDevice[result.device]) {
        stats.byDevice[result.device] = {
          total: 0,
          passed: 0,
          failed: 0,
        };
      }
      stats.byDevice[result.device].total++;
      if (result.status === 'passed') {
        stats.byDevice[result.device].passed++;
      } else if (result.status === 'failed') {
        stats.byDevice[result.device].failed++;
      }

      // Track failed tests
      if (result.status === 'failed') {
        stats.failedTests.push(result);
      }
    });

    // Calculate averages and rates
    stats.averageDuration = stats.totalTests > 0
      ? Math.round(stats.totalDuration / stats.totalTests)
      : 0;

    stats.passRate =
      stats.totalTests > 0
        ? ((stats.passed / stats.totalTests) * 100).toFixed(2) + '%'
        : '0%';

    // Get 5 slowest tests
    stats.slowestTests = [...this.testResults]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);

    return stats;
  }

  /**
   * Generate HTML dashboard
   * @returns {string} - HTML content
   */
  generateDashboardHTML() {
    const stats = this.getStatistics();
    const executionTime = this.endTime
      ? ((this.endTime - this.startTime) / 1000).toFixed(2)
      : 'N/A';

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Execution Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
        }

        .header {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }

        .header h1 {
            color: #333;
            margin-bottom: 10px;
        }

        .timestamp {
            color: #666;
            font-size: 14px;
        }

        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .metric-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            text-align: center;
        }

        .metric-card h3 {
            color: #666;
            font-size: 14px;
            text-transform: uppercase;
            margin-bottom: 10px;
            letter-spacing: 1px;
        }

        .metric-value {
            font-size: 32px;
            font-weight: bold;
            color: #333;
        }

        .metric-value.passed {
            color: #10b981;
        }

        .metric-value.failed {
            color: #ef4444;
        }

        .metric-value.skipped {
            color: #f59e0b;
        }

        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            margin-top: 10px;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            background: #10b981;
            border-radius: 4px;
        }

        .section {
            background: white;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 25px;
        }

        .section h2 {
            color: #333;
            margin-bottom: 20px;
            font-size: 18px;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }

        .browser-stats, .device-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }

        .stat-box {
            background: #f9fafb;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #667eea;
        }

        .stat-box h4 {
            color: #333;
            margin-bottom: 10px;
        }

        .stat-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            font-size: 13px;
        }

        .stat-label {
            color: #666;
        }

        .stat-value {
            font-weight: bold;
            color: #333;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th {
            background: #f3f4f6;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #333;
            border-bottom: 2px solid #e5e7eb;
        }

        td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
        }

        tr:hover {
            background: #f9fafb;
        }

        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
        }

        .status-passed {
            background: #dcfce7;
            color: #166534;
        }

        .status-failed {
            background: #fee2e2;
            color: #991b1b;
        }

        .status-skipped {
            background: #fef3c7;
            color: #92400e;
        }

        .duration {
            color: #666;
            font-size: 12px;
        }

        .footer {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 30px;
        }

        .alert {
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
        }

        .alert-warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 Test Execution Dashboard</h1>
            <p class="timestamp">Generated: ${new Date().toLocaleString()}</p>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <h3>Total Tests</h3>
                <div class="metric-value">${stats.totalTests}</div>
            </div>
            <div class="metric-card">
                <h3>Passed</h3>
                <div class="metric-value passed">${stats.passed}</div>
            </div>
            <div class="metric-card">
                <h3>Failed</h3>
                <div class="metric-value failed">${stats.failed}</div>
            </div>
            <div class="metric-card">
                <h3>Pass Rate</h3>
                <div class="metric-value">${stats.passRate}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${stats.passRate}"></div>
                </div>
            </div>
            <div class="metric-card">
                <h3>Avg Duration</h3>
                <div class="metric-value">${stats.averageDuration}ms</div>
            </div>
            <div class="metric-card">
                <h3>Total Duration</h3>
                <div class="metric-value">${(stats.totalDuration / 1000).toFixed(2)}s</div>
            </div>
        </div>

        ${stats.failed > 0 ? `
        <div class="section">
            <div class="alert alert-warning">
                <strong>⚠️ Warning:</strong> ${stats.failed} test(s) failed. Review details below.
            </div>
        </div>
        ` : ''}

        <div class="section">
            <h2>📊 Browser Statistics</h2>
            <div class="browser-stats">
                ${Object.entries(stats.byBrowser)
                  .map(
                    ([browser, data]) => `
                    <div class="stat-box">
                        <h4>${browser}</h4>
                        <div class="stat-row">
                            <span class="stat-label">Total:</span>
                            <span class="stat-value">${data.total}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Passed:</span>
                            <span class="stat-value" style="color: #10b981">${data.passed}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Failed:</span>
                            <span class="stat-value" style="color: #ef4444">${data.failed}</span>
                        </div>
                    </div>
                `
                  )
                  .join('')}
            </div>
        </div>

        <div class="section">
            <h2>📱 Device Statistics</h2>
            <div class="device-stats">
                ${Object.entries(stats.byDevice)
                  .map(
                    ([device, data]) => `
                    <div class="stat-box">
                        <h4>${device}</h4>
                        <div class="stat-row">
                            <span class="stat-label">Total:</span>
                            <span class="stat-value">${data.total}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Passed:</span>
                            <span class="stat-value" style="color: #10b981">${data.passed}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Failed:</span>
                            <span class="stat-value" style="color: #ef4444">${data.failed}</span>
                        </div>
                    </div>
                `
                  )
                  .join('')}
            </div>
        </div>

        ${stats.slowestTests.length > 0 ? `
        <div class="section">
            <h2>🐢 Slowest Tests</h2>
            <table>
                <thead>
                    <tr>
                        <th>Test Name</th>
                        <th>Browser</th>
                        <th>Duration</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${stats.slowestTests
                      .map(
                        (test) => `
                        <tr>
                            <td>${test.testName}</td>
                            <td>${test.browser}</td>
                            <td class="duration">${test.duration}ms</td>
                            <td>
                                <span class="status-badge status-${test.status}">
                                    ${test.status.toUpperCase()}
                                </span>
                            </td>
                        </tr>
                    `
                      )
                      .join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        ${stats.failedTests.length > 0 ? `
        <div class="section">
            <h2>❌ Failed Tests</h2>
            <table>
                <thead>
                    <tr>
                        <th>Test Name</th>
                        <th>Browser</th>
                        <th>Error</th>
                        <th>Duration</th>
                    </tr>
                </thead>
                <tbody>
                    ${stats.failedTests
                      .map(
                        (test) => `
                        <tr>
                            <td>${test.testName}</td>
                            <td>${test.browser}</td>
                            <td><small>${test.error || 'Unknown error'}</small></td>
                            <td class="duration">${test.duration}ms</td>
                        </tr>
                    `
                      )
                      .join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        <div class="footer">
            <p>📈 Test Dashboard auto-generated by Autonomous Framework</p>
            <p>Execution Time: ${executionTime}s</p>
        </div>
    </div>
</body>
</html>
    `;

    return html;
  }

  /**
   * Save dashboard to file
   * @returns {string} - Path to generated dashboard
   */
  saveDashboard() {
    const html = this.generateDashboardHTML();
    const filename = `dashboard-${new Date().toISOString().split('T')[0]}.html`;
    const filepath = path.join(this.outputDir, filename);

    fs.writeFileSync(filepath, html);
    console.log(`✓ Dashboard saved: ${filepath}`);

    return filepath;
  }

  /**
   * Save test results as JSON
   * @returns {string} - Path to JSON file
   */
  saveResults() {
    const stats = this.getStatistics();
    const filename = `results-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(this.outputDir, filename);

    fs.writeFileSync(
      filepath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          statistics: stats,
          results: this.testResults,
        },
        null,
        2
      )
    );

    console.log(`✓ Results saved: ${filepath}`);
    return filepath;
  }
}

module.exports = DashboardGenerator;
