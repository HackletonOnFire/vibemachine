'use client';

import React, { useState } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme, ThemeMode } from '../../src/contexts/ThemeContext';
import { Button } from './Button';
import { cn } from '../../lib/utils';
import { useToast } from '../../src/contexts/ToastContext';

interface ThemeToggleProps {
  variant?: 'icon' | 'dropdown' | 'segmented';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'icon',
  size = 'md',
  className = '',
  showLabel = false
}) => {
  // Safely handle theme context that might not be available during SSG
  let theme: ThemeMode = 'system';
  let resolvedTheme: ThemeMode = 'light';
  let setTheme: (theme: ThemeMode) => void = () => {};
  let toggleTheme: () => void = () => {};
  
  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
    resolvedTheme = themeContext.resolvedTheme;
    setTheme = themeContext.setTheme;
    toggleTheme = themeContext.toggleTheme;
  } catch (error) {
    // Fallback when ThemeProvider is not available (e.g., during SSG)
    console.warn('ThemeToggle: useTheme hook called outside of ThemeProvider context');
  }

  let info: (title: string, message: string, options?: any) => void = () => {};
  try {
    const toastContext = useToast();
    info = toastContext.info;
  } catch (error) {
    // Fallback when ToastProvider is not available
    console.warn('ThemeToggle: useToast hook called outside of ToastProvider context');
  }
  const [isOpen, setIsOpen] = useState(false);

  const themes: { value: ThemeMode; label: string; icon: React.ReactNode; description: string }[] = [
    {
      value: 'light',
      label: 'Light',
      icon: <Sun className="w-4 h-4" />,
      description: 'Light theme with bright colors'
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: <Moon className="w-4 h-4" />,
      description: 'Dark theme with reduced eye strain'
    },
    {
      value: 'system',
      label: 'System',
      icon: <Monitor className="w-4 h-4" />,
      description: 'Follow your system preference'
    }
  ];

  const getCurrentThemeData = () => {
    return themes.find(t => t.value === theme) || themes[0];
  };

  const handleThemeChange = (newTheme: ThemeMode) => {
    const oldTheme = theme;
    setTheme(newTheme);
    setIsOpen(false);

    // Show feedback toast
    const themeLabels = { light: 'Light', dark: 'Dark', system: 'System' };
    const themeEmojis = { light: '☀️', dark: '🌙', system: '💻' };
    
    info(
      `${themeEmojis[newTheme]} Theme Changed`,
      `Switched to ${themeLabels[newTheme]} mode`,
      { duration: 2000 }
    );
  };

  // Icon only variant (simple toggle button)
  if (variant === 'icon') {
    const currentIcon = resolvedTheme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />;
    
    return (
      <Button
        variant="ghost"
        size={size}
        onClick={toggleTheme}
        className={cn(
          'rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200',
          'hover:scale-110 active:scale-95',
          className
        )}
        aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Currently: ${resolvedTheme} mode. Click to toggle.`}
      >
        <div className="relative">
          {currentIcon}
          {showLabel && (
            <span className="ml-2 text-sm font-medium">
              {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
            </span>
          )}
        </div>
      </Button>
    );
  }

  // Segmented control variant
  if (variant === 'segmented') {
    return (
      <div className={cn(
        'inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-1 transition-colors',
        className
      )}>
        {themes.map((themeOption) => (
          <button
            key={themeOption.value}
            onClick={() => handleThemeChange(themeOption.value)}
            className={cn(
              'relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
              'hover:bg-white dark:hover:bg-slate-700',
              theme === themeOption.value
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            )}
            aria-label={`Set theme to ${themeOption.label}`}
            title={themeOption.description}
          >
            {themeOption.icon}
            <span className="text-xs">{themeOption.label}</span>
            {theme === themeOption.value && (
              <div className="absolute inset-0 rounded-md border-2 border-blue-500/20 bg-blue-500/5" />
            )}
          </button>
        ))}
      </div>
    );
  }

  // Dropdown variant
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size={size}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800',
          className
        )}
        aria-label="Theme options"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {getCurrentThemeData().icon}
        {showLabel && (
          <span className="text-sm font-medium">
            {getCurrentThemeData().label}
          </span>
        )}
        <svg
          className={cn(
            'w-4 h-4 transition-transform duration-200',
            isOpen ? 'rotate-180' : 'rotate-0'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-full z-50 mt-2 w-48 animate-fade-in">
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg backdrop-blur-sm">
              <div className="p-1">
                {themes.map((themeOption) => (
                  <button
                    key={themeOption.value}
                    onClick={() => handleThemeChange(themeOption.value)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                      'hover:bg-slate-100 dark:hover:bg-slate-700',
                      theme === themeOption.value
                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                        : 'text-slate-700 dark:text-slate-300'
                    )}
                    role="menuitem"
                  >
                    <div className="flex items-center justify-center w-5 h-5">
                      {themeOption.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{themeOption.label}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {themeOption.description}
                      </div>
                    </div>
                    {theme === themeOption.value && (
                      <Check className="w-4 h-4 text-blue-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Hook for theme detection utilities
export const useThemeDetection = () => {
  const { theme, resolvedTheme, systemTheme } = useTheme();
  
  return {
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    isSystem: theme === 'system',
    systemPrefersDark: systemTheme === 'dark',
    resolvedTheme,
    theme
  };
};

export default ThemeToggle; 