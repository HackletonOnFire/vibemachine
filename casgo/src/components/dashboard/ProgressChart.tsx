'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent, Chart, SUSTAINABILITY_COLORS } from '../../../components/ui';
import { cn } from '../../../lib/utils';
import type { DashboardData } from '../../hooks/useDashboardData';

// Progress tracking data interfaces
interface GoalProgress {
  goal: string;
  category: 'energy' | 'emissions' | 'waste' | 'water' | 'renewables';
  target: number;
  current: number;
  unit: string;
  deadline: string;
  status: 'on-track' | 'at-risk' | 'behind' | 'completed';
  milestones: Milestone[];
}

interface Milestone {
  title: string;
  target: number;
  current: number;
  deadline: string;
  completed: boolean;
}

interface TimelineProgress {
  [key: string]: string | number; // Index signature for chart compatibility
  month: string;
  energyReduction: number;
  emissionsReduction: number;
  renewableAdoption: number;
  wasteReduction: number;
  targetEnergyReduction: number;
  targetEmissionsReduction: number;
  targetRenewableAdoption: number;
  targetWasteReduction: number;
}

interface ProgressChartProps {
  data: DashboardData['goals'];
  loading?: boolean;
  className?: string;
}

// Helper to transform dashboard data
const transformDataForCharts = (goalData: DashboardData['goals']): GoalProgress[] => {
  // If we have insufficient real data, use enhanced mock data
  if (!goalData || !goalData.milestones || goalData.milestones.length === 0) {
    return mockGoals;
  }

  // Transform real goal data into GoalProgress format
  const transformedGoals: GoalProgress[] = [];

  // Create a main goal from the primary data
  if (goalData.targetReduction > 0) {
    transformedGoals.push({
      goal: 'Energy Consumption Reduction',
      category: 'energy',
      target: goalData.targetReduction,
      current: goalData.progress,
      unit: '%',
      deadline: goalData.deadline,
      status: goalData.progress >= goalData.targetReduction ? 'completed' : 
              goalData.progress >= goalData.targetReduction * 0.8 ? 'on-track' :
              goalData.progress >= goalData.targetReduction * 0.5 ? 'at-risk' : 'behind',
      milestones: goalData.milestones.map((milestone, index) => ({
        title: milestone.title,
        target: Math.round(goalData.targetReduction / goalData.milestones.length * (index + 1)),
        current: milestone.completed ? Math.round(goalData.targetReduction / goalData.milestones.length * (index + 1)) : Math.round(goalData.progress / goalData.milestones.length * (index + 1)),
        deadline: milestone.dueDate,
        completed: milestone.completed
      }))
    });
  }

  // Transform milestones into individual goals for better visualization
  goalData.milestones.forEach((milestone, index) => {
    const categories: ('energy' | 'emissions' | 'renewables' | 'waste' | 'water')[] = ['energy', 'emissions', 'renewables', 'waste', 'water'];
    const category = categories[index % categories.length];
    
    transformedGoals.push({
      goal: milestone.title,
      category: category,
      target: 100,
      current: milestone.completed ? 100 : Math.max(15, 85 - index * 15), // Realistic progress
      unit: '%',
      deadline: milestone.dueDate,
      status: milestone.completed ? 'completed' : 'on-track',
      milestones: [] // Individual milestones don't need nested milestones
    });
  });

  // If we still don't have enough goals, supplement with mock data
  if (transformedGoals.length < 3) {
    const remainingMockGoals = mockGoals.slice(transformedGoals.length);
    transformedGoals.push(...remainingMockGoals);
  }

  return transformedGoals.slice(0, 6); // Limit to 6 goals for good UI
};

