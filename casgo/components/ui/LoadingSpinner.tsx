'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Spinner variants
const spinnerVariants = cva(
  [
    'animate-spin',
    'inline-block',
  ],
  {
    variants: {
      variant: {
        default: 'text-primary-500',
        primary: 'text-primary-500',
        secondary: 'text-secondary-500',
        white: 'text-white',
        gray: 'text-gray-500',
      },
      size: {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Loading overlay variants
const overlayVariants = cva(
  [
    'absolute',
    'inset-0',
    'flex',
    'items-center',
    'justify-center',
    'transition-all',
    'duration-300',
  ],
  {
    variants: {
      variant: {
        light: 'bg-white/80 backdrop-blur-sm',
        dark: 'bg-gray-900/80 backdrop-blur-sm',
        transparent: 'bg-transparent',
        blur: 'bg-white/50 backdrop-blur-md',
      },
    },
    defaultVariants: {
      variant: 'light',
    },
  }
);

// Spinner component interfaces
export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /**
   * Loading text to display
   */
  text?: string;
  /**
   * Custom spinner element
   */
  children?: React.ReactNode;
}

export interface LoadingOverlayProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof overlayVariants> {
  /**
   * Whether the overlay is visible
   */
  isLoading: boolean;
  /**
   * Loading text
   */
  text?: string;
  /**
   * Custom spinner variant
   */
  spinnerVariant?: VariantProps<typeof spinnerVariants>['variant'];
  /**
   * Custom spinner size
   */
  spinnerSize?: VariantProps<typeof spinnerVariants>['size'];
}

/**
 * Classic Circular Spinner
 */
export const CircularSpinner: React.FC<SpinnerProps> = ({
  variant,
  size,
  text,
  className,
  ...props
}) => {
  return (
    <div className={cn('flex flex-col items-center gap-2', className)} {...props}>
      <svg
        className={cn(spinnerVariants({ variant, size }))}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && (
        <span className="text-sm text-gray-600 animate-pulse">{text}</span>
      )}
    </div>
  );
};

/**
 * Pulse Dots Spinner
 */
export const PulseDotsSpinner: React.FC<SpinnerProps> = ({
  variant = 'primary',
  size = 'md',
  text,
  className,
  ...props
}) => {
  const dotSize = {
    xs: 'w-1 h-1',
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  const colorClass = {
    default: 'bg-primary-500',
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    white: 'bg-white',
    gray: 'bg-gray-500',
  };

  return (
    <div className={cn('flex flex-col items-center gap-3', className)} {...props}>
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              dotSize[size],
              colorClass[variant],
              'rounded-full animate-pulse'
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1.2s',
            }}
          />
        ))}
      </div>
      {text && (
        <span className="text-sm text-gray-600 animate-pulse">{text}</span>
      )}
    </div>
  );
};

/**
 * Bouncing Balls Spinner
 */
export const BouncingBallsSpinner: React.FC<SpinnerProps> = ({
  variant = 'primary',
  size = 'md',
  text,
  className,
  ...props
}) => {
  const ballSize = {
    xs: 'w-1 h-1',
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  const colorClass = {
    default: 'bg-primary-500',
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    white: 'bg-white',
    gray: 'bg-gray-500',
  };

  return (
    <div className={cn('flex flex-col items-center gap-3', className)} {...props}>
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              ballSize[size],
              colorClass[variant],
              'rounded-full animate-bounce'
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1.4s',
            }}
          />
        ))}
      </div>
      {text && (
        <span className="text-sm text-gray-600">{text}</span>
      )}
    </div>
  );
};

/**
 * Wave Spinner
 */
export const WaveSpinner: React.FC<SpinnerProps> = ({
  variant = 'primary',
  size = 'md',
  text,
  className,
  ...props
}) => {
  const barWidth = {
    xs: 'w-0.5',
    sm: 'w-0.5',
    md: 'w-1',
    lg: 'w-1.5',
    xl: 'w-2',
  };

  const barHeight = {
    xs: 'h-4',
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
    xl: 'h-16',
  };

  const colorClass = {
    default: 'bg-primary-500',
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    white: 'bg-white',
    gray: 'bg-gray-500',
  };

  return (
    <div className={cn('flex flex-col items-center gap-3', className)} {...props}>
      <div className="flex items-end space-x-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              barWidth[size],
              barHeight[size],
              colorClass[variant],
              'origin-bottom animate-pulse'
            )}
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1.2s',
            }}
          />
        ))}
      </div>
      {text && (
        <span className="text-sm text-gray-600">{text}</span>
      )}
    </div>
  );
};

