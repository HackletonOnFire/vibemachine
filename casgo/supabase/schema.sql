-- EcoMind Sustainability Application Database Schema
-- This file contains the complete database schema for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom types for enums
CREATE TYPE industry_type AS ENUM (
  'technology',
  'manufacturing',
  'healthcare',
  'finance',
  'retail',
  'education',
  'energy',
  'agriculture',
  'transportation',
  'construction',
  'hospitality',
  'other'
);

CREATE TYPE company_size AS ENUM (
  'startup',          -- 1-10 employees
  'small',           -- 11-50 employees
  'medium',          -- 51-200 employees
  'large',           -- 201-1000 employees
  'enterprise'       -- 1000+ employees
);

CREATE TYPE goal_status AS ENUM (
  'draft',
  'active',
  'completed',
  'paused',
  'cancelled'
);

CREATE TYPE recommendation_priority AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

CREATE TYPE recommendation_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'rejected',
  'deferred'
);

-- 1. Users table for profile and business information
CREATE TABLE public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  
  -- Personal Information
  first_name TEXT,
  last_name TEXT,
  role TEXT,
  phone TEXT,
  
  -- Business Information
  business_name TEXT NOT NULL,
  industry industry_type NOT NULL,
  company_size company_size NOT NULL,
  location TEXT NOT NULL,
  website TEXT,
  
  -- Business Details
  annual_revenue BIGINT,
  number_of_employees INTEGER,
  facilities_count INTEGER DEFAULT 1,
  
  -- Settings and Preferences
  timezone TEXT DEFAULT 'UTC',
  currency TEXT DEFAULT 'USD',
  unit_system TEXT DEFAULT 'imperial', -- 'metric' or 'imperial'
  
  -- Onboarding and Status
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 1,
  terms_accepted BOOLEAN DEFAULT FALSE,
  privacy_accepted BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  last_active_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT users_business_name_check CHECK (LENGTH(business_name) >= 2),
  CONSTRAINT users_location_check CHECK (LENGTH(location) >= 2)
);

-- 2. Energy data table for storing usage measurements
CREATE TABLE public.energy_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Measurement Information
  measurement_date DATE NOT NULL,
  reading_type TEXT NOT NULL, -- 'electricity', 'gas', 'water', 'steam', etc.
  
  -- Energy Values
  kwh_usage DECIMAL(10,2), -- Electricity in kWh
  gas_usage_therms DECIMAL(10,2), -- Gas in therms
  gas_usage_ccf DECIMAL(10,2), -- Gas in CCF (hundred cubic feet)
  water_usage_gallons DECIMAL(10,2), -- Water in gallons
  
  -- Cost Information
  electricity_cost DECIMAL(10,2),
  gas_cost DECIMAL(10,2),
  water_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  
  -- Additional Metrics
  peak_demand_kw DECIMAL(8,2), -- Peak demand in kW
  power_factor DECIMAL(3,2), -- Power factor (0.00-1.00)
  
  -- Source and Metadata
  data_source TEXT DEFAULT 'manual', -- 'manual', 'api', 'csv_upload', 'meter'
  facility_name TEXT,
  meter_id TEXT,
  billing_period_start DATE,
  billing_period_end DATE,
  
  -- Quality and Validation
  is_estimated BOOLEAN DEFAULT FALSE,
  quality_score INTEGER DEFAULT 100, -- 0-100 quality score
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  CONSTRAINT energy_data_date_check CHECK (measurement_date <= CURRENT_DATE),
  CONSTRAINT energy_data_positive_values CHECK (
    (kwh_usage IS NULL OR kwh_usage >= 0) AND
    (gas_usage_therms IS NULL OR gas_usage_therms >= 0) AND
    (gas_usage_ccf IS NULL OR gas_usage_ccf >= 0) AND
    (water_usage_gallons IS NULL OR water_usage_gallons >= 0)
  ),
  CONSTRAINT energy_data_quality_score CHECK (quality_score >= 0 AND quality_score <= 100)
);

-- 3. Sustainability goals table for tracking targets
CREATE TABLE public.sustainability_goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Goal Information
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'energy_reduction', 'carbon_reduction', 'waste_reduction', 'water_conservation', 'renewable_energy'
  
  -- Target Information
  target_value DECIMAL(10,2) NOT NULL,
  current_value DECIMAL(10,2) DEFAULT 0,
  unit TEXT NOT NULL, -- 'percentage', 'kwh', 'tons_co2e', 'gallons', etc.
  baseline_value DECIMAL(10,2),
  baseline_date DATE,
  
  -- Timeline
  start_date DATE NOT NULL,
  target_date DATE NOT NULL,
  
  -- Status and Progress
  status goal_status DEFAULT 'draft',
  progress_percentage DECIMAL(5,2) DEFAULT 0, -- 0.00-100.00
  
  -- Priority and Impact
  priority INTEGER DEFAULT 3, -- 1 (high) to 5 (low)
  estimated_cost DECIMAL(12,2),
  estimated_savings DECIMAL(12,2),
  estimated_roi DECIMAL(5,2), -- Return on investment percentage
  
  -- Tracking
  last_updated_value DECIMAL(10,2),
  last_measured_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  CONSTRAINT goals_title_length CHECK (LENGTH(title) >= 3),
  CONSTRAINT goals_date_order CHECK (start_date <= target_date),
  CONSTRAINT goals_progress_range CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  CONSTRAINT goals_priority_range CHECK (priority >= 1 AND priority <= 5)
);

