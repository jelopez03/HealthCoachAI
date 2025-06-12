/*
  # Health Coaching Application Database Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `age` (integer)
      - `gender` (text with check constraint)
      - `height` (integer, in cm)
      - `weight` (integer, in kg)
      - `activity_level` (text with check constraint)
      - `health_goals` (text array)
      - `dietary_restrictions` (text array)
      - `allergies` (text array)
      - `current_habits` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `conversations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `message_count` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, references conversations)
      - `role` (text with check constraint)
      - `content` (text)
      - `message_type` (text with check constraint)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add triggers for automatic profile creation and timestamp updates

  3. Performance
    - Add indexes for frequently queried columns
    - Add function to automatically update conversation message counts
*/

-- Create updated_at trigger function if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'update_updated_at_column'
    ) THEN
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $func$ language 'plpgsql';
    END IF;
END $$;

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL DEFAULT '',
    age integer DEFAULT 0,
    gender text DEFAULT 'other' CHECK (gender IN ('male', 'female', 'other')),
    height integer DEFAULT 0, -- in cm
    weight integer DEFAULT 0, -- in kg
    activity_level text DEFAULT 'moderate' CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    health_goals text[] DEFAULT '{}',
    dietary_restrictions text[] DEFAULT '{}',
    allergies text[] DEFAULT '{}',
    current_habits text DEFAULT '',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id)
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL DEFAULT 'New Conversation',
    message_count integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    role text NOT NULL CHECK (role IN ('user', 'assistant')),
    content text NOT NULL,
    message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'meal_plan', 'recipe', 'video', 'audio')),
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles (with existence checks)
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
END $$;

-- Create RLS policies for conversations (with existence checks)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'conversations' 
        AND policyname = 'Users can read own conversations'
    ) THEN
        CREATE POLICY "Users can read own conversations"
            ON conversations
            FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'conversations' 
        AND policyname = 'Users can insert own conversations'
    ) THEN
        CREATE POLICY "Users can insert own conversations"
            ON conversations
            FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'conversations' 
        AND policyname = 'Users can update own conversations'
    ) THEN
        CREATE POLICY "Users can update own conversations"
            ON conversations
            FOR UPDATE
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'conversations' 
        AND policyname = 'Users can delete own conversations'
    ) THEN
        CREATE POLICY "Users can delete own conversations"
            ON conversations
            FOR DELETE
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create RLS policies for messages (with existence checks)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'messages' 
        AND policyname = 'Users can read messages from own conversations'
    ) THEN
        CREATE POLICY "Users can read messages from own conversations"
            ON messages
            FOR SELECT
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM conversations 
                    WHERE conversations.id = messages.conversation_id 
                    AND conversations.user_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'messages' 
        AND policyname = 'Users can insert messages to own conversations'
    ) THEN
        CREATE POLICY "Users can insert messages to own conversations"
            ON messages
            FOR INSERT
            TO authenticated
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM conversations 
                    WHERE conversations.id = messages.conversation_id 
                    AND conversations.user_id = auth.uid()
                )
            );
    END IF;
END $$;

-- Create triggers for updated_at (with existence checks)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_user_profiles_updated_at'
    ) THEN
        CREATE TRIGGER update_user_profiles_updated_at
            BEFORE UPDATE ON user_profiles
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_conversations_updated_at'
    ) THEN
        CREATE TRIGGER update_conversations_updated_at
            BEFORE UPDATE ON conversations
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Function to handle new user signup
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'handle_new_user'
    ) THEN
        CREATE OR REPLACE FUNCTION handle_new_user()
        RETURNS TRIGGER AS $func$
        BEGIN
            INSERT INTO user_profiles (user_id, name)
            VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''));
            RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql SECURITY DEFINER;
    END IF;
END $$;

-- Trigger to automatically create profile for new users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created'
    ) THEN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW
            EXECUTE FUNCTION handle_new_user();
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Function to update conversation message count
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'update_conversation_message_count'
    ) THEN
        CREATE OR REPLACE FUNCTION update_conversation_message_count()
        RETURNS TRIGGER AS $func$
        BEGIN
            IF TG_OP = 'INSERT' THEN
                UPDATE conversations 
                SET message_count = message_count + 1,
                    updated_at = now()
                WHERE id = NEW.conversation_id;
                RETURN NEW;
            ELSIF TG_OP = 'DELETE' THEN
                UPDATE conversations 
                SET message_count = GREATEST(message_count - 1, 0),
                    updated_at = now()
                WHERE id = OLD.conversation_id;
                RETURN OLD;
            END IF;
            RETURN NULL;
        END;
        $func$ LANGUAGE plpgsql SECURITY DEFINER;
    END IF;
END $$;

-- Trigger to update message count when messages are added/removed
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_message_count_trigger'
    ) THEN
        CREATE TRIGGER update_message_count_trigger
            AFTER INSERT OR DELETE ON messages
            FOR EACH ROW
            EXECUTE FUNCTION update_conversation_message_count();
    END IF;
END $$;