import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Card variants using class-variance-authority
const cardVariants = cva(
  [
    'bg-white',
    'rounded-lg',
    'transition-all',
    'duration-200',
    'border',
    'overflow-hidden',
  ],
  {
    variants: {
      variant: {
        // Default card with subtle shadow
        default: [
          'border-gray-200',
          'shadow-sm',
          'hover:shadow-md',
        ],
        // Elevated card with prominent shadow
        elevated: [
          'border-gray-200',
          'shadow-md',
          'hover:shadow-lg',
        ],
        // Outlined card with border emphasis
        outlined: [
          'border-2',
          'border-gray-300',
          'shadow-none',
          'hover:border-gray-400',
        ],
        // Interactive card for clickable elements
        interactive: [
          'border-gray-200',
          'shadow-sm',
          'hover:shadow-lg',
          'hover:border-primary-300',
          'cursor-pointer',
          'transform',
          'hover:scale-[1.02]',
          'active:scale-[0.98]',
        ],
        // Success themed card
        success: [
          'border-green-200',
          'bg-green-50',
          'shadow-sm',
          'hover:shadow-md',
        ],
        // Warning themed card
        warning: [
          'border-yellow-200',
          'bg-yellow-50',
          'shadow-sm',
          'hover:shadow-md',
        ],
        // Error themed card
        error: [
          'border-red-200',
          'bg-red-50',
          'shadow-sm',
          'hover:shadow-md',
        ],
        // Primary sustainability themed card
        primary: [
          'border-primary-200',
          'bg-primary-50',
          'shadow-sm',
          'hover:shadow-md',
        ],
      },
      size: {
        sm: ['p-4'],
        md: ['p-6'],
        lg: ['p-8'],
        xl: ['p-10'],
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      fullWidth: false,
    },
  }
);

// Card header variants
const cardHeaderVariants = cva(
  [
    'flex',
    'items-center',
    'justify-between',
    'border-b',
    'border-gray-200',
  ],
  {
    variants: {
      size: {
        sm: ['px-4', 'py-3'],
        md: ['px-6', 'py-4'],
        lg: ['px-8', 'py-5'],
        xl: ['px-10', 'py-6'],
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

// Card footer variants
const cardFooterVariants = cva(
  [
    'flex',
    'items-center',
    'justify-between',
    'border-t',
    'border-gray-200',
    'bg-gray-50',
  ],
  {
    variants: {
      size: {
        sm: ['px-4', 'py-3'],
        md: ['px-6', 'py-4'],
        lg: ['px-8', 'py-5'],
        xl: ['px-10', 'py-6'],
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

// Card content variants (for when no header/footer)
const cardContentVariants = cva([], {
  variants: {
    size: {
      sm: ['p-4'],
      md: ['p-6'],
      lg: ['p-8'],
      xl: ['p-10'],
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

// Base card interface
export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /**
   * Content to display inside the card
   */
  children?: React.ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Whether the card is clickable (adds interactive styling)
   */
  clickable?: boolean;
  /**
   * Optional loading state
   */
  loading?: boolean;
}

// Card header interface
export interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardHeaderVariants> {
  /**
   * Title of the card
   */
  title?: string;
  /**
   * Subtitle or description
   */
  subtitle?: string;
  /**
   * Actions to display on the right side
   */
  actions?: React.ReactNode;
  /**
   * Content to display (overrides title/subtitle)
   */
  children?: React.ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
}

// Card footer interface
export interface CardFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardFooterVariants> {
  /**
   * Content to display
   */
  children?: React.ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
}

// Card content interface
export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardContentVariants> {
  /**
   * Content to display
   */
  children?: React.ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
}

// Loading skeleton component
const CardSkeleton = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const heights = {
    sm: 'h-16',
    md: 'h-20',
    lg: 'h-24',
    xl: 'h-28',
  };

  return (
    <div className={cn('animate-pulse space-y-3', cardContentVariants({ size }))}>
      <div className={cn('bg-gray-200 rounded', heights[size])}></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );
};

/**
 * Card Component
 * 
 * A flexible, accessible card component with multiple variants, sizes,
 * and optional header/footer sections. Built with sustainability design principles.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <Card>
 *   <CardContent>
 *     Your content here
 *   </CardContent>
 * </Card>
 * 
 * // With header and footer
 * <Card variant="elevated" size="lg">
 *   <CardHeader title="Energy Report" subtitle="Last 30 days" />
 *   <CardContent>
 *     Your energy usage data here
 *   </CardContent>
 *   <CardFooter>
 *     <Button>View Details</Button>
 *   </CardFooter>
 * </Card>
 * 
 * // Interactive card
 * <Card variant="interactive" onClick={handleClick}>
 *   <CardContent>
 *     Click me!
 *   </CardContent>
 * </Card>
 * ```
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      clickable = false,
      loading = false,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    // Use interactive variant if clickable and no specific variant provided
    const finalVariant = clickable && !variant ? 'interactive' : variant;
    
    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant: finalVariant, size, fullWidth }),
          clickable && 'cursor-pointer',
          className
        )}
        onClick={onClick}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        onKeyDown={clickable ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.(e as any);
          }
        } : undefined}
        {...props}
      >
        {loading ? <CardSkeleton size={size} /> : children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * CardHeader Component
 * 
 * Header section for cards with title, subtitle, and actions.
 */
export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  (
    {
      className,
      size,
      title,
      subtitle,
      actions,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(cardHeaderVariants({ size }), className)}
        {...props}
      >
        {children || (
          <>
            <div className="min-w-0 flex-1">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500 truncate">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="ml-4 flex-shrink-0">
                {actions}
              </div>
            )}
          </>
        )}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

/**
 * CardContent Component
 * 
 * Main content area for cards.
 */
export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  (
    {
      className,
      size,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(cardContentVariants({ size }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

/**
 * CardFooter Component
 * 
 * Footer section for cards with actions or additional information.
 */
export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  (
    {
      className,
      size,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(cardFooterVariants({ size }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

// Export card variants for external use
export { cardVariants, cardHeaderVariants, cardFooterVariants, cardContentVariants };

// Card group component for consistent spacing
export const CardGrid = ({
  children,
  className,
  columns = 'auto',
  gap = 'md',
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  columns?: 'auto' | 1 | 2 | 3 | 4 | 6;
  gap?: 'sm' | 'md' | 'lg';
} & React.HTMLAttributes<HTMLDivElement>) => {
  const columnClasses = {
    auto: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  };

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };

  return (
    <div
      className={cn(
        'grid',
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

CardGrid.displayName = 'CardGrid'; 