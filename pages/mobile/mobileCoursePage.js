/**
 * Mobile Products Page Object Model
 * Handles mobile-specific product and cart interactions
 */

const SmartWait = require('../../utils/helpers/smartWait');
const TestRetryManager = require('../../utils/helpers/testRetry');
const SelectorManager = require('../../utils/helpers/selectorManager');

class MobileProductsPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.smartWait = SmartWait;
    this.selectorManager = new SelectorManager();
    
    // Mobile selectors
    this.productList = '.inventory_list';
    this.productItem = '.inventory_item';
    this.productName = '.inventory_item_name';
    this.productPrice = '.inventory_item_price';
    this.addToCartBtn = '[data-test^="add-to-cart"]';
    this.addToCartBtnFallbacks = ['button:has-text("ADD")'];
    this.removeFromCartBtn = '[data-test^="remove"]';
    this.cartIcon = '.shopping_cart_container';
    this.cartBadge = '.shopping_cart_badge';
    this.cartBadgeFallbacks = ['span.badge', '[class*="badge"]'];
    this.cartLink = '.shopping_cart_link';
    this.menuButton = '#react-burger-menu-btn';
    this.burgerMenu = '.bm-menu';
    this.logoutBtn = '#logout_sidebar_link';
  }

  /**
   * Wait for products to load with smart wait
   */
  async waitForProductsToLoad() {
    console.log('[Mobile] Waiting for products to load');
    try {
      await this.page.waitForSelector(this.productList, { state: 'visible', timeout: 5000 });
    } catch (error) {
      console.warn(`[Mobile] Product list not found: ${error.message}`);
    }
  }

  /**
   * Get all product names
   * @returns {Promise<string[]>} Array of product names
   */
  async getAllProductNames() {
    await this.waitForProductsToLoad();
    const names = await this.page.locator(this.productName).allTextContents();
    console.log(`[Mobile] Found ${names.length} products`);
    return names;
  }

  /**
   * Add first product to cart with retry
   */
  async addFirstProductToCart() {
    return TestRetryManager.executeWithRetry(
      async () => {
        console.log('[Mobile] Adding first product to cart');
        
        // Wait for first add button to be available
        await this.page.waitForSelector(this.addToCartBtn, { state: 'attached', timeout: 5000 });
        
        // Click the first add button
        await this.page.click(this.addToCartBtn);
        
        // Wait for cart badge with retry - but don't fail if not found
        try {
          await this.page.waitForSelector(this.cartBadge, { state: 'visible', timeout: 2000 });
        } catch {
          // Badge may not appear, that's ok
        }

        console.log('[Mobile] Product added to cart');
      },
      {
        maxRetries: 2,
        testName: 'Mobile Add to Cart',
        retryableErrors: ['timeout', 'Click', 'intercepted'],
      }
    );
  }

  /**
   * Add product to cart by index with retry
   * @param {number} index - Product index (0-based)
   */
  async addProductToCartByIndex(index) {
    return TestRetryManager.executeWithRetry(
      async () => {
        console.log(`[Mobile] Adding product at index ${index} to cart`);
        
        // Wait for the specific add button to be available
        const addBtn = this.page.locator(this.addToCartBtn).nth(index);
        await addBtn.waitFor({ state: 'attached', timeout: 5000 });
        await addBtn.click();
        
        try {
          await this.page.waitForSelector(this.cartBadge, { state: 'visible', timeout: 2000 });
        } catch {
          // Badge may not appear, that's ok
        }
      },
      {
        maxRetries: 2,
        testName: `Mobile Add Product ${index}`,
        retryableErrors: ['timeout', 'Click'],
      }
    );
  }

  /**
   * Get cart badge count with error handling
   * @returns {Promise<number>} Cart item count
   */
  async getCartBadgeCount() {
    try {
      await this.page.waitForSelector(this.cartBadge, { state: 'visible', timeout: 2000 });
      const count = await this.page.textContent(this.cartBadge);
      const numCount = parseInt(count) || 0;
      console.log(`[Mobile] Cart badge count: ${numCount}`);
      return numCount;
    } catch (error) {
      console.warn(`[Mobile] Could not get cart count: ${error.message}`);
      return 0;
    }
  }

  /**
   * Open cart with retry
   */
  async openCart() {
    return TestRetryManager.executeWithRetry(
      async () => {
        console.log('[Mobile] Opening shopping cart');
        await this.page.click(this.cartLink);
        await this.page.waitForLoadState('networkidle');
      },
      {
        maxRetries: 2,
        testName: 'Mobile Open Cart',
        retryableErrors: ['timeout', 'Click'],
      }
    );
  }

  /**
   * Open menu with retry
   */
  async openMenu() {
    return TestRetryManager.executeWithRetry(
      async () => {
        console.log('[Mobile] Opening hamburger menu');
        await this.page.click(this.menuButton);
        await this.page.waitForSelector(this.burgerMenu, { state: 'visible', timeout: 3000 });
      },
      {
        maxRetries: 2,
        testName: 'Mobile Open Menu',
        retryableErrors: ['timeout', 'Click'],
      }
    );
  }

  /**
   * Logout with menu navigation
   */
  async logout() {
    return TestRetryManager.executeWithRetry(
      async () => {
        console.log('[Mobile] Logging out');
        await this.openMenu();
        await this.page.click(this.logoutBtn);
        await this.page.waitForLoadState('networkidle');
      },
      {
        maxRetries: 2,
        testName: 'Mobile Logout',
        retryableErrors: ['timeout', 'Click'],
      }
    );
  }

  /**
   * Verify cart icon is visible
   * @returns {Promise<boolean>} True if visible
   */
  async isCartIconVisible() {
    try {
      await this.page.waitForSelector(this.cartIcon, { state: 'visible', timeout: 3000 });
      console.log('[Mobile] Cart icon visible');
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = MobileProductsPage;
