/**
 * Centralized Feedback API Module
 * 
 * Handles all feedback-related API calls:
 * - Fetch current user's feedback
 * - Add new feedback
 * - Delete feedback
 * 
 * Uses HTTP-only cookie for authentication.
 */

const API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/feedback`;

/**
 * Error handler: Extract meaningful messages
 * Handles 204 No Content for DELETE requests
 */
async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.detail || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(errorMessage);
  }

  // Handle 204 No Content
  if (response.status === 204) return null;

  return await response.json();
}

/**
 * Common fetch options for authenticated requests
 */
const authenticatedOptions = {
  credentials: "include", // send HTTP-only cookies
  headers: {
    "Content-Type": "application/json",
  },
};

// =====================================================================
// FEEDBACK OPERATIONS
// =====================================================================

/**
 * Get all feedback for current user
 */
async function getMyFeedback() {
  const response = await fetch(`${API_BASE}/me`, {
    method: "GET",
    ...authenticatedOptions,
  });
  return handleResponse(response);
}

/**
 * Submit new feedback
 * @param {Object} feedback { content, category, priority }
 */
async function submitFeedback(feedback) {
  const response = await fetch(`${API_BASE}/submit`, {  // Fixed URL
    method: "POST",
    ...authenticatedOptions,
    body: JSON.stringify(feedback),
  });
  return handleResponse(response);
}

/**
 * Update feedback by ID
 * @param {number|string} feedbackId 
 * @param {Object} feedback { content?, category?, priority? }
 */
async function updateFeedback(feedbackId, feedback) {
  const response = await fetch(`${API_BASE}/${feedbackId}`, {
    method: "PUT",
    ...authenticatedOptions,
    body: JSON.stringify(feedback),
  });
  return handleResponse(response);
}

/**
 * Delete feedback by ID
 * @param {number|string} feedbackId 
 */
async function deleteFeedback(feedbackId) {
  const response = await fetch(`${API_BASE}/${feedbackId}`, {
    method: "DELETE",
    ...authenticatedOptions,
  });
  return handleResponse(response); // now handles 204 correctly
}


/**
 * Get feedback for the current user filtered by category
 * @param {string} category
 */
async function getFeedbackByCategory(category) {
  const response = await fetch(`${API_BASE}/category/${encodeURIComponent(category)}`, {
    method: "GET",
    ...authenticatedOptions,
  });
  return handleResponse(response);
}

/**
 * Get feedback for the current user filtered by priority
 * @param {string} priority
 */
async function getFeedbackByPriority(priority) {
  const response = await fetch(`${API_BASE}/priority/${encodeURIComponent(priority)}`, {
    method: "GET",
    ...authenticatedOptions,
  });
  return handleResponse(response);
}

/**
 * Get category counts for the current user
 */
async function getCategoryCounts() {
  const response = await fetch(`${API_BASE}/category_counts`, {
    method: "GET",
    ...authenticatedOptions,
  });
  return handleResponse(response);
}

/**
 * Get feedback by ID (only returns if current user owns it)
 * @param {number|string} feedbackId
 */
async function getFeedbackById(feedbackId) {
  const response = await fetch(`${API_BASE}/${feedbackId}`, {
    method: "GET",
    ...authenticatedOptions,
  });
  return handleResponse(response);
}

// =====================================================================
// EXPORT API
// =====================================================================
const feedbackAPI = {
  getMyFeedback,
  submitFeedback,
  updateFeedback,
  deleteFeedback,
  getFeedbackById,
  getFeedbackByCategory,
  getFeedbackByPriority,
  getCategoryCounts,
};

export default feedbackAPI;
