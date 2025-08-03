'use client';

import React, { useMemo } from 'react';
import { Card, CardContent } from '../../../components/ui';
import { cn } from '../../../lib/utils';
import type { DashboardData } from '../../hooks/useDashboardData';
import { ImplementationStats, formatCurrency, formatCo2 } from '../implementation';

// KPI data interfaces
interface KPIMetric {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  change?: {
    value: number;
    period: string;
    trend: 'up' | 'down' | 'neutral';
  };
  target?: {
    value: number;
    progress: number; // percentage
  };
  status: 'good' | 'warning' | 'danger' | 'neutral';
  icon: React.ReactNode;
  description?: string;
}

interface KPICardsProps {
  data: DashboardData;
  implementationStats?: ImplementationStats | null;
  className?: string;
}

// Memoized icons to prevent re-creation on every render
const CostIcon = React.memo(() => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
));

const ElectricityIcon = React.memo(() => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
));

const CarbonIcon = React.memo(() => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
));

const GoalIcon = React.memo(() => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
));

const ImplementationIcon = React.memo(() => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
));

const SavingsIcon = React.memo(() => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
));

const ROIIcon = React.memo(() => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
));

// Display names for better debugging
CostIcon.displayName = 'CostIcon';
ElectricityIcon.displayName = 'ElectricityIcon';
CarbonIcon.displayName = 'CarbonIcon';
GoalIcon.displayName = 'GoalIcon';
ImplementationIcon.displayName = 'ImplementationIcon';
SavingsIcon.displayName = 'SavingsIcon';
ROIIcon.displayName = 'ROIIcon';

// Memoized KPI metric calculation function
const useKpiMetrics = (data: DashboardData, implementationStats?: ImplementationStats | null): KPIMetric[] => {
  return useMemo(() => {
    const { energyData, carbonFootprint, goals } = data;

    const energyCostChange = energyData.previousMonth.totalCost > 0
      ? ((energyData.currentMonth.totalCost - energyData.previousMonth.totalCost) / energyData.previousMonth.totalCost) * 100
      : 0;

    const electricityChange = energyData.previousMonth.electricity > 0
      ? ((energyData.currentMonth.electricity - energyData.previousMonth.electricity) / energyData.previousMonth.electricity) * 100
      : 0;

    return [
      {
        id: 'energy-cost',
        title: 'Monthly Energy Cost',
        value: energyData.currentMonth.totalCost,
        unit: 'USD',
        change: {
          value: Math.round(energyCostChange),
          period: 'vs last month',
          trend: energyCostChange > 0 ? 'up' : 'down'
        },
        status: energyCostChange > 5 ? 'danger' : energyCostChange > 0 ? 'warning' : 'good',
        icon: <CostIcon />,
        description: 'Total electricity and gas costs'
      },
      {
        id: 'electricity-usage',
        title: 'Electricity Usage',
        value: energyData.currentMonth.electricity,
        unit: 'kWh',
        change: {
          value: Math.round(electricityChange),
          period: 'vs last month',
          trend: electricityChange > 0 ? 'up' : 'down'
        },
        status: electricityChange > 5 ? 'danger' : electricityChange > 0 ? 'warning' : 'good',
        icon: <ElectricityIcon />,
        description: 'Monthly electricity consumption'
      },
      {
        id: 'carbon-footprint',
        title: 'Carbon Footprint',
        value: carbonFootprint.currentEmissions,
        unit: 'tons CO₂e',
        change: {
          value: carbonFootprint.reduction,
          period: 'vs baseline',
          trend: 'down'
        },
        status: carbonFootprint.reduction > 10 ? 'good' : 'warning',
        icon: <CarbonIcon />,
        description: 'Current monthly emissions'
      },
      {
        id: 'goal-progress',
        title: 'Goal Progress',
        value: goals.progress,
        unit: '%',
        target: {
          value: goals.targetReduction,
          progress: goals.progress
        },
        status: goals.progress > 75 ? 'good' : goals.progress > 50 ? 'warning' : 'danger',
        icon: <GoalIcon />,
        description: 'Progress toward sustainability targets'
      },
      // Implementation-related KPIs (conditionally included)
      ...(implementationStats ? [
        {
          id: 'total-implementations',
          title: 'Active Implementations',
          value: implementationStats.totalImplementations,
          unit: 'projects',
          change: {
            value: implementationStats.completedImplementations,
            period: 'completed',
            trend: 'neutral' as const
          },
          status: (implementationStats.inProgressImplementations > 0 ? 'good' : 'neutral') as 'good' | 'warning' | 'danger' | 'neutral',
          icon: <ImplementationIcon />,
          description: 'Total sustainability implementations in progress'
        },
        {
          id: 'implementation-savings',
          title: 'Implementation Savings',
          value: implementationStats.completedSavings,
          unit: 'USD',
          change: {
            value: Math.round(implementationStats.completedCo2Reduction * 100) / 100,
            period: 'tons CO₂ reduced',
            trend: 'down' as const
          },
          status: (implementationStats.completedSavings > 1000 ? 'good' : implementationStats.completedSavings > 0 ? 'warning' : 'neutral') as 'good' | 'warning' | 'danger' | 'neutral',
          icon: <SavingsIcon />,
          description: 'Total cost savings from completed implementations'
        },
        {
          id: 'implementation-roi',
          title: 'Implementation ROI',
          value: implementationStats.completedSavings > 0 ? 
            Math.round((implementationStats.completedSavings / Math.max(implementationStats.completedSavings * 0.2, 100)) * 100) : 0,
          unit: '%',
          target: {
            value: 300, // 300% ROI target
            progress: implementationStats.completedSavings > 0 ? 
              Math.min(100, (implementationStats.completedSavings / Math.max(implementationStats.completedSavings * 0.2, 100)) * 100 / 3) : 0
          },
          status: (implementationStats.completedSavings > 0 ? 'good' : 'neutral') as 'good' | 'warning' | 'danger' | 'neutral',
          icon: <ROIIcon />,
          description: 'Return on investment from sustainability implementations'
        }
      ] : [])
    ];
  }, [data, implementationStats]);
};

