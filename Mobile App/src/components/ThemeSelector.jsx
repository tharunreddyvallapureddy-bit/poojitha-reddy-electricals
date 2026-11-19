import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon, MonitorIcon } from './Icons';

const ThemeSelector = ({ variant = 'full', className = '' }) => {
  const { themePreference, effectiveTheme, setThemePreference } = useTheme();

  const themes = [
    {
      id: 'system',
      label: 'System Default',
      desc: 'Follows your device OS appearance',
      icon: MonitorIcon,
    },
    {
      id: 'light',
      label: 'Light Mode',
      desc: 'Crisp & clear high-contrast daylight view',
      icon: SunIcon,
    },
    {
      id: 'dark',
      label: 'Dark Mode',
      desc: 'Signature luxury glowing cyber theme',
      icon: MoonIcon,
    },
  ];

  if (variant === 'compact') {
    return (
      <div className={`theme-toggle-compact ${className}`}>
        {themes.map((t) => {
          const Icon = t.icon;
          const isActive = themePreference === t.id;
          return (
            <button
              key={t.id}
              type="button"
              className={`theme-toggle-btn ${isActive ? 'active' : ''}`}
              onClick={() => setThemePreference(t.id)}
              title={`${t.label} - ${t.desc}`}
              aria-label={t.label}
            >
              <Icon size={14} />
              <span>{t.id === 'system' ? 'System' : t.id === 'light' ? 'Light' : 'Dark'}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`theme-selector-grid ${className}`}>
      {themes.map((t) => {
        const Icon = t.icon;
        const isActive = themePreference === t.id;
        return (
          <div
            key={t.id}
            role="button"
            tabIndex={0}
            className={`theme-option-card ${isActive ? 'active' : ''}`}
            onClick={() => setThemePreference(t.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setThemePreference(t.id);
              }
            }}
          >
            <div className="theme-card-icon-wrap">
              <Icon size={24} className="theme-card-icon" />
            </div>
            <div className="theme-card-text">
              <div className="theme-card-title">
                {t.label}
                {isActive && <span className="theme-active-tag">Active</span>}
              </div>
              <p className="theme-card-desc">{t.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ThemeSelector;
