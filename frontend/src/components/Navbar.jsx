// src/components/Navbar.jsx
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import logo from "../assets/FBReflectLogo.png"  // <-- import image

export default function Navbar() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <nav className="bg-white text-slate-900 px-6 py-4 flex flex-wrap justify-between items-center gap-4 border-b border-slate-200 shadow-sm">
      <Link to="/" className="font-bold text-xl flex items-center gap-3 text-sky-600">
        <img src={logo} alt="FBReflect Logo" className="h-8 inline-block" />
        FBReflect
      </Link>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        {user ? (
          <>
            <Link to="/home" className="text-slate-700 hover:text-slate-900 hover:underline">
              Home
            </Link>
            <Link to="/dashboard" className="text-slate-700 hover:text-slate-900 hover:underline">
              Dashboard
            </Link>
            <span className="text-slate-500">Welcome, {user.username}</span>
            <button
              onClick={handleLogout}
              className="rounded-full bg-red-600 px-4 py-2 text-sm text-white transition hover:bg-red-700"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/home" className="text-slate-700 hover:text-slate-900 hover:underline">
              Home
            </Link>
            <Link to="/login" className="text-slate-700 hover:text-slate-900 hover:underline">
              Login
            </Link>
            <Link to="/register" className="text-slate-700 hover:text-slate-900 hover:underline">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
