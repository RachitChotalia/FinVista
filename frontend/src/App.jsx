import React from 'react';
import { Routes, Route } from 'react-router-dom'; // 1. Import Routes and Route

// 2. Import your page component
import LandingPage from './pages/LandingPage';
// You might have other pages too
// import DashboardPage from './pages/DashboardPage'; 

function App() {
  return (
    // 3. Set up your routes inside the Routes component
    <Routes>
      {/* This route says: when the URL is just "/", render the LandingPage component */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Example of another route */}
      {/* <Route path="/dashboard" element={<DashboardPage />} /> */}
    </Routes>
  );
}

export default App;