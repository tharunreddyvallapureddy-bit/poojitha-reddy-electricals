import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BrandLogo, PhoneIcon, BellIcon, ShieldCheckIcon } from './Icons';
import { DEFAULT_AVATAR_SRC } from '../assets/defaultAvatarBase64';

const MobileHeader = ({ user, admin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  const [notifOpen, setNotifOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const notifRef = useRef(null);

  // Close notifications on route change
  useEffect(() => {
    setNotifOpen(false);
  }, [location.pathname]);

  // Click outside listener for notification popup
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [notifOpen]);

  const toggleNotif = () => {
    setNotifOpen((prev) => !prev);
    setHasUnread(false);
  };

  return (
    <header className="mobile-app-header">
      <Link to={isAdminPage ? "/admin-dashboard" : "/"} className="mobile-header-brand">
        <BrandLogo size={32} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: '800', letterSpacing: '0.04em', lineHeight: '1.1' }}>
            POOJITHA REDDY
          </span>
          <span style={{ fontSize: '0.65rem', fontWeight: '700', color: isAdminPage ? 'var(--accent-purple)' : 'var(--accent-cyan)', letterSpacing: '0.12em' }}>
            {isAdminPage ? 'ADMIN PANEL' : 'ELECTRICALS'}
          </span>
        </div>
      </Link>

      <div className="mobile-header-actions">
        {isAdminPage ? (
          /* Admin View: Clean Circled Admin Profile link to Admin Profile & Security */
          admin && (
            <Link
              to="/admin-dashboard?tab=profile"
              className={`mobile-admin-avatar-link ${location.search.includes('tab=profile') ? 'active' : ''}`}
              title="Admin Profile & Security"
            >
              <div
                className="nav-avatar-ring admin-ring"
                style={{
                  width: '36px',
                  height: '36px',
                  boxShadow: location.search.includes('tab=profile')
                    ? '0 0 14px var(--accent-purple)'
                    : '0 2px 8px rgba(168, 85, 247, 0.35)'
                }}
              >
                <img
                  src={admin.avatar || DEFAULT_AVATAR_SRC}
                  alt="Admin Profile"
                  className="nav-avatar-img"
                  onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR_SRC; }}
                />
              </div>
            </Link>
          )
        ) : (
          /* Customer View: Call Button + Notification Symbol (Admin bar & profile circle removed) */
          <>
            <a href="tel:8498870697" className="mobile-call-pill" title="Call Handyman Directly">
              <PhoneIcon size={14} />
              <span>Call</span>
            </a>

            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                type="button"
                onClick={toggleNotif}
                className={`mobile-notif-btn ${notifOpen ? 'active' : ''}`}
                title="Notifications from Admin"
                aria-label="Admin Notifications"
              >
                <BellIcon size={18} />
                {hasUnread && <span className="mobile-notif-badge-dot" />}
              </button>

              {notifOpen && (
                <div className="mobile-notif-dropdown animate-fade-in">
                  <div className="mobile-notif-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="text-cyan"><BellIcon size={16} /></span>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800' }}>Admin Notifications</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifOpen(false)}
                      className="mobile-notif-close-btn"
                      aria-label="Close notifications"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mobile-notif-list">
                    <div className="mobile-notif-item">
                      <div className="mobile-notif-icon-wrap" style={{ background: 'rgba(0, 225, 255, 0.12)', color: 'var(--accent-cyan)' }}>
                        ⚡
                      </div>
                      <div className="mobile-notif-body">
                        <span className="mobile-notif-title">Live Service Tracking</span>
                        <p className="mobile-notif-text">
                          Admin actively updates your service status. Track your technician arrival and booking progress in real-time.
                        </p>
                        <span className="mobile-notif-time">Active Updates</span>
                      </div>
                    </div>

                    <div className="mobile-notif-item">
                      <div className="mobile-notif-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
                        👨‍🔧
                      </div>
                      <div className="mobile-notif-body">
                        <span className="mobile-notif-title">Doorstep Electrician On Call</span>
                        <p className="mobile-notif-text">
                          Master Electrician Vinay Reddy is on call for home visits, wiring, meter works, and electrical installations.
                        </p>
                        <span className="mobile-notif-time">Available Today</span>
                      </div>
                    </div>

                    <div className="mobile-notif-item">
                      <div className="mobile-notif-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.12)', color: 'var(--accent-purple)' }}>
                        📞
                      </div>
                      <div className="mobile-notif-body">
                        <span className="mobile-notif-title">24/7 Emergency Support</span>
                        <p className="mobile-notif-text">
                          Facing an urgent short-circuit, sparking, or power failure? Call directly at <strong>8498870697</strong>.
                        </p>
                        <span className="mobile-notif-time">24/7 Direct Line</span>
                      </div>
                    </div>
                  </div>

                  <div className="mobile-notif-footer">
                    <Link
                      to="/track"
                      onClick={() => setNotifOpen(false)}
                      className="mobile-notif-action-btn"
                    >
                      Track My Booking
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default MobileHeader;
