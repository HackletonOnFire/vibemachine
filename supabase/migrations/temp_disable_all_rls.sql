-- Temporarily disable Row Level Security on ALL public tables for development
-- This allows fetching dashboard data without a full authentication setup.

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sustainability_goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_progress DISABLE ROW LEVEL SECURITY;

-- ===============================================================
-- NOTE: RE-ENABLE ALL POLICIES BEFORE MOVING TO PRODUCTION
-- You can do this by running the original rls-policies.sql script
-- or by running the following commands:
-- ===============================================================
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.energy_data ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.sustainability_goals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.goal_progress ENABLE ROW LEVEL SECURITY;
-- =============================================================== 