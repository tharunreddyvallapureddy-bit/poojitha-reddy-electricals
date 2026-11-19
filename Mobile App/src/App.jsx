import React, { useState, useEffect, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MobileHeader from './components/MobileHeader';
import MobileBottomNav from './components/MobileBottomNav';
import Hero from './components/Hero';
import Services from './components/Services';
import Reviews from './components/Reviews';
import Contact from './components/Contact';
import { PhoneIcon } from './components/Icons';
import './styles/mobile.css';

// Code-split route components for instant mobile loading
const Booking = lazy(() => import('./components/Booking'));
const Tracker = lazy(() => import('./components/Tracker'));
const Auth = lazy(() => import('./components/Auth'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const AdminAuth = lazy(() => import('./components/AdminAuth'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

// Lightweight mobile fallback loader
const MobileLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', width: '100%' }}>
    <div className="spinner-border text-cyan" style={{ width: '38px', height: '38px' }}></div>
  </div>
);

// Protected Track route wrapper
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

// Unified Backend REST API endpoint
const API_URL = 'https://poojitha-reddy-electricals-backend.onrender.com';

const isTokenValid = (token) => {
  if (!token || typeof token !== 'string') return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
};

function MobileLayout({ user, setUser, admin, setAdmin, logoutUser, logoutAdmin }) {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="mobile-app-root">
      <MobileHeader user={user} admin={admin} />

      <main className="mobile-main-content">
        <Suspense fallback={<MobileLoader />}>
          <Routes>
            {/* Home View */}
            <Route path="/" element={
              <>
                <Hero user={user} />
                <Services user={user} />
                <Reviews API_URL={API_URL} />
                <Contact API_URL={API_URL} />
              </>
            } />

            {/* Dedicated Reviews View for Bottom Nav */}
            <Route path="/reviews-view" element={
              <div style={{ padding: '16px 0 32px' }}>
                <Reviews API_URL={API_URL} />
              </div>
            } />

            {/* Booking Screen */}
            <Route path="/book" element={
              user ? <Booking user={user} API_URL={API_URL} /> : <Navigate to="/auth?redirect=book" replace />
            } />

            {/* Track Screen */}
            <Route path="/track" element={
              <TrackRouteWrapper user={user} API_URL={API_URL} />
            } />

            {/* Customer Auth */}
            <Route path="/auth" element={
              <Auth user={user} setUser={setUser} API_URL={API_URL} />
            } />

            {/* Customer Dashboard */}
            <Route path="/dashboard" element={
              user ? <Dashboard user={user} setUser={setUser} API_URL={API_URL} logoutUser={logoutUser} /> : <Navigate to="/auth" />
            } />

            {/* Admin Login */}
            <Route path="/admin-login" element={
              admin ? <Navigate to="/admin-dashboard" /> : <AdminAuth setAdmin={setAdmin} API_URL={API_URL} />
            } />

            {/* Admin Dashboard */}
            <Route path="/admin-dashboard" element={
              admin ? <AdminDashboard admin={admin} setAdmin={setAdmin} API_URL={API_URL} logoutAdmin={logoutAdmin} /> : <Navigate to="/admin-login" />
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </main>

      {/* Floating Emergency Call FAB: Visible on Home view so it doesn't block forms/buttons */}
      {!isAdminPage && location.pathname === '/' && (
        <a href="tel:8498870697" className="mobile-fab-call" title="Emergency Electrician Call">
          <PhoneIcon size={22} />
        </a>
      )}

      {/* Fixed Native Bottom Navigation */}
      <MobileBottomNav user={user} admin={admin} />
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

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
        backgroundColor: '#0c0e14',
        color: '#fff' 
      }}>
        <h3>Loading app...</h3>
      </div>
    );
  }

  return (
    <HashRouter>
      <MobileLayout 
        user={user} 
        setUser={setUser} 
        admin={admin} 
        setAdmin={setAdmin} 
        logoutUser={logoutUser} 
        logoutAdmin={logoutAdmin} 
      />
    </HashRouter>
  );
}

export default App;
