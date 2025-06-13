/*
  # Create user_profiles table with all required columns

  1. New Tables
    - `user_profiles` - Complete user profile information
      - Basic info: name, age, gender, email
      - Physical: height (feet/inches), weight
      - Health: activity level, goals, restrictions, allergies
      - System: subscription status, interviews remaining

  2. Security
    - Enable RLS on user_profiles table
    - Add policies for authenticated users to manage their own data
    - Service role policies for system operations

  3. Functions & Triggers
    - Auto-calculate total height from feet/inches
    - Handle new user signup
    - Initialize onboarding progress
    - Update timestamps automatically
*/

-- Create user_profiles table with all required columns
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_status text DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium')),
  interviews_remaining integer DEFAULT 3,
  email text,
  name text DEFAULT '',
  age integer DEFAULT 0,
  gender text DEFAULT 'other' CHECK (gender IN ('male', 'female', 'other')),
  height integer DEFAULT 0, -- total height in inches
  height_feet integer DEFAULT 0 CHECK (height_feet >= 0 AND height_feet <= 8),
  height_inches integer DEFAULT 0 CHECK (height_inches >= 0 AND height_inches < 12),
  weight numeric DEFAULT 0, -- in pounds
  activity_level text DEFAULT 'moderate' CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  health_goals text[] DEFAULT '{}',
  dietary_restrictions text[] DEFAULT '{}',
  allergies text[] DEFAULT '{}',
  current_habits text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add unique constraints if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_profiles_user_id_key'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_profiles_email_key'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_email_key UNIQUE (email);
  END IF;
END $$;

-- Add additional check constraints if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_profiles_age_check'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_age_check CHECK (age >= 0 AND age <= 120);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_profiles_weight_check'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_weight_check CHECK (weight >= 0 AND weight <= 1000);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_profiles_height_check'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_height_check CHECK (height >= 0 AND height <= 120);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_profiles_email_format_check'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_email_format_check 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (with existence checks)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can read own profile'
  ) THEN
    CREATE POLICY "Users can read own profile"
      ON user_profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON user_profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON user_profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Allow service role to insert user profiles'
  ) THEN
    CREATE POLICY "Allow service role to insert user profiles"
      ON user_profiles
      FOR INSERT
      TO service_role
      WITH CHECK (true);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically calculate total height from feet and inches
CREATE OR REPLACE FUNCTION calculate_total_height()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate total height in inches from feet and inches
  IF NEW.height_feet IS NOT NULL AND NEW.height_inches IS NOT NULL THEN
    NEW.height = (NEW.height_feet * 12) + NEW.height_inches;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger to automatically update height
DROP TRIGGER IF EXISTS calculate_height_trigger ON user_profiles;
CREATE TRIGGER calculate_height_trigger
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION calculate_total_height();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
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

-- Drop and recreate trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create function to initialize onboarding progress
CREATE OR REPLACE FUNCTION initialize_onboarding_progress()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO onboarding_progress (user_id) VALUES (NEW.user_id);
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the profile creation
        RAISE LOG 'Error creating onboarding progress for user %: %', NEW.user_id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger to initialize onboarding when user profile is created
DROP TRIGGER IF EXISTS initialize_onboarding_trigger ON user_profiles;
CREATE TRIGGER initialize_onboarding_trigger
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_onboarding_progress();