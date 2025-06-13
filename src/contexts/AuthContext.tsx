import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User, UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip auth setup if Supabase is not configured
    if (!isSupabaseConfigured()) {
      console.warn('Supabase is not configured. Please set up your environment variables.');
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          created_at: session.user.created_at,
          subscription_status: 'free' // Default, should be fetched from RevenueCat
        });
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          created_at: session.user.created_at,
          subscription_status: 'free'
        });
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please set up your environment variables.');
    }
    
    // Validate inputs
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (!email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      // Handle specific Supabase auth errors
      if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
        // Check if this might be an unconfirmed email issue
        // Try to get user info to see if account exists but is unconfirmed
        try {
          const { data: resetData, error: resetError } = await supabase.auth.resetPasswordForEmail(
            email.trim().toLowerCase(),
            { redirectTo: `${window.location.origin}/auth/callback` }
          );
          
          // If password reset doesn't fail, the account exists
          if (!resetError) {
            throw new Error('Your account exists but may not be confirmed yet. Please check your email for a confirmation link, or check your spam folder. If you need a new confirmation email, try signing up again with the same email.');
          }
        } catch (resetErr) {
          // If reset also fails, it's likely wrong credentials
        }
        
        throw new Error('Invalid email or password. Please check your credentials and try again. If you just signed up, make sure to confirm your email first.');
      } else if (error.message.includes('Email not confirmed')) {
        throw new Error('Please check your email and click the confirmation link before signing in.');
      } else if (error.message.includes('Too many requests')) {
        throw new Error('Too many sign-in attempts. Please wait a moment before trying again.');
      } else if (error.message.includes('signup_disabled')) {
        throw new Error('New signups are currently disabled. Please contact support.');
      } else {
        throw error;
      }
    }

    // Additional check for email confirmation (though this might not be reached if Supabase blocks unconfirmed logins)
    if (data.user && !data.user.email_confirmed_at) {
      throw new Error('Please check your email and click the confirmation link before signing in.');
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please set up your environment variables.');
    }
    
    // Validate inputs
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (!email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      // Handle specific Supabase auth errors
      if (error.message.includes('User already registered')) {
        throw new Error('An account with this email already exists. Please sign in instead, or check your email for a confirmation link if you recently signed up.');
      } else if (error.message.includes('Password should be at least')) {
        throw new Error('Password is too weak. Please use at least 6 characters with a mix of letters and numbers.');
      } else if (error.message.includes('Invalid email')) {
        throw new Error('Please enter a valid email address.');
      } else if (error.message.includes('signup_disabled')) {
        throw new Error('New signups are currently disabled. Please contact support.');
      } else if (error.message.includes('invalid_credentials')) {
        throw new Error('Unable to create account with these credentials. Please try a different email or password.');
      } else {
        throw error;
      }
    }

    // Don't automatically sign in after signup - user needs to confirm email first
    if (data.user && !data.session) {
      // User was created but needs email confirmation
      return;
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      return;
    }
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');
    
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please set up your environment variables.');
    }

    try {
      const updatedProfile = {
        ...profileData,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(updatedProfile)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setProfile(data);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};