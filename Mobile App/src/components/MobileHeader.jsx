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
          <Link to="/" className="mobile-exit-admin-btn" title="View Customer App">
            <UserIcon size={14} />
            <span>Customer View</span>
          </Link>
        ) : admin ? (
          <Link to="/admin-dashboard" className="mobile-admin-badge-pill" title="Admin Control Panel">
            <div className="nav-avatar-ring admin-ring" style={{ width: '28px', height: '28px' }}>
              <img
                src={admin.avatar || DEFAULT_AVATAR_SRC}
                alt="Admin"
                className="nav-avatar-img"
                onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR_SRC; }}
              />
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--accent-purple)' }}>Admin</span>
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
