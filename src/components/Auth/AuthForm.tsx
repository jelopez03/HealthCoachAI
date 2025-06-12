import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Heart, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onToggleMode: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode, onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        setSuccess('Account created successfully! Please check your email (including spam folder) to confirm your account before signing in.');
      }
    } catch (err) {
      let errorMessage = 'An error occurred';
      
      if (err instanceof Error) {
        const message = err.message.toLowerCase();
        
        if (message.includes('invalid login credentials') || message.includes('invalid_credentials')) {
          if (mode === 'signin') {
            errorMessage = err.message; // Use the enhanced message from AuthContext
          } else {
            errorMessage = 'Unable to create account. This email may already be registered, or there was an issue with your credentials.';
          }
        } else if (message.includes('email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.';
        } else if (message.includes('user not found')) {
          errorMessage = 'No account found with this email address. Please sign up first.';
        } else if (message.includes('too many requests')) {
          errorMessage = 'Too many attempts. Please wait a moment before trying again.';
        } else if (message.includes('weak password')) {
          errorMessage = 'Password is too weak. Please use at least 6 characters with a mix of letters and numbers.';
        } else if (message.includes('invalid email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (message.includes('signup_disabled')) {
          errorMessage = 'New signups are currently disabled. Please contact support.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-2xl mb-4"
          >
            <Heart className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
            HealthCoach AI
          </h1>
          <p className="text-gray-600 mt-2">
            Your personalized nutrition companion
          </p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {mode === 'signin' ? 'Welcome back' : 'Get started'}
            </h2>
            <p className="text-gray-600">
              {mode === 'signin' ? 'Sign in to continue your journey' : 'Create your account to begin'}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                {error}
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-4 flex items-start gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                {success}
              </div>
            </motion.div>
          )}

          {mode === 'signin' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg mb-4 flex items-start gap-3"
            >
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <strong>First time signing in?</strong> Make sure you've clicked the confirmation link in your email (check spam folder too).
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-sky-500 to-emerald-500 text-white py-3 rounded-lg font-medium hover:from-sky-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={onToggleMode}
                className="ml-2 text-sky-600 hover:text-sky-700 font-medium"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {mode === 'signin' && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Having trouble? Double-check your email and password, and make sure you've confirmed your email address.
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};