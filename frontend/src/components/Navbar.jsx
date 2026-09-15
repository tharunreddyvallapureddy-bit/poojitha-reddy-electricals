import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  BrandLogo, UserIcon, LogOutIcon, LockIcon, ChevronDownIcon, 
  ClipboardIcon, KeyIcon, BellIcon, MapPinIcon, ShieldCheckIcon 
} from './Icons';
import { DEFAULT_AVATAR_SRC } from '../assets/defaultAvatarBase64';

const Navbar = ({ user, admin, logoutUser, logoutAdmin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const adminDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close profile dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(e.target)) {
        setAdminMenuOpen(false);
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
    setAdminMenuOpen(false);
    setMobileMenuOpen(false);
    logoutAdmin();
    navigate('/');
  };

  const renderAdminProfile = () => (
    <div className="nav-profile-wrapper" ref={adminDropdownRef}>
      <button
        type="button"
        className={`nav-profile-btn nav-admin-profile-btn ${adminMenuOpen ? 'active' : ''}`}
        onClick={() => setAdminMenuOpen((prev) => !prev)}
        title="Open Admin Profile"
        aria-label="Admin Profile"
      >
        <div className="nav-avatar-ring admin-ring">
          <img
            src={DEFAULT_AVATAR_SRC}
            alt="Admin Avatar"
            className="nav-avatar-img"
            onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR_SRC; }}
          />
        </div>
        <span className="nav-user-firstname admin-badge-text">
          {admin?.username ? admin.username.toUpperCase() : 'ADMIN'}
        </span>
        <ChevronDownIcon size={14} className={`nav-profile-chevron ${adminMenuOpen ? 'rotate' : ''}`} />
      </button>

      {adminMenuOpen && (
        <div className="nav-profile-dropdown animate-fade-in">
          {/* Admin Header Summary */}
          <div className="dropdown-user-header">
            <div className="dropdown-avatar-ring admin-avatar-ring">
              <img
                src={DEFAULT_AVATAR_SRC}
                alt="Admin Avatar"
                className="dropdown-avatar-img"
                onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR_SRC; }}
              />
            </div>
            <div className="dropdown-user-meta">
              <div className="dropdown-user-name" title={admin?.username || 'Administrator'}>
                {admin?.username ? admin.username.toUpperCase() : 'ADMINISTRATOR'}
              </div>
              <div className="dropdown-user-email">
                poojithareddyelectricals@gmail.com
              </div>
              <div className="dropdown-user-sub-row">
                <span className="dropdown-user-badge admin-badge">
                  🛡️ Master Admin
                </span>
              </div>
            </div>
          </div>

          <div className="dropdown-divider"></div>

          {/* Admin Dropdown Menu Items */}
          <div className="dropdown-links-list">
            <Link
              to="/admin-dashboard"
              className="dropdown-item"
              onClick={() => { setAdminMenuOpen(false); setMobileMenuOpen(false); }}
            >
              <ClipboardIcon size={16} className="dropdown-item-icon text-purple" />
              <span>Admin Control Panel</span>
            </Link>
            <Link
              to="/"
              className="dropdown-item"
              onClick={() => { setAdminMenuOpen(false); setMobileMenuOpen(false); }}
            >
              <UserIcon size={16} className="dropdown-item-icon text-cyan" />
              <span>Customer Website</span>
            </Link>
          </div>

          <div className="dropdown-divider"></div>

          {/* Sign Out Option Inside Admin Profile */}
          <div className="dropdown-signout-wrapper">
            <button
              type="button"
              onClick={handleAdminLogout}
              className="dropdown-signout-btn"
            >
              <LogOutIcon size={16} />
              <span>Admin Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

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
              <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                Customer Website
              </Link>
              <span className="nav-divider"></span>
              {admin && renderAdminProfile()}
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
                renderAdminProfile()
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
