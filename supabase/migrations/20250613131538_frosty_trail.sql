/*
  # Enhanced User Profiles with Email and Height Fields

  1. Changes
    - Add email field to user_profiles table with unique constraint
    - Add separate feet and inches fields for height
    - Update height storage to be more user-friendly
    - Add validation constraints

  2. Security
    - Maintain existing RLS policies
    - Add unique constraint on email to prevent duplicates

  3. Data Migration
    - Convert existing height data from cm to feet/inches
    - Preserve existing data integrity
*/

-- Add email column with unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN email text;
  END IF;
END $$;

-- Add feet and inches columns for height
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'height_feet'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN height_feet integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'height_inches'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN height_inches integer DEFAULT 0;
  END IF;
END $$;

-- Create unique constraint on email if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_profiles_email_key'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_email_key UNIQUE (email);
  END IF;
END $$;

-- Add check constraints for height validation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_profiles_height_feet_check'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_height_feet_check 
    CHECK (height_feet >= 0 AND height_feet <= 8);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_profiles_height_inches_check'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_height_inches_check 
    CHECK (height_inches >= 0 AND height_inches < 12);
  END IF;
END $$;

-- Add email validation constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_profiles_email_format_check'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_email_format_check 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;
END $$;

-- Migrate existing height data from cm to feet/inches (if height column exists and has data)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'height'
  ) THEN
    -- Convert cm to total inches, then split into feet and inches
    UPDATE user_profiles 
    SET 
      height_feet = FLOOR((height * 0.393701) / 12),
      height_inches = ROUND((height * 0.393701) % 12)
    WHERE height > 0 AND (height_feet = 0 AND height_inches = 0);
  END IF;
END $$;

-- Create index on email for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Update the handle_new_user function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new user profile record with email from auth.users
  INSERT INTO public.user_profiles (user_id, subscription_status, interviews_remaining, email)
  VALUES (
    NEW.id,
    'free',
    3,
    NEW.email
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error creating user profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;