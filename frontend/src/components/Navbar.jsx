import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BrandLogo, UserIcon, LogOutIcon, LockIcon } from './Icons';

const Navbar = ({ user, admin, logoutUser, logoutAdmin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation to complete before scrolling
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => handleNavClick('hero')}>
          <BrandLogo size={36} />
          <div className="logo-text">
            <span className="brand-name">POOJITHA REDDY</span>
            <span className="brand-sub">ELECTRICALS</span>
          </div>
        </Link>

        {/* Mobile Toggle */}
        <button 
          className={`menu-toggle ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Links */}
        <div className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <button onClick={() => handleNavClick('services')} className="nav-link-btn">
            Services
          </button>
          <Link to={user ? "/book" : "/auth?redirect=book"} className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            Book Service
          </Link>
          <Link to="/track" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            Track Booking
          </Link>
          <button onClick={() => handleNavClick('reviews')} className="nav-link-btn">
            Reviews
          </button>
          <button onClick={() => handleNavClick('contact')} className="nav-link-btn">
            Contact
          </button>

          <span className="nav-divider"></span>

          {admin ? (
            <>
              <Link to="/admin-dashboard" className="nav-link admin-active-link" onClick={() => setMobileMenuOpen(false)}>
                Admin Panel
              </Link>
              <button onClick={handleAdminLogout} className="btn btn-secondary btn-sm-logout">
                <LogOutIcon size={16} /> Admin Out
              </button>
            </>
          ) : user ? (
            <>
              <Link to="/dashboard" className="nav-link user-active-link" onClick={() => setMobileMenuOpen(false)}>
                <UserIcon size={16} /> My Account
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm-logout">
                <LogOutIcon size={16} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="btn btn-primary nav-auth-btn" onClick={() => setMobileMenuOpen(false)}>
                Sign In / Up
              </Link>
              <Link to="/admin-login" className="admin-lock-link" title="Admin Portal" onClick={() => setMobileMenuOpen(false)}>
                <LockIcon size={18} />
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
