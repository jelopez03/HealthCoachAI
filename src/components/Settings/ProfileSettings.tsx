import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Save, Mail, Calendar, Ruler, Weight, Activity, Target, Utensils, AlertTriangle } from 'lucide-react';
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
  'Shellfish',
  'Dairy',
  'Eggs',
  'Soy',
  'Gluten',
  'Fish',
  'Sesame'
];

// Mock profile data for demo
const mockProfile: UserProfile = {
  id: 'demo-profile-id',
  user_id: 'demo-user-id',
  name: 'Demo User',
  age: 30,
  gender: 'other',
  height: 175,
  weight: 70,
  activity_level: 'moderate',
  health_goals: ['Weight Loss', 'Improved Energy'],
  dietary_restrictions: ['Vegetarian'],
  allergies: [],
  current_habits: 'I try to eat healthy but struggle with consistency.',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const mockUser = {
  email: 'demo@healthcoach.ai'
};

interface ProfileSettingsProps {
  onProfileComplete?: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onProfileComplete }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: mockProfile.name,
    age: mockProfile.age.toString(),
    gender: mockProfile.gender,
    height: mockProfile.height.toString(),
    weight: mockProfile.weight.toString(),
    activity_level: mockProfile.activity_level,
    health_goals: mockProfile.health_goals,
    dietary_restrictions: mockProfile.dietary_restrictions,
    allergies: mockProfile.allergies,
    current_habits: mockProfile.current_habits
  });

  const handleArrayToggle = (array: string[], value: string, field: 'health_goals' | 'dietary_restrictions' | 'allergies') => {
    const newArray = array.includes(value)
      ? array.filter(item => item !== value)
      : [...array, value];
    
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const isProfileComplete = () => {
    return formData.name.trim() !== '' &&
           formData.age !== '' &&
           formData.height !== '' &&
           formData.weight !== '' &&
           formData.health_goals.length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      
      // Mark profile as complete if all required fields are filled
      if (isProfileComplete() && onProfileComplete) {
        onProfileComplete();
      }
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-emerald-500 px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
              <p className="text-sky-100">Manage your personal information and preferences</p>
            </div>
          </div>
        </div>

        {/* Profile Completion Notice */}
        {!isProfileComplete() && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 m-6 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-amber-400 mr-2" />
              <p className="text-amber-700 font-medium">
                Please complete all required fields to get personalized recommendations.
              </p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border-l-4 border-green-400 p-4 m-6 rounded-lg"
          >
            <div className="flex items-center">
              <Save className="w-5 h-5 text-green-400 mr-2" />
              <p className="text-green-700 font-medium">
                Profile updated successfully! {isProfileComplete() && 'Your profile is now complete.'}
              </p>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-sky-500" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={mockUser.email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Age"
                    min="13"
                    max="120"
                    required
                  />
                </div>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height (inches) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="67"
                    min="36"
                    max="96"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (lbs) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="154"
                    min="50"
                    max="500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-sky-500" />
              Activity Level
            </h2>
            
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

          {/* Health Goals */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Target className="w-5 h-5 mr-2 text-sky-500" />
              Health Goals <span className="text-red-500 text-sm">*</span>
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {HEALTH_GOALS.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => handleArrayToggle(formData.health_goals, goal, 'health_goals')}
                  className={`p-3 text-left border-2 rounded-lg transition-all ${
                    formData.health_goals.includes(goal)
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
            {formData.health_goals.length === 0 && (
              <p className="text-sm text-red-500 mt-2">Please select at least one health goal.</p>
            )}
          </div>

          {/* Dietary Preferences */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Utensils className="w-5 h-5 mr-2 text-sky-500" />
              Dietary Preferences
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-800 mb-3">Dietary Restrictions</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {DIETARY_RESTRICTIONS.map((restriction) => (
                    <button
                      key={restriction}
                      type="button"
                      onClick={() => handleArrayToggle(formData.dietary_restrictions, restriction, 'dietary_restrictions')}
                      className={`p-3 text-left border-2 rounded-lg transition-all ${
                        formData.dietary_restrictions.includes(restriction)
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
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
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  Allergies
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {COMMON_ALLERGIES.map((allergy) => (
                    <button
                      key={allergy}
                      type="button"
                      onClick={() => handleArrayToggle(formData.allergies, allergy, 'allergies')}
                      className={`p-3 text-left border-2 rounded-lg transition-all ${
                        formData.allergies.includes(allergy)
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {allergy}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Current Habits */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Current Habits & Notes</h2>
            <textarea
              value={formData.current_habits}
              onChange={(e) => setFormData(prev => ({ ...prev, current_habits: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="Tell us about your current eating habits, challenges, lifestyle, or anything else you'd like your AI coach to know..."
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`flex items-center px-8 py-3 rounded-lg font-medium transition-all disabled:opacity-50 ${
                isProfileComplete()
                  ? 'bg-gradient-to-r from-sky-500 to-emerald-500 text-white hover:from-sky-600 hover:to-emerald-600'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  {isProfileComplete() ? 'Save Changes' : 'Complete Profile'}
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};