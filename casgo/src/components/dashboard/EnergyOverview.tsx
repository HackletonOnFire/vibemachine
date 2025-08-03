'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent, Chart, SustainabilityChartPresets, SUSTAINABILITY_COLORS } from '../../../components/ui';
import { cn } from '../../../lib/utils';
import type { DashboardData } from '../../hooks/useDashboardData';

// Energy data interfaces - extending from dashboard data
interface EnergyUsageData {
  [key: string]: string | number | undefined; // Index signature for compatibility with Chart component
  month: string;
  electricity: number; // kWh
  gas: number; // therms
  total: number; // kWh equivalent
  cost: number; // USD
  baseline?: number; // kWh equivalent baseline
}

interface EnergyBreakdown {
  source: string;
  usage: number; // kWh
  cost: number; // USD
  percentage: number;
  color: string;
}

interface EnergyOverviewProps {
  data: DashboardData['energyData'];
  loading?: boolean;
  className?: string;
}

// This function transforms the energyData from the main DashboardData
// into the EnergyUsageData[] format expected by the charts in this component.
const transformDataForCharts = (energyData: DashboardData['energyData']): EnergyUsageData[] => {
  // This is a simplified transformation. In a real app, you'd iterate over
  // a series of historical data points. For now, we'll create a few mock points
  // based on the current and previous month's data.
  const current = {
    month: 'Current',
    electricity: energyData.currentMonth.electricity,
    gas: energyData.currentMonth.gas,
    total: energyData.currentMonth.electricity + energyData.currentMonth.gas, // Simplified total
    cost: energyData.currentMonth.totalCost,
    baseline: energyData.currentMonth.electricity * 1.1 // Mock baseline
  };

  const previous = {
    month: 'Previous',
    electricity: energyData.previousMonth.electricity,
    gas: energyData.previousMonth.gas,
    total: energyData.previousMonth.electricity + energyData.previousMonth.gas, // Simplified total
    cost: energyData.previousMonth.totalCost,
    baseline: energyData.previousMonth.electricity * 1.1 // Mock baseline
  };

  // Create a few more mock points for a better chart display
  const mockHistory = [
    { ...previous, month: '2 Months Ago', total: previous.total * 1.05, cost: previous.cost * 1.05 },
    { ...previous, month: '3 Months Ago', total: previous.total * 1.1, cost: previous.cost * 1.1 },
  ];

  return [...mockHistory, previous, current];
};

// Mock energy usage data
const mockEnergyData: EnergyUsageData[] = [
  { month: 'Jan', electricity: 16100, gas: 3200, total: 18400, cost: 3580, baseline: 20500 },
  { month: 'Feb', electricity: 15800, gas: 3100, total: 18100, cost: 3520, baseline: 20200 },
  { month: 'Mar', electricity: 15600, gas: 2900, total: 17800, cost: 3420, baseline: 19800 },
  { month: 'Apr', electricity: 15200, gas: 2600, total: 17100, cost: 3280, baseline: 19200 },
  { month: 'May', electricity: 15420, gas: 2850, total: 17520, cost: 3240, baseline: 19500 },
  { month: 'Jun', electricity: 14800, gas: 2400, total: 16600, cost: 3080, baseline: 18800 },
];

