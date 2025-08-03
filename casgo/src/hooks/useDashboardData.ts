// Custom hook for fetching dashboard data from Supabase
import { useState, useEffect, useMemo, useCallback } from 'react';
import { dashboardOperations } from '../lib/database';
import { getRegionalFactors } from '../lib/global-energy-factors'; // getLocationInsights removed as it's not used
import type { User, EnergyData, SustainabilityGoal, Recommendation } from '../lib/types';
import { useRouter } from 'next/navigation'; // Import useRouter

// Dashboard data interface matching our component needs
export interface DashboardData {
  user: {
    name: string;
    businessName: string;
    industry: string;
    location: string;
  };
  energyData: {
    currentMonth: {
      electricity: number;
      gas: number;
      totalCost: number;
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
  };
  carbonFootprint: {
    currentEmissions: number;
    baseline: number;
    reduction: number;
    monthlyTrend: Array<{
      month: string;
      emissions: number;
    }>;
  };
  goals: {
    targetReduction: number;
    deadline: string;
    progress: number;
    milestones: Array<{
      title: string;
      completed: boolean;
      dueDate: string;
    }>;
  };
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    potentialSavings: number;
    co2Reduction: number;
    implementationCost: number;
    paybackPeriod: number;
  }>;
  lastUpdated: string;
}

export interface UseDashboardDataReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// A more comprehensive mock data object to ensure all charts have data
const fullMockDashboardData: DashboardData = {
  user: {
    name: 'Sarah Johnson',
    businessName: 'EcoTech Solutions',
    industry: 'Technology',
    location: 'San Francisco, CA'
  },
  energyData: {
    currentMonth: { electricity: 15420, gas: 2850, totalCost: 3240 },
    previousMonth: { electricity: 16100, gas: 3200, totalCost: 3580 },
    yearToDate: { electricity: 142500, gas: 28400, totalCost: 31200 }
  },
  carbonFootprint: {
    currentEmissions: 18.5,
    baseline: 22.3,
    reduction: 17,
    monthlyTrend: [
      { month: 'Jan', emissions: 22.1 },
      { month: 'Feb', emissions: 21.8 },
      { month: 'Mar', emissions: 20.5 },
      { month: 'Apr', emissions: 19.2 },
      { month: 'May', emissions: 18.5 },
      { month: 'Jun', emissions: 17.7 },
    ]
  },
  goals: {
    targetReduction: 30,
    deadline: '2025-12-31',
    progress: 56,
    milestones: [
      { title: 'LED Lighting Upgrade', completed: true, dueDate: '2024-03-31' },
      { title: 'HVAC Optimization', completed: false, dueDate: '2024-06-30' },
      { title: 'Smart Building Systems', completed: false, dueDate: '2024-09-30' }
    ]
  },
  recommendations: [
    { priority: 'high', title: 'Upgrade to Smart Thermostats', description: 'Optimize heating and cooling', potentialSavings: 2400, co2Reduction: 3.2, implementationCost: 1200, paybackPeriod: 6 },
    { priority: 'medium', title: 'Switch to Renewable Energy', description: 'Transition to a green provider', potentialSavings: 1800, co2Reduction: 8.5, implementationCost: 0, paybackPeriod: 0 },
  ],
  lastUpdated: new Date().toISOString()
};

// Memoized constants to avoid recreation
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

export function useDashboardData(userId?: string): UseDashboardDataReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Initialize router

  // Memoized fetch function to prevent unnecessary re-creations
  const fetchDashboardData = useCallback(async () => {
    // ONLY use mock data if userId is explicitly not provided.
    // This allows us to force real data fetching by passing the ID.
    if (!userId) {
      // In a real application, you might want to handle this case differently,
      // but for now, we prevent calling the API without a user ID.
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await dashboardOperations.getDashboardData(userId);

      if (!result.success || !result.data) {
        // If the profile doesn't exist, it's a specific state, not just an error.
        // The auth context should handle redirection, so we just set an error here.
        if (result.error?.includes('No rows returned') || result.error?.includes('Access denied')) {
           setError('User profile not found. Please complete onboarding.');
           // The AuthProvider should handle the redirect to /onboarding
        } else {
           setError(result.error || 'Failed to fetch dashboard data');
        }
        setData(null);
        return;
      }

      // Transform database data to match component interface
      const userLocation = result.data.profile?.location || 'Not specified';
      const transformedData: DashboardData = {
        user: {
          name: `${result.data.profile?.first_name || ''} ${result.data.profile?.last_name || ''}`.trim() || 'User',
          businessName: result.data.profile?.business_name || 'Your Business',
          industry: result.data.profile?.industry || 'Not specified',
          location: userLocation,
        },
        energyData: transformEnergyData(result.data.energySummary),
        carbonFootprint: calculateCarbonFootprint(result.data.energySummary, userLocation),
        goals: transformGoalsData(result.data.activeGoals),
        recommendations: transformRecommendationsData(result.data.topRecommendations),
        lastUpdated: result.data.lastUpdated,
      };

      setData(transformedData);
    } catch (err: any) {
      console.error('An unexpected error occurred in useDashboardData:', err);
      setError('An unexpected error occurred while fetching dashboard data.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({
    data,
    loading,
    error,
    refetch: fetchDashboardData
  }), [data, loading, error, fetchDashboardData]);
}

