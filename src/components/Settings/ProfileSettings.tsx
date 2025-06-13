import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Save, Mail, Calendar, Ruler, Weight, Activity, Target, Utensils, AlertTriangle, Check, X, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
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
  'Shellfish',
  'Dairy',
  'Eggs',
  'Soy',
  'Gluten',
  'Fish',
  'Sesame'
];

interface ProfileSettingsProps {
  onProfileComplete?: (profile: UserProfile) => void;
  onProfileUpdate?: (profile: UserProfile) => void;
  existingProfile?: UserProfile | null;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ 
  onProfileComplete, 
  onProfileUpdate,
  existingProfile 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [heightError, setHeightError] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    email: 'user@healthcoach.ai', // Default email for open access
    age: '',
    gender: 'other',
    height_feet: '',
    height_inches: '',
    weight: '',
    activity_level: 'moderate',
    health_goals: [] as string[],
    dietary_restrictions: [] as string[],
    allergies: [] as string[],
    current_habits: ''
  });

  // Load existing profile data when component mounts
  useEffect(() => {
    if (existingProfile && initialLoad) {
      setFormData({
        name: existingProfile.name || '',
        email: existingProfile.email || 'user@healthcoach.ai',
        age: existingProfile.age ? existingProfile.age.toString() : '',
        gender: existingProfile.gender || 'other',
        height_feet: existingProfile.height_feet ? existingProfile.height_feet.toString() : '',
        height_inches: existingProfile.height_inches ? existingProfile.height_inches.toString() : '',
        weight: existingProfile.weight ? existingProfile.weight.toString() : '',
        activity_level: existingProfile.activity_level || 'moderate',
        health_goals: existingProfile.health_goals || [],
        dietary_restrictions: existingProfile.dietary_restrictions || [],
        allergies: existingProfile.allergies || [],
        current_habits: existingProfile.current_habits || ''
      });
      setInitialLoad(false);
    }
  }, [existingProfile, initialLoad]);

  // Load existing profile from database on component mount
  useEffect(() => {
    const loadExistingProfile = async () => {
      if (!isSupabaseConfigured() || !user) {
        // If no authenticated user, try to load from localStorage
        const savedProfile = localStorage.getItem('healthcoach-profile');
        if (savedProfile) {
          try {
            const profile = JSON.parse(savedProfile);
            setFormData({
              name: profile.name || '',
              email: profile.email || 'user@healthcoach.ai',
              age: profile.age ? profile.age.toString() : '',
              gender: profile.gender || 'other',
              height_feet: profile.height_feet ? profile.height_feet.toString() : '',
              height_inches: profile.height_inches ? profile.height_inches.toString() : '',
              weight: profile.weight ? profile.weight.toString() : '',
              activity_level: profile.activity_level || 'moderate',
              health_goals: profile.health_goals || [],
              dietary_restrictions: profile.dietary_restrictions || [],
              allergies: profile.allergies || [],
              current_habits: profile.current_habits || ''
            });
          } catch (err) {
            console.log('Error loading profile from localStorage:', err);
          }
        }
        return;
      }
      
      try {
        // Load profile for authenticated user
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data && !error) {
          setFormData({
            name: data.name || '',
            email: data.email || user.email || 'user@healthcoach.ai',
            age: data.age ? data.age.toString() : '',
            gender: data.gender || 'other',
            height_feet: data.height_feet ? data.height_feet.toString() : '',
            height_inches: data.height_inches ? data.height_inches.toString() : '',
            weight: data.weight ? data.weight.toString() : '',
            activity_level: data.activity_level || 'moderate',
            health_goals: data.health_goals || [],
            dietary_restrictions: data.dietary_restrictions || [],
            allergies: data.allergies || [],
            current_habits: data.current_habits || ''
          });
        }
      } catch (err) {
        console.log('No existing profile found, starting fresh');
      }
    };

    if (initialLoad && !existingProfile) {
      loadExistingProfile();
      setInitialLoad(false);
    }
  }, [initialLoad, existingProfile, user]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validateHeight = (): boolean => {
    const feet = parseInt(formData.height_feet);
    const inches = parseInt(formData.height_inches);
    
    if (isNaN(feet) || isNaN(inches)) {
      setHeightError('Please enter valid numbers for height');
      return false;
    }
    if (feet < 3 || feet > 8) {
      setHeightError('Height must be between 3 and 8 feet');
      return false;
    }
    if (inches < 0 || inches >= 12) {
      setHeightError('Inches must be between 0 and 11');
      return false;
    }
    if (feet === 3 && inches < 6) {
      setHeightError('Minimum height is 3 feet 6 inches');
      return false;
    }
    if (feet === 8 && inches > 0) {
      setHeightError('Maximum height is 8 feet');
      return false;
    }
    setHeightError('');
    return true;
  };

  const handleArrayToggle = (array: string[], value: string, field: 'health_goals' | 'dietary_restrictions' | 'allergies') => {
    const newArray = array.includes(value)
      ? array.filter(item => item !== value)
      : [...array, value];
    
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const isProfileComplete = () => {
    return formData.name.trim() !== '' &&
           formData.email.trim() !== '' &&
           formData.age !== '' &&
           formData.height_feet !== '' &&
           formData.height_inches !== '' &&
           formData.weight !== '' &&
           formData.health_goals.length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    // Validate email and height
    const isEmailValid = validateEmail(formData.email);
    const isHeightValid = validateHeight();

    if (!isEmailValid || !isHeightValid) {
      setLoading(false);
      return;
    }

    try {
      // Create profile object
      const profileData = {
        email: formData.email.trim().toLowerCase(),
        name: formData.name.trim(),
        age: parseInt(formData.age) || 0,
        gender: formData.gender as 'male' | 'female' | 'other',
        height_feet: parseInt(formData.height_feet) || 0,
        height_inches: parseInt(formData.height_inches) || 0,
        // Calculate total height in inches for backward compatibility
        height: ((parseInt(formData.height_feet) || 0) * 12) + (parseInt(formData.height_inches) || 0),
        weight: parseInt(formData.weight) || 0,
        activity_level: formData.activity_level as UserProfile['activity_level'],
        health_goals: formData.health_goals,
        dietary_restrictions: formData.dietary_restrictions,
        allergies: formData.allergies,
        current_habits: formData.current_habits.trim(),
        updated_at: new Date().toISOString()
      };

      // Only attempt database operations if we have an authenticated user
      if (isSupabaseConfigured() && user) {
        try {
          // Check if profile already exists for this user
          const { data: existingData, error: findError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          let result;
          if (existingData && !findError) {
            // Update existing profile
            result = await supabase
              .from('user_profiles')
              .update(profileData)
              .eq('user_id', user.id)
              .select()
              .single();
          } else {
            // Insert new profile with authenticated user's ID
            result = await supabase
              .from('user_profiles')
              .insert({
                ...profileData,
                user_id: user.id, // Use authenticated user's ID
                subscription_status: 'premium',
                interviews_remaining: 999,
                created_at: new Date().toISOString()
              })
              .select()
              .single();
          }

          if (result.error) {
            throw result.error;
          }

          console.log('Profile saved to database:', result.data);
        } catch (dbError) {
          console.error('Database error:', dbError);
          setError(`Database error: ${dbError.message || 'Failed to save profile'}`);
          setLoading(false);
          return;
        }
      }

      // Always save to localStorage as backup
      const fullProfileData: UserProfile = {
        id: existingProfile?.id || 'profile-' + Date.now(),
        user_id: user?.id || 'open-access-user',
        ...profileData,
        created_at: existingProfile?.created_at || new Date().toISOString()
      };

      localStorage.setItem('healthcoach-profile', JSON.stringify(fullProfileData));
      
      setSuccess(true);
      
      // Check if profile is complete and call appropriate callback
      if (isProfileComplete()) {
        if (onProfileComplete) {
          onProfileComplete(fullProfileData);
        }
      }
      
      if (onProfileUpdate) {
        onProfileUpdate(fullProfileData);
      }
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(`Failed to save profile: ${error.message || 'Unknown error'}`);
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
              <p className="text-sky-100">
                {existingProfile ? 'Update your personal information and preferences' : 'Complete your profile to get started'}
              </p>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        <div className="p-6 space-y-4">
          {/* Profile Completion Notice */}
          {!isProfileComplete() && (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg">
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
              className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg"
            >
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                <div>
                  <p className="text-green-700 font-medium">
                    Profile saved successfully! 
                    {isProfileComplete() && ' Your profile is now complete.'}
                  </p>
                  {isSupabaseConfigured() && user && (
                    <p className="text-green-600 text-sm mt-1">
                      ✓ Saved to database and local storage
                    </p>
                  )}
                  {(!isSupabaseConfigured() || !user) && (
                    <p className="text-green-600 text-sm mt-1">
                      ✓ Saved to local storage {!user && '(no authenticated user)'}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg"
            >
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <div>
                  <p className="text-red-700 font-medium">Error saving profile</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Database Status */}
          <div className={`p-4 rounded-lg border ${
            isSupabaseConfigured() && user
              ? 'bg-blue-50 border-blue-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                isSupabaseConfigured() && user ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
              <p className={`text-sm font-medium ${
                isSupabaseConfigured() && user ? 'text-blue-800' : 'text-gray-700'
              }`}>
                Database: {
                  isSupabaseConfigured() && user
                    ? 'Connected (Authenticated User)' 
                    : !user 
                      ? 'Local storage only (no authenticated user)'
                      : 'Not configured (using local storage)'
                }
              </p>
            </div>
          </div>
        </div>

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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, email: e.target.value }));
                      if (emailError) validateEmail(e.target.value);
                    }}
                    onBlur={(e) => validateEmail(e.target.value)}
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                      emailError ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Enter your email address"
                    required
                  />
                  {emailError ? (
                    <X className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                  ) : formData.email && !emailError ? (
                    <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                  ) : null}
                </div>
                {emailError && (
                  <p className="text-red-500 text-sm mt-1">{emailError}</p>
                )}
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
                  Height <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-3">
                  <div className="relative flex-1">
                    <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={formData.height_feet}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, height_feet: e.target.value }));
                        if (heightError) validateHeight();
                      }}
                      onBlur={validateHeight}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                        heightError ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="5"
                      min="3"
                      max="8"
                      required
                    />
                  </div>
                  <span className="text-gray-600 font-medium">feet</span>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={formData.height_inches}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, height_inches: e.target.value }));
                        if (heightError) validateHeight();
                      }}
                      onBlur={validateHeight}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                        heightError ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="8"
                      min="0"
                      max="11"
                      required
                    />
                  </div>
                  <span className="text-gray-600 font-medium">inches</span>
                </div>
                {heightError && (
                  <p className="text-red-500 text-sm mt-1">{heightError}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Example: 5 feet 8 inches (5' 8")
                </p>
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

          {/* Section Divider */}
          <hr className="border-t-2 border-gray-100 my-8" />

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

          {/* Section Divider */}
          <hr className="border-t-2 border-gray-100 my-8" />

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

          {/* Section Divider */}
          <hr className="border-t-2 border-gray-100 my-8" />

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

          {/* Section Divider */}
          <hr className="border-t-2 border-gray-100 my-8" />

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
              disabled={loading || !!emailError || !!heightError}
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