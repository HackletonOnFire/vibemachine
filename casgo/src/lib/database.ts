// Database utility functions for CRUD operations - Optimized for Performance
// This file provides type-safe database operations with caching and batching optimizations

import { supabase, handleSupabaseError } from './supabase';
import type { 
  User, UserInsert, UserUpdate,
  EnergyData, EnergyDataInsert, EnergyDataUpdate,
  SustainabilityGoal, SustainabilityGoalInsert, SustainabilityGoalUpdate,
  Recommendation, RecommendationInsert, RecommendationUpdate,
  GoalProgress, GoalProgressInsert, GoalProgressUpdate,
  GoalStatus, RecommendationPriority, RecommendationStatus
} from './types';

// Generic database response type
export interface DatabaseResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// Performance optimization: Simple in-memory cache with TTL
class SimpleCache<T> {
  private cache = new Map<string, { data: T; expires: number }>();
  private readonly ttl: number;

  constructor(ttlSeconds: number = 300) { // 5 minute default TTL
    this.ttl = ttlSeconds * 1000;
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + this.ttl
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Create cache instances for different data types
const userCache = new SimpleCache<OptimizedUser>(600); // 10 minutes
const energyCache = new SimpleCache<any>(300); // 5 minutes
const goalsCache = new SimpleCache<OptimizedGoal[]>(300); // 5 minutes
const recommendationsCache = new SimpleCache<OptimizedRecommendation[]>(180); // 3 minutes

// Optimized field selections for performance
const OPTIMIZED_SELECTS = {
  user: 'id, email, business_name, industry, company_size, location, onboarding_completed, first_name, last_name, annual_revenue, number_of_employees, facilities_count, website, created_at, updated_at',
  energyData: 'id, user_id, measurement_date, kwh_usage, gas_usage_therms, total_cost, electricity_cost, gas_cost, data_source, created_at',
  goal: 'id, user_id, category, title, target_value, current_value, target_date, status, priority, progress_percentage, created_at, updated_at',
  recommendation: 'id, user_id, title, description, detailed_explanation, category, priority, difficulty_level, estimated_annual_savings, annual_co2_reduction_tons, implementation_cost, payback_period_months, status, generated_by, created_at, updated_at'
} as const;

// Optimized types for performance queries
type OptimizedUser = Pick<User, 'id' | 'email' | 'business_name' | 'industry' | 'company_size' | 'location' | 'onboarding_completed' | 'first_name' | 'last_name' | 'annual_revenue' | 'number_of_employees' | 'facilities_count' | 'website' | 'created_at' | 'updated_at'>;
type OptimizedEnergyData = Pick<EnergyData, 'id' | 'user_id' | 'measurement_date' | 'kwh_usage' | 'gas_usage_therms' | 'total_cost' | 'electricity_cost' | 'gas_cost' | 'data_source' | 'created_at'>;
type OptimizedGoal = Pick<SustainabilityGoal, 'id' | 'user_id' | 'category' | 'title' | 'target_value' | 'current_value' | 'target_date' | 'status' | 'priority' | 'progress_percentage' | 'created_at' | 'updated_at'>;
type OptimizedRecommendation = Pick<Recommendation, 'id' | 'user_id' | 'title' | 'description' | 'priority' | 'estimated_annual_savings' | 'annual_co2_reduction_tons' | 'implementation_cost' | 'payback_period_months' | 'status' | 'created_at'>;

// User operations - Optimized
export const userOperations = {
  // Get user profile by ID with caching
  async getProfile(userId: string): Promise<DatabaseResponse<OptimizedUser>> {
    try {
      // Check cache first
      const cached = userCache.get(userId);
      if (cached) {
        return {
          data: cached,
          error: null,
          success: true
        };
      }

      const { data, error } = await supabase
        .from('users')
        .select(OPTIMIZED_SELECTS.user)
        .eq('id', userId)
        .single();

      if (error) {
        return {
          data: null,
          error: handleSupabaseError(error),
          success: false
        };
      }

      // Cache the result
      if (data) {
        userCache.set(userId, data);
      }

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to fetch user profile',
        success: false
      };
    }
  },

  // Create new user profile
  async createProfile(profile: UserInsert): Promise<DatabaseResponse<User>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(profile)
        .select(OPTIMIZED_SELECTS.user)
        .single();

      if (error) {
        return {
          data: null,
          error: handleSupabaseError(error),
          success: false
        };
      }

      // Cache the new profile
      if (data) {
        userCache.set(data.id, data);
      }

      return {
        data: data as User,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to create user profile',
        success: false
      };
    }
  },

  // Update user profile
  async updateProfile(userId: string, updates: UserUpdate): Promise<DatabaseResponse<User>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select(OPTIMIZED_SELECTS.user)
        .single();

      if (error) {
        return {
          data: null,
          error: handleSupabaseError(error),
          success: false
        };
      }

      // Invalidate cache and set new data
      userCache.delete(userId);
      if (data) {
        userCache.set(userId, data);
      }

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to update user profile',
        success: false
      };
    }
  },

  // Check if user has completed onboarding - Optimized query
  async isOnboardingComplete(userId: string): Promise<DatabaseResponse<boolean>> {
    try {
      // First check if we have user in cache
      const cached = userCache.get(userId);
      if (cached) {
        return {
          data: cached.onboarding_completed || false,
          error: null,
          success: true
        };
      }

      const { data, error } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('id', userId)
        .single();

      if (error) {
        return {
          data: null,
          error: handleSupabaseError(error),
          success: false
        };
      }

      return {
        data: data.onboarding_completed || false,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to check onboarding status',
        success: false
      };
    }
  }
};

