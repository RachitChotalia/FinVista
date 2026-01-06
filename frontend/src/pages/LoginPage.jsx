import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaExclamationCircle } from 'react-icons/fa';
import { loginUser } from '../api'; // Import the helper

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await loginUser(email, password);
            navigate('/dashboard'); 
        } catch (err) {
            setError(err.detail || "Authentication Failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#F5F5F0] bg-grid flex items-center justify-center p-6 relative">
            <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 font-mono text-xs font-bold uppercase hover:text-[#FF3B00] transition-colors">
                <FaArrowLeft /> Back to Index
            </Link>

            <div className="w-full max-w-md bg-white border border-black shadow-[8px_8px_0px_#000]">
                <div className="bg-black text-white p-6 flex justify-between items-center border-b border-white/20">
                    <h2 className="font-serif text-2xl italic">Access Terminal</h2>
                    <div className="w-3 h-3 bg-[#FF3B00] rounded-none animate-pulse"></div>
                </div>

                <div className="p-8">
                    {/* Error Display */}
                    {error && (
                        <div className="mb-6 bg-red-100 border border-red-500 text-red-700 px-4 py-3 text-xs font-mono flex items-center gap-2">
                            <FaExclamationCircle /> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest font-mono">Identifier</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-[#F5F5F0] border-b-2 border-black p-3 font-mono text-sm focus:bg-[#FF3B00]/10 focus:border-[#FF3B00] outline-none transition-colors rounded-none"
                                placeholder="USER@FINVISTA.CO"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest font-mono">Keyphrase</label>
                            <input 
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                                className="w-full bg-[#F5F5F0] border-b-2 border-black p-3 font-mono text-sm focus:bg-[#FF3B00]/10 focus:border-[#FF3B00] outline-none transition-colors rounded-none"
                                placeholder="••••••••••"
                            />
                        </div>

                        <div className="pt-4">
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full btn-primary py-4 font-bold uppercase tracking-widest text-xs hover:shadow-[4px_4px_0px_#000] transition-all border border-black disabled:opacity-50"
                            >
                                {isLoading ? "AUTHENTICATING..." : "AUTHENTICATE SESSION"}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 pt-8 border-t border-dashed border-gray-400 text-center">
                         <p className="font-mono text-xs text-gray-500 mb-2">NO_RECORD_FOUND?</p>
                         <Link to="/register" className="text-xs uppercase font-bold text-black border-b border-black hover:text-[#FF3B00] hover:border-[#FF3B00] transition-colors">
                            Initialize New Ledger
                         </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ... inside LoginPage.jsx

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await loginUser(email, password);
            navigate('/dashboard'); 
        } catch (err) {
            console.error("Login Error:", err);

            // FIX: Handle both Array (Validation) and String (Auth) errors
            if (Array.isArray(err.detail)) {
                setError(err.detail[0].msg);
            } else {
                setError(err.detail || "Authentication Failed");
            }
        } finally {
            setIsLoading(false);
        }
    };

export default LoginPage;