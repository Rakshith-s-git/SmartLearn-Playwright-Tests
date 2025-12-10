# SmartLearn Playwright Automation Framework - Enhanced

A comprehensive test automation framework demonstrating **UI Testing**, **API Testing**, and **Mobile Testing** using Playwright with Page Object Model (POM) pattern.

## 📁 Project Structure

```
SmartLearn_Playwright_Project/
├── tests/
│   ├── ui/                          # Desktop UI Tests
│   │   └── ui.login.spec.js        # Login and shopping flow tests
│   ├── api/                         # API Tests
│   │   └── products.api.spec.js    # API endpoint tests
│   └── mobile/                      # Mobile Tests
│       └── mobile.login.spec.js    # Mobile-specific tests
├── pages/
│   ├── loginPage.js                # Desktop login POM
│   ├── coursePage.js               # Desktop products POM
│   └── mobile/                      # Mobile Page Objects
│       ├── mobileLoginPage.js      # Mobile login POM
│       └── mobileCoursePage.js     # Mobile products POM
├── utils/
│   ├── apiClient.js                # Legacy API client
│   ├── api/
│   │   └── apiHelper.js            # Advanced API helper with logging
│   └── helpers/                     # Additional utilities (future)
├── fixtures/
│   └── testData.js                 # Test data and constants
├── playwright.config.js             # Playwright configuration with mobile devices
├── package.json                     # Project dependencies
└── README.md                        # This file
```

## 🎯 Test Coverage

### 1. **Desktop UI Tests** (`tests/ui/`)
- Login with valid credentials
- Product listing and search
- Add items to cart
- Cart management
- Multi-browser support (Chrome, Firefox, Safari)

### 2. **Mobile Tests** (`tests/mobile/`)
- Mobile login flow
- Mobile product viewing
- Mobile cart operations
- Hamburger menu navigation
- Support for iOS (iPhone 12) and Android (Pixel 5, Galaxy S21)

### 3. **API Tests** (`tests/api/`)
- Homepage and page accessibility
- Response status validation
- Response header verification
- Sequential API calls
- Response time measurement
- Login endpoint testing

## 🏗️ Page Object Model (POM) Implementation

### Desktop POM
- `LoginPage` - Login operations
- `CoursePage` - Product/course operations (browsing, adding to cart)

### Mobile POM
- `MobileLoginPage` - Mobile-specific login with error handling
- `MobileProductsPage` - Mobile-specific product operations with menu handling

Each POM class includes:
- Clear method names describing user actions
- Console logging for debugging
- Proper waits and synchronization
- Return values for assertions

## 🔧 API Helper Class

The `APIHelper` class provides:
- **HTTP Methods**: GET, POST, PUT, PATCH, DELETE
- **Authentication**: Bearer token support
- **Logging**: Detailed request/response logging
- **Error Handling**: Try-catch with error messages
- **Flexibility**: Custom headers and options support

### Usage Example
```javascript
const apiHelper = new APIHelper('https://api.example.com', request);
const response = await apiHelper.get('/products');
const body = await apiHelper.getResponseBody(response);
```

## 📊 Test Fixtures

`fixtures/testData.js` contains:
- Valid and invalid user credentials
- Product information
- Mobile device configurations
- Test timeouts
- API endpoints

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# or using yarn
yarn install
```

### Running Tests

```bash
# Run all tests (Desktop UI + API + Mobile)
npm test

# Run with headed browser
npm run test:headed

# Run only Desktop UI tests
npx playwright test tests/ui/

# Run only API tests
npx playwright test tests/api/

# Run only Mobile tests
npx playwright test tests/mobile/

# Run tests for specific browser
npx playwright test --project=chromium

# Run mobile tests only
npx playwright test --project="Mobile Chrome" --project="Mobile Safari"

# Debug mode
npm run test:debug

# View HTML report
npm run test:report
```

## 📱 Mobile Device Support

The framework supports testing on multiple mobile devices:
- **iPhone 12** (iOS)
- **Pixel 5** (Android)
- **Galaxy S9+** (Android)

Mobile tests automatically use the correct viewport size and touch events.

## 🔍 Debugging

### Console Logging
All POM classes and API helper include detailed logging:
```
[UI] Login button clicked
[Mobile] Entering username: standard_user
[API] GET https://api.example.com/products
[API] Response Status: 200
```

### Trace Files
Tests automatically create trace files on first retry:
```bash
# Inspect trace from last failed test
npx playwright show-trace test-results/trace.zip
```

### Debug Mode
```bash
npm run test:debug
```

## 📝 Writing New Tests

### 1. Create a Page Object
```javascript
class NewPage {
  constructor(page) {
    this.page = page;
    this.button = '#submit-btn';
  }

  async clickButton() {
    await this.page.click(this.button);
  }
}
module.exports = NewPage;
```

### 2. Create Test Spec
```javascript
const { test, expect } = require('@playwright/test');
const NewPage = require('../pages/newPage');

test('New test', async ({ page }) => {
  const newPage = new NewPage(page);
  await newPage.clickButton();
  expect(true).toBeTruthy();
});
```

### 3. Add Test Data
```javascript
// Add to fixtures/testData.js
const testData = {
  newData: {
    value: 'test',
  }
};
```

## 🎯 Best Practices Implemented

1. **Page Object Model** - Maintainable, reusable selectors
2. **Test Data Separation** - Centralized test data in fixtures
3. **Logging** - Detailed console logs for debugging
4. **Error Handling** - Try-catch blocks with meaningful messages
5. **Wait Strategies** - Proper synchronization with waitForLoadState
6. **Cross-Browser Testing** - Desktop browsers + Mobile devices
7. **API Testing** - Dedicated API helper for HTTP operations
8. **Responsive Design** - Mobile-specific POM classes

## 📊 Test Results Structure

HTML reports include:
- Test duration for each test
- Failure details with screenshots
- Browser-specific results
- Video recordings (if configured)
- Trace files for debugging

## 🔐 Environment Variables

Create a `.env` file (copy from `example.env`):
```
BASE_URL=https://www.saucedemo.com
TEST_USER=standard_user
TEST_PASSWORD=secret_sauce
```

## 🛠️ Configuration Files

### `playwright.config.js`
- Test directory and timeout settings
- Reporter configuration
- Browser projects (Desktop + Mobile)
- Trace and video settings

### `package.json`
- Dependencies: `@playwright/test`
- Scripts for running tests

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Sauce Demo](https://www.saucedemo.com) - Test application
- [Page Object Model Pattern](https://playwright.dev/docs/pom)

## 🤝 Contributing

When adding new tests:
1. Follow the existing POM structure
2. Add test data to `fixtures/testData.js`
3. Include console logging for debugging
4. Group related tests using `test.describe()`
5. Add meaningful test descriptions

## 📄 License

This is a sample project for learning Playwright automation testing.

---

**Happy Testing! 🎉**
