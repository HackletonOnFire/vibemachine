-- Enhanced Schema Additions for Better Dashboard Experience
-- Run this after the main schema.sql

-- 1. Monthly Energy Summary Table for faster dashboard queries
CREATE TABLE IF NOT EXISTS public.monthly_energy_summary (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL, -- 1-12
  
  -- Energy Totals
  total_kwh DECIMAL(10,2) DEFAULT 0,
  total_therms DECIMAL(10,2) DEFAULT 0,
  total_water_gallons DECIMAL(10,2) DEFAULT 0,
  
  -- Costs
  total_electricity_cost DECIMAL(10,2) DEFAULT 0,
  total_gas_cost DECIMAL(10,2) DEFAULT 0,
  total_water_cost DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  
  -- Carbon Footprint (calculated and stored)
  total_co2_tons DECIMAL(8,2) DEFAULT 0,
  electricity_co2_tons DECIMAL(8,2) DEFAULT 0,
  gas_co2_tons DECIMAL(8,2) DEFAULT 0,
  
  -- Efficiency Metrics
  kwh_per_dollar DECIMAL(6,2) DEFAULT 0,
  cost_per_kwh DECIMAL(6,4) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  CONSTRAINT monthly_summary_month_range CHECK (month >= 1 AND month <= 12),
  CONSTRAINT monthly_summary_unique UNIQUE (user_id, year, month)
);

-- 2. Carbon Footprint History for trend analysis
CREATE TABLE IF NOT EXISTS public.carbon_footprint_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  measurement_date DATE NOT NULL,
  
  -- Emissions by scope
  scope1_emissions DECIMAL(8,2) DEFAULT 0, -- Direct emissions (gas, company vehicles)
  scope2_emissions DECIMAL(8,2) DEFAULT 0, -- Electricity consumption
  scope3_emissions DECIMAL(8,2) DEFAULT 0, -- Indirect (commuting, business travel)
  total_emissions DECIMAL(8,2) DEFAULT 0,
  
  -- Comparison metrics
  baseline_emissions DECIMAL(8,2),
  reduction_percentage DECIMAL(5,2),
  target_emissions DECIMAL(8,2),
  
  -- Context
  temperature_avg DECIMAL(4,1), -- Average temperature for the period
  business_days INTEGER, -- Number of business days in period
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  CONSTRAINT carbon_history_date_unique UNIQUE (user_id, measurement_date)
);

-- 3. Goal Milestones for detailed progress tracking
CREATE TABLE IF NOT EXISTS public.goal_milestones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  goal_id UUID REFERENCES public.sustainability_goals(id) ON DELETE CASCADE NOT NULL,
  
  -- Milestone Details
  title TEXT NOT NULL,
  description TEXT,
  target_value DECIMAL(10,2) NOT NULL,
  target_date DATE NOT NULL,
  completed_date DATE,
  
  -- Progress
  is_completed BOOLEAN DEFAULT FALSE,
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  actual_value DECIMAL(10,2),
  
  -- Priority and tracking
  milestone_order INTEGER DEFAULT 1,
  is_critical BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  CONSTRAINT milestone_title_length CHECK (LENGTH(title) >= 3),
  CONSTRAINT milestone_completion_range CHECK (completion_percentage >= 0 AND completion_percentage <= 100)
);

-- 4. Dashboard KPI Cache for instant loading
CREATE TABLE IF NOT EXISTS public.dashboard_kpi_cache (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Energy KPIs
  current_month_kwh DECIMAL(10,2) DEFAULT 0,
  current_month_cost DECIMAL(10,2) DEFAULT 0,
  month_over_month_kwh_change DECIMAL(5,2) DEFAULT 0,
  month_over_month_cost_change DECIMAL(5,2) DEFAULT 0,
  year_to_date_kwh DECIMAL(12,2) DEFAULT 0,
  year_to_date_cost DECIMAL(12,2) DEFAULT 0,
  
  -- Carbon KPIs
  current_month_co2 DECIMAL(8,2) DEFAULT 0,
  total_co2_reduction DECIMAL(8,2) DEFAULT 0,
  co2_reduction_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Goal KPIs
  active_goals_count INTEGER DEFAULT 0,
  completed_goals_count INTEGER DEFAULT 0,
  overdue_goals_count INTEGER DEFAULT 0,
  avg_goal_progress DECIMAL(5,2) DEFAULT 0,
  
  -- Recommendation KPIs
  pending_recommendations_count INTEGER DEFAULT 0,
  total_potential_savings DECIMAL(12,2) DEFAULT 0,
  implemented_recommendations_count INTEGER DEFAULT 0,
  
  -- Cache metadata
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW() + INTERVAL '1 hour') NOT NULL,
  
  CONSTRAINT dashboard_cache_unique UNIQUE (user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_monthly_summary_user_year_month ON public.monthly_energy_summary(user_id, year, month);
CREATE INDEX IF NOT EXISTS idx_monthly_summary_date ON public.monthly_energy_summary(year, month);

CREATE INDEX IF NOT EXISTS idx_carbon_history_user_date ON public.carbon_footprint_history(user_id, measurement_date);
CREATE INDEX IF NOT EXISTS idx_carbon_history_date ON public.carbon_footprint_history(measurement_date);

CREATE INDEX IF NOT EXISTS idx_goal_milestones_goal_id ON public.goal_milestones(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_target_date ON public.goal_milestones(target_date);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_completed ON public.goal_milestones(is_completed);

CREATE INDEX IF NOT EXISTS idx_dashboard_cache_expires ON public.dashboard_kpi_cache(expires_at);

-- Add triggers for updated_at
CREATE TRIGGER IF NOT EXISTS set_updated_at_monthly_summary
  BEFORE UPDATE ON public.monthly_energy_summary
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER IF NOT EXISTS set_updated_at_goal_milestones
  BEFORE UPDATE ON public.goal_milestones
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at(); 