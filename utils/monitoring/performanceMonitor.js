/**
 * PerformanceMonitor - Test Performance Tracking & Analytics
 * 
 * Features:
 * - Test execution timing
 * - Memory usage monitoring
 * - Browser performance metrics
 * - Performance trends
 * - Performance alerts/thresholds
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = [];
    this.thresholds = {
      maxTestDuration: 30000, // 30 seconds
      maxMemoryUsage: 500, // MB
      maxResponseTime: 5000, // 5 seconds
    };
    this.performanceAlerts = [];
  }

  /**
   * Start monitoring a test
   * @param {string} testName - Test identifier
   * @returns {Object} - Timer object
   */
  startTestMonitoring(testName) {
    const timer = {
      testName,
      startTime: Date.now(),
      startMemory: process.memoryUsage().heapUsed / 1024 / 1024, // MB
      metrics: {},
    };

    return timer;
  }

  /**
   * Mark a checkpoint in test
   * @param {Object} timer - Timer from startTestMonitoring
   * @param {string} checkpointName - Checkpoint identifier
   */
  markCheckpoint(timer, checkpointName) {
    const currentTime = Date.now();
    const duration = currentTime - timer.startTime;

    timer.metrics[checkpointName] = {
      duration,
      timestamp: new Date().toISOString(),
    };

    console.log(`⏱️  [${timer.testName}] ${checkpointName}: ${duration}ms`);
  }

  /**
   * End monitoring and record metrics
   * @param {Object} timer - Timer object
   * @param {Object} context - Additional context
   * @returns {Object} - Performance metrics
   */
  endTestMonitoring(timer, context = {}) {
    const endTime = Date.now();
    const endMemory = process.memoryUsage().heapUsed / 1024 / 1024;
    const duration = endTime - timer.startTime;
    const memoryDelta = endMemory - timer.startMemory;

    const metrics = {
      testName: timer.testName,
      duration,
      startMemory: timer.startMemory.toFixed(2),
      endMemory: endMemory.toFixed(2),
      memoryDelta: memoryDelta.toFixed(2),
      checkpoints: timer.metrics,
      timestamp: new Date().toISOString(),
      context,
    };

    this.metrics.push(metrics);

    // Check thresholds and generate alerts
    this.checkThresholds(metrics);

    return metrics;
  }

  /**
   * Check performance against thresholds
   */
  checkThresholds(metrics) {
    if (metrics.duration > this.thresholds.maxTestDuration) {
      const alert = {
        type: 'SLOW_TEST',
        testName: metrics.testName,
        value: metrics.duration,
        threshold: this.thresholds.maxTestDuration,
        severity: 'WARNING',
        timestamp: new Date().toISOString(),
      };

      this.performanceAlerts.push(alert);
      console.warn(
        `⚠️  SLOW TEST: ${metrics.testName} took ${metrics.duration}ms (threshold: ${this.thresholds.maxTestDuration}ms)`
      );
    }

    if (metrics.memoryDelta > this.thresholds.maxMemoryUsage) {
      const alert = {
        type: 'HIGH_MEMORY_USAGE',
        testName: metrics.testName,
        value: metrics.memoryDelta,
        threshold: this.thresholds.maxMemoryUsage,
        severity: 'WARNING',
        timestamp: new Date().toISOString(),
      };

      this.performanceAlerts.push(alert);
      console.warn(
        `⚠️  HIGH MEMORY: ${metrics.testName} used ${metrics.memoryDelta.toFixed(2)}MB`
      );
    }
  }

  /**
   * Set custom performance threshold
   */
  setThreshold(thresholdName, value) {
    this.thresholds[thresholdName] = value;
    console.log(`✓ Threshold set: ${thresholdName} = ${value}`);
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    if (this.metrics.length === 0) {
      return { message: 'No metrics recorded' };
    }

    const stats = {
      totalTests: this.metrics.length,
      averageDuration: 0,
      minDuration: Infinity,
      maxDuration: 0,
      totalDuration: 0,
      averageMemoryDelta: 0,
      totalMemoryDelta: 0,
      slowestTests: [],
      fastestTests: [],
    };

    this.metrics.forEach((metric) => {
      stats.totalDuration += metric.duration;
      stats.totalMemoryDelta += parseFloat(metric.memoryDelta);

      if (metric.duration < stats.minDuration) {
        stats.minDuration = metric.duration;
      }
      if (metric.duration > stats.maxDuration) {
        stats.maxDuration = metric.duration;
      }
    });

    stats.averageDuration = Math.round(stats.totalDuration / stats.totalTests);
    stats.averageMemoryDelta = (
      stats.totalMemoryDelta / stats.totalTests
    ).toFixed(2);

    // Get slowest tests
    stats.slowestTests = [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)
      .map((m) => ({
        testName: m.testName,
        duration: m.duration,
      }));

    // Get fastest tests
    stats.fastestTests = [...this.metrics]
      .sort((a, b) => a.duration - b.duration)
      .slice(0, 5)
      .map((m) => ({
        testName: m.testName,
        duration: m.duration,
      }));

    return stats;
  }

  /**
   * Get performance trends
   * @param {number} limit - Number of recent metrics
   */
  getPerformanceTrends(limit = 10) {
    const recent = this.metrics.slice(-limit);
    const trend = {
      period: `Last ${limit} tests`,
      trend: 'stable',
      change: 0,
      details: [],
    };

    if (recent.length < 2) {
      return trend;
    }

    const older = recent.slice(0, Math.floor(recent.length / 2));
    const newer = recent.slice(Math.floor(recent.length / 2));

    const oldAvg =
      older.reduce((sum, m) => sum + m.duration, 0) / older.length;
    const newAvg =
      newer.reduce((sum, m) => sum + m.duration, 0) / newer.length;

    trend.change = (((newAvg - oldAvg) / oldAvg) * 100).toFixed(1);

    if (trend.change < -5) {
      trend.trend = 'improving 📈';
    } else if (trend.change > 5) {
      trend.trend = 'degrading 📉';
    } else {
      trend.trend = 'stable ➡️';
    }

    trend.details = recent.map((m) => ({
      testName: m.testName,
      duration: m.duration,
      timestamp: m.timestamp,
    }));

    return trend;
  }

  /**
   * Get performance alerts
   */
  getPerformanceAlerts() {
    return this.performanceAlerts;
  }

  /**
   * Get all metrics
   */
  getAllMetrics() {
    return this.metrics;
  }

  /**
   * Print performance report
   */
  printPerformanceReport() {
    const stats = this.getPerformanceStats();
    const trends = this.getPerformanceTrends();
    const alerts = this.getPerformanceAlerts();

    console.log('\n=== PERFORMANCE MONITOR REPORT ===\n');

    if (stats.message) {
      console.log(stats.message);
      return;
    }

    console.log('Overall Statistics:');
    console.log(`  Total Tests: ${stats.totalTests}`);
    console.log(`  Average Duration: ${stats.averageDuration}ms`);
    console.log(`  Min Duration: ${stats.minDuration}ms`);
    console.log(`  Max Duration: ${stats.maxDuration}ms`);
    console.log(`  Average Memory Delta: ${stats.averageMemoryDelta}MB\n`);

    if (stats.slowestTests.length > 0) {
      console.log('Slowest Tests:');
      stats.slowestTests.forEach((test, idx) => {
        console.log(`  ${idx + 1}. ${test.testName}: ${test.duration}ms`);
      });
      console.log();
    }

    console.log(`Performance Trend: ${trends.trend}`);
    console.log(`Change: ${trends.change}%\n`);

    if (alerts.length > 0) {
      console.log(`⚠️  Performance Alerts (${alerts.length}):`);
      alerts.slice(-5).forEach((alert) => {
        console.log(
          `  [${alert.type}] ${alert.testName}: ${alert.value} (threshold: ${alert.threshold})`
        );
      });
    }
  }

  /**
   * Clear metrics
   */
  clearMetrics() {
    this.metrics = [];
    this.performanceAlerts = [];
  }

  /**
   * Export metrics to JSON
   */
  exportMetrics() {
    return {
      statistics: this.getPerformanceStats(),
      trends: this.getPerformanceTrends(),
      alerts: this.getPerformanceAlerts(),
      metrics: this.metrics,
      exportedAt: new Date().toISOString(),
    };
  }
}

module.exports = PerformanceMonitor;
