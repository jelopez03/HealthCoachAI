/*
  # Remove foreign key constraint from user_profiles table

  1. Changes
    - Drop the foreign key constraint `user_profiles_user_id_fkey` that references the users table
    - This allows user_profiles to be created without requiring an authenticated user in auth.users
    - Maintains the user_id column but removes the referential integrity constraint

  2. Security
    - Keep RLS policies intact for data protection
    - Allow profiles to be created with any user_id value
*/

-- Drop the foreign key constraint that requires user_id to exist in auth.users
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;