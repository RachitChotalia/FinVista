import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    Title, 
    Tooltip, 
    Filler, 
    Legend 
} from 'chart.js';
import { 
    FaUserCircle, 
    FaRobot, 
    FaLayerGroup, 
    FaArrowUp, 
    FaExclamationTriangle
} from 'react-icons/fa';

// Import API functions
import { runSimulation, fetchAIInsights, fetchUserProfile } from '../api';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

const DashboardPage = () => {
    const navigate = useNavigate();

    // --- STATE MANAGEMENT ---
    
    // 1. User Profile State
    const [user, setUser] = useState({ name: 'Loading...', id: '...' });

    // 2. Form Inputs (Updated for Investment Years)
    const [form, setForm] = useState({
        monthlySavings: 50000,
        riskTolerance: 'balanced',
        currentAge: 30,
        investmentYears: 20 // Replaces retirementAge
    });

    // 3. Chart Data (Default / Initial State)
    const [chartData, setChartData] = useState({
        labels: ['2025', '2030', '2035', '2040', '2045', '2050'],
        datasets: [
            {
                label: 'Median Projection',
                data: [12, 45, 95, 180, 320, 550],
                borderColor: '#000000',
                borderWidth: 2,
                pointBackgroundColor: '#FFFFFF',
                pointBorderColor: '#000000',
                pointRadius: 4,
                tension: 0.4,
            }
        ]
    });

    // 4. Real-Time Market Data
    const [marketData, setMarketData] = useState({
        "NIFTY 50": { price: "Loading...", pct: "...", isUp: true },
        "SENSEX": { price: "Loading...", pct: "...", isUp: true },
        "USD/INR": { price: "Loading...", pct: "...", isUp: false } 
    });

    // 5. AI & Simulation State
    const [insights, setInsights] = useState(null);
    const [loadingAI, setLoadingAI] = useState(false);
    const [loadingSim, setLoadingSim] = useState(false); 
    const [successProb, setSuccessProb] = useState(88);

    // --- EFFECTS ---

    // A. Load User Profile on Mount
    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await fetchUserProfile();
                setUser(userData);
            } catch (err) {
                console.error("Failed to load profile", err);
                navigate('/login');
            }
        };
        loadUser();
    }, [navigate]);

    // B. WebSocket Connection for Live Ticker (DYNAMIC)
    useEffect(() => {
        // Get Base URL
        const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
        // Convert http/https to ws/wss and append route
        const WS_URL = API_BASE.replace(/^http/, "ws") + "/ws/market";

        const ws = new WebSocket(WS_URL);

        ws.onopen = () => console.log("Connected to Market Stream");
        
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

    // C. Initial AI Insight Fetch
    useEffect(() => {
        handleAIAnalysis();
    }, []);

    // --- HANDLERS ---

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSimulation = async () => {
        setLoadingSim(true);
        try {
            // 1. Determine Real-Time Trend
            const currentTrend = marketData["NIFTY 50"]?.isUp ? "Bullish" : "Bearish";

            // 2. Prepare Payload (Convert Investment Years to Retirement Age for Backend)
            const calculatedRetirementAge = parseInt(form.currentAge) + parseInt(form.investmentYears);

            const payload = {
                current_age: parseInt(form.currentAge),
                retirement_age: calculatedRetirementAge, // Backend expects this
                current_savings: 1000000, 
                monthly_savings: parseFloat(form.monthlySavings),
                risk_tolerance: form.riskTolerance,
                market_trend: currentTrend
            };

            // 3. Run Simulation
            const result = await runSimulation(payload);

            // 4. Update Success Probability
            setSuccessProb(result.success_probability); 

            // 5. Update Chart
            setChartData({
                labels: result.labels,
                datasets: [
                    {
                        label: 'Optimistic (90%)',
                        data: result.data_optimistic,
                        borderColor: '#BABAB5',
                        borderWidth: 1,
                        borderDash: [5, 5],
                        pointRadius: 0,
                        tension: 0.4,
                    },
                    {
                        label: 'Median Path',
                        data: result.data_median,
                        borderColor: '#000000',
                        borderWidth: 2,
                        pointBackgroundColor: '#FFFFFF',
                        pointBorderColor: '#000000',
                        pointRadius: 4,
                        tension: 0.4,
                    },
                    {
                        label: 'Pessimistic (10%)',
                        data: result.data_pessimistic,
                        borderColor: '#BABAB5',
                        borderWidth: 1,
                        borderDash: [5, 5],
                        pointRadius: 0,
                        tension: 0.4,
                    },
                ]
            });
            
            // 6. Fetch New AI Insights based on these inputs
            handleAIAnalysis(payload);

        } catch (error) {
            console.error(error);
            alert("Simulation failed. Check backend connection.");
        } finally {
            setLoadingSim(false);
        }
    };

    const handleAIAnalysis = async (customPayload = null) => {
        setLoadingAI(true);
        const currentTrend = marketData["NIFTY 50"]?.isUp ? "Bullish" : "Bearish";
        
        // Use custom payload or build one from current form state
        let payload = customPayload;
        
        if (!payload) {
             const calculatedRetirementAge = parseInt(form.currentAge) + parseInt(form.investmentYears);
             payload = {
                current_age: parseInt(form.currentAge),
                retirement_age: calculatedRetirementAge,
                monthly_savings: parseFloat(form.monthlySavings),
                current_savings: 1000000,
                risk_tolerance: form.riskTolerance,
                market_trend: currentTrend
            };
        }
        
        // Fetch from Backend (Gemini)
        const data = await fetchAIInsights(payload);
        
        if (data) {
            setInsights(data); // Store the AI response in state
        }
        setLoadingAI(false);
    };

    // --- CHART CONFIG ---
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { display: true, position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 10, font: { family: 'JetBrains Mono' } } },
            tooltip: {
                backgroundColor: '#000',
                titleFont: { family: 'Playfair Display', size: 14 },
                bodyFont: { family: 'JetBrains Mono', size: 11 },
                padding: 12,
                cornerRadius: 0,
                callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ₹${ctx.parsed.y}L` }
            }
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { family: 'JetBrains Mono' }, color: '#666' } },
            y: { grid: { color: '#E5E5E5', borderDash: [2, 2] }, ticks: { font: { family: 'JetBrains Mono' }, callback: (v) => `₹${v}L` } }
        }
    };

    // --- RENDER HELPERS ---
    const renderTickerItem = (label, data) => (
        <span className="flex items-center gap-1 mr-6">
            <span className="text-gray-500">{label}:</span> 
            <span className={`font-bold ${data.isUp ? "text-green-600" : "text-red-600"}`}>
                {data.price} {data.isUp ? "▲" : "▼"} {data.pct ? data.pct.replace('+','') : ''}
            </span>
        </span>
    );

    return (
        <div className="min-h-screen w-full bg-[#F5F5F0] text-black font-sans flex flex-col">
            
            {/* --- HEADER --- */}
            <header className="border-b border-black bg-white sticky top-0 z-40">
                <div className="max-w-[1600px] mx-auto px-6 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <Link to="/" className="font-serif italic text-2xl font-bold hover:text-[#FF3B00] transition-colors">
                            FinVista<span className="not-italic text-[#FF3B00]">.</span>
                        </Link>
                        
                        {/* LIVE TICKER */}
                        <div className="hidden md:flex text-xs font-mono border-l border-gray-300 pl-6 h-full items-center overflow-hidden">
                            <div className="whitespace-nowrap flex animate-marquee">
                                {renderTickerItem("NIFTY 50", marketData["NIFTY 50"])}
                                {renderTickerItem("SENSEX", marketData["SENSEX"])}
                                {renderTickerItem("USD/INR", marketData["USD/INR"])}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="font-mono text-[10px] uppercase bg-black text-white px-2 py-1 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            LIVE
                        </div>
                        <Link to="/profile" className="flex items-center gap-2 text-xs font-bold uppercase hover:bg-black hover:text-white px-3 py-1 border border-transparent hover:border-black transition-all">
                            <FaUserCircle size={16} />
                            <span>{user.name.split(' ')[0]}</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 max-w-[1600px] mx-auto w-full p-6 md:p-8">
                
                {/* 1. METRICS GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
                    
                    {/* Primary Corpus */}
                    <div className="lg:col-span-3 bg-white border border-black p-6 shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-mono text-xs font-bold uppercase text-gray-500">Projected Corpus</h3>
                            <FaArrowUp className="text-green-600 rotate-45" />
                        </div>
                        <div className="text-4xl md:text-5xl font-serif font-bold mb-2">
                            ₹{(chartData.datasets.find(d => d.label.includes('Median'))?.data.slice(-1)[0])/100} Cr
                        </div>
                        <p className="font-mono text-xs text-gray-600 border-t border-dashed border-gray-300 pt-3">
                            Inflation Adjusted Target: ₹5.0 Cr
                        </p>
                    </div>

                    {/* Secondary Stats */}
                    <div className="lg:col-span-3 grid grid-rows-2 gap-6">
                        <div className="bg-[#F5F5F0] border border-black p-4 flex flex-col justify-center">
                            <p className="font-mono text-xs font-bold uppercase text-gray-500 mb-1">Success Prob.</p>
                            <p className="text-3xl font-serif">{successProb}%</p>
                        </div>
                        <div className="bg-[#F5F5F0] border border-black p-4 flex flex-col justify-center">
                            <p className="font-mono text-xs font-bold uppercase text-gray-500 mb-1">Duration</p>
                            <p className="text-3xl font-serif">{form.investmentYears} Yrs</p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="lg:col-span-6 bg-black text-white p-6 border border-black shadow-[4px_4px_0px_rgba(0,0,0,0.3)]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-serif text-xl italic">Simulation Engine</h3>
                            <FaLayerGroup className="text-[#FF3B00]" />
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block font-mono text-[10px] uppercase text-gray-400 mb-1">Current Age</label>
                                <input 
                                    type="number" 
                                    name="currentAge"
                                    value={form.currentAge} 
                                    onChange={handleInputChange} 
                                    className="w-full bg-[#222] border border-[#444] text-white p-2 font-mono focus:border-[#FF3B00] outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block font-mono text-[10px] uppercase text-gray-400 mb-1">Inv. Duration (Yrs)</label>
                                <input 
                                    type="number" 
                                    name="investmentYears"
                                    value={form.investmentYears} 
                                    onChange={handleInputChange} 
                                    className="w-full bg-[#222] border border-[#444] text-white p-2 font-mono focus:border-[#FF3B00] outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block font-mono text-[10px] uppercase text-gray-400 mb-1">Monthly SIP (₹)</label>
                                <input 
                                    type="number" 
                                    name="monthlySavings"
                                    value={form.monthlySavings} 
                                    onChange={handleInputChange} 
                                    className="w-full bg-[#222] border border-[#444] text-white p-2 font-mono focus:border-[#FF3B00] outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block font-mono text-[10px] uppercase text-gray-400 mb-1">Risk Profile</label>
                                <select 
                                    name="riskTolerance"
                                    value={form.riskTolerance}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#222] border border-[#444] text-white p-2 font-mono focus:border-[#FF3B00] outline-none"
                                >
                                    <option value="aggressive">Aggressive</option>
                                    <option value="balanced">Balanced</option>
                                    <option value="conservative">Conservative</option>
                                </select>
                            </div>
                        </div>
                        <button 
                            onClick={handleSimulation}
                            disabled={loadingSim}
                            className="mt-4 w-full bg-[#FF3B00] text-white font-bold uppercase text-xs py-3 border border-[#FF3B00] hover:bg-white hover:text-[#FF3B00] transition-colors disabled:opacity-50"
                        >
                            {loadingSim ? "Computing Models..." : "Run Simulation & AI Analysis"}
                        </button>
                    </div>
                </div>

                {/* 2. GRAPH & AI INSIGHTS */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Main Graph */}
                    <div className="lg:col-span-8 bg-white border border-black p-6 min-h-[500px] flex flex-col">
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <h3 className="font-serif text-2xl font-bold">Wealth Trajectory</h3>
                                <p className="font-mono text-xs text-gray-500 mt-1">SIMULATION BASELINE: INDIA CPI 6.5% // NIFTY CAGR 12%</p>
                            </div>
                        </div>
                        <div className="flex-1 w-full relative">
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    </div>

                    {/* AI Intelligence Panel */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="bg-[#FF3B00]/10 border border-[#FF3B00] p-4 flex items-center gap-3">
                            <FaRobot className={`text-[#FF3B00] text-xl ${loadingAI ? 'animate-spin' : ''}`} />
                            <div>
                                <h3 className="font-bold font-serif text-[#FF3B00]">Gemini Intelligence</h3>
                                <p className="font-mono text-[10px] text-black">
                                    {loadingAI ? "ANALYZING YOUR INPUTS..." : "STATUS: PERSONALIZED"}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white border border-black flex-1 flex flex-col relative min-h-[300px]">
                             {loadingAI || !insights ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 backdrop-blur-sm z-10">
                                    <div className="font-mono text-xs animate-pulse text-[#FF3B00]">
                                        {loadingAI ? "GENERATING INSIGHTS..." : "RUN MODEL TO ACTIVATE AI"}
                                    </div>
                                </div>
                            ) : (
                               <>
                                    {/* Insight 1: Risk - REPLACED WITH AI CONTENT */}
                                    <div className="p-5 border-b border-gray-200 hover:bg-gray-50 cursor-pointer group">
                                        <div className="flex justify-between mb-2">
                                            <span className="font-mono text-[10px] font-bold uppercase bg-red-100 text-red-700 px-2 py-0.5">Risk Vector</span>
                                            <FaExclamationTriangle className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        {/* Dynamic Title and Desc from Gemini */}
                                        <h4 className="font-serif text-lg font-bold mb-1">{insights.risk_title}</h4>
                                        <p className="font-mono text-xs text-gray-600 leading-relaxed">{insights.risk_desc}</p>
                                    </div>

                                    {/* Insight 2: Strategy - REPLACED WITH AI CONTENT */}
                                    <div className="p-5 border-b border-gray-200 hover:bg-gray-50 cursor-pointer group">
                                        <div className="flex justify-between mb-2">
                                            <span className="font-mono text-[10px] font-bold uppercase bg-blue-100 text-blue-700 px-2 py-0.5">Strategy</span>
                                            <FaArrowUp className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        {/* Dynamic Title and Desc from Gemini */}
                                        <h4 className="font-serif text-lg font-bold mb-1">{insights.strategy_title}</h4>
                                        <p className="font-mono text-xs text-gray-600 leading-relaxed">{insights.strategy_desc}</p>
                                    </div>

                                    {/* Insight 3: Macro - REPLACED WITH AI CONTENT */}
                                    <div className="p-5 hover:bg-gray-50 cursor-pointer group">
                                        <div className="flex justify-between mb-2">
                                            <span className="font-mono text-[10px] font-bold uppercase bg-gray-100 text-gray-700 px-2 py-0.5">Macro Context</span>
                                        </div>
                                        {/* Dynamic Title and Desc from Gemini */}
                                        <h4 className="font-serif text-lg font-bold mb-1">{insights.macro_title}</h4>
                                        <p className="font-mono text-xs text-gray-600 leading-relaxed">{insights.macro_desc}</p>
                                    </div>
                               </>
                            )}
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default DashboardPage;