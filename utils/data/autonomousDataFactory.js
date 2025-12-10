/**
 * AutonomousDataFactory - Dynamic Test Data Generation
 * 
 * Features:
 * - Faker.js integration for realistic data
 * - User credential generation
 * - Product data creation
 * - Test data templates
 * - Data cleanup after tests
 */

const { faker } = require('@faker-js/faker');

class AutonomousDataFactory {
  constructor() {
    this.generatedData = [];
  }

  /**
   * Generate random valid test user
   * @param {Object} overrides - Override specific fields
   * @returns {Object} - User object
   */
  static generateUser(overrides = {}) {
    const user = {
      id: faker.string.uuid(),
      username: faker.internet.username(),
      email: faker.internet.email(),
      password: this.generatePassword(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phone: faker.phone.number(),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zip: faker.location.zipCode(),
        country: faker.location.country(),
      },
      createdAt: new Date().toISOString(),
      ...overrides,
    };

    return user;
  }

  /**
   * Generate multiple users
   * @param {number} count - Number of users to generate
   * @param {Object} overrides - Shared overrides
   * @returns {Object[]} - Array of users
   */
  static generateUsers(count = 5, overrides = {}) {
    return Array.from({ length: count }, () =>
      this.generateUser(overrides)
    );
  }

  /**
   * Generate random product
   * @param {Object} overrides - Override specific fields
   * @returns {Object} - Product object
   */
  static generateProduct(overrides = {}) {
    const product = {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      category: faker.commerce.department(),
      sku: faker.commerce.sku(),
      quantity: faker.number.int({ min: 1, max: 100 }),
      image: faker.image.url(),
      rating: parseFloat((Math.random() * 5).toFixed(1)),
      reviews: faker.number.int({ min: 0, max: 1000 }),
      inStock: faker.datatype.boolean(),
      createdAt: new Date().toISOString(),
      ...overrides,
    };

    return product;
  }

  /**
   * Generate multiple products
   * @param {number} count - Number of products to generate
   * @param {Object} overrides - Shared overrides
   * @returns {Object[]} - Array of products
   */
  static generateProducts(count = 10, overrides = {}) {
    return Array.from({ length: count }, () =>
      this.generateProduct(overrides)
    );
  }

  /**
   * Generate random order
   * @param {Object} overrides - Override specific fields
   * @returns {Object} - Order object
   */
  static generateOrder(overrides = {}) {
    const items = this.generateProducts(
      faker.number.int({ min: 1, max: 5 })
    );
    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    const order = {
      id: faker.string.uuid(),
      orderNumber: `ORD-${faker.string.alphanumeric(8).toUpperCase()}`,
      userId: faker.string.uuid(),
      items,
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      status: faker.helpers.arrayElement([
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
      ]),
      paymentMethod: faker.helpers.arrayElement([
        'credit_card',
        'debit_card',
        'paypal',
        'bank_transfer',
      ]),
      shippingAddress: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zip: faker.location.zipCode(),
        country: faker.location.country(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides,
    };

    return order;
  }

  /**
   * Generate multiple orders
   * @param {number} count - Number of orders to generate
   * @param {Object} overrides - Shared overrides
   * @returns {Object[]} - Array of orders
   */
  static generateOrders(count = 5, overrides = {}) {
    return Array.from({ length: count }, () =>
      this.generateOrder(overrides)
    );
  }

  /**
   * Generate secure password
   * @returns {string} - Password
   */
  static generatePassword() {
    return faker.internet.password({
      length: 12,
      memorable: false,
      pattern: /[A-Za-z0-9!@#$%^&*]/,
    });
  }

  /**
   * Generate test data bundle
   * @param {Object} config - Configuration
   * @returns {Object} - Bundle with users, products, orders
   */
  static generateBundle(config = {}) {
    const {
      userCount = 3,
      productCount = 10,
      orderCount = 5,
    } = config;

    return {
      users: this.generateUsers(userCount),
      products: this.generateProducts(productCount),
      orders: this.generateOrders(orderCount),
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate Sauce Demo test credentials
   * @returns {Object} - Valid test user credentials
   */
  static generateSauceDemoCredentials() {
    return {
      standard_user: {
        username: 'standard_user',
        password: 'secret_sauce',
      },
      locked_out_user: {
        username: 'locked_out_user',
        password: 'secret_sauce',
      },
      problem_user: {
        username: 'problem_user',
        password: 'secret_sauce',
      },
      performance_glitch_user: {
        username: 'performance_glitch_user',
        password: 'secret_sauce',
      },
    };
  }

  /**
   * Generate cart data
   * @param {number} itemCount - Number of items in cart
   * @returns {Object} - Cart object
   */
  static generateCart(itemCount = 3) {
    const items = this.generateProducts(itemCount);
    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const tax = subtotal * 0.1;

    return {
      id: faker.string.uuid(),
      items,
      itemCount,
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat((subtotal + tax).toFixed(2)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate payment info
   * @returns {Object} - Payment object
   */
  static generatePaymentInfo() {
    return {
      cardNumber: faker.finance.creditCardNumber(),
      cardHolder: faker.person.fullName(),
      expiryMonth: faker.number.int({ min: 1, max: 12 }),
      expiryYear: faker.number.int({ min: 2024, max: 2030 }),
      cvv: faker.string.numeric(3),
      billingAddress: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zip: faker.location.zipCode(),
        country: faker.location.country(),
      },
    };
  }

  /**
   * Generate search query
   * @returns {string} - Search term
   */
  static generateSearchQuery() {
    return faker.commerce.productName();
  }

  /**
   * Generate multiple search queries
   * @param {number} count - Number of queries
   * @returns {string[]} - Array of search terms
   */
  static generateSearchQueries(count = 5) {
    return Array.from({ length: count }, () =>
      this.generateSearchQuery()
    );
  }

  /**
   * Record generated data for cleanup
   */
  recordGeneratedData(data) {
    this.generatedData.push({
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get all generated data
   */
  getGeneratedData() {
    return this.generatedData;
  }

  /**
   * Clear generated data records
   */
  clearGeneratedData() {
    this.generatedData = [];
  }

  /**
   * Generate data summary
   */
  getSummary() {
    return {
      totalRecords: this.generatedData.length,
      generatedAt: new Date().toISOString(),
      records: this.generatedData,
    };
  }
}

module.exports = AutonomousDataFactory;