// Energy data operations - Optimized
export const energyOperations = {
  // Get all energy data for a user with optimized pagination and caching
  async getUserEnergyData(
    userId: string, 
    limit: number = 12,
    startDate?: string,
    endDate?: string
  ): Promise<DatabaseResponse<EnergyData[]>> {
    try {
      const cacheKey = `energy_${userId}_${limit}_${startDate || 'null'}_${endDate || 'null'}`;
      const cached = energyCache.get(cacheKey);
      if (cached) {
        return {
          data: cached,
          error: null,
          success: true
        };
      }

      let query = supabase
        .from('energy_data')
        .select(OPTIMIZED_SELECTS.energyData)
        .eq('user_id', userId)
        .order('measurement_date', { ascending: false })
        .limit(limit);

      if (startDate) {
        query = query.gte('measurement_date', startDate);
      }

      if (endDate) {
        query = query.lte('measurement_date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        return {
          data: null,
          error: handleSupabaseError(error),
          success: false
        };
      }

      // Cache the result
      const result = data || [];
      energyCache.set(cacheKey, result);

      return {
        data: result,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to fetch energy data',
        success: false
      };
    }
  },

  // Add new energy data entry
  async addEnergyData(energyData: EnergyDataInsert): Promise<DatabaseResponse<EnergyData>> {
    try {
      console.log('🔍 Adding energy data for user:', energyData.user_id);
      
      // Check authentication state
      const { data: { user } } = await supabase.auth.getUser();
      console.log('🔐 Current authenticated user:', user?.id);
      console.log('🔄 User ID match:', user?.id === energyData.user_id);
      
      if (!user) {
        console.error('❌ No authenticated user found');
        return {
          data: null,
          error: 'You must be logged in to add energy data',
          success: false
        };
      }
      
      if (user.id !== energyData.user_id) {
        console.error('❌ User ID mismatch:', { auth: user.id, data: energyData.user_id });
        return {
          data: null,
          error: 'Authentication error: User ID mismatch',
          success: false
        };
      }
      
      console.log('📊 Inserting energy data:', energyData);
      
      const { error } = await supabase
        .from('energy_data')
        .insert(energyData);

      if (error) {
        console.error('❌ Energy data insert error:', error);
        return {
          data: null,
          error: handleSupabaseError(error),
          success: false
        };
      }

      console.log('✅ Energy data inserted successfully');
      
      // Invalidate energy cache for this user
      energyCache.clear();

      return {
        data: energyData as EnergyData, // Return the input data since insert was successful
        error: null,
        success: true
      };
    } catch (error) {
      console.error('❌ Energy data insert exception:', error);
      return {
        data: null,
        error: 'Failed to add energy data',
        success: false
      };
    }
  },

  // Optimized energy usage summary with database-level aggregation
  async getUsageSummary(userId: string, months: number = 12): Promise<DatabaseResponse<any>> {
    try {
      const cacheKey = `summary_${userId}_${months}`;
      const cached = energyCache.get(cacheKey);
      if (cached) {
        return {
          data: cached,
          error: null,
          success: true
        };
      }

      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      console.log('🔍 Bypassing RPC, using direct query for user:', userId);
      
      // Use direct query instead of problematic RPC
      const { data: energyData, error: energyError } = await supabase
        .from('energy_data')
        .select('kwh_usage, gas_usage_therms, total_cost, electricity_cost, gas_cost, measurement_date')
        .eq('user_id', userId)
        .gte('measurement_date', startDate.toISOString().split('T')[0])
        .order('measurement_date', { ascending: false });

      if (energyError) {
        console.error('❌ Direct query error:', energyError);
        return {
          data: null,
          error: 'Failed to fetch energy data',
          success: false
        };
      }

      // Client-side aggregation (reliable fallback)
      const summary = {
        totalKwh: energyData?.reduce((sum, entry) => sum + (entry.kwh_usage || 0), 0) || 0,
        totalTherms: energyData?.reduce((sum, entry) => sum + (entry.gas_usage_therms || 0), 0) || 0,
        totalCost: energyData?.reduce((sum, entry) => sum + (entry.total_cost || 0), 0) || 0,
        monthlyData: energyData || [],
        averageMonthlyKwh: energyData ? (energyData.reduce((sum, entry) => sum + (entry.kwh_usage || 0), 0) / Math.max(energyData.length, 1)) : 0,
        averageMonthlyCost: energyData ? (energyData.reduce((sum, entry) => sum + (entry.total_cost || 0), 0) / Math.max(energyData.length, 1)) : 0,
        recordCount: energyData?.length || 0
      };

      console.log('✅ Energy summary calculated:', summary);

      // Cache the result
      energyCache.set(cacheKey, summary);

      return {
        data: summary,
        error: null,
        success: true
      };
    } catch (error) {
      console.error('❌ getUsageSummary error:', error);
      return {
        data: null,
        error: 'Failed to calculate usage summary',
        success: false
      };
    }
  },

  // Upsert energy data entry (update existing or create new)
  async upsertEnergyData(energyData: EnergyDataInsert): Promise<DatabaseResponse<EnergyData>> {
    try {
      console.log('🔍 Upserting energy data for user:', energyData.user_id);
      
      // Check authentication state
      const { data: { user } } = await supabase.auth.getUser();
      console.log('🔐 Current authenticated user:', user?.id);
      console.log('🔄 User ID match:', user?.id === energyData.user_id);
      
      if (!user) {
        console.error('❌ No authenticated user found');
        return {
          data: null,
          error: 'You must be logged in to add energy data',
          success: false
        };
      }
      
      if (user.id !== energyData.user_id) {
        console.error('❌ User ID mismatch:', { auth: user.id, data: energyData.user_id });
        return {
          data: null,
          error: 'Authentication error: User ID mismatch',
          success: false
        };
      }
      
      // Remove undefined values and ensure proper types
      const cleanEnergyData = Object.fromEntries(
        Object.entries(energyData).filter(([_, value]) => value !== undefined)
      ) as EnergyDataInsert;
      
      console.log('📊 Monthly Energy Data for Upsert:', {
        user_id: cleanEnergyData.user_id,
        month_year: cleanEnergyData.measurement_date,
        reading_type: cleanEnergyData.reading_type,
        electricity: cleanEnergyData.kwh_usage ? `${cleanEnergyData.kwh_usage} kWh` : 'None',
        gas_therms: cleanEnergyData.gas_usage_therms ? `${cleanEnergyData.gas_usage_therms} therms` : 'None',
        gas_ccf: cleanEnergyData.gas_usage_ccf ? `${cleanEnergyData.gas_usage_ccf} CCF` : 'None',
        water: cleanEnergyData.water_usage_gallons ? `${cleanEnergyData.water_usage_gallons} gallons` : 'None',
        total_cost: cleanEnergyData.total_cost ? `$${cleanEnergyData.total_cost}` : 'None'
      });
      
      // Business Logic: Check if a record exists for this user and month
      // Since measurement_date is set to first day of month, we can match exactly
      const { data: existingRecord } = await supabase
        .from('energy_data')
        .select('id, measurement_date')
        .eq('user_id', cleanEnergyData.user_id)
        .eq('measurement_date', cleanEnergyData.measurement_date)
        .eq('reading_type', cleanEnergyData.reading_type)
        .maybeSingle();
      
      console.log('🔍 Checking for existing monthly record:', {
        user_id: cleanEnergyData.user_id,
        measurement_date: cleanEnergyData.measurement_date,
        reading_type: cleanEnergyData.reading_type,
        existing: existingRecord ? 'FOUND' : 'NOT FOUND'
      });

      let data, error;

      if (existingRecord) {
        // Update existing record
        console.log('📝 Updating existing energy data record:', existingRecord.id);
        const updateResult = await supabase
          .from('energy_data')
          .update({
            ...cleanEnergyData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRecord.id)
          .select('*')
          .single();
        
        data = updateResult.data;
        error = updateResult.error;
      } else {
        // Insert new record
        console.log('➕ Creating new energy data record');
        const insertResult = await supabase
          .from('energy_data')
          .insert(cleanEnergyData)
          .select('*')
          .single();
        
        data = insertResult.data;
        error = insertResult.error;
      }

      if (error) {
        console.error('❌ Energy data upsert error:', error);
        return {
          data: null,
          error: handleSupabaseError(error),
          success: false
        };
      }

      const operationType = existingRecord ? 'UPDATED existing record' : 'CREATED new record';
      console.log('✅ Energy data upserted successfully:', operationType, data);
      
      // Invalidate energy cache for this user
      energyCache.clear();

      return {
        data: data as EnergyData,
        error: null,
        success: true
      };
    } catch (error) {
      console.error('❌ Energy data upsert exception:', error);
      return {
        data: null,
        error: 'Failed to save energy data',
        success: false
      };
    }
  },

  // Batch insert energy data for better performance
  async addEnergyDataBatch(energyDataArray: EnergyDataInsert[]): Promise<DatabaseResponse<EnergyData[]>> {
    try {
      const { data, error } = await supabase
        .from('energy_data')
        .insert(energyDataArray)
        .select(OPTIMIZED_SELECTS.energyData);

      if (error) {
        return {
          data: null,
          error: handleSupabaseError(error),
          success: false
        };
      }

      // Invalidate energy cache for affected users
      energyCache.clear();

      return {
        data: data || [],
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to add energy data batch',
        success: false
      };
    }
  }
};

// Goals operations - Optimized
export const goalOperations = {
  // Get all goals for a user with caching
  async getUserGoals(userId: string, status?: GoalStatus): Promise<DatabaseResponse<SustainabilityGoal[]>> {
    try {
      const cacheKey = `goals_${userId}_${status || 'all'}`;
      const cached = goalsCache.get(cacheKey);
      if (cached) {
        return {
          data: cached,
          error: null,
          success: true
        };
      }

      let query = supabase
        .from('sustainability_goals')
        .select(OPTIMIZED_SELECTS.goal)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        return {
          data: null,
          error: handleSupabaseError(error),
          success: false
        };
      }

      const result = data || [];
      goalsCache.set(cacheKey, result);

      return {
        data: result,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to fetch sustainability goals',
        success: false
      };
    }
  },

  // Create new goal
  async createGoal(goal: SustainabilityGoalInsert): Promise<DatabaseResponse<SustainabilityGoal>> {
    try {
      const { data, error } = await supabase
        .from('sustainability_goals')
        .insert(goal)
        .select(OPTIMIZED_SELECTS.goal)
        .single();

      if (error) {
        return {
          data: null,
          error: handleSupabaseError(error),
          success: false
        };
      }

      // Invalidate goals cache for this user
      goalsCache.clear();

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to create sustainability goal',
        success: false
      };
    }
  },

  // Batch update goals for better performance
  async updateGoalsBatch(goals: Array<{ id: string; updates: SustainabilityGoalUpdate }>): Promise<DatabaseResponse<SustainabilityGoal[]>> {
    try {
      const promises = goals.map(({ id, updates }) =>
        supabase
          .from('sustainability_goals')
          .update(updates)
          .eq('id', id)
          .select(OPTIMIZED_SELECTS.goal)
          .single()
      );

      const results = await Promise.all(promises);
      const data = results.map(r => r.data).filter(Boolean);
      const errors = results.filter(r => r.error);

      if (errors.length > 0) {
        return {
          data: null,
          error: `Failed to update ${errors.length} goals`,
          success: false
        };
      }

      // Invalidate goals cache
      goalsCache.clear();

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to batch update goals',
        success: false
      };
    }
  }
};

