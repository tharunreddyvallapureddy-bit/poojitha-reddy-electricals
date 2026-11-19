import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  ZapIcon, CalendarIcon, ClipboardIcon, StarIcon, UserIcon, ShieldCheckIcon 
} from './Icons';

const MobileBottomNav = ({ user, admin }) => {
  const location = useLocation();

  const navItems = [
    {
      to: '/',
      label: 'Home',
      icon: ZapIcon,
      exact: true,
    },
    {
      to: user ? '/book' : '/auth?redirect=book',
      label: 'Book',
      icon: CalendarIcon,
    },
    {
      to: user ? '/track' : '/auth?redirect=track',
      label: 'Track',
      icon: ClipboardIcon,
    },
    {
      to: '/reviews-view',
      label: 'Reviews',
      icon: StarIcon,
    },
    {
      to: admin ? '/admin-dashboard' : (user ? '/dashboard' : '/auth'),
      label: admin ? 'Admin' : (user ? 'Account' : 'Sign In'),
      icon: admin ? ShieldCheckIcon : UserIcon,
    },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.exact 
          ? location.pathname === item.to 
          : location.pathname.startsWith(item.to.split('?')[0]);

        return (
          <NavLink
            key={item.label}
            to={item.to}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="mobile-nav-icon-wrap">
              <Icon size={20} />
            </div>
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