// Realistic energy breakdown data based on actual business energy usage patterns
const generateRealisticBreakdownData = (totalElectricity: number, totalCost: number): EnergyBreakdown[] => {
  // Base percentages for typical small-medium business energy usage
  const baseBreakdown = [
    { source: 'Heating & Cooling', basePercentage: 42, color: '#ef4444' },
    { source: 'Lighting', basePercentage: 20, color: '#f59e0b' },
    { source: 'Office Equipment', basePercentage: 15, color: '#06b6d4' },
    { source: 'Computers & IT', basePercentage: 12, color: '#22c55e' },
    { source: 'Other Equipment', basePercentage: 11, color: '#8b5cf6' },
  ];

  // Add some seasonal variation (±3%)
  const seasonalVariation = () => (Math.random() - 0.5) * 6;
  
  let runningTotal = 0;
  const breakdown = baseBreakdown.map((item, index) => {
    const adjustedPercentage = Math.max(5, item.basePercentage + seasonalVariation());
    const usage = Math.round((totalElectricity * adjustedPercentage) / 100);
    const cost = Math.round((totalCost * adjustedPercentage) / 100);
    
    if (index === baseBreakdown.length - 1) {
      // Ensure last item adjusts to make total 100%
      const remainingPercentage = 100 - runningTotal;
      return {
        source: item.source,
        usage: Math.round((totalElectricity * remainingPercentage) / 100),
        cost: Math.round((totalCost * remainingPercentage) / 100),
        percentage: Number(remainingPercentage.toFixed(1)),
        color: item.color
      };
    }
    
    runningTotal += adjustedPercentage;
    return {
      source: item.source,
      usage,
      cost,
      percentage: Number(adjustedPercentage.toFixed(1)),
      color: item.color
    };
  });

  return breakdown;
};

/**
 * Energy Usage Chart Component
 */
