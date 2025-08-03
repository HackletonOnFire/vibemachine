/**
 * Design Tokens and Utility Classes
 * 
 * Comprehensive design system tokens for consistent spacing, colors,
 * typography, and layout patterns across the EcoMind application.
 */

// Design Tokens
export const designTokens = {
  // Spacing Scale (based on 4px grid)
  spacing: {
    xs: '0.125rem',    // 2px
    sm: '0.25rem',     // 4px
    md: '0.5rem',      // 8px
    lg: '0.75rem',     // 12px
    xl: '1rem',        // 16px
    '2xl': '1.25rem',  // 20px
    '3xl': '1.5rem',   // 24px
    '4xl': '2rem',     // 32px
    '5xl': '2.5rem',   // 40px
    '6xl': '3rem',     // 48px
    '7xl': '4rem',     // 64px
    '8xl': '5rem',     // 80px
    '9xl': '6rem',     // 96px
  },

  // Color Palette (Sustainability Theme)
  colors: {
    // Primary green shades
    primary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16',
    },
    
    // Secondary blue-green shades
    secondary: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
      950: '#083344',
    },

    // Neutral grays
    neutral: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
      950: '#09090b',
    },

    // Semantic colors
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
    },
    
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
    },
    
    error: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },

    info: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
  },

  // Typography Scale
  typography: {
    fontSizes: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
      '7xl': ['4.5rem', { lineHeight: '1' }],
      '8xl': ['6rem', { lineHeight: '1' }],
      '9xl': ['8rem', { lineHeight: '1' }],
    },
    
    fontWeights: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
  },

  // Shadows
  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    glow: '0 0 0 1px rgb(34 197 94 / 0.2), 0 0 20px rgb(34 197 94 / 0.3)',
  },

  // Border Radius
  borderRadius: {
    none: '0px',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },

  // Z-index Scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },

  // Animation Durations
  animation: {
    durations: {
      fastest: '50ms',
      faster: '100ms',
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms',
      slowest: '1000ms',
    },
    
    easings: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
  },
} as const;

// Layout Utility Classes
export const layoutUtils = {
  // Container sizes
  containers: {
    xs: 'max-w-xs mx-auto',      // 320px
    sm: 'max-w-sm mx-auto',      // 384px
    md: 'max-w-md mx-auto',      // 448px
    lg: 'max-w-lg mx-auto',      // 512px
    xl: 'max-w-xl mx-auto',      // 576px
    '2xl': 'max-w-2xl mx-auto',  // 672px
    '3xl': 'max-w-3xl mx-auto',  // 768px
    '4xl': 'max-w-4xl mx-auto',  // 896px
    '5xl': 'max-w-5xl mx-auto',  // 1024px
    '6xl': 'max-w-6xl mx-auto',  // 1152px
    '7xl': 'max-w-7xl mx-auto',  // 1280px
    full: 'max-w-full mx-auto',
  },

  // Flexbox utilities
  flex: {
    center: 'flex items-center justify-center',
    centerVertical: 'flex items-center',
    centerHorizontal: 'flex justify-center',
    between: 'flex items-center justify-between',
    around: 'flex items-center justify-around',
    evenly: 'flex items-center justify-evenly',
    start: 'flex items-start justify-start',
    end: 'flex items-end justify-end',
    col: 'flex flex-col',
    colCenter: 'flex flex-col items-center justify-center',
    colStart: 'flex flex-col items-start',
    colEnd: 'flex flex-col items-end',
    wrap: 'flex flex-wrap',
    nowrap: 'flex flex-nowrap',
  },

  // Grid utilities
  grid: {
    cols1: 'grid grid-cols-1',
    cols2: 'grid grid-cols-2',
    cols3: 'grid grid-cols-3',
    cols4: 'grid grid-cols-4',
    cols5: 'grid grid-cols-5',
    cols6: 'grid grid-cols-6',
    cols12: 'grid grid-cols-12',
    responsive2: 'grid grid-cols-1 md:grid-cols-2',
    responsive3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    responsive4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    autoFit: 'grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))]',
    autoFill: 'grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))]',
  },

  // Positioning utilities
  position: {
    absoluteCenter: 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    absoluteTop: 'absolute top-0 left-0 right-0',
    absoluteBottom: 'absolute bottom-0 left-0 right-0',
    absoluteFull: 'absolute inset-0',
    fixedTop: 'fixed top-0 left-0 right-0 z-50',
    fixedBottom: 'fixed bottom-0 left-0 right-0 z-50',
    stickyTop: 'sticky top-0 z-40',
  },
} as const;

// Component Utility Classes
export const componentUtils = {
  // Card patterns
  cards: {
    default: 'bg-white rounded-lg border border-gray-200 shadow-sm p-6',
    elevated: 'bg-white rounded-lg border border-gray-200 shadow-md p-6',
    outlined: 'bg-white rounded-lg border-2 border-gray-300 p-6',
    interactive: 'bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-lg transition-shadow cursor-pointer',
    flat: 'bg-white rounded-lg p-6',
  },

  // Button patterns
  buttons: {
    // Size variations
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
    
    // Base styles
    base: 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
    disabled: 'opacity-50 cursor-not-allowed pointer-events-none',
  },

  // Input patterns
  inputs: {
    base: 'block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500',
    disabled: 'bg-gray-50 cursor-not-allowed opacity-50',
  },

  // Badge patterns
  badges: {
    base: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
  },

  // Alert patterns
  alerts: {
    base: 'p-4 rounded-md',
    success: 'bg-green-50 border border-green-200 text-green-800',
    warning: 'bg-yellow-50 border border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border border-red-200 text-red-800',
    info: 'bg-blue-50 border border-blue-200 text-blue-800',
  },
} as const;

