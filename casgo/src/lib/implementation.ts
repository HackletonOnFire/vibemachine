// Implementation management utilities and types for the frontend

import { API_BASE_URL } from './config';

export interface Implementation {
  id: string;
  user_id: string;
  recommendation_id?: string;
  title: string;
  description?: string;
  category: string;
  estimated_cost_savings: number;
  estimated_co2_reduction: number;
  roi_months: number;
  status: 'started' | 'in-progress' | 'completed';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimated_completion_weeks: number;
  progress_percentage: number;
  started_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateImplementationRequest {
  userId: string;
  recommendationId?: string;
  title: string;
  description?: string;
  category: string;
  estimatedCostSavings: number;
  estimatedCo2Reduction: number;
  roiMonths: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface UpdateImplementationRequest {
  status?: 'started' | 'in-progress' | 'completed';
  progressPercentage?: number;
}

export interface ImplementationStats {
  totalImplementations: number;
  completedImplementations: number;
  inProgressImplementations: number;
  totalEstimatedSavings: number;
  totalEstimatedCo2Reduction: number;
  completedSavings: number;
  completedCo2Reduction: number;
}

// API response types
export interface ImplementationResponse {
  success: boolean;
  implementation: Implementation;
  message: string;
}

export interface ImplementationsListResponse {
  success: boolean;
  implementations: Implementation[];
  totalCount: number;
}

export interface ImplementationStatsResponse {
  success: boolean;
  stats: ImplementationStats;
}

// API functions
export const implementationApi = {
  /**
   * Create a new implementation from a recommendation
   */
  async create(data: CreateImplementationRequest): Promise<ImplementationResponse> {
    try {
      console.log('🚀 Creating implementation with data:', data);
      
      const response = await fetch(`${API_BASE_URL}/implementation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Backend error response:', errorData);
        
        // Show detailed validation errors if available
        if (errorData.details && Array.isArray(errorData.details)) {
          const validationErrors = errorData.details.map((detail: any) => 
            `${detail.path?.join?.('.') || 'Field'}: ${detail.message}`
          ).join('\n');
          throw new Error(`Validation Error:\n${validationErrors}`);
        }
        
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating implementation:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to create implementation'
      );
    }
  },

  /**
   * Get all implementations for a user
   */
  async getByUser(userId: string, status?: string): Promise<ImplementationsListResponse> {
    try {
      const url = new URL(`${API_BASE_URL}/implementation/user/${userId}`);
      if (status) {
        url.searchParams.append('status', status);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching implementations:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to fetch implementations'
      );
    }
  },

  /**
   * Update implementation status or progress
   */
  async update(id: string, data: UpdateImplementationRequest): Promise<ImplementationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/implementation/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating implementation:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to update implementation'
      );
    }
  },

  /**
   * Get implementation statistics for dashboard
   */
  async getStats(userId: string): Promise<ImplementationStatsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/implementation/stats/${userId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching implementation stats:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to fetch implementation stats'
      );
    }
  },
};

// Helper functions
export function getStatusColor(status: Implementation['status']) {
  switch (status) {
    case 'started':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'in-progress':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getStatusLabel(status: Implementation['status']) {
  switch (status) {
    case 'started':
      return 'Just Started';
    case 'in-progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    default:
      return 'Unknown';
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCo2(amount: number): string {
  return `${amount.toFixed(1)} tons CO₂`;
}

// Enhanced ROI Calculation Functions
export interface ROIMetrics {
  currentROI: number; // Current ROI percentage based on time elapsed
  projectedAnnualROI: number; // Projected annual ROI
  paybackProgress: number; // Percentage of payback period completed
  actualMonthsToPayback: number; // Actual months to payback based on current progress
  timeValue: number; // Current value generated based on time elapsed
  efficiencyScore: number; // How efficiently the implementation is progressing (0-100)
}

export function calculateROIMetrics(implementation: Implementation): ROIMetrics {
  const now = Date.now();
  const startTime = new Date(implementation.started_at).getTime();
  const monthsElapsed = (now - startTime) / (30 * 24 * 60 * 60 * 1000); // Approximate months
  
  // Calculate current progress-based value
  const progressMultiplier = implementation.progress_percentage / 100;
  const timeBasedProgress = Math.min(monthsElapsed / implementation.roi_months, 1);
  
  // Use the higher of progress-reported or time-based progress for conservative estimates
  const effectiveProgress = Math.max(progressMultiplier, timeBasedProgress * 0.7); // Time-based is weighted lower
  
  // Current value generated (conservative estimate)
  const currentValue = implementation.estimated_cost_savings * effectiveProgress;
  
  // Calculate ROI metrics
  const estimatedImplementationCost = implementation.estimated_cost_savings / (12 / implementation.roi_months);
  const currentROI = estimatedImplementationCost > 0 ? (currentValue / estimatedImplementationCost) * 100 : 0;
  
  const projectedAnnualROI = estimatedImplementationCost > 0 
    ? (implementation.estimated_cost_savings / estimatedImplementationCost) * 100 
    : 0;
  
  const paybackProgress = Math.min((monthsElapsed / implementation.roi_months) * 100, 100);
  
  const actualMonthsToPayback = effectiveProgress > 0 
    ? implementation.roi_months / effectiveProgress 
    : implementation.roi_months;
  
  const timeValue = currentValue;
  
  // Efficiency score: how well the implementation is tracking against estimates
  const expectedProgressAtTime = Math.min((monthsElapsed / implementation.roi_months) * 100, 100);
  const actualProgress = implementation.progress_percentage;
  const efficiencyScore = expectedProgressAtTime > 0 
    ? Math.min((actualProgress / expectedProgressAtTime) * 100, 100)
    : actualProgress;

  return {
    currentROI: Math.round(currentROI * 10) / 10,
    projectedAnnualROI: Math.round(projectedAnnualROI * 10) / 10,
    paybackProgress: Math.round(paybackProgress * 10) / 10,
    actualMonthsToPayback: Math.round(actualMonthsToPayback * 10) / 10,
    timeValue: Math.round(timeValue * 100) / 100,
    efficiencyScore: Math.round(efficiencyScore * 10) / 10
  };
}

export interface PortfolioROI {
  totalInvestment: number;
  totalCurrentValue: number;
  totalProjectedAnnualValue: number;
  portfolioROI: number;
  averagePaybackMonths: number;
  totalCO2Impact: number;
  implementationEfficiency: number;
}

export function calculatePortfolioROI(implementations: Implementation[]): PortfolioROI {
  if (implementations.length === 0) {
    return {
      totalInvestment: 0,
      totalCurrentValue: 0,
      totalProjectedAnnualValue: 0,
      portfolioROI: 0,
      averagePaybackMonths: 0,
      totalCO2Impact: 0,
      implementationEfficiency: 0
    };
  }

  let totalInvestment = 0;
  let totalCurrentValue = 0;
  let totalProjectedAnnualValue = 0;
  let totalCO2Impact = 0;
  let totalEfficiencyScore = 0;
  let totalPaybackMonths = 0;

  implementations.forEach(impl => {
    const roiMetrics = calculateROIMetrics(impl);
    const estimatedCost = impl.estimated_cost_savings / (12 / impl.roi_months);
    
    totalInvestment += estimatedCost;
    totalCurrentValue += roiMetrics.timeValue;
    totalProjectedAnnualValue += impl.estimated_cost_savings;
    totalCO2Impact += impl.estimated_co2_reduction;
    totalEfficiencyScore += roiMetrics.efficiencyScore;
    totalPaybackMonths += impl.roi_months;
  });

  const portfolioROI = totalInvestment > 0 
    ? ((totalCurrentValue / totalInvestment) * 100)
    : 0;

  return {
    totalInvestment: Math.round(totalInvestment * 100) / 100,
    totalCurrentValue: Math.round(totalCurrentValue * 100) / 100,
    totalProjectedAnnualValue: Math.round(totalProjectedAnnualValue * 100) / 100,
    portfolioROI: Math.round(portfolioROI * 10) / 10,
    averagePaybackMonths: Math.round((totalPaybackMonths / implementations.length) * 10) / 10,
    totalCO2Impact: Math.round(totalCO2Impact * 10) / 10,
    implementationEfficiency: Math.round((totalEfficiencyScore / implementations.length) * 10) / 10
  };
}

// ROI Status Classification
export function getROIStatus(roi: number): {
  status: 'excellent' | 'good' | 'moderate' | 'poor';
  color: string;
  label: string;
} {
  if (roi >= 200) {
    return { status: 'excellent', color: 'text-green-600', label: 'Excellent ROI' };
  } else if (roi >= 100) {
    return { status: 'good', color: 'text-blue-600', label: 'Good ROI' };
  } else if (roi >= 50) {
    return { status: 'moderate', color: 'text-yellow-600', label: 'Moderate ROI' };
  } else {
    return { status: 'poor', color: 'text-red-600', label: 'Developing ROI' };
  }
}

export function formatROI(roi: number): string {
  return `${roi > 0 ? '+' : ''}${roi.toFixed(1)}%`;
}

export function formatMonths(months: number): string {
  if (months < 1) {
    return 'Less than 1 month';
  } else if (months === 1) {
    return '1 month';
  } else if (months < 12) {
    return `${Math.round(months)} months`;
  } else {
    const years = Math.round(months / 12 * 10) / 10;
    return years === 1 ? '1 year' : `${years} years`;
  }
} 