
// @ts-check
const { devices } = require('@playwright/test');

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: './tests',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    headless: true,
    actionTimeout: 0,
    trace: 'on-first-retry',
  },
  projects: [
    // Desktop browsers
    { 
      name: 'chromium', 
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      } 
    },
    { 
      name: 'firefox', 
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      } 
    },
    { 
      name: 'webkit', 
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      } 
    },
    
    // Mobile devices
    { 
      name: 'Mobile Chrome', 
      use: { 
        ...devices['Pixel 5'],
      } 
    },
    { 
      name: 'Mobile Safari', 
      use: { 
        ...devices['iPhone 12'],
      } 
    },
    { 
      name: 'Samsung Galaxy S21', 
      use: { 
        ...devices['Galaxy S9+'],
      } 
    },
  ],
};
module.exports = config;