// Helper functions to transform database data

const transformEnergyData = (energySummary: any) => {
  // If no data, return zeros
  if (!energySummary || !energySummary.monthlyData || !energySummary.monthlyData.length) {
    return {
      currentMonth: { electricity: 0, gas: 0, totalCost: 0 },
      previousMonth: { electricity: 0, gas: 0, totalCost: 0 },
      yearToDate: { electricity: 0, gas: 0, totalCost: 0 }
    };
  }

  // Get monthly data array (already sorted by date desc)
  const monthlyData = energySummary.monthlyData;
  const current = monthlyData[0] || {};
  const previous = monthlyData[1] || {};

  return {
    currentMonth: {
      electricity: current.kwh_usage || 0,
      gas: current.gas_usage_therms || 0,
      totalCost: current.total_cost || 0
    },
    previousMonth: {
      electricity: previous.kwh_usage || 0,
      gas: previous.gas_usage_therms || 0,
      totalCost: previous.total_cost || 0
    },
    yearToDate: {
      electricity: energySummary.totalKwh || 0,
      gas: energySummary.totalTherms || 0,
      totalCost: energySummary.totalCost || 0
    }
  };
};

const calculateCarbonFootprint = (energySummary: any, userLocation: string = '') => {
  if (!energySummary || !energySummary.monthlyData || !energySummary.monthlyData.length) {
    return {
      currentEmissions: 0,
      baseline: 0,
      reduction: 0,
      monthlyTrend: [],
    };
  }

  const regionalFactors = getRegionalFactors(userLocation);
  const ELECTRICITY_FACTOR = regionalFactors.co2EmissionFactor;
  const GAS_FACTOR = regionalFactors.gasEmissionFactor || 2.0;

  const monthlyData = energySummary.monthlyData;
  const current = monthlyData[0] || {};
  const currentEmissions =
    (current.kwh_usage || 0) * ELECTRICITY_FACTOR +
    (current.gas_usage_therms || 0) * GAS_FACTOR;

  const avgElectricity = monthlyData.reduce((sum: number, entry: any) => sum + (entry.kwh_usage || 0), 0) / Math.max(monthlyData.length, 1);
  const avgGas = monthlyData.reduce((sum: number, entry: any) => sum + (entry.gas_usage_therms || 0), 0) / Math.max(monthlyData.length, 1);
  const baseline = avgElectricity * ELECTRICITY_FACTOR + avgGas * GAS_FACTOR;

  const reduction = baseline > 0 ? Math.max(0, ((baseline - currentEmissions) / baseline) * 100) : 0;

  const monthlyTrend = monthlyData.slice(0, 12).map((entry: any) => {
    const date = new Date(entry.measurement_date || new Date());
    return {
      month: MONTH_NAMES[date.getMonth()],
      emissions: (entry.kwh_usage || 0) * ELECTRICITY_FACTOR + (entry.gas_usage_therms || 0) * GAS_FACTOR,
    };
  }).reverse();

  return {
    currentEmissions: Math.round(currentEmissions * 10) / 10,
    baseline: Math.round(baseline * 10) / 10,
    reduction: Math.round(reduction),
    monthlyTrend,
  };
};

const transformGoalsData = (goals: any[]) => {
  if (!goals || !goals.length) {
    return {
      targetReduction: 0,
      deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progress: 0,
      milestones: []
    };
  }

  const primaryGoal = goals[0];
  return {
    targetReduction: primaryGoal?.target_value || 0,
    deadline: primaryGoal?.target_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    progress: primaryGoal?.current_value || 0,
    milestones: goals.slice(0, 3).map((goal, index) => ({
      title: goal.title || `Goal ${index + 1}`,
      completed: goal.status === 'completed',
      dueDate: goal.target_date || new Date(Date.now() + (index + 1) * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }))
  };
};

const transformRecommendationsData = (recommendations: any[]) => {
  if (!recommendations || !recommendations.length) {
    return [];
  }

  return recommendations.slice(0, 3).map((rec: any) => ({
    priority: rec.priority || 'medium',
    title: rec.title || 'Sustainability Improvement',
    description: rec.description || 'AI-generated recommendation for your business',
    potentialSavings: rec.estimated_annual_savings || 0,
    co2Reduction: rec.annual_co2_reduction_tons || 0,
    implementationCost: rec.implementation_cost || 0,
    paybackPeriod: rec.payback_period_months || 12
  }));
}; 