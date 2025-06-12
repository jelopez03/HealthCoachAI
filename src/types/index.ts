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
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // in inches
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

export interface HabitEntry {
  date: string;
  value: number;
  completed: boolean;
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
  date: string;
  weight: number;
  calories: number;
  water: number;
  steps: number;
  workouts: number;
  sleep_hours?: number;
  mood?: number;
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
  title: string;
  description: string;
  icon: string;
  date_earned: string;
  category: 'workout' | 'habit' | 'weight' | 'streak' | 'milestone';
}