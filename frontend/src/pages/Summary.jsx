import { Link } from "react-router-dom"

const Summary = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
            <h1 className="text-3xl font-bold mb-4 text-white">Feedback Summary</h1>
            <p className="text-gray-700">This page will display aggregated feedback data and insights.</p>
            <Link to="/dashboard" className="mt-4 bg-blue-500 text-white font-medium py-2 px-4 rounded-full shadow-lg hover:bg-blue-600 transition">
                Go back to Dashboard
            </Link>
        </div>
    )
}
export default Summary