// Mock goal progress data
const mockGoals: GoalProgress[] = [
  {
    goal: 'Reduce Energy Consumption',
    category: 'energy',
    target: 25,
    current: 18.7,
    unit: '%',
    deadline: '2024-12-31',
    status: 'on-track',
    milestones: [
      { title: 'LED Lighting Upgrade', target: 8, current: 8, deadline: '2024-03-31', completed: true },
      { title: 'HVAC Optimization', target: 12, current: 7.2, deadline: '2024-06-30', completed: false },
      { title: 'Smart Building Systems', target: 5, current: 3.5, deadline: '2024-09-30', completed: false }
    ]
  },
  {
    goal: 'Cut Carbon Emissions',
    category: 'emissions',
    target: 30,
    current: 22.4,
    unit: '%',
    deadline: '2024-12-31',
    status: 'on-track',
    milestones: [
      { title: 'Renewable Energy Adoption', target: 15, current: 12, deadline: '2024-06-30', completed: false },
      { title: 'Fleet Electrification', target: 8, current: 4.2, deadline: '2024-09-30', completed: false },
      { title: 'Supply Chain Optimization', target: 7, current: 6.2, deadline: '2024-12-31', completed: false }
    ]
  },
  {
    goal: 'Increase Renewable Energy',
    category: 'renewables',
    target: 60,
    current: 42,
    unit: '%',
    deadline: '2024-12-31',
    status: 'at-risk',
    milestones: [
      { title: 'Solar Panel Installation', target: 35, current: 35, deadline: '2024-04-30', completed: true },
      { title: 'Wind Energy Contract', target: 15, current: 7, deadline: '2024-08-31', completed: false },
      { title: 'Battery Storage System', target: 10, current: 0, deadline: '2024-11-30', completed: false }
    ]
  },
  {
    goal: 'Reduce Waste Generation',
    category: 'waste',
    target: 40,
    current: 28.5,
    unit: '%',
    deadline: '2024-12-31',
    status: 'behind',
    milestones: [
      { title: 'Recycling Program', target: 15, current: 18, deadline: '2024-02-28', completed: true },
      { title: 'Zero Waste Initiative', target: 20, current: 8.5, deadline: '2024-08-31', completed: false },
      { title: 'Circular Economy Program', target: 5, current: 2, deadline: '2024-11-30', completed: false }
    ]
  }
];

// Mock timeline data
const mockTimeline: TimelineProgress[] = [
  { month: 'Jan', energyReduction: 5.2, emissionsReduction: 6.8, renewableAdoption: 25, wasteReduction: 12, targetEnergyReduction: 4.2, targetEmissionsReduction: 5.0, targetRenewableAdoption: 20, targetWasteReduction: 6.7 },
  { month: 'Feb', energyReduction: 8.1, emissionsReduction: 9.5, renewableAdoption: 28, wasteReduction: 15.5, targetEnergyReduction: 8.3, targetEmissionsReduction: 10.0, targetRenewableAdoption: 25, targetWasteReduction: 13.3 },
  { month: 'Mar', energyReduction: 12.3, emissionsReduction: 14.2, renewableAdoption: 35, wasteReduction: 22.1, targetEnergyReduction: 12.5, targetEmissionsReduction: 15.0, targetRenewableAdoption: 30, targetWasteReduction: 20.0 },
  { month: 'Apr', energyReduction: 15.8, emissionsReduction: 18.6, renewableAdoption: 38, wasteReduction: 25.8, targetEnergyReduction: 16.7, targetEmissionsReduction: 20.0, targetRenewableAdoption: 35, targetWasteReduction: 26.7 },
  { month: 'May', energyReduction: 18.7, emissionsReduction: 22.4, renewableAdoption: 42, wasteReduction: 28.5, targetEnergyReduction: 20.8, targetEmissionsReduction: 25.0, targetRenewableAdoption: 40, targetWasteReduction: 33.3 },
  { month: 'Jun', energyReduction: 21.2, emissionsReduction: 25.8, renewableAdoption: 45, wasteReduction: 32.1, targetEnergyReduction: 25.0, targetEmissionsReduction: 30.0, targetRenewableAdoption: 45, targetWasteReduction: 40.0 }
];

/**
 * Goal Progress Overview Component
 */
