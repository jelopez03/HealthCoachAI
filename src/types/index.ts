export interface User {
  id: string;
  email: string;
  created_at: string;
  subscription_status: 'free' | 'premium' | 'trial';
}

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  email?: string; // Added email field
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // in inches (for backward compatibility)
  height_feet?: number; // feet component of height
  height_inches?: number; // inches component of height
  weight: number; // in lbs
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  health_goals: string[];
  dietary_restrictions: string[];
  allergies: string[];
  current_habits: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  message_type: 'text' | 'meal_plan' | 'recipe' | 'video' | 'audio';
  metadata?: {
    video_url?: string;
    audio_url?: string;
    meal_plan?: MealPlan;
    recipe?: Recipe;
  };
  created_at: string;
}

export interface MealPlan {
  id: string;
  title: string;
  description: string;
  days: DayPlan[];
  calories_per_day: number;
  created_at: string;
}

export interface DayPlan {
  day: string;
  meals: Meal[];
  total_calories: number;
}

export interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  ingredients: string[];
  instructions?: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  calories_per_serving: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  created_at: string;
}

export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export interface ChatResponse {
  message: string;
  message_type: 'text' | 'meal_plan' | 'recipe' | 'video' | 'audio';
  video_url?: string;
  audio_url?: string;
  meal_plan?: MealPlan;
  recipe?: Recipe;
}

// Exercise and Habits Types
export interface Workout {
  id: string;
  user_id: string;
  name: string;
  type: 'cardio' | 'strength' | 'flexibility' | 'sports';
  default_duration: number;
  estimated_calories: number;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  workout_id?: string;
  name: string;
  type: 'cardio' | 'strength' | 'flexibility' | 'sports';
  duration: number; // in minutes
  calories: number;
  date: string;
  completed: boolean;
  sets?: number;
  reps?: number;
  weight?: number; // in lbs
  distance?: number; // in miles
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  target: number;
  unit: string;
  color: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitEntry {
  id: string;
  user_id: string;
  habit_id: string;
  date: string;
  value: number;
  completed: boolean;
  created_at: string;
}

export interface HabitTracker {
  id: string;
  name: string;
  icon: string;
  streak: number;
  target: number;
  completed: boolean;
  color: string;
  unit: string;
  currentValue: number;
  history: HabitEntry[];
}

export interface ExerciseSession {
  id: string;
  workout_id: string;
  start_time: string;
  end_time?: string;
  actual_duration?: number;
  actual_calories?: number;
  heart_rate_avg?: number;
  heart_rate_max?: number;
  notes?: string;
}

// Analytics Types
export interface ProgressData {
  id: string;
  user_id: string;
  date: string;
  weight?: number;
  calories?: number;
  water?: number;
  steps?: number;
  sleep_hours?: number;
  mood?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WeeklyStats {
  totalWorkouts: number;
  totalCalories: number;
  totalMinutes: number;
  avgHeartRate: number;
  weightChange: number;
  streakDays: number;
}

export interface Achievement {
  id: string;
  user_id: string;
  title: string;
  description: string;
  icon: string;
  category: 'workout' | 'habit' | 'weight' | 'streak' | 'milestone';
  date_earned: string;
  created_at: string;
}

// Grocery List Types
export interface GroceryList {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_favorite: boolean;
  total_items: number;
  completed_items: number;
  created_at: string;
  updated_at: string;
}

export interface GroceryItem {
  id: string;
  grocery_list_id: string;
  name: string;
  category: string;
  quantity: string;
  checked: boolean;
  from_meal_plan: boolean;
  created_at: string;
}

// Weekly Report Types
export interface WeeklyReport {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  calories_goal?: number;
  calories_actual?: number;
  meals_logged?: number;
  meals_goal?: number;
  exercise_days?: number;
  exercise_goal?: number;
  weight_change?: number;
  achievements: string[];
  insights: string[];
  created_at: string;
}

// User Preferences Types
export interface UserPreferences {
  id: string;
  user_id: string;
  notifications: {
    email: boolean;
    push: boolean;
    mealReminders: boolean;
    progressUpdates: boolean;
    weeklyReports: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    colorScheme: 'blue' | 'green' | 'purple' | 'orange';
    fontSize: 'small' | 'medium' | 'large';
  };
  privacy: {
    dataSharing: boolean;
    analytics: boolean;
    personalizedAds: boolean;
  };
  coaching: {
    reminderFrequency: 'daily' | 'weekly' | 'monthly';
    coachingStyle: 'gentle' | 'motivational' | 'direct';
    language: 'en' | 'es' | 'fr' | 'de';
  };
  audio: {
    soundEffects: boolean;
    voiceGuidance: boolean;
    volume: number;
  };
  created_at: string;
  updated_at: string;
}

// Onboarding Types
export interface OnboardingProgress {
  id: string;
  user_id: string;
  profile_completed: boolean;
  first_conversation: boolean;
  first_workout: boolean;
  first_habit: boolean;
  preferences_set: boolean;
  walkthrough_completed: boolean;
  created_at: string;
  updated_at: string;
}