const EnergyUsageChart = ({ 
  data, 
  showBaseline = true,
  period = 'month',
  className 
}: { 
  data: EnergyUsageData[];
  showBaseline?: boolean;
  period?: string;
  className?: string;
}) => {
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area');
  
  const series = showBaseline ? [
    { dataKey: 'electricity', name: 'Electricity (kWh)', color: SUSTAINABILITY_COLORS.primary },
    { dataKey: 'gas', name: 'Natural Gas (therms)', color: SUSTAINABILITY_COLORS.secondary },
    { dataKey: 'baseline', name: 'Baseline', color: '#e5e7eb', stroke: '#9ca3af' }
  ] : [
    { dataKey: 'electricity', name: 'Electricity (kWh)', color: SUSTAINABILITY_COLORS.primary },
    { dataKey: 'gas', name: 'Natural Gas (therms)', color: SUSTAINABILITY_COLORS.secondary }
  ];

  return (
    <Card className={cn('col-span-2', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Energy Usage Trend</h3>
            <p className="text-sm text-gray-500">Monthly electricity and gas consumption</p>
          </div>
          <div className="flex items-center space-x-2">
            {(['line', 'area', 'bar'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                  chartType === type
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Chart
          type={chartType}
          data={data}
          series={series}
          xAxisKey="month"
          title=""
          size="lg"
          stacked={chartType === 'area'}
          showGrid={true}
          colors={[...SustainabilityChartPresets.energyUsage.colors]}
        />
      </CardContent>
    </Card>
  );
};

/**
 * Energy Breakdown Pie Chart Component
 */
const EnergyBreakdownChart = ({ 
  data,
  className 
}: { 
  data: EnergyBreakdown[];
  className?: string;
}) => {
  const pieData = data.map(item => ({
    name: item.source,
    value: item.usage,
    cost: item.cost,
    percentage: item.percentage
  }));

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300 hover:scale-[1.02]',
      'bg-gradient-to-br from-white via-slate-50/50 to-white',
      'border border-slate-200/60 hover:border-slate-300/80 shadow-sm hover:shadow-xl',
      className
    )}>
      {/* Enhanced header with gradient */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          Energy Breakdown
        </h3>
        <p className="text-indigo-100 text-sm mt-1">Current month usage by category</p>
      </div>
      
      <CardContent className="p-6">
        <Chart
          type="pie"
          data={pieData}
          series={[]}
          valueKey="value"
          labelKey="name"
          title=""
          size="md"
          showLabels={false}
          innerRadius={45}
          colors={data.map(item => item.color)}
        />
        
        {/* Enhanced Legend */}
        <div className="mt-6 space-y-3">
          {data.map((item, index) => (
            <div 
              key={item.source} 
              className="group flex items-center justify-between p-3 rounded-xl bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm" 
                    style={{ backgroundColor: item.color }}
                  />
                  <div 
                    className="absolute inset-0 w-4 h-4 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-200" 
                    style={{ backgroundColor: item.color }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                  {item.source}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-900">
                  {item.usage.toLocaleString()} kWh
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span>{item.percentage}%</span>
                  <span className="text-slate-400">•</span>
                  <span>${item.cost.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200/60">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium text-slate-700">Total Usage</span>
            </div>
            <div className="text-right">
              <div className="font-semibold text-slate-900">
                {data.reduce((sum, item) => sum + item.usage, 0).toLocaleString()} kWh
              </div>
              <div className="text-xs text-slate-500">
                ${data.reduce((sum, item) => sum + item.cost, 0).toLocaleString()} this month
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Energy Cost Trend Component
 */
const EnergyCostTrend = ({ 
  data,
  className 
}: { 
  data: EnergyUsageData[];
  className?: string;
}) => {
  const costData = data.map(item => ({
    month: item.month,
    cost: item.cost,
    savings: item.baseline ? (item.baseline * 0.18) - item.cost : 0 // Estimate cost of baseline
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Cost Analysis</h3>
        <p className="text-sm text-gray-500">Monthly energy costs and potential savings</p>
      </CardHeader>
      <CardContent>
        <Chart
          type="bar"
          data={costData}
          series={[
            { dataKey: 'cost', name: 'Actual Cost', color: '#ef4444' },
            { dataKey: 'savings', name: 'Potential Savings', color: '#22c55e' }
          ]}
          xAxisKey="month"
          title=""
          size="md"
          stacked={false}
        />
      </CardContent>
    </Card>
  );
};

/**
 * Energy Stats Summary Component
 */
const EnergyStatsSummary = ({ 
  data,
  className 
}: { 
  data: EnergyUsageData[];
  className?: string;
}) => {
  if (!data || data.length < 2) { // Needs at least 2 months for comparison
    return (
      <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4', className)}>
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="p-4 animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-2/3 mx-auto mb-2"></div>
            <div className="h-8 bg-gray-300 rounded w-1/2 mx-auto"></div>
          </Card>
        ))}
      </div>
    );
  }

  const currentMonth = data[data.length - 1];
  const previousMonth = data[data.length - 2];
  const avgUsage = data.reduce((sum, item) => sum + item.total, 0) / data.length;
  const totalSavings = data.reduce((sum, item) => sum + (item.baseline ? item.baseline - item.total : 0), 0);

  const stats = [
    {
      label: 'Current Usage',
      value: `${currentMonth.total.toLocaleString()} kWh`,
      change: previousMonth ? ((currentMonth.total - previousMonth.total) / previousMonth.total * 100) : 0,
      trend: previousMonth ? (currentMonth.total < previousMonth.total ? 'down' : 'up') : 'neutral'
    },
    {
      label: 'Average Monthly',
      value: `${Math.round(avgUsage).toLocaleString()} kWh`,
      change: null,
      trend: 'neutral'
    },
    {
      label: 'Total Savings',
      value: `${Math.round(totalSavings).toLocaleString()} kWh`,
      change: null,
      trend: 'down'
    },
    {
      label: 'Efficiency Score',
      value: `${Math.round((totalSavings / (avgUsage * data.length)) * 100)}%`,
      change: null,
      trend: 'up'
    }
  ];

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6', className)}>
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className={cn(
            'group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] p-4 sm:p-6',
            'bg-gradient-to-br from-white via-slate-50/50 to-white',
            'border border-slate-200/60 hover:border-slate-300/80 shadow-sm hover:shadow-xl'
          )}
        >
          {/* Status indicator */}
          <div className={cn(
            'absolute top-0 left-0 w-full h-1 transition-all duration-300',
            stat.trend === 'down' && 'bg-gradient-to-r from-emerald-500 to-teal-500',
            stat.trend === 'up' && 'bg-gradient-to-r from-red-500 to-pink-500',
            stat.trend === 'neutral' && 'bg-gradient-to-r from-slate-400 to-slate-500'
          )} />
          
          <div className="text-center relative z-10">
            <p className="text-sm font-semibold text-slate-600 mb-2">{stat.label}</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3">
              {stat.value}
            </p>
            {stat.change !== null && (
              <div className={cn(
                'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300',
                stat.trend === 'down' && 'bg-emerald-100 text-emerald-700',
                stat.trend === 'up' && 'bg-red-100 text-red-700',
                stat.trend === 'neutral' && 'bg-slate-100 text-slate-700'
              )}>
                <div className={cn(
                  'w-3 h-3 rounded-full flex items-center justify-center',
                  stat.trend === 'down' && 'bg-emerald-500',
                  stat.trend === 'up' && 'bg-red-500',
                  stat.trend === 'neutral' && 'bg-slate-500'
                )}>
                  {stat.trend === 'down' && (
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {stat.trend === 'up' && (
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {stat.trend === 'neutral' && (
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  )}
                </div>
                {Math.abs(stat.change).toFixed(1)}%
                <span className="text-slate-500">vs last month</span>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

/**
 * Energy Overview Component
 * 
 * Comprehensive energy usage dashboard with multiple visualizations,
 * reusing existing Chart and Card components for consistency.
 */
export const EnergyOverview: React.FC<EnergyOverviewProps> = ({
  data,
  loading = false,
  className
}) => {
  if (!data || loading) {
    return null; // Or a loading skeleton
  }

  // Use a transform function to convert dashboard data to the format this component needs
  const transformedData = transformDataForCharts(data);
  const breakdown = generateRealisticBreakdownData(data.currentMonth.electricity, data.currentMonth.totalCost);

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
    <div className={cn('energy-overview space-y-6', className)}>
      {/* Stats Summary */}
      <EnergyStatsSummary data={transformedData} />

      {/* Mobile-First Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Energy Usage Chart */}
        <EnergyUsageChart 
          data={transformedData} 
          showBaseline={true}
          className="xl:col-span-2"
        />

        {/* Energy Breakdown */}
        <EnergyBreakdownChart data={breakdown} />
      </div>

      {/* Mobile-First Cost Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <EnergyCostTrend data={transformedData} />
        
        {/* Enhanced insights card */}
        <Card className={cn(
          'relative overflow-hidden transition-all duration-300 hover:scale-[1.02]',
          'bg-gradient-to-br from-white via-slate-50/50 to-white',
          'border border-slate-200/60 hover:border-slate-300/80 shadow-sm hover:shadow-xl'
        )}>
          {/* Enhanced header with gradient */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              Energy Insights
            </h3>
            <p className="text-amber-100 text-sm mt-1">AI-powered optimization recommendations</p>
          </div>
          
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="group p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-xl hover:shadow-sm transition-all duration-200">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-emerald-800 mb-1">Excellent Progress!</p>
                    <p className="text-xs text-emerald-700 leading-relaxed">You've reduced energy usage by 15% this quarter compared to your baseline</p>
                    <div className="mt-2 text-xs text-emerald-600 font-medium">Savings: $485 this month</div>
                  </div>
                </div>
              </div>
              
              <div className="group p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/60 rounded-xl hover:shadow-sm transition-all duration-200">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-yellow-800 mb-1">Optimization Opportunity</p>
                    <p className="text-xs text-yellow-700 leading-relaxed">Heating & Cooling accounts for 42% of usage - consider upgrading to smart HVAC controls</p>
                    <div className="mt-2 text-xs text-yellow-600 font-medium">Potential savings: $2,400/year</div>
                  </div>
                </div>
              </div>

              <div className="group p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-xl hover:shadow-sm transition-all duration-200">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-800 mb-1">Trend Alert</p>
                    <p className="text-xs text-blue-700 leading-relaxed">Office equipment usage increased 8% - monitor during off-hours for phantom loads</p>
                    <div className="mt-2 text-xs text-blue-600 font-medium">Review recommended</div>
                  </div>
                </div>
              </div>
              
              <div className="text-center pt-4 border-t border-slate-200/60">
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 transition-all duration-200 shadow-sm hover:shadow-md">
                  <span>View All Recommendations</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

EnergyOverview.displayName = 'EnergyOverview';

// Export types and sub-components
export type { EnergyOverviewProps, EnergyUsageData, EnergyBreakdown };
export { EnergyUsageChart, EnergyBreakdownChart, EnergyCostTrend, EnergyStatsSummary }; 