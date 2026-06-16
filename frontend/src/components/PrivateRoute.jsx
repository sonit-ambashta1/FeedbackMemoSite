// src/components/PrivateRoute.jsx (used to protect endpoints that require authentication)
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const PrivateRoute = ({ children }) => {
  const { user, initializing } = useAuth()

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="mx-auto max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" />
          <h2 className="text-2xl font-semibold text-slate-900">Checking authentication</h2>
          <p className="mt-3 text-sm text-slate-600">
            Please wait while we verify your session and load the protected content.
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default PrivateRoute
