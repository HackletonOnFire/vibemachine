-- Row Level Security (RLS) Policies for EcoMind Sustainability Application
-- This file contains all RLS policies to ensure data isolation between users

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sustainability_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_progress ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Energy data policies
CREATE POLICY "Users can view their own energy data" ON public.energy_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own energy data" ON public.energy_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own energy data" ON public.energy_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own energy data" ON public.energy_data
  FOR DELETE USING (auth.uid() = user_id);

-- Sustainability goals policies
CREATE POLICY "Users can view their own goals" ON public.sustainability_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" ON public.sustainability_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON public.sustainability_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON public.sustainability_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Recommendations policies
CREATE POLICY "Users can view their own recommendations" ON public.recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations" ON public.recommendations
  FOR UPDATE USING (auth.uid() = user_id);

-- System can insert recommendations for users
CREATE POLICY "System can insert recommendations" ON public.recommendations
  FOR INSERT WITH CHECK (true);

-- Goal progress policies
CREATE POLICY "Users can view their own goal progress" ON public.goal_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goal progress" ON public.goal_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goal progress" ON public.goal_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goal progress" ON public.goal_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant select access on custom types
GRANT USAGE ON TYPE industry_type TO authenticated;
GRANT USAGE ON TYPE company_size TO authenticated;
GRANT USAGE ON TYPE goal_status TO authenticated;
GRANT USAGE ON TYPE recommendation_priority TO authenticated;
GRANT USAGE ON TYPE recommendation_status TO authenticated; 