import React, { useState, useEffect, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Services from './components/Services';
import Reviews from './components/Reviews';
import Contact from './components/Contact';

// Code-split route components for lightning-fast sub-second initial load
const Booking = lazy(() => import('./components/Booking'));
const Tracker = lazy(() => import('./components/Tracker'));
const Auth = lazy(() => import('./components/Auth'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const AdminAuth = lazy(() => import('./components/AdminAuth'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

// Ultra-lightweight route fallback spinner (zero cumulative layout shift)
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', width: '100%' }}>
    <div className="spinner-border text-cyan" style={{ width: '42px', height: '42px' }}></div>
  </div>
);

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

// Helper to verify if JWT token is well-formed and unexpired
const isTokenValid = (token) => {
  if (!token || typeof token !== 'string') return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      return false; // Token expired
    }
    return true;
  } catch (e) {
    return false;
  }
};

function App() {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth states from localStorage on startup with token validation
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedUserToken = localStorage.getItem('userToken');
    const savedAdmin = localStorage.getItem('admin');
    const savedAdminToken = localStorage.getItem('adminToken');
    
    if (savedUser && savedUserToken && isTokenValid(savedUserToken)) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('userToken');
      }
    } else if (savedUser && (!savedUserToken || !isTokenValid(savedUserToken))) {
      // User token expired or missing
      localStorage.removeItem('user');
      localStorage.removeItem('userToken');
    }

    if (savedAdmin && savedAdminToken && isTokenValid(savedAdminToken)) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch (e) {
        localStorage.removeItem('admin');
        localStorage.removeItem('adminToken');
      }
    } else if (savedAdmin && (!savedAdminToken || !isTokenValid(savedAdminToken))) {
      // Stale or expired admin session - clean up gracefully so user can log in
      localStorage.removeItem('admin');
      localStorage.removeItem('adminToken');
      setAdmin(null);
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
          <Suspense fallback={<PageLoader />}>
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
                user ? <Dashboard user={user} setUser={setUser} API_URL={API_URL} logoutUser={logoutUser} /> : <Navigate to="/auth" />
              } />

              {/* Admin Authentication */}
              <Route path="/admin-login" element={
                admin ? <Navigate to="/admin-dashboard" /> : <AdminAuth setAdmin={setAdmin} API_URL={API_URL} />
              } />

              {/* Admin Dashboard */}
              <Route path="/admin-dashboard" element={
                admin ? <AdminDashboard admin={admin} setAdmin={setAdmin} API_URL={API_URL} logoutAdmin={logoutAdmin} /> : <Navigate to="/admin-login" />
              } />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </main>

        <Footer />
      </div>
    </HashRouter>
  );
}

export default App;
