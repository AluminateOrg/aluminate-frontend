/**
 * @fileoverview Common Axios instance for the Aluminate application
 * 
 * This module provides a pre-configured Axios instance for making HTTP requests
 * to the backend API. It handles authentication through cookies (CSRF tokens and session IDs)
 * and automatically configures the base URL from environment variables.
 * 
 * @author Aluminate Team
 * @version 1.0.0
 */

import axios from "axios";

/**
 * Retrieves a cookie value by name from the browser's document.cookie
 * 
 * @param {string} name - The name of the cookie to retrieve
 * @returns {string | null} The decoded cookie value, or null if not found
 * 
 * @example
 * const csrfToken = getCookie("csrf-token");
 * console.log(csrfToken); // "abc123" or null
 */
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Constructs the complete API URL from environment variables
 * 
 * Combines NEXT_PUBLIC_BACKEND_URL with NEXT_PUBLIC_API_PREFIX to create
 * the full base URL for API requests.
 * 
 * @example
 * // If NEXT_PUBLIC_BACKEND_URL = "https://api.aluminate.com"
 * // and NEXT_PUBLIC_API_PREFIX = "v1"
 * // then apiUrl = "https://api.aluminate.com/v1"
 */
const apiUrl =
  (process.env.NEXT_PUBLIC_BACKEND_URL ?? "") + 
  (process.env.NEXT_PUBLIC_API_PREFIX ?? "") + "/common";

/**
 * Pre-configured Axios instance for common API requests
 * 
 * This instance is configured with:
 * - Base URL from environment variables
 * - Credentials included for cookie-based authentication
 * - Request interceptor for CSRF protection and session management
 * 
 * @type {import('axios').AxiosInstance}
 * 
 * @example
 * import axiosCommon from './axiosInstances/axiosCommon';
 * 
 * // GET request
 * const response = await axiosCommon.get('/users');
 * 
 * // POST request
 * const newUser = await axiosCommon.post('/users', userData);
 */
const axiosCommon = axios.create({
  baseURL: apiUrl,
  withCredentials: true, // ensures sessionId and JWT are sent via cookies
});

/**
 * Request interceptor for automatic authentication header injection
 * 
 * This interceptor automatically:
 * 1. Retrieves CSRF token and session ID from browser cookies
 * 2. Attaches them to request headers for authentication
 * 3. Provides CSRF protection for state-changing requests
 * 
 * Headers added:
 * - X-Csrf-Token: CSRF protection token
 * - X-Session-Id: User session identifier
 * 
 * @param {import('axios').InternalAxiosRequestConfig} config - The request configuration
 * @returns {import('axios').InternalAxiosRequestConfig} Modified request configuration
 * 
 * @example
 * // Headers are automatically added to all requests:
 * // X-Csrf-Token: abc123...
 * // X-Session-Id: session456...
 */
axiosCommon.interceptors.request.use(config => {
  const csrfToken = getCookie("csrf-token");
  const sessionId = getCookie("sessionId");
  

  // Attach CSRF token and sessionId to headers if they exist
  if (csrfToken && config.headers) {
    config.headers["X-Csrf-Token"] = csrfToken;
  }

  if (sessionId && config.headers) {
    config.headers["X-Session-Id"] = sessionId;
  }
  return config;
}, error => Promise.reject(error));

/**
 * Exported Axios instance for common API operations
 * 
 * Use this instance for API calls that require:
 * - Cookie-based authentication
 * - CSRF protection
 * - Session management
 * 
 * @default axiosCommon
 */
export default axiosCommon;
