import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Services from './components/Services';
import Booking from './components/Booking';
import Tracker from './components/Tracker';
import Reviews from './components/Reviews';
import Contact from './components/Contact';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import AdminAuth from './components/AdminAuth';
import AdminDashboard from './components/AdminDashboard';

// Wrapper to protect tracking route and preserve code query parameters
function TrackRouteWrapper({ user, API_URL }) {
  const location = useLocation();
  if (!user) {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const redirectUrl = code 
      ? `/auth?redirect=track&code=${encodeURIComponent(code)}` 
      : '/auth?redirect=track';
    return <Navigate to={redirectUrl} replace />;
  }
  return <Tracker user={user} API_URL={API_URL} />;
}

// Dynamic API URL detection: fallback to local port 5000 in development
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:5000' 
  : 'https://poojitha-reddy-electricals-backend.onrender.com'; // Replace this URL with your Render API URL once deployed

function App() {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth states from localStorage on startup
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedAdmin = localStorage.getItem('admin');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedAdmin) {
      setAdmin(JSON.parse(savedAdmin));
    }
    setLoading(false);
  }, []);

  const logoutUser = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const logoutAdmin = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    setAdmin(null);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        height: '100vh', 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: 'hsl(230, 25%, 6%)',
        color: '#fff',
        fontFamily: 'sans-serif'
      }}>
        <h2>Loading system data...</h2>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="app-container">
        <Navbar 
          user={user} 
          admin={admin} 
          logoutUser={logoutUser} 
          logoutAdmin={logoutAdmin} 
        />
        
        <main className="main-content">
          <Routes>
            {/* Customer Facing Landing Page */}
            <Route path="/" element={
              <>
                <Hero user={user} />
                <Services user={user} />
                <Reviews API_URL={API_URL} />
                <Contact API_URL={API_URL} />
              </>
            } />

            {/* Booking Form Route - Protected: Requires Sign In / Sign Up */}
            <Route path="/book" element={
              user ? (
                <Booking user={user} API_URL={API_URL} />
              ) : (
                <Navigate to="/auth?redirect=book" replace />
              )
            } />

            {/* Status Tracker Route - Protected: Requires Sign In / Sign Up */}
            <Route path="/track" element={
              <TrackRouteWrapper user={user} API_URL={API_URL} />
            } />

            {/* Customer Authentication */}
            <Route path="/auth" element={
              <Auth user={user} setUser={setUser} API_URL={API_URL} />
            } />

            {/* Customer Dashboard */}
            <Route path="/dashboard" element={
              user ? <Dashboard user={user} setUser={setUser} API_URL={API_URL} /> : <Navigate to="/auth" />
            } />

            {/* Admin Authentication */}
            <Route path="/admin-login" element={
              admin ? <Navigate to="/admin-dashboard" /> : <AdminAuth setAdmin={setAdmin} API_URL={API_URL} />
            } />

            {/* Admin Dashboard */}
            <Route path="/admin-dashboard" element={
              admin ? <AdminDashboard admin={admin} API_URL={API_URL} /> : <Navigate to="/admin-login" />
            } />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </HashRouter>
  );
}

export default App;
