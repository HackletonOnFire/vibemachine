-- Auto User Profile Creation Trigger
-- This script creates a trigger that automatically creates a user profile
-- in the public.users table whenever someone signs up via Supabase auth

-- Function to create user profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  first_name_val TEXT;
  last_name_val TEXT;
  business_name_val TEXT;
  full_name_val TEXT;
BEGIN
  -- Extract metadata from auth.users
  full_name_val := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '');
  business_name_val := COALESCE(NEW.raw_user_meta_data->>'business_name', 'Pending Setup');
  
  -- Split full name into first and last name
  IF full_name_val != '' THEN
    first_name_val := split_part(full_name_val, ' ', 1);
    last_name_val := trim(replace(full_name_val, split_part(full_name_val, ' ', 1), ''));
  ELSE
    first_name_val := '';
    last_name_val := '';
  END IF;
  
  -- Ensure business name meets minimum length requirement
  IF LENGTH(business_name_val) < 2 THEN
    business_name_val := 'Pending Setup';
  END IF;

  -- Insert user profile with extracted data
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    business_name,
    industry,
    company_size,
    location,
    onboarding_completed,
    onboarding_step,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    first_name_val,
    last_name_val,
    business_name_val,
    'other'::industry_type,  -- Default industry
    'small'::company_size,   -- Default company size
    'TBD',                   -- Default location (meets 2+ char requirement)
    FALSE,                   -- Not onboarded yet
    1,                       -- Start at step 1
    NOW(),
    NOW()
  );

  -- Log successful creation
  RAISE LOG 'Auto-created user profile for user %', NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth process
    RAISE LOG 'Failed to auto-create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires after user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.users TO authenticated;

-- Create a function to handle user profile updates during onboarding
CREATE OR REPLACE FUNCTION public.update_user_profile_from_metadata(user_id UUID)
RETURNS VOID AS $$
DECLARE
  auth_user RECORD;
  first_name_val TEXT;
  last_name_val TEXT;
  business_name_val TEXT;
  full_name_val TEXT;
BEGIN
  -- Get the auth user data
  SELECT * INTO auth_user FROM auth.users WHERE id = user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', user_id;
  END IF;
  
  -- Extract metadata
  full_name_val := COALESCE(auth_user.raw_user_meta_data->>'full_name', auth_user.raw_user_meta_data->>'name', '');
  business_name_val := COALESCE(auth_user.raw_user_meta_data->>'business_name', 'Pending Setup');
  
  -- Split full name
  IF full_name_val != '' THEN
    first_name_val := split_part(full_name_val, ' ', 1);
    last_name_val := trim(replace(full_name_val, split_part(full_name_val, ' ', 1), ''));
  ELSE
    first_name_val := '';
    last_name_val := '';
  END IF;
  
  -- Update the user profile
  UPDATE public.users 
  SET 
    first_name = COALESCE(NULLIF(first_name_val, ''), first_name),
    last_name = COALESCE(NULLIF(last_name_val, ''), last_name),
    business_name = CASE 
      WHEN business_name_val != 'Pending Setup' AND LENGTH(business_name_val) >= 2 
      THEN business_name_val 
      ELSE business_name 
    END,
    updated_at = NOW()
  WHERE id = user_id;
  
  RAISE LOG 'Updated user profile from metadata for user %', user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.update_user_profile_from_metadata(UUID) TO authenticated; 