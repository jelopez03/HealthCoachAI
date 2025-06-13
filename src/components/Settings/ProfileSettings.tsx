import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Save, Mail, Calendar, Ruler, Weight, Activity, Target, Utensils, AlertTriangle, Check, X, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [heightError, setHeightError] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
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
      if (!isSupabaseConfigured()) return;
      
      try {
        // Try to find existing profile by email
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('email', 'user@healthcoach.ai')
          .maybeSingle();

        if (data && !error) {
          setFormData({
            name: data.name || '',
            email: data.email || 'user@healthcoach.ai',
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
  }, [initialLoad, existingProfile]);

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

      if (isSupabaseConfigured()) {
        // Save to database using upsert based on email
        try {
          // Generate a UUID for user_id (since we're not using auth)
          const userId = crypto.randomUUID();
          
          // First, try to find existing profile by email
          const { data: existingData, error: findError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('email', formData.email.trim().toLowerCase())
            .maybeSingle();

          let result;
          if (existingData && !findError) {
            // Update existing profile
            result = await supabase
              .from('user_profiles')
              .update(profileData)
              .eq('email', formData.email.trim().toLowerCase())
              .select()
              .single();
          } else {
            // Insert new profile
            result = await supabase
              .from('user_profiles')
              .insert({
                ...profileData,
                user_id: userId, // Use generated UUID
                subscription_status: 'premium', // Give premium access for testing
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

      // Also save to localStorage as backup
      const fullProfileData: UserProfile = {
        id: existingProfile?.id || 'profile-' + Date.now(),
        user_id: 'open-access-user',
        ...profileData,
        created_at: existingProfile?.created_at || new Date().toISOString()
      };

      localStorage.setItem('healthcoach-profile', JSON.stringify(fullProfileData));
      
      setSuccess(true);
      setShowSuccessMessage(true);
      
      // Call callbacks but DON'T redirect - stay on the profile page
      if (isProfileComplete() && onProfileComplete) {
        onProfileComplete(fullProfileData);
      }
      
      if (onProfileUpdate) {
        onProfileUpdate(fullProfileData);
      }
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
        setShowSuccessMessage(false);
      }, 5000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(`Failed to save profile: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Success Message Banner */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4"
          >
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-xl shadow-2xl border border-emerald-400">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Profile Updated Successfully!</p>
                  <p className="text-emerald-100 text-sm">Your health journey is now personalized</p>
                </div>
                <button
                  onClick={() => setShowSuccessMessage(false)}
                  className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
      >
        {/* Enhanced Header */}
        <div className="bg-gradient-to-br from-sky-500 via-blue-500 to-emerald-500 px-8 py-8 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
          </div>
          
          <div className="relative flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Profile Settings</h1>
              <p className="text-sky-100 text-lg">
                {existingProfile ? 'Update your personal information and preferences' : 'Complete your profile to get started'}
              </p>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        <div className="p-6 space-y-4">
          {/* Profile Completion Notice */}
          {!isProfileComplete() && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 p-4 rounded-lg"
            >
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-amber-500 mr-3" />
                <div>
                  <p className="text-amber-800 font-semibold">Complete Your Profile</p>
                  <p className="text-amber-700 text-sm">Fill in all required fields to unlock personalized recommendations</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-400 p-4 rounded-lg"
            >
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-emerald-500 mr-3" />
                <div>
                  <p className="text-emerald-800 font-semibold">
                    Profile saved successfully! 
                    {isProfileComplete() && ' Your profile is now complete.'}
                  </p>
                  {isSupabaseConfigured() && (
                    <p className="text-emerald-700 text-sm mt-1">
                      ✓ Saved to database and local storage
                    </p>
                  )}
                  {!isSupabaseConfigured() && (
                    <p className="text-emerald-700 text-sm mt-1">
                      ✓ Saved to local storage (database not configured)
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 p-4 rounded-lg"
            >
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                <div>
                  <p className="text-red-800 font-semibold">Error saving profile</p>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Database Status */}
          <div className={`p-4 rounded-lg border-l-4 ${
            isSupabaseConfigured()
              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400' 
              : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-400'
          }`}>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                isSupabaseConfigured() ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
              <p className={`font-semibold ${
                isSupabaseConfigured() ? 'text-blue-800' : 'text-gray-700'
              }`}>
                Database: {
                  isSupabaseConfigured() 
                    ? 'Connected (Open Access Mode)' 
                    : 'Not configured (using local storage)'
                }
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-10">
          {/* Basic Information */}
          <div>
            <div className="flex items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-sky-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
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
                    className={`w-full pl-10 pr-10 py-3 border-2 rounded-xl focus:ring-2 focus:ring-sky-500 transition-all ${
                      emailError ? 'border-red-300 bg-red-50 focus:border-red-500' : 'border-gray-200 focus:border-sky-500'
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
                  <p className="text-red-500 text-sm mt-2 font-medium">{emailError}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Age <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                    placeholder="Age"
                    min="13"
                    max="120"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
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
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-sky-500 transition-all ${
                        heightError ? 'border-red-300 bg-red-50 focus:border-red-500' : 'border-gray-200 focus:border-sky-500'
                      }`}
                      placeholder="5"
                      min="3"
                      max="8"
                      required
                    />
                  </div>
                  <span className="text-gray-600 font-semibold">feet</span>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={formData.height_inches}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, height_inches: e.target.value }));
                        if (heightError) validateHeight();
                      }}
                      onBlur={validateHeight}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-sky-500 transition-all ${
                        heightError ? 'border-red-300 bg-red-50 focus:border-red-500' : 'border-gray-200 focus:border-sky-500'
                      }`}
                      placeholder="8"
                      min="0"
                      max="11"
                      required
                    />
                  </div>
                  <span className="text-gray-600 font-semibold">inches</span>
                </div>
                {heightError && (
                  <p className="text-red-500 text-sm mt-2 font-medium">{heightError}</p>
                )}
                <p className="text-gray-500 text-xs mt-2">
                  Example: 5 feet 8 inches (5' 8")
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Weight (lbs) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                    placeholder="154"
                    min="50"
                    max="500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Section Divider */}
          <div className="relative">
            <hr className="border-t-4 border-gradient-to-r from-sky-200 via-blue-200 to-emerald-200 my-8" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white px-4">
                <div className="w-3 h-3 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <div className="flex items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Activity Level</h2>
              </div>
            </div>
            
            <div className="space-y-3">
              {[
                { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise', color: 'from-gray-500 to-gray-600' },
                { value: 'light', label: 'Light', desc: 'Exercise 1-3 times per week', color: 'from-blue-500 to-blue-600' },
                { value: 'moderate', label: 'Moderate', desc: 'Exercise 4-5 times per week', color: 'from-green-500 to-green-600' },
                { value: 'active', label: 'Active', desc: 'Daily exercise or intense exercise 3-4 times per week', color: 'from-orange-500 to-orange-600' },
                { value: 'very_active', label: 'Very Active', desc: 'Intense exercise 6-7 times per week', color: 'from-red-500 to-red-600' }
              ].map((option) => (
                <label
                  key={option.value}
                  className={`block p-5 border-2 rounded-xl cursor-pointer transition-all transform hover:scale-[1.02] ${
                    formData.activity_level === option.value
                      ? 'border-sky-500 bg-gradient-to-r from-sky-50 to-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
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
                  <div className="flex items-center space-x-4">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${option.color}`}></div>
                    <div>
                      <div className="font-bold text-gray-800 text-lg">{option.label}</div>
                      <div className="text-gray-600">{option.desc}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Enhanced Section Divider */}
          <div className="relative">
            <hr className="border-t-4 border-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 my-8" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white px-4">
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Health Goals */}
          <div>
            <div className="flex items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Health Goals</h2>
                <span className="text-red-500 text-lg font-bold">*</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {HEALTH_GOALS.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => handleArrayToggle(formData.health_goals, goal, 'health_goals')}
                  className={`p-4 text-left border-2 rounded-xl transition-all transform hover:scale-105 ${
                    formData.health_goals.includes(goal)
                      ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="font-semibold">{goal}</div>
                </button>
              ))}
            </div>
            {formData.health_goals.length === 0 && (
              <p className="text-red-500 font-medium mt-3">Please select at least one health goal.</p>
            )}
          </div>

          {/* Enhanced Section Divider */}
          <div className="relative">
            <hr className="border-t-4 border-gradient-to-r from-orange-200 via-amber-200 to-yellow-200 my-8" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white px-4">
                <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Dietary Preferences */}
          <div>
            <div className="flex items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Dietary Preferences</h2>
              </div>
            </div>
            
            <div className="space-y-8">
              <div>
                <h3 className="font-bold text-gray-800 mb-4 text-lg">Dietary Restrictions</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {DIETARY_RESTRICTIONS.map((restriction) => (
                    <button
                      key={restriction}
                      type="button"
                      onClick={() => handleArrayToggle(formData.dietary_restrictions, restriction, 'dietary_restrictions')}
                      className={`p-4 text-left border-2 rounded-xl transition-all transform hover:scale-105 ${
                        formData.dietary_restrictions.includes(restriction)
                          ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="font-semibold">{restriction}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-4 text-lg flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  Allergies
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {COMMON_ALLERGIES.map((allergy) => (
                    <button
                      key={allergy}
                      type="button"
                      onClick={() => handleArrayToggle(formData.allergies, allergy, 'allergies')}
                      className={`p-4 text-left border-2 rounded-xl transition-all transform hover:scale-105 ${
                        formData.allergies.includes(allergy)
                          ? 'border-red-500 bg-gradient-to-r from-red-50 to-pink-50 text-red-700 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="font-semibold">{allergy}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Section Divider */}
          <div className="relative">
            <hr className="border-t-4 border-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 my-8" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white px-4">
                <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Current Habits */}
          <div>
            <div className="flex items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Current Habits & Notes</h2>
              </div>
            </div>
            <textarea
              value={formData.current_habits}
              onChange={(e) => setFormData(prev => ({ ...prev, current_habits: e.target.value }))}
              rows={5}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
              placeholder="Tell us about your current eating habits, challenges, lifestyle, or anything else you'd like your AI coach to know..."
            />
          </div>

          {/* Enhanced Save Button */}
          <div className="flex justify-end pt-8 border-t-4 border-gradient-to-r from-sky-200 to-emerald-200">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !!emailError || !!heightError}
              className={`flex items-center px-10 py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 shadow-lg ${
                isProfileComplete()
                  ? 'bg-gradient-to-r from-sky-500 to-emerald-500 text-white hover:from-sky-600 hover:to-emerald-600 hover:shadow-xl'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 hover:shadow-xl'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-6 h-6 mr-3" />
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