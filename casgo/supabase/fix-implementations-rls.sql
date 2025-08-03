-- Fix RLS policies for implementations table
-- This allows users to manage their own implementations

-- Enable RLS on implementations table (if not already enabled)
ALTER TABLE public.implementations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own implementations" ON public.implementations;
DROP POLICY IF EXISTS "Users can insert their own implementations" ON public.implementations;
DROP POLICY IF EXISTS "Users can update their own implementations" ON public.implementations;
DROP POLICY IF EXISTS "Users can delete their own implementations" ON public.implementations;
DROP POLICY IF EXISTS "System can insert implementations" ON public.implementations;

-- Create new policies for implementations table
CREATE POLICY "Users can view their own implementations" ON public.implementations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own implementations" ON public.implementations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own implementations" ON public.implementations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own implementations" ON public.implementations
  FOR DELETE USING (auth.uid() = user_id);

-- Allow system (backend API) to insert implementations for users
CREATE POLICY "System can insert implementations" ON public.implementations
  FOR INSERT WITH CHECK (true);

-- Grant necessary permissions to authenticated users
GRANT ALL ON public.implementations TO authenticated;

-- Verify the policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'implementations'; 