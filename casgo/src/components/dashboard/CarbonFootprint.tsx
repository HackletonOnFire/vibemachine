'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent, Chart, SUSTAINABILITY_COLORS } from '../../../components/ui';
import { cn } from '../../../lib/utils';
import type { DashboardData } from '../../hooks/useDashboardData';

// Carbon footprint data interfaces
interface CarbonEmissionData {
  [key: string]: string | number | undefined; // Index signature for chart compatibility
  month: string;
  scope1: number; // Direct emissions (tons CO2e)
  scope2: number; // Indirect emissions from electricity (tons CO2e)
  scope3: number; // Other indirect emissions (tons CO2e)
  total: number; // Total emissions (tons CO2e)
  baseline: number; // Baseline emissions (tons CO2e)
  target: number; // Target emissions (tons CO2e)
}

interface EmissionSource {
  category: string;
  scope: 'Scope 1' | 'Scope 2' | 'Scope 3';
  emissions: number; // tons CO2e
  percentage: number;
  trend: number; // percentage change
  color: string;
}

interface CarbonReduction {
  initiative: string;
  reduction: number; // tons CO2e saved
  cost: number; // implementation cost USD
  status: 'completed' | 'in-progress' | 'planned';
  timeline: string;
}

interface CarbonFootprintProps {
  data: DashboardData['carbonFootprint'];
  loading?: boolean;
  className?: string;
}

// Helper to transform dashboard data
const transformDataForCharts = (carbonData: DashboardData['carbonFootprint']): CarbonEmissionData[] => {
  return carbonData.monthlyTrend.map(item => ({
    month: item.month,
    // Note: Scopes are simplified here. A real implementation would calculate these.
    scope1: item.emissions * 0.25,
    scope2: item.emissions * 0.6,
    scope3: item.emissions * 0.15,
    total: item.emissions,
    baseline: carbonData.baseline,
    target: carbonData.baseline * (1 - (carbonData.reduction / 100)) // Simplified target
  }));
};

// Mock emission sources
const mockEmissionSources: EmissionSource[] = [
  { category: 'Electricity Consumption', scope: 'Scope 2', emissions: 10.8, percentage: 58.4, trend: -12, color: SUSTAINABILITY_COLORS.error },
  { category: 'Natural Gas Heating', scope: 'Scope 1', emissions: 3.2, percentage: 17.3, trend: -8, color: SUSTAINABILITY_COLORS.warning },
  { category: 'Fleet Vehicles', scope: 'Scope 1', emissions: 1.2, percentage: 6.5, trend: -15, color: SUSTAINABILITY_COLORS.tertiary },
  { category: 'Business Travel', scope: 'Scope 3', emissions: 1.8, percentage: 9.7, trend: -22, color: SUSTAINABILITY_COLORS.secondary },
  { category: 'Supply Chain', scope: 'Scope 3', emissions: 1.5, percentage: 8.1, trend: -5, color: SUSTAINABILITY_COLORS.primary },
];

// Mock reduction initiatives
const mockReductions: CarbonReduction[] = [
  { initiative: 'Solar Panel Installation', reduction: 8.2, cost: 45000, status: 'completed', timeline: 'Q1 2024' },
  { initiative: 'LED Lighting Upgrade', reduction: 1.8, cost: 12000, status: 'completed', timeline: 'Q4 2023' },
  { initiative: 'Smart HVAC System', reduction: 2.4, cost: 28000, status: 'in-progress', timeline: 'Q2 2024' },
  { initiative: 'Electric Fleet Vehicles', reduction: 1.2, cost: 85000, status: 'planned', timeline: 'Q3 2024' },
  { initiative: 'Remote Work Policy', reduction: 1.6, cost: 0, status: 'completed', timeline: 'Q1 2024' },
];

/**
 * Carbon Emissions Trend Chart Component
 */