// Animation Utility Classes
export const animationUtils = {
  // Entrance animations
  entrance: {
    fadeIn: 'animate-in fade-in duration-300',
    slideInBottom: 'animate-in slide-in-from-bottom-4 duration-300',
    slideInTop: 'animate-in slide-in-from-top-4 duration-300',
    slideInLeft: 'animate-in slide-in-from-left-4 duration-300',
    slideInRight: 'animate-in slide-in-from-right-4 duration-300',
    zoomIn: 'animate-in zoom-in-95 duration-300',
    zoomOut: 'animate-in zoom-in-105 duration-300',
    bounceIn: 'animate-in zoom-in-50 duration-500 ease-out',
  },

  // Exit animations
  exit: {
    fadeOut: 'animate-out fade-out duration-200',
    slideOutBottom: 'animate-out slide-out-to-bottom-4 duration-200',
    slideOutTop: 'animate-out slide-out-to-top-4 duration-200',
    slideOutLeft: 'animate-out slide-out-to-left-4 duration-200',
    slideOutRight: 'animate-out slide-out-to-right-4 duration-200',
    zoomOut: 'animate-out zoom-out-95 duration-200',
    zoomIn: 'animate-out zoom-out-105 duration-200',
  },

  // Hover effects
  hover: {
    scale: 'hover:scale-105 transition-transform duration-200',
    lift: 'hover:-translate-y-1 hover:shadow-lg transition-all duration-200',
    glow: 'hover:shadow-lg hover:shadow-primary-500/25 transition-shadow duration-300',
    brighten: 'hover:brightness-110 transition-all duration-200',
    fade: 'hover:opacity-80 transition-opacity duration-200',
  },

  // Focus effects
  focus: {
    ring: 'focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    outline: 'focus:outline-none focus:ring-2 focus:ring-primary-500',
    glow: 'focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-opacity-50',
  },

  // Loading states
  loading: {
    pulse: 'animate-pulse',
    spin: 'animate-spin',
    bounce: 'animate-bounce',
    ping: 'animate-ping',
  },
} as const;

// Responsive Utility Generators
export const responsiveUtils = {
  // Breakpoint prefixes
  breakpoints: {
    sm: 'sm:',
    md: 'md:',
    lg: 'lg:',
    xl: 'xl:',
    '2xl': '2xl:',
  },

  // Generate responsive classes
  generateResponsive: (baseClass: string) => ({
    base: baseClass,
    sm: `sm:${baseClass}`,
    md: `md:${baseClass}`,
    lg: `lg:${baseClass}`,
    xl: `xl:${baseClass}`,
    '2xl': `2xl:${baseClass}`,
  }),

  // Common responsive patterns
  hide: {
    sm: 'hidden sm:block',
    md: 'hidden md:block',
    lg: 'hidden lg:block',
    xl: 'hidden xl:block',
  },

  show: {
    sm: 'block sm:hidden',
    md: 'block md:hidden',
    lg: 'block lg:hidden',
    xl: 'block xl:hidden',
  },
} as const;

// Accessibility Utility Classes
export const a11yUtils = {
  // Screen reader utilities
  screenReader: {
    only: 'sr-only',
    focusable: 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0',
  },

  // Focus management
  focus: {
    visible: 'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
    trap: 'focus:outline-none',
  },

  // High contrast mode support
  highContrast: {
    border: 'border-2 border-transparent forced-colors:border-current',
    text: 'forced-colors:text-current',
    background: 'forced-colors:bg-current',
  },

  // Reduced motion support
  reducedMotion: {
    disable: 'motion-reduce:animate-none motion-reduce:transition-none',
    respectPreference: 'motion-safe:animate-pulse motion-reduce:animate-none',
  },
} as const;

// CSS Custom Properties Generator
export const generateCSSCustomProperties = () => {
  const properties: Record<string, string> = {};

  // Add spacing properties
  Object.entries(designTokens.spacing).forEach(([key, value]) => {
    properties[`--spacing-${key}`] = value;
  });

  // Add color properties
  Object.entries(designTokens.colors).forEach(([colorName, shades]) => {
    if (typeof shades === 'object') {
      Object.entries(shades).forEach(([shade, value]) => {
        properties[`--color-${colorName}-${shade}`] = value;
      });
    }
  });

  // Add shadow properties
  Object.entries(designTokens.shadows).forEach(([key, value]) => {
    properties[`--shadow-${key}`] = value;
  });

  return properties;
};

// Utility function to combine classes
export const combineClasses = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Export all utilities
export {
  designTokens as tokens,
  layoutUtils as layout,
  componentUtils as components,
  animationUtils as animations,
  responsiveUtils as responsive,
  a11yUtils as accessibility,
}; 