// Recommendations operations - Optimized
export const recommendationOperations = {
  // Get recommendations for a user with caching
  async getUserRecommendations(
    userId: string, 
    limit: number = 10,
    priority?: RecommendationPriority
  ): Promise<DatabaseResponse<Recommendation[]>> {
    try {
      const cacheKey = `recs_${userId}_${limit}_${priority || 'all'}`;
      const cached = recommendationsCache.get(cacheKey);
      if (cached) {
        return {
          data: cached,
          error: null,
          success: true
        };
      }

      let query = supabase
        .from('recommendations')
        .select(OPTIMIZED_SELECTS.recommendation)
        .eq('user_id', userId)
        // BUSINESS LOGIC: Only show active recommendations (not completed/implemented)
        .not('status', 'eq', 'completed')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (priority) {
        query = query.eq('priority', priority);
      }

      const { data, error } = await query;

      if (error) {
        return {
          data: null,
          error: handleSupabaseError(error),
          success: false
        };
      }

      const result = data || [];
      recommendationsCache.set(cacheKey, result);

      return {
        data: result,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to fetch recommendations',
        success: false
      };
    }
  },

  // Mark recommendation as implemented/completed
  async markRecommendationCompleted(
    recommendationId: string,
    userId: string,
    implementationDate?: string
  ): Promise<DatabaseResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .update({
          status: 'completed',
          implementation_date: implementationDate || new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', recommendationId)
        .eq('user_id', userId) // Security check
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: handleSupabaseError(error),
          success: false
        };
      }

      // Clear cache to refresh recommendations list
      recommendationsCache.clear();

      return {
        data: data,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to mark recommendation as completed',
        success: false
      };
    }
  },

  // Create new recommendation
  async createRecommendation(
    recommendation: RecommendationInsert
  ): Promise<DatabaseResponse<Recommendation>> {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .insert(recommendation)
        .select(OPTIMIZED_SELECTS.recommendation)
        .single();

      if (error) {
        return {
          data: null,
          error: handleSupabaseError(error),
          success: false
        };
      }

      // Clear cache to include new recommendation
      recommendationsCache.clear();

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to create recommendation',
        success: false
      };
    }
  }
};

