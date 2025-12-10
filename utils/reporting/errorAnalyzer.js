/**
 * ErrorAnalyzer - Intelligent Error Classification & Analysis
 * 
 * Features:
 * - Error type classification
 * - Severity assessment
 * - Root cause analysis
 * - Recommendations for fixes
 * - Error trending and analytics
 */

class ErrorAnalyzer {
  constructor(logger = console) {
    this.logger = logger;
    this.errors = [];
    this.errorPatterns = new Map();
    this.errorFrequency = new Map();
  }

  /**
   * Analyze an error and classify it
   * @param {Error} error - Error object
   * @param {Object} context - Additional context
   * @returns {Object} - Analysis result
   */
  static analyzeError(error, context = {}) {
    const analysis = {
      type: this.classifyError(error),
      severity: this.calculateSeverity(error),
      message: error.message || '',
      stack: error.stack || '',
      context,
      recommendations: this.getRecommendations(error),
      timestamp: new Date().toISOString(),
    };

    return analysis;
  }

  /**
   * Classify error type
   */
  static classifyError(error) {
    const message = error.message || '';
    const stack = error.stack || '';

    // Network errors
    if (
      message.includes('timeout') ||
      message.includes('ETIMEDOUT') ||
      message.includes('ERR_NAME_NOT_RESOLVED')
    ) {
      return 'NETWORK_ERROR';
    }

    // Element not found
    if (
      message.includes('not found') ||
      message.includes('No element matches') ||
      message.includes('locator did not resolve')
    ) {
      return 'ELEMENT_NOT_FOUND';
    }

    // Navigation errors
    if (message.includes('Navigation') || message.includes('net::ERR')) {
      return 'NAVIGATION_ERROR';
    }

    // Assertion errors
    if (message.includes('AssertionError') || message.includes('Assertion')) {
      return 'ASSERTION_ERROR';
    }

    // Selector/XPath errors
    if (
      message.includes('selector') ||
      message.includes('XPath') ||
      message.includes('invalid')
    ) {
      return 'SELECTOR_ERROR';
    }

    // Visibility/Interaction errors
    if (
      message.includes('not visible') ||
      message.includes('not visible enough') ||
      message.includes('Click intercepted')
    ) {
      return 'VISIBILITY_ERROR';
    }

    // Authentication/Permission errors
    if (
      message.includes('Unauthorized') ||
      message.includes('401') ||
      message.includes('403')
    ) {
      return 'AUTH_ERROR';
    }

    // Server errors
    if (message.includes('500') || message.includes('Server Error')) {
      return 'SERVER_ERROR';
    }

    // Memory/Resource errors
    if (
      message.includes('out of memory') ||
      message.includes('ENOMEM')
    ) {
      return 'RESOURCE_ERROR';
    }

    return 'UNKNOWN_ERROR';
  }

