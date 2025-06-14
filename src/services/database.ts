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
    try {
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
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  }

  static async createUserProfile(profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          ...profile,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  static async upsertUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          ...profile,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error upserting user profile:', error);
      throw error;
    }
  }

  // Workout Operations
  static async getWorkouts(userId: string): Promise<Workout[]> {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching workouts:', error);
      return [];
    }
  }

  static async createWorkout(workout: Omit<Workout, 'id' | 'created_at' | 'updated_at'>): Promise<Workout> {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .insert({
          ...workout,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating workout:', error);
      throw error;
    }
  }

  static async updateWorkout(id: string, updates: Partial<Workout>): Promise<void> {
    try {
      const { error } = await supabase
        .from('workouts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating workout:', error);
      throw error;
    }
  }

  static async deleteWorkout(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting workout:', error);
      throw error;
    }
  }

  // Workout Session Operations
  static async getWorkoutSessions(userId: string, date?: string): Promise<WorkoutSession[]> {
    try {
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
    } catch (error) {
      console.error('Error fetching workout sessions:', error);
      return [];
    }
  }

  static async createWorkoutSession(session: Omit<WorkoutSession, 'id' | 'created_at' | 'updated_at'>): Promise<WorkoutSession> {
    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .insert({
          ...session,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating workout session:', error);
      throw error;
    }
  }

  static async updateWorkoutSession(id: string, updates: Partial<WorkoutSession>): Promise<void> {
    try {
      const { error } = await supabase
        .from('workout_sessions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating workout session:', error);
      throw error;
    }
  }

  static async deleteWorkoutSession(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('workout_sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting workout session:', error);
      throw error;
    }
  }

  // Habit Operations
  static async getHabits(userId: string): Promise<Habit[]> {
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching habits:', error);
      return [];
    }
  }

  static async createHabit(habit: Omit<Habit, 'id' | 'created_at' | 'updated_at'>): Promise<Habit> {
    try {
      const { data, error } = await supabase
        .from('habits')
        .insert({
          ...habit,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating habit:', error);
      throw error;
    }
  }

  static async updateHabit(id: string, updates: Partial<Habit>): Promise<void> {
    try {
      const { error } = await supabase
        .from('habits')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating habit:', error);
      throw error;
    }
  }

  static async deleteHabit(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('habits')
        .update({ 
          active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  }

  // Habit Entry Operations
  static async getHabitEntries(userId: string, date?: string): Promise<HabitEntry[]> {
    try {
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
    } catch (error) {
      console.error('Error fetching habit entries:', error);
      return [];
    }
  }

  static async upsertHabitEntry(entry: Omit<HabitEntry, 'id' | 'created_at'>): Promise<HabitEntry> {
    try {
      const { data, error } = await supabase
        .from('habit_entries')
        .upsert({
          ...entry,
          created_at: new Date().toISOString()
        }, { onConflict: 'habit_id,date' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error upserting habit entry:', error);
      throw error;
    }
  }

  // Progress Data Operations
  static async getProgressData(userId: string, startDate?: string, endDate?: string): Promise<ProgressData[]> {
    try {
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
    } catch (error) {
      console.error('Error fetching progress data:', error);
      return [];
    }
  }

  static async upsertProgressData(progress: Omit<ProgressData, 'id' | 'created_at' | 'updated_at'>): Promise<ProgressData> {
    try {
      const { data, error } = await supabase
        .from('progress_data')
        .upsert({
          ...progress,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,date' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error upserting progress data:', error);
      throw error;
    }
  }

  // Achievement Operations
  static async getAchievements(userId: string): Promise<Achievement[]> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .order('date_earned', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  }

  static async createAchievement(achievement: Omit<Achievement, 'id' | 'created_at'>): Promise<Achievement> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .insert({
          ...achievement,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating achievement:', error);
      throw error;
    }
  }

  // Grocery List Operations
  static async getGroceryLists(userId: string): Promise<GroceryList[]> {
    try {
      const { data, error } = await supabase
        .from('grocery_lists')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching grocery lists:', error);
      return [];
    }
  }

  static async createGroceryList(list: Omit<GroceryList, 'id' | 'total_items' | 'completed_items' | 'created_at' | 'updated_at'>): Promise<GroceryList> {
    try {
      const { data, error } = await supabase
        .from('grocery_lists')
        .insert({
          ...list,
          total_items: 0,
          completed_items: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating grocery list:', error);
      throw error;
    }
  }

  static async updateGroceryList(id: string, updates: Partial<GroceryList>): Promise<void> {
    try {
      const { error } = await supabase
        .from('grocery_lists')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating grocery list:', error);
      throw error;
    }
  }

  static async deleteGroceryList(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('grocery_lists')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting grocery list:', error);
      throw error;
    }
  }

  // Grocery Item Operations
  static async getGroceryItems(listId: string): Promise<GroceryItem[]> {
    try {
      const { data, error } = await supabase
        .from('grocery_items')
        .select('*')
        .eq('grocery_list_id', listId)
        .order('category', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching grocery items:', error);
      return [];
    }
  }

  static async createGroceryItem(item: Omit<GroceryItem, 'id' | 'created_at'>): Promise<GroceryItem> {
    try {
      const { data, error } = await supabase
        .from('grocery_items')
        .insert({
          ...item,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating grocery item:', error);
      throw error;
    }
  }

  static async updateGroceryItem(id: string, updates: Partial<GroceryItem>): Promise<void> {
    try {
      const { error } = await supabase
        .from('grocery_items')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating grocery item:', error);
      throw error;
    }
  }

  static async deleteGroceryItem(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('grocery_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting grocery item:', error);
      throw error;
    }
  }

  // Recipe Operations
  static async getRecipes(userId: string): Promise<Recipe[]> {
    try {
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
    } catch (error) {
      console.error('Error fetching recipes:', error);
      return [];
    }
  }

  static async createRecipe(recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>, ingredients: any[]): Promise<Recipe> {
    try {
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .insert({
          ...recipe,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
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
    } catch (error) {
      console.error('Error creating recipe:', error);
      throw error;
    }
  }

  static async updateRecipe(id: string, updates: Partial<Recipe>, ingredients?: any[]): Promise<void> {
    try {
      const { error: recipeError } = await supabase
        .from('recipes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
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
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw error;
    }
  }

  static async deleteRecipe(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw error;
    }
  }

  // User Preferences Operations
  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
  }

  static async upsertUserPreferences(preferences: Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'>): Promise<UserPreferences> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          ...preferences,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error upserting user preferences:', error);
      throw error;
    }
  }

  // Onboarding Progress Operations
  static async getOnboardingProgress(userId: string): Promise<OnboardingProgress | null> {
    try {
      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching onboarding progress:', error);
      return null;
    }
  }

  static async updateOnboardingProgress(userId: string, updates: Partial<OnboardingProgress>): Promise<OnboardingProgress> {
    try {
      const { data, error } = await supabase
        .from('onboarding_progress')
        .upsert({ 
          user_id: userId, 
          ...updates,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating onboarding progress:', error);
      throw error;
    }
  }

  // Conversation Operations
  static async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  static async createConversation(userId: string, title: string): Promise<Conversation> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          title,
          message_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  static async updateConversation(id: string, updates: Partial<Conversation>): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }
  }

  static async deleteConversation(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  // Message Operations
  static async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  static async createMessage(message: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          ...message,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  static async deleteMessage(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  // Meal Plan Operations
  static async getMealPlans(userId: string): Promise<MealPlan[]> {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          meal_plan_days (
            *,
            meal_plan_meals (*)
          )
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      return [];
    }
  }

  static async createMealPlan(mealPlan: any): Promise<any> {
    try {
      // This would be a complex operation involving multiple tables
      // Implementation would depend on the exact structure needed
      console.log('Creating meal plan:', mealPlan);
      // TODO: Implement full meal plan creation
      return mealPlan;
    } catch (error) {
      console.error('Error creating meal plan:', error);
      throw error;
    }
  }

  // Weekly Report Operations
  static async getWeeklyReports(userId: string): Promise<WeeklyReport[]> {
    try {
      const { data, error } = await supabase
        .from('weekly_reports')
        .select('*')
        .eq('user_id', userId)
        .order('week_start', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching weekly reports:', error);
      return [];
    }
  }

  static async createWeeklyReport(report: Omit<WeeklyReport, 'id' | 'created_at'>): Promise<WeeklyReport> {
    try {
      const { data, error } = await supabase
        .from('weekly_reports')
        .insert({
          ...report,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating weekly report:', error);
      throw error;
    }
  }
}