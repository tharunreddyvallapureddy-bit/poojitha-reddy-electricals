import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themePreference, setThemePreferenceState] = useState(() => {
    return localStorage.getItem('themePreference') || 'system';
  });

  const [effectiveTheme, setEffectiveTheme] = useState(() => {
    const pref = localStorage.getItem('themePreference') || 'system';
    if (pref === 'system') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return pref;
  });

  const setThemePreference = (pref) => {
    setThemePreferenceState(pref);
    localStorage.setItem('themePreference', pref);

    let calculated = pref;
    if (pref === 'system') {
      calculated = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    setEffectiveTheme(calculated);
    document.documentElement.setAttribute('data-theme', calculated);
    document.documentElement.setAttribute('data-theme-preference', pref);
  };

  useEffect(() => {
    // Initial sync
    const initialPref = localStorage.getItem('themePreference') || 'system';
    let calculated = initialPref;
    if (initialPref === 'system') {
      calculated = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    setEffectiveTheme(calculated);
    document.documentElement.setAttribute('data-theme', calculated);
    document.documentElement.setAttribute('data-theme-preference', initialPref);

    // System theme change listener
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleSystemChange = (e) => {
      const currentPref = localStorage.getItem('themePreference') || 'system';
      if (currentPref === 'system') {
        const newTheme = e.matches ? 'light' : 'dark';
        setEffectiveTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleSystemChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleSystemChange);
      }
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ themePreference, effectiveTheme, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
