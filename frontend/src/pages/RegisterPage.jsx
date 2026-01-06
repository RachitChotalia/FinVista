import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaExclamationCircle } from 'react-icons/fa';
import { registerUser } from '../api';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("KEYPHRASES DO NOT MATCH");
            return;
        }

        setIsLoading(true);
        try {
            await registerUser(formData.name, formData.email, formData.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.detail || "Registration Failed");
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
                <div className="bg-[#FF3B00] text-white p-6 border-b border-black">
                    <h2 className="font-serif text-2xl italic">New Entry</h2>
                    <p className="font-mono text-xs mt-1 opacity-90">INITIALIZE_USER_PROTOCOL_V1</p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 bg-red-100 border border-red-500 text-red-700 px-4 py-3 text-xs font-mono flex items-center gap-2">
                            <FaExclamationCircle /> {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleRegister} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest font-mono">Full Designation</label>
                            <input type="text" name="name" onChange={handleChange} required className="w-full bg-[#F5F5F0] border-b-2 border-black p-3 font-mono text-sm focus:bg-black/5 focus:border-[#FF3B00] outline-none" placeholder="JONATHAN DOE" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest font-mono">Digital Address</label>
                            <input type="email" name="email" onChange={handleChange} required className="w-full bg-[#F5F5F0] border-b-2 border-black p-3 font-mono text-sm focus:bg-black/5 focus:border-[#FF3B00] outline-none" placeholder="USER@EXAMPLE.COM" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest font-mono">Set Key</label>
                                <input type="password" name="password" onChange={handleChange} required className="w-full bg-[#F5F5F0] border-b-2 border-black p-3 font-mono text-sm focus:bg-black/5 focus:border-[#FF3B00] outline-none" placeholder="••••••" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest font-mono">Confirm</label>
                                <input type="password" name="confirmPassword" onChange={handleChange} required className="w-full bg-[#F5F5F0] border-b-2 border-black p-3 font-mono text-sm focus:bg-black/5 focus:border-[#FF3B00] outline-none" placeholder="••••••" />
                            </div>
                        </div>

                        <div className="pt-6">
                            <button type="submit" disabled={isLoading} className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest text-xs border border-black hover:bg-white hover:text-black hover:shadow-[4px_4px_0px_#000] transition-all disabled:opacity-50">
                                {isLoading ? "PROCESSING..." : "CREATE RECORD"}
                            </button>
                        </div>
                    </form>
                    
                    <div className="mt-8 pt-8 border-t border-dashed border-gray-400 text-center">
                         <p className="font-mono text-xs text-gray-500 mb-2">EXISTING_ENTITY?</p>
                         <Link to="/login" className="text-xs uppercase font-bold text-black border-b border-black hover:text-[#FF3B00] hover:border-[#FF3B00] transition-colors">
                            Access Existing Ledger
                         </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ... inside RegisterPage.jsx

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("KEYPHRASES DO NOT MATCH");
            return;
        }

        setIsLoading(true);
        try {
            await registerUser(formData.name, formData.email, formData.password);
            navigate('/dashboard');
        } catch (err) {
            console.error("Registration Error:", err); // Log it for debugging
            
            // FIX: Check if the error is an Array (Validation Error) or a String
            if (Array.isArray(err.detail)) {
                // It's a validation error list (e.g. Password too short)
                // Take the first error message from the list
                setError(err.detail[0].msg); 
            } else {
                // It's a simple string error (e.g. "Email already registered")
                setError(err.detail || "Registration Failed");
            }
        } finally {
            setIsLoading(false);
        }
    };
    
export default RegisterPage;