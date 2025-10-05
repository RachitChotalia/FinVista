import React, { useState, useEffect } from 'react';

// --- Reusable Components ---

// Header Component
function Header() {
  return (
    <header className="flex justify-between items-center p-6">
      <h1 className="text-2xl font-bold text-white">FinVista</h1>
      <nav className="flex items-center space-x-6">
        <a href="/login" className="text-white hover:text-red-400 transition-colors">Login</a>
        <a href="/register" className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-600 transition-colors">Sign Up</a>
      </nav>
    </header>
  );
}

// Mock Graph Component for the right column
function MockGraph() {
  // Simple mock data for the graph path
  const graphPath = "M0,50 Q50,20 100,40 T200,30 T300,60 T400,50";
  return (
    <div className="w-full max-w-lg p-6 bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-white">Projected Growth</h3>
        <span className="text-sm text-gray-400">Next 5 Years</span>
      </div>
      <div className="w-full h-48">
        <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
          <path d={graphPath} stroke="url(#gradient)" strokeWidth="3" fill="none" strokeLinecap="round" />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F87171" />
              <stop offset="100%" stopColor="#B91C1C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="mt-4 flex justify-between text-white">
        <div>
          <p className="text-sm text-gray-400">Current Savings</p>
          <p className="text-xl font-semibold">₹25,00,000</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Projected Value</p>
          <p className="text-xl font-semibold text-green-400">₹1,20,50,000</p>
        </div>
      </div>
    </div>
  );
}

// Parallax Background Component
function ParallaxBackground() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (event) => {
            const { clientX, clientY } = event;
            const x = (clientX / window.innerWidth - 0.5) * 2;
            const y = (clientY / window.innerHeight - 0.5) * 2;
            setMousePosition({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const getTransform = (factor) => ({
        transform: `translate(${mousePosition.x * factor}px, ${mousePosition.y * factor}px)`
    });

    return (
        <div className="absolute inset-0 z-0 overflow-hidden">
            <div
                className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-red-900 via-red-800 to-transparent rounded-full opacity-30 blur-3xl transition-transform duration-500 ease-out"
                style={getTransform(30)}
            ></div>
            <div
                className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-tl from-red-800 via-red-700 to-transparent rounded-full opacity-20 blur-3xl transition-transform duration-500 ease-out"
                style={getTransform(50)}
            ></div>
        </div>
    );
}

// Main Landing Page Component
export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-black font-sans text-white relative isolate overflow-hidden">
      <ParallaxBackground />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow grid lg:grid-cols-2 items-center gap-12 p-6 md:p-12">
          {/* Left Column: Text Content */}
          <div className="text-center lg:text-left">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
              <span className="text-gradient bg-gradient-to-r from-red-400 via-red-500 to-red-600">
                Financial infrastructure
              </span>
              <span className="block mt-2 text-white">to grow your future.</span>
            </h2>
            <p className="mt-6 text-lg text-gray-400 max-w-lg mx-auto lg:mx-0">
              FinVista leverages AI to provide personalized retirement forecasts and actionable investment insights. Take control of your financial future today.
            </p>
            <a href="/register" className="mt-8 inline-block px-8 py-3 font-bold text-white bg-gradient-to-r from-red-600 to-red-800 rounded-md hover:opacity-90 transition-opacity">
              Start Your Journey Today
            </a>
          </div>

          {/* Right Column: Mock Graph */}
          <div className="flex justify-center items-center">
             <MockGraph />
          </div>
        </main>
      </div>
    </div>
  );
}

