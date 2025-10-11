import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Renderer, Camera, Transform, Program, Mesh, Plane } from 'ogl';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);


// --- Prism Background Component ---
const PrismCanvas = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
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

            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
            }

            void main() {
                vec2 p = vUv - 0.5;
                p += uMouse * 0.1;

                float t = uTime * 0.1;
                float r_disp = sin(t * 0.7 + random(p) * 2.0) * 0.1;
                float g_disp = cos(t * 0.5 + random(p + 0.1) * 2.0) * 0.15;
                float b_disp = sin(t * 0.6 + random(p + 0.2) * 2.0) * 0.2;

                vec3 color = vec3(
                    sin(length(p + r_disp) * 10.0 - t * 2.5),
                    cos(length(p + g_disp) * 12.0 - t * 2.0),
                    sin(length(p + b_disp) * 14.0 - t * 3.0)
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

    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0 opacity-25" />;
};


// --- Chart Component ---
const GrowthChart = () => {
    const chartRef = useRef(null);

    const labels = Array.from({ length: 7 }, (_, i) => `Age ${30 + i * 5}`);
    const data = {
        labels,
        datasets: [
            {
                fill: true,
                label: 'Projected Value',
                data: [12.5, 35, 70, 120, 190, 280, 345.8], // Lakhs
                borderColor: '#ef4444',
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                    gradient.addColorStop(0, 'rgba(239, 68, 68, 0.5)');
                    gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
                    return gradient;
                },
                tension: 0.4,
                pointBackgroundColor: '#ef4444',
                pointBorderColor: '#fff',
                pointRadius: 0,
                pointHoverRadius: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#ef4444',
                borderWidth: 1,
                padding: 10,
                caretPadding: 10,
                displayColors: false,
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += `₹${context.parsed.y.toLocaleString('en-IN')} Lakh`;
                        }
                        return label;
                    }
                }
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#9ca3af',
                },
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                    borderDash: [5, 5],
                },
                ticks: {
                    color: '#9ca3af',
                    callback: function (value) {
                        return `₹${value}L`;
                    },
                },
            },
        },
        interaction: {
            intersect: false,
            mode: 'index',
        },
        animation: {
            duration: 1500,
            easing: 'easeInOutQuart',
        },
    };

    return <Line ref={chartRef} options={options} data={data} />;
};


const LandingPage = () => {
    return (
        <div className="min-h-screen w-full bg-black font-sans text-white overflow-hidden isolate">
            <PrismCanvas />
            <div className="relative z-10 p-4 sm:p-6 lg:p-8">
                <header className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">FinVista</h1>
                    <nav className="flex items-center space-x-6">
                        <Link to="/login" className="hover:text-red-400 transition-colors">Login</Link>
                        <Link to="/register" className="px-4 py-2 bg-red-700 rounded-md hover:bg-red-600 transition-colors">Sign Up</Link>
                    </nav>
                </header>

                <main className="mt-20 sm:mt-24">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Column: Text Content */}
                        <div className="text-center lg:text-left">
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
                                <span className="bg-clip-text text-white ">
                                    Intelligent Retirement Planning,
                                </span>
                                <span className="block mt-2 from-red-400 via-red-500 to-red-600 bg-gradient-to-r bg-clip-text text-transparent">Powered by AI.</span>
                            </h2>
                            <p className="mt-6 text-lg text-gray-400 max-w-lg mx-auto lg:mx-0">
                                FinVista leverages AI to provide personalized retirement forecasts and actionable investment insights. Take control of your financial future today.
                            </p>
                            <Link to="/register" className="mt-8 inline-block px-8 py-3 font-bold text-white bg-gradient-to-r from-red-600 to-red-800 rounded-md hover:opacity-90 transition-opacity">
                                Start Your Financial Journey Today
                            </Link>
                        </div>

                        {/* Right Column: Interactive Graph */}
                        <div className="w-full max-w-md mx-auto p-6 bg-black/30 rounded-2xl shadow-lg border border-white/10 backdrop-blur-lg">
                            <h3 className="text-xl font-bold text-white">Your Growth Projection</h3>
                            <p className="text-sm text-gray-400 mb-4">Hover to see your journey</p>
                            <div className="w-full h-56">
                               <GrowthChart />
                            </div>
                             <div className="mt-4 flex justify-between text-sm">
                                <div>
                                    <p className="text-gray-400">Current Savings</p>
                                    <p className="text-white font-bold text-lg">₹12,50,000</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-400">Projected Value (at 60)</p>
                                    <p className="text-green-400 font-bold text-lg">₹3,45,80,000</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default LandingPage;