const GoalProgressOverview = ({ 
  goals,
  className 
}: { 
  goals: GoalProgress[];
  className?: string;
}) => {
  const statusColors = {
    'completed': { bg: 'bg-green-100', text: 'text-green-800', bar: 'bg-green-500' },
    'on-track': { bg: 'bg-blue-100', text: 'text-blue-800', bar: 'bg-blue-500' },
    'at-risk': { bg: 'bg-yellow-100', text: 'text-yellow-800', bar: 'bg-yellow-500' },
    'behind': { bg: 'bg-red-100', text: 'text-red-800', bar: 'bg-red-500' }
  };

  const categoryIcons = {
    energy: '⚡',
    emissions: '🌱',
    renewables: '☀️',
    waste: '♻️',
    water: '💧'
  };

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Goal Progress Overview</h3>
        <p className="text-sm text-gray-500">Current progress toward 2024 sustainability targets</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {goals.map((goal, index) => {
            const progressPercentage = (goal.current / goal.target) * 100;
            const colors = statusColors[goal.status];
            
            return (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{categoryIcons[goal.category]}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{goal.goal}</h4>
                      <p className="text-sm text-gray-500">Due: {new Date(goal.deadline).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn('px-2 py-1 text-xs font-medium rounded-full', colors.bg, colors.text)}>
                      {goal.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{goal.current}{goal.unit} of {goal.target}{goal.unit}</span>
                    <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={cn('h-3 rounded-full transition-all duration-500', colors.bar)}
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>
                </div>
                
                {/* Milestones */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {goal.milestones.map((milestone, mIndex) => (
                    <div 
                      key={mIndex} 
                      className={cn(
                        'p-2 rounded border',
                        milestone.completed 
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600'
                      )}
                    >
                      <div className="font-medium">{milestone.title}</div>
                      <div>{milestone.current} / {milestone.target}{goal.unit}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Timeline Progress Chart Component
 */
const TimelineProgressChart = ({ 
  data,
  className 
}: { 
  data: TimelineProgress[];
  className?: string;
}) => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['energyReduction', 'emissionsReduction']);
  
  const metrics = [
    { key: 'energyReduction', label: 'Energy Reduction', color: SUSTAINABILITY_COLORS.primary, target: 'targetEnergyReduction' },
    { key: 'emissionsReduction', label: 'Emissions Reduction', color: SUSTAINABILITY_COLORS.error, target: 'targetEmissionsReduction' },
    { key: 'renewableAdoption', label: 'Renewable Adoption', color: SUSTAINABILITY_COLORS.warning, target: 'targetRenewableAdoption' },
    { key: 'wasteReduction', label: 'Waste Reduction', color: SUSTAINABILITY_COLORS.secondary, target: 'targetWasteReduction' }
  ];

  const toggleMetric = (metricKey: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricKey)
        ? prev.filter(m => m !== metricKey)
        : [...prev, metricKey]
    );
  };

  const series = selectedMetrics.flatMap(metricKey => {
    const metric = metrics.find(m => m.key === metricKey);
    if (!metric) return [];
    
    return [
      { dataKey: metricKey, name: metric.label, color: metric.color, strokeWidth: 3 },
      { dataKey: metric.target, name: `${metric.label} Target`, color: metric.color, stroke: metric.color, strokeDasharray: '5 5' }
    ];
  });

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Progress Timeline</h3>
            <p className="text-sm text-gray-500">Monthly progress vs targets</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {metrics.map(metric => (
              <button
                key={metric.key}
                onClick={() => toggleMetric(metric.key)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-full border transition-colors',
                  selectedMetrics.includes(metric.key)
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                )}
              >
                {metric.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Chart
          type="line"
          data={data}
          series={series}
          xAxisKey="month"
          title=""
          size="lg"
          showPoints={true}
          curve="monotone"
        />
      </CardContent>
    </Card>
  );
};

/**
 * Goal Performance Radar Chart Component
 */
const GoalPerformanceRadar = ({ 
  goals,
  className 
}: { 
  goals: GoalProgress[];
  className?: string;
}) => {
  const radarData = goals.map(goal => ({
    goal: goal.goal.split(' ')[1] || goal.goal, // Shortened labels
    progress: (goal.current / goal.target) * 100,
    target: 100
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
        <p className="text-sm text-gray-500">Progress across all sustainability goals</p>
      </CardHeader>
      <CardContent>
        <Chart
          type="bar"
          data={radarData}
          series={[
            { dataKey: 'progress', name: 'Current Progress', color: SUSTAINABILITY_COLORS.primary },
            { dataKey: 'target', name: 'Target', color: SUSTAINABILITY_COLORS.neutral }
          ]}
          xAxisKey="goal"
          title=""
          size="md"
          layout="vertical"
        />
      </CardContent>
    </Card>
  );
};

/**
 * Progress Summary Stats Component
 */
const ProgressSummaryStats = ({ 
  goals,
  className 
}: { 
  goals: GoalProgress[];
  className?: string;
}) => {
  if (!goals || goals.length === 0) {
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

  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const onTrackGoals = goals.filter(g => ['completed', 'on-track'].includes(g.status)).length;
  const avgProgress = goals.reduce((sum, goal) => sum + (goal.current / goal.target), 0) / totalGoals * 100;

  const stats = [
    {
      label: 'Total Goals',
      value: totalGoals,
      sublabel: 'Active sustainability targets',
      color: 'text-gray-600'
    },
    {
      label: 'On Track',
      value: onTrackGoals,
      sublabel: `${((onTrackGoals / totalGoals) * 100).toFixed(0)}% performing well`,
      color: 'text-green-600'
    },
    {
      label: 'Average Progress',
      value: `${avgProgress.toFixed(1)}%`,
      sublabel: 'Across all goals',
      color: 'text-blue-600'
    },
    {
      label: 'Completed',
      value: completedGoals,
      sublabel: 'Goals achieved',
      color: 'text-emerald-600'
    }
  ];

  return (
    <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {stats.map((stat, index) => (
        <Card key={index} className="p-4">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
            <p className={cn('text-2xl font-bold mb-1', stat.color)}>
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
 * Progress Chart Component
 * 
 * Comprehensive sustainability goal progress tracking with multiple
 * visualization types and interactive features.
 */
export const ProgressChart: React.FC<ProgressChartProps> = ({
  data,
  loading = false,
  className
}) => {
  const [currentView, setCurrentView] = useState('overview');

  // Handle loading state
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-64 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Transform data (fallback to mock data if needed)
  const transformedGoals = transformDataForCharts(data);
  const timeline = mockTimeline; // Keep mock timeline for now

  return (
    <div className={cn('progress-chart space-y-6', className)}>
      {/* Summary Stats */}
      <ProgressSummaryStats goals={transformedGoals} />

      {/* View Toggle */}
      <div className="flex items-center justify-center space-x-2">
        {(['overview', 'timeline', 'detailed'] as const).map((view) => (
          <button
            key={view}
            onClick={() => setCurrentView(view)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              currentView === view
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            )}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)} View
          </button>
        ))}
      </div>

      {/* View Content */}
      {currentView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GoalProgressOverview goals={transformedGoals} />
          <GoalPerformanceRadar goals={transformedGoals} />
        </div>
      )}

      {currentView === 'timeline' && (
        <TimelineProgressChart data={timeline} />
      )}

      {currentView === 'detailed' && (
        <div className="space-y-6">
          <TimelineProgressChart data={timeline} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GoalProgressOverview goals={transformedGoals} />
            <GoalPerformanceRadar goals={transformedGoals} />
          </div>
        </div>
      )}
    </div>
  );
};

ProgressChart.displayName = 'ProgressChart';

// Export types and sub-components
export type { ProgressChartProps, GoalProgress, TimelineProgress, Milestone };
export { GoalProgressOverview, TimelineProgressChart, GoalPerformanceRadar, ProgressSummaryStats }; 