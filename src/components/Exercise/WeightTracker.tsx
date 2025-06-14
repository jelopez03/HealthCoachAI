import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Weight, Plus, Calendar, TrendingUp, TrendingDown, Target, Edit3, Trash2, Save, X, Calculator, Bell, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface WeightEntry {
  id: string;
  user_id: string;
  weight: number;
  unit: 'kg' | 'lbs';
  date: string;
  notes?: string;
  created_at: string;
}

interface WeightGoal {
  target: number;
  unit: 'kg' | 'lbs';
  deadline?: string;
}

interface WeightStats {
  current: number;
  previous: number;
  weeklyChange: number;
  monthlyChange: number;
  bmi: number;
  bmiCategory: string;
}

interface WeightTrackerProps {
  userId: string;
}

export const WeightTracker: React.FC<WeightTrackerProps> = ({ userId }) => {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showBMIModal, setShowBMIModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WeightEntry | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'1M' | '3M' | '6M' | '1Y'>('3M');
  const [unit, setUnit] = useState<'kg' | 'lbs'>('lbs');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [newEntry, setNewEntry] = useState({
    weight: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [goal, setGoal] = useState<WeightGoal>({
    target: 0,
    unit: 'lbs',
    deadline: ''
  });

  const [goalForm, setGoalForm] = useState({
    target: '',
    deadline: ''
  });

  const [userHeight, setUserHeight] = useState({ feet: 5, inches: 8 }); // Default height for BMI

  // Load data from database or localStorage on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (isSupabaseConfigured()) {
        // Load from database
        await loadFromDatabase();
      } else {
        // Load from localStorage
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      loadFromLocalStorage(); // Fallback to localStorage
    }
  };

  const loadFromDatabase = async () => {
    try {
      // Load weight entries
      const { data: entriesData, error: entriesError } = await supabase
        .from('progress_data')
        .select('*')
        .eq('user_id', userId)
        .not('weight', 'is', null)
        .order('date', { ascending: false });

      if (entriesError) throw entriesError;

      if (entriesData) {
        const weightEntries: WeightEntry[] = entriesData.map(entry => ({
          id: entry.id,
          user_id: entry.user_id,
          weight: entry.weight,
          unit: 'lbs', // Default unit, could be stored in user preferences
          date: entry.date,
          notes: entry.notes || '',
          created_at: entry.created_at
        }));
        setEntries(weightEntries);
      }

      // Load user preferences for height and goal
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('height_feet, height_inches')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileData) {
        setUserHeight({
          feet: profileData.height_feet || 5,
          inches: profileData.height_inches || 8
        });
      }
    } catch (error) {
      console.error('Database load error:', error);
      loadFromLocalStorage();
    }
  };

  const loadFromLocalStorage = () => {
    const savedEntries = localStorage.getItem('weight-entries');
    const savedGoal = localStorage.getItem('weight-goal');
    const savedUnit = localStorage.getItem('weight-unit');
    const savedHeight = localStorage.getItem('user-height');

    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    } else {
      // Add some mock data for demonstration
      const mockEntries: WeightEntry[] = [
        { id: '1', user_id: userId, weight: 165, unit: 'lbs', date: '2024-03-01', created_at: '2024-03-01T10:00:00Z' },
        { id: '2', user_id: userId, weight: 163, unit: 'lbs', date: '2024-03-08', created_at: '2024-03-08T10:00:00Z' },
        { id: '3', user_id: userId, weight: 161, unit: 'lbs', date: '2024-03-15', created_at: '2024-03-15T10:00:00Z' },
        { id: '4', user_id: userId, weight: 159, unit: 'lbs', date: '2024-03-22', created_at: '2024-03-22T10:00:00Z' },
        { id: '5', user_id: userId, weight: 157, unit: 'lbs', date: '2024-03-29', created_at: '2024-03-29T10:00:00Z' }
      ];
      setEntries(mockEntries);
      localStorage.setItem('weight-entries', JSON.stringify(mockEntries));
    }

    if (savedGoal) {
      setGoal(JSON.parse(savedGoal));
    }

    if (savedUnit) {
      setUnit(savedUnit as 'kg' | 'lbs');
    }

    if (savedHeight) {
      setUserHeight(JSON.parse(savedHeight));
    }
  };

  // Save to database and localStorage
  const saveToDatabase = async (entry: Omit<WeightEntry, 'id' | 'created_at'>) => {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from('progress_data')
        .upsert({
          user_id: entry.user_id,
          date: entry.date,
          weight: entry.weight,
          notes: entry.notes
        }, { onConflict: 'user_id,date' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Database save error:', error);
      throw error;
    }
  };

  const convertWeight = (weight: number, fromUnit: 'kg' | 'lbs', toUnit: 'kg' | 'lbs'): number => {
    if (fromUnit === toUnit) return weight;
    if (fromUnit === 'kg' && toUnit === 'lbs') return weight * 2.20462;
    if (fromUnit === 'lbs' && toUnit === 'kg') return weight / 2.20462;
    return weight;
  };

  const calculateBMI = (weight: number, heightFeet: number, heightInches: number): number => {
    const totalInches = heightFeet * 12 + heightInches;
    const weightInKg = unit === 'lbs' ? weight / 2.20462 : weight;
    const heightInM = totalInches * 0.0254;
    return weightInKg / (heightInM * heightInM);
  };

  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const getStats = (): WeightStats => {
    if (entries.length === 0) {
      return {
        current: 0,
        previous: 0,
        weeklyChange: 0,
        monthlyChange: 0,
        bmi: 0,
        bmiCategory: 'Normal'
      };
    }

    const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const current = convertWeight(sortedEntries[0].weight, sortedEntries[0].unit, unit);
    const previous = sortedEntries.length > 1 ? convertWeight(sortedEntries[1].weight, sortedEntries[1].unit, unit) : current;
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const weeklyEntry = sortedEntries.find(entry => new Date(entry.date) <= oneWeekAgo);
    const monthlyEntry = sortedEntries.find(entry => new Date(entry.date) <= oneMonthAgo);

    const weeklyChange = weeklyEntry ? current - convertWeight(weeklyEntry.weight, weeklyEntry.unit, unit) : 0;
    const monthlyChange = monthlyEntry ? current - convertWeight(monthlyEntry.weight, monthlyEntry.unit, unit) : 0;

    const bmi = calculateBMI(current, userHeight.feet, userHeight.inches);
    const bmiCategory = getBMICategory(bmi);

    return {
      current,
      previous,
      weeklyChange,
      monthlyChange,
      bmi,
      bmiCategory
    };
  };

  const validateWeightInput = (weight: string): boolean => {
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      setError('Please enter a valid weight greater than 0');
      return false;
    }
    if (unit === 'lbs' && (weightNum < 50 || weightNum > 1000)) {
      setError('Weight must be between 50 and 1000 lbs');
      return false;
    }
    if (unit === 'kg' && (weightNum < 20 || weightNum > 500)) {
      setError('Weight must be between 20 and 500 kg');
      return false;
    }
    return true;
  };

  const addEntry = async () => {
    if (!newEntry.weight || !newEntry.date) {
      setError('Please fill in all required fields');
      return;
    }

    if (!validateWeightInput(newEntry.weight)) return;

    setLoading(true);
    setError('');

    try {
      const entryData = {
        user_id: userId,
        weight: parseFloat(newEntry.weight),
        unit,
        date: newEntry.date,
        notes: newEntry.notes
      };

      // Save to database if configured
      if (isSupabaseConfigured()) {
        await saveToDatabase(entryData);
      }

      // Create entry for local state
      const entry: WeightEntry = {
        id: Date.now().toString(),
        ...entryData,
        created_at: new Date().toISOString()
      };

      setEntries(prev => {
        const updated = [...prev, entry].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        localStorage.setItem('weight-entries', JSON.stringify(updated));
        return updated;
      });

      setNewEntry({ weight: '', date: new Date().toISOString().split('T')[0], notes: '' });
      setShowAddModal(false);
      setSuccess('Weight entry saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving entry:', error);
      setError('Failed to save weight entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateEntry = async () => {
    if (!editingEntry || !newEntry.weight || !newEntry.date) {
      setError('Please fill in all required fields');
      return;
    }

    if (!validateWeightInput(newEntry.weight)) return;

    setLoading(true);
    setError('');

    try {
      const updatedEntry: WeightEntry = {
        ...editingEntry,
        weight: parseFloat(newEntry.weight),
        date: newEntry.date,
        notes: newEntry.notes
      };

      // Update in database if configured
      if (isSupabaseConfigured()) {
        await saveToDatabase({
          user_id: updatedEntry.user_id,
          weight: updatedEntry.weight,
          unit: updatedEntry.unit,
          date: updatedEntry.date,
          notes: updatedEntry.notes
        });
      }

      setEntries(prev => {
        const updated = prev.map(entry => entry.id === editingEntry.id ? updatedEntry : entry);
        localStorage.setItem('weight-entries', JSON.stringify(updated));
        return updated;
      });

      setEditingEntry(null);
      setNewEntry({ weight: '', date: new Date().toISOString().split('T')[0], notes: '' });
      setSuccess('Weight entry updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating entry:', error);
      setError('Failed to update weight entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => {
      const updated = prev.filter(entry => entry.id !== id);
      localStorage.setItem('weight-entries', JSON.stringify(updated));
      return updated;
    });
    setSuccess('Weight entry deleted successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const saveGoal = () => {
    if (!goalForm.target) {
      setError('Please enter a target weight');
      return;
    }

    const targetWeight = parseFloat(goalForm.target);
    if (isNaN(targetWeight) || targetWeight <= 0) {
      setError('Please enter a valid target weight');
      return;
    }

    const newGoal: WeightGoal = {
      target: targetWeight,
      unit,
      deadline: goalForm.deadline
    };

    setGoal(newGoal);
    localStorage.setItem('weight-goal', JSON.stringify(newGoal));
    setGoalForm({ target: '', deadline: '' });
    setShowGoalModal(false);
    setSuccess('Weight goal set successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const stats = getStats();

  const WeightChart = () => {
    const filteredEntries = entries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        const now = new Date();
        const monthsBack = selectedPeriod === '1M' ? 1 : selectedPeriod === '3M' ? 3 : selectedPeriod === '6M' ? 6 : 12;
        const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, now.getDate());
        return entryDate >= cutoffDate;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (filteredEntries.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Weight className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No weight data for this period</p>
          </div>
        </div>
      );
    }

    const weights = filteredEntries.map(entry => convertWeight(entry.weight, entry.unit, unit));
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const range = maxWeight - minWeight || 1;

    return (
      <div className="h-64 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
        <div className="relative h-full">
          <svg className="w-full h-full">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map(percent => (
              <line
                key={percent}
                x1="0"
                y1={`${percent}%`}
                x2="100%"
                y2={`${percent}%`}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            ))}
            
            {/* Weight line */}
            <polyline
              fill="none"
              stroke="url(#weightGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={filteredEntries.map((entry, index) => {
                const x = (index / (filteredEntries.length - 1)) * 100;
                const weight = convertWeight(entry.weight, entry.unit, unit);
                const y = 100 - ((weight - minWeight) / range) * 100;
                return `${x},${y}`;
              }).join(' ')}
            />
            
            {/* Data points */}
            {filteredEntries.map((entry, index) => {
              const x = (index / (filteredEntries.length - 1)) * 100;
              const weight = convertWeight(entry.weight, entry.unit, unit);
              const y = 100 - ((weight - minWeight) / range) * 100;
              return (
                <circle
                  key={entry.id}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="4"
                  fill="#3b82f6"
                  stroke="white"
                  strokeWidth="2"
                  className="hover:r-6 transition-all cursor-pointer"
                />
              );
            })}
            
            <defs>
              <linearGradient id="weightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-600 -ml-12">
            <span>{maxWeight.toFixed(1)}</span>
            <span>{((maxWeight + minWeight) / 2).toFixed(1)}</span>
            <span>{minWeight.toFixed(1)}</span>
          </div>
        </div>
      </div>
    );
  };

  const AddEditModal = () => (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl p-6 max-w-md w-full"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              {editingEntry ? 'Edit Weight Entry' : 'Add Weight Entry'}
            </h3>
            <button
              onClick={() => {
                setShowAddModal(false);
                setEditingEntry(null);
                setNewEntry({ weight: '', date: new Date().toISOString().split('T')[0], notes: '' });
                setError('');
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 flex items-center"
            >
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight *</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  step="0.1"
                  value={newEntry.weight}
                  onChange={(e) => {
                    setNewEntry(prev => ({ ...prev, weight: e.target.value }));
                    setError('');
                  }}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter weight"
                  disabled={loading}
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as 'kg' | 'lbs')}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={loading}
                >
                  <option value="lbs">lbs</option>
                  <option value="kg">kg</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                value={newEntry.date}
                onChange={(e) => {
                  setNewEntry(prev => ({ ...prev, date: e.target.value }));
                  setError('');
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
              <textarea
                value={newEntry.notes}
                onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Add any notes about this weigh-in..."
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setShowAddModal(false);
                setEditingEntry(null);
                setNewEntry({ weight: '', date: new Date().toISOString().split('T')[0], notes: '' });
                setError('');
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={editingEntry ? updateEntry : addEntry}
              disabled={!newEntry.weight || !newEntry.date || loading}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{editingEntry ? 'Update' : 'Save'}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  const GoalModal = () => (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl p-6 max-w-md w-full"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <Target className="w-5 h-5 mr-2 text-orange-500" />
              Set Weight Goal
            </h3>
            <button
              onClick={() => {
                setShowGoalModal(false);
                setGoalForm({ target: '', deadline: '' });
                setError('');
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 flex items-center"
            >
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Weight *</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  step="0.1"
                  value={goalForm.target}
                  onChange={(e) => {
                    setGoalForm(prev => ({ ...prev, target: e.target.value }));
                    setError('');
                  }}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Enter target weight"
                />
                <span className="flex items-center px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-600">
                  {unit}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Date (optional)</label>
              <input
                type="date"
                value={goalForm.deadline}
                onChange={(e) => setGoalForm(prev => ({ ...prev, deadline: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {stats.current > 0 && goalForm.target && (
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="text-sm text-orange-800">
                  <strong>Goal Summary:</strong>
                  <br />
                  Current: {stats.current.toFixed(1)} {unit}
                  <br />
                  Target: {parseFloat(goalForm.target).toFixed(1)} {unit}
                  <br />
                  Difference: {Math.abs(stats.current - parseFloat(goalForm.target)).toFixed(1)} {unit} to {stats.current > parseFloat(goalForm.target) ? 'lose' : 'gain'}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setShowGoalModal(false);
                setGoalForm({ target: '', deadline: '' });
                setError('');
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveGoal}
              disabled={!goalForm.target}
              className="flex items-center space-x-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Target className="w-4 h-4" />
              <span>Set Goal</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  const BMIModal = () => (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl p-6 max-w-md w-full"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-blue-500" />
              BMI Calculator
            </h3>
            <button
              onClick={() => setShowBMIModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats.bmi.toFixed(1)}
              </div>
              <div className={`text-lg font-medium ${
                stats.bmiCategory === 'Normal' ? 'text-green-600' :
                stats.bmiCategory === 'Underweight' ? 'text-blue-600' :
                stats.bmiCategory === 'Overweight' ? 'text-orange-600' : 'text-red-600'
              }`}>
                {stats.bmiCategory}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-blue-600">Underweight</span>
                <span className="text-green-600">Normal</span>
                <span className="text-orange-600">Overweight</span>
                <span className="text-red-600">Obese</span>
              </div>
              <div className="relative h-4 bg-gradient-to-r from-blue-400 via-green-400 via-orange-400 to-red-400 rounded-full">
                <div
                  className="absolute w-3 h-3 bg-white border-2 border-gray-800 rounded-full top-0.5 transform -translate-x-1/2"
                  style={{ left: `${Math.min(Math.max((stats.bmi / 40) * 100, 2), 98)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>40</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Height Settings</h4>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={userHeight.feet}
                  onChange={(e) => {
                    const newHeight = { ...userHeight, feet: parseInt(e.target.value) || 0 };
                    setUserHeight(newHeight);
                    localStorage.setItem('user-height', JSON.stringify(newHeight));
                  }}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="5"
                  min="3"
                  max="8"
                />
                <span className="flex items-center text-gray-600">ft</span>
                <input
                  type="number"
                  value={userHeight.inches}
                  onChange={(e) => {
                    const newHeight = { ...userHeight, inches: parseInt(e.target.value) || 0 };
                    setUserHeight(newHeight);
                    localStorage.setItem('user-height', JSON.stringify(newHeight));
                  }}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="8"
                  min="0"
                  max="11"
                />
                <span className="flex items-center text-gray-600">in</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className="space-y-6">
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
                <CheckCircle className="w-6 h-6" />
                <span className="font-medium">{success}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Responsive Green Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-full mx-auto"
      >
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                <Weight className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold truncate">Weight Tracker</h2>
                <p className="text-emerald-100 text-sm sm:text-base">Monitor your weight journey</p>
              </div>
            </div>
            <div className="text-left sm:text-right flex-shrink-0">
              <div className="text-2xl sm:text-3xl font-bold">{stats.current.toFixed(1)}</div>
              <div className="text-emerald-100 text-sm sm:text-base">{unit}</div>
              {stats.weeklyChange !== 0 && (
                <div className={`flex items-center mt-1 sm:mt-2 ${stats.weeklyChange > 0 ? 'text-red-200' : 'text-green-200'} ${window.innerWidth < 640 ? 'justify-start' : 'justify-end'}`}>
                  {stats.weeklyChange > 0 ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> : <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />}
                  <span className="text-xs sm:text-sm">{Math.abs(stats.weeklyChange).toFixed(1)} {unit} this week</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-3">
            <TrendingDown className="w-8 h-8 text-green-500" />
            <span className={`text-sm font-medium ${stats.weeklyChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.weeklyChange > 0 ? '+' : ''}{stats.weeklyChange.toFixed(1)} {unit}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-1">{Math.abs(stats.weeklyChange).toFixed(1)}</div>
          <div className="text-sm text-gray-600">Weekly Change</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-3">
            <Calendar className="w-8 h-8 text-blue-500" />
            <span className={`text-sm font-medium ${stats.monthlyChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.monthlyChange > 0 ? '+' : ''}{stats.monthlyChange.toFixed(1)} {unit}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-1">{Math.abs(stats.monthlyChange).toFixed(1)}</div>
          <div className="text-sm text-gray-600">Monthly Change</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setShowBMIModal(true)}
        >
          <div className="flex items-center justify-between mb-3">
            <Calculator className="w-8 h-8 text-purple-500" />
            <span className={`text-sm font-medium ${
              stats.bmiCategory === 'Normal' ? 'text-green-600' :
              stats.bmiCategory === 'Underweight' ? 'text-blue-600' :
              stats.bmiCategory === 'Overweight' ? 'text-orange-600' : 'text-red-600'
            }`}>
              {stats.bmiCategory}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-1">{stats.bmi.toFixed(1)}</div>
          <div className="text-sm text-gray-600">BMI</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-3">
            <Target className="w-8 h-8 text-orange-500" />
            {goal.target > 0 && (
              <span className="text-sm font-medium text-orange-600">
                {Math.abs(stats.current - goal.target).toFixed(1)} {unit} to go
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-1">
            {goal.target > 0 ? goal.target.toFixed(1) : '--'}
          </div>
          <div className="text-sm text-gray-600">Goal Weight</div>
        </motion.div>
      </div>

      {/* Chart and Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Weight Progress</h3>
          <div className="flex items-center space-x-2">
            {['1M', '3M', '6M', '1Y'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period as any)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <WeightChart />
      </motion.div>

      {/* Actions and History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions - Export Data Button Removed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Log Weight</span>
            </button>
            
            <button
              onClick={() => setShowGoalModal(true)}
              className="w-full flex items-center justify-center space-x-2 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Target className="w-5 h-5" />
              <span>Set Goal</span>
            </button>
          </div>
        </motion.div>

        {/* Recent Entries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Entries</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {entries.slice(0, 10).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="font-semibold text-gray-800">
                      {convertWeight(entry.weight, entry.unit, unit).toFixed(1)} {unit}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(entry.date).toLocaleDateString()}
                    </div>
                  </div>
                  {entry.notes && (
                    <div className="text-sm text-gray-500 mt-1">{entry.notes}</div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingEntry(entry);
                      setNewEntry({
                        weight: entry.weight.toString(),
                        date: entry.date,
                        notes: entry.notes || ''
                      });
                    }}
                    className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {entries.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Weight className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No weight entries yet</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-2 text-blue-500 hover:text-blue-600"
                >
                  Add your first entry
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      {(showAddModal || editingEntry) && <AddEditModal />}
      {showGoalModal && <GoalModal />}
      {showBMIModal && <BMIModal />}
    </div>
  );
};