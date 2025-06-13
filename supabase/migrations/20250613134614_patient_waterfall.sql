/*
  # Add missing columns to user_profiles table

  1. New Columns
    - `name` (text) - User's full name
    - `age` (integer) - User's age
    - `gender` (text) - User's gender
    - `weight` (numeric) - User's weight
    - `activity_level` (text) - User's activity level
    - `health_goals` (text[]) - Array of health goals
    - `dietary_restrictions` (text[]) - Array of dietary restrictions
    - `allergies` (text[]) - Array of allergies
    - `current_habits` (text) - User's current habits description

  2. Constraints
    - Add check constraints for gender and activity_level
    - Add validation for reasonable age and weight values

  3. Security
    - RLS policies already exist and will apply to new columns
*/

-- Add missing columns to user_profiles table
DO $$
BEGIN
  -- Add name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'name'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN name text;
  END IF;

  -- Add age column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'age'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN age integer;
  END IF;

  -- Add gender column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'gender'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN gender text DEFAULT 'other';
  END IF;

  -- Add weight column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'weight'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN weight numeric;
  END IF;

  -- Add activity_level column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'activity_level'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN activity_level text DEFAULT 'moderate';
  END IF;

  -- Add health_goals column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'health_goals'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN health_goals text[] DEFAULT '{}';
  END IF;

  -- Add dietary_restrictions column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'dietary_restrictions'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN dietary_restrictions text[] DEFAULT '{}';
  END IF;

  -- Add allergies column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'allergies'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN allergies text[] DEFAULT '{}';
  END IF;

  -- Add current_habits column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'current_habits'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN current_habits text;
  END IF;

  -- Add height column (total height in inches) if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'height'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN height integer;
  END IF;
END $$;

-- Add check constraints
DO $$
BEGIN
  -- Gender constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'user_profiles_gender_check'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_gender_check 
    CHECK (gender IN ('male', 'female', 'other'));
  END IF;

  -- Activity level constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'user_profiles_activity_level_check'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_activity_level_check 
    CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active'));
  END IF;

  -- Age constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'user_profiles_age_check'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_age_check 
    CHECK (age >= 13 AND age <= 120);
  END IF;

  -- Weight constraint (in pounds)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'user_profiles_weight_check'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_weight_check 
    CHECK (weight > 0 AND weight <= 1000);
  END IF;

  -- Height constraint (total height in inches)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'user_profiles_height_check'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_height_check 
    CHECK (height > 0 AND height <= 120);
  END IF;
END $$;

-- Create a function to automatically calculate total height from feet and inches
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

-- Create trigger to automatically update height when height_feet or height_inches change
DROP TRIGGER IF EXISTS calculate_height_trigger ON user_profiles;
CREATE TRIGGER calculate_height_trigger
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION calculate_total_height();