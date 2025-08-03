'use client';

import React, { useMemo } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Chart container variants
const chartVariants = cva(
  [
    'w-full',
    'rounded-lg',
    'border',
    'bg-white',
    'overflow-hidden',
  ],
  {
    variants: {
      variant: {
        default: [
          'border-gray-200',
          'shadow-sm',
        ],
        elevated: [
          'border-gray-200',
          'shadow-md',
        ],
        outlined: [
          'border-2',
          'border-gray-300',
          'shadow-none',
        ],
        primary: [
          'border-primary-200',
          'bg-primary-50',
          'shadow-sm',
        ],
      },
      size: {
        sm: ['h-48'],
        md: ['h-64'],
        lg: ['h-80'],
        xl: ['h-96'],
      },
      padding: {
        none: ['p-0'],
        sm: ['p-2'],
        md: ['p-4'],
        lg: ['p-6'],
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      padding: 'md',
    },
  }
);

// Memoized sustainability color palette for charts
const SUSTAINABILITY_COLORS = {
  primary: '#22c55e', // green-500
  secondary: '#06b6d4', // cyan-500
  tertiary: '#84cc16', // lime-500
  quaternary: '#10b981', // emerald-500
  warning: '#f59e0b', // amber-500
  error: '#ef4444', // red-500
  neutral: '#6b7280', // gray-500
  success: '#16a34a', // green-600
} as const;

const DEFAULT_COLORS = [
  SUSTAINABILITY_COLORS.primary,
  SUSTAINABILITY_COLORS.secondary,
  SUSTAINABILITY_COLORS.tertiary,
  SUSTAINABILITY_COLORS.quaternary,
  SUSTAINABILITY_COLORS.warning,
  SUSTAINABILITY_COLORS.error,
] as const;

// Chart data interfaces
export interface ChartDataPoint {
  [key: string]: string | number;
}

export interface ChartSeries {
  dataKey: string;
  name?: string;
  color?: string;
  strokeWidth?: number;
  fill?: string;
  stroke?: string;
}

// Base chart props
export interface BaseChartProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chartVariants> {
  /**
   * Chart data array
   */
  data: ChartDataPoint[];
  /**
   * Chart title
   */
  title?: string;
  /**
   * Chart subtitle or description
   */
  subtitle?: string;
  /**
   * Data series configuration
   */
  series: ChartSeries[];
  /**
   * X-axis data key
   */
  xAxisKey?: string;
  /**
   * Show grid lines
   */
  showGrid?: boolean;
  /**
   * Show tooltip
   */
  showTooltip?: boolean;
  /**
   * Show legend
   */
  showLegend?: boolean;
  /**
   * Custom colors array
   */
  colors?: string[];
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

// Specific chart type props
export interface LineChartProps extends BaseChartProps {
  type: 'line';
  /**
   * Line curve type
   */
  curve?: 'linear' | 'natural' | 'monotone' | 'step';
  /**
   * Show data points
   */
  showPoints?: boolean;
}

export interface AreaChartProps extends BaseChartProps {
  type: 'area';
  /**
   * Area curve type
   */
  curve?: 'linear' | 'natural' | 'monotone' | 'step';
  /**
   * Stack areas
   */
  stacked?: boolean;
}

export interface BarChartProps extends BaseChartProps {
  type: 'bar';
  /**
   * Stack bars
   */
  stacked?: boolean;
  /**
   * Bar layout orientation
   */
  layout?: 'horizontal' | 'vertical';
}

export interface PieChartProps extends Omit<BaseChartProps, 'xAxisKey' | 'showGrid'> {
  type: 'pie';
  /**
   * Data key for values
   */
  valueKey: string;
  /**
   * Data key for labels
   */
  labelKey: string;
  /**
   * Show labels on pie slices
   */
  showLabels?: boolean;
  /**
   * Inner radius for donut chart
   */
  innerRadius?: number;
}

// Union type for all chart props
export type ChartProps = LineChartProps | AreaChartProps | BarChartProps | PieChartProps;

// Chart skeleton component
const ChartSkeleton = React.memo<{ size?: 'sm' | 'md' | 'lg' | 'xl' }>(({ size = 'md' }) => {
  const heights = { sm: 'h-48', md: 'h-64', lg: 'h-80', xl: 'h-96' };
  return (
    <div className={cn('animate-pulse bg-gray-200 rounded-lg', heights[size])}>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        <div className="h-3 bg-gray-300 rounded w-1/6"></div>
        <div className="space-y-2 pt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-6 bg-gray-300 rounded" style={{ width: `${Math.random() * 50 + 30}%` }}></div>
          ))}
        </div>
      </div>
    </div>
  );
});

