import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight, FaChartLine, FaRobot, FaRupeeSign } from 'react-icons/fa'; // Updated Icon Import

const LandingPage = () => {
    // --- 1. State for Real-Time Data ---
    const [marketData, setMarketData] = useState({
        "NIFTY 50": { price: "Loading...", pct: "...", isUp: true },
        "SENSEX": { price: "Loading...", pct: "...", isUp: true },
        "USD/INR": { price: "Loading...", pct: "...", isUp: false }, 
    });

    // --- 2. WebSocket Connection ---
    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8000/ws/market");

        ws.onopen = () => console.log("Landing Page: Connected to Market Stream");
        
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setMarketData(data);
            } catch (e) {
                console.error("Error parsing WS data", e);
            }
        };

        return () => ws.close();
    }, []);

    // --- 3. Helper to Render Ticker Items ---
    const renderTickerItem = (label, key) => {
        const data = marketData[key] || { price: "---", pct: "", isUp: true };
        return (
            <span className="text-sm font-bold uppercase tracking-widest flex items-center gap-3">
                <span>{label}: </span>
                <span className={data.isUp ? "text-green-600" : "text-red-600"}>
                    {data.isUp ? "▲" : "▼"} {data.price}
                </span>
                <span className="text-xs opacity-60">({data.pct.replace('+','')})</span>
                <span className="text-[#FF3B00] mx-4">//</span>
            </span>
        );
    };

    return (
        <div className="min-h-screen w-full bg-grid flex flex-col relative">
            
            {/* Nav */}
            <nav className="w-full border-b border-black bg-[#F5F5F0] sticky top-0 z-50">
                <div className="max-w-[1400px] mx-auto flex justify-between items-center h-16 px-6">
                    <div className="text-2xl font-serif italic font-bold tracking-tight">
                        FinVista<span className="text-[#FF3B00] not-italic">.</span>
                    </div>
                    <div className="flex gap-6 text-sm font-medium">
                        <Link to="/login" className="hover:underline decoration-[#FF3B00] underline-offset-4">LOG_IN</Link>
                        <Link to="/register" className="btn-primary px-6 py-2 text-xs">Initialize</Link>
                    </div>
                </div>
            </nav>

            <main className="flex-1 w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 border-x border-black bg-[#F5F5F0]">
                
                {/* Hero Content */}
                <div className="lg:col-span-8 p-12 lg:p-24 border-b lg:border-b-0 lg:border-r border-black flex flex-col justify-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <p className="text-xs font-bold text-[#FF3B00] mb-4 uppercase tracking-widest">
                            Intelligent Financial Planning for India
                        </p>
                        <h1 className="text-6xl md:text-8xl leading-[0.9] mb-8 text-black">
                            Fixed Deposits <br/>
                            <span className="italic text-[#555]">won't beat</span> <br/>
                            Inflation.
                        </h1>
                        <p className="text-lg md:text-xl font-sans text-gray-600 max-w-lg mb-12 leading-relaxed">
                            Stop relying on generic advice. We use 10,000 simulations tailored to Indian taxation (LTCG, 80C) and market volatility to engineer your freedom.
                        </p>
                        <div className="flex gap-4">
                            <Link to="/register" className="btn-primary px-8 py-4 text-sm flex items-center gap-3">
                                Start SIP Analysis <FaArrowRight />
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Feature Blocks */}
                <div className="lg:col-span-4 flex flex-col border-b border-black">
                    <div className="flex-1 bg-white p-8 border-b border-black flex flex-col justify-between group hover:bg-[#FF3B00] hover:text-white transition-colors duration-300">
                        <FaRupeeSign className="text-4xl mb-4" />
                        <div>
                            <h3 className="font-serif text-3xl mb-2">Tax Optimized</h3>
                            <p className="text-sm opacity-80 font-sans">Algorithms that account for STCG, LTCG, and new tax regime slabs.</p>
                        </div>
                    </div>
                    <div className="flex-1 bg-white p-8 border-b border-black flex flex-col justify-between group hover:bg-[#FF3B00] hover:text-white transition-colors duration-300">
                        <FaChartLine className="text-4xl mb-4" />
                        <div>
                            <h3 className="font-serif text-3xl mb-2">NIFTY Alpha</h3>
                            <p className="text-sm opacity-80 font-sans">Compare your portfolio against NIFTY 50 and Mid-Cap 150 benchmarks.</p>
                        </div>
                    </div>
                    {/* NEW: AI Insights Block */}
                    <div className="flex-1 bg-white p-8 flex flex-col justify-between group hover:bg-[#FF3B00] hover:text-white transition-colors duration-300">
                        <FaRobot className="text-4xl mb-4" />
                        <div>
                            <h3 className="font-serif text-3xl mb-2">Gemini AI Insights</h3>
                            <p className="text-sm opacity-80 font-sans">Personalized strategy and risk assessment powered by Google's Gemini Pro model.</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Indian Market Ticker (Live Data) */}
            <div className="w-full border-y border-black bg-white overflow-hidden py-3">
                 <div className="animate-marquee whitespace-nowrap flex gap-12">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-12">
                            {renderTickerItem("NIFTY 50", "NIFTY 50")}
                            {renderTickerItem("SENSEX", "SENSEX")}
                            {renderTickerItem("USD/INR", "USD/INR")}
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    );
};

export default LandingPage;