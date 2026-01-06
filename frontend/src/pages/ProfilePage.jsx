import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchUserProfile } from '../api'; // Import our new function

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ name: 'Loading...', email: '...' });
    const [loading, setLoading] = useState(true);

    // 1. Fetch Real Data on Mount
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await fetchUserProfile();
                setUser(data);
            } catch (err) {
                // If token is invalid, redirect to login
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [navigate]);

    // 2. Logout Function
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="min-h-screen w-full bg-black font-sans text-white p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <Link to="/dashboard" className="text-gray-400 hover:text-white mb-8 inline-block">
                    &larr; Back to Dashboard
                </Link>

                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
                    <div className="flex items-center gap-6 mb-8 border-b border-white/10 pb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-900 rounded-full flex items-center justify-center text-2xl font-bold">
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">{loading ? "Loading..." : user.name}</h1>
                            <p className="text-gray-400">FinVista Member</p>
                        </div>
                    </div>

                    <div className="space-y-6 max-w-lg">
                        <div>
                            <label className="block text-sm text-gray-500 mb-2">FULL NAME</label>
                            <input 
                                type="text" 
                                value={user.name} 
                                readOnly 
                                className="w-full bg-black/50 border border-white/10 p-3 rounded text-gray-300"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 mb-2">EMAIL ADDRESS</label>
                            <input 
                                type="text" 
                                value={user.email} 
                                readOnly 
                                className="w-full bg-black/50 border border-white/10 p-3 rounded text-gray-300 cursor-not-allowed"
                            />
                        </div>

                        <div className="pt-6 flex gap-4">
                            <button 
                                onClick={handleLogout}
                                className="px-6 py-3 bg-red-900/20 text-red-500 border border-red-500/20 rounded hover:bg-red-900/40 transition-colors font-bold"
                            >
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;