  /**
   * Calculate error severity (CRITICAL, HIGH, MEDIUM, LOW)
   */
  static calculateSeverity(error) {
    const message = error.message || '';

    // Critical issues
    if (
      message.includes('500') ||
      message.includes('ENOMEM') ||
      message.includes('crash')
    ) {
      return 'CRITICAL';
    }

    // High severity
    if (
      message.includes('Navigation') ||
      message.includes('ERR_NAME_NOT_RESOLVED') ||
      message.includes('Unauthorized')
    ) {
      return 'HIGH';
    }

    // Medium severity
    if (
      message.includes('timeout') ||
      message.includes('not found') ||
      message.includes('not visible')
    ) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  /**
   * Get recommendations for error recovery
   */
  static getRecommendations(error) {
    const type = this.classifyError(error);
    const recommendations = [];

    switch (type) {
      case 'NETWORK_ERROR':
        recommendations.push('Check internet connection');
        recommendations.push('Retry with exponential backoff');
        recommendations.push('Check if server is accessible');
        break;

      case 'ELEMENT_NOT_FOUND':
        recommendations.push('Verify selector is correct');
        recommendations.push('Check if page has fully loaded');
        recommendations.push('Wait for element visibility');
        recommendations.push('Use SmartWait utility');
        break;

      case 'NAVIGATION_ERROR':
        recommendations.push('Verify URL is correct');
        recommendations.push('Check network connectivity');
        recommendations.push('Wait for page load state');
        break;

      case 'ASSERTION_ERROR':
        recommendations.push('Review expected vs actual values');
        recommendations.push('Check test data setup');
        recommendations.push('Verify element state');
        break;

      case 'SELECTOR_ERROR':
        recommendations.push('Validate selector syntax');
        recommendations.push('Use SelectorManager for fallbacks');
        recommendations.push('Check CSS/XPath correctness');
        break;

      case 'VISIBILITY_ERROR':
        recommendations.push('Wait for element visibility');
        recommendations.push('Scroll element into view');
        recommendations.push('Check CSS visibility properties');
        recommendations.push('Use SmartWait.waitForElement()');
        break;

      case 'AUTH_ERROR':
        recommendations.push('Verify credentials');
        recommendations.push('Check token expiration');
        recommendations.push('Validate API authentication');
        break;

      case 'SERVER_ERROR':
        recommendations.push('Check server status');
        recommendations.push('Review server logs');
        recommendations.push('Retry operation');
        break;

      case 'RESOURCE_ERROR':
        recommendations.push('Close unnecessary processes');
        recommendations.push('Increase system memory');
        recommendations.push('Reduce parallel test execution');
        break;

      default:
        recommendations.push('Review error message carefully');
        recommendations.push('Check test logs for details');
    }

    return recommendations;
  }

  /**
   * Record error for analysis
   */
  recordError(error, testName, context = {}) {
    const analysis = ErrorAnalyzer.analyzeError(error, {
      ...context,
      testName,
    });

    this.errors.push(analysis);

    // Track error frequency
    const key = `${analysis.type}_${analysis.severity}`;
    this.errorFrequency.set(
      key,
      (this.errorFrequency.get(key) || 0) + 1
    );

    return analysis;
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const stats = {
      totalErrors: this.errors.length,
      byType: {},
      bySeverity: {},
      frequency: Object.fromEntries(this.errorFrequency),
    };

    this.errors.forEach((error) => {
      // Count by type
      if (!stats.byType[error.type]) {
        stats.byType[error.type] = 0;
      }
      stats.byType[error.type]++;

      // Count by severity
      if (!stats.bySeverity[error.severity]) {
        stats.bySeverity[error.severity] = 0;
      }
      stats.bySeverity[error.severity]++;
    });

    return stats;
  }

  /**
   * Get most common errors
   */
  getMostCommonErrors(limit = 5) {
    const errorCounts = new Map();

    this.errors.forEach((error) => {
      const key = error.message;
      errorCounts.set(key, (errorCounts.get(key) || 0) + 1);
    });

    return Array.from(errorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([message, count]) => ({
        message,
        count,
      }));
  }

  /**
   * Generate error report
   */
  generateErrorReport() {
    const stats = this.getErrorStats();
    const commonErrors = this.getMostCommonErrors();

    return {
      summary: stats,
      commonErrors,
      allErrors: this.errors,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Print error summary
   */
  printErrorSummary() {
    const stats = this.getErrorStats();

    console.log('\n=== ERROR ANALYSIS REPORT ===\n');
    console.log(`Total Errors: ${stats.totalErrors}\n`);

    if (Object.keys(stats.byType).length > 0) {
      console.log('Errors by Type:');
      Object.entries(stats.byType).forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });
      console.log();
    }

    if (Object.keys(stats.bySeverity).length > 0) {
      console.log('Errors by Severity:');
      Object.entries(stats.bySeverity).forEach(([severity, count]) => {
        console.log(`  ${severity}: ${count}`);
      });
      console.log();
    }

    const commonErrors = this.getMostCommonErrors(3);
    if (commonErrors.length > 0) {
      console.log('Most Common Errors:');
      commonErrors.forEach((err, idx) => {
        console.log(`  ${idx + 1}. ${err.message} (${err.count}x)`);
      });
      console.log();
    }
  }

  /**
   * Clear error records
   */
  clearErrors() {
    this.errors = [];
    this.errorFrequency.clear();
  }
}

module.exports = ErrorAnalyzer;
