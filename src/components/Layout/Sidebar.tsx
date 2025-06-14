import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Heart, User, ChevronRight, TrendingUp, Activity, Camera, ShoppingCart, BarChart3, AlertCircle } from 'lucide-react';
import { PremiumUpgrade } from '../Premium/PremiumUpgrade';
import type { User as UserType, UserProfile } from '../../types';

interface SidebarProps {
  onNavigate?: (page: 'chat' | 'profile' | 'preferences' | 'reports' | 'analytics' | 'exercise' | 'photo-analysis' | 'grocery-list') => void;
  currentPage?: string;
  user: UserType;
  profile: UserProfile | null;
  profileCompleted?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  onNavigate,
  currentPage = 'chat',
  user,
  profile,
  profileCompleted = false
}) => {
  const [showPremiumUpgrade, setShowPremiumUpgrade] = useState(false);

  const handleUpgrade = (planId: string) => {
    console.log(`User upgraded to ${planId} plan`);
    setShowPremiumUpgrade(false);
  };

  const navigationItems = [
    { id: 'chat', label: 'AI Chat', icon: Heart, isPremium: false },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, isPremium: true },
    { id: 'exercise', label: 'Exercise & Habits', icon: Activity, isPremium: false },
    { id: 'photo-analysis', label: 'Photo Analysis', icon: Camera, isPremium: true },
    { id: 'grocery-list', label: 'Smart Grocery List', icon: ShoppingCart, isPremium: true },
    { id: 'reports', label: 'Weekly Reports', icon: TrendingUp, isPremium: true },
    { id: 'profile', label: 'Profile Settings', icon: User, isPremium: false }
  ];

  return (
    <>
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">HealthCoach AI</h1>
              <p className="text-sm text-gray-600">Open Access Demo</p>
            </div>
          </div>

          {/* Profile Completion Alert */}
          {!profileCompleted && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">Complete Your Profile</span>
              </div>
              <p className="text-xs text-amber-700 mb-2">
                Get personalized recommendations by completing your profile first.
              </p>
              <button
                onClick={() => onNavigate?.('profile')}
                className="text-xs bg-amber-500 text-white px-3 py-1 rounded-md hover:bg-amber-600 transition-colors"
              >
                Complete Now
              </button>
            </div>
          )}

          {/* User Info */}
          <div className="bg-gradient-to-r from-emerald-50 to-sky-50 p-3 rounded-lg mb-4 border border-emerald-200">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </div>
                <span className="font-medium text-emerald-800">
                  {profile?.name || 'Guest User'}
                </span>
                <Crown className="w-4 h-4 text-purple-500" />
              </div>
            </div>
            <p className="text-xs text-emerald-700">{profile?.email || user.email}</p>
          </div>

          {/* Navigation */}
          <div className="space-y-1 mb-4">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate?.(item.id as any)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                  currentPage === item.id
                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.isPremium && (
                    <Crown className="w-4 h-4 text-purple-500" />
                  )}
                  {item.id === 'profile' && !profileCompleted && (
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  )}
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Demo Info Footer - Premium banner removed from here */}
        <div className="mt-auto p-4 border-t border-gray-200">
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-4 text-center border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">Demo Mode</h3>
            <p className="text-sm text-gray-600">
              All features are available for testing
            </p>
          </div>
        </div>
      </div>

      {/* Premium Upgrade Modal */}
      <AnimatePresence>
        {showPremiumUpgrade && (
          <PremiumUpgrade
            onClose={() => setShowPremiumUpgrade(false)}
            onUpgrade={handleUpgrade}
          />
        )}
      </AnimatePresence>
    </>
  );
};