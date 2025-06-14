import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Clock, 
  Target, 
  Flame, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  X, 
  Bell,
  Filter,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Zap,
  Repeat
} from 'lucide-react';

interface PlannedWorkout {
  id: string;
  userId: string;
  date: string;
  title: string;
  type: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'mixed';
  exercises: Exercise[];
  estimatedDuration: number;
  targetIntensity: 'low' | 'moderate' | 'high' | 'very_high';
  notes: string;
  reminderSet: boolean;
  completed: boolean;
  actualDuration?: number;
  actualIntensity?: 'low' | 'moderate' | 'high' | 'very_high';
  completedAt?: string;
  created_at: string;
  updated_at: string;
}

interface Exercise {
  id: string;
  name: string;
  category: 'cardio' | 'strength' | 'flexibility' | 'sports';
  sets?: number;
  reps?: number;
  duration?: number; // in minutes
  weight?: number; // in lbs
  distance?: number; // in miles
  restTime?: number; // in seconds
  notes?: string;
}

interface WorkoutTemplate {
  id: string;
  name: string;
  type: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'mixed';
  exercises: Exercise[];
  estimatedDuration: number;
  targetIntensity: 'low' | 'moderate' | 'high' | 'very_high';
}

interface WorkoutPlanningCalendarProps {
  userId: string;
}

const WORKOUT_TYPES = [
  { value: 'cardio', label: 'Cardio', color: 'red', icon: '🏃' },
  { value: 'strength', label: 'Strength', color: 'blue', icon: '💪' },
  { value: 'flexibility', label: 'Flexibility', color: 'purple', icon: '🧘' },
  { value: 'sports', label: 'Sports', color: 'green', icon: '⚽' },
  { value: 'mixed', label: 'Mixed', color: 'orange', icon: '🔥' }
];

const INTENSITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'green', description: 'Light activity, easy pace' },
  { value: 'moderate', label: 'Moderate', color: 'yellow', description: 'Moderate effort, can hold conversation' },
  { value: 'high', label: 'High', color: 'orange', description: 'Hard effort, challenging pace' },
  { value: 'very_high', label: 'Very High', color: 'red', description: 'Maximum effort, all-out intensity' }
];

const EXERCISE_TEMPLATES = [
  // Cardio
  { name: 'Running', category: 'cardio', duration: 30, distance: 3 },
  { name: 'Cycling', category: 'cardio', duration: 45, distance: 10 },
  { name: 'Swimming', category: 'cardio', duration: 30, distance: 1 },
  { name: 'Jump Rope', category: 'cardio', duration: 15 },
  { name: 'Rowing', category: 'cardio', duration: 20, distance: 2 },
  
  // Strength
  { name: 'Push-ups', category: 'strength', sets: 3, reps: 15 },
  { name: 'Squats', category: 'strength', sets: 3, reps: 20 },
  { name: 'Deadlifts', category: 'strength', sets: 3, reps: 8, weight: 135 },
  { name: 'Bench Press', category: 'strength', sets: 3, reps: 10, weight: 115 },
  { name: 'Pull-ups', category: 'strength', sets: 3, reps: 8 },
  { name: 'Planks', category: 'strength', sets: 3, duration: 1 },
  
  // Flexibility
  { name: 'Yoga Flow', category: 'flexibility', duration: 30 },
  { name: 'Static Stretching', category: 'flexibility', duration: 15 },
  { name: 'Dynamic Warm-up', category: 'flexibility', duration: 10 },
  
  // Sports
  { name: 'Basketball', category: 'sports', duration: 60 },
  { name: 'Tennis', category: 'sports', duration: 60 },
  { name: 'Soccer', category: 'sports', duration: 90 }
];

const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: '1',
    name: 'Full Body Strength',
    type: 'strength',
    estimatedDuration: 60,
    targetIntensity: 'high',
    exercises: [
      { id: '1', name: 'Squats', category: 'strength', sets: 3, reps: 12, weight: 135, restTime: 90 },
      { id: '2', name: 'Bench Press', category: 'strength', sets: 3, reps: 10, weight: 115, restTime: 90 },
      { id: '3', name: 'Deadlifts', category: 'strength', sets: 3, reps: 8, weight: 155, restTime: 120 },
      { id: '4', name: 'Pull-ups', category: 'strength', sets: 3, reps: 8, restTime: 90 },
      { id: '5', name: 'Planks', category: 'strength', sets: 3, duration: 1, restTime: 60 }
    ]
  },
  {
    id: '2',
    name: 'Cardio HIIT',
    type: 'cardio',
    estimatedDuration: 30,
    targetIntensity: 'very_high',
    exercises: [
      { id: '1', name: 'Jump Rope', category: 'cardio', duration: 2, restTime: 30 },
      { id: '2', name: 'Burpees', category: 'cardio', sets: 4, reps: 10, restTime: 45 },
      { id: '3', name: 'Mountain Climbers', category: 'cardio', duration: 1, restTime: 30 },
      { id: '4', name: 'High Knees', category: 'cardio', duration: 1, restTime: 30 }
    ]
  },
  {
    id: '3',
    name: 'Yoga & Flexibility',
    type: 'flexibility',
    estimatedDuration: 45,
    targetIntensity: 'low',
    exercises: [
      { id: '1', name: 'Sun Salutations', category: 'flexibility', sets: 5, duration: 2 },
      { id: '2', name: 'Warrior Poses', category: 'flexibility', duration: 5 },
      { id: '3', name: 'Pigeon Pose', category: 'flexibility', duration: 3 },
      { id: '4', name: 'Savasana', category: 'flexibility', duration: 10 }
    ]
  }
];

export const WorkoutPlanningCalendar: React.FC<WorkoutPlanningCalendarProps> = ({ userId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [plannedWorkouts, setPlannedWorkouts] = useState<PlannedWorkout[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<PlannedWorkout | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [view, setView] = useState<'month' | 'week'>('month');
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [workoutForm, setWorkoutForm] = useState({
    title: '',
    type: 'strength' as PlannedWorkout['type'],
    exercises: [] as Exercise[],
    estimatedDuration: 60,
    targetIntensity: 'moderate' as PlannedWorkout['targetIntensity'],
    notes: '',
    reminderSet: false
  });

  const [exerciseForm, setExerciseForm] = useState({
    name: '',
    category: 'strength' as Exercise['category'],
    sets: 3,
    reps: 10,
    duration: 30,
    weight: 0,
    distance: 0,
    restTime: 60,
    notes: ''
  });

  // Load data on mount
  useEffect(() => {
    loadPlannedWorkouts();
  }, []);

  const loadPlannedWorkouts = () => {
    // Load from localStorage for demo
    const saved = localStorage.getItem(`planned-workouts-${userId}`);
    if (saved) {
      setPlannedWorkouts(JSON.parse(saved));
    } else {
      // Add some demo data
      const demoWorkouts: PlannedWorkout[] = [
        {
          id: '1',
          userId,
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
          title: 'Morning Strength Training',
          type: 'strength',
          exercises: WORKOUT_TEMPLATES[0].exercises,
          estimatedDuration: 60,
          targetIntensity: 'high',
          notes: 'Focus on proper form',
          reminderSet: true,
          completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          userId,
          date: new Date(Date.now() + 172800000).toISOString().split('T')[0], // Day after tomorrow
          title: 'HIIT Cardio Session',
          type: 'cardio',
          exercises: WORKOUT_TEMPLATES[1].exercises,
          estimatedDuration: 30,
          targetIntensity: 'very_high',
          notes: 'High intensity intervals',
          reminderSet: true,
          completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setPlannedWorkouts(demoWorkouts);
      localStorage.setItem(`planned-workouts-${userId}`, JSON.stringify(demoWorkouts));
    }
  };

  const savePlannedWorkouts = (workouts: PlannedWorkout[]) => {
    localStorage.setItem(`planned-workouts-${userId}`, JSON.stringify(workouts));
    setPlannedWorkouts(workouts);
  };

  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      // Only include current and future dates
      if (date >= today) {
        days.push(date);
      } else {
        days.push(null); // Past dates as null
      }
    }
    
    return days;
  };

  const getWorkoutsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return plannedWorkouts.filter(workout => workout.date === dateStr);
  };

  const addExercise = () => {
    if (!exerciseForm.name) {
      setError('Exercise name is required');
      return;
    }

    const exercise: Exercise = {
      id: Date.now().toString(),
      name: exerciseForm.name,
      category: exerciseForm.category,
      ...(exerciseForm.category === 'strength' && {
        sets: exerciseForm.sets,
        reps: exerciseForm.reps,
        weight: exerciseForm.weight || undefined,
        restTime: exerciseForm.restTime
      }),
      ...(exerciseForm.category === 'cardio' && {
        duration: exerciseForm.duration,
        distance: exerciseForm.distance || undefined
      }),
      ...(exerciseForm.category === 'flexibility' && {
        duration: exerciseForm.duration
      }),
      ...(exerciseForm.category === 'sports' && {
        duration: exerciseForm.duration
      }),
      notes: exerciseForm.notes || undefined
    };

    setWorkoutForm(prev => ({
      ...prev,
      exercises: [...prev.exercises, exercise]
    }));

    // Reset form
    setExerciseForm({
      name: '',
      category: 'strength',
      sets: 3,
      reps: 10,
      duration: 30,
      weight: 0,
      distance: 0,
      restTime: 60,
      notes: ''
    });
    setError('');
  };

  const removeExercise = (exerciseId: string) => {
    setWorkoutForm(prev => ({
      ...prev,
      exercises: prev.exercises.filter(ex => ex.id !== exerciseId)
    }));
  };

  const addFromTemplate = (exerciseName: string) => {
    const template = EXERCISE_TEMPLATES.find(ex => ex.name === exerciseName);
    if (template) {
      setExerciseForm({
        name: template.name,
        category: template.category,
        sets: template.sets || 3,
        reps: template.reps || 10,
        duration: template.duration || 30,
        weight: template.weight || 0,
        distance: template.distance || 0,
        restTime: 60,
        notes: ''
      });
    }
  };

  const saveWorkout = () => {
    if (!selectedDate || !workoutForm.title || workoutForm.exercises.length === 0) {
      setError('Please fill in all required fields and add at least one exercise');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const workout: PlannedWorkout = {
        id: editingWorkout?.id || Date.now().toString(),
        userId,
        date: selectedDate.toISOString().split('T')[0],
        title: workoutForm.title,
        type: workoutForm.type,
        exercises: workoutForm.exercises,
        estimatedDuration: workoutForm.estimatedDuration,
        targetIntensity: workoutForm.targetIntensity,
        notes: workoutForm.notes,
        reminderSet: workoutForm.reminderSet,
        completed: editingWorkout?.completed || false,
        created_at: editingWorkout?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (editingWorkout) {
        // Update existing workout
        const updated = plannedWorkouts.map(w => w.id === editingWorkout.id ? workout : w);
        savePlannedWorkouts(updated);
        setSuccess('Workout updated successfully!');
      } else {
        // Add new workout
        savePlannedWorkouts([...plannedWorkouts, workout]);
        setSuccess('Workout scheduled successfully!');
      }

      resetForm();
      setShowAddModal(false);
      setShowEditModal(false);
    } catch (error) {
      setError('Failed to save workout');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const deleteWorkout = (workoutId: string) => {
    const updated = plannedWorkouts.filter(w => w.id !== workoutId);
    savePlannedWorkouts(updated);
    setSuccess('Workout deleted successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const copyWorkout = (workout: PlannedWorkout, targetDate: Date) => {
    const copied: PlannedWorkout = {
      ...workout,
      id: Date.now().toString(),
      date: targetDate.toISOString().split('T')[0],
      completed: false,
      actualDuration: undefined,
      actualIntensity: undefined,
      completedAt: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    savePlannedWorkouts([...plannedWorkouts, copied]);
    setSuccess('Workout copied successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const markCompleted = (workoutId: string, completed: boolean) => {
    const updated = plannedWorkouts.map(w => 
      w.id === workoutId 
        ? { 
            ...w, 
            completed,
            completedAt: completed ? new Date().toISOString() : undefined,
            updated_at: new Date().toISOString()
          }
        : w
    );
    savePlannedWorkouts(updated);
  };

  const applyTemplate = (template: WorkoutTemplate) => {
    setWorkoutForm({
      title: template.name,
      type: template.type,
      exercises: template.exercises.map(ex => ({ ...ex, id: Date.now().toString() + Math.random() })),
      estimatedDuration: template.estimatedDuration,
      targetIntensity: template.targetIntensity,
      notes: '',
      reminderSet: false
    });
    setShowTemplateModal(false);
  };

  const resetForm = () => {
    setWorkoutForm({
      title: '',
      type: 'strength',
      exercises: [],
      estimatedDuration: 60,
      targetIntensity: 'moderate',
      notes: '',
      reminderSet: false
    });
    setExerciseForm({
      name: '',
      category: 'strength',
      sets: 3,
      reps: 10,
      duration: 30,
      weight: 0,
      distance: 0,
      restTime: 60,
      notes: ''
    });
    setEditingWorkout(null);
    setError('');
  };

  const getWorkoutTypeColor = (type: string) => {
    const typeConfig = WORKOUT_TYPES.find(t => t.value === type);
    return typeConfig?.color || 'gray';
  };

  const getIntensityColor = (intensity: string) => {
    const intensityConfig = INTENSITY_LEVELS.find(i => i.value === intensity);
    return intensityConfig?.color || 'gray';
  };

  const filteredWorkouts = plannedWorkouts.filter(workout => 
    filterType === 'all' || workout.type === filterType
  );

  const WorkoutModal = ({ isEdit = false }) => (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">
                {isEdit ? 'Edit Workout' : 'Schedule New Workout'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {selectedDate && (
              <p className="text-gray-600 mt-2">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            )}
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Workout Title *</label>
                <input
                  type="text"
                  value={workoutForm.title}
                  onChange={(e) => setWorkoutForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Morning Strength Training"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Workout Type</label>
                <select
                  value={workoutForm.type}
                  onChange={(e) => setWorkoutForm(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {WORKOUT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Duration (minutes)</label>
                <input
                  type="number"
                  value={workoutForm.estimatedDuration}
                  onChange={(e) => setWorkoutForm(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="5"
                  max="300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Intensity</label>
                <select
                  value={workoutForm.targetIntensity}
                  onChange={(e) => setWorkoutForm(prev => ({ ...prev, targetIntensity: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {INTENSITY_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label} - {level.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Template Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">Quick Start Templates</label>
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="text-blue-500 hover:text-blue-600 text-sm"
                >
                  View All Templates
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {WORKOUT_TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="font-medium text-gray-800">{template.name}</div>
                    <div className="text-sm text-gray-600">{template.estimatedDuration} min • {template.exercises.length} exercises</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise Builder */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Exercises</h4>
              
              {/* Add Exercise Form */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={exerciseForm.name}
                      onChange={(e) => setExerciseForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Exercise name"
                    />
                  </div>
                  <select
                    value={exerciseForm.category}
                    onChange={(e) => setExerciseForm(prev => ({ ...prev, category: e.target.value as any }))}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="strength">Strength</option>
                    <option value="cardio">Cardio</option>
                    <option value="flexibility">Flexibility</option>
                    <option value="sports">Sports</option>
                  </select>
                  <button
                    onClick={addExercise}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Add
                  </button>
                </div>

                {/* Exercise-specific fields */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {exerciseForm.category === 'strength' && (
                    <>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Sets</label>
                        <input
                          type="number"
                          value={exerciseForm.sets}
                          onChange={(e) => setExerciseForm(prev => ({ ...prev, sets: parseInt(e.target.value) || 0 }))}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Reps</label>
                        <input
                          type="number"
                          value={exerciseForm.reps}
                          onChange={(e) => setExerciseForm(prev => ({ ...prev, reps: parseInt(e.target.value) || 0 }))}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Weight (lbs)</label>
                        <input
                          type="number"
                          value={exerciseForm.weight}
                          onChange={(e) => setExerciseForm(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Rest (sec)</label>
                        <input
                          type="number"
                          value={exerciseForm.restTime}
                          onChange={(e) => setExerciseForm(prev => ({ ...prev, restTime: parseInt(e.target.value) || 0 }))}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                          min="0"
                        />
                      </div>
                    </>
                  )}

                  {exerciseForm.category === 'cardio' && (
                    <>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Duration (min)</label>
                        <input
                          type="number"
                          value={exerciseForm.duration}
                          onChange={(e) => setExerciseForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Distance (mi)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={exerciseForm.distance}
                          onChange={(e) => setExerciseForm(prev => ({ ...prev, distance: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                          min="0"
                        />
                      </div>
                    </>
                  )}

                  {(exerciseForm.category === 'flexibility' || exerciseForm.category === 'sports') && (
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Duration (min)</label>
                      <input
                        type="number"
                        value={exerciseForm.duration}
                        onChange={(e) => setExerciseForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                        min="1"
                      />
                    </div>
                  )}
                </div>

                {/* Quick Add Templates */}
                <div className="mt-3">
                  <label className="block text-xs text-gray-600 mb-2">Quick Add:</label>
                  <div className="flex flex-wrap gap-2">
                    {EXERCISE_TEMPLATES
                      .filter(ex => ex.category === exerciseForm.category)
                      .slice(0, 6)
                      .map(template => (
                        <button
                          key={template.name}
                          onClick={() => addFromTemplate(template.name)}
                          className="px-2 py-1 bg-white border border-gray-200 rounded text-xs hover:bg-gray-50"
                        >
                          {template.name}
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              {/* Exercise List */}
              <div className="space-y-2">
                {workoutForm.exercises.map((exercise, index) => (
                  <div key={exercise.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <div>
                          <h5 className="font-medium text-gray-800">{exercise.name}</h5>
                          <div className="text-sm text-gray-600">
                            {exercise.sets && exercise.reps && (
                              <span>{exercise.sets} sets × {exercise.reps} reps</span>
                            )}
                            {exercise.weight && <span> @ {exercise.weight} lbs</span>}
                            {exercise.duration && <span>{exercise.duration} min</span>}
                            {exercise.distance && <span> • {exercise.distance} mi</span>}
                            {exercise.restTime && <span> • {exercise.restTime}s rest</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeExercise(exercise.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {workoutForm.exercises.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No exercises added yet</p>
                    <p className="text-sm">Add exercises using the form above</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes and Settings */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes & Reminders</label>
                <textarea
                  value={workoutForm.notes}
                  onChange={(e) => setWorkoutForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add any notes, reminders, or special instructions..."
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="reminder"
                  checked={workoutForm.reminderSet}
                  onChange={(e) => setWorkoutForm(prev => ({ ...prev, reminderSet: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="reminder" className="text-sm text-gray-700 flex items-center">
                  <Bell className="w-4 h-4 mr-1" />
                  Set reminder notification
                </label>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
            <button
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                resetForm();
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveWorkout}
              disabled={loading || !workoutForm.title || workoutForm.exercises.length === 0}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEdit ? 'Update' : 'Schedule'} Workout</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4"
          >
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-xl shadow-2xl">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6" />
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
        className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Workout Planning Calendar</h1>
              <p className="text-blue-100">Schedule and track your future workouts</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{plannedWorkouts.filter(w => !w.completed).length}</div>
            <div className="text-blue-100 text-sm">Upcoming workouts</div>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Week
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {WORKOUT_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedDate(new Date());
            setShowAddModal(true);
          }}
          className="flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Schedule Workout</span>
        </button>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {getCalendarDays().map((date, index) => {
            if (!date) {
              return <div key={index} className="h-24 bg-gray-50 rounded-lg opacity-50"></div>;
            }

            const dayWorkouts = getWorkoutsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = selectedDate?.toDateString() === date.toDateString();

            return (
              <div
                key={index}
                onClick={() => setSelectedDate(date)}
                className={`h-24 p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  isToday ? 'bg-blue-50 border-blue-300' : 
                  isSelected ? 'bg-blue-100 border-blue-400' : 
                  'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-medium ${
                    isToday ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {date.getDate()}
                  </span>
                  {dayWorkouts.length > 0 && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
                
                <div className="space-y-1">
                  {dayWorkouts.slice(0, 2).map(workout => (
                    <div
                      key={workout.id}
                      className={`text-xs px-1 py-0.5 rounded truncate ${
                        workout.completed 
                          ? 'bg-green-100 text-green-700' 
                          : `bg-${getWorkoutTypeColor(workout.type)}-100 text-${getWorkoutTypeColor(workout.type)}-700`
                      }`}
                    >
                      {workout.title}
                    </div>
                  ))}
                  {dayWorkouts.length > 2 && (
                    <div className="text-xs text-gray-500">+{dayWorkouts.length - 2} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Workouts */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Workouts for {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Workout</span>
            </button>
          </div>

          <div className="space-y-3">
            {getWorkoutsForDate(selectedDate).map(workout => (
              <div
                key={workout.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  workout.completed 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-3 h-3 rounded-full bg-${getWorkoutTypeColor(workout.type)}-500`}></div>
                      <h4 className="font-semibold text-gray-800">{workout.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getIntensityColor(workout.targetIntensity)}-100 text-${getIntensityColor(workout.targetIntensity)}-700`}>
                        {workout.targetIntensity}
                      </span>
                      {workout.reminderSet && (
                        <Bell className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{workout.estimatedDuration} min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="w-4 h-4" />
                        <span>{workout.exercises.length} exercises</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Zap className="w-4 h-4" />
                        <span className="capitalize">{workout.type}</span>
                      </div>
                    </div>

                    {workout.notes && (
                      <p className="text-sm text-gray-600 mb-2">{workout.notes}</p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {workout.exercises.slice(0, 3).map(exercise => (
                        <span
                          key={exercise.id}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {exercise.name}
                        </span>
                      ))}
                      {workout.exercises.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{workout.exercises.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => markCompleted(workout.id, !workout.completed)}
                      className={`p-2 rounded-lg transition-colors ${
                        workout.completed
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => {
                        setEditingWorkout(workout);
                        setWorkoutForm({
                          title: workout.title,
                          type: workout.type,
                          exercises: workout.exercises,
                          estimatedDuration: workout.estimatedDuration,
                          targetIntensity: workout.targetIntensity,
                          notes: workout.notes,
                          reminderSet: workout.reminderSet
                        });
                        setShowEditModal(true);
                      }}
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <div className="relative group">
                      <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <button
                          onClick={() => {
                            const tomorrow = new Date(selectedDate);
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            copyWorkout(workout, tomorrow);
                          }}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                        >
                          <Copy className="w-4 h-4" />
                          <span>Copy to Tomorrow</span>
                        </button>
                        <button
                          onClick={() => {
                            const nextWeek = new Date(selectedDate);
                            nextWeek.setDate(nextWeek.getDate() + 7);
                            copyWorkout(workout, nextWeek);
                          }}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                        >
                          <Repeat className="w-4 h-4" />
                          <span>Copy to Next Week</span>
                        </button>
                        <button
                          onClick={() => deleteWorkout(workout.id)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {getWorkoutsForDate(selectedDate).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No workouts scheduled for this date</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-2 text-blue-500 hover:text-blue-600"
                >
                  Schedule your first workout
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Upcoming Workouts Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Workouts</h3>
        <div className="space-y-3">
          {filteredWorkouts
            .filter(w => !w.completed && new Date(w.date) >= new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5)
            .map(workout => (
              <div key={workout.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full bg-${getWorkoutTypeColor(workout.type)}-500`}></div>
                  <div>
                    <h4 className="font-medium text-gray-800">{workout.title}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(workout.date).toLocaleDateString()} • {workout.estimatedDuration} min • {workout.exercises.length} exercises
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {workout.reminderSet && (
                    <Bell className="w-4 h-4 text-blue-500" />
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getIntensityColor(workout.targetIntensity)}-100 text-${getIntensityColor(workout.targetIntensity)}-700`}>
                    {workout.targetIntensity}
                  </span>
                </div>
              </div>
            ))}
          
          {filteredWorkouts.filter(w => !w.completed && new Date(w.date) >= new Date()).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No upcoming workouts scheduled</p>
              <button
                onClick={() => {
                  setSelectedDate(new Date());
                  setShowAddModal(true);
                }}
                className="mt-2 text-blue-500 hover:text-blue-600"
              >
                Schedule your first workout
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Modals */}
      {showAddModal && <WorkoutModal />}
      {showEditModal && <WorkoutModal isEdit={true} />}
    </div>
  );
};