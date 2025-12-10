/**
 * Mobile Login Page Object Model
 * Handles mobile-specific login interactions for Sauce Demo
 */

const SmartWait = require('../../utils/helpers/smartWait');
const TestRetryManager = require('../../utils/helpers/testRetry');
const SelectorManager = require('../../utils/helpers/selectorManager');

class MobileLoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.smartWait = SmartWait;
    this.selectorManager = new SelectorManager();
    
    // Mobile selectors (adjusted for mobile viewport)
    this.usernameInput = 'input[data-test="username"]';
    this.passwordInput = 'input[data-test="password"]';
    this.loginButton = 'input[data-test="login-button"]';
    this.errorMessage = '[data-test="error"]';
    this.appLogo = '.login_logo';
    
    // Fallback selectors for mobile
    this.usernameInputFallbacks = ['input[name="user-name"]', 'input[placeholder*="username"]'];
    this.passwordInputFallbacks = ['input[name="password"]', 'input[placeholder*="password"]'];
    this.loginButtonFallbacks = ['button[type="submit"]', 'button:has-text("LOGIN")'];
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await this.page.goto('https://www.saucedemo.com/');
    await this.page.waitForLoadState('domcontentloaded');
    console.log('[Mobile] Navigated to Sauce Demo login page');
  }

  /**
   * Enter username with smart selector
   * @param {string} username - Username to enter
   */
  async enterUsername(username) {
    console.log(`[Mobile] Entering username: ${username}`);
    
    const usernameField = await this.selectorManager.smartSelect(
      this.page,
      'Mobile Username',
      this.usernameInput,
      this.usernameInputFallbacks,
      5000
    );

    if (!usernameField) {
      throw new Error('Username field not found');
    }

    await usernameField.fill(username);
  }

  /**
   * Enter password with smart selector
   * @param {string} password - Password to enter
   */
  async enterPassword(password) {
    console.log('[Mobile] Entering password');
    
    const passwordField = await this.selectorManager.smartSelect(
      this.page,
      'Mobile Password',
      this.passwordInput,
      this.passwordInputFallbacks,
      5000
    );

    if (!passwordField) {
      throw new Error('Password field not found');
    }

    await passwordField.fill(password);
  }

  /**
   * Click login button with retry
   */
  async clickLoginButton() {
    console.log('[Mobile] Clicking login button');
    
    const loginBtn = await this.selectorManager.smartSelect(
      this.page,
      'Mobile Login Button',
      this.loginButton,
      this.loginButtonFallbacks,
      5000
    );

    if (!loginBtn) {
      throw new Error('Login button not found');
    }

    await TestRetryManager.executeWithRetry(
      async () => {
        await loginBtn.click();
      },
      {
        maxRetries: 2,
        testName: 'Mobile Click Login',
        retryableErrors: ['Click', 'intercepted', 'timeout'],
      }
    );
  }

  /**
   * Perform complete login with smart retries
   * @param {string} username - Username
   * @param {string} password - Password
   */
  async login(username, password) {
    return TestRetryManager.executeWithRetry(
      async () => {
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.clickLoginButton();
        // Wait for navigation after login
        await this.page.waitForLoadState('networkidle');
        console.log('[Mobile] Login completed');
      },
      {
        maxRetries: 3,
        testName: 'Mobile Login',
        retryableErrors: ['timeout', 'Timeout', 'Navigation'],
      }
    );
  }

  /**
   * Check if error message is displayed
   * @returns {Promise<boolean>} True if error visible
   */
  async isErrorDisplayed() {
    try {
      await this.page.waitForSelector(this.errorMessage, { state: 'visible', timeout: 2000 });
      console.log('[Mobile] Error message visible');
      return true;
    } catch {
      console.log('[Mobile] Error message not visible');
      return false;
    }
  }

  /**
   * Get error message text
   * @returns {Promise<string>} Error message text
   */
  async getErrorMessage() {
    try {
      const errorText = await this.page.textContent(this.errorMessage);
      console.log(`[Mobile] Error message: ${errorText}`);
      return errorText;
    } catch {
      return '';
    }
  }

  /**
   * Verify logo is visible (app loaded)
   * @returns {Promise<boolean>} True if logo visible
   */
  async isLogoVisible() {
    try {
      await this.page.waitForSelector(this.appLogo, { state: 'visible', timeout: 3000 });
      console.log('[Mobile] Logo visible');
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = MobileLoginPage;
