import { supabase } from '../lib/supabase';

/**
 * Backend Goal Integration Service
 * 
 * Automatically updates sustainability goals when implementations are completed
 */

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
    getImpact: (implementation: any) => ({
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
    })
  },
  'Renewable Energy': {
    goalCategories: ['renewable_energy', 'energy_reduction', 'carbon_reduction'],
    getImpact: (implementation: any) => ({
      renewable_energy: {
        value: implementation.estimated_co2_reduction * 1.5,
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
    getImpact: (implementation: any) => ({
      water_reduction: {
        value: implementation.estimated_cost_savings * 0.5,
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
    getImpact: (implementation: any) => ({
      waste_reduction: {
        value: implementation.estimated_co2_reduction * 10,
        unit: 'lbs'
      },
      recycling: {
        value: implementation.estimated_co2_reduction * 5,
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
    getImpact: (implementation: any) => ({
      transport_efficiency: {
        value: implementation.estimated_co2_reduction * 20,
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
    getImpact: (implementation: any) => ({
      operational_efficiency: {
        value: implementation.estimated_cost_savings * 0.1,
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

class BackendGoalIntegrationService {
  /**
   * Updates sustainability goals when an implementation is completed
   */
  static async updateGoalsOnImplementationCompletion(
    implementation: any,
    userId: string
  ): Promise<GoalUpdateResult> {
    try {
      console.log(`🎯 Starting goal integration for implementation: ${implementation.title}`);
      
      // Get user's active goals
      const { data: userGoals, error: goalsError } = await supabase
        .from('sustainability_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (goalsError || !userGoals) {
        console.error('Failed to fetch user goals:', goalsError);
        return {
          success: false,
          goalsUpdated: 0,
          totalImpact: 0,
          error: 'Failed to fetch user goals'
        };
      }

      console.log(`📊 Found ${userGoals.length} active goals for user`);

      // Calculate goal impacts based on implementation
      const goalImpacts = this.calculateGoalImpacts(implementation, userGoals);
      
      if (goalImpacts.length === 0) {
        console.log('📝 No matching goals found for this implementation category');
        return {
          success: true,
          goalsUpdated: 0,
          totalImpact: 0,
          error: 'No matching goals found for this implementation'
        };
      }

      // Update goals in batch
      let goalsUpdated = 0;
      let totalImpact = 0;

      for (const impact of goalImpacts) {
        const newCurrentValue = impact.currentValue + impact.impactAmount;
        const newProgressPercentage = this.calculateProgressPercentage(newCurrentValue, impact.targetValue);

        const { error: updateError } = await supabase
          .from('sustainability_goals')
          .update({
            current_value: newCurrentValue,
            progress_percentage: newProgressPercentage,
            last_updated_value: impact.impactAmount,
            last_measured_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', impact.goalId);

        if (!updateError) {
          goalsUpdated++;
          totalImpact += impact.impactAmount;
          console.log(`✅ Updated goal: ${impact.category} - +${impact.impactAmount} ${impact.unit}`);
        } else {
          console.error(`❌ Failed to update goal ${impact.goalId}:`, updateError);
        }
      }
      
      console.log(`✅ Successfully updated ${goalsUpdated} goals with total impact: ${totalImpact}`);
      
      return {
        success: true,
        goalsUpdated,
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
  private static calculateGoalImpacts(implementation: any, userGoals: any[]) {
    const impacts: any[] = [];
    
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
}

export { BackendGoalIntegrationService }; 