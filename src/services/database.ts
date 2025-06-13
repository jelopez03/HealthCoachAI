import { supabase } from '../lib/supabase';
import type { 
  UserProfile, 
  Conversation, 
  Message, 
  Workout, 
  WorkoutSession, 
  Habit, 
  HabitEntry, 
  ProgressData, 
  Achievement, 
  GroceryList, 
  GroceryItem, 
  Recipe, 
  MealPlan,
  WeeklyReport,
  UserPreferences,
  OnboardingProgress
} from '../types';

// Extended types for database operations
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

export interface WorkoutSession {
  id: string;
  user_id: string;
  workout_id?: string;
  name: string;
  type: 'cardio' | 'strength' | 'flexibility' | 'sports';
  duration: number;
  calories: number;
  date: string;
  completed: boolean;
  sets?: number;
  reps?: number;
  weight?: number;
  distance?: number;
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

export interface UserPreferences {
  id: string;
  user_id: string;
  notifications: any;
  appearance: any;
  privacy: any;
  coaching: any;
  audio: any;
  created_at: string;
  updated_at: string;
}

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

export class DatabaseService {
  // User Profile Operations
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    return data;
  }

  static async updateUserProfile(profile: Partial<UserProfile>): Promise<void> {
    const { error } = await supabase
      .from('user_profiles')
      .upsert(profile);

    if (error) throw error;
  }

  // Workout Operations
  static async getWorkouts(userId: string): Promise<Workout[]> {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createWorkout(workout: Omit<Workout, 'id' | 'created_at' | 'updated_at'>): Promise<Workout> {
    const { data, error } = await supabase
      .from('workouts')
      .insert(workout)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateWorkout(id: string, updates: Partial<Workout>): Promise<void> {
    const { error } = await supabase
      .from('workouts')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  static async deleteWorkout(id: string): Promise<void> {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Workout Session Operations
  static async getWorkoutSessions(userId: string, date?: string): Promise<WorkoutSession[]> {
    let query = supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId);

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createWorkoutSession(session: Omit<WorkoutSession, 'id' | 'created_at' | 'updated_at'>): Promise<WorkoutSession> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .insert(session)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateWorkoutSession(id: string, updates: Partial<WorkoutSession>): Promise<void> {
    const { error } = await supabase
      .from('workout_sessions')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  static async deleteWorkoutSession(id: string): Promise<void> {
    const { error } = await supabase
      .from('workout_sessions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Habit Operations
  static async getHabits(userId: string): Promise<Habit[]> {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async createHabit(habit: Omit<Habit, 'id' | 'created_at' | 'updated_at'>): Promise<Habit> {
    const { data, error } = await supabase
      .from('habits')
      .insert(habit)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateHabit(id: string, updates: Partial<Habit>): Promise<void> {
    const { error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  static async deleteHabit(id: string): Promise<void> {
    const { error } = await supabase
      .from('habits')
      .update({ active: false })
      .eq('id', id);

    if (error) throw error;
  }

  // Habit Entry Operations
  static async getHabitEntries(userId: string, date?: string): Promise<HabitEntry[]> {
    let query = supabase
      .from('habit_entries')
      .select('*')
      .eq('user_id', userId);

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async upsertHabitEntry(entry: Omit<HabitEntry, 'id' | 'created_at'>): Promise<HabitEntry> {
    const { data, error } = await supabase
      .from('habit_entries')
      .upsert(entry, { onConflict: 'habit_id,date' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Progress Data Operations
  static async getProgressData(userId: string, startDate?: string, endDate?: string): Promise<ProgressData[]> {
    let query = supabase
      .from('progress_data')
      .select('*')
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async upsertProgressData(progress: Omit<ProgressData, 'id' | 'created_at' | 'updated_at'>): Promise<ProgressData> {
    const { data, error } = await supabase
      .from('progress_data')
      .upsert(progress, { onConflict: 'user_id,date' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Achievement Operations
  static async getAchievements(userId: string): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('date_earned', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createAchievement(achievement: Omit<Achievement, 'id' | 'created_at'>): Promise<Achievement> {
    const { data, error } = await supabase
      .from('achievements')
      .insert(achievement)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Grocery List Operations
  static async getGroceryLists(userId: string): Promise<GroceryList[]> {
    const { data, error } = await supabase
      .from('grocery_lists')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createGroceryList(list: Omit<GroceryList, 'id' | 'total_items' | 'completed_items' | 'created_at' | 'updated_at'>): Promise<GroceryList> {
    const { data, error } = await supabase
      .from('grocery_lists')
      .insert(list)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateGroceryList(id: string, updates: Partial<GroceryList>): Promise<void> {
    const { error } = await supabase
      .from('grocery_lists')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  static async deleteGroceryList(id: string): Promise<void> {
    const { error } = await supabase
      .from('grocery_lists')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Grocery Item Operations
  static async getGroceryItems(listId: string): Promise<GroceryItem[]> {
    const { data, error } = await supabase
      .from('grocery_items')
      .select('*')
      .eq('grocery_list_id', listId)
      .order('category', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async createGroceryItem(item: Omit<GroceryItem, 'id' | 'created_at'>): Promise<GroceryItem> {
    const { data, error } = await supabase
      .from('grocery_items')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateGroceryItem(id: string, updates: Partial<GroceryItem>): Promise<void> {
    const { error } = await supabase
      .from('grocery_items')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  static async deleteGroceryItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('grocery_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Recipe Operations
  static async getRecipes(userId: string): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_ingredients (
          id,
          name,
          amount,
          unit,
          order_index
        )
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createRecipe(recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>, ingredients: any[]): Promise<Recipe> {
    const { data: recipeData, error: recipeError } = await supabase
      .from('recipes')
      .insert(recipe)
      .select()
      .single();

    if (recipeError) throw recipeError;

    if (ingredients.length > 0) {
      const ingredientsWithRecipeId = ingredients.map((ing, index) => ({
        ...ing,
        recipe_id: recipeData.id,
        order_index: index
      }));

      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .insert(ingredientsWithRecipeId);

      if (ingredientsError) throw ingredientsError;
    }

    return recipeData;
  }

  static async updateRecipe(id: string, updates: Partial<Recipe>, ingredients?: any[]): Promise<void> {
    const { error: recipeError } = await supabase
      .from('recipes')
      .update(updates)
      .eq('id', id);

    if (recipeError) throw recipeError;

    if (ingredients) {
      // Delete existing ingredients
      await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', id);

      // Insert new ingredients
      if (ingredients.length > 0) {
        const ingredientsWithRecipeId = ingredients.map((ing, index) => ({
          ...ing,
          recipe_id: id,
          order_index: index
        }));

        const { error: ingredientsError } = await supabase
          .from('recipe_ingredients')
          .insert(ingredientsWithRecipeId);

        if (ingredientsError) throw ingredientsError;
      }
    }
  }

  static async deleteRecipe(id: string): Promise<void> {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // User Preferences Operations
  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error;
    }
    return data;
  }

  static async upsertUserPreferences(preferences: Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'>): Promise<UserPreferences> {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert(preferences, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Onboarding Progress Operations
  static async getOnboardingProgress(userId: string): Promise<OnboardingProgress | null> {
    const { data, error } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data;
  }

  static async updateOnboardingProgress(userId: string, updates: Partial<OnboardingProgress>): Promise<OnboardingProgress> {
    const { data, error } = await supabase
      .from('onboarding_progress')
      .upsert({ user_id: userId, ...updates }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Conversation Operations (existing)
  static async getConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createConversation(userId: string, title: string): Promise<Conversation> {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        title,
        message_count: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}