-- Temporarily disable Row Level Security on the users table for development
-- This allows fetching dashboard data without full authentication setup

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Note: Re-enable this before production
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY; 