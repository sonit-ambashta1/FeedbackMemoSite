// src/components/PrivateRoute.jsx (used to protect endpoints that require authentication)
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const PrivateRoute = ({ children }) => {
  const { user, initializing } = useAuth()

  if (initializing) {
    return <div>Loading...</div>
  }

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // User is logged in, render the protected component
  return children
}

export default PrivateRoute