// Memoized status variant styles
const statusVariants = {
  good: {
    card: 'border-green-200 bg-green-50/50 hover:bg-green-50',
    icon: 'text-green-600 bg-green-100',
    value: 'text-green-600',
    change: 'text-green-600'
  },
  warning: {
    card: 'border-amber-200 bg-amber-50/50 hover:bg-amber-50',
    icon: 'text-amber-600 bg-amber-100',
    value: 'text-amber-600',
    change: 'text-amber-600'
  },
  danger: {
    card: 'border-red-200 bg-red-50/50 hover:bg-red-50',
    icon: 'text-red-600 bg-red-100',
    value: 'text-red-600',
    change: 'text-red-600'
  },
  neutral: {
    card: 'border-gray-200 bg-gray-50/50 hover:bg-gray-50',
    icon: 'text-gray-600 bg-gray-100',
    value: 'text-gray-600',
    change: 'text-gray-600'
  }
} as const;

// Memoized trend icons
const TrendUpIcon = React.memo(() => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7M17 7H7" />
  </svg>
));

const TrendDownIcon = React.memo(() => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10M7 7h10" />
  </svg>
));

TrendUpIcon.displayName = 'TrendUpIcon';
TrendDownIcon.displayName = 'TrendDownIcon';

// Memoized KPI Card component
const KPICard = React.memo<{ metric: KPIMetric; className?: string }>(({ metric, className }) => {
  const variants = statusVariants[metric.status];
  
  // Memoize the formatted value to prevent recalculation
  const formattedValue = useMemo(() => {
    if (typeof metric.value === 'number') {
      return metric.value.toLocaleString('en-US', {
        maximumFractionDigits: metric.unit === 'tons CO₂e' ? 1 : 0
      });
    }
    return metric.value;
  }, [metric.value, metric.unit]);

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-200 hover:shadow-md border',
      variants.card,
      className
    )}>
      <CardContent className="p-4 sm:p-6">
        {/* Header with Icon and Title */}
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2 sm:p-2.5 rounded-lg transition-colors',
              variants.icon
            )}>
              {metric.icon}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                {metric.title}
              </h3>
              {metric.description && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {metric.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Value and Unit */}
        <div className="mb-3">
          <div className="flex items-baseline gap-1">
            <span className={cn(
              'text-2xl sm:text-3xl font-bold tracking-tight',
              variants.value
            )}>
              {formattedValue}
            </span>
            {metric.unit && (
              <span className="text-sm sm:text-base text-gray-500 font-medium">
                {metric.unit}
              </span>
            )}
          </div>
        </div>

        {/* Change Indicator */}
        {metric.change && (
          <div className="flex items-center gap-1.5 text-sm">
            <div className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full',
              metric.change.trend === 'up' ? 'bg-red-100' : 'bg-green-100'
            )}>
              {metric.change.trend === 'up' ? <TrendUpIcon /> : <TrendDownIcon />}
              <span className={cn(
                'font-medium text-xs',
                metric.change.trend === 'up' ? 'text-red-600' : 'text-green-600'
              )}>
                {Math.abs(metric.change.value)}%
              </span>
            </div>
            <span className="text-gray-500 text-xs">
              {metric.change.period}
            </span>
          </div>
        )}

        {/* Target Progress Bar */}
        {metric.target && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>Target: {metric.target.value}%</span>
              <span>{metric.target.progress}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={cn(
                  'h-2 rounded-full transition-all duration-500',
                  metric.status === 'good' ? 'bg-green-500' : 
                  metric.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                )}
                style={{ width: `${Math.min(100, metric.target.progress)}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

KPICard.displayName = 'KPICard';

/**
 * KPI Cards Component - Mobile-First Design
 * 
 * Displays key performance indicators with enhanced mobile experience:
 * - Touch-friendly 44px+ targets on mobile
 * - Responsive typography and spacing
 * - Staggered animations and advanced hover effects
 * - Interactive micro-interactions
 */
export const KPICards = React.memo<KPICardsProps>(({ data, implementationStats, className }) => {
  const metrics = useKpiMetrics(data, implementationStats);

  return (
    <div className={cn(
      'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6',
      className
    )}>
      {metrics.map((metric, index) => (
        <div
          key={metric.id}
          className="animate-fade-in-up"
          style={{
            animationDelay: `${index * 100}ms`,
            animationFillMode: 'both'
          }}
        >
          <KPICard metric={metric} />
        </div>
      ))}
    </div>
  );
});

KPICards.displayName = 'KPICards'; 