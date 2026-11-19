import React from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { 
  ZapIcon, CalendarIcon, ClipboardIcon, StarIcon, UserIcon, ShieldCheckIcon, MailIcon 
} from './Icons';

const MobileBottomNav = ({ user, admin }) => {
  const location = useLocation();
  const isAdminDashboard = location.pathname.startsWith('/admin-dashboard');

  // Dedicated Admin Bottom Navigation Bar
  if (isAdminDashboard) {
    const searchParams = new URLSearchParams(location.search);
    const activeTab = searchParams.get('tab') || 'bookings';

    const adminNavItems = [
      {
        to: '/admin-dashboard?tab=bookings',
        id: 'bookings',
        label: 'Bookings',
        icon: ClipboardIcon,
      },
      {
        to: '/admin-dashboard?tab=overview',
        id: 'overview',
        label: 'Overview',
        icon: ZapIcon,
      },
      {
        to: '/admin-dashboard?tab=messages',
        id: 'messages',
        label: 'Inbox',
        icon: MailIcon,
      },
      {
        to: '/admin-dashboard?tab=reviews',
        id: 'reviews',
        label: 'Reviews',
        icon: StarIcon,
      },
      {
        to: '/admin-dashboard?tab=profile',
        id: 'profile',
        label: 'Profile',
        icon: ShieldCheckIcon,
      },
    ];

    return (
      <nav className="mobile-bottom-nav admin-bottom-nav" aria-label="Admin Navigation">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <Link
              key={item.id}
              to={item.to}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="mobile-nav-icon-wrap">
                <Icon size={20} />
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  // Standard Customer Navigation
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
      to: admin ? '/admin-dashboard?tab=bookings' : (user ? '/dashboard' : '/auth'),
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
