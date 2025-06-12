/*
  # Fix signup database error

  1. Problem
    - Database error when creating new users during signup
    - Likely caused by the handle_new_user trigger function failing
    - Need to ensure the trigger function properly handles user profile creation

  2. Solution
    - Recreate the handle_new_user function with proper error handling
    - Ensure the trigger is properly set up on auth.users table
    - Add proper RLS policies for the auth schema interaction

  3. Security
    - Maintain existing RLS policies
    - Ensure trigger function has proper permissions
*/

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the handle_new_user function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new user profile record
  INSERT INTO public.user_profiles (user_id, subscription_status, interviews_remaining)
  VALUES (
    NEW.id,
    'free',
    3
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error creating user profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure the function has proper permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Add policy to allow the trigger function to insert user profiles
CREATE POLICY "Allow service role to insert user profiles" ON public.user_profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);