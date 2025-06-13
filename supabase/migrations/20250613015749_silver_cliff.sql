/*
  # Complete HealthCoach AI Database Schema

  1. New Tables
    - `workouts` - Exercise tracking with sets, reps, duration
    - `workout_sessions` - Individual workout session records
    - `habits` - Daily habit tracking (water, steps, sleep, etc.)
    - `habit_entries` - Daily habit completion records
    - `progress_data` - Daily health metrics (weight, calories, etc.)
    - `achievements` - User achievements and milestones
    - `grocery_lists` - Saved smart grocery lists
    - `grocery_items` - Items within grocery lists
    - `recipes` - User's saved recipes
    - `meal_plans` - Saved meal plans
    - `meal_plan_days` - Days within meal plans
    - `meal_plan_meals` - Meals within meal plan days
    - `weekly_reports` - Generated weekly health reports
    - `user_preferences` - User app preferences and settings
    - `onboarding_progress` - Track user onboarding completion

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Service role policies for system operations

  3. Functions
    - Update triggers for timestamp management
    - Achievement calculation functions
    - Progress tracking functions
*/

-- Workouts table for exercise tracking
CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('cardio', 'strength', 'flexibility', 'sports')),
  default_duration integer DEFAULT 30,
  estimated_calories integer DEFAULT 100,
  icon text DEFAULT '🏃',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Workout sessions for tracking actual workouts
CREATE TABLE IF NOT EXISTS workout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workout_id uuid REFERENCES workouts(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  duration integer NOT NULL, -- in minutes
  calories integer DEFAULT 0,
  date date DEFAULT CURRENT_DATE,
  completed boolean DEFAULT false,
  sets integer,
  reps integer,
  weight numeric, -- in lbs
  distance numeric, -- in miles
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habits table for tracking daily habits
CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  icon text DEFAULT '⭐',
  target numeric NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT 'times',
  color text DEFAULT 'blue',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habit entries for daily tracking
CREATE TABLE IF NOT EXISTS habit_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  habit_id uuid REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  date date DEFAULT CURRENT_DATE,
  value numeric DEFAULT 0,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(habit_id, date)
);

-- Progress data for daily health metrics
CREATE TABLE IF NOT EXISTS progress_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date DEFAULT CURRENT_DATE,
  weight numeric, -- in lbs
  calories integer,
  water numeric, -- in liters
  steps integer,
  sleep_hours numeric,
  mood integer CHECK (mood >= 1 AND mood <= 5),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  icon text DEFAULT '🏆',
  category text NOT NULL CHECK (category IN ('workout', 'habit', 'weight', 'streak', 'milestone')),
  date_earned date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Grocery lists table
CREATE TABLE IF NOT EXISTS grocery_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  is_favorite boolean DEFAULT false,
  total_items integer DEFAULT 0,
  completed_items integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Grocery items table
CREATE TABLE IF NOT EXISTS grocery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grocery_list_id uuid REFERENCES grocery_lists(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  quantity text NOT NULL,
  checked boolean DEFAULT false,
  from_meal_plan boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  prep_time integer DEFAULT 0, -- in minutes
  cook_time integer DEFAULT 0, -- in minutes
  servings integer DEFAULT 1,
  calories_per_serving integer DEFAULT 0,
  difficulty text DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  instructions text[], -- array of instruction steps
  tags text[] DEFAULT '{}',
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Recipe ingredients table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  amount text NOT NULL,
  unit text NOT NULL,
  order_index integer DEFAULT 0
);

-- Meal plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  calories_per_day integer DEFAULT 2000,
  days_count integer DEFAULT 7,
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Meal plan days table
CREATE TABLE IF NOT EXISTS meal_plan_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id uuid REFERENCES meal_plans(id) ON DELETE CASCADE NOT NULL,
  day_name text NOT NULL,
  day_order integer NOT NULL,
  total_calories integer DEFAULT 0
);

-- Meal plan meals table
CREATE TABLE IF NOT EXISTS meal_plan_meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_day_id uuid REFERENCES meal_plan_days(id) ON DELETE CASCADE NOT NULL,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  name text NOT NULL,
  calories integer DEFAULT 0,
  ingredients text[] DEFAULT '{}',
  instructions text,
  order_index integer DEFAULT 0
);

-- Weekly reports table
CREATE TABLE IF NOT EXISTS weekly_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start date NOT NULL,
  week_end date NOT NULL,
  calories_goal integer,
  calories_actual integer,
  meals_logged integer,
  meals_goal integer,
  exercise_days integer,
  exercise_goal integer,
  weight_change numeric,
  achievements text[] DEFAULT '{}',
  insights text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  notifications jsonb DEFAULT '{}',
  appearance jsonb DEFAULT '{}',
  privacy jsonb DEFAULT '{}',
  coaching jsonb DEFAULT '{}',
  audio jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Onboarding progress table
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile_completed boolean DEFAULT false,
  first_conversation boolean DEFAULT false,
  first_workout boolean DEFAULT false,
  first_habit boolean DEFAULT false,
  preferences_set boolean DEFAULT false,
  walkthrough_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on all tables
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workouts
CREATE POLICY "Users can manage own workouts"
  ON workouts FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for workout_sessions
CREATE POLICY "Users can manage own workout sessions"
  ON workout_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for habits
CREATE POLICY "Users can manage own habits"
  ON habits FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for habit_entries
CREATE POLICY "Users can manage own habit entries"
  ON habit_entries FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for progress_data
CREATE POLICY "Users can manage own progress data"
  ON progress_data FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for achievements
CREATE POLICY "Users can read own achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievements"
  ON achievements FOR INSERT
  TO service_role
  WITH CHECK (true);

