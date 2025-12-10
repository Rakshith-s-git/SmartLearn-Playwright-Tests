/**
 * DataCleanupManager - Autonomous Test Data Cleanup
 * 
 * Features:
 * - Track created test data
 * - Cleanup strategies (delete, reset, archive)
 * - Cascading cleanup (related records)
 * - Cleanup verification
 * - Cleanup scheduling
 */

class DataCleanupManager {
  constructor() {
    this.dataRegistry = new Map(); // Track created data by ID
    this.cleanupStrategies = new Map();
    this.cleanupHistory = [];
  }

  /**
   * Register data for cleanup tracking
   * @param {string} dataType - Type of data (user, product, order, etc.)
   * @param {string} dataId - Unique identifier
   * @param {Object} metadata - Additional metadata
   */
  registerDataForCleanup(dataType, dataId, metadata = {}) {
    const key = `${dataType}_${dataId}`;

    this.dataRegistry.set(key, {
      type: dataType,
      id: dataId,
      metadata,
      createdAt: new Date().toISOString(),
      cleanedUp: false,
    });

    console.log(`✓ Registered for cleanup: ${key}`);
  }

  /**
   * Register cleanup strategy for a data type
   * @param {string} dataType - Type of data
   * @param {Function} cleanupFn - Async function to clean data
   */
  registerCleanupStrategy(dataType, cleanupFn) {
    if (typeof cleanupFn !== 'function') {
      throw new Error('Cleanup function must be a function');
    }

    this.cleanupStrategies.set(dataType, cleanupFn);
    console.log(`✓ Cleanup strategy registered: ${dataType}`);
  }

