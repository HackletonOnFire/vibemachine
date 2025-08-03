'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Layout } from '../../../components/Layout';
import { Card, CardHeader, CardContent, Button } from '../../../components/ui';
import { KPICards } from './KPICards';
import { EnergyOverview } from './EnergyOverview';
import { CarbonFootprint } from './CarbonFootprint';
import { ProgressChart } from './ProgressChart';
import { DashboardGridSkeleton, ErrorState, NetworkError } from './LoadingStates';
import { AddDataModal } from './AddDataModal';
import { LocationInsights } from './LocationInsights';
import { ImplementationsList, PortfolioROI } from '../implementation';
import { cn } from '../../../lib/utils';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useImplementation } from '../../hooks/useImplementation';
import type { DashboardData } from '../../hooks/useDashboardData';
import { Plus, Database, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../../lib/config';

// Backend data interfaces - kept for backward compatibility
interface EnergyData {
  currentMonth: {
    electricity: number; // kWh
    gas: number; // therms
    totalCost: number; // USD
  };
  previousMonth: {
    electricity: number;
    gas: number;
    totalCost: number;
  };
  yearToDate: {
    electricity: number;
    gas: number;
    totalCost: number;
  };
}

interface CarbonFootprintData {
  currentEmissions: number; // CO2e tons
  baseline: number; // CO2e tons
  reduction: number; // percentage
  monthlyTrend: Array<{
    month: string;
    emissions: number;
  }>;
}

interface SustainabilityGoals {
  targetReduction: number; // percentage
  deadline: string; // ISO date
  progress: number; // percentage completed
  milestones: Array<{
    title: string;
    completed: boolean;
    dueDate: string;
  }>;
}

interface RecommendationData {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  potentialSavings: number; // USD per year
  co2Reduction: number; // tons per year
  implementationCost: number; // USD
  paybackPeriod: number; // months
}

// Dashboard section interface for type safety
interface DashboardSection {
  id: string;
  title: string;
  component: React.ReactNode;
  className?: string;
  priority?: 'high' | 'medium' | 'low';
}

// Dashboard component props
interface DashboardProps {
  /**
   * User ID for fetching dashboard data (if not provided, uses mock data)
   */
  userId?: string;
  /**
   * Dashboard sections to render (for custom layouts)
   */
  sections?: DashboardSection[];
  /**
   * Whether to show a welcome header
   */
  showWelcome?: boolean;
  /**
   * Force loading state (for demos)
   */
  isLoading?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

// Mock data for development - this simulates backend API response
const mockDashboardData: DashboardData = {
  user: {
    name: 'Sarah Johnson',
    businessName: 'EcoTech Solutions',
    industry: 'Technology',
    location: 'San Francisco, CA'
  },
  energyData: {
    currentMonth: {
      electricity: 15420, // kWh
      gas: 2850, // therms
      totalCost: 3240 // USD
    },
    previousMonth: {
      electricity: 16100,
      gas: 3200,
      totalCost: 3580
    },
    yearToDate: {
      electricity: 142500,
      gas: 28400,
      totalCost: 31200
    }
  },
  carbonFootprint: {
    currentEmissions: 18.5, // CO2e tons
    baseline: 22.3, // CO2e tons
    reduction: 17, // percentage
    monthlyTrend: [
      { month: 'Jan', emissions: 22.1 },
      { month: 'Feb', emissions: 21.8 },
      { month: 'Mar', emissions: 20.5 },
      { month: 'Apr', emissions: 19.2 },
      { month: 'May', emissions: 18.5 }
    ]
  },
  goals: {
    targetReduction: 30, // percentage
    deadline: '2025-12-31',
    progress: 56, // percentage completed
    milestones: [
      { title: 'Install LED lighting', completed: true, dueDate: '2024-03-15' },
      { title: 'Upgrade HVAC system', completed: false, dueDate: '2024-06-30' },
      { title: 'Solar panel installation', completed: false, dueDate: '2024-09-15' }
    ]
  },
  recommendations: [
    {
      priority: 'high',
      title: 'Upgrade to Smart Thermostats',
      description: 'Install programmable smart thermostats to optimize heating and cooling',
      potentialSavings: 2400,
      co2Reduction: 3.2,
      implementationCost: 1200,
      paybackPeriod: 6
    },
    {
      priority: 'medium',
      title: 'Switch to Renewable Energy',
      description: 'Transition to a renewable energy provider for 50% of electricity needs',
      potentialSavings: 1800,
      co2Reduction: 8.5,
      implementationCost: 0,
      paybackPeriod: 0
    },
    {
      priority: 'medium',
      title: 'Implement Energy Monitoring',
      description: 'Install smart meters and energy monitoring system',
      potentialSavings: 3600,
      co2Reduction: 2.1,
      implementationCost: 2400,
      paybackPeriod: 8
    }
  ],
  lastUpdated: '2024-01-15T10:30:00Z'
};

/**
 * Dashboard Header Component - Memoized
 */
const DashboardHeader = React.memo<{ 
  data?: DashboardData; 
  showWelcome?: boolean;
  onDemoLoading?: () => void;
}>(({ data, showWelcome = true, onDemoLoading }) => {
  // Memoize greeting calculation
  const greeting = useMemo(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return 'Good morning';
    if (currentHour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  if (!showWelcome) return null;

  const displayName = data?.user?.name || 'there';
  const businessName = data?.user?.businessName;

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {greeting}, {displayName}!
      </h1>
      {businessName && (
        <p className="text-lg text-gray-600 mb-4">
          Here's your sustainability overview for {businessName}
        </p>
      )}
      
      {/* Quick Action Bar */}
      <div className="flex flex-wrap gap-3 mt-4">
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
          Add Energy Data
        </button>
        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
          Generate Report
        </button>
        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
          View Recommendations
        </button>
        {onDemoLoading && (
          <button 
            onClick={onDemoLoading}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            🔄 Demo Loading
          </button>
        )}
      </div>
    </div>
  );
});

DashboardHeader.displayName = 'DashboardHeader';

/**
 * Dashboard Grid Component - Memoized
 */
const DashboardGrid = React.memo<{ 
  sections: DashboardSection[];
  className?: string;
}>(({ sections = [], className }) => {
  // Memoize sorted sections to prevent recalculation
  const sortedSections = useMemo(() => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return [...sections].sort((a, b) => {
      const aPriority = priorityOrder[a.priority || 'medium'];
      const bPriority = priorityOrder[b.priority || 'medium'];
      return aPriority - bPriority;
    });
  }, [sections]);

  return (
    <div className={cn(
      'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
      className
    )}>
      {sortedSections.map((section) => (
        <div
          key={section.id}
          className={cn(
            'dashboard-section',
            section.priority === 'high' && 'lg:col-span-2',
            section.className
          )}
        >
          <Card className="h-full">
            <CardHeader title={section.title} />
            <CardContent className="flex-1">
              {section.component}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
});

DashboardGrid.displayName = 'DashboardGrid';

/**
 * Loading State Component - Memoized
 */
const DashboardLoading = React.memo(() => {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
        <div className="flex gap-3">
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
        </div>
      </div>
      
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-4 rounded-lg border animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );
});

DashboardLoading.displayName = 'DashboardLoading';

/**
 * Dashboard Empty State Component - Memoized
 */
const DashboardEmptyState = React.memo(() => {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Welcome to your sustainability dashboard
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        Get started by adding your energy usage data and sustainability goals. 
        We'll provide personalized recommendations to help you achieve your targets.
      </p>
      <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
        Start Onboarding
      </button>
    </div>
  );
});

DashboardEmptyState.displayName = 'DashboardEmptyState';

/**
 * Main Dashboard Component - Optimized
 * 
 * Provides the main dashboard layout with navigation, header, and grid system
 * for displaying various dashboard sections and widgets.
 */
export const Dashboard = React.memo<DashboardProps>(({
  userId, // User ID for fetching real data
  sections = [],
  showWelcome = true,
  isLoading: forceLoading = false,
  className
}) => {
  // Fetch dashboard data from Supabase or use mock data
  const { data, loading, error, refetch } = useDashboardData(userId);
  
  // Fetch implementations for ROI analytics and KPI cards
  const { implementations, stats, fetchImplementations, fetchStats } = useImplementation();
  
  // Fetch implementations and stats when userId changes
  useEffect(() => {
    if (userId) {
      fetchImplementations(userId);
      fetchStats(userId);
    }
  }, [userId, fetchImplementations, fetchStats]);
  
  // Use real data from Supabase, fall back to mock only if absolutely necessary
  const dashboardData = useMemo(() => data || (userId ? null : mockDashboardData), [data, userId]);

  const [dashboardState, setDashboardState] = useState<{
    loading: boolean;
    error: string | null;
    retryCount: number;
  }>({
    loading: forceLoading,
    error: null,
    retryCount: 0
  });

  // Add Data Modal state
  const [showAddDataModal, setShowAddDataModal] = useState(false);

  // Memoize computed values
  const hasSections = useMemo(() => sections.length > 0, [sections.length]);
  const hasData = useMemo(() => !!dashboardData, [dashboardData]);

  // Memoized callbacks
  const handleRetry = useCallback(() => {
    setDashboardState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null, 
      retryCount: prev.retryCount + 1 
    }));
  }, []);

  const handleDemoLoading = useCallback(() => {
    setDashboardState(prev => ({ ...prev, loading: true }));
  }, []);

  // Handle Add Data functionality
  const handleAddData = useCallback(() => {
    setShowAddDataModal(true);
  }, []);

  const handleCloseAddDataModal = useCallback(() => {
    setShowAddDataModal(false);
  }, []);

  const handleDataAdded = useCallback(() => {
    // Refresh dashboard data after new data is added
    refetch();
    setShowAddDataModal(false);
  }, [refetch]);

  // Simulate data loading with potential errors for demo
  useEffect(() => {
    if (forceLoading) {
      setDashboardState(prev => ({ ...prev, loading: true, error: null }));
      
      // Simulate API call with potential failure
      const timer = setTimeout(() => {
        // 10% chance of error for demo purposes
        if (Math.random() < 0.1 && dashboardState.retryCount < 2) {
          setDashboardState(prev => ({ 
            ...prev, 
            loading: false, 
            error: 'network_error' 
          }));
        } else {
          setDashboardState(prev => ({ 
            ...prev, 
            loading: false, 
            error: null 
          }));
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [forceLoading, dashboardState.retryCount]);

  // Memoized layout classes
  const layoutClassName = useMemo(() => 
    cn('bg-gradient-to-br from-slate-50 via-white to-slate-100', className), 
    [className]
  );

  // Loading State - show loading if either forced loading or real data is loading
  if (dashboardState.loading || forceLoading || loading) {
    return (
      <Layout currentPage="/dashboard" className={className}>
        <DashboardGridSkeleton />
      </Layout>
    );
  }

  // Error State - show database error or local error
  if (dashboardState.error || error) {
    return (
      <Layout currentPage="/dashboard" className={className} userId={userId}>
        <div className="space-y-6">
          <DashboardHeader 
            data={dashboardData} 
            showWelcome={showWelcome}
            onDemoLoading={handleDemoLoading}
          />
          {(dashboardState.error === 'network_error' || error) ? (
            <NetworkError onRetry={error ? refetch : handleRetry} />
          ) : (
            <ErrorState onRetry={handleRetry} />
          )}
        </div>
      </Layout>
    );
  }

  // Empty State
  if (!hasData) {
    return (
      <Layout currentPage="/dashboard" className={className} userId={userId}>
        <div className="text-center py-12">
          <div className="text-gray-500">
            <div className="text-lg font-medium mb-2">No Dashboard Data Available</div>
            <div className="text-sm">Please check your data connection and try again.</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="/dashboard" className={layoutClassName} userId={userId}>
      <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Mobile-First Dashboard Header */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/60 shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <DashboardHeader 
              data={dashboardData} 
              showWelcome={showWelcome}
              onDemoLoading={handleDemoLoading}
            />
            
            {/* Intelligent Add Data Button - Only show for authenticated users */}
            {userId && (
              <div className="flex items-center gap-3">
                <Button
                  onClick={refetch}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
                
                <Button
                  onClick={handleAddData}
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 px-4 py-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Energy Data</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Mobile-First KPI Cards */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-teal-500/5 rounded-2xl sm:rounded-3xl"></div>
                        <KPICards data={dashboardData} implementationStats={stats} className="relative z-10" />
        </div>

        {/* Location-Specific Insights */}
        <div className="relative">
          <LocationInsights location={dashboardData.user.location} />
        </div>

        {/* Enhanced Mobile-First Dashboard Content */}
        {hasSections ? (
          <DashboardGrid sections={sections} />
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Enhanced Mobile-First Energy Overview Section */}
            <section className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3 sm:px-6 sm:py-4">
                <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="min-w-0">Energy Usage Analytics</span>
                </h2>
                <p className="text-blue-100 text-xs sm:text-sm mt-1">Monitor your energy consumption trends and patterns</p>
              </div>
              <div className="p-4 sm:p-6">
                <EnergyOverview data={dashboardData.energyData} />
              </div>
            </section>

            {/* Enhanced Mobile-First Carbon Footprint Section */}
            <section className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 sm:px-6 sm:py-4">
                <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="min-w-0">Carbon Footprint Tracking</span>
                </h2>
                <p className="text-emerald-100 text-xs sm:text-sm mt-1">Track your emissions and environmental impact reduction</p>
              </div>
              <div className="p-4 sm:p-6">
                <CarbonFootprint data={dashboardData.carbonFootprint} />
              </div>
            </section>

            {/* Implementation Tracking Section */}
            {userId && (
              <section className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 sm:px-6 sm:py-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="min-w-0">Implementation Progress</span>
                  </h2>
                  <p className="text-orange-100 text-xs sm:text-sm mt-1">Track your active sustainability implementations and achievements</p>
                </div>
                <div className="p-4 sm:p-6">
                  <ImplementationsList 
                    userId={userId}
                    maxItems={3}
                    showTitle={false}
                    compact={false}
                    className="border-0 shadow-none bg-transparent"
                  />
                </div>
              </section>
            )}

            {/* Portfolio ROI Analytics Section */}
            {userId && (
              <section className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 sm:px-6 sm:py-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="min-w-0">ROI Analytics</span>
                  </h2>
                  <p className="text-purple-100 text-xs sm:text-sm mt-1">Automatic ROI calculations from your sustainability investments</p>
                </div>
                <div className="p-4 sm:p-6">
                  <PortfolioROI 
                    implementations={implementations} 
                    showDetails={false}
                    className="border-0 shadow-none bg-transparent"
                  />
                </div>
              </section>
            )}

            {/* Enhanced Mobile-First Progress Tracking Section */}
            <section className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-4 py-3 sm:px-6 sm:py-4">
                <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <span className="min-w-0">Sustainability Goal Progress</span>
                </h2>
                <p className="text-violet-100 text-xs sm:text-sm mt-1">Monitor progress toward your sustainability targets</p>
              </div>
              <div className="p-4 sm:p-6">
                <ProgressChart data={dashboardData.goals} />
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Add Data Modal - Only render for authenticated users */}
      {userId && (
        <AddDataModal
          isOpen={showAddDataModal}
          onClose={handleCloseAddDataModal}
          userId={userId}
          onDataAdded={handleDataAdded}
        />
      )}
    </Layout>
  );
});

Dashboard.displayName = 'Dashboard';

// Export types for external use
export type { 
  DashboardProps, 
  DashboardSection,
  EnergyData, 
  CarbonFootprintData, 
  SustainabilityGoals, 
  RecommendationData 
};

// Re-export DashboardData from hook
export type { DashboardData }; 