ChartSkeleton.displayName = 'ChartSkeleton';

// Chart header component
const ChartHeader = React.memo<{ title?: string; subtitle?: string }>(({ title, subtitle }) => {
  if (!title && !subtitle) return null;

  return (
    <div className="p-4 border-b border-gray-200">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      )}
      {subtitle && (
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
});

ChartHeader.displayName = 'ChartHeader';

// Custom tooltip component
const CustomTooltip = React.memo<any>(({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
});

CustomTooltip.displayName = 'CustomTooltip';

/**
 * Chart Component
 * 
 * A comprehensive, accessible chart component wrapper around Recharts with multiple
 * chart types, sustainability theming, and consistent styling.
 * 
 * @example
 * ```tsx
 * // Line chart
 * <Chart
 *   type="line"
 *   data={energyData}
 *   series={[{ dataKey: 'usage', name: 'Energy Usage', color: '#22c55e' }]}
 *   xAxisKey="month"
 *   title="Energy Usage Trend"
 *   subtitle="Last 12 months"
 * />
 * 
 * // Pie chart
 * <Chart
 *   type="pie"
 *   data={emissionsData}
 *   series={[]}
 *   valueKey="value"
 *   labelKey="source"
 *   title="Emissions by Source"
 * />
 * ```
 */
export const Chart = React.memo(React.forwardRef<HTMLDivElement, ChartProps>((props, ref) => {
  const {
    // Container props
    className,
    variant,
    size,
    padding,
    // Custom logic props
    loading,
    title,
    subtitle,
    data,
    series,
    colors = DEFAULT_COLORS,
    // Chart-type specific props are captured here but handled inside renderChart
    // The rest are valid div props
    ...rest
  } = props;

  // Validate data
  const isValidData = useMemo(() => {
    return Array.isArray(data) && data.length > 0 && data.every(item => 
      typeof item === 'object' && item !== null
    );
  }, [data]);

  // Memoize configuration values to prevent recalculation
  const chartConfig = useMemo(() => ({
    showGrid: 'showGrid' in props ? props.showGrid : true,
    showTooltip: 'showTooltip' in props ? props.showTooltip : true,
    showLegend: 'showLegend' in props ? props.showLegend : true,
  }), [props]);

  // Memoize color mapping for series
  const seriesWithColors = useMemo(() => {
    return series.map((s, index) => ({
      ...s,
      color: s.color || colors[index % colors.length]
    }));
  }, [series, colors]);

  // Memoize chart rendering logic
  const renderChart = useMemo(() => {
    if (!isValidData) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <div className="text-lg font-medium mb-2">No Data Available</div>
            <div className="text-sm">Please provide valid chart data</div>
          </div>
        </div>
      );
    }

    switch (props.type) {
      case 'line':
        return (
          <LineChart data={data}>
            {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />}
            <XAxis 
              dataKey={props.xAxisKey || 'name'} 
              stroke="#6b7280"
              fontSize={12}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              stroke="#6b7280" 
              fontSize={12}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            {chartConfig.showTooltip && <Tooltip content={<CustomTooltip />} />}
            {chartConfig.showLegend && <Legend />}
            {seriesWithColors.map((s, index) => (
              <Line
                key={s.dataKey}
                type={props.curve || 'monotone'}
                dataKey={s.dataKey}
                stroke={s.color}
                strokeWidth={s.strokeWidth || 2}
                name={s.name || s.dataKey}
                dot={props.showPoints !== false}
                activeDot={{ r: 4, fill: s.color }}
              />
            ))}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />}
            <XAxis 
              dataKey={props.xAxisKey || 'name'} 
              stroke="#6b7280"
              fontSize={12}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              stroke="#6b7280" 
              fontSize={12}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            {chartConfig.showTooltip && <Tooltip content={<CustomTooltip />} />}
            {chartConfig.showLegend && <Legend />}
            {seriesWithColors.map((s, index) => (
              <Area
                key={s.dataKey}
                type={props.curve || 'monotone'}
                dataKey={s.dataKey}
                stackId={props.stacked ? '1' : undefined}
                stroke={s.stroke || s.color}
                fill={s.fill || s.color}
                fillOpacity={0.6}
                name={s.name || s.dataKey}
              />
            ))}
          </AreaChart>
        );

      case 'bar':
        const isHorizontal = props.layout === 'horizontal';
        return (
          <BarChart 
            data={data}
            layout={isHorizontal ? 'horizontal' : undefined}
          >
            {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />}
            {isHorizontal ? (
              <>
                <XAxis 
                  type="number"
                  stroke="#6b7280"
                  fontSize={12}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  type="category"
                  dataKey={props.xAxisKey || 'name'} 
                  stroke="#6b7280"
                  fontSize={12}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  width={100}
                />
              </>
            ) : (
              <>
                <XAxis 
                  dataKey={props.xAxisKey || 'name'} 
                  stroke="#6b7280"
                  fontSize={12}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
              </>
            )}
            {chartConfig.showTooltip && <Tooltip content={<CustomTooltip />} />}
            {chartConfig.showLegend && <Legend />}
            {seriesWithColors.map((s, index) => (
              <Bar
                key={s.dataKey}
                dataKey={s.dataKey}
                stackId={props.stacked ? '1' : undefined}
                fill={s.fill || s.color}
                name={s.name || s.dataKey}
                radius={[2, 2, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={props.showLabels ? (entry) => entry[props.labelKey] : false}
              outerRadius="70%"
              innerRadius={props.innerRadius || 0}
              fill="#8884d8"
              dataKey={props.valueKey}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            {chartConfig.showTooltip && <Tooltip content={<CustomTooltip />} />}
            {chartConfig.showLegend && <Legend />}
          </PieChart>
        );

      default:
        return <div className="text-center text-gray-500">Unsupported chart type</div>;
    }
  }, [props, data, seriesWithColors, chartConfig, colors, isValidData]);

  // Memoize filtered div props
  const divProps = useMemo(() => {
    const chartSpecificProps = ['type', 'xAxisKey', 'curve', 'showPoints', 'stacked', 'layout', 'valueKey', 'labelKey', 'showLabels', 'innerRadius', 'showGrid', 'showTooltip', 'showLegend'];
    return Object.fromEntries(
      Object.entries(rest).filter(([key]) => !chartSpecificProps.includes(key))
    );
  }, [rest]);

  if (loading) {
    return (
      <div
        ref={ref}
        className={cn(chartVariants({ variant, size, padding }), className)}
      >
        <ChartSkeleton size={size} />
      </div>
    );
  }
    
  return (
    <div
      ref={ref}
      className={cn(chartVariants({ variant, size, padding }), className)}
      {...divProps}
    >
      <ChartHeader title={title} subtitle={subtitle} />
      <div className={cn('relative', title || subtitle ? 'h-[calc(100%-4rem)]' : 'h-full')}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart}
        </ResponsiveContainer>
      </div>
    </div>
  );
}));

Chart.displayName = 'Chart';

// Chart presets for common sustainability chart configurations
export const SustainabilityChartPresets = {
  energyUsage: {
    colors: [SUSTAINABILITY_COLORS.primary, SUSTAINABILITY_COLORS.secondary],
    type: 'line' as const,
    showPoints: true,
    curve: 'monotone' as const,
  },
  emissions: {
    colors: [SUSTAINABILITY_COLORS.warning, SUSTAINABILITY_COLORS.error],
    type: 'area' as const,
    stacked: true,
  },
  breakdown: {
    colors: Object.values(SUSTAINABILITY_COLORS),
    type: 'pie' as const,
    showLabels: false,
  },
  progress: {
    colors: [SUSTAINABILITY_COLORS.success, SUSTAINABILITY_COLORS.neutral],
    type: 'bar' as const,
    layout: 'horizontal' as const,
  },
} as const;

// Utility function to format chart data
export const formatChartData = (data: any[], xKey: string, yKeys: string[]) => {
  return data.map(item => {
    const formatted: ChartDataPoint = { [xKey]: item[xKey] };
    yKeys.forEach(key => {
      formatted[key] = typeof item[key] === 'number' ? item[key] : 0;
    });
    return formatted;
  });
};

// Export chart variants and colors for external use
export { chartVariants, SUSTAINABILITY_COLORS, DEFAULT_COLORS }; 