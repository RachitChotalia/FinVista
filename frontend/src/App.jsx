import React from 'react';
// Import BrowserRouter and other necessary components from react-router-dom
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';

// --- Page Components ---
// To resolve the import errors, the page components are now defined directly in this file.
// In your actual project, you would place these in separate files and ensure the import paths are correct.

const LandingPage = () => (
    <div className="min-h-screen w-full bg-black text-white flex flex-col items-center justify-center font-sans p-4">
        <h1 className="text-5xl font-bold tracking-wider">FinVista</h1>
        <p className="mt-4 text-lg text-gray-400">Your financial future, visualized.</p>
        <div className="mt-10 space-x-4">
            <Link to="/login" className="px-8 py-3 font-bold text-white bg-gradient-to-r from-red-600 to-red-800 rounded-md hover:opacity-90 transition-opacity">
                Login
            </Link>
            <Link to="/register" className="px-8 py-3 font-bold text-white bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-700 transition-colors">
                Register
            </Link>
        </div>
    </div>
);

const RegisterPage = () => {
    const navigate = useNavigate();
    const handleRegister = (e) => {
        e.preventDefault();
        // Redirect to dashboard after registration
        navigate('/dashboard');
    };
    return (
        <div className="min-h-screen w-full bg-black text-white flex items-center justify-center font-sans p-4">
            <div className="relative z-10 w-full max-w-md p-8 bg-black/30 rounded-2xl shadow-lg border border-white/10 backdrop-blur-lg">
                <h1 className="text-3xl text-center font-bold tracking-wider">Create Account</h1>
                <form onSubmit={handleRegister} className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm text-gray-400">Email Address</label>
                        <input type="email" placeholder="you@example.com" required className="mt-1 w-full bg-gray-900/50 p-3 rounded-md border border-gray-700 focus:ring-red-500 focus:border-red-500 transition"/>
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm text-gray-400">Password</label>
                        <input type="password" placeholder="••••••••" required className="mt-1 w-full bg-gray-900/50 p-3 rounded-md border border-gray-700 focus:ring-red-500 focus:border-red-500 transition"/>
                    </div>
                    <button type="submit" className="w-full mt-2 px-8 py-3 font-bold text-white bg-gradient-to-r from-red-600 to-red-800 rounded-md hover:opacity-90 transition-opacity">Register</button>
                </form>
                 <p className="text-center text-gray-400 text-sm mt-6">
                    Already have an account? <Link to="/login" className="text-red-500 hover:underline">Log in</Link>
                </p>
            </div>
        </div>
    );
};

const LoginPage = () => {
    const navigate = useNavigate();
    const handleLogin = (e) => {
        e.preventDefault();
        // Redirect to dashboard after login
        navigate('/dashboard');
    };
    return (
        <div className="min-h-screen w-full bg-black text-white flex items-center justify-center font-sans p-4">
             <div className="relative z-10 w-full max-w-md p-8 bg-black/30 rounded-2xl shadow-lg border border-white/10 backdrop-blur-lg">
                <h1 className="text-3xl text-center font-bold tracking-wider">Welcome Back</h1>
                <form onSubmit={handleLogin} className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm text-gray-400">Email Address</label>
                        <input type="email" placeholder="you@example.com" required className="mt-1 w-full bg-gray-900/50 p-3 rounded-md border border-gray-700 focus:ring-red-500 focus:border-red-500 transition"/>
                    </div>
                     <div>
                        <label htmlFor="password" className="block text-sm text-gray-400">Password</label>
                        <input type="password" placeholder="••••••••" required className="mt-1 w-full bg-gray-900/50 p-3 rounded-md border border-gray-700 focus:ring-red-500 focus:border-red-500 transition"/>
                    </div>
                    <button type="submit" className="w-full mt-2 px-8 py-3 font-bold text-white bg-gradient-to-r from-red-600 to-red-800 rounded-md hover:opacity-90 transition-opacity">Login</button>
                </form>
                 <p className="text-center text-gray-400 text-sm mt-6">
                    Don't have an account? <Link to="/register" className="text-red-500 hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

const DashboardPage = () => (
    <div className="min-h-screen w-full bg-black text-white font-sans p-8">
        <header className="flex justify-between items-center mb-8">
             <h1 className="text-2xl font-bold tracking-wider">FinVista</h1>
             <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-700 rounded-full cursor-pointer"></div>
                <Link to="/login" className="px-4 py-2 text-sm text-white bg-gray-800 rounded-md hover:bg-gray-700 transition">Logout</Link>
             </div>
        </header>
        <main>
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="text-gray-400 mt-2">Your personalized financial insights and projections.</p>
            {/* Placeholder for dashboard content */}
            <div className="mt-8 p-8 bg-gray-900/50 border border-gray-800 rounded-lg">
                <p>Financial graphs and AI suggestions will be displayed here.</p>
            </div>
        </main>
    </div>
);

function App() {
  return (
    // The Router component provides the routing context for the entire application.
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage/>} />
      </Routes>
    </Router>
  );
}

export default App;

