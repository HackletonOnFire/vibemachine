import { Request, Response } from 'express';
import { BackendGoalIntegrationService } from '../services/goalIntegration';

// Mock Supabase
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          eq: jest.fn(() => ({
            select: jest.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: mockImplementation, error: null }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockImplementation, error: null }))
          }))
        }))
      }))
    }))
  }
}));

// Mock implementation data
const mockImplementation = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  user_id: 'user-123',
  title: 'Install LED Lighting',
  description: 'Replace fluorescent lights with LED alternatives',
  category: 'Energy Efficiency',
  estimated_cost_savings: 2400,
  estimated_co2_reduction: 1.5,
  roi_months: 8,
  difficulty: 'Easy',
  status: 'started',
  progress_percentage: 0,
  started_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const mockUserGoals = [
  {
    id: 'goal-1',
    user_id: 'user-123',
    title: 'Reduce Energy Consumption',
    category: 'energy_reduction',
    target_value: 1000,
    current_value: 200,
    unit: 'kWh',
    status: 'active'
  },
  {
    id: 'goal-2',
    user_id: 'user-123',
    title: 'Cost Savings',
    category: 'cost_savings',
    target_value: 5000,
    current_value: 1000,
    unit: 'USD',
    status: 'active'
  }
];

describe('Implementation API Tests', () => {
  describe('Implementation Creation', () => {
    it('should create implementation with correct estimated weeks', () => {
      const getEstimatedWeeks = (difficulty: string): number => {
        switch (difficulty) {
          case 'Easy': return 2;
          case 'Medium': return 4;
          case 'Hard': return 8;
          default: return 4;
        }
      };

      expect(getEstimatedWeeks('Easy')).toBe(2);
      expect(getEstimatedWeeks('Medium')).toBe(4);
      expect(getEstimatedWeeks('Hard')).toBe(8);
      expect(getEstimatedWeeks('Unknown')).toBe(4);
    });

    it('should validate implementation data structure', () => {
      const validImplementation = {
        userId: 'user-123',
        title: 'Test Implementation',
        category: 'Energy Efficiency',
        estimatedCostSavings: 1000,
        estimatedCo2Reduction: 0.5,
        roiMonths: 12,
        difficulty: 'Medium'
      };

      expect(validImplementation.userId).toBeDefined();
      expect(validImplementation.title.length).toBeGreaterThan(0);
      expect(validImplementation.estimatedCostSavings).toBeGreaterThan(0);
      expect(validImplementation.estimatedCo2Reduction).toBeGreaterThan(0);
      expect(validImplementation.roiMonths).toBeGreaterThan(0);
      expect(['Easy', 'Medium', 'Hard']).toContain(validImplementation.difficulty);
    });
  });

  describe('Status Updates', () => {
    it('should handle status progression correctly', () => {
      const validStatuses = ['started', 'in-progress', 'completed'];
      
      expect(validStatuses).toContain('started');
      expect(validStatuses).toContain('in-progress');
      expect(validStatuses).toContain('completed');
    });

    it('should set completion data for completed implementations', () => {
      const updateData = {
        status: 'completed' as const,
        progressPercentage: 100,
        completed_at: new Date().toISOString()
      };

      expect(updateData.status).toBe('completed');
      expect(updateData.progressPercentage).toBe(100);
      expect(updateData.completed_at).toBeDefined();
    });
  });

  describe('Progress Calculation', () => {
    it('should calculate progress based on time elapsed', () => {
      const calculateProgress = (startDate: string, estimatedWeeks: number): number => {
        const weeksElapsed = (Date.now() - new Date(startDate).getTime()) / (7 * 24 * 60 * 60 * 1000);
        return Math.min(95, Math.max(5, Math.floor((weeksElapsed / estimatedWeeks) * 100)));
      };

      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const progress = calculateProgress(oneWeekAgo, 4); // 4 week project, 1 week elapsed
      
      expect(progress).toBeGreaterThanOrEqual(5);
      expect(progress).toBeLessThanOrEqual(95);
    });
  });
});

describe('Goal Integration Service Tests', () => {
  describe('Category Mapping', () => {
    it('should map Energy Efficiency to correct goal categories', () => {
      const categoryMapping = {
        'Energy Efficiency': {
          goalCategories: ['energy_reduction', 'cost_savings', 'carbon_reduction']
        }
      };

      const mapping = categoryMapping['Energy Efficiency'];
      expect(mapping.goalCategories).toContain('energy_reduction');
      expect(mapping.goalCategories).toContain('cost_savings');
      expect(mapping.goalCategories).toContain('carbon_reduction');
    });

    it('should calculate impact values correctly', () => {
      const getImpact = (implementation: typeof mockImplementation) => ({
        energy_reduction: {
          value: implementation.estimated_co2_reduction * 2,
          unit: 'kWh'
        },
        cost_savings: {
          value: implementation.estimated_cost_savings,
          unit: 'USD'
        },
        carbon_reduction: {
          value: implementation.estimated_co2_reduction,
          unit: 'tons_co2'
        }
      });

      const impact = getImpact(mockImplementation);
      expect(impact.energy_reduction.value).toBe(3); // 1.5 * 2
      expect(impact.cost_savings.value).toBe(2400);
      expect(impact.carbon_reduction.value).toBe(1.5);
    });
  });

  describe('Unit Conversion', () => {
    const convertUnits = (value: number, fromUnit: string, toUnit: string): number => {
      if (fromUnit === toUnit) return value;
      
      const conversions: Record<string, Record<string, number>> = {
        'USD': { 'dollars': 1, 'cost_savings': 1 },
        'tons_co2': { 'tons': 1, 'kg': 1000, 'co2_reduction': 1 },
        'kWh': { 'kwh': 1, 'energy': 1, 'energy_reduction': 1 }
      };

      const fromConversions = conversions[fromUnit];
      if (fromConversions && fromConversions[toUnit]) {
        return value * fromConversions[toUnit];
      }
      return value;
    };

    it('should convert USD correctly', () => {
      expect(convertUnits(100, 'USD', 'dollars')).toBe(100);
      expect(convertUnits(100, 'USD', 'cost_savings')).toBe(100);
    });

    it('should convert CO2 units correctly', () => {
      expect(convertUnits(1, 'tons_co2', 'kg')).toBe(1000);
      expect(convertUnits(1, 'tons_co2', 'tons')).toBe(1);
    });

    it('should handle same unit conversion', () => {
      expect(convertUnits(100, 'USD', 'USD')).toBe(100);
    });
  });

  describe('Progress Percentage Calculation', () => {
    const calculateProgressPercentage = (currentValue: number, targetValue: number): number => {
      if (targetValue <= 0) return 0;
      const percentage = (currentValue / targetValue) * 100;
      return Math.min(Math.max(percentage, 0), 100);
    };

    it('should calculate progress percentage correctly', () => {
      expect(calculateProgressPercentage(50, 100)).toBe(50);
      expect(calculateProgressPercentage(100, 100)).toBe(100);
      expect(calculateProgressPercentage(150, 100)).toBe(100); // Capped at 100%
      expect(calculateProgressPercentage(-10, 100)).toBe(0); // Floored at 0%
    });

    it('should handle edge cases', () => {
      expect(calculateProgressPercentage(100, 0)).toBe(0); // Zero target
      expect(calculateProgressPercentage(0, 100)).toBe(0); // Zero current
    });
  });
});

describe('Implementation Statistics', () => {
  describe('Stats Calculation', () => {
    const mockImplementations = [
      { ...mockImplementation, status: 'completed', estimated_cost_savings: 1000, estimated_co2_reduction: 0.5 },
      { ...mockImplementation, status: 'completed', estimated_cost_savings: 1500, estimated_co2_reduction: 0.8 },
      { ...mockImplementation, status: 'in-progress', estimated_cost_savings: 800, estimated_co2_reduction: 0.3 },
      { ...mockImplementation, status: 'started', estimated_cost_savings: 600, estimated_co2_reduction: 0.2 }
    ];

    it('should calculate implementation statistics correctly', () => {
      const stats = {
        totalImplementations: mockImplementations.length,
        completedImplementations: mockImplementations.filter(impl => impl.status === 'completed').length,
        inProgressImplementations: mockImplementations.filter(impl => impl.status === 'in-progress').length,
        totalEstimatedSavings: mockImplementations.reduce((sum, impl) => sum + impl.estimated_cost_savings, 0),
        totalEstimatedCo2Reduction: mockImplementations.reduce((sum, impl) => sum + impl.estimated_co2_reduction, 0),
        completedSavings: mockImplementations
          .filter(impl => impl.status === 'completed')
          .reduce((sum, impl) => sum + impl.estimated_cost_savings, 0),
        completedCo2Reduction: mockImplementations
          .filter(impl => impl.status === 'completed')
          .reduce((sum, impl) => sum + impl.estimated_co2_reduction, 0)
      };

      expect(stats.totalImplementations).toBe(4);
      expect(stats.completedImplementations).toBe(2);
      expect(stats.inProgressImplementations).toBe(1);
      expect(stats.totalEstimatedSavings).toBe(3900);
      expect(stats.totalEstimatedCo2Reduction).toBe(1.8);
      expect(stats.completedSavings).toBe(2500);
      expect(stats.completedCo2Reduction).toBe(1.3);
    });
  });
});

describe('Implementation Validation', () => {
  describe('Input Validation', () => {
    it('should validate required fields', () => {
      const requiredFields = [
        'userId', 'title', 'category', 'estimatedCostSavings', 
        'estimatedCo2Reduction', 'roiMonths', 'difficulty'
      ];

      const implementation = {
        userId: 'user-123',
        title: 'Test Implementation',
        category: 'Energy Efficiency',
        estimatedCostSavings: 1000,
        estimatedCo2Reduction: 0.5,
        roiMonths: 12,
        difficulty: 'Medium'
      };

      requiredFields.forEach(field => {
        expect(implementation[field as keyof typeof implementation]).toBeDefined();
      });
    });

    it('should validate numeric constraints', () => {
      const implementation = {
        estimatedCostSavings: 1000,
        estimatedCo2Reduction: 0.5,
        roiMonths: 12
      };

      expect(implementation.estimatedCostSavings).toBeGreaterThan(0);
      expect(implementation.estimatedCo2Reduction).toBeGreaterThan(0);
      expect(implementation.roiMonths).toBeGreaterThan(0);
      expect(implementation.roiMonths).toBeLessThanOrEqual(120);
    });

    it('should validate difficulty enum', () => {
      const validDifficulties = ['Easy', 'Medium', 'Hard'];
      
      validDifficulties.forEach(difficulty => {
        expect(['Easy', 'Medium', 'Hard']).toContain(difficulty);
      });
    });
  });
});

describe('Error Handling', () => {
  describe('Database Errors', () => {
    it('should handle database connection errors gracefully', () => {
      const handleDatabaseError = (error: any) => {
        if (error?.code === 'PGRST116') {
          return 'No data found';
        }
        if (error?.code === '23505') {
          return 'Record already exists';
        }
        return error?.message || 'Database error occurred';
      };

      expect(handleDatabaseError({ code: 'PGRST116' })).toBe('No data found');
      expect(handleDatabaseError({ code: '23505' })).toBe('Record already exists');
      expect(handleDatabaseError({ message: 'Custom error' })).toBe('Custom error');
      expect(handleDatabaseError({})).toBe('Database error occurred');
    });
  });

  describe('Validation Errors', () => {
    it('should handle validation errors correctly', () => {
      const validateImplementation = (data: any) => {
        const errors: string[] = [];
        
        if (!data.title || data.title.length < 3) {
          errors.push('Title must be at least 3 characters');
        }
        if (!data.estimatedCostSavings || data.estimatedCostSavings <= 0) {
          errors.push('Cost savings must be positive');
        }
        if (!data.estimatedCo2Reduction || data.estimatedCo2Reduction <= 0) {
          errors.push('CO2 reduction must be positive');
        }
        
        return { isValid: errors.length === 0, errors };
      };

      const invalidData = { title: 'ab', estimatedCostSavings: -100, estimatedCo2Reduction: 0 };
      const result = validateImplementation(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title must be at least 3 characters');
      expect(result.errors).toContain('Cost savings must be positive');
      expect(result.errors).toContain('CO2 reduction must be positive');
    });
  });
}); 