import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Plus, Calendar, Flame, Clock, Target, TrendingUp, Award, Play, Pause, ChevronLeft, ChevronRight, X, Save, Weight, CalendarDays } from 'lucide-react';
import { WeightTracker } from './WeightTracker';
import { WorkoutPlanningCalendar } from './WorkoutPlanningCalendar';
import { DatabaseService } from '../../services/database';
import { isSupabaseConfigured } from '../../lib/supabase';

interface Workout {
  id: string;
  user_id: string;
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

interface HabitTracker {
  id: string;
  name: string;
  icon: string;
  streak: number;
  target: number;
  completed: boolean;
  color: string;
  unit: string;
  currentValue: number;
}

interface ExerciseOption {
  name: string;
  type: 'cardio' | 'strength' | 'flexibility' | 'sports';
  defaultDuration: number;
  estimatedCalories: number;
  icon: string;
}

interface NewHabitForm {
  name: string;
  icon: string;
  target: number;
  unit: string;
  color: string;
}

const EXERCISE_OPTIONS: ExerciseOption[] = [
  // Cardio
  { name: 'Running', type: 'cardio', defaultDuration: 30, estimatedCalories: 300, icon: '🏃‍♂️' },
  { name: 'Walking', type: 'cardio', defaultDuration: 45, estimatedCalories: 150, icon: '🚶‍♂️' },
  { name: 'Cycling', type: 'cardio', defaultDuration: 45, estimatedCalories: 400, icon: '🚴‍♂️' },
  { name: 'Swimming', type: 'cardio', defaultDuration: 30, estimatedCalories: 350, icon: '🏊‍♂️' },
  { name: 'Jump Rope', type: 'cardio', defaultDuration: 15, estimatedCalories: 200, icon: '🪢' },
  { name: 'Dancing', type: 'cardio', defaultDuration: 30, estimatedCalories: 250, icon: '💃' },
  
  // Strength
  { name: 'Weight Training', type: 'strength', defaultDuration: 45, estimatedCalories: 250, icon: '🏋️‍♂️' },
  { name: 'Push-ups', type: 'strength', defaultDuration: 15, estimatedCalories: 100, icon: '💪' },
  { name: 'Pull-ups', type: 'strength', defaultDuration: 15, estimatedCalories: 120, icon: '🤸‍♂️' },
  { name: 'Squats', type: 'strength', defaultDuration: 20, estimatedCalories: 150, icon: '🦵' },
  { name: 'Deadlifts', type: 'strength', defaultDuration: 30, estimatedCalories: 200, icon: '🏋️' },
  { name: 'Bench Press', type: 'strength', defaultDuration: 30, estimatedCalories: 180, icon: '💺' },
  
  // Flexibility
  { name: 'Yoga', type: 'flexibility', defaultDuration: 60, estimatedCalories: 180, icon: '🧘‍♀️' },
  { name: 'Stretching', type: 'flexibility', defaultDuration: 20, estimatedCalories: 50, icon: '🤸' },
  { name: 'Pilates', type: 'flexibility', defaultDuration: 45, estimatedCalories: 200, icon: '🤸‍♀️' },
  
  // Sports
  { name: 'Basketball', type: 'sports', defaultDuration: 60, estimatedCalories: 450, icon: '🏀' },
  { name: 'Tennis', type: 'sports', defaultDuration: 60, estimatedCalories: 400, icon: '🎾' },
  { name: 'Soccer', type: 'sports', defaultDuration: 90, estimatedCalories: 500, icon: '⚽' },
  { name: 'Golf', type: 'sports', defaultDuration: 120, estimatedCalories: 300, icon: '⛳' },
];

const HABIT_ICONS = ['💧', '👟', '😴', '🧘', '📚', '🥗', '🏃', '💪', '🎯', '⭐', '🔥', '🌟', '💎', '🎨', '🎵', '📝'];
const HABIT_COLORS = ['blue', 'green', 'purple', 'pink', 'orange', 'red', 'yellow', 'indigo', 'teal', 'cyan'];
const HABIT_UNITS = ['glasses', 'steps', 'hours', 'minutes', 'times', 'pages', 'servings', 'miles', 'reps', 'sets'];

interface ExerciseTrackerProps {
  userId: string;
}

export const ExerciseTracker: React.FC<ExerciseTrackerProps> = ({ userId }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeWorkout, setActiveWorkout] = useState<string | null>(null);
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [view, setView] = useState<'today' | 'habits' | 'weight' | 'planning'>('today');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [habits, setHabits] = useState<HabitTracker[]>([]);

