/**
 * SmartWait - Intelligent Wait Strategies
 * 
 * Provides smart waiting mechanisms:
 * - Wait for elements with visual checks
 * - Wait for any of multiple elements
 * - Wait for network idle
 * - Wait for stable DOM
 * - Configurable timeout and visibility checks
 */

class SmartWait {
  /**
   * Wait for element with visibility and stability checks
   * @param {Page} page - Playwright page
   * @param {Locator|string} selector - Element selector or locator
   * @param {Object} options
   * @param {number} options.timeout - Max wait time (default: 5000)
   * @param {boolean} options.visible - Require visibility (default: true)
   * @param {boolean} options.stable - Wait for stable position (default: true)
   * @param {string} options.name - Name for logging
   * @returns {Promise<Locator>}
   */
  static async waitForElement(
    page,
    selector,
    {
      timeout = 5000,
      visible = true,
      stable = true,
      name = 'Element',
    } = {}
  ) {
    const locator = typeof selector === 'string'
      ? page.locator(selector)
      : selector;

    try {
      // Wait for element to be attached to DOM using locator
      await locator.waitFor({
        state: visible ? 'visible' : 'attached',
        timeout,
      });

      // If stability check enabled, wait for position to stabilize
      if (stable) {
        await this.waitForPositionStable(locator, timeout);
      }

      console.log(`✓ [${name}] Element ready`);
      return locator;
    } catch (error) {
      console.error(`✗ [${name}] Timeout waiting for element`);
      throw error;
    }
  }

  /**
   * Wait for any of multiple elements (first match wins)
   * @param {Page} page - Playwright page
   * @param {string[]} selectors - Array of selectors to try
   * @param {Object} options - Same as waitForElement
   * @returns {Promise<Locator>}
   */
  static async waitForAnyElement(
    page,
    selectors = [],
    {
      timeout = 5000,
      visible = true,
      name = 'Any Element',
    } = {}
  ) {
    const startTime = Date.now();
    let lastError;

    for (const selector of selectors) {
      try {
        const elapsed = Date.now() - startTime;
        const remainingTimeout = Math.max(timeout - elapsed, 100);

        const locator = page.locator(selector);
        
        await locator.waitFor({
          state: visible ? 'visible' : 'attached',
          timeout: remainingTimeout,
        });

        console.log(`✓ [${name}] Found element: ${selector}`);
        return locator;
      } catch (error) {
        lastError = error;
        continue;
      }
    }

    console.error(
      `✗ [${name}] None of the selectors matched: ${selectors.join(' | ')}`
    );
    throw lastError;
  }

  /**
   * Wait for network idle state
   * @param {Page} page - Playwright page
   * @param {number} timeout - Max wait time (default: 30000)
   * @param {string} name - Name for logging
   */
  static async waitForNetworkIdle(page, timeout = 30000, name = 'Network') {
    try {
      await page.waitForLoadState('networkidle', { timeout });
      console.log(`✓ [${name}] Network idle`);
    } catch (error) {
      console.warn(`⚠ [${name}] Network idle timeout (continuing anyway)`);
    }
  }

  /**
   * Wait for page load
   * @param {Page} page - Playwright page
   * @param {number} timeout - Max wait time
   * @param {string} name - Name for logging
   */
  static async waitForPageLoad(page, timeout = 30000, name = 'Page') {
    try {
      await page.waitForLoadState('load', { timeout });
      console.log(`✓ [${name}] Page loaded`);
    } catch (error) {
      console.warn(`⚠ [${name}] Page load timeout`);
      throw error;
    }
  }

  /**
   * Wait for element position to stabilize (stops moving)
   * @param {Locator} locator - Element to check
   * @param {number} timeout - Max wait time
   * @param {number} checkInterval - Check every N ms (default: 100)
   */
  static async waitForPositionStable(
    locator,
    timeout = 5000,
    checkInterval = 100
  ) {
    const startTime = Date.now();
    let previousBox = null;
    let stableCount = 0;
    const requiredStableChecks = 3; // Must be stable for 3 checks

    while (Date.now() - startTime < timeout) {
      try {
        const box = await locator.boundingBox();

        if (previousBox && this.boxesEqual(previousBox, box)) {
          stableCount++;
          
          if (stableCount >= requiredStableChecks) {
            return; // Position is stable
          }
        } else {
          stableCount = 0;
        }

        previousBox = box;
        await new Promise((resolve) =>
          setTimeout(resolve, checkInterval)
        );
      } catch (error) {
        // Element might have disappeared
        throw error;
      }
    }

    console.warn('⚠ Position stability timeout');
  }

  /**
   * Wait for element to become hidden
   * @param {Page} page - Playwright page
   * @param {Locator|string} selector - Element selector
   * @param {number} timeout - Max wait time
   */
  static async waitForHidden(page, selector, timeout = 5000) {
    const locator = typeof selector === 'string'
      ? page.locator(selector)
      : selector;

    try {
      await locator.waitFor({ state: 'hidden', timeout });
      console.log('✓ Element hidden');
    } catch (error) {
      console.error('✗ Timeout waiting for element to hide');
      throw error;
    }
  }

  /**
   * Wait for function to return true
   * @param {Function} condition - Async function returning boolean
   * @param {number} timeout - Max wait time (default: 5000)
   * @param {number} pollInterval - Check every N ms (default: 100)
   * @param {string} name - Name for logging
   */
  static async waitForCondition(
    condition,
    timeout = 5000,
    pollInterval = 100,
    name = 'Condition'
  ) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        if (await condition()) {
          console.log(`✓ [${name}] Condition met`);
          return;
        }
      } catch (error) {
        // Continue polling
      }

      await new Promise((resolve) =>
        setTimeout(resolve, pollInterval)
      );
    }

    throw new Error(`[${name}] Condition not met within ${timeout}ms`);
  }

  /**
   * Compare two bounding boxes for equality
   */
  static boxesEqual(box1, box2) {
    if (!box1 || !box2) return false;
    
    return (
      box1.x === box2.x &&
      box1.y === box2.y &&
      box1.width === box2.width &&
      box1.height === box2.height
    );
  }

  /**
   * Wait for element count
   * @param {Page} page - Playwright page
   * @param {string} selector - Element selector
   * @param {number} expectedCount - Expected element count
   * @param {number} timeout - Max wait time
   */
  static async waitForElementCount(
    page,
    selector,
    expectedCount,
    timeout = 5000
  ) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const count = await page.locator(selector).count();
      
      if (count === expectedCount) {
        console.log(`✓ Found ${expectedCount} elements`);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    throw new Error(
      `[Count] Expected ${expectedCount} elements, timeout reached`
    );
  }
}

module.exports = SmartWait;
