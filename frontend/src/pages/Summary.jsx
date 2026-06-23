import { useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import feedbackAPI from "../api/feedback"
import useAsync from "../hooks/useAsync"
import { Bar } from "react-chartjs-2"

const priorityStyle = {
  high: {
    background: "rgba(220, 38, 38, 0.25)",   // soft red
    border: "rgb(185, 28, 28)"              // dark red
  },
  medium: {
    background: "rgba(234, 179, 8, 0.25)",   // soft yellow
    border: "rgb(161, 98, 7)"              // dark amber
  },
  low: {
    background: "rgba(34, 197, 94, 0.25)",   // soft green
    border: "rgb(21, 128, 61)"             // dark green
  }
}

const categoryBackground = "rgba(100, 116, 139, 0.25)" // slate
const categoryBorder = "rgb(51, 65, 85)"

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

  const categoryChartData = {
    labels: categorySummary.map(x => x.category ?? "Uncategorized"),
    datasets: [
      {
        label: "Feedback Count",
        data: categorySummary.map(x => x.count),

        backgroundColor: categoryBackground,
        borderColor: categoryBorder,
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  }

  const categoryChartOptions = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: "Category"
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Count"
        },
        ticks: {
          stepSize: 1
        }
      }
    }
  }

  const priorityChartData = {
    labels: prioritySummary.map(x => x.priority ?? "Unprioritized"),
    datasets: [
      {
        label: "Feedback Priority",
        data: prioritySummary.map(x => x.count),

        backgroundColor: prioritySummary.map(x => {
          const p = x.priority?.toLowerCase()
          return priorityStyle[p]?.background ?? "rgba(148, 163, 184, 0.25)"
        }),

        borderColor: prioritySummary.map(x => {
          const p = x.priority?.toLowerCase()
          return priorityStyle[p]?.border ?? "rgb(71, 85, 105)"
        }),

        borderWidth: 2,
        borderRadius: 6
      }
    ]
  }

  const priorityChartOptions = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: "Priority"
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Count"
        },
        ticks: {
          stepSize: 1
        }
      }
    },
    backgroundColor: ["red", "yellow", "green"]
  }


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
      <div>
        <h2>Feedback Dashboard by Category</h2>
        <Bar data={categoryChartData} options={categoryChartOptions}/>
      </div>
      <div>
        <h2>Feedback Dashboard by Priority</h2>
        <Bar data={priorityChartData} options={priorityChartOptions} />
      </div>
    </div>
  )
}
export default Summary