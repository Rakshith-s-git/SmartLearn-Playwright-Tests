
const { request } = require('@playwright/test');

class ApiClient {
  constructor(baseURL) {
    // Using Sauce Demo API if available, otherwise use provided URL
    this.baseURL = baseURL || process.env.BASE_URL || 'https://www.saucedemo.com';
  }

  async getProducts() {
    const req = await request.newContext({ baseURL: this.baseURL });
    const resp = await req.get('/inventory.html');
    await req.dispose();
    return resp;
  }

  // Generic GET method for any endpoint
  async get(endpoint) {
    const req = await request.newContext({ baseURL: this.baseURL });
    const resp = await req.get(endpoint);
    await req.dispose();
    return resp;
  }
}

module.exports = ApiClient;
