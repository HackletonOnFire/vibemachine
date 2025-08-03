import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Button variants using class-variance-authority for type-safe styling
const buttonVariants = cva(
  // Enhanced base classes with advanced micro-interactions
  [
    'inline-flex',
    'items-center',
    'justify-center',
    'gap-2',
    'rounded-md',
    'text-sm',
    'font-medium',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'active:scale-[0.98]',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'disabled:pointer-events-none',
    'relative',
    'overflow-hidden',
    'btn-micro-bounce',
    'btn-ripple',
    'interactive-highlight',
    'focus-glow',
  ],
  {
    variants: {
      variant: {
        // Primary - main sustainability green
        primary: [
          'bg-primary-500',
          'text-white',
          'shadow-sm',
          'hover:bg-primary-600',
          'hover:shadow-md',
          'focus:ring-primary-500',
          'active:bg-primary-700',
          'before:absolute',
          'before:inset-0',
          'before:bg-gradient-to-r',
          'before:from-transparent',
          'before:via-white/10',
          'before:to-transparent',
          'before:translate-x-[-100%]',
          'before:transition-transform',
          'before:duration-500',
          'hover:before:translate-x-[100%]',
        ],
        // Secondary - blue-green accent
        secondary: [
          'bg-secondary-500',
          'text-white',
          'shadow-sm',
          'hover:bg-secondary-600',
          'hover:shadow-md',
          'focus:ring-secondary-500',
          'active:bg-secondary-700',
        ],
        // Outline - clean and minimal
        outline: [
          'border',
          'border-neutral-300',
          'bg-transparent',
          'text-neutral-700',
          'hover:bg-neutral-50',
          'hover:border-neutral-400',
          'focus:ring-neutral-500',
          'active:bg-neutral-100',
        ],
        // Ghost - subtle interaction
        ghost: [
          'bg-transparent',
          'text-neutral-700',
          'hover:bg-neutral-100',
          'focus:ring-neutral-500',
          'active:bg-neutral-200',
        ],
        // Semantic variants
        success: [
          'bg-success-500',
          'text-white',
          'shadow-sm',
          'hover:bg-success-600',
          'hover:shadow-md',
          'focus:ring-success-500',
          'active:bg-success-700',
        ],
        warning: [
          'bg-warning-500',
          'text-white',
          'shadow-sm',
          'hover:bg-warning-600',
          'hover:shadow-md',
          'focus:ring-warning-500',
          'active:bg-warning-700',
        ],
        error: [
          'bg-error-500',
          'text-white',
          'shadow-sm',
          'hover:bg-error-600',
          'hover:shadow-md',
          'focus:ring-error-500',
          'active:bg-error-700',
        ],
        // Link style
        link: [
          'text-primary-600',
          'underline-offset-4',
          'hover:underline',
          'focus:ring-primary-500',
          'active:text-primary-700',
        ],
      },
      size: {
        xs: ['h-8', 'px-2', 'text-xs', 'gap-1'],
        sm: ['h-10', 'px-3', 'text-sm', 'gap-1.5'],
        md: ['h-11', 'px-4', 'text-sm', 'gap-2', 'min-w-[44px]'], // Enhanced for mobile touch targets
        lg: ['h-12', 'px-6', 'text-base', 'gap-2', 'min-w-[44px]'], 
        xl: ['h-14', 'px-8', 'text-lg', 'gap-3'],
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

// Loading spinner component
const Spinner = ({ size = 'sm' }: { size?: 'xs' | 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <svg
      className={cn('animate-spin', sizeClasses[size])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
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
  );
};

// Icon wrapper component for consistent sizing
const IconWrapper = ({ 
  children, 
  size = 'md' 
}: { 
  children: React.ReactNode; 
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}) => {
  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7',
  };

  return (
    <span className={cn('flex-shrink-0', iconSizes[size])} aria-hidden="true">
      {children}
    </span>
  );
};

// Button component interface
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Content to display inside the button
   */
  children?: React.ReactNode;
  /**
   * Whether the button is in a loading state
   */
  loading?: boolean;
  /**
   * Text to display while loading (for screen readers)
   */
  loadingText?: string;
  /**
   * Icon to display before the button text
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon to display after the button text
   */
  rightIcon?: React.ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Ref forwarding for form integration
   */
  ref?: React.Ref<HTMLButtonElement>;
  /**
   * Enable enhanced animations and micro-interactions
   */
  animate?: boolean;
  /**
   * Enable pulse glow effect
   */
  pulse?: boolean;
  /**
   * Enable glow effect on focus/hover
   */
  glow?: boolean;
}

/**
 * Button Component
 * 
 * A comprehensive, accessible button component with multiple variants, sizes,
 * loading states, and icon support. Built with sustainability design principles
 * and top-class UX patterns.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <Button>Click me</Button>
 * 
 * // With variants and sizes
 * <Button variant="secondary" size="lg">Secondary Button</Button>
 * 
 * // With loading state
 * <Button loading loadingText="Saving...">Save Changes</Button>
 * 
 * // With icons
 * <Button leftIcon={<PlusIcon />} rightIcon={<ArrowIcon />}>
 *   Add Item
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled,
      children,
      type = 'button',
      animate = false,
      pulse = false,
      glow = false,
      ...props
    },
    ref
  ) => {
    // Determine if button should be disabled
    const isDisabled = disabled || loading;

    // Get spinner size based on button size
    const getSpinnerSize = (buttonSize: string | null | undefined) => {
      switch (buttonSize) {
        case 'xs':
          return 'xs';
        case 'sm':
          return 'sm';
        case 'lg':
        case 'xl':
          return 'lg';
        default:
          return 'md';
      }
    };

    // Enhanced classes for micro-interactions
    const enhancedClasses = cn(
      buttonVariants({ variant, size, fullWidth }),
      {
        'animate-bounce-in': animate,
        'animate-pulse-glow': pulse,
        'hover:shadow-xl hover:shadow-blue-500/25': glow,
        'animate-shimmer': loading,
      },
      className
    );

    return (
      <button
        className={enhancedClasses}
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-describedby={loading && loadingText ? 'button-loading-text' : undefined}
        {...props}
      >
        {/* Loading state */}
        {loading && (
          <>
            <Spinner size={getSpinnerSize(size)} />
            {loadingText && (
              <span id="button-loading-text" className="sr-only">
                {loadingText}
              </span>
            )}
          </>
        )}

        {/* Left icon */}
        {!loading && leftIcon && (
          <IconWrapper size={size || 'md'}>{leftIcon}</IconWrapper>
        )}

        {/* Button content */}
        {children && (
          <span className={cn(loading && 'opacity-70')}>{children}</span>
        )}

        {/* Right icon */}
        {!loading && rightIcon && (
          <IconWrapper size={size || 'md'}>{rightIcon}</IconWrapper>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Export button variants for external use
export { buttonVariants };

// Export common button groups for consistency
export const ButtonGroup = ({
  children,
  className,
  orientation = 'horizontal',
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'inline-flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        '[&>*:not(:first-child)]:ml-[-1px]',
        '[&>*:first-child]:rounded-r-none',
        '[&>*:last-child]:rounded-l-none',
        '[&>*:not(:first-child):not(:last-child)]:rounded-none',
        orientation === 'vertical' && [
          'flex-col',
          '[&>*:not(:first-child)]:ml-0',
          '[&>*:not(:first-child)]:mt-[-1px]',
          '[&>*:first-child]:rounded-b-none',
          '[&>*:first-child]:rounded-r-md',
          '[&>*:last-child]:rounded-t-none',
          '[&>*:last-child]:rounded-l-md',
          '[&>*:not(:first-child):not(:last-child)]:rounded-none',
        ],
        className
      )}
      role="group"
      {...props}
    >
      {children}
    </div>
  );
};

ButtonGroup.displayName = 'ButtonGroup'; 