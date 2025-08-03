// Database types generated from Supabase schema
// This file provides TypeScript types for all database tables and operations

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Custom enum types
export type IndustryType = 
  | 'technology'
  | 'manufacturing'
  | 'healthcare'
  | 'finance'
  | 'retail'
  | 'education'
  | 'energy'
  | 'agriculture'
  | 'transportation'
  | 'construction'
  | 'hospitality'
  | 'other'

export type CompanySize = 
  | 'startup'
  | 'small'
  | 'medium'
  | 'large'
  | 'enterprise'

export type GoalStatus = 
  | 'draft'
  | 'active'
  | 'completed'
  | 'paused'
  | 'cancelled'

export type RecommendationPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'

export type RecommendationStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'rejected'
  | 'deferred'

// Database interface definition
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          role: string | null
          phone: string | null
          business_name: string
          industry: IndustryType
          company_size: CompanySize
          location: string
          website: string | null
          annual_revenue: number | null
          number_of_employees: number | null
          facilities_count: number | null
          timezone: string | null
          currency: string | null
          unit_system: string | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          terms_accepted: boolean | null
          privacy_accepted: boolean | null
          created_at: string
          updated_at: string
          last_active_at: string | null
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          role?: string | null
          phone?: string | null
          business_name: string
          industry: IndustryType
          company_size: CompanySize
          location: string
          website?: string | null
          annual_revenue?: number | null
          number_of_employees?: number | null
          facilities_count?: number | null
          timezone?: string | null
          currency?: string | null
          unit_system?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          terms_accepted?: boolean | null
          privacy_accepted?: boolean | null
          created_at?: string
          updated_at?: string
          last_active_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          role?: string | null
          phone?: string | null
          business_name?: string
          industry?: IndustryType
          company_size?: CompanySize
          location?: string
          website?: string | null
          annual_revenue?: number | null
          number_of_employees?: number | null
          facilities_count?: number | null
          timezone?: string | null
          currency?: string | null
          unit_system?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          terms_accepted?: boolean | null
          privacy_accepted?: boolean | null
          created_at?: string
          updated_at?: string
          last_active_at?: string | null
        }
        Relationships: []
      }
      energy_data: {
        Row: {
          id: string
          user_id: string
          measurement_date: string
          reading_type: string
          kwh_usage: number | null
          gas_usage_therms: number | null
          gas_usage_ccf: number | null
          water_usage_gallons: number | null
          electricity_cost: number | null
          gas_cost: number | null
          water_cost: number | null
          total_cost: number | null
          peak_demand_kw: number | null
          power_factor: number | null
          data_source: string | null
          facility_name: string | null
          meter_id: string | null
          billing_period_start: string | null
          billing_period_end: string | null
          is_estimated: boolean | null
          quality_score: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          measurement_date: string
          reading_type: string
          kwh_usage?: number | null
          gas_usage_therms?: number | null
          gas_usage_ccf?: number | null
          water_usage_gallons?: number | null
          electricity_cost?: number | null
          gas_cost?: number | null
          water_cost?: number | null
          total_cost?: number | null
          peak_demand_kw?: number | null
          power_factor?: number | null
          data_source?: string | null
          facility_name?: string | null
          meter_id?: string | null
          billing_period_start?: string | null
          billing_period_end?: string | null
          is_estimated?: boolean | null
          quality_score?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          measurement_date?: string
          reading_type?: string
          kwh_usage?: number | null
          gas_usage_therms?: number | null
          gas_usage_ccf?: number | null
          water_usage_gallons?: number | null
          electricity_cost?: number | null
          gas_cost?: number | null
          water_cost?: number | null
          total_cost?: number | null
          peak_demand_kw?: number | null
          power_factor?: number | null
          data_source?: string | null
          facility_name?: string | null
          meter_id?: string | null
          billing_period_start?: string | null
          billing_period_end?: string | null
          is_estimated?: boolean | null
          quality_score?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "energy_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      sustainability_goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string
          target_value: number
          current_value: number | null
          unit: string
          baseline_value: number | null
          baseline_date: string | null
          start_date: string
          target_date: string
          status: GoalStatus | null
          progress_percentage: number | null
          priority: number | null
          estimated_cost: number | null
          estimated_savings: number | null
          estimated_roi: number | null
          last_updated_value: number | null
          last_measured_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category: string
          target_value: number
          current_value?: number | null
          unit: string
          baseline_value?: number | null
          baseline_date?: string | null
          start_date: string
          target_date: string
          status?: GoalStatus | null
          progress_percentage?: number | null
          priority?: number | null
          estimated_cost?: number | null
          estimated_savings?: number | null
          estimated_roi?: number | null
          last_updated_value?: number | null
          last_measured_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: string
          target_value?: number
          current_value?: number | null
          unit?: string
          baseline_value?: number | null
          baseline_date?: string | null
          start_date?: string
          target_date?: string
          status?: GoalStatus | null
          progress_percentage?: number | null
          priority?: number | null
          estimated_cost?: number | null
          estimated_savings?: number | null
          estimated_roi?: number | null
          last_updated_value?: number | null
          last_measured_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sustainability_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      recommendations: {
        Row: {
          id: string
          user_id: string
          goal_id: string | null
          title: string
          description: string
          detailed_explanation: string | null
          category: string
          priority: RecommendationPriority | null
          difficulty_level: number | null
          implementation_cost: number | null
          estimated_annual_savings: number | null
          payback_period_months: number | null
          roi_percentage: number | null
          net_present_value: number | null
          annual_co2_reduction_tons: number | null
          annual_energy_savings_kwh: number | null
          annual_water_savings_gallons: number | null
          implementation_steps: Json | null
          required_resources: string[] | null
          timeline_weeks: number | null
          ai_confidence_score: number | null
          data_sources: string[] | null
          generated_by: string | null
          model_version: string | null
          status: RecommendationStatus | null
          user_rating: number | null
          user_feedback: string | null
          implementation_date: string | null
          viewed_at: string | null
          dismissed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_id?: string | null
          title: string
          description: string
          detailed_explanation?: string | null
          category: string
          priority?: RecommendationPriority | null
          difficulty_level?: number | null
          implementation_cost?: number | null
          estimated_annual_savings?: number | null
          payback_period_months?: number | null
          roi_percentage?: number | null
          net_present_value?: number | null
          annual_co2_reduction_tons?: number | null
          annual_energy_savings_kwh?: number | null
          annual_water_savings_gallons?: number | null
          implementation_steps?: Json | null
          required_resources?: string[] | null
          timeline_weeks?: number | null
          ai_confidence_score?: number | null
          data_sources?: string[] | null
          generated_by?: string | null
          model_version?: string | null
          status?: RecommendationStatus | null
          user_rating?: number | null
          user_feedback?: string | null
          implementation_date?: string | null
          viewed_at?: string | null
          dismissed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_id?: string | null
          title?: string
          description?: string
          detailed_explanation?: string | null
          category?: string
          priority?: RecommendationPriority | null
          difficulty_level?: number | null
          implementation_cost?: number | null
          estimated_annual_savings?: number | null
          payback_period_months?: number | null
          roi_percentage?: number | null
          net_present_value?: number | null
          annual_co2_reduction_tons?: number | null
          annual_energy_savings_kwh?: number | null
          annual_water_savings_gallons?: number | null
          implementation_steps?: Json | null
          required_resources?: string[] | null
          timeline_weeks?: number | null
          ai_confidence_score?: number | null
          data_sources?: string[] | null
          generated_by?: string | null
          model_version?: string | null
          status?: RecommendationStatus | null
          user_rating?: number | null
          user_feedback?: string | null
          implementation_date?: string | null
          viewed_at?: string | null
          dismissed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "sustainability_goals"
            referencedColumns: ["id"]
          }
        ]
      }
      goal_progress: {
        Row: {
          id: string
          goal_id: string
          user_id: string
          recorded_value: number
          progress_percentage: number
          measurement_date: string
          notes: string | null
          data_source: string | null
          created_at: string
        }
        Insert: {
          id?: string
          goal_id: string
          user_id: string
          recorded_value: number
          progress_percentage: number
          measurement_date: string
          notes?: string | null
          data_source?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          goal_id?: string
          user_id?: string
          recorded_value?: number
          progress_percentage?: number
          measurement_date?: string
          notes?: string | null
          data_source?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_progress_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "sustainability_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      industry_type: IndustryType
      company_size: CompanySize
      goal_status: GoalStatus
      recommendation_priority: RecommendationPriority
      recommendation_status: RecommendationStatus
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Utility types for easier use in components
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type EnergyData = Database['public']['Tables']['energy_data']['Row']
export type EnergyDataInsert = Database['public']['Tables']['energy_data']['Insert']
export type EnergyDataUpdate = Database['public']['Tables']['energy_data']['Update']

export type SustainabilityGoal = Database['public']['Tables']['sustainability_goals']['Row']
export type SustainabilityGoalInsert = Database['public']['Tables']['sustainability_goals']['Insert']
export type SustainabilityGoalUpdate = Database['public']['Tables']['sustainability_goals']['Update']

export type Recommendation = Database['public']['Tables']['recommendations']['Row']
export type RecommendationInsert = Database['public']['Tables']['recommendations']['Insert']
export type RecommendationUpdate = Database['public']['Tables']['recommendations']['Update']

export type GoalProgress = Database['public']['Tables']['goal_progress']['Row']
export type GoalProgressInsert = Database['public']['Tables']['goal_progress']['Insert']
export type GoalProgressUpdate = Database['public']['Tables']['goal_progress']['Update'] 