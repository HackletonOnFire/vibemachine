import { userOperations, energyOperations, goalOperations } from './database';
import { supabase } from './supabase';
import type { User, EnergyDataInsert, SustainabilityGoalInsert } from './types/database';
import type { OnboardingData } from '../components/onboarding/OnboardingWizard';

export interface OnboardingResult {
  success: boolean;
  error?: string;
  data?: {
    user: User;
    energyEntry?: any;
    goalsCreated?: number;
  };
}

/**
 * Complete onboarding service that saves all wizard data to the database
 * properly mapped to the authenticated user
 */
export const onboardingService = {
  /**
   * Save complete onboarding data for the authenticated user
   */
  async saveOnboardingData(
    userId: string, 
    onboardingData: OnboardingData
  ): Promise<OnboardingResult> {
    try {
      console.log('Starting onboarding data save for user:', userId);
      console.log('Onboarding data received:', onboardingData);

      // Step 1: Update user profile with business basics
      const userUpdateResult = await this.updateUserProfile(userId, onboardingData.businessBasics);
      if (!userUpdateResult.success) {
        return {
          success: false,
          error: `Failed to update user profile: ${userUpdateResult.error}`
        };
      }

      // Step 2: Save energy data if provided
      let energyEntry = null;
      if (onboardingData.energyUsage && this.hasEnergyData(onboardingData.energyUsage)) {
        const energyResult = await this.saveEnergyData(userId, onboardingData.energyUsage);
        if (!energyResult.success) {
          console.warn('Failed to save energy data:', energyResult.error);
          // Continue with onboarding even if energy data fails (optional data)
        } else {
          energyEntry = energyResult.data;
        }
      }

      // Step 3: Save sustainability goals if provided
      let goalsCreated = 0;
      if (onboardingData.sustainabilityGoals?.selectedGoals?.length > 0) {
        const goalsResult = await this.saveSustainabilityGoals(userId, onboardingData.sustainabilityGoals);
        if (!goalsResult.success) {
          console.warn('Failed to save sustainability goals:', goalsResult.error);
          // Continue with onboarding even if goals fail (optional data)
        } else {
          goalsCreated = goalsResult.goalsCreated;
        }
      }

      // Step 4: Mark onboarding as complete
      const completionResult = await this.markOnboardingComplete(userId);
      if (!completionResult.success) {
        console.warn('Failed to mark onboarding complete:', completionResult.error);
        // Don't fail the entire process for this
      }

      console.log('Onboarding completed successfully for user:', userId);

      return {
        success: true,
        data: {
          user: userUpdateResult.data!,
          energyEntry,
          goalsCreated
        }
      };

    } catch (error) {
      console.error('Onboarding save error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  /**
   * Update user profile with business basics data
   * Creates the profile if it doesn't exist
   */
  async updateUserProfile(userId: string, businessBasics: any) {
    try {
      // First, ensure the user profile exists
      await this.ensureUserProfileExists(userId);

      const userUpdates = {
        business_name: businessBasics.business_name,
        industry: businessBasics.industry,
        company_size: businessBasics.company_size,
        location: businessBasics.location,
        website: businessBasics.website || null,
        annual_revenue: businessBasics.annual_revenue || null,
        number_of_employees: businessBasics.number_of_employees || null,
        facilities_count: businessBasics.facilities_count || null,
        updated_at: new Date().toISOString()
      };

      return await userOperations.updateProfile(userId, userUpdates);
    } catch (error) {
      console.error('Error updating user profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user profile',
        data: null
      };
    }
  },

  /**
   * Ensure user profile exists in the database
   */
  async ensureUserProfileExists(userId: string) {
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (!existingProfile) {
        console.log('User profile not found, creating new profile for user:', userId);
        
        // Get auth user data for defaults
        const { data: { user: authUser } } = await supabase.auth.getUser();
        const metadata = authUser?.user_metadata || {};
        const fullName = metadata.full_name || metadata.name || '';
        const [firstName, ...lastNameParts] = fullName.split(' ');
        const lastName = lastNameParts.join(' ');

        // Create profile with default values
        const { error: insertError } = await supabase.from('users').insert({
          id: userId,
          email: authUser?.email || '',
          first_name: firstName || '',
          last_name: lastName || '',
          business_name: 'Pending Setup',
          industry: 'other',
          company_size: 'small',
          location: 'TBD', // Must be at least 2 characters due to database constraint
          onboarding_completed: false,
          onboarding_step: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        if (insertError) {
          console.error('Error creating user profile:', insertError);
          throw new Error(`Failed to create user profile: ${insertError.message}`);
        }

        console.log('User profile created successfully for user:', userId);
      }
    } catch (error) {
      console.error('Error ensuring user profile exists:', error);
      throw error;
    }
  },

  /**
   * Save energy usage data for the user
   */
  async saveEnergyData(userId: string, energyUsage: any) {
    const energyData: EnergyDataInsert = {
      user_id: userId,
      measurement_date: new Date().toISOString().split('T')[0], // Today's date
      reading_type: 'billing_period', // Required field for onboarding data
      kwh_usage: energyUsage.kwh_usage || null,
      gas_usage_therms: energyUsage.gas_usage_therms || null,
      gas_usage_ccf: energyUsage.gas_usage_ccf || null,
      water_usage_gallons: energyUsage.water_usage_gallons || null,
      electricity_cost: energyUsage.electricity_cost || null,
      gas_cost: energyUsage.gas_cost || null,
      water_cost: energyUsage.water_cost || null,
      billing_period_start: energyUsage.billing_period_start || null,
      billing_period_end: energyUsage.billing_period_end || null,
      data_source: energyUsage.data_source || 'manual_entry',
      created_at: new Date().toISOString()
    };

    return await energyOperations.addEnergyData(energyData);
  },

  /**
   * Save sustainability goals for the user
   */
  async saveSustainabilityGoals(userId: string, sustainabilityGoals: any) {
    try {
      const goalConfigurations = sustainabilityGoals.selectedGoals || [];
      const targetTimeline = sustainabilityGoals.targetTimeline || '1_year';
      const primaryMotivation = sustainabilityGoals.primaryMotivation || 'cost_savings';
      let goalsCreated = 0;

      // Calculate target date based on timeline
      const targetDate = this.calculateTargetDate(targetTimeline);

      for (const goalConfig of goalConfigurations) {
        const goalData: SustainabilityGoalInsert = {
          user_id: userId,
          title: goalConfig.title,
          description: `${goalConfig.description} (Primary motivation: ${primaryMotivation.replace('_', ' ')})`,
          category: goalConfig.category,
          target_value: goalConfig.targetValue,
          unit: goalConfig.unit,
          baseline_value: 0, // Will be updated when user starts tracking
          start_date: new Date().toISOString().split('T')[0],
          target_date: targetDate,
          status: 'active',
          priority: goalConfig.priority,
          estimated_cost: goalConfig.estimatedCost || null,
          estimated_savings: goalConfig.estimatedSavings || null,
          estimated_roi: goalConfig.estimatedROI || null,
          created_at: new Date().toISOString()
        };

        const result = await goalOperations.createGoal(goalData);
        if (result.success) {
          goalsCreated++;
          console.log(`Created goal: ${goalConfig.title} with ${goalConfig.targetValue}% target`);
        } else {
          console.warn(`Failed to create goal ${goalConfig.title}:`, result.error);
        }
      }

      return {
        success: goalsCreated > 0,
        goalsCreated,
        error: goalsCreated === 0 ? 'No goals were created successfully' : null
      };

    } catch (error) {
      return {
        success: false,
        goalsCreated: 0,
        error: error instanceof Error ? error.message : 'Failed to save sustainability goals'
      };
    }
  },

  /**
   * Calculate target date based on timeline selection
   */
  calculateTargetDate(timeline: string): string {
    const date = new Date();
    switch (timeline) {
      case '6_months':
        date.setMonth(date.getMonth() + 6);
        break;
      case '1_year':
        date.setFullYear(date.getFullYear() + 1);
        break;
      case '2_years':
        date.setFullYear(date.getFullYear() + 2);
        break;
      case '3_years':
        date.setFullYear(date.getFullYear() + 3);
        break;
      default:
        date.setFullYear(date.getFullYear() + 1);
    }
    return date.toISOString().split('T')[0];
  },

  /**
   * Mark user's onboarding as complete
   */
  async markOnboardingComplete(userId: string) {
    return await userOperations.updateProfile(userId, {
      onboarding_completed: true,
      onboarding_step: 3, // Final step
      updated_at: new Date().toISOString()
    });
  },

  /**
   * Check if energy usage data has meaningful values
   */
  hasEnergyData(energyUsage: any): boolean {
    return !!(
      energyUsage.kwh_usage || 
      energyUsage.gas_usage_therms || 
      energyUsage.gas_usage_ccf || 
      energyUsage.water_usage_gallons ||
      energyUsage.csv_data
    );
  },

  /**
   * Get default target date (1 year from now)
   */
  getDefaultTargetDate(): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
  },

  /**
   * Get goal title based on category
   */
  getGoalTitle(category: string): string {
    const titleMap: { [key: string]: string } = {
      'energy_reduction': 'Reduce Energy Consumption',
      'carbon_reduction': 'Reduce Carbon Footprint',
      'waste_reduction': 'Minimize Waste Generation',
      'water_conservation': 'Conserve Water Usage',
      'renewable_energy': 'Increase Renewable Energy Usage',
      'green_transportation': 'Implement Green Transportation',
      'sustainable_sourcing': 'Adopt Sustainable Sourcing',
      'employee_engagement': 'Enhance Employee Sustainability Engagement'
    };
    
    return titleMap[category] || `Improve ${category.replace('_', ' ')}`;
  },

  /**
   * Get priority number based on goal category
   */
  getGoalPriorityNumber(category: string): number {
    const highPriorityGoals = ['energy_reduction', 'carbon_reduction'];
    const mediumPriorityGoals = ['waste_reduction', 'water_conservation'];
    
    if (highPriorityGoals.includes(category)) return 3; // High priority
    if (mediumPriorityGoals.includes(category)) return 2; // Medium priority
    return 1; // Low priority
  }
};

export default onboardingService; 