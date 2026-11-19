import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrandLogo, PhoneIcon, UserIcon, ShieldCheckIcon } from './Icons';
import { DEFAULT_AVATAR_SRC } from '../assets/defaultAvatarBase64';

const MobileHeader = ({ user, admin }) => {
  const navigate = useNavigate();

  return (
    <header className="mobile-app-header">
      <Link to="/" className="mobile-header-brand">
        <BrandLogo size={32} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: '800', letterSpacing: '0.04em', lineHeight: '1.1' }}>
            POOJITHA REDDY
          </span>
          <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--accent-cyan)', letterSpacing: '0.12em' }}>
            ELECTRICALS
          </span>
        </div>
      </Link>

      <div className="mobile-header-actions">
        <a href="tel:8498870697" className="mobile-call-pill" title="Call Handyman Directly">
          <PhoneIcon size={14} />
          <span>Call</span>
        </a>

        {admin ? (
          <Link to="/admin-dashboard?tab=profile" style={{ display: 'flex' }} title="Admin Profile">
            <div className="nav-avatar-ring admin-ring" style={{ width: '32px', height: '32px' }}>
              <img
                src={admin.avatar || DEFAULT_AVATAR_SRC}
                alt="Admin"
                className="nav-avatar-img"
                onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR_SRC; }}
              />
            </div>
          </Link>
        ) : user ? (
          <Link to="/dashboard?tab=profile" style={{ display: 'flex' }} title="Customer Profile">
            <div className="nav-avatar-ring" style={{ width: '32px', height: '32px' }}>
              <img
                src={user.avatar || DEFAULT_AVATAR_SRC}
                alt="Customer"
                className="nav-avatar-img"
                onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR_SRC; }}
              />
            </div>
          </Link>
        ) : null}
      </div>
    </header>
  );
};

export default MobileHeader;
