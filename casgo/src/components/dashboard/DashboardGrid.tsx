'use client';

import React from 'react';
import { cn } from '../../../lib/utils';

// Grid layout configuration
interface GridConfig {
  columns: {
    mobile: number;
    tablet: number;
    desktop: number;
    wide: number;
  };
  gap: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  aspectRatio?: 'auto' | 'square' | 'video' | 'wide';
}

// Widget size configuration
type WidgetSize = 'small' | 'medium' | 'large' | 'xl';

// Widget span configuration for different screen sizes
interface WidgetSpan {
  mobile?: number;
  tablet?: number;
  desktop?: number;
  wide?: number;
}

// Dashboard widget interface
interface DashboardWidget {
  id: string;
  title: string;
  size: WidgetSize;
  span?: WidgetSpan;
  priority?: 'high' | 'medium' | 'low';
  component: React.ReactNode;
  loading?: boolean;
  error?: string;
  refreshable?: boolean;
  onRefresh?: () => void;
  className?: string;
}

// Dashboard grid props
interface DashboardGridProps {
  /**
   * Array of dashboard widgets to render
   */
  widgets: DashboardWidget[];
  /**
   * Grid layout configuration
   */
  layout?: 'auto' | 'compact' | 'spacious' | 'custom';
  /**
   * Custom grid configuration (for layout="custom")
   */
  gridConfig?: Partial<GridConfig>;
  /**
   * Whether to enable drag and drop reordering
   */
  reorderable?: boolean;
  /**
   * Loading state for the entire grid
   */
  loading?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Callback when widgets are reordered
   */
  onReorder?: (widgets: DashboardWidget[]) => void;
}

// Predefined layout configurations
const LAYOUT_CONFIGS: Record<string, GridConfig> = {
  auto: {
    columns: { mobile: 1, tablet: 2, desktop: 3, wide: 4 },
    gap: { mobile: 'gap-4', tablet: 'gap-6', desktop: 'gap-6' },
    aspectRatio: 'auto'
  },
  compact: {
    columns: { mobile: 1, tablet: 2, desktop: 4, wide: 6 },
    gap: { mobile: 'gap-3', tablet: 'gap-4', desktop: 'gap-4' },
    aspectRatio: 'square'
  },
  spacious: {
    columns: { mobile: 1, tablet: 2, desktop: 2, wide: 3 },
    gap: { mobile: 'gap-6', tablet: 'gap-8', desktop: 'gap-8' },
    aspectRatio: 'auto'
  }
};

// Widget size to span mapping
const WIDGET_SPANS: Record<WidgetSize, WidgetSpan> = {
  small: { mobile: 1, tablet: 1, desktop: 1, wide: 1 },
  medium: { mobile: 1, tablet: 1, desktop: 1, wide: 1 },
  large: { mobile: 1, tablet: 2, desktop: 2, wide: 2 },
  xl: { mobile: 1, tablet: 2, desktop: 3, wide: 3 }
};

/**
 * Widget Container Component
 * 
 * Wraps individual dashboard widgets with proper spacing and styling
 */
const WidgetContainer = ({ 
  widget, 
  span,
  className 
}: { 
  widget: DashboardWidget; 
  span: WidgetSpan;
  className?: string;
}) => {
  const spanClasses = cn(
    // Mobile spans
    `col-span-${span.mobile || 1}`,
    // Tablet spans
    span.tablet && `md:col-span-${span.tablet}`,
    // Desktop spans
    span.desktop && `lg:col-span-${span.desktop}`,
    // Wide spans
    span.wide && `xl:col-span-${span.wide}`
  );

  return (
    <div
      className={cn(
        'dashboard-widget',
        spanClasses,
        widget.priority === 'high' && 'order-first',
        widget.priority === 'low' && 'order-last',
        widget.className,
        className
      )}
      data-widget-id={widget.id}
      data-widget-size={widget.size}
    >
      <div className="h-full">
        {widget.loading ? (
          <WidgetSkeleton size={widget.size} />
        ) : widget.error ? (
          <WidgetError 
            message={widget.error} 
            onRetry={widget.onRefresh}
            title={widget.title}
          />
        ) : (
          widget.component
        )}
      </div>
    </div>
  );
};

/**
 * Widget Loading Skeleton Component
 */