-- RLS Policies for grocery_lists
CREATE POLICY "Users can manage own grocery lists"
  ON grocery_lists FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for grocery_items
CREATE POLICY "Users can manage grocery items in own lists"
  ON grocery_items FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM grocery_lists 
    WHERE grocery_lists.id = grocery_items.grocery_list_id 
    AND grocery_lists.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM grocery_lists 
    WHERE grocery_lists.id = grocery_items.grocery_list_id 
    AND grocery_lists.user_id = auth.uid()
  ));

-- RLS Policies for recipes
CREATE POLICY "Users can manage own recipes"
  ON recipes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for recipe_ingredients
CREATE POLICY "Users can manage ingredients in own recipes"
  ON recipe_ingredients FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM recipes 
    WHERE recipes.id = recipe_ingredients.recipe_id 
    AND recipes.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM recipes 
    WHERE recipes.id = recipe_ingredients.recipe_id 
    AND recipes.user_id = auth.uid()
  ));

-- RLS Policies for meal_plans
CREATE POLICY "Users can manage own meal plans"
  ON meal_plans FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for meal_plan_days
CREATE POLICY "Users can manage days in own meal plans"
  ON meal_plan_days FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM meal_plans 
    WHERE meal_plans.id = meal_plan_days.meal_plan_id 
    AND meal_plans.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM meal_plans 
    WHERE meal_plans.id = meal_plan_days.meal_plan_id 
    AND meal_plans.user_id = auth.uid()
  ));

-- RLS Policies for meal_plan_meals
CREATE POLICY "Users can manage meals in own meal plans"
  ON meal_plan_meals FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM meal_plan_days 
    JOIN meal_plans ON meal_plans.id = meal_plan_days.meal_plan_id
    WHERE meal_plan_days.id = meal_plan_meals.meal_plan_day_id 
    AND meal_plans.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM meal_plan_days 
    JOIN meal_plans ON meal_plans.id = meal_plan_days.meal_plan_id
    WHERE meal_plan_days.id = meal_plan_meals.meal_plan_day_id 
    AND meal_plans.user_id = auth.uid()
  ));

-- RLS Policies for weekly_reports
CREATE POLICY "Users can read own weekly reports"
  ON weekly_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage weekly reports"
  ON weekly_reports FOR ALL
  TO service_role
  WITH CHECK (true);

-- RLS Policies for user_preferences
CREATE POLICY "Users can manage own preferences"
  ON user_preferences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for onboarding_progress
CREATE POLICY "Users can manage own onboarding progress"
  ON onboarding_progress FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date ON workout_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_habit_entries_habit_date ON habit_entries(habit_id, date);
CREATE INDEX IF NOT EXISTS idx_progress_data_user_date ON progress_data(user_id, date);
CREATE INDEX IF NOT EXISTS idx_achievements_user_date ON achievements(user_id, date_earned);
CREATE INDEX IF NOT EXISTS idx_grocery_items_list_id ON grocery_items(grocery_list_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_days_plan_id ON meal_plan_days(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_meals_day_id ON meal_plan_meals(meal_plan_day_id);

-- Update triggers for timestamp management
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON workouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workout_sessions_updated_at BEFORE UPDATE ON workout_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progress_data_updated_at BEFORE UPDATE ON progress_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grocery_lists_updated_at BEFORE UPDATE ON grocery_lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON meal_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_onboarding_progress_updated_at BEFORE UPDATE ON onboarding_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update grocery list item counts
CREATE OR REPLACE FUNCTION update_grocery_list_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE grocery_lists SET
            total_items = (
                SELECT COUNT(*) FROM grocery_items 
                WHERE grocery_list_id = NEW.grocery_list_id
            ),
            completed_items = (
                SELECT COUNT(*) FROM grocery_items 
                WHERE grocery_list_id = NEW.grocery_list_id AND checked = true
            ),
            updated_at = now()
        WHERE id = NEW.grocery_list_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE grocery_lists SET
            total_items = (
                SELECT COUNT(*) FROM grocery_items 
                WHERE grocery_list_id = OLD.grocery_list_id
            ),
            completed_items = (
                SELECT COUNT(*) FROM grocery_items 
                WHERE grocery_list_id = OLD.grocery_list_id AND checked = true
            ),
            updated_at = now()
        WHERE id = OLD.grocery_list_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply grocery list count trigger
CREATE TRIGGER update_grocery_list_counts_trigger
    AFTER INSERT OR UPDATE OR DELETE ON grocery_items
    FOR EACH ROW EXECUTE FUNCTION update_grocery_list_counts();

-- Function to create default habits for new users
CREATE OR REPLACE FUNCTION create_default_habits_for_user(user_id_param uuid)
RETURNS void AS $$
BEGIN
    INSERT INTO habits (user_id, name, icon, target, unit, color) VALUES
    (user_id_param, 'Water Intake', '💧', 8, 'glasses', 'blue'),
    (user_id_param, 'Daily Steps', '👟', 10000, 'steps', 'green'),
    (user_id_param, 'Sleep Hours', '😴', 8, 'hours', 'purple'),
    (user_id_param, 'Meditation', '🧘', 10, 'minutes', 'pink');
END;
$$ language 'plpgsql';

-- Function to initialize onboarding progress for new users
CREATE OR REPLACE FUNCTION initialize_onboarding_progress()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO onboarding_progress (user_id) VALUES (NEW.user_id);
    PERFORM create_default_habits_for_user(NEW.user_id);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to initialize onboarding when user profile is created
CREATE TRIGGER initialize_onboarding_trigger
    AFTER INSERT ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION initialize_onboarding_progress();