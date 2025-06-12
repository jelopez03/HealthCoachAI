import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Target, Users, Utensils, AlertTriangle, Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { UserProfile } from '../../types';

const HEALTH_GOALS = [
  'Weight Loss',
  'Weight Gain',
  'Muscle Building',
  'Improved Energy',
  'Better Sleep',
  'Heart Health',
  'Diabetes Management',
  'Athletic Performance'
];

const DIETARY_RESTRICTIONS = [
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Keto',
  'Paleo',
  'Mediterranean',
  'Low Carb',
  'Gluten Free',
  'Dairy Free'
];

const COMMON_ALLERGIES = [
  'Nuts',
  'Shell fish',
  'Dairy',
  'Eggs',
  'Soy',
  'Gluten',
  'Fish',
  'Sesame'
];

export const ProfileSetup: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'other',
    height: '',
    weight: '',
    activity_level: 'moderate',
    health_goals: [] as string[],
    dietary_restrictions: [] as string[],
    allergies: [] as string[],
    current_habits: ''
  });

  const { updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const totalSteps = 5;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleArrayToggle = (array: string[], value: string, field: 'health_goals' | 'dietary_restrictions' | 'allergies') => {
    const newArray = array.includes(value)
      ? array.filter(item => item !== value)
      : [...array, value];
    
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const profileData: Partial<UserProfile> = {
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender as 'male' | 'female' | 'other',
        height: parseInt(formData.height),
        weight: parseInt(formData.weight),
        activity_level: formData.activity_level as UserProfile['activity_level'],
        health_goals: formData.health_goals,
        dietary_restrictions: formData.dietary_restrictions,
        allergies: formData.allergies,
        current_habits: formData.current_habits
      };

      await updateProfile(profileData);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Users className="w-12 h-12 text-sky-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-800">Tell us about yourself</h2>
              <p className="text-gray-600">Basic information to personalize your experience</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Age"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height (inches)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="67"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight (lbs)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="154"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Activity className="w-12 h-12 text-sky-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-800">Activity Level</h2>
              <p className="text-gray-600">How active are you on a typical day?</p>
            </div>

            <div className="space-y-3">
              {[
                { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
                { value: 'light', label: 'Light', desc: 'Exercise 1-3 times per week' },
                { value: 'moderate', label: 'Moderate', desc: 'Exercise 4-5 times per week' },
                { value: 'active', label: 'Active', desc: 'Daily exercise or intense exercise 3-4 times per week' },
                { value: 'very_active', label: 'Very Active', desc: 'Intense exercise 6-7 times per week' }
              ].map((option) => (
                <label
                  key={option.value}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.activity_level === option.value
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="activity_level"
                    value={option.value}
                    checked={formData.activity_level === option.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, activity_level: e.target.value }))}
                    className="sr-only"
                  />
                  <div className="font-medium text-gray-800">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.desc}</div>
                </label>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Target className="w-12 h-12 text-sky-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-800">Health Goals</h2>
              <p className="text-gray-600">What would you like to achieve? (Select all that apply)</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {HEALTH_GOALS.map((goal) => (
                <button
                  key={goal}
                  onClick={() => handleArrayToggle(formData.health_goals, goal, 'health_goals')}
                  className={`p-4 text-left border-2 rounded-lg transition-all ${
                    formData.health_goals.includes(goal)
                      ? 'border-sky-500 bg-sky-50 text-sky-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Utensils className="w-12 h-12 text-sky-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-800">Dietary Preferences</h2>
              <p className="text-gray-600">Any specific dietary restrictions or preferences?</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-3">Dietary Restrictions</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {DIETARY_RESTRICTIONS.map((restriction) => (
                  <button
                    key={restriction}
                    onClick={() => handleArrayToggle(formData.dietary_restrictions, restriction, 'dietary_restrictions')}
                    className={`p-3 text-left border-2 rounded-lg transition-all ${
                      formData.dietary_restrictions.includes(restriction)
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {restriction}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
                Allergies
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {COMMON_ALLERGIES.map((allergy) => (
                  <button
                    key={allergy}
                    onClick={() => handleArrayToggle(formData.allergies, allergy, 'allergies')}
                    className={`p-3 text-left border-2 rounded-lg transition-all ${
                      formData.allergies.includes(allergy)
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {allergy}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Target className="w-12 h-12 text-sky-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-800">Current Habits</h2>
              <p className="text-gray-600">Tell us about your current eating and lifestyle habits</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your current habits, challenges, or anything else you'd like us to know
              </label>
              <textarea
                value={formData.current_habits}
                onChange={(e) => setFormData(prev => ({ ...prev, current_habits: e.target.value }))}
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="e.g., I often skip breakfast, eat out frequently, have trouble sleeping, exercise 3 times a week..."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step {step} of {totalSteps}</span>
            <span className="text-sm font-medium text-gray-600">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-sky-500 to-emerald-500 h-2 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Form Content */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={step}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="flex items-center px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </button>

            {step < totalSteps ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                className="flex items-center px-6 py-2 bg-gradient-to-r from-sky-500 to-emerald-500 text-white rounded-lg hover:from-sky-600 hover:to-emerald-600 transition-all"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-sky-500 to-emerald-500 text-white rounded-lg hover:from-sky-600 hover:to-emerald-600 transition-all disabled:opacity-50"
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};