const CarbonTrendChart = ({ 
  data,
  showScopes = true,
  className 
}: { 
  data: CarbonEmissionData[];
  showScopes?: boolean;
  className?: string;
}) => {
  const [chartView, setChartView] = useState<'total' | 'scopes' | 'vs-target'>('total');

  const getChartData = () => {
    switch (chartView) {
      case 'scopes':
        return data;
      case 'vs-target':
        return data.map(item => ({
          month: item.month,
          actual: item.total,
          baseline: item.baseline,
          target: item.target
        }));
      default:
        return data.map(item => ({
          month: item.month,
          total: item.total,
          baseline: item.baseline
        }));
    }
  };

  const getSeries = () => {
    switch (chartView) {
      case 'scopes':
        return [
          { dataKey: 'scope1', name: 'Scope 1', color: SUSTAINABILITY_COLORS.error },
          { dataKey: 'scope2', name: 'Scope 2', color: SUSTAINABILITY_COLORS.warning },
          { dataKey: 'scope3', name: 'Scope 3', color: SUSTAINABILITY_COLORS.tertiary }
        ];
      case 'vs-target':
        return [
          { dataKey: 'actual', name: 'Actual Emissions', color: SUSTAINABILITY_COLORS.error },
          { dataKey: 'baseline', name: 'Baseline', color: SUSTAINABILITY_COLORS.neutral },
          { dataKey: 'target', name: 'Target', color: SUSTAINABILITY_COLORS.success }
        ];
      default:
        return [
          { dataKey: 'total', name: 'Total Emissions', color: SUSTAINABILITY_COLORS.error },
          { dataKey: 'baseline', name: 'Baseline', color: SUSTAINABILITY_COLORS.neutral }
        ];
    }
  };

  return (
    <Card className={cn('col-span-2', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Carbon Footprint Trend</h3>
            <p className="text-sm text-gray-500">Monthly CO₂e emissions tracking</p>
          </div>
          <div className="flex items-center space-x-2">
            {(['total', 'scopes', 'vs-target'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setChartView(view)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                  chartView === view
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {view === 'vs-target' ? 'vs Target' : view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Chart
          type="area"
          data={getChartData()}
          series={getSeries()}
          xAxisKey="month"
          title=""
          size="lg"
          stacked={chartView === 'scopes'}
          showGrid={true}
        />
      </CardContent>
    </Card>
  );
};

/**
 * Emission Sources Breakdown Component
 */
const EmissionSourcesChart = ({ 
  sources,
  className 
}: { 
  sources: EmissionSource[];
  className?: string;
}) => {
  const pieData = sources.map(source => ({
    name: source.category,
    value: source.emissions,
    scope: source.scope,
    percentage: source.percentage
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Emission Sources</h3>
        <p className="text-sm text-gray-500">Current month breakdown by source</p>
      </CardHeader>
      <CardContent>
        <Chart
          type="pie"
          data={pieData}
          series={[]}
          valueKey="value"
          labelKey="name"
          title=""
          size="md"
          showLabels={false}
          innerRadius={35}
          colors={sources.map(source => source.color)}
        />
        
        {/* Sources Legend */}
        <div className="mt-4 space-y-2">
          {sources.map((source, index) => (
            <div key={source.category} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: source.color }}
                />
                <div>
                  <span className="text-gray-700">{source.category}</span>
                  <span className="text-xs text-gray-500 ml-1">({source.scope})</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">{source.emissions} tons</div>
                <div className={cn(
                  'text-xs font-medium',
                  source.trend < 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {source.trend > 0 ? '+' : ''}{source.trend}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Carbon Reduction Initiatives Component
 */
const ReductionInitiatives = ({ 
  initiatives,
  className 
}: { 
  initiatives: CarbonReduction[];
  className?: string;
}) => {
  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    planned: 'bg-blue-100 text-blue-800'
  };

  const totalReduction = initiatives.reduce((sum, init) => sum + init.reduction, 0);
  const completedReduction = initiatives
    .filter(init => init.status === 'completed')
    .reduce((sum, init) => sum + init.reduction, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Reduction Initiatives</h3>
        <p className="text-sm text-gray-500">
          {completedReduction.toFixed(1)} / {totalReduction.toFixed(1)} tons CO₂e saved
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {initiatives.map((initiative, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">{initiative.initiative}</h4>
                <span className={cn(
                  'px-2 py-1 text-xs font-medium rounded-full',
                  statusColors[initiative.status]
                )}>
                  {initiative.status.replace('-', ' ')}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">CO₂e Reduction</p>
                  <p className="font-medium text-green-600">{initiative.reduction} tons</p>
                </div>
                <div>
                  <p className="text-gray-500">Investment</p>
                  <p className="font-medium">${initiative.cost.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Timeline</p>
                  <p className="font-medium">{initiative.timeline}</p>
                </div>
              </div>
              
              {/* ROI Calculation */}
              {initiative.cost > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  ROI: ${(initiative.reduction * 25 / (initiative.cost / 1000)).toFixed(1)}k per year
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Carbon Footprint Summary Stats Component
 */
const CarbonStatsSummary = ({ 
  data,
  targetReduction = 30,
  className 
}: { 
  data: CarbonEmissionData[];
  targetReduction?: number;
  className?: string;
}) => {
  if (!data || data.length === 0) {
    // Return a skeleton or null if there is no data to process
    return (
      <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4', className)}>
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="p-4 animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-2/3 mx-auto mb-2"></div>
            <div className="h-8 bg-gray-300 rounded w-1/2 mx-auto mb-1"></div>
            <div className="h-3 bg-gray-300 rounded w-1/3 mx-auto"></div>
          </Card>
        ))}
      </div>
    );
  }

  const currentMonth = data[data.length - 1];
  const firstMonth = data[0];
  const reductionAchieved = ((firstMonth.baseline - currentMonth.total) / firstMonth.baseline) * 100;
  const targetProgress = (reductionAchieved / targetReduction) * 100;
  const onTrackForTarget = currentMonth.total <= currentMonth.target;

  const stats = [
    {
      label: 'Current Emissions',
      value: `${currentMonth.total} tons`,
      sublabel: 'CO₂e this month',
      status: 'neutral'
    },
    {
      label: 'Reduction Achieved',
      value: `${reductionAchieved.toFixed(1)}%`,
      sublabel: 'vs baseline',
      status: 'good'
    },
    {
      label: 'Target Progress',
      value: `${Math.min(targetProgress, 100).toFixed(0)}%`,
      sublabel: `toward ${targetReduction}% goal`,
      status: targetProgress >= 100 ? 'good' : targetProgress >= 75 ? 'warning' : 'danger'
    },
    {
      label: 'Monthly Target',
      value: onTrackForTarget ? '✓ On Track' : '⚠ Behind',
      sublabel: `${currentMonth.target} tons target`,
      status: onTrackForTarget ? 'good' : 'warning'
    }
  ];

  const statusColors = {
    good: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {stats.map((stat, index) => (
        <Card key={index} className="p-4">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
            <p className={cn(
              'text-2xl font-bold mb-1',
              statusColors[stat.status as keyof typeof statusColors]
            )}>
              {stat.value}
            </p>
            <p className="text-xs text-gray-500">{stat.sublabel}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

/**
 * Carbon Footprint Component
 * 
 * Comprehensive carbon emissions tracking with baseline comparisons,
 * scope breakdowns, and reduction initiative tracking.
 */
export const CarbonFootprint: React.FC<CarbonFootprintProps> = ({
  data,
  loading = false,
  className
}) => {
  if (!data || loading) {
    // You can return a loading skeleton here if you prefer
    return null;
  }

  const transformedData = transformDataForCharts(data);
  const sources = mockEmissionSources; // Keep mock sources for now
  const reductions = mockReductions;   // Keep mock reductions for now

  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-64 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('carbon-footprint space-y-6', className)}>
      {/* Stats Summary */}
      <CarbonStatsSummary data={transformedData} targetReduction={data.reduction} />

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carbon Trend Chart */}
        <CarbonTrendChart 
          data={transformedData} 
          className="lg:col-span-2"
        />

        {/* Emission Sources */}
        <EmissionSourcesChart sources={sources} />
      </div>

      {/* Reduction Initiatives */}
      <ReductionInitiatives initiatives={reductions} />
    </div>
  );
};

CarbonFootprint.displayName = 'CarbonFootprint';

// Export types and sub-components
export type { CarbonFootprintProps, CarbonEmissionData, EmissionSource, CarbonReduction };
export { CarbonTrendChart, EmissionSourcesChart, ReductionInitiatives, CarbonStatsSummary }; 