  /**
   * Execute cleanup for a specific data item
   * @param {string} dataType - Type of data
   * @param {string} dataId - Data identifier
   * @returns {Promise<boolean>} - Success status
   */
  async cleanupDataItem(dataType, dataId) {
    const key = `${dataType}_${dataId}`;
    const registry = this.dataRegistry.get(key);

    if (!registry) {
      console.warn(`No registry found for: ${key}`);
      return false;
    }

    if (registry.cleanedUp) {
      console.log(`Already cleaned up: ${key}`);
      return true;
    }

    const strategy = this.cleanupStrategies.get(dataType);

    if (!strategy) {
      console.warn(
        `No cleanup strategy for data type: ${dataType}. Marking as cleaned.`
      );
      registry.cleanedUp = true;
      return true;
    }

    try {
      console.log(`🧹 Cleaning up: ${key}`);
      
      await strategy(dataId, registry.metadata);
      
      registry.cleanedUp = true;
      
      this.cleanupHistory.push({
        key,
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
      });

      console.log(`✓ Cleanup successful: ${key}`);
      return true;
    } catch (error) {
      console.error(`✗ Cleanup failed for ${key}: ${error.message}`);
      
      this.cleanupHistory.push({
        key,
        status: 'FAILED',
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      return false;
    }
  }

  /**
   * Cleanup all registered data
   * @returns {Promise<Object>} - Cleanup results
   */
  async cleanupAll() {
    console.log('\n🧹 Starting batch cleanup...');

    const results = {
      total: 0,
      successful: 0,
      failed: 0,
      startTime: Date.now(),
      details: [],
    };

    for (const [key, registry] of this.dataRegistry) {
      if (registry.cleanedUp) {
        console.log(`⊘ Skipping already cleaned: ${key}`);
        continue;
      }

      results.total++;
      const success = await this.cleanupDataItem(
        registry.type,
        registry.id
      );

      if (success) {
        results.successful++;
      } else {
        results.failed++;
      }

      results.details.push({
        key,
        success,
      });
    }

    results.duration = Date.now() - results.startTime;

    console.log(`\n✓ Cleanup complete: ${results.successful}/${results.total} successful`);

    return results;
  }

  /**
   * Cleanup by data type
   * @param {string} dataType - Type to clean
   * @returns {Promise<Object>} - Results
   */
  async cleanupByType(dataType) {
    console.log(`\n🧹 Cleaning up ${dataType}...`);

    const results = {
      type: dataType,
      successful: 0,
      failed: 0,
      details: [],
    };

    for (const [key, registry] of this.dataRegistry) {
      if (registry.type !== dataType) continue;

      const success = await this.cleanupDataItem(
        registry.type,
        registry.id
      );

      if (success) {
        results.successful++;
      } else {
        results.failed++;
      }

      results.details.push({ key, success });
    }

    console.log(
      `✓ ${dataType} cleanup complete: ${results.successful}/${results.details.length}`
    );

    return results;
  }

  /**
   * Register cascading cleanup
   * When parent is deleted, also cleanup children
   * @param {string} parentKey - Parent data key
   * @param {string[]} childKeys - Child data keys
   */
  registerCascadingCleanup(parentKey, childKeys = []) {
    const parentRegistry = this.dataRegistry.get(parentKey);

    if (!parentRegistry) {
      console.warn(`Parent not found: ${parentKey}`);
      return;
    }

    parentRegistry.cascadeChildren = childKeys;
    console.log(`✓ Cascading cleanup registered: ${parentKey} → ${childKeys.join(', ')}`);
  }

  /**
   * Execute cascading cleanup
   * @param {string} parentKey - Parent data key
   */
  async cascadingCleanup(parentKey) {
    const parentRegistry = this.dataRegistry.get(parentKey);

    if (!parentRegistry || !parentRegistry.cascadeChildren) {
      return;
    }

    console.log(`\n🧹 Cascading cleanup for: ${parentKey}`);

    for (const childKey of parentRegistry.cascadeChildren) {
      const childRegistry = this.dataRegistry.get(childKey);
      
      if (childRegistry && !childRegistry.cleanedUp) {
        await this.cleanupDataItem(childRegistry.type, childRegistry.id);
      }
    }
  }

  /**
   * Get cleanup status
   */
  getCleanupStatus() {
    let cleaned = 0;
    let pending = 0;

    for (const registry of this.dataRegistry.values()) {
      if (registry.cleanedUp) cleaned++;
      else pending++;
    }

    return {
      total: this.dataRegistry.size,
      cleaned,
      pending,
      percentage: this.dataRegistry.size > 0
        ? ((cleaned / this.dataRegistry.size) * 100).toFixed(1) + '%'
        : '0%',
    };
  }

  /**
   * Get cleanup history
   * @param {number} limit - Number of recent items to return
   */
  getCleanupHistory(limit = 20) {
    return this.cleanupHistory.slice(-limit).reverse();
  }

  /**
   * Print cleanup report
   */
  printCleanupReport() {
    const status = this.getCleanupStatus();

    console.log('\n=== DATA CLEANUP REPORT ===\n');
    console.log('Cleanup Status:');
    console.log(`  Total Registered: ${status.total}`);
    console.log(`  Cleaned Up: ${status.cleaned}`);
    console.log(`  Pending: ${status.pending}`);
    console.log(`  Progress: ${status.percentage}\n`);

    console.log('Registered Data:');
    for (const [key, registry] of this.dataRegistry) {
      const status = registry.cleanedUp ? '✓' : '⏳';
      console.log(`  ${status} ${key}`);
    }

    if (this.cleanupHistory.length > 0) {
      console.log('\nRecent Cleanup History:');
      this.cleanupHistory.slice(-5).forEach((entry) => {
        const icon = entry.status === 'SUCCESS' ? '✓' : '✗';
        console.log(`  ${icon} ${entry.key} (${entry.status})`);
      });
    }
  }

  /**
   * Clear registry (use after successful cleanup)
   */
  clearRegistry() {
    const before = this.dataRegistry.size;
    this.dataRegistry.clear();
    console.log(`✓ Registry cleared: ${before} entries removed`);
  }

  /**
   * Clear cleanup history
   */
  clearHistory() {
    this.cleanupHistory = [];
  }

  /**
   * Get pending cleanup
   */
  getPendingCleanup() {
    const pending = [];

    for (const [key, registry] of this.dataRegistry) {
      if (!registry.cleanedUp) {
        pending.push({
          key,
          type: registry.type,
          id: registry.id,
          createdAt: registry.createdAt,
        });
      }
    }

    return pending;
  }

  /**
   * Schedule automatic cleanup after test
   * @param {Function} testFn - Test function to run
   * @param {Function} cleanupFn - Cleanup to run after test
   */
  async executeWithCleanup(testFn, cleanupFn = null) {
    try {
      console.log('Running test with automatic cleanup...');
      const result = await testFn();
      
      console.log('Test completed. Starting cleanup...');
      
      if (cleanupFn) {
        await cleanupFn();
      } else {
        await this.cleanupAll();
      }

      console.log('✓ Test and cleanup completed successfully');
      return result;
    } catch (error) {
      console.error(`Test failed: ${error.message}`);
      console.log('Attempting cleanup anyway...');
      
      try {
        if (cleanupFn) {
          await cleanupFn();
        } else {
          await this.cleanupAll();
        }
      } catch (cleanupError) {
        console.error(`Cleanup also failed: ${cleanupError.message}`);
      }

      throw error;
    }
  }
}

module.exports = DataCleanupManager;
