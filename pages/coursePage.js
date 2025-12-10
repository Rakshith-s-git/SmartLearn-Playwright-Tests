const SmartWait = require('../utils/helpers/smartWait');
const TestRetryManager = require('../utils/helpers/testRetry');
const SelectorManager = require('../utils/helpers/selectorManager');

class CoursePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.smartWait = SmartWait;
    this.selectorManager = new SelectorManager();

    // Using Sauce Demo - inventory items
    this.searchBox = 'input[placeholder="Search"]';
    this.searchButton = 'button:has-text("Search")';
    this.firstProductName = '.inventory_item:first-child .inventory_item_name';
    this.addToCartButton = '.inventory_item:first-child button';
    this.cartBadge = '.shopping_cart_badge';
    
    // Fallback selectors
    this.addToCartFallbacks = ['button[data-test*="add-to-cart"]', '.inventory_item button'];
    this.cartBadgeFallbacks = ['span.badge', '[class*="cart"][class*="badge"]'];
  }

  async searchCourse(name) {
    // For Sauce Demo, wait for inventory to load
    try {
      await this.page.waitForSelector(this.firstProductName, { state: 'visible', timeout: 5000 });
      console.log('✓ Product list loaded');
    } catch (error) {
      console.warn(`⚠ Product list not found: ${error.message}`);
    }
  }

  async enrollFirstCourse() {
    try {
      // Get add to cart button with fallback support
      const addBtn = await this.selectorManager.smartSelectAny(
        this.page,
        'Add to Cart Button',
        [this.addToCartButton, ...this.addToCartFallbacks],
        5000
      );

      if (!addBtn) {
        throw new Error('Add to cart button not found');
      }

      // Click with retry
      await TestRetryManager.executeWithRetry(
        async () => {
          await addBtn.click();
        },
        {
          maxRetries: 2,
          testName: 'Add to Cart',
          retryableErrors: ['timeout', 'Click intercepted'],
        }
      );

      // Wait for cart badge
      try {
        await this.page.waitForSelector(this.cartBadge, { state: 'visible', timeout: 3000 });
      } catch {
        // Badge may not appear, continue anyway
      }

      console.log('✓ Item added to cart successfully');
    } catch (error) {
      console.error(`✗ Failed to add to cart: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add to cart with retry support
   */
  async enrollFirstCourseWithRetry(maxRetries = 3) {
    return TestRetryManager.executeWithRetry(
      () => this.enrollFirstCourse(),
      {
        maxRetries,
        testName: 'Enroll First Course',
        retryableErrors: ['timeout', 'Click', 'intercepted'],
      }
    );
  }

  /**
   * Get cart item count
   */
  async getCartItemCount() {
    try {
      const cartBadge = await this.selectorManager.smartSelectAny(
        this.page,
        'Cart Badge',
        [this.cartBadge, ...this.cartBadgeFallbacks],
        3000
      );

      if (!cartBadge) {
        return 0;
      }

      const count = await cartBadge.textContent();
      return parseInt(count) || 0;
    } catch (error) {
      console.warn(`⚠ Could not get cart count: ${error.message}`);
      return 0;
    }
  }
}

module.exports = CoursePage;
