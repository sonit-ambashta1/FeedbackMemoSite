/**
 * FeedbackItem
 *
 * Displays a single feedback entry with priority-based styling.
 * Supports both display and edit modes.
 */

import { useState } from "react";

const PRIORITY_STYLES = {
  high: "border-red-200 bg-red-50 text-red-900",
  medium: "border-amber-200 bg-amber-50 text-amber-900",
  low: "border-emerald-200 bg-emerald-50 text-emerald-900",
};

const DEFAULT_STYLE = "border-slate-200 bg-white text-slate-900";
const DEFAULT_PRIORITY = "medium";

export default function FeedbackItem({ feedback, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(feedback?.content || "");
  const [editCategory, setEditCategory] = useState(feedback?.category || "");
  const [editPriority, setEditPriority] = useState(feedback?.priority || DEFAULT_PRIORITY);
  const [isSaving, setIsSaving] = useState(false);

  if (!feedback) return null;

  const {
    id,
    content,
    category,
    priority: rawPriority,
  } = feedback;

  const priority = rawPriority ?? DEFAULT_PRIORITY;
  const priorityStyle = PRIORITY_STYLES[priority] ?? DEFAULT_STYLE;

  // Handle save
  async function handleSave() {
    if (!editContent.trim()) {
      alert("Feedback content cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate(id, {
        content: editContent,
        category: editCategory || null,
        priority: editPriority,
      });
      setIsEditing(false);
    } catch (err) {
      alert(`Failed to update feedback: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }

  // Handle cancel
  function handleCancel() {
    setEditContent(content);
    setEditCategory(category || "");
    setEditPriority(priority);
    setIsEditing(false);
  }

  // Display mode
  if (!isEditing) {
    return (
      <article
        className={`border rounded-[1.5rem] bg-white p-5 shadow-sm space-y-4 ${priorityStyle}`}
        aria-label={`Feedback item with ${priority} priority`}
      >
        <header className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-slate-700">
            {priority.toUpperCase()}
          </span>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-sm font-medium text-sky-600 hover:text-sky-700"
              aria-label="Edit feedback"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(id)}
              className="text-sm font-medium text-red-600 hover:text-red-700"
              aria-label="Delete feedback"
            >
              Delete
            </button>
          </div>
        </header>

        <p className="text-sm text-slate-700 whitespace-pre-wrap">
          {content}
        </p>

        {category && (
          <p className="text-sm text-slate-500">
            Category: {category}
          </p>
        )}
      </article>
    );
  }

  // Edit mode
  return (
    <article
      className={`border rounded-[1.5rem] bg-white p-5 shadow-sm space-y-4 ${priorityStyle}`}
      aria-label="Edit feedback item"
    >
      <div className="space-y-5">
        <h1 className="text-3xl font-semibold text-slate-900 mb-6">Filter By:</h1>
        <div>
          <label htmlFor={`content-${id}`} className="block text-sm font-medium text-slate-700 mb-2">
            Content
          </label>
          <textarea
            id={`content-${id}`}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            disabled={isSaving}
            rows={3}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor={`category-${id}`} className="block text-sm font-medium text-slate-700 mb-2">
              Category
            </label>
            <input
              id={`category-${id}`}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              placeholder="e.g., UI, Performance"
              disabled={isSaving}
            />
          </div>

          <div>
            <label htmlFor={`priority-${id}`} className="block text-sm font-medium text-slate-700 mb-2">
              Priority
            </label>
            <select
              id={`priority-${id}`}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value)}
              disabled={isSaving}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </article>
  );
}
