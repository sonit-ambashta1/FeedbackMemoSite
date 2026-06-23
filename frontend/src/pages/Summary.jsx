import { useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import feedbackAPI from "../api/feedback"
import useAsync from "../hooks/useAsync"
import { Bar } from "react-chartjs-2"
import { Link } from "react-router-dom"

/* -----------------------------
   Layout Primitives
------------------------------*/

const DashboardCard = ({ title, description, children }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col">
      
      {/* Header */}
      <div className="border-b border-slate-100 px-6 py-5">
        <h2 className="text-lg font-semibold text-slate-900">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex-1">
        {children}
      </div>

    </div>
  )
}

const ChartContainer = ({ children }) => {
  return (
    <div className="h-[400px] w-full">
      {children}
    </div>
  )
}

/* -----------------------------
   Styling Maps
------------------------------*/

const priorityStyle = {
  high: {
    background: "rgba(220, 38, 38, 0.25)",
    border: "rgb(185, 28, 28)"
  },
  medium: {
    background: "rgba(234, 179, 8, 0.25)",
    border: "rgb(161, 98, 7)"
  },
  low: {
    background: "rgba(34, 197, 94, 0.25)",
    border: "rgb(21, 128, 61)"
  }
}

const categoryBackground = "rgba(100, 116, 139, 0.25)"
const categoryBorder = "rgb(51, 65, 85)"

/* -----------------------------
   Page
------------------------------*/

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

  const {
    categorySummary,
    prioritySummary,
    categoryPrioritySummary
  } = summaryData

  /* -----------------------------
     Fetch
  ------------------------------*/

  useEffect(() => {
    if (!user) return

    execute(async () => {
      const [categoryData, priorityData, categoryPriorityData] =
        await Promise.all([
          feedbackAPI.getCategoryCounts(),
          feedbackAPI.getPriorityCounts(),
          feedbackAPI.getCategoryAndPriorityCounts(),
        ])

      return {
        categorySummary: categoryData,
        prioritySummary: priorityData,
        categoryPrioritySummary: categoryPriorityData,
      }
    }).catch((err) => setError(err.message))

  }, [user, execute, setError])

  /* -----------------------------
     Category Chart
  ------------------------------*/

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
        title: { display: true, text: "Category" }
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
        title: { display: true, text: "Count" }
      }
    }
  }

  /* -----------------------------
     Priority Chart
  ------------------------------*/

  const priorityChartData = {
    labels: prioritySummary.map(x => x.priority ?? "Unprioritized"),
    datasets: [
      {
        label: "Feedback Priority",
        data: prioritySummary.map(x => x.count),

        backgroundColor: prioritySummary.map(x => {
          const p = x.priority?.toLowerCase()
          return priorityStyle[p]?.background ?? "rgba(148,163,184,0.25)"
        }),

        borderColor: prioritySummary.map(x => {
          const p = x.priority?.toLowerCase()
          return priorityStyle[p]?.border ?? "rgb(71,85,105)"
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
        title: { display: true, text: "Priority" }
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
        title: { display: true, text: "Count" }
      }
    }
  }

  /* -----------------------------
     Stacked Chart Data
  ------------------------------*/

  const categories = Array.from(
    new Set(categoryPrioritySummary.map(x => x.category))
  )

  const categoryPriorityChartData = {
    labels: categories,

    datasets: [
      {
        label: "High",
        data: categories.map(c =>
          categoryPrioritySummary.find(
            x => x.category === c && x.priority === "high"
          )?.count ?? 0
        ),
        backgroundColor: priorityStyle.high.background,
        borderColor: priorityStyle.high.border,
        borderWidth: 2
      },

      {
        label: "Medium",
        data: categories.map(c =>
          categoryPrioritySummary.find(
            x => x.category === c && x.priority === "medium"
          )?.count ?? 0
        ),
        backgroundColor: priorityStyle.medium.background,
        borderColor: priorityStyle.medium.border,
        borderWidth: 2
      },

      {
        label: "Low",
        data: categories.map(c =>
          categoryPrioritySummary.find(
            x => x.category === c && x.priority === "low"
          )?.count ?? 0
        ),
        backgroundColor: priorityStyle.low.background,
        borderColor: priorityStyle.low.border,
        borderWidth: 2
      }
    ]
  }

  const categoryPriorityChartOptions = {
    responsive: true,
    scales: {
      x: {
        stacked: true,
        title: { display: true, text: "Category" }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: { stepSize: 1 },
        title: { display: true, text: "Count" }
      }
    }
  }

  /* -----------------------------
     Guards
  ------------------------------*/

  if (authLoading) return "Loading authentication..."
  if (!user) return "Please log in to view the summary."
  if (loading) return "Loading summary..."
  if (error) return `Error: ${error}`

  /* -----------------------------
     Render
  ------------------------------*/

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      <div className="mx-auto max-w-6xl grid grid-cols-1 gap-6">

        <DashboardCard
          title="Feedback by Category"
          description="Distribution across feature areas"
        >
          <ChartContainer>
            <Bar data={categoryChartData} options={categoryChartOptions} />
          </ChartContainer>
        </DashboardCard>

        <DashboardCard
          title="Feedback by Priority"
          description="Severity distribution across feedback"
        >
          <ChartContainer>
            <Bar data={priorityChartData} options={priorityChartOptions} />
          </ChartContainer>
        </DashboardCard>

        <DashboardCard
          title="Category × Priority Breakdown"
          description="How severity distributes across categories"
        >
          <ChartContainer>
            <Bar
              data={categoryPriorityChartData}
              options={categoryPriorityChartOptions}
            />
          </ChartContainer>
        </DashboardCard>

      </div>
      <div className="flex justify-end">
          <Link
            to="/dashboard"
            className="inline-flex items-center rounded-full bg-sky-600 px-5 py-3 m-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
          >
            Back to Dashboard
          </Link>
      </div>
    </div>
  )
}

export default Summary