// Dashboard aggregation operations - Heavily optimized
export const dashboardOperations = {
  // Get comprehensive dashboard data with optimized parallel queries and caching
  async getDashboardData(userId: string): Promise<DatabaseResponse<any>> {
    try {
      const cacheKey = `dashboard_${userId}`;
      const cached = energyCache.get(cacheKey);
      if (cached) {
        return {
          data: cached,
          error: null,
          success: true
        };
      }

      // Run all queries in parallel with reduced data fetching
      const [
        profileResult,
        energyResult,
        goalsResult,
        recommendationsResult
      ] = await Promise.all([
        userOperations.getProfile(userId),
        energyOperations.getUsageSummary(userId, 12),
        goalOperations.getUserGoals(userId, 'active'),
        recommendationOperations.getUserRecommendations(userId, 5, 'high')
      ]);

      // Check for any critical errors
      if (!profileResult.success) {
        return profileResult;
      }

      const dashboardData = {
        profile: profileResult.data,
        energySummary: energyResult.data,
        activeGoals: goalsResult.data || [],
        topRecommendations: recommendationsResult.data || [],
        lastUpdated: new Date().toISOString()
      };

      // Cache the complete dashboard data
      energyCache.set(cacheKey, dashboardData);

      return {
        data: dashboardData,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: 'Failed to fetch dashboard data',
        success: false
      };
    }
  },

  // Clear all caches - useful for data consistency
  clearAllCaches(): void {
    userCache.clear();
    energyCache.clear();
    goalsCache.clear();
    recommendationsCache.clear();
  },

  // Get cache statistics for monitoring
  getCacheStats() {
    return {
      userCacheSize: userCache['cache'].size,
      energyCacheSize: energyCache['cache'].size,
      goalsCacheSize: goalsCache['cache'].size,
      recommendationsCacheSize: recommendationsCache['cache'].size
    };
  }
}; 