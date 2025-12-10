/**
 * SelectorManager - Self-Healing Selector Management
 * 
 * Provides intelligent selector fallback strategies:
 * - Try primary selector
 * - Use fallback selectors if primary fails
 * - Log all attempts for debugging
 * - Support XPath, CSS, data-test attribute fallbacks
 */

class SelectorManager {
  constructor(logger = console) {
    this.logger = logger;
    this.selectorCache = new Map();
    this.selectorAttempts = new Map();
  }

  /**
   * Find element with intelligent fallback strategy
   * @param {Page} page - Playwright page object
   * @param {string} elementName - Friendly name for logging
   * @param {string} primarySelector - Primary CSS selector
   * @param {string[]} fallbackSelectors - Array of fallback selectors
   * @param {number} timeout - Max wait time in ms (default 5000)
   * @returns {Promise<Locator|null>} - Found locator or null
   */
  async smartSelect(
    page,
    elementName,
    primarySelector,
    fallbackSelectors = [],
    timeout = 5000
  ) {
    const cacheKey = `${elementName}_${primarySelector}`;
    
    // Return cached selector if successful before
    if (this.selectorCache.has(cacheKey)) {
      return page.locator(this.selectorCache.get(cacheKey));
    }

    const allSelectors = [primarySelector, ...fallbackSelectors];
    
    for (const selector of allSelectors) {
      try {
        const locator = page.locator(selector);
        
        // Verify element is visible/exists
        await locator.waitFor({ state: 'attached', timeout });
        
        this.logger.log(
          `✓ [${elementName}] Found with selector: ${selector}`
        );
        
        // Cache successful selector
        this.selectorCache.set(cacheKey, selector);
        
        // Track attempts
        this.recordAttempt(elementName, selector, true);
        
        return locator;
      } catch (error) {
        this.recordAttempt(elementName, selector, false);
        this.logger.debug(
          `✗ [${elementName}] Selector failed: ${selector}`
        );
        continue;
      }
    }

    // All selectors failed
    this.logger.error(
      `✗ [${elementName}] All selectors failed. Tried: ${allSelectors.join(' | ')}`
    );
    
    return null;
  }

  /**
   * Find any element from multiple options (first match wins)
   * @param {Page} page - Playwright page object
   * @param {string} elementName - Friendly name
   * @param {string[]} selectors - Array of selectors to try
   * @param {number} timeout - Max wait time
   * @returns {Promise<Locator|null>}
   */
  async smartSelectAny(
    page,
    elementName,
    selectors = [],
    timeout = 5000
  ) {
    for (const selector of selectors) {
      try {
        const locator = page.locator(selector);
        await locator.waitFor({ state: 'attached', timeout });
        
        this.logger.log(
          `✓ [${elementName}] Found via smartSelectAny: ${selector}`
        );
        
        return locator;
      } catch {
        continue;
      }
    }

    this.logger.error(
      `✗ [${elementName}] No selector matched from: ${selectors.join(' | ')}`
    );
    
    return null;
  }

  /**
   * Get all potential fallback selectors for an element
   * Useful for building self-healing selector libraries
   */
  generateFallbackSelectors(baseSelector) {
    const fallbacks = [];

    // If using data-test, also try data-testid
    if (baseSelector.includes('data-test="')) {
      const attrValue = baseSelector.match(/data-test="([^"]+)"/)?.[1];
      if (attrValue) {
        fallbacks.push(`[data-testid="${attrValue}"]`);
      }
    }

    // Add partial attribute matches
    if (baseSelector.includes('id="')) {
      const idValue = baseSelector.match(/id="([^"]+)"/)?.[1];
      if (idValue) {
        fallbacks.push(`#${idValue}`);
      }
    }

    // Add name-based selectors
    if (baseSelector.includes('name="')) {
      const nameValue = baseSelector.match(/name="([^"]+)"/)?.[1];
      if (nameValue) {
        fallbacks.push(`input[name="${nameValue}"]`);
        fallbacks.push(`textarea[name="${nameValue}"]`);
      }
    }

    return fallbacks;
  }

  /**
   * Clear cache (useful between test runs)
   */
  clearCache() {
    this.selectorCache.clear();
  }

  /**
   * Record selector attempt for analytics
   */
  recordAttempt(elementName, selector, success) {
    const key = `${elementName}_${selector}`;
    
    if (!this.selectorAttempts.has(key)) {
      this.selectorAttempts.set(key, { success: 0, failure: 0 });
    }

    const stats = this.selectorAttempts.get(key);
    if (success) {
      stats.success++;
    } else {
      stats.failure++;
    }
  }

  /**
   * Get selector statistics
   */
  getStats() {
    return Object.fromEntries(this.selectorAttempts);
  }

  /**
   * Print performance report
   */
  printReport() {
    console.log('\n=== SELECTOR MANAGER REPORT ===');
    console.log(`Cache Size: ${this.selectorCache.size}`);
    console.log('\nSelector Success Rates:');
    
    for (const [key, stats] of this.selectorAttempts) {
      const total = stats.success + stats.failure;
      const rate = ((stats.success / total) * 100).toFixed(1);
      console.log(`  ${key}: ${rate}% (${stats.success}/${total})`);
    }
  }
}

module.exports = SelectorManager;