const WidgetSkeleton = ({ size }: { size: WidgetSize }) => {
  const heights = {
    small: 'h-32',
    medium: 'h-40',
    large: 'h-56',
    xl: 'h-72'
  };

  return (
    <div className={cn(
      'bg-white rounded-lg border border-gray-200 p-6 animate-pulse',
      heights[size]
    )}>
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );
};

/**
 * Widget Error Component
 */
const WidgetError = ({ 
  message, 
  onRetry, 
  title 
}: { 
  message: string; 
  onRetry?: () => void;
  title: string;
}) => {
  return (
    <div className="bg-white rounded-lg border border-red-200 p-6 h-full flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Grid Loading Component
 */
const GridLoading = ({ layout }: { layout: string }) => {
  const config = LAYOUT_CONFIGS[layout] || LAYOUT_CONFIGS.auto;
  const skeletonCount = config.columns.desktop * 2; // Show 2 rows worth of skeletons

  return (
    <div className={cn(
      'grid',
      `grid-cols-${config.columns.mobile}`,
      `md:grid-cols-${config.columns.tablet}`,
      `lg:grid-cols-${config.columns.desktop}`,
      `xl:grid-cols-${config.columns.wide}`,
      config.gap.mobile,
      `md:${config.gap.tablet}`,
      `lg:${config.gap.desktop}`
    )}>
      {Array.from({ length: skeletonCount }, (_, i) => (
        <WidgetSkeleton key={i} size="medium" />
      ))}
    </div>
  );
};

/**
 * Dashboard Grid Component
 * 
 * A flexible, responsive grid system for dashboard widgets with support for
 * different sizes, priorities, and custom layouts.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <DashboardGrid
 *   widgets={[
 *     {
 *       id: 'energy',
 *       title: 'Energy Usage',
 *       size: 'large',
 *       priority: 'high',
 *       component: <EnergyWidget />
 *     }
 *   ]}
 * />
 * 
 * // Custom layout
 * <DashboardGrid
 *   layout="custom"
 *   gridConfig={{
 *     columns: { mobile: 1, tablet: 2, desktop: 4, wide: 6 },
 *     gap: { mobile: 'gap-2', tablet: 'gap-4', desktop: 'gap-6' }
 *   }}
 *   widgets={widgets}
 * />
 * ```
 */
export const DashboardGrid: React.FC<DashboardGridProps> = ({
  widgets,
  layout = 'auto',
  gridConfig,
  reorderable = false,
  loading = false,
  className,
  onReorder
}) => {
  // Get grid configuration
  const config = layout === 'custom' && gridConfig 
    ? { ...LAYOUT_CONFIGS.auto, ...gridConfig }
    : LAYOUT_CONFIGS[layout] || LAYOUT_CONFIGS.auto;

  // Sort widgets by priority
  const sortedWidgets = [...widgets].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const aPriority = priorityOrder[a.priority || 'medium'];
    const bPriority = priorityOrder[b.priority || 'medium'];
    return aPriority - bPriority;
  });

  if (loading) {
    return <GridLoading layout={layout} />;
  }

  if (widgets.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </div>
        <p>No dashboard widgets configured</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'dashboard-grid',
        'grid',
        // Grid columns for different screen sizes
        `grid-cols-${config.columns.mobile}`,
        `md:grid-cols-${config.columns.tablet}`,
        `lg:grid-cols-${config.columns.desktop}`,
        `xl:grid-cols-${config.columns.wide}`,
        // Gap classes
        config.gap.mobile,
        `md:${config.gap.tablet}`,
        `lg:${config.gap.desktop}`,
        // Auto-fit items
        'auto-rows-min',
        className
      )}
      style={{
        gridAutoRows: config.aspectRatio === 'square' ? '1fr' : 'min-content'
      }}
    >
      {sortedWidgets.map((widget) => {
        const span = widget.span || WIDGET_SPANS[widget.size];
        
        return (
          <WidgetContainer
            key={widget.id}
            widget={widget}
            span={span}
          />
        );
      })}
    </div>
  );
};

DashboardGrid.displayName = 'DashboardGrid';

// Export types for external use
export type { 
  DashboardGridProps, 
  DashboardWidget, 
  GridConfig, 
  WidgetSize, 
  WidgetSpan 
}; 