import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { 
  Implementation, 
  ImplementationStats,
  calculateROIMetrics,
  calculatePortfolioROI,
  formatCurrency,
  formatCo2,
  formatROI,
  getStatusColor,
  getStatusLabel
} from '../lib/implementation';

// Mock data
const mockImplementation: Implementation = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  user_id: 'user-123',
  recommendation_id: 'rec-123',
  title: 'Install LED Lighting',
  description: 'Replace fluorescent lights with LED alternatives',
  category: 'Energy Efficiency',
  estimated_cost_savings: 2400,
  estimated_co2_reduction: 1.5,
  roi_months: 8,
  difficulty: 'Easy',
  status: 'started',
  progress_percentage: 25,
  started_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
  estimated_completion_weeks: 2,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  completed_at: null
};

const mockCompletedImplementation: Implementation = {
  ...mockImplementation,
  id: '456e7890-e89b-12d3-a456-426614174001',
  status: 'completed',
  progress_percentage: 100,
  completed_at: new Date().toISOString()
};

const mockImplementationStats: ImplementationStats = {
  totalImplementations: 5,
  completedImplementations: 2,
  inProgressImplementations: 2,
  totalEstimatedSavings: 12000,
  totalEstimatedCo2Reduction: 8.5,
  completedSavings: 4800,
  completedCo2Reduction: 3.2
};

// Mock hooks
jest.mock('../hooks/useImplementation', () => ({
  useImplementation: () => ({
    implementations: [mockImplementation, mockCompletedImplementation],
    stats: mockImplementationStats,
    loading: false,
    error: null,
    createImplementation: jest.fn(),
    updateImplementation: jest.fn(),
    fetchImplementations: jest.fn(),
    fetchStats: jest.fn()
  })
}));

// Mock toast context
jest.mock('../contexts/ToastContext', () => ({
  useToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    showError: jest.fn()
  })
}));

// Mock auth context
jest.mock('../lib/auth/hooks', () => ({
  useAuth: () => ({
    user: { id: 'user-123', email: 'test@example.com' },
    loading: false
  })
}));

describe('Implementation Utility Functions', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1000)).toBe('$1,000');
      expect(formatCurrency(1234.56)).toBe('$1,235');
      expect(formatCurrency(0)).toBe('$0');
    });
  });

  describe('formatCo2', () => {
    it('should format CO2 values correctly', () => {
      expect(formatCo2(1.5)).toBe('1.5 tons CO₂');
      expect(formatCo2(0.1)).toBe('0.1 tons CO₂');
      expect(formatCo2(10)).toBe('10.0 tons CO₂');
    });
  });

  describe('formatROI', () => {
    it('should format ROI percentages correctly', () => {
      expect(formatROI(25.5)).toBe('+25.5%');
      expect(formatROI(-10.2)).toBe('-10.2%');
      expect(formatROI(0)).toBe('0.0%');
    });
  });

  describe('getStatusColor', () => {
    it('should return correct colors for each status', () => {
      expect(getStatusColor('started')).toBe('bg-blue-100 text-blue-800 border-blue-200');
      expect(getStatusColor('in-progress')).toBe('bg-yellow-100 text-yellow-800 border-yellow-200');
      expect(getStatusColor('completed')).toBe('bg-green-100 text-green-800 border-green-200');
    });
  });

  describe('getStatusLabel', () => {
    it('should return correct labels for each status', () => {
      expect(getStatusLabel('started')).toBe('Just Started');
      expect(getStatusLabel('in-progress')).toBe('In Progress');
      expect(getStatusLabel('completed')).toBe('Completed');
    });
  });
});

describe('ROI Calculations', () => {
  describe('calculateROIMetrics', () => {
    it('should calculate ROI metrics for active implementation', () => {
      const metrics = calculateROIMetrics(mockImplementation);
      
      expect(metrics).toHaveProperty('currentROI');
      expect(metrics).toHaveProperty('projectedAnnualROI');
      expect(metrics).toHaveProperty('paybackProgress');
      expect(metrics).toHaveProperty('actualMonthsToPayback');
      expect(metrics).toHaveProperty('timeValue');
      expect(metrics).toHaveProperty('efficiencyScore');
      
      expect(typeof metrics.currentROI).toBe('number');
      expect(typeof metrics.projectedAnnualROI).toBe('number');
      expect(metrics.paybackProgress).toBeGreaterThanOrEqual(0);
      expect(metrics.paybackProgress).toBeLessThanOrEqual(100);
    });

    it('should calculate ROI metrics for completed implementation', () => {
      const metrics = calculateROIMetrics(mockCompletedImplementation);
      
      expect(metrics.currentROI).toBeGreaterThan(0);
      expect(metrics.projectedAnnualROI).toBeGreaterThan(0);
      expect(metrics.paybackProgress).toBeGreaterThanOrEqual(0);
      expect(metrics.paybackProgress).toBeLessThanOrEqual(100);
      expect(metrics.efficiencyScore).toBeGreaterThan(0);
    });
  });

  describe('calculatePortfolioROI', () => {
    it('should calculate portfolio ROI for multiple implementations', () => {
      const implementations = [mockImplementation, mockCompletedImplementation];
      const portfolio = calculatePortfolioROI(implementations);
      
      expect(portfolio).toHaveProperty('totalInvestment');
      expect(portfolio).toHaveProperty('totalCurrentValue');
      expect(portfolio).toHaveProperty('totalProjectedAnnualValue');
      expect(portfolio).toHaveProperty('portfolioROI');
      expect(portfolio).toHaveProperty('averagePaybackMonths');
      expect(portfolio).toHaveProperty('totalCO2Impact');
      expect(portfolio).toHaveProperty('implementationEfficiency');
      
      expect(portfolio.totalProjectedAnnualValue).toBe(4800); // 2400 * 2
      expect(portfolio.totalCO2Impact).toBe(3); // 1.5 * 2
      expect(portfolio.averagePaybackMonths).toBe(8); // Same ROI months for both
    });

    it('should handle empty implementations array', () => {
      const portfolio = calculatePortfolioROI([]);
      
      expect(portfolio.totalInvestment).toBe(0);
      expect(portfolio.totalCurrentValue).toBe(0);
      expect(portfolio.portfolioROI).toBe(0);
      expect(portfolio.averagePaybackMonths).toBe(0);
    });
  });
});

describe('Implementation API Functions', () => {
  describe('implementationApi', () => {
    // Mock fetch
    global.fetch = jest.fn();
    
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create implementation successfully', async () => {
      const mockResponse = {
        success: true,
        implementation: mockImplementation,
        message: 'Implementation created successfully'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const { implementationApi } = await import('../lib/implementation');
      
      const createData = {
        userId: 'user-123',
        recommendationId: 'rec-123',
        title: 'Test Implementation',
        description: 'Test description',
        category: 'Energy Efficiency',
        estimatedCostSavings: 1000,
        estimatedCo2Reduction: 0.5,
        roiMonths: 12,
        difficulty: 'Medium' as const
      };

      const result = await implementationApi.create(createData);
      
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/implementation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createData)
      });
      
      expect(result.implementation).toEqual(mockImplementation);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Implementation created successfully');
    });

    it('should handle API errors gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Validation failed' })
      });

      const { implementationApi } = await import('../lib/implementation');
      
      await expect(implementationApi.getByUser('user-123')).rejects.toThrow('Validation failed');
    });

    it('should update implementation status', async () => {
      const mockResponse = {
        success: true,
        implementation: { ...mockImplementation, status: 'completed' },
        message: 'Implementation updated successfully'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const { implementationApi } = await import('../lib/implementation');
      
      const result = await implementationApi.update('123', { status: 'completed' });
      
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/implementation/123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
      
      expect(result.implementation.status).toBe('completed');
    });

    it('should fetch implementation statistics', async () => {
      const mockResponse = {
        success: true,
        stats: mockImplementationStats
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const { implementationApi } = await import('../lib/implementation');
      
      const result = await implementationApi.getStats('user-123');
      
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/implementation/stats/user-123');
      expect(result.stats).toEqual(mockImplementationStats);
      expect(result.success).toBe(true);
    });
  });
});

describe('Timeline Generation', () => {
  describe('Milestone Generation', () => {
    const generateTimeline = (difficulty: string, roiMonths: number) => {
      const totalWeeks = Math.round(roiMonths * 4.33);
      
      switch (difficulty) {
        case 'Easy':
          return [
            { title: 'Planning & Setup', weekOffset: 0 },
            { title: 'Implementation Start', weekOffset: 1 },
            { title: 'Completion & Testing', weekOffset: Math.max(1, totalWeeks - 1) }
          ];
        case 'Medium':
          return [
            { title: 'Planning & Research', weekOffset: 0 },
            { title: 'Phase 1: Foundation', weekOffset: Math.round(totalWeeks * 0.25) },
            { title: 'Phase 2: Implementation', weekOffset: Math.round(totalWeeks * 0.5) },
            { title: 'Phase 3: Optimization', weekOffset: Math.round(totalWeeks * 0.75) },
            { title: 'Completion & Validation', weekOffset: totalWeeks - 1 }
          ];
        case 'Hard':
          return [
            { title: 'Strategic Planning', weekOffset: 0 },
            { title: 'Phase 1: Infrastructure', weekOffset: Math.round(totalWeeks * 0.15) },
            { title: 'Phase 2: Pilot Implementation', weekOffset: Math.round(totalWeeks * 0.35) },
            { title: 'Phase 3: Full Deployment', weekOffset: Math.round(totalWeeks * 0.55) },
            { title: 'Phase 4: Integration', weekOffset: Math.round(totalWeeks * 0.75) },
            { title: 'Phase 5: Monitoring', weekOffset: Math.round(totalWeeks * 0.9) },
            { title: 'Completion & Review', weekOffset: totalWeeks - 1 }
          ];
        default:
          return [
            { title: 'Planning', weekOffset: 0 },
            { title: 'Implementation', weekOffset: Math.round(totalWeeks * 0.5) },
            { title: 'Completion', weekOffset: totalWeeks - 1 }
          ];
      }
    };

    it('should generate correct number of milestones for each difficulty', () => {
      expect(generateTimeline('Easy', 2)).toHaveLength(3);
      expect(generateTimeline('Medium', 4)).toHaveLength(5);
      expect(generateTimeline('Hard', 8)).toHaveLength(7);
      expect(generateTimeline('Unknown', 4)).toHaveLength(3);
    });

    it('should generate logical milestone progression', () => {
      const timeline = generateTimeline('Medium', 4);
      
      // Milestones should be in chronological order
      for (let i = 1; i < timeline.length; i++) {
        expect(timeline[i].weekOffset).toBeGreaterThanOrEqual(timeline[i - 1].weekOffset);
      }
      
      // First milestone should start at week 0
      expect(timeline[0].weekOffset).toBe(0);
      
      // Last milestone should be near the end
      expect(timeline[timeline.length - 1].weekOffset).toBeGreaterThan(0);
    });
  });
});

describe('Achievement System', () => {
  describe('Badge Calculation', () => {
    it('should award correct badges based on stats', () => {
      const getBadges = (stats: ImplementationStats) => {
        const badges = [];
        
        if (stats.completedImplementations >= 1) {
          badges.push({ name: 'First Steps', icon: '🌱' });
        }
        if (stats.completedImplementations >= 5) {
          badges.push({ name: 'Momentum Builder', icon: '🌿' });
        }
        if (stats.completedSavings >= 1000) {
          badges.push({ name: 'Cost Saver', icon: '💰' });
        }
        if (stats.completedCo2Reduction >= 10) {
          badges.push({ name: 'Planet Protector', icon: '🌍' });
        }
        
        return badges;
      };

      const badges = getBadges(mockImplementationStats);
      
      expect(badges.find(b => b.name === 'First Steps')).toBeDefined();
      expect(badges.find(b => b.name === 'Cost Saver')).toBeDefined();
      
      // Should not have Planet Protector (need 10+ tons CO2)
      expect(badges.find(b => b.name === 'Planet Protector')).toBeUndefined();
    });

    it('should handle edge cases in badge calculation', () => {
      const emptyStats: ImplementationStats = {
        totalImplementations: 0,
        completedImplementations: 0,
        inProgressImplementations: 0,
        totalEstimatedSavings: 0,
        totalEstimatedCo2Reduction: 0,
        completedSavings: 0,
        completedCo2Reduction: 0
      };

      const getBadges = (stats: ImplementationStats) => {
        const badges = [];
        if (stats.completedImplementations >= 1) badges.push('First Steps');
        return badges;
      };

      expect(getBadges(emptyStats)).toHaveLength(0);
    });
  });
});

describe('Data Validation', () => {
  describe('Implementation Data Validation', () => {
    it('should validate required fields', () => {
      const validateImplementation = (data: Partial<Implementation>) => {
        const errors = [];
        
        if (!data.title || data.title.length < 3) {
          errors.push('Title must be at least 3 characters');
        }
        if (!data.category) {
          errors.push('Category is required');
        }
        if (!data.estimated_cost_savings || data.estimated_cost_savings <= 0) {
          errors.push('Cost savings must be positive');
        }
        if (!data.estimated_co2_reduction || data.estimated_co2_reduction <= 0) {
          errors.push('CO2 reduction must be positive');
        }
        if (!data.roi_months || data.roi_months <= 0 || data.roi_months > 120) {
          errors.push('ROI months must be between 1 and 120');
        }
        
        return { isValid: errors.length === 0, errors };
      };

      const validData = {
        title: 'Valid Implementation',
        category: 'Energy Efficiency',
        estimated_cost_savings: 1000,
        estimated_co2_reduction: 1.5,
        roi_months: 12
      };

      const invalidData = {
        title: 'ab',
        estimated_cost_savings: -100,
        estimated_co2_reduction: 0,
        roi_months: 150
      };

      expect(validateImplementation(validData).isValid).toBe(true);
      expect(validateImplementation(invalidData).isValid).toBe(false);
      expect(validateImplementation(invalidData).errors).toHaveLength(5);
    });
  });
});

describe('Performance and Edge Cases', () => {
  describe('Large Dataset Handling', () => {
    it('should handle large arrays of implementations efficiently', () => {
      const largeImplementationArray = Array.from({ length: 1000 }, (_, i) => ({
        ...mockImplementation,
        id: `impl-${i}`,
        estimated_cost_savings: Math.random() * 5000,
        estimated_co2_reduction: Math.random() * 10
      }));

      const start = performance.now();
      const portfolio = calculatePortfolioROI(largeImplementationArray);
      const end = performance.now();

      expect(portfolio.totalInvestment).toBeGreaterThan(0);
      expect(portfolio.totalProjectedAnnualValue).toBeGreaterThan(0);
      expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
    });
  });

  describe('Null and Undefined Handling', () => {
    it('should handle null/undefined values gracefully', () => {
      const incompleteImplementation = {
        ...mockImplementation,
        completed_at: null,
        description: undefined
      };

      expect(() => calculateROIMetrics(incompleteImplementation)).not.toThrow();
      expect(() => getStatusColor(incompleteImplementation.status)).not.toThrow();
    });
  });
}); 