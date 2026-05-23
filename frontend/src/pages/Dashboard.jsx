/**
 * Dashboard Page Component
 * 
 * Full-featured user dashboard for feedback management.
 * Combines feedback list and add-feedback form with live updates.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import feedbackAPI from "../api/feedback";
import FeedbackItem from "../components/FeedbackItem";

// Priority sorting order
const PRIORITY_ORDER = { high: 3, medium: 2, low: 1 };

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newPriority, setNewPriority] = useState("medium");

  // Load user's feedback
  useEffect(() => {
    if (!user) return;

    async function loadFeedback() {
      setLoading(true);
      setError(null);
      try {
        const data = await feedbackAPI.getMyFeedback();
        setFeedbacks(data);
      } catch (err) {
        console.error("Failed to load feedback:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadFeedback();
  }, [user]);

  // Add feedback
  async function handleAddFeedback(e) {
    e.preventDefault();
    if (!newContent.trim()) return alert("Feedback content cannot be empty");

    setIsSubmitting(true);
    try {
      const newFeedback = await feedbackAPI.submitFeedback({
        content: newContent,
        category: newCategory || null,
        priority: newPriority,
      });
      // Prepend new feedback for live update
      setFeedbacks((prev) => [newFeedback, ...prev]);
      setNewContent("");
      setNewCategory("");
      setNewPriority("medium");
    } catch (err) {
      alert(`Failed to add feedback: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Update feedback
  async function handleEdit(feedbackId, updatedData) {
    try {
      const updated = await feedbackAPI.updateFeedback(feedbackId, updatedData);
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === feedbackId ? updated : f))
      );
    } catch (err) {
      alert(`Failed to update feedback: ${err.message}`);
      throw err;
    }
  }

  // Delete feedback
  async function handleDelete(feedbackId) {
    if (!confirm("Are you sure you want to delete this feedback?")) return;

    try {
      await feedbackAPI.deleteFeedback(feedbackId);
      setFeedbacks((prev) => prev.filter((f) => f.id !== feedbackId));
    } catch (err) {
      alert(`Failed to delete feedback: ${err.message}`);
    }
  }

  // Sort feedback by priority
  const sortedFeedbacks = [...feedbacks].sort(
    (a, b) => (PRIORITY_ORDER[b.priority] ?? 0) - (PRIORITY_ORDER[a.priority] ?? 0)
  );

  // Loading & auth checks
  if (authLoading) return <div className="min-h-screen bg-slate-50 py-12 px-4">Loading authentication...</div>;
  if (!user) return <div className="min-h-screen bg-slate-50 py-12 px-4 text-slate-600">Please log in to view your dashboard.</div>;
  if (loading) return <div className="min-h-screen bg-slate-50 py-12 px-4 text-slate-600">Loading feedback...</div>;
  if (error) return <div className="min-h-screen bg-slate-50 py-12 px-4 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900 mb-6">Welcome, {user.username}!</h1>

          <form onSubmit={handleAddFeedback} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="content" className="block text-sm font-medium text-slate-700">Your Feedback</label>
              <textarea
                id="content"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                placeholder="Write your feedback..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                disabled={isSubmitting}
                rows={4}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="category" className="block text-sm font-medium text-slate-700">Category (optional)</label>
                <input
                  id="category"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  placeholder="e.g., UI, Performance"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="priority" className="block text-sm font-medium text-slate-700">Priority</label>
                <select
                  id="priority"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Feedback"}
            </button>
          </form>
        </div>

        {sortedFeedbacks.length === 0 ? (
          <p className="text-center text-slate-500 py-10">No feedback yet. Add one above!</p>
        ) : (
          <div className="space-y-4">
            {sortedFeedbacks.map((feedback) => (
              <FeedbackItem key={feedback.id} feedback={feedback} onDelete={handleDelete} onUpdate={handleEdit} />
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <Link
            to="/summary"
            className="inline-flex items-center rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
          >
            View Summary
          </Link>
        </div>
      </div>
    </div>
  );
}
