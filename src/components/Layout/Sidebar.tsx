import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, Settings, Crown, Heart, User, ChevronRight, TrendingUp, Activity, Camera, ShoppingCart, BarChart3, AlertCircle, LogOut } from 'lucide-react';
import { PremiumUpgrade } from '../Premium/PremiumUpgrade';
import { useAuth } from '../../contexts/AuthContext';
import type { Conversation, User as UserType, UserProfile } from '../../types';

interface SidebarProps {
  currentConversation: Conversation | null;
  onConversationSelect: (conversation: Conversation) => void;
  onNewConversation: () => void;
  onNavigate?: (page: 'chat' | 'profile' | 'preferences' | 'reports' | 'analytics' | 'exercise' | 'photo-analysis' | 'grocery-list') => void;
  currentPage?: string;
  user: UserType;
  profile: UserProfile | null;
  profileCompleted?: boolean;
}

// Helper function to generate valid UUIDs for mock data
const generateMockUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentConversation, 
  onConversationSelect, 
  onNewConversation,
  onNavigate,
  currentPage = 'chat',
  user,
  profile,
  profileCompleted = false
}) => {
  const { signOut } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPremiumUpgrade, setShowPremiumUpgrade] = useState(false);

  // Mock conversations for demo
  const mockConversations: Conversation[] = [
    {
      id: generateMockUUID(),
      user_id: user.id,
      title: 'Meal Planning for Weight Loss',
      message_count: 8,
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      updated_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
    },
    {
      id: generateMockUUID(),
      user_id: user.id,
      title: 'Vegetarian Protein Sources',
      message_count: 5,
      created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      updated_at: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
    },
    {
      id: generateMockUUID(),
      user_id: user.id,
      title: 'Quick Healthy Breakfast Ideas',
      message_count: 12,
      created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      updated_at: new Date(Date.now() - 10800000).toISOString() // 3 hours ago
    }
  ];

  useEffect(() => {
    // Load mock conversations
    setConversations(mockConversations);
  }, [user.id]);

  const handleNewConversation = async () => {
    // Create mock new conversation
    const newMockConversation: Conversation = {
      id: generateMockUUID(),
      user_id: user.id,
      title: 'New Conversation',
      message_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setConversations(prev => [newMockConversation, ...prev]);
    onNewConversation();
    onConversationSelect(newMockConversation);
  };

  const handleUpgrade = (planId: string) => {
    console.log(`User upgraded to ${planId} plan`);
    setShowPremiumUpgrade(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigationItems = [
    { id: 'chat', label: 'Conversations', icon: MessageSquare, isPremium: false },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, isPremium: true },
    { id: 'exercise', label: 'Exercise & Habits', icon: Activity, isPremium: false },
    { id: 'photo-analysis', label: 'Photo Analysis', icon: Camera, isPremium: true },
    { id: 'grocery-list', label: 'Smart Grocery List', icon: ShoppingCart, isPremium: true },
    { id: 'reports', label: 'Weekly Reports', icon: TrendingUp, isPremium: true },
    { id: 'profile', label: 'Profile Settings', icon: User, isPremium: false },
    { id: 'preferences', label: 'Preferences', icon: Settings, isPremium: false }
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
              <p className="text-sm text-gray-600">Your nutrition companion</p>
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
                  {profile?.name || user.email.split('@')[0]}
                </span>
                {user.subscription_status === 'premium' && (
                  <Crown className="w-4 h-4 text-purple-500" />
                )}
              </div>
              <button
                onClick={handleSignOut}
                className="text-emerald-600 hover:text-emerald-800 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-emerald-700">{user.email}</p>
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

          {/* New Conversation Button - Only show on chat page */}
          {currentPage === 'chat' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNewConversation}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-sky-500 to-emerald-500 text-white rounded-lg hover:from-sky-600 hover:to-emerald-600 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>New Conversation</span>
            </motion.button>
          )}
        </div>

        {/* Conversations List - Only show on chat page */}
        {currentPage === 'chat' && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No conversations yet</p>
                  <p className="text-sm">Start a new chat to begin!</p>
                </div>
              ) : (
                <AnimatePresence>
                  {conversations.map((conversation) => (
                    <motion.button
                      key={conversation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      onClick={() => onConversationSelect(conversation)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        currentConversation?.id === conversation.id
                          ? 'bg-sky-50 border border-sky-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">
                            {conversation.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {conversation.message_count} messages
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(conversation.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        )}

        {/* Content for other pages */}
        {currentPage !== 'chat' && (
          <div className="flex-1 p-4">
            <div className="text-center py-8 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {currentPage === 'analytics' && <BarChart3 className="w-8 h-8 text-gray-400" />}
                {currentPage === 'exercise' && <Activity className="w-8 h-8 text-gray-400" />}
                {currentPage === 'photo-analysis' && <Camera className="w-8 h-8 text-gray-400" />}
                {currentPage === 'grocery-list' && <ShoppingCart className="w-8 h-8 text-gray-400" />}
                {currentPage === 'reports' && <TrendingUp className="w-8 h-8 text-gray-400" />}
                {currentPage === 'profile' && <User className="w-8 h-8 text-gray-400" />}
                {currentPage === 'preferences' && <Settings className="w-8 h-8 text-gray-400" />}
              </div>
              <p className="font-medium">
                {currentPage === 'analytics' && (
                  <span className="flex items-center justify-center space-x-2">
                    <span>Progress Analytics</span>
                    <Crown className="w-4 h-4 text-purple-500" />
                  </span>
                )}
                {currentPage === 'exercise' && 'Exercise & Habits'}
                {currentPage === 'photo-analysis' && (
                  <span className="flex items-center justify-center space-x-2">
                    <span>AI Photo Analysis</span>
                    <Crown className="w-4 h-4 text-purple-500" />
                  </span>
                )}
                {currentPage === 'grocery-list' && (
                  <span className="flex items-center justify-center space-x-2">
                    <span>Smart Grocery Lists</span>
                    <Crown className="w-4 h-4 text-purple-500" />
                  </span>
                )}
                {currentPage === 'reports' && (
                  <span className="flex items-center justify-center space-x-2">
                    <span>Weekly Reports</span>
                    <Crown className="w-4 h-4 text-purple-500" />
                  </span>
                )}
                {currentPage === 'profile' && 'Profile Settings'}
                {currentPage === 'preferences' && 'Preferences'}
              </p>
              <p className="text-sm">
                {currentPage === 'analytics' && (
                  <span className="flex items-center justify-center space-x-1 text-purple-600">
                    <Crown className="w-3 h-3" />
                    <span>Premium Feature - Track your health progress</span>
                  </span>
                )}
                {currentPage === 'exercise' && 'Monitor workouts and habits'}
                {currentPage === 'photo-analysis' && (
                  <span className="flex items-center justify-center space-x-1 text-purple-600">
                    <Crown className="w-3 h-3" />
                    <span>Premium Feature - Analyze food photos with AI</span>
                  </span>
                )}
                {currentPage === 'grocery-list' && (
                  <span className="flex items-center justify-center space-x-1 text-purple-600">
                    <Crown className="w-3 h-3" />
                    <span>Premium Feature - AI-generated shopping lists</span>
                  </span>
                )}
                {currentPage === 'reports' && (
                  <span className="flex items-center justify-center space-x-1 text-purple-600">
                    <Crown className="w-3 h-3" />
                    <span>Premium Feature - Detailed weekly insights</span>
                  </span>
                )}
                {currentPage === 'profile' && 'Manage your personal information'}
                {currentPage === 'preferences' && 'Customize your experience'}
              </p>
            </div>
          </div>
        )}

        {/* Premium Upgrade Footer */}
        {user.subscription_status !== 'premium' && (
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 text-center border border-purple-200">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Crown className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-purple-800">Upgrade to Premium</h3>
              </div>
              <p className="text-sm text-purple-700 mb-3">
                Unlock advanced analytics, AI photo analysis, and more
              </p>
              <button 
                onClick={() => setShowPremiumUpgrade(true)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors text-sm"
              >
                View Pricing Plans
              </button>
            </div>
          </div>
        )}
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