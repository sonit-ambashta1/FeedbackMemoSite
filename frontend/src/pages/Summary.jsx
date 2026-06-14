import { useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import feedbackAPI from "../api/feedback"
import useAsync from "../hooks/useAsync"

const Summary = () => {
  const { user, initializing: authLoading } = useAuth()
  const {
    data: summaryData,
    loading,
    error,
    execute,
    setError,
  } = useAsync({
    categorySummary: [],
    prioritySummary: [],
    categoryPrioritySummary: [],
  })
  const { categorySummary, prioritySummary, categoryPrioritySummary } = summaryData

  useEffect(() => {
    if (!user) return

    execute(async () => {
      const [categoryData, priorityData, categoryPriorityData] = await Promise.all([
        feedbackAPI.getCategoryCounts(),
        feedbackAPI.getPriorityCounts(),
        feedbackAPI.getCategoryAndPriorityCounts(),
      ])

      return {
        categorySummary: categoryData,
        prioritySummary: priorityData,
        categoryPrioritySummary: categoryPriorityData,
      }
    }).catch((err) => {
      setError(err.message)
    })
  }, [user, execute, setError])

  if (authLoading) return <div className="min-h-screen bg-slate-50 py-12 px-4">Loading authentication...</div>
  if (!user) return <div className="min-h-screen bg-slate-50 py-12 px-4">Please log in to view the summary.</div>
  if (loading) return <div className="min-h-screen bg-slate-50 py-12 px-4">Loading summary...</div>
  if (error) return <div className="min-h-screen bg-slate-50 py-12 px-4 text-red-500">Error: {error}</div>

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Feedback Summary by Category</h2>
          <ul className="space-y-3">
            {categorySummary.map((item) => (
              <li key={item.category} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700">
                <span className="font-semibold text-slate-900">{item.category || "Uncategorized"}:</span> {item.count}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Feedback Summary by Priority</h2>
          <ul className="space-y-3">
            {prioritySummary.map((item) => (
              <li key={item.priority} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700">
                <span className="font-semibold text-slate-900">{item.priority || "Unprioritized"}:</span> {item.count}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Feedback Summary by Category and Priority</h2>
          <ul className="space-y-3">
            {categoryPrioritySummary.map((item) => (
              <li key={`${item.category}-${item.priority}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700">
                <span className="font-semibold text-slate-900">{item.category || "Uncategorized"} - {item.priority || "Unprioritized"}:</span> {item.count}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
export default Summary