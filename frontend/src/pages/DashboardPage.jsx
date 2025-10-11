import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Renderer, Camera, Transform, Program, Mesh, Plane } from 'https://cdn.skypack.dev/ogl';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

const PrismCanvas = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const renderer = new Renderer({ canvas, dpr: 2, alpha: true, antialias: true });
        const gl = renderer.gl;
        gl.clearColor(0, 0, 0, 0);

        const camera = new Camera(gl, { fov: 15 });
        camera.position.z = 15;

        const resize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
        };
        window.addEventListener('resize', resize, false);
        resize();

        const scene = new Transform();
        const geometry = new Plane(gl, { width: 20, height: 12 });

        const mouse = { x: 0, y: 0 };
        const handleMouseMove = (e) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', handleMouseMove);

        const vertex = `
            attribute vec2 uv;
            attribute vec3 position;
            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        const fragment = `
            precision highp float;
            uniform float uTime;
            uniform vec2 uMouse;
            varying vec2 vUv;
            void main() {
                vec2 p = vUv - 0.5 + uMouse * 0.1;
                float t = uTime * 0.1;
                vec3 color = vec3(
                    sin(length(p) * 10.0 - t * 2.5),
                    cos(length(p) * 12.0 - t * 2.0),
                    sin(length(p) * 14.0 - t * 3.0)
                );
                color = normalize(abs(color));
                float vignette = 1.0 - length(vUv - 0.5) * 0.8;
                color *= vignette;
                gl_FragColor = vec4(color, 1.0);
            }
        `;

        const program = new Program(gl, {
            vertex,
            fragment,
            uniforms: { uTime: { value: 0 }, uMouse: { value: [0, 0] } },
        });

        const mesh = new Mesh(gl, { geometry, program });
        mesh.setParent(scene);

        let animationFrameId;
        const update = (t) => {
            program.uniforms.uTime.value = t * 0.001;
            program.uniforms.uMouse.value = [mouse.x, mouse.y];
            renderer.render({ scene, camera });
            animationFrameId = requestAnimationFrame(update);
        };
        animationFrameId = requestAnimationFrame(update);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0 opacity-25" />;
};


// --- Dynamic Projection Chart Component ---
const ProjectionChart = ({ chartData }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#ef4444',
                borderWidth: 1,
                padding: 10,
                displayColors: false,
                callbacks: {
                    label: (context) => `Projected Value: ₹${context.parsed.y.toLocaleString('en-IN')} Lakh`,
                },
            },
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#9ca3af' } },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.1)', borderDash: [5, 5] },
                ticks: { color: '#9ca3af', callback: (value) => `₹${value}L` },
            },
        },
        interaction: { intersect: false, mode: 'index' },
        animation: { duration: 1500, easing: 'easeInOutQuart' },
    };

    const data = {
        labels: chartData.labels,
        datasets: [
            {
                fill: true,
                label: 'Projected Value',
                data: chartData.data,
                borderColor: '#ef4444',
                backgroundColor: (context) => {
                    if (!context.chart.ctx) return 'rgba(0,0,0,0)';
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                    gradient.addColorStop(0, 'rgba(239, 68, 68, 0.5)');
                    gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
                    return gradient;
                },
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointBackgroundColor: '#ef4444',
                pointBorderColor: '#fff',
            },
        ],
    };

    return <Line options={options} data={data} />;
};


// --- Main Dashboard Page Component ---
const DashboardPage = () => {
    const [form, setForm] = useState({
        currentAge: '30',
        retirementAge: '60',
        monthlySavings: '50000',
        riskTolerance: 'medium',
    });

    // Mock chart data - this would be updated by your projection logic
    const [chartData, setChartData] = useState({
        labels: ['Age 35', 'Age 40', 'Age 45', 'Age 50', 'Age 55', 'Age 60'],
        data: [25, 60, 110, 180, 270, 400],
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prevForm => ({ ...prevForm, [name]: value }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        // --- API Call to Gemini would happen here ---
        // For now, we'll just generate new mock data to show the chart is dynamic
        console.log("Calculating projection for:", form);

        // Simple mock calculation based on risk
        const riskMultiplier = { low: 0.8, medium: 1.0, high: 1.3 };
        const baseProjection = [25, 60, 110, 180, 270, 400];
        const newProjection = baseProjection.map(p => Math.round(p * riskMultiplier[form.riskTolerance]));
        
        const labels = Array.from({ length: 6 }, (_, i) => `Age ${35 + i * 5}`);

        setChartData({
            labels: labels,
            data: newProjection,
        });
    };

    return (
        <div className="min-h-screen w-full bg-black font-sans text-white overflow-y-auto">
            <PrismCanvas />
            <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-10">
                    <h1 className="text-2xl font-bold tracking-wider">FinVista</h1>
                    <Link to="/profile">
                        <div className="w-10 h-10 rounded-full bg-gray-800 hover:bg-red-700 transition-colors flex items-center justify-center cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>
                    </Link>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Input Form */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="p-6 bg-black/30 rounded-2xl shadow-lg border border-white/10 backdrop-blur-lg">
                            <h2 className="text-xl font-bold mb-4">Your Financial Details</h2>
                            <form onSubmit={handleFormSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="currentAge" className="block text-sm text-gray-400">Current Age</label>
                                    <input type="number" name="currentAge" value={form.currentAge} onChange={handleInputChange} className="mt-1 w-full bg-gray-900/50 p-2 rounded-md border border-gray-700 focus:ring-red-500 focus:border-red-500" />
                                </div>
                                <div>
                                    <label htmlFor="retirementAge" className="block text-sm text-gray-400">Retirement Age</label>
                                    <input type="number" name="retirementAge" value={form.retirementAge} onChange={handleInputChange} className="mt-1 w-full bg-gray-900/50 p-2 rounded-md border border-gray-700 focus:ring-red-500 focus:border-red-500" />
                                </div>
                                <div>
                                    <label htmlFor="monthlySavings" className="block text-sm text-gray-400">Monthly Savings (₹)</label>
                                    <input type="number" name="monthlySavings" step="1000" value={form.monthlySavings} onChange={handleInputChange} className="mt-1 w-full bg-gray-900/50 p-2 rounded-md border border-gray-700 focus:ring-red-500 focus:border-red-500" />
                                </div>
                                <div>
                                    <label htmlFor="riskTolerance" className="block text-sm text-gray-400">Risk Tolerance</label>
                                    <select name="riskTolerance" value={form.riskTolerance} onChange={handleInputChange} className="mt-1 w-full bg-gray-900/50 p-2 rounded-md border border-gray-700 appearance-none focus:ring-red-500 focus:border-red-500">
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full mt-4 px-8 py-3 font-bold text-white bg-gradient-to-r from-red-600 to-red-800 rounded-md hover:opacity-90 transition-opacity">
                                    Calculate Projection
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Graph and AI Insights */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Graph */}
                        <div className="p-6 bg-black/30 rounded-2xl shadow-lg border border-white/10 backdrop-blur-lg">
                            <h2 className="text-xl font-bold">Your Retirement Projection</h2>
                            <p className="text-sm text-gray-400 mb-4">Based on your current plan.</p>
                            <div className="w-full h-80">
                                <ProjectionChart chartData={chartData} />
                            </div>
                        </div>

                        {/* AI Insights */}
                        <div className="p-6 bg-black/30 rounded-2xl shadow-lg border border-white/10 backdrop-blur-lg">
                            <h2 className="text-xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">AI-Powered Insights</h2>
                            <p className="text-gray-300">
                                <strong className="text-white">On Track for Success:</strong> Your current savings plan and medium-risk strategy project a retirement corpus of approximately ₹{chartData.data[chartData.data.length - 1]} Lakhs. This puts you in a strong position to meet your retirement goals comfortably, assuming market conditions remain stable.
                            </p>
                            <p className="mt-2 text-gray-400 text-sm">
                                (This insight will be dynamically generated by the Gemini API.)
                            </p>
                        </div>

                        {/* AI Suggestions */}
                        <div className="p-6 bg-black/30 rounded-2xl shadow-lg border border-white/10 backdrop-blur-lg">
                             <h2 className="text-xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">Actionable Suggestions</h2>
                             <ul className="space-y-3 text-gray-300">
                                <li className="flex items-start">
                                    <span className="text-green-400 mr-3 mt-1">&#10003;</span>
                                    <span><strong className="text-white">Diversify with Index Funds:</strong> To enhance growth with your medium-risk profile, consider allocating 15-20% of your monthly savings into a NIFTY 50 index fund. This offers market-level returns with broad diversification.</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-400 mr-3 mt-1">&#10003;</span>
                                    <span><strong className="text-white">Increase Savings Annually:</strong> Aim to increase your monthly savings by at least 8-10% each year to counteract inflation and accelerate your wealth accumulation significantly.</span>
                                </li>
                             </ul>
                             <p className="mt-3 text-gray-400 text-sm">
                                (These suggestions will be dynamically generated by the Gemini API.)
                             </p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;

