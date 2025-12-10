const SmartWait = require('../utils/helpers/smartWait');
const TestRetryManager = require('../utils/helpers/testRetry');
const SelectorManager = require('../utils/helpers/selectorManager');

class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.smartWait = SmartWait;
    this.selectorManager = new SelectorManager();
    
    // Using Sauce Demo - a public demo application
    this.email = 'input[data-test="username"]';
    this.password = 'input[data-test="password"]';
    this.submit = 'input[data-test="login-button"]';
    
    // Fallback selectors for self-healing
    this.emailFallbacks = ['input[name="user-name"]', 'input[placeholder*="Username"]'];
    this.passwordFallbacks = ['input[name="password"]', 'input[placeholder*="Password"]'];
    this.submitFallbacks = ['button[type="submit"]', 'button:has-text("Login")'];
  }

  async goto() {
    // Using Sauce Labs Demo App - a reliable open-source test site
    await this.page.goto('https://www.saucedemo.com/');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async login(username, pwd) {
    try {
      // Use smart selectors with fallback support
      const emailField = await this.selectorManager.smartSelect(
        this.page,
        'Email Input',
        this.email,
        this.emailFallbacks,
        5000
      );

      const passwordField = await this.selectorManager.smartSelect(
        this.page,
        'Password Input',
        this.password,
        this.passwordFallbacks,
        5000
      );

      const submitBtn = await this.selectorManager.smartSelect(
        this.page,
        'Login Button',
        this.submit,
        this.submitFallbacks,
        5000
      );

      if (!emailField || !passwordField || !submitBtn) {
        throw new Error('Could not find required login elements');
      }

      // Fill with retry logic
      await emailField.fill(username);
      await passwordField.fill(pwd);
      
      // Click with retry logic
      await TestRetryManager.executeWithRetry(
        async () => {
          await submitBtn.click();
          await this.page.waitForLoadState('networkidle');
        },
        {
          maxRetries: 2,
          testName: 'Login',
          retryableErrors: ['timeout', 'Timeout'],
        }
      );

      console.log('✓ Login successful');
    } catch (error) {
      console.error(`✗ Login failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Login with retry support
   */
  async loginWithRetry(username, pwd, maxRetries = 3) {
    return TestRetryManager.executeWithRetry(
      () => this.login(username, pwd),
      {
        maxRetries,
        testName: 'Login with Retry',
        retryableErrors: ['timeout', 'Timeout', 'Navigation'],
      }
    );
  }
}

module.exports = LoginPage;