-- 4. Recommendations table for AI-generated suggestions
CREATE TABLE public.recommendations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  goal_id UUID REFERENCES public.sustainability_goals(id) ON DELETE SET NULL,
  
  -- Recommendation Content
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  detailed_explanation TEXT,
  
  -- Classification
  category TEXT NOT NULL, -- 'energy_efficiency', 'renewable_energy', 'waste_reduction', 'carbon_offset', etc.
  priority recommendation_priority DEFAULT 'medium',
  difficulty_level INTEGER DEFAULT 3, -- 1 (easy) to 5 (very difficult)
  
  -- Financial Analysis
  implementation_cost DECIMAL(12,2),
  estimated_annual_savings DECIMAL(12,2),
  payback_period_months INTEGER,
  roi_percentage DECIMAL(5,2),
  net_present_value DECIMAL(12,2),
  
  -- Environmental Impact
  annual_co2_reduction_tons DECIMAL(8,2),
  annual_energy_savings_kwh DECIMAL(10,2),
  annual_water_savings_gallons DECIMAL(10,2),
  
  -- Implementation Details
  implementation_steps JSONB,
  required_resources TEXT[],
  timeline_weeks INTEGER,
  
  -- AI and Source Information
  ai_confidence_score DECIMAL(3,2), -- 0.00-1.00
  data_sources TEXT[],
  generated_by TEXT DEFAULT 'system', -- 'system', 'ai', 'manual', 'rules_engine'
  model_version TEXT,
  
  -- Status Tracking
  status recommendation_status DEFAULT 'pending',
  user_rating INTEGER, -- 1-5 star rating from user
  user_feedback TEXT,
  implementation_date DATE,
  
  -- Metadata
  viewed_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  CONSTRAINT recommendations_title_length CHECK (LENGTH(title) >= 3),
  CONSTRAINT recommendations_description_length CHECK (LENGTH(description) >= 10),
  CONSTRAINT recommendations_difficulty_range CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  CONSTRAINT recommendations_confidence_range CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 1),
  CONSTRAINT recommendations_rating_range CHECK (user_rating IS NULL OR (user_rating >= 1 AND user_rating <= 5))
);

-- 5. Goal progress tracking table for historical data
CREATE TABLE public.goal_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  goal_id UUID REFERENCES public.sustainability_goals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Progress Data
  recorded_value DECIMAL(10,2) NOT NULL,
  progress_percentage DECIMAL(5,2) NOT NULL,
  measurement_date DATE NOT NULL,
  
  -- Context
  notes TEXT,
  data_source TEXT DEFAULT 'manual',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  CONSTRAINT goal_progress_percentage_range CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  CONSTRAINT goal_progress_date_check CHECK (measurement_date <= CURRENT_DATE)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_business_name ON public.users(business_name);
CREATE INDEX idx_users_industry ON public.users(industry);
CREATE INDEX idx_users_created_at ON public.users(created_at);

CREATE INDEX idx_energy_data_user_id ON public.energy_data(user_id);
CREATE INDEX idx_energy_data_measurement_date ON public.energy_data(measurement_date);
CREATE INDEX idx_energy_data_user_date ON public.energy_data(user_id, measurement_date);
CREATE INDEX idx_energy_data_reading_type ON public.energy_data(reading_type);

CREATE INDEX idx_sustainability_goals_user_id ON public.sustainability_goals(user_id);
CREATE INDEX idx_sustainability_goals_status ON public.sustainability_goals(status);
CREATE INDEX idx_sustainability_goals_category ON public.sustainability_goals(category);
CREATE INDEX idx_sustainability_goals_target_date ON public.sustainability_goals(target_date);

CREATE INDEX idx_recommendations_user_id ON public.recommendations(user_id);
CREATE INDEX idx_recommendations_goal_id ON public.recommendations(goal_id);
CREATE INDEX idx_recommendations_priority ON public.recommendations(priority);
CREATE INDEX idx_recommendations_status ON public.recommendations(status);
CREATE INDEX idx_recommendations_category ON public.recommendations(category);

CREATE INDEX idx_goal_progress_goal_id ON public.goal_progress(goal_id);
CREATE INDEX idx_goal_progress_user_id ON public.goal_progress(user_id);
CREATE INDEX idx_goal_progress_date ON public.goal_progress(measurement_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_energy_data
  BEFORE UPDATE ON public.energy_data
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_sustainability_goals
  BEFORE UPDATE ON public.sustainability_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_recommendations
  BEFORE UPDATE ON public.recommendations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at(); 