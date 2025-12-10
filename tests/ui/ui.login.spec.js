const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/loginPage');
const CoursePage = require('../../pages/coursePage');
const testData = require('../../fixtures/testData');

test.describe('Sauce Demo - Desktop UI Login and Shopping Flow', () => {

  test('Login should succeed with valid credentials', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    // Using standard_user from Sauce Demo
    await login.login(testData.users.validUser.username, testData.users.validUser.password);
    // Verify we're logged in by checking for inventory container
    await expect(page.locator('.inventory_container')).toBeVisible();
  });

  test('Add product to cart and verify', async ({ page }) => {
    const login = new LoginPage(page);
    const course = new CoursePage(page);
    await login.goto();
    await login.login(testData.users.validUser.username, testData.users.validUser.password);
    await course.searchCourse('Sauce Labs');
    await course.enrollFirstCourse();
    // Verify cart badge is visible
    await expect(page.locator('.shopping_cart_badge')).toBeVisible();
    // Verify cart has item count
    const cartBadge = page.locator('.shopping_cart_badge');
    await expect(cartBadge).toHaveText('1');
  });

});
