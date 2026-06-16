const FeedbackFilter = ({ filters, onChange, onReset }) => {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <h1 className="text-3xl font-semibold text-slate-900 mb-6">Filter By:</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Category</span>
          <input
            value={filters.category}
            onChange={(e) => onChange("category", e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
            placeholder="e.g. UI, Performance"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Priority</span>
          <select
            value={filters.priority}
            onChange={(e) => onChange("priority", e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
          >
            <option value="">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700"
      >
        Reset filters
      </button>
    </div>
  )
}
export default FeedbackFilter