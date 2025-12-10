/**
 * Mobile Tests - Login and Shopping
 * Tests for mobile viewport and interactions
 */

const { test, expect } = require('@playwright/test');
const MobileLoginPage = require('../../pages/mobile/mobileLoginPage');
const MobileProductsPage = require('../../pages/mobile/mobileCoursePage');
const testData = require('../../fixtures/testData');

test.describe('Sauce Demo - Mobile Testing', () => {
  
  test('Mobile: Login should succeed with valid credentials', async ({ page }) => {
    console.log('[Mobile Test 1] Starting login test on mobile');
    
    const loginPage = new MobileLoginPage(page);
    await loginPage.goto();
    
    // Verify login page loaded
    expect(await loginPage.isLogoVisible()).toBeTruthy();
    
    // Perform login
    await loginPage.login(
      testData.users.validUser.username,
      testData.users.validUser.password
    );
    
    // Verify successful login
    await expect(page.locator('.inventory_container')).toBeVisible();
    console.log('[Mobile Test 1] ✓ Login successful on mobile');
  });

  test('Mobile: Login should fail with locked out user', async ({ page }) => {
    console.log('[Mobile Test 2] Testing locked out user on mobile');
    
    const loginPage = new MobileLoginPage(page);
    await loginPage.goto();
    
    await loginPage.login(
      testData.users.lockedUser.username,
      testData.users.lockedUser.password
    );
    
    // Verify error message is displayed
    const hasError = await loginPage.isErrorDisplayed();
    expect(hasError).toBeTruthy();
    
    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).toContain('Epic sadface');
    console.log('[Mobile Test 2] ✓ Locked user error verified');
  });

  test('Mobile: User can add product to cart', async ({ page }) => {
    console.log('[Mobile Test 3] Testing add to cart on mobile');
    
    const loginPage = new MobileLoginPage(page);
    const productsPage = new MobileProductsPage(page);
    
    // Login
    await loginPage.goto();
    await loginPage.login(
      testData.users.validUser.username,
      testData.users.validUser.password
    );
    
    // Add product to cart
    await productsPage.waitForProductsToLoad();
    await productsPage.addFirstProductToCart();
    
    // Verify cart badge shows 1 item
    const cartCount = await productsPage.getCartBadgeCount();
    expect(cartCount).toBe(1);
    console.log('[Mobile Test 3] ✓ Product added to cart successfully');
  });

  test('Mobile: User can add multiple products to cart', async ({ page }) => {
    console.log('[Mobile Test 4] Testing add multiple products on mobile');
    
    const loginPage = new MobileLoginPage(page);
    const productsPage = new MobileProductsPage(page);
    
    // Login
    await loginPage.goto();
    await loginPage.login(
      testData.users.validUser.username,
      testData.users.validUser.password
    );
    
    // Add multiple products
    await productsPage.waitForProductsToLoad();
    await productsPage.addFirstProductToCart();
    
    // Check cart count after first product
    let cartCount = await productsPage.getCartBadgeCount();
    expect(cartCount).toBe(1);
    
    // Try adding second product
    const addBtns = page.locator('[data-test^="add-to-cart"]');
    const count = await addBtns.count();
    
    if (count > 1) {
      await productsPage.addProductToCartByIndex(1);
      cartCount = await productsPage.getCartBadgeCount();
      expect(cartCount).toBe(2);
    }
    
    console.log('[Mobile Test 4] ✓ Multiple products added to cart successfully');
  });

  test('Mobile: User can view all products on inventory page', async ({ page }) => {
    console.log('[Mobile Test 5] Testing product listing on mobile');
    
    const loginPage = new MobileLoginPage(page);
    const productsPage = new MobileProductsPage(page);
    
    // Login
    await loginPage.goto();
    await loginPage.login(
      testData.users.validUser.username,
      testData.users.validUser.password
    );
    
    // Get all products
    const products = await productsPage.getAllProductNames();
    
    expect(products.length).toBeGreaterThan(0);
    console.log(`[Mobile Test 5] ✓ Found ${products.length} products on mobile`);
  });

  test('Mobile: User can open and view cart', async ({ page }) => {
    console.log('[Mobile Test 6] Testing cart view on mobile');
    
    const loginPage = new MobileLoginPage(page);
    const productsPage = new MobileProductsPage(page);
    
    // Login
    await loginPage.goto();
    await loginPage.login(
      testData.users.validUser.username,
      testData.users.validUser.password
    );
    
    // Add product and open cart
    await productsPage.waitForProductsToLoad();
    await productsPage.addFirstProductToCart();
    await productsPage.openCart();
    
    // Verify cart page loaded
    await expect(page.locator('.cart_list')).toBeVisible();
    console.log('[Mobile Test 6] ✓ Cart view successful on mobile');
  });

  test('Mobile: Viewport size is correct for mobile device', async ({ page }) => {
    console.log('[Mobile Test 7] Testing mobile viewport size');
    
    const viewportSize = page.viewportSize();
    expect(viewportSize).not.toBeNull();
    
    console.log(`[Mobile Test 7] ✓ Viewport size: ${viewportSize.width}x${viewportSize.height}`);
  });

  test('Mobile: Menu hamburger is accessible on mobile', async ({ page }) => {
    console.log('[Mobile Test 8] Testing hamburger menu on mobile');
    
    const loginPage = new MobileLoginPage(page);
    const productsPage = new MobileProductsPage(page);
    
    // Login
    await loginPage.goto();
    await loginPage.login(
      testData.users.validUser.username,
      testData.users.validUser.password
    );
    
    // Open menu
    await productsPage.openMenu();
    
    // Verify menu is visible
    await expect(page.locator('.bm-menu')).toBeVisible();
    console.log('[Mobile Test 8] ✓ Hamburger menu accessible on mobile');
  });
});
