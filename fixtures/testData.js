/**
 * Test Data Fixtures
 * Contains test data for UI, API, and Mobile testing
 */

const testData = {
  // Sauce Demo credentials
  users: {
    validUser: {
      username: 'standard_user',
      password: 'secret_sauce',
      expectedName: 'Swag Labs',
    },
    lockedUser: {
      username: 'locked_out_user',
      password: 'secret_sauce',
    },
    performanceUser: {
      username: 'performance_glitch_user',
      password: 'secret_sauce',
    },
  },

  // Product data for Sauce Demo
  products: {
    sauceLabs: {
      name: 'Sauce Labs Backpack',
      price: '$29.99',
      description: 'carry.allTheThings()',
    },
    bikeLights: {
      name: 'Sauce Labs Bike Lights',
      price: '$9.99',
    },
    boltTShirt: {
      name: 'Sauce Labs Bolt T-Shirt',
      price: '$15.99',
    },
  },

  // Cart data
  cart: {
    minimumItems: 1,
    maximumItems: 6,
  },

  // API endpoints (Example - adjust based on your API)
  api: {
    inventory: '/inventory',
    cart: '/cart',
    checkout: '/checkout',
  },

  // Mobile specific data
  mobile: {
    screenSize: {
      iphone12: { width: 390, height: 844 },
      iphone13: { width: 390, height: 844 },
      pixel5: { width: 393, height: 851 },
      galaxyS21: { width: 360, height: 800 },
    },
  },

  // Test timeouts
  timeout: {
    short: 5000,
    medium: 10000,
    long: 30000,
  },
};

module.exports = testData;
