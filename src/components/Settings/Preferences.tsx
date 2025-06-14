import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Palette, Volume2, Shield, Smartphone, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { DatabaseService } from '../../services/database';
import { isSupabaseConfigured } from '../../lib/supabase';

interface PreferencesState {
  notifications: {
    email: boolean;
    push: boolean;
    mealReminders: boolean;
    progressUpdates: boolean;
    weeklyReports: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    colorScheme: 'blue' | 'green' | 'purple' | 'orange';
    fontSize: 'small' | 'medium' | 'large';
  };
  privacy: {
    dataSharing: boolean;
    analytics: boolean;
    personalizedAds: boolean;
  };
  coaching: {
    reminderFrequency: 'daily' | 'weekly' | 'monthly';
    coachingStyle: 'gentle' | 'motivational' | 'direct';
    language: 'en' | 'es' | 'fr' | 'de';
  };
  audio: {
    soundEffects: boolean;
    voiceGuidance: boolean;
    volume: number;
  };
}

export const Preferences: React.FC = () => {
  const [preferences, setPreferences] = useState<PreferencesState>({
    notifications: {
      email: true,
      push: true,
      mealReminders: true,
      progressUpdates: true,
      weeklyReports: true
    },
    appearance: {
      theme: 'light',
      colorScheme: 'blue',
      fontSize: 'medium'
    },
    privacy: {
      dataSharing: false,
      analytics: true,
      personalizedAds: false
    },
    coaching: {
      reminderFrequency: 'daily',
      coachingStyle: 'motivational',
      language: 'en'
    },
    audio: {
      soundEffects: true,
      voiceGuidance: true,
      volume: 75
    }
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Mock user ID for open access demo
  const userId = 'open-access-user';

  // Load preferences on component mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      if (isSupabaseConfigured()) {
        const userPreferences = await DatabaseService.getUserPreferences(userId);
        if (userPreferences) {
          setPreferences({
            notifications: userPreferences.notifications || preferences.notifications,
            appearance: userPreferences.appearance || preferences.appearance,
            privacy: userPreferences.privacy || preferences.privacy,
            coaching: userPreferences.coaching || preferences.coaching,
            audio: userPreferences.audio || preferences.audio
          });
        }
      } else {
        // Load from localStorage
        const savedPreferences = localStorage.getItem('user-preferences');
        if (savedPreferences) {
          setPreferences(JSON.parse(savedPreferences));
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      // Fallback to localStorage
      const savedPreferences = localStorage.getItem('user-preferences');
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      if (isSupabaseConfigured()) {
        await DatabaseService.upsertUserPreferences({
          user_id: userId,
          notifications: preferences.notifications,
          appearance: preferences.appearance,
          privacy: preferences.privacy,
          coaching: preferences.coaching,
          audio: preferences.audio
        });
      }

      // Also save to localStorage as backup
      localStorage.setItem('user-preferences', JSON.stringify(preferences));

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setError('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (section: keyof PreferencesState, key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const PreferenceSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }> = ({ title, icon, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <div className="text-sky-500 mr-3">{icon}</div>
        {title}
      </h3>
      {children}
    </motion.div>
  );

  const Toggle: React.FC<{
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
  }> = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <p className="font-medium text-gray-800">{label}</p>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-sky-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const Select: React.FC<{
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
  }> = ({ label, value, options, onChange }) => (
    <div className="py-3">
      <label className="block font-medium text-gray-800 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const Slider: React.FC<{
    label: string;
    value: number;
    min: number;
    max: number;
    onChange: (value: number) => void;
  }> = ({ label, value, min, max, onChange }) => (
    <div className="py-3">
      <div className="flex justify-between items-center mb-2">
        <label className="font-medium text-gray-800">{label}</label>
        <span className="text-sm text-gray-600">{value}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Settings className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Preferences</h1>
              <p className="text-purple-100">Customize your HealthCoach AI experience</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-lg"
        >
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
            <p className="text-green-700 font-medium">Preferences saved successfully!</p>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg"
        >
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </motion.div>
      )}

      <div className="space-y-6">
        {/* Notifications */}
        <PreferenceSection title="Notifications" icon={<Bell className="w-5 h-5" />}>
          <div className="space-y-1">
            <Toggle
              label="Email Notifications"
              description="Receive updates and tips via email"
              checked={preferences.notifications.email}
              onChange={(checked) => updatePreference('notifications', 'email', checked)}
            />
            <Toggle
              label="Push Notifications"
              description="Get real-time notifications on your device"
              checked={preferences.notifications.push}
              onChange={(checked) => updatePreference('notifications', 'push', checked)}
            />
            <Toggle
              label="Meal Reminders"
              description="Reminders for meal times and planning"
              checked={preferences.notifications.mealReminders}
              onChange={(checked) => updatePreference('notifications', 'mealReminders', checked)}
            />
            <Toggle
              label="Progress Updates"
              description="Weekly progress summaries and achievements"
              checked={preferences.notifications.progressUpdates}
              onChange={(checked) => updatePreference('notifications', 'progressUpdates', checked)}
            />
            <Toggle
              label="Weekly Reports"
              description="Detailed weekly health and nutrition reports"
              checked={preferences.notifications.weeklyReports}
              onChange={(checked) => updatePreference('notifications', 'weeklyReports', checked)}
            />
          </div>
        </PreferenceSection>

        {/* Appearance */}
        <PreferenceSection title="Appearance" icon={<Palette className="w-5 h-5" />}>
          <div className="space-y-4">
            <Select
              label="Theme"
              value={preferences.appearance.theme}
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'auto', label: 'Auto (System)' }
              ]}
              onChange={(value) => updatePreference('appearance', 'theme', value)}
            />
            <Select
              label="Color Scheme"
              value={preferences.appearance.colorScheme}
              options={[
                { value: 'blue', label: 'Ocean Blue' },
                { value: 'green', label: 'Nature Green' },
                { value: 'purple', label: 'Royal Purple' },
                { value: 'orange', label: 'Sunset Orange' }
              ]}
              onChange={(value) => updatePreference('appearance', 'colorScheme', value)}
            />
            <Select
              label="Font Size"
              value={preferences.appearance.fontSize}
              options={[
                { value: 'small', label: 'Small' },
                { value: 'medium', label: 'Medium' },
                { value: 'large', label: 'Large' }
              ]}
              onChange={(value) => updatePreference('appearance', 'fontSize', value)}
            />
          </div>
        </PreferenceSection>

        {/* Coaching */}
        <PreferenceSection title="AI Coaching" icon={<Smartphone className="w-5 h-5" />}>
          <div className="space-y-4">
            <Select
              label="Reminder Frequency"
              value={preferences.coaching.reminderFrequency}
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' }
              ]}
              onChange={(value) => updatePreference('coaching', 'reminderFrequency', value)}
            />
            <Select
              label="Coaching Style"
              value={preferences.coaching.coachingStyle}
              options={[
                { value: 'gentle', label: 'Gentle & Supportive' },
                { value: 'motivational', label: 'Motivational & Encouraging' },
                { value: 'direct', label: 'Direct & Goal-Focused' }
              ]}
              onChange={(value) => updatePreference('coaching', 'coachingStyle', value)}
            />
            <Select
              label="Language"
              value={preferences.coaching.language}
              options={[
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Español' },
                { value: 'fr', label: 'Français' },
                { value: 'de', label: 'Deutsch' }
              ]}
              onChange={(value) => updatePreference('coaching', 'language', value)}
            />
          </div>
        </PreferenceSection>

        {/* Audio */}
        <PreferenceSection title="Audio & Sound" icon={<Volume2 className="w-5 h-5" />}>
          <div className="space-y-1">
            <Toggle
              label="Sound Effects"
              description="Play sounds for interactions and notifications"
              checked={preferences.audio.soundEffects}
              onChange={(checked) => updatePreference('audio', 'soundEffects', checked)}
            />
            <Toggle
              label="Voice Guidance"
              description="Enable AI voice responses and guidance"
              checked={preferences.audio.voiceGuidance}
              onChange={(checked) => updatePreference('audio', 'voiceGuidance', checked)}
            />
            <Slider
              label="Volume"
              value={preferences.audio.volume}
              min={0}
              max={100}
              onChange={(value) => updatePreference('audio', 'volume', value)}
            />
          </div>
        </PreferenceSection>

        {/* Privacy */}
        <PreferenceSection title="Privacy & Data" icon={<Shield className="w-5 h-5" />}>
          <div className="space-y-1">
            <Toggle
              label="Data Sharing"
              description="Share anonymized data to improve AI recommendations"
              checked={preferences.privacy.dataSharing}
              onChange={(checked) => updatePreference('privacy', 'dataSharing', checked)}
            />
            <Toggle
              label="Analytics"
              description="Help us improve the app with usage analytics"
              checked={preferences.privacy.analytics}
              onChange={(checked) => updatePreference('privacy', 'analytics', checked)}
            />
            <Toggle
              label="Personalized Ads"
              description="Show ads tailored to your health interests"
              checked={preferences.privacy.personalizedAds}
              onChange={(checked) => updatePreference('privacy', 'personalizedAds', checked)}
            />
          </div>
        </PreferenceSection>
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={loading}
          className="flex items-center px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Save Preferences
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};