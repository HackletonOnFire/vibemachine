-- Debug RLS Policies and Database Access
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check current RLS policies on users table
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users';

-- 2. Check if RLS is enabled on users table
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- 3. Test direct access to users table (should work for authenticated users)
SELECT 
  id,
  email,
  business_name,
  onboarding_completed,
  created_at
FROM public.users 
LIMIT 5;

-- 4. Check if there are any users with the specific email
SELECT 
  id,
  email,
  business_name,
  onboarding_completed,
  first_name,
  last_name
FROM public.users 
WHERE email = 'prashanthravichandran2@gmail.com';

-- 5. Quick fix: Temporarily disable RLS completely (for testing)
-- WARNING: This removes all access restrictions - only for debugging
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY; 