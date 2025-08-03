import { goalOperations } from './database';
import { Implementation } from './implementation';

/**
 * Goal Integration Service
 * 
 * Automatically updates sustainability goals when implementations are completed
 * Maps implementation categories to relevant goals and updates progress accordingly
 */

interface GoalImpact {
  goalId: string;
  category: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  impactAmount: number; // Amount to add to current progress
  impactType: 'reduction' | 'savings' | 'efficiency';
}

interface GoalUpdateResult {
  success: boolean;
  goalsUpdated: number;
  totalImpact: number;
  error?: string;
}

// Mapping of implementation categories to goal categories and impact calculations
const IMPLEMENTATION_TO_GOAL_MAPPING = {
  'Energy Efficiency': {
    goalCategories: ['energy_reduction', 'cost_savings', 'carbon_reduction'],
    getImpact: (implementation: Implementation) => ({
      energy_reduction: {
        value: implementation.estimated_co2_reduction * 2, // CO2 often correlates with energy usage
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
    })
  },
  'Renewable Energy': {
    goalCategories: ['renewable_energy', 'energy_reduction', 'carbon_reduction'],
    getImpact: (implementation: Implementation) => ({
      renewable_energy: {
        value: implementation.estimated_co2_reduction * 1.5, // Estimate renewable capacity
        unit: 'kW'
      },
      energy_reduction: {
        value: implementation.estimated_co2_reduction * 2,
        unit: 'kWh'
      },
      carbon_reduction: {
        value: implementation.estimated_co2_reduction,
        unit: 'tons_co2'
      }
    })
  },
  'Water Conservation': {
    goalCategories: ['water_reduction', 'cost_savings'],
    getImpact: (implementation: Implementation) => ({
      water_reduction: {
        value: implementation.estimated_cost_savings * 0.5, // Estimate water savings from cost
        unit: 'gallons'
      },
      cost_savings: {
        value: implementation.estimated_cost_savings,
        unit: 'USD'
      }
    })
  },
  'Waste Reduction': {
    goalCategories: ['waste_reduction', 'cost_savings', 'recycling'],
    getImpact: (implementation: Implementation) => ({
      waste_reduction: {
        value: implementation.estimated_co2_reduction * 10, // Estimate waste reduction
        unit: 'lbs'
      },
      recycling: {
        value: implementation.estimated_co2_reduction * 5, // Estimate recycling increase
        unit: 'lbs'
      },
      cost_savings: {
        value: implementation.estimated_cost_savings,
        unit: 'USD'
      }
    })
  },
  'Transportation': {
    goalCategories: ['transport_efficiency', 'carbon_reduction', 'cost_savings'],
    getImpact: (implementation: Implementation) => ({
      transport_efficiency: {
        value: implementation.estimated_co2_reduction * 20, // Estimate miles/efficiency
        unit: 'miles'
      },
      carbon_reduction: {
        value: implementation.estimated_co2_reduction,
        unit: 'tons_co2'
      },
      cost_savings: {
        value: implementation.estimated_cost_savings,
        unit: 'USD'
      }
    })
  },
  'Operational Efficiency': {
    goalCategories: ['operational_efficiency', 'cost_savings', 'energy_reduction'],
    getImpact: (implementation: Implementation) => ({
      operational_efficiency: {
        value: implementation.estimated_cost_savings * 0.1, // Efficiency metric
        unit: 'percentage'
      },
      cost_savings: {
        value: implementation.estimated_cost_savings,
        unit: 'USD'
      },
      energy_reduction: {
        value: implementation.estimated_co2_reduction * 2,
        unit: 'kWh'
      }
    })
  }
};

class GoalIntegrationService {
  /**
   * Updates sustainability goals when an implementation is completed
   */
  static async updateGoalsOnImplementationCompletion(
    implementation: Implementation,
    userId: string
  ): Promise<GoalUpdateResult> {
    try {
      console.log(`🎯 Starting goal integration for implementation: ${implementation.title}`);
      
      // Get user's active goals
      const goalsResponse = await goalOperations.getUserGoals(userId, 'active');
      if (!goalsResponse.success || !goalsResponse.data) {
        return {
          success: false,
          goalsUpdated: 0,
          totalImpact: 0,
          error: 'Failed to fetch user goals'
        };
      }

      const userGoals = goalsResponse.data;
      console.log(`📊 Found ${userGoals.length} active goals for user`);

      // Calculate goal impacts based on implementation
      const goalImpacts = await this.calculateGoalImpacts(implementation, userGoals);
      
      if (goalImpacts.length === 0) {
        console.log('📝 No matching goals found for this implementation category');
        return {
          success: true,
          goalsUpdated: 0,
          totalImpact: 0,
          error: 'No matching goals found for this implementation'
        };
      }

      // Prepare goal updates
      const goalUpdates = goalImpacts.map(impact => ({
        id: impact.goalId,
        updates: {
          current_value: impact.currentValue + impact.impactAmount,
          progress_percentage: this.calculateProgressPercentage(
            impact.currentValue + impact.impactAmount,
            impact.targetValue
          ),
          last_updated_value: impact.impactAmount,
          last_measured_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }));

      // Batch update goals
      const updateResult = await goalOperations.updateGoalsBatch(goalUpdates);
      
      if (!updateResult.success) {
        return {
          success: false,
          goalsUpdated: 0,
          totalImpact: 0,
          error: updateResult.error
        };
      }

      const totalImpact = goalImpacts.reduce((sum, impact) => sum + impact.impactAmount, 0);
      
      console.log(`✅ Successfully updated ${goalUpdates.length} goals with total impact: ${totalImpact}`);
      
      return {
        success: true,
        goalsUpdated: goalUpdates.length,
        totalImpact,
      };

    } catch (error) {
      console.error('❌ Error in goal integration:', error);
      return {
        success: false,
        goalsUpdated: 0,
        totalImpact: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Calculate which goals should be impacted and by how much
   */
  private static async calculateGoalImpacts(
    implementation: Implementation,
    userGoals: any[]
  ): Promise<GoalImpact[]> {
    const impacts: GoalImpact[] = [];
    
    // Get the mapping for this implementation category
    const categoryMapping = IMPLEMENTATION_TO_GOAL_MAPPING[implementation.category as keyof typeof IMPLEMENTATION_TO_GOAL_MAPPING];
    
    if (!categoryMapping) {
      console.log(`⚠️ No mapping found for implementation category: ${implementation.category}`);
      return impacts;
    }

    // Calculate impact values for this implementation
    const impactCalculations = categoryMapping.getImpact(implementation);
    
    // Match with user's goals
    for (const goal of userGoals) {
      const goalCategory = goal.category.toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      if (categoryMapping.goalCategories.includes(goalCategory)) {
        const impactData = (impactCalculations as any)[goalCategory];
        
        if (impactData && impactData.value !== undefined && impactData.unit !== undefined) {
          // Ensure units match or convert if possible
          const impactAmount = this.convertUnits(impactData.value, impactData.unit, goal.unit);
          
          if (impactAmount > 0) {
            impacts.push({
              goalId: goal.id,
              category: goal.category,
              currentValue: goal.current_value || 0,
              targetValue: goal.target_value,
              unit: goal.unit,
              impactAmount,
              impactType: this.determineImpactType(goalCategory)
            });
            
            console.log(`📈 Goal impact calculated: ${goal.title} - +${impactAmount} ${goal.unit}`);
          }
        }
      }
    }
    
    return impacts;
  }

  /**
   * Convert units when possible, otherwise return original value
   */
  private static convertUnits(value: number, fromUnit: string, toUnit: string): number {
    if (fromUnit === toUnit) return value;
    
    // Define conversion mappings
    const conversions: Record<string, Record<string, number>> = {
      'USD': {
        'dollars': 1,
        'cost_savings': 1
      },
      'tons_co2': {
        'tons': 1,
        'kg': 1000,
        'lbs': 2204.62,
        'co2_reduction': 1
      },
      'kWh': {
        'kwh': 1,
        'energy': 1,
        'energy_reduction': 1
      },
      'percentage': {
        'percent': 1,
        '%': 1,
        'efficiency': 1
      }
    };

    const fromConversions = conversions[fromUnit];
    if (fromConversions && fromConversions[toUnit]) {
      return value * fromConversions[toUnit];
    }

    // If no conversion available, return the value as-is (best effort)
    return value;
  }

  /**
   * Determine the type of impact (reduction, savings, efficiency)
   */
  private static determineImpactType(goalCategory: string): 'reduction' | 'savings' | 'efficiency' {
    if (goalCategory.includes('reduction')) return 'reduction';
    if (goalCategory.includes('savings') || goalCategory.includes('cost')) return 'savings';
    if (goalCategory.includes('efficiency')) return 'efficiency';
    return 'reduction'; // default
  }

  /**
   * Calculate progress percentage with bounds checking
   */
  private static calculateProgressPercentage(currentValue: number, targetValue: number): number {
    if (targetValue <= 0) return 0;
    
    const percentage = (currentValue / targetValue) * 100;
    return Math.min(Math.max(percentage, 0), 100); // Clamp between 0-100%
  }

  /**
   * Get a summary of potential goal impacts for preview purposes
   */
  static async previewGoalImpacts(
    implementation: Implementation,
    userId: string
  ): Promise<{ goalTitle: string; category: string; estimatedImpact: number; unit: string }[]> {
    try {
      const goalsResponse = await goalOperations.getUserGoals(userId, 'active');
      if (!goalsResponse.success || !goalsResponse.data) {
        return [];
      }

      const goalImpacts = await this.calculateGoalImpacts(implementation, goalsResponse.data);
      
      return goalImpacts.map(impact => {
        const goal = goalsResponse.data!.find(g => g.id === impact.goalId);
        return {
          goalTitle: goal?.title || 'Unknown Goal',
          category: impact.category,
          estimatedImpact: impact.impactAmount,
          unit: impact.unit
        };
      });
    } catch (error) {
      console.error('Error previewing goal impacts:', error);
      return [];
    }
  }
}

// Export for use in implementation completion workflows
export { GoalIntegrationService }; 