/**
 * API Helper Class
 * Handles all HTTP requests (GET, POST, PUT, DELETE, PATCH)
 * Supports authentication headers, request/response logging, and error handling
 */

class APIHelper {
  constructor(baseURL, requestContext) {
    this.baseURL = baseURL || process.env.BASE_URL || 'https://www.saucedemo.com';
    this.requestContext = requestContext;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Set authentication token
   * @param {string} token - Bearer token
   */
  setAuthToken(token) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Request options (headers, params, etc.)
   * @returns {Promise} Response object
   */
  async get(endpoint, options = {}) {
    try {
      console.log(`[API] GET ${this.baseURL}${endpoint}`);
      const response = await this.requestContext.get(`${this.baseURL}${endpoint}`, {
        headers: { ...this.defaultHeaders, ...options.headers },
        ...options,
      });
      console.log(`[API] Response Status: ${response.status()}`);
      return response;
    } catch (error) {
      console.error(`[API] GET Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body
   * @param {object} options - Request options
   * @returns {Promise} Response object
   */
  async post(endpoint, data = {}, options = {}) {
    try {
      console.log(`[API] POST ${this.baseURL}${endpoint}`, data);
      const response = await this.requestContext.post(`${this.baseURL}${endpoint}`, {
        data,
        headers: { ...this.defaultHeaders, ...options.headers },
        ...options,
      });
      console.log(`[API] Response Status: ${response.status()}`);
      return response;
    } catch (error) {
      console.error(`[API] POST Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body
   * @param {object} options - Request options
   * @returns {Promise} Response object
   */
  async put(endpoint, data = {}, options = {}) {
    try {
      console.log(`[API] PUT ${this.baseURL}${endpoint}`, data);
      const response = await this.requestContext.put(`${this.baseURL}${endpoint}`, {
        data,
        headers: { ...this.defaultHeaders, ...options.headers },
        ...options,
      });
      console.log(`[API] Response Status: ${response.status()}`);
      return response;
    } catch (error) {
      console.error(`[API] PUT Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body
   * @param {object} options - Request options
   * @returns {Promise} Response object
   */
  async patch(endpoint, data = {}, options = {}) {
    try {
      console.log(`[API] PATCH ${this.baseURL}${endpoint}`, data);
      const response = await this.requestContext.patch(`${this.baseURL}${endpoint}`, {
        data,
        headers: { ...this.defaultHeaders, ...options.headers },
        ...options,
      });
      console.log(`[API] Response Status: ${response.status()}`);
      return response;
    } catch (error) {
      console.error(`[API] PATCH Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Request options
   * @returns {Promise} Response object
   */
  async delete(endpoint, options = {}) {
    try {
      console.log(`[API] DELETE ${this.baseURL}${endpoint}`);
      const response = await this.requestContext.delete(`${this.baseURL}${endpoint}`, {
        headers: { ...this.defaultHeaders, ...options.headers },
        ...options,
      });
      console.log(`[API] Response Status: ${response.status()}`);
      return response;
    } catch (error) {
      console.error(`[API] DELETE Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Parse JSON response
   * @param {object} response - Response object
   * @returns {Promise<object>} JSON body
   */
  async getResponseBody(response) {
    try {
      const body = await response.json();
      console.log(`[API] Response Body:`, body);
      return body;
    } catch (error) {
      console.log(`[API] Could not parse JSON response`);
      return null;
    }
  }

  /**
   * Check response status
   * @param {object} response - Response object
   * @param {number} expectedStatus - Expected status code
   * @returns {boolean} True if status matches
   */
  checkStatus(response, expectedStatus) {
    const actualStatus = response.status();
    console.log(`[API] Status Check: Expected ${expectedStatus}, Got ${actualStatus}`);
    return actualStatus === expectedStatus;
  }
}

module.exports = APIHelper;