  const [newHabitForm, setNewHabitForm] = useState<NewHabitForm>({
    name: '',
    icon: '⭐',
    target: 1,
    unit: 'times',
    color: 'blue'
  });

  const weeklyStats = {
    totalWorkouts: 5,
    totalCalories: 1250,
    totalMinutes: 180,
    avgHeartRate: 145
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      if (isSupabaseConfigured()) {
        await loadFromDatabase();
      } else {
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      loadFromLocalStorage(); // Fallback to localStorage
    }
  };

  const loadFromDatabase = async () => {
    try {
      // Load workout sessions
      const workoutSessions = await DatabaseService.getWorkoutSessions(userId);
      setWorkouts(workoutSessions);

      // Load habits
      const userHabits = await DatabaseService.getHabits(userId);
      const habitsWithTracking = userHabits.map(habit => ({
        id: habit.id,
        name: habit.name,
        icon: habit.icon,
        streak: 0, // Calculate from habit entries
        target: habit.target,
        completed: false, // Calculate from today's entries
        color: habit.color,
        unit: habit.unit,
        currentValue: 0 // Calculate from today's entries
      }));
      setHabits(habitsWithTracking);
    } catch (error) {
      console.error('Database load error:', error);
      loadFromLocalStorage();
    }
  };

  const loadFromLocalStorage = () => {
    const savedWorkouts = localStorage.getItem(`workouts-${userId}`);
    const savedHabits = localStorage.getItem(`habits-${userId}`);

    if (savedWorkouts) {
      setWorkouts(JSON.parse(savedWorkouts));
    } else {
      // Mock data for demonstration
      const mockWorkouts: Workout[] = [
        {
          id: '1',
          user_id: userId,
          name: 'Morning Run',
          type: 'cardio',
          duration: 30,
          calories: 300,
          date: new Date().toISOString().split('T')[0],
          completed: true,
          distance: 3.2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          user_id: userId,
          name: 'Strength Training',
          type: 'strength',
          duration: 45,
          calories: 250,
          date: new Date().toISOString().split('T')[0],
          completed: false,
          sets: 3,
          reps: 12,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setWorkouts(mockWorkouts);
      localStorage.setItem(`workouts-${userId}`, JSON.stringify(mockWorkouts));
    }

    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    } else {
      // Mock habits
      const mockHabits: HabitTracker[] = [
        { id: '1', name: 'Water', icon: '💧', streak: 7, target: 8, completed: true, color: 'blue', unit: 'glasses', currentValue: 8 },
        { id: '2', name: 'Steps', icon: '👟', streak: 5, target: 10000, completed: false, color: 'green', unit: 'steps', currentValue: 7500 },
        { id: '3', name: 'Sleep', icon: '😴', streak: 3, target: 8, completed: true, color: 'purple', unit: 'hours', currentValue: 8 },
        { id: '4', name: 'Meditation', icon: '🧘', streak: 2, target: 10, completed: false, color: 'pink', unit: 'minutes', currentValue: 5 }
      ];
      setHabits(mockHabits);
      localStorage.setItem(`habits-${userId}`, JSON.stringify(mockHabits));
    }
  };

  const getWorkoutIcon = (type: string) => {
    switch (type) {
      case 'cardio': return '🏃';
      case 'strength': return '💪';
      case 'flexibility': return '🧘';
      case 'sports': return '⚽';
      default: return '🏃';
    }
  };

  const getWorkoutColor = (type: string) => {
    switch (type) {
      case 'cardio': return 'from-red-500 to-pink-500';
      case 'strength': return 'from-blue-500 to-indigo-500';
      case 'flexibility': return 'from-purple-500 to-pink-500';
      case 'sports': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const addWorkout = async (exercise: ExerciseOption, customData: any) => {
    setLoading(true);
    setError('');

    try {
      const newWorkout = {
        user_id: userId,
        name: exercise.name,
        type: exercise.type,
        duration: customData.duration || exercise.defaultDuration,
        calories: customData.calories || exercise.estimatedCalories,
        date: selectedDate.toISOString().split('T')[0],
        completed: false,
        ...customData
      };

      if (isSupabaseConfigured()) {
        const savedWorkout = await DatabaseService.createWorkoutSession(newWorkout);
        setWorkouts(prev => [savedWorkout, ...prev]);
      } else {
        const workoutWithId = {
          id: Date.now().toString(),
          ...newWorkout,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setWorkouts(prev => {
          const updated = [workoutWithId, ...prev];
          localStorage.setItem(`workouts-${userId}`, JSON.stringify(updated));
          return updated;
        });
      }

      setShowAddWorkout(false);
      setSuccess('Workout added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding workout:', error);
      setError('Failed to add workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addHabit = async () => {
    if (!newHabitForm.name.trim()) {
      setError('Please enter a habit name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newHabit = {
        user_id: userId,
        name: newHabitForm.name,
        icon: newHabitForm.icon,
        target: newHabitForm.target,
        unit: newHabitForm.unit,
        color: newHabitForm.color,
        active: true
      };

      if (isSupabaseConfigured()) {
        const savedHabit = await DatabaseService.createHabit(newHabit);
        const habitTracker: HabitTracker = {
          id: savedHabit.id,
          name: savedHabit.name,
          icon: savedHabit.icon,
          target: savedHabit.target,
          unit: savedHabit.unit,
          color: savedHabit.color,
          streak: 0,
          completed: false,
          currentValue: 0
        };
        setHabits(prev => [...prev, habitTracker]);
      } else {
        const habitTracker: HabitTracker = {
          id: Date.now().toString(),
          name: newHabitForm.name,
          icon: newHabitForm.icon,
          target: newHabitForm.target,
          unit: newHabitForm.unit,
          color: newHabitForm.color,
          streak: 0,
          completed: false,
          currentValue: 0
        };
        setHabits(prev => {
          const updated = [...prev, habitTracker];
          localStorage.setItem(`habits-${userId}`, JSON.stringify(updated));
          return updated;
        });
      }

      setNewHabitForm({
        name: '',
        icon: '⭐',
        target: 1,
        unit: 'times',
        color: 'blue'
      });
      setShowAddHabit(false);
      setSuccess('Habit added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding habit:', error);
      setError('Failed to add habit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkoutComplete = async (workoutId: string) => {
    try {
      const workout = workouts.find(w => w.id === workoutId);
      if (!workout) return;

      const updatedWorkout = { ...workout, completed: !workout.completed };

      if (isSupabaseConfigured()) {
        await DatabaseService.updateWorkoutSession(workoutId, { completed: updatedWorkout.completed });
      }

      setWorkouts(prev => {
        const updated = prev.map(w => w.id === workoutId ? updatedWorkout : w);
        localStorage.setItem(`workouts-${userId}`, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Error updating workout:', error);
      setError('Failed to update workout. Please try again.');
    }
  };

  const updateHabit = async (habitId: string, value: number) => {
    try {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      const completed = value >= habit.target;
      const newStreak = completed ? habit.streak + 1 : Math.max(0, habit.streak - 1);

      if (isSupabaseConfigured()) {
        // Update habit entry for today
        await DatabaseService.upsertHabitEntry({
          user_id: userId,
          habit_id: habitId,
          date: new Date().toISOString().split('T')[0],
          value,
          completed
        });
      }

      setHabits(prev => {
        const updated = prev.map(h => 
          h.id === habitId 
            ? { ...h, currentValue: value, completed, streak: newStreak }
            : h
        );
        localStorage.setItem(`habits-${userId}`, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Error updating habit:', error);
      setError('Failed to update habit. Please try again.');
    }
  };

  const deleteHabit = async (habitId: string) => {
    try {
      if (isSupabaseConfigured()) {
        await DatabaseService.deleteHabit(habitId);
      }

      setHabits(prev => {
        const updated = prev.filter(h => h.id !== habitId);
        localStorage.setItem(`habits-${userId}`, JSON.stringify(updated));
        return updated;
      });

      setSuccess('Habit deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting habit:', error);
      setError('Failed to delete habit. Please try again.');
    }
  };

  const AddWorkoutModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Add Workout</h3>
          <button
            onClick={() => setShowAddWorkout(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EXERCISE_OPTIONS.map((exercise) => (
            <button
              key={exercise.name}
              onClick={() => addWorkout(exercise, {})}
              disabled={loading}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left disabled:opacity-50"
            >
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{exercise.icon}</span>
                <div>
                  <h4 className="font-medium text-gray-800">{exercise.name}</h4>
                  <p className="text-sm text-gray-600 capitalize">{exercise.type}</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {exercise.defaultDuration} min • ~{exercise.estimatedCalories} cal
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const AddHabitModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Add New Habit</h3>
          <button
            onClick={() => setShowAddHabit(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Habit Name</label>
            <input
              type="text"
              value={newHabitForm.name}
              onChange={(e) => setNewHabitForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Read books, Drink water"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
            <div className="grid grid-cols-8 gap-2">
              {HABIT_ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setNewHabitForm(prev => ({ ...prev, icon }))}
                  className={`p-2 text-xl rounded-lg border-2 transition-all ${
                    newHabitForm.icon === icon
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={loading}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target</label>
              <input
                type="number"
                value={newHabitForm.target}
                onChange={(e) => setNewHabitForm(prev => ({ ...prev, target: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="1"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
              <select
                value={newHabitForm.unit}
                onChange={(e) => setNewHabitForm(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={loading}
              >
                {HABIT_UNITS.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="grid grid-cols-5 gap-2">
              {HABIT_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewHabitForm(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-full border-2 transition-all bg-${color}-500 ${
                    newHabitForm.color === color
                      ? 'border-gray-800 scale-110'
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  disabled={loading}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowAddHabit(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={addHabit}
            disabled={!newHabitForm.name.trim() || loading}
            className="flex items-center space-x-2 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Add Habit</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Success/Error Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4"
          >
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-xl shadow-2xl border border-green-400">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Save className="w-4 h-4" />
                </div>
                <span className="font-medium">{success}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Activity className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Exercise & Habits</h1>
                <p className="text-blue-100">Track workouts and build healthy habits</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">120</div>
              <div className="text-blue-100 text-sm">Calories burned today</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8">
        {[
          { id: 'today', label: 'Today', icon: Activity },
          { id: 'habits', label: 'Habits', icon: Target },
          { id: 'weight', label: 'Weight Log', icon: Weight },
          { id: 'planning', label: 'Workout Planning', icon: CalendarDays }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all ${
              view === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Weight Tracker View */}
      {view === 'weight' && <WeightTracker userId={userId} />}

      {/* Workout Planning View */}
      {view === 'planning' && <WorkoutPlanningCalendar userId={userId} />}

      {/* Today View */}
      {view === 'today' && (
        <div className="space-y-6">
          {/* Today's Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <Flame className="w-8 h-8 text-orange-500" />
                <span className="text-2xl">🔥</span>
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">120</div>
              <div className="text-sm text-gray-600">Calories burned</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <Activity className="w-8 h-8 text-blue-500" />
                <span className="text-2xl">👟</span>
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">5,500</div>
              <div className="text-sm text-gray-600">Steps • 1.6 mi</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <Clock className="w-8 h-8 text-green-500" />
                <span className="text-2xl">⏱️</span>
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">30</div>
              <div className="text-sm text-gray-600">Minutes active</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <Target className="w-8 h-8 text-emerald-500" />
                <span className="text-2xl">🎯</span>
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">7</div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Workouts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                  Today's Workouts
                </h3>
                <button
                  onClick={() => setShowAddWorkout(true)}
                  className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {workouts.filter(w => w.date === new Date().toISOString().split('T')[0]).map((workout) => (
                  <div
                    key={workout.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      workout.completed 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 bg-gradient-to-r ${getWorkoutColor(workout.type)} rounded-full flex items-center justify-center text-white text-xl`}>
                          {getWorkoutIcon(workout.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{workout.name}</h4>
                          <p className="text-sm text-gray-600">
                            {workout.duration} min • {workout.calories} cal
                            {workout.distance && ` • ${workout.distance} mi`}
                            {workout.sets && workout.reps && ` • ${workout.sets}x${workout.reps}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {workout.completed ? (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => toggleWorkoutComplete(workout.id)}
                            className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {workouts.filter(w => w.date === new Date().toISOString().split('T')[0]).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No workouts planned for today</p>
                    <button
                      onClick={() => setShowAddWorkout(true)}
                      className="mt-2 text-blue-500 hover:text-blue-600"
                    >
                      Add your first workout
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Habits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <Target className="w-5 h-5 mr-2 text-purple-500" />
                Daily Habits
              </h3>

              <div className="space-y-4">
                {habits.slice(0, 4).map((habit) => (
                  <div key={habit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{habit.icon}</div>
                      <div>
                        <h4 className="font-medium text-gray-800">{habit.name}</h4>
                        <p className="text-sm text-gray-600">
                          {habit.currentValue}/{habit.target} {habit.unit}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${
                        habit.completed ? `bg-${habit.color}-500` : 'bg-gray-300'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-600">
                        {habit.streak} day streak
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Habits View */}
      {view === 'habits' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Daily Habits Tracker</h3>
              <button 
                onClick={() => setShowAddHabit(true)}
                className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {habits.map((habit) => (
                <div key={habit.id} className="p-6 border border-gray-200 rounded-xl relative group">
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{habit.icon}</div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{habit.name}</h4>
                        <p className="text-sm text-gray-600">{habit.streak} day streak</p>
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      habit.completed ? `bg-${habit.color}-500` : 'bg-gray-300'
                    }`}>
                      {habit.completed && <span className="text-white text-sm">✓</span>}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>{habit.currentValue} {habit.unit}</span>
                      <span>{habit.target} {habit.unit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`bg-${habit.color}-500 h-2 rounded-full transition-all`}
                        style={{ width: `${Math.min((habit.currentValue / habit.target) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateHabit(habit.id, Math.max(0, habit.currentValue - 1))}
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={habit.currentValue}
                      onChange={(e) => updateHabit(habit.id, parseInt(e.target.value) || 0)}
                      className="flex-1 text-center py-2 border border-gray-200 rounded-lg"
                    />
                    <button
                      onClick={() => updateHabit(habit.id, habit.currentValue + 1)}
                      className={`w-8 h-8 bg-${habit.color}-500 text-white rounded-full flex items-center justify-center hover:bg-${habit.color}-600 transition-colors`}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {habits.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Habits Yet</h3>
                <p className="text-gray-600 mb-6">Start building healthy habits by adding your first one!</p>
                <button
                  onClick={() => setShowAddHabit(true)}
                  className="flex items-center space-x-2 bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Your First Habit</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weekly Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-emerald-500" />
          This Week's Progress
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{weeklyStats.totalWorkouts}</div>
            <div className="text-sm text-gray-600">Workouts</div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{weeklyStats.totalCalories}</div>
            <div className="text-sm text-gray-600">Calories</div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{weeklyStats.totalMinutes}</div>
            <div className="text-sm text-gray-600">Minutes</div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{weeklyStats.avgHeartRate}</div>
            <div className="text-sm text-gray-600">Avg BPM</div>
          </div>
        </div>
      </motion.div>

      {/* Add Workout Modal */}
      <AnimatePresence>
        {showAddWorkout && <AddWorkoutModal />}
      </AnimatePresence>

      {/* Add Habit Modal */}
      <AnimatePresence>
        {showAddHabit && <AddHabitModal />}
      </AnimatePresence>
    </div>
  );
};