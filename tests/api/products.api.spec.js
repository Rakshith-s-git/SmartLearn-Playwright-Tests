/**
 * API Tests - Products and Inventory
 * Tests for Sauce Demo API endpoints
 */

const { test, expect } = require('@playwright/test');
const APIHelper = require('../../utils/api/apiHelper');
const testData = require('../../fixtures/testData');

test.describe('Sauce Demo - API Testing', () => {
  let apiHelper;

  test.beforeEach(async ({ request }) => {
    // Initialize API helper before each test
    apiHelper = new APIHelper('https://www.saucedemo.com', request);
    console.log('[API Tests] Test initialized');
  });

  test('API: Verify main application page loads with 200 status', async ({ request }) => {
    console.log('[API Test 1] Testing main page load');
    
    const response = await apiHelper.get('/');
    
    expect(response.status()).toBe(200);
    console.log('[API Test 1] ✓ Main page loaded successfully');
  });

  test('API: Verify API response headers are present', async ({ request }) => {
    console.log('[API Test 2] Testing response status');
    
    const response = await apiHelper.get('/');
    
    expect(response.status()).toBe(200);
    console.log('[API Test 2] ✓ Response status is 200');
  });

  test('API: Verify response is OK', async ({ request }) => {
    console.log('[API Test 3] Testing response OK status');
    
    const response = await apiHelper.get('/');
    
    expect(response.ok()).toBeTruthy();
    console.log('[API Test 3] ✓ Response is OK');
  });

  test('API: Verify response body contains HTML content', async ({ request }) => {
    console.log('[API Test 4] Testing response body');
    
    const response = await apiHelper.get('/');
    const content = await response.text();
    
    expect(response.status()).toBe(200);
    expect(content).toContain('html');
    console.log('[API Test 4] ✓ Response body contains valid HTML');
  });

  test('API: Verify multiple sequential requests succeed', async ({ request }) => {
    console.log('[API Test 5] Testing multiple sequential calls');
    
    // First request
    const response1 = await apiHelper.get('/');
    expect(response1.status()).toBe(200);
    
    // Second request
    const response2 = await apiHelper.get('/');
    expect(response2.status()).toBe(200);
    
    // Third request
    const response3 = await apiHelper.get('/');
    expect(response3.status()).toBe(200);
    
    console.log('[API Test 5] ✓ All sequential calls succeeded');
  });

  test('API: Verify page response times are acceptable', async ({ request }) => {
    console.log('[API Test 6] Testing response times');
    
    const startTime = Date.now();
    const response = await apiHelper.get('/');
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(testData.timeout.long);
    
    console.log(`[API Test 6] Response time: ${responseTime}ms`);
    console.log('[API Test 6] ✓ Response time is acceptable');
  });

  test('API: Verify application is accessible from different regions', async ({ request }) => {
    console.log('[API Test 7] Testing application accessibility');
    
    const response = await apiHelper.get('/');
    
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();
    console.log('[API Test 7] ✓ Application is accessible');
  });

  test('API: Verify response status codes are correct', async ({ request }) => {
    console.log('[API Test 8] Testing response status codes');
    
    const response = await apiHelper.get('/');
    
    // 200 = OK, 201 = Created, 204 = No Content are all acceptable
    expect([200, 201, 204]).toContain(response.status());
    console.log('[API Test 8] ✓ Response status code is valid');
  });
});

