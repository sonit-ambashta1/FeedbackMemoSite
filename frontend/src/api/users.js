/**
 * Centralized User/Auth API Module
 * 
 * Handles authentication-related API calls:
 * - User registration
 * - User login (with HTTP-only cookie)
 * - User logout
 * - Get current user info
 */

import { API_BASE, apiFetch } from "./client";

const AUTH_BASE = `${API_BASE}/auth`;

/**
 * Register a new user
 * @param {string} username
 * @param {string} password
 */
async function register(username, password) {
  return apiFetch(`${AUTH_BASE}/register`, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

/**
 * Login user and set HTTP-only authentication cookie
 * @param {string} username
 * @param {string} password
 */
async function login(username, password) {
  return apiFetch(`${AUTH_BASE}/login`, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

/**
 * Logout user and clear HTTP-only authentication cookie
 */
async function logout() {
  return apiFetch(`${AUTH_BASE}/logout`, {
    method: "POST",
  });
}

/**
 * Get current authenticated user info
 */
async function getCurrentUser() {
  return apiFetch(`${AUTH_BASE}/me`, {
    method: "GET",
  });
}

// =====================================================================
// EXPORT API
// =====================================================================

const userAPI = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default userAPI;