/**
 * Sustainability Themed Spinner (Leaf Animation)
 */
export const SustainabilitySpinner: React.FC<SpinnerProps> = ({
  size = 'md',
  text,
  className,
  ...props
}) => {
  const iconSize = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={cn('flex flex-col items-center gap-3', className)} {...props}>
      <div className="relative">
        <svg
          className={cn(iconSize[size], 'text-green-500 animate-spin')}
          fill="currentColor"
          viewBox="0 0 24 24"
          style={{ animationDuration: '2s' }}
        >
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.06.82C6.16 17.65 9 12.32 17 8zm-8.5 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM19 12c0-3.31-2.69-6-6-6s-6 2.69-6 6 2.69 6 6 6 6-2.69 6-6z"/>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
        </div>
      </div>
      {text && (
        <span className="text-sm text-green-600 font-medium">{text}</span>
      )}
    </div>
  );
};

/**
 * Loading Overlay Component
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  variant,
  text,
  spinnerVariant = 'primary',
  spinnerSize = 'lg',
  className,
  children,
  ...props
}) => {
  if (!isLoading) return null;

  return (
    <div
      className={cn(overlayVariants({ variant }), className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-4">
        <SustainabilitySpinner size={spinnerSize} />
        {text && (
          <p className="text-sm font-medium text-gray-700 animate-pulse">
            {text}
          </p>
        )}
        {children}
      </div>
    </div>
  );
};

/**
 * Progress Bar Component
 */
export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Progress value (0-100)
   */
  value: number;
  /**
   * Progress bar variant
   */
  variant?: 'default' | 'success' | 'warning' | 'error';
  /**
   * Show percentage text
   */
  showPercentage?: boolean;
  /**
   * Animated progress
   */
  animated?: boolean;
  /**
   * Progress bar size
   */
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  variant = 'default',
  showPercentage = false,
  animated = true,
  size = 'md',
  className,
  ...props
}) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colorClasses = {
    default: 'bg-primary-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  return (
    <div className={cn('w-full', className)} {...props}>
      {showPercentage && (
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span>{Math.round(clampedValue)}%</span>
        </div>
      )}
      <div className={cn('bg-gray-200 rounded-full overflow-hidden', heightClasses[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorClasses[variant],
            animated && 'animate-pulse'
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};

/**
 * Skeleton Loader Component
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Width of skeleton
   */
  width?: string | number;
  /**
   * Height of skeleton
   */
  height?: string | number;
  /**
   * Border radius variant
   */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /**
   * Animation variant
   */
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  rounded = 'md',
  animation = 'pulse',
  className,
  style,
  ...props
}) => {
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse', // We'll use pulse for now, could add wave later
    none: '',
  };

  return (
    <div
      className={cn(
        'bg-gray-200',
        roundedClasses[rounded],
        animationClasses[animation],
        className
      )}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
};

// Export all components
export {
  CircularSpinner as Spinner,
  spinnerVariants,
  overlayVariants,
};

// Micro-interaction utilities
export const microInteractions = {
  // Hover scale effect
  hoverScale: 'hover:scale-105 transition-transform duration-200',
  
  // Hover lift effect
  hoverLift: 'hover:-translate-y-1 hover:shadow-lg transition-all duration-200',
  
  // Press effect
  press: 'active:scale-95 transition-transform duration-100',
  
  // Glow effect
  glow: 'hover:shadow-lg hover:shadow-primary-500/25 transition-shadow duration-300',
  
  // Fade in
  fadeIn: 'opacity-0 animate-pulse duration-500',
  
  // Slide in from bottom
  slideInBottom: 'transform translate-y-2 transition-all duration-500 ease-out',
  
  // Slide in from right
  slideInRight: 'transform translate-x-2 transition-all duration-500 ease-out',
  
  // Bounce in
  bounceIn: 'transform scale-95 transition-all duration-300 ease-out',
} as const; 