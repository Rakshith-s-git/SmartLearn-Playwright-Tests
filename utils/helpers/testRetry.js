/**
 * TestRetryManager - Intelligent Test Retry with Exponential Backoff
 * 
 * Features:
 * - Exponential backoff strategy
 * - Custom retry logic per error type
 * - Retry metrics and analytics
 * - Configurable max attempts and delays
 */

class TestRetryManager {
  constructor(logger = console) {
    this.logger = logger;
    this.retryStats = new Map();
    this.errorClassification = new Map();
  }

  /**
   * Execute function with exponential backoff retry
   * @param {Function} testFunc - Async function to execute
   * @param {Object} config - Configuration
   * @param {number} config.maxRetries - Max retry attempts (default: 3)
   * @param {number} config.initialDelay - Initial delay in ms (default: 500)
   * @param {number} config.backoffMultiplier - Multiplier for delay (default: 2)
   * @param {string} config.testName - Test name for logging
   * @param {string[]} config.retryableErrors - Error patterns to retry
   * @returns {Promise} - Result from testFunc
   */
  static async executeWithRetry(
    testFunc,
    {
      maxRetries = 3,
      initialDelay = 500,
      backoffMultiplier = 2,
      testName = 'Unknown',
      retryableErrors = [
        'timeout',
        'Timeout',
        'Navigation',
        'ERR_NAME_NOT_RESOLVED',
        'net::ERR',
      ],
    }
  ) {
    let lastError;
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await testFunc();
        
        if (attempt > 1) {
          console.log(
            `✓ [${testName}] Passed on attempt ${attempt}/${maxRetries}`
          );
        }
        
        return result;
      } catch (error) {
        lastError = error;

        const shouldRetry = this.shouldRetry(
          error,
          attempt,
          maxRetries,
          retryableErrors
        );

        if (shouldRetry) {
          console.warn(
            `⚠ [${testName}] Attempt ${attempt}/${maxRetries} failed: ${error.message}`
          );
          console.log(
            `  Retrying in ${delay}ms... (Exponential backoff)`
          );
          
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= backoffMultiplier;
        } else {
          throw error;
        }
      }
    }

    throw new Error(
      `[${testName}] Failed after ${maxRetries} attempts. Last error: ${lastError.message}`
    );
  }

  /**
   * Determine if error should trigger retry
   */
  static shouldRetry(error, attempt, maxRetries, retryableErrors) {
    // Don't retry if max attempts reached
    if (attempt >= maxRetries) {
      return false;
    }

    const errorMessage = error.message || '';

    // Check if error matches retryable patterns
    return retryableErrors.some((pattern) =>
      errorMessage.includes(pattern)
    );
  }

  /**
   * Record retry statistics
   */
  recordRetryAttempt(testName, attempt, success, error = null) {
    const key = testName;
    
    if (!this.retryStats.has(key)) {
      this.retryStats.set(key, {
        totalAttempts: 0,
        failureAttempts: 0,
        successOnRetry: 0,
        errors: [],
      });
    }

    const stats = this.retryStats.get(key);
    stats.totalAttempts++;
    
    if (!success) {
      stats.failureAttempts++;
    } else if (attempt > 1) {
      stats.successOnRetry++;
    }

    if (error) {
      stats.errors.push({
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get retry statistics
   */
  getRetryStats() {
    const stats = {};
    
    for (const [testName, data] of this.retryStats) {
      const successRate = (
        ((data.totalAttempts - data.failureAttempts) / data.totalAttempts) *
        100
      ).toFixed(1);
      
      stats[testName] = {
        ...data,
        successRate: `${successRate}%`,
      };
    }

    return stats;
  }

  /**
   * Print retry report
   */
  printRetryReport() {
    console.log('\n=== RETRY MANAGER REPORT ===');
    console.log('Test Retry Statistics:\n');

    for (const [testName, stats] of this.retryStats) {
      const successRate = (
        ((stats.totalAttempts - stats.failureAttempts) / stats.totalAttempts) *
        100
      ).toFixed(1);

      console.log(`${testName}:`);
      console.log(`  Total Attempts: ${stats.totalAttempts}`);
      console.log(`  Success Rate: ${successRate}%`);
      console.log(`  Successes on Retry: ${stats.successOnRetry}`);
      console.log(`  Permanent Failures: ${stats.failureAttempts}`);
      
      if (stats.errors.length > 0) {
        console.log(`  Recent Errors:`);
        stats.errors.slice(-3).forEach((err) => {
          console.log(`    - ${err.message}`);
        });
      }
      
      console.log();
    }
  }

  /**
   * Clear statistics
   */
  clearStats() {
    this.retryStats.clear();
    this.errorClassification.clear();
  }
}

module.exports = TestRetryManager;
