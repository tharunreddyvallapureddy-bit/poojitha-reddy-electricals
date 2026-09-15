import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  BrandLogo, UserIcon, LogOutIcon, LockIcon, ChevronDownIcon, 
  ClipboardIcon, KeyIcon, BellIcon, MapPinIcon 
} from './Icons';
import { DEFAULT_AVATAR_SRC } from '../assets/defaultAvatarBase64';

const Navbar = ({ user, admin, logoutUser, logoutAdmin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
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
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    logoutUser();
    navigate('/');
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    navigate('/');
  };

  const isAdminSection = location.pathname.startsWith('/admin');

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => !isAdminSection && handleNavClick('hero')}>
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
          {isAdminSection ? (
            <>
              <Link to="/admin-dashboard" className="nav-link admin-active-link" onClick={() => setMobileMenuOpen(false)}>
                Admin Panel
              </Link>
              {admin && (
                <button onClick={handleAdminLogout} className="btn btn-secondary btn-sm-logout">
                  <LogOutIcon size={16} /> Admin Out
                </button>
              )}
            </>
          ) : (
            <>
              <button onClick={() => handleNavClick('services')} className="nav-link-btn">
                Services
              </button>
              <Link to={user ? "/book" : "/auth?redirect=book"} className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                Book Service
              </Link>
              <Link to={user ? "/track" : "/auth?redirect=track"} className="nav-link" onClick={() => setMobileMenuOpen(false)}>
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
                <div className="nav-profile-wrapper" ref={profileDropdownRef}>
                  <button
                    type="button"
                    className={`nav-profile-btn ${profileMenuOpen ? 'active' : ''}`}
                    onClick={() => setProfileMenuOpen((prev) => !prev)}
                    title="Open User Profile"
                    aria-label="User Profile"
                  >
                    <div className="nav-avatar-ring">
                      <img
                        src={user?.avatar || DEFAULT_AVATAR_SRC}
                        alt={user?.name || 'Customer Avatar'}
                        className="nav-avatar-img"
                      />
                    </div>
                    <span className="nav-user-firstname">
                      {user?.name ? user.name.split(' ')[0] : 'Profile'}
                    </span>
                    <ChevronDownIcon size={14} className={`nav-profile-chevron ${profileMenuOpen ? 'rotate' : ''}`} />
                  </button>

                  {profileMenuOpen && (
                    <div className="nav-profile-dropdown animate-fade-in">
                      {/* User Header Summary */}
                      <div className="dropdown-user-header">
                        <div className="dropdown-avatar-ring">
                          <img
                            src={user?.avatar || DEFAULT_AVATAR_SRC}
                            alt={user?.name || 'Customer Avatar'}
                            className="dropdown-avatar-img"
                          />
                        </div>
                        <div className="dropdown-user-meta">
                          <div className="dropdown-user-name" title={user?.name}>
                            {user?.name}
                          </div>
                          {user?.email && (
                            <div className="dropdown-user-email" title={user?.email}>
                              {user?.email}
                            </div>
                          )}
                          <div className="dropdown-user-sub-row">
                            {user?.phone && (
                              <span className="dropdown-user-phone">
                                📞 {user?.phone}
                              </span>
                            )}
                            <span className="dropdown-user-badge">⚡ Verified Account</span>
                          </div>
                        </div>
                      </div>

                      <div className="dropdown-divider"></div>

                      {/* Dropdown Menu Items */}
                      <div className="dropdown-links-list">
                        <Link
                          to="/dashboard?tab=profile"
                          className="dropdown-item"
                          onClick={() => { setProfileMenuOpen(false); setMobileMenuOpen(false); }}
                        >
                          <UserIcon size={16} className="dropdown-item-icon text-cyan" />
                          <span>My Profile & Details</span>
                        </Link>

                        <Link
                          to="/dashboard?tab=bookings"
                          className="dropdown-item"
                          onClick={() => { setProfileMenuOpen(false); setMobileMenuOpen(false); }}
                        >
                          <ClipboardIcon size={16} className="dropdown-item-icon text-purple" />
                          <span>My Service Bookings</span>
                        </Link>

                        <Link
                          to="/dashboard?tab=address"
                          className="dropdown-item"
                          onClick={() => { setProfileMenuOpen(false); setMobileMenuOpen(false); }}
                        >
                          <MapPinIcon size={16} className="dropdown-item-icon text-cyan" />
                          <span>Saved Service Address</span>
                        </Link>

                        <Link
                          to="/dashboard?tab=security"
                          className="dropdown-item"
                          onClick={() => { setProfileMenuOpen(false); setMobileMenuOpen(false); }}
                        >
                          <KeyIcon size={16} className="dropdown-item-icon text-warning" />
                          <span>Password & Security</span>
                        </Link>

                        <Link
                          to="/dashboard?tab=notifications"
                          className="dropdown-item"
                          onClick={() => { setProfileMenuOpen(false); setMobileMenuOpen(false); }}
                        >
                          <BellIcon size={16} className="dropdown-item-icon text-cyan" />
                          <span>Notification Settings</span>
                        </Link>
                      </div>

                      <div className="dropdown-divider"></div>

                      {/* Sign Out Option Inside Profile */}
                      <div className="dropdown-signout-wrapper">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="dropdown-signout-btn"
                        >
                          <LogOutIcon size={16} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
