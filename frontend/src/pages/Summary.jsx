import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import feedbackAPI from "../api/feedback"

const Summary = () => {
  const { user, loading: authLoading } = useAuth()
  const [categorySummary, setCategorySummary] = useState([])
  const [prioritySummary, setPrioritySummary] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return

    const loadSummary = async () => {
      setLoading(true)
      setError(null)
      try {
        const categoryData = await feedbackAPI.getCategoryCounts()
        const priorityData = await feedbackAPI.getPriorityCounts()
        setCategorySummary(categoryData)
        setPrioritySummary(priorityData)
      } catch (err) {
        console.log("ERROR")
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadSummary()
  }, [user])

  if (authLoading) return <div>Loading authentication...</div>
  if (!user) return <div>Please log in to view the summary.</div>
  if (loading) return <div>Loading summary...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>

  return (
    <div>
        <h2 className="text-2xl font-bold mb-4">Feedback Summary by Category</h2>
        <ul className="list-disc pl-5">
            {categorySummary.map((item) => (
                <li key={item.category} className="mb-2">
                <span className="font-semibold">{item.category || "Uncategorized"}:</span> {item.count}
                </li>
            ))}
        </ul>

        <h2 className="text-2xl font-bold mb-4">Feedback Summary by Priority</h2>
        <ul className="list-disc pl-5">
            {prioritySummary.map((item) => (
                <li key={item.priority} className="mb-2">
                <span className="font-semibold">{item.priority || "Unprioritized"}:</span> {item.count}
                </li>
            ))}
        </ul>
    </div>
  )
}
export default Summary