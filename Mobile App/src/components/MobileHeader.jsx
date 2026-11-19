import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BrandLogo, PhoneIcon, UserIcon, ShieldCheckIcon, LockIcon } from './Icons';
import { DEFAULT_AVATAR_SRC } from '../assets/defaultAvatarBase64';

const MobileHeader = ({ user, admin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

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
        {/* Do not show Call button in Admin mode */}
        {!isAdminPage && (
          <a href="tel:8498870697" className="mobile-call-pill" title="Call Handyman Directly">
            <PhoneIcon size={14} />
            <span>Call</span>
          </a>
        )}

        {isAdminPage ? (
          admin && (
            <Link
              to="/admin-dashboard?tab=profile"
              className={`mobile-admin-avatar-link ${location.search.includes('tab=profile') ? 'active' : ''}`}
              title="Admin Profile & Security"
            >
              <div
                className="nav-avatar-ring admin-ring"
                style={{
                  width: '34px',
                  height: '34px',
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
        ) : admin ? (
          <Link
            to="/admin-dashboard?tab=bookings"
            className="mobile-admin-avatar-link"
            title="Admin Control Panel"
          >
            <div
              className="nav-avatar-ring admin-ring"
              style={{ width: '34px', height: '34px' }}
            >
              <img
                src={admin.avatar || DEFAULT_AVATAR_SRC}
                alt="Admin"
                className="nav-avatar-img"
                onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR_SRC; }}
              />
            </div>
          </Link>
        ) : (
          <Link to="/admin-login" className="mobile-admin-lock-btn" title="Admin Portal Login">
            <LockIcon size={14} />
            <span>Admin</span>
          </Link>
        )}

        {user && !admin && !isAdminPage && (
          <Link to="/dashboard?tab=profile" style={{ display: 'flex' }} title="Customer Profile">
            <div className="nav-avatar-ring" style={{ width: '30px', height: '30px' }}>
              <img
                src={user.avatar || DEFAULT_AVATAR_SRC}
                alt="Customer"
                className="nav-avatar-img"
                onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR_SRC; }}
              />
            </div>
          </Link>
        )}
      </div>
    </header>
  );
};

export default MobileHeader;
