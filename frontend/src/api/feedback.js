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

import { buildUrl, apiFetch, API_BASE } from "./client";

const FEEDBACK_BASE = `${API_BASE}/feedback`;

// =====================================================================
// FEEDBACK OPERATIONS
// =====================================================================

/**
 * Get all feedback for current user
 */
async function getMyFeedback() {
  return apiFetch(`${FEEDBACK_BASE}/me`, {
    method: "GET",
  });
}

/**
 * Submit new feedback
 * @param {Object} feedback { content, category, priority }
 */
async function submitFeedback(feedback) {
  return apiFetch(`${FEEDBACK_BASE}/submit`, {
    method: "POST",
    body: JSON.stringify(feedback),
  });
}

/**
 * Update feedback by ID
 * @param {number|string} feedbackId 
 * @param {Object} feedback { content?, category?, priority? }
 */
async function updateFeedback(feedbackId, feedback) {
  return apiFetch(`${FEEDBACK_BASE}/${feedbackId}`, {
    method: "PUT",
    body: JSON.stringify(feedback),
  });
}

/**
 * Delete feedback by ID
 * @param {number|string} feedbackId 
 */
async function deleteFeedback(feedbackId) {
  return apiFetch(`${FEEDBACK_BASE}/${feedbackId}`, {
    method: "DELETE",
  });
}

/**
 * Get feedback for the current user filtered by optional query params
 * @param {Object} filters { category, priority }
 */
async function getFeedback(filters = {}) {
  const url = buildUrl(`${FEEDBACK_BASE}`, filters);
  return apiFetch(url, { method: "GET" });
}

/**
 * Get feedback for the current user filtered by category.
 */
async function getFeedbackByCategory(category) {
  return getFeedback({ category });
}

/**
 * Get feedback for the current user filtered by priority.
 */
async function getFeedbackByPriority(priority) {
  return getFeedback({ priority });
}

/**
 * Get feedback for the current user filtered by both category and priority.
 */
async function getFeedbackByCategoryAndPriority(category, priority) {
  return getFeedback({ category, priority });
}

/**
 * Get category counts for the current user
 */
async function getCategoryCounts() {
  return apiFetch(`${FEEDBACK_BASE}/category_counts`, { method: "GET" });
}

/**
 * Get priority counts for the current user
 */
async function getPriorityCounts() {
  return apiFetch(`${FEEDBACK_BASE}/priority_counts`, { method: "GET" });
}

/**
 * Get category and priority counts for the current user
 */
async function getCategoryAndPriorityCounts() {
  return apiFetch(`${FEEDBACK_BASE}/category_priority_counts`, { method: "GET" });
}

/**
 * Get feedback by ID (only returns if current user owns it)
 * @param {number|string} feedbackId
 */
async function getFeedbackById(feedbackId) {
  return apiFetch(`${FEEDBACK_BASE}/${feedbackId}`, { method: "GET" });
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
  getFeedback,
  getFeedbackByCategory,
  getFeedbackByPriority,
  getFeedbackByCategoryAndPriority,
  getCategoryCounts,
  getPriorityCounts,
  getCategoryAndPriorityCounts,
};

export default feedbackAPI;
