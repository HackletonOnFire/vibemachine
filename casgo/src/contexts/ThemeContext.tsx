'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  systemTheme: ResolvedTheme;
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme configuration
const STORAGE_KEY = 'casgo-theme';
const THEME_ATTRIBUTE = 'data-theme';

// Media query for system theme detection
const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

// Provider component
export const ThemeProvider: React.FC<{ 
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
  enableSystem?: boolean;
}> = ({ 
  children, 
  defaultTheme = 'system',
  storageKey = STORAGE_KEY,
  enableSystem = true 
}) => {
  const [theme, setThemeState] = useState<ThemeMode>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false);

  // Get resolved theme based on current theme and system preference
  const getResolvedTheme = useCallback((currentTheme: ThemeMode, currentSystemTheme: ResolvedTheme): ResolvedTheme => {
    return currentTheme === 'system' ? currentSystemTheme : currentTheme as ResolvedTheme;
  }, []);

  const resolvedTheme = getResolvedTheme(theme, systemTheme);

  // System theme detection
  useEffect(() => {
    if (!enableSystem) return;

    const mediaQuery = window.matchMedia(DARK_MEDIA_QUERY);
    
    const updateSystemTheme = () => {
      const isDark = mediaQuery.matches;
      setSystemTheme(isDark ? 'dark' : 'light');
    };

    // Set initial system theme
    updateSystemTheme();

    // Listen for system theme changes
    mediaQuery.addEventListener('change', updateSystemTheme);

    return () => {
      mediaQuery.removeEventListener('change', updateSystemTheme);
    };
  }, [enableSystem]);

  // Theme persistence and initialization
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(storageKey) as ThemeMode;
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
    }
    
    setMounted(true);
  }, [storageKey]);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    // Remove previous theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(resolvedTheme);
    
    // Set theme attribute for CSS selectors
    root.setAttribute(THEME_ATTRIBUTE, resolvedTheme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#0f172a' : '#ffffff');
    } else {
      // Create meta theme-color if it doesn't exist
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = resolvedTheme === 'dark' ? '#0f172a' : '#ffffff';
      document.head.appendChild(meta);
    }

    // Smooth transition effect
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    
    return () => {
      document.body.style.transition = '';
    };
  }, [resolvedTheme, mounted]);

  // Theme setter with persistence
  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    
    try {
      localStorage.setItem(storageKey, newTheme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }, [storageKey]);

  // Theme toggler
  const toggleTheme = useCallback(() => {
    const currentResolved = getResolvedTheme(theme, systemTheme);
    const newTheme: ThemeMode = currentResolved === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, systemTheme, getResolvedTheme, setTheme]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  const contextValue: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    systemTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook for using theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme detection utilities
export const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia(DARK_MEDIA_QUERY).matches ? 'dark' : 'light';
};

export const getStoredTheme = (storageKey: string = STORAGE_KEY): ThemeMode | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(storageKey);
    return stored && ['light', 'dark', 'system'].includes(stored) ? stored as ThemeMode : null;
  } catch {
    return null;
  }
};

// Theme transition utilities
export const disableThemeTransitions = () => {
  const css = document.createElement('style');
  css.appendChild(
    document.createTextNode(`
      *, *::before, *::after {
        transition-duration: 0.01ms !important;
        transition-delay: 0.01ms !important;
        animation-duration: 0.01ms !important;
        animation-delay: -0.01ms !important;
        scroll-behavior: auto !important;
      }
    `)
  );
  document.head.appendChild(css);

  return () => {
    document.head.removeChild(css);
  };
};

export default ThemeProvider; 