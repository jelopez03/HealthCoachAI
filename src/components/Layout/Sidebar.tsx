import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, Settings, Crown, LogOut, Heart, User, ChevronRight, TrendingUp, Activity, Camera, ShoppingCart, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { HealthCoachingAPI } from '../../services/api';
import { PremiumUpgrade } from '../Premium/PremiumUpgrade';
import type { Conversation } from '../../types';

interface SidebarProps {
  currentConversation: Conversation | null;
  onConversationSelect: (conversation: Conversation) => void;
  onNewConversation: () => void;
  onNavigate?: (page: 'chat' | 'profile' | 'preferences' | 'reports' | 'analytics' | 'exercise' | 'photo-analysis' | 'grocery-list') => void;
  currentPage?: string;
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
  currentPage = 'chat'
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPremiumUpgrade, setShowPremiumUpgrade] = useState(false);
  const { user, signOut } = useAuth();

  // Mock data for development when auth is bypassed - using valid UUIDs
  const mockConversations: Conversation[] = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Meal Planning for Weight Loss',
      message_count: 8,
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      updated_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Vegetarian Protein Sources',
      message_count: 5,
      created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      updated_at: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Quick Healthy Breakfast Ideas',
      message_count: 12,
      created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      updated_at: new Date(Date.now() - 10800000).toISOString() // 3 hours ago
    }
  ];

  useEffect(() => {
    if (user) {
      loadConversations();
    } else {
      // Use mock data when no user (development mode)
      setConversations(mockConversations);
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userConversations = await HealthCoachingAPI.getConversations(user.id);
      setConversations(userConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      // Fallback to mock data on error
      setConversations(mockConversations);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = async () => {
    if (!user) {
      // Mock new conversation for development - using valid UUID
      const newMockConversation: Conversation = {
        id: generateMockUUID(),
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'New Conversation',
        message_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setConversations(prev => [newMockConversation, ...prev]);
      onNewConversation();
      onConversationSelect(newMockConversation);
      return;
    }

    try {
      const newConversation = await HealthCoachingAPI.createConversation(
        user.id,
        'New Conversation'
      );
      setConversations(prev => [newConversation, ...prev]);
      onNewConversation();
      onConversationSelect(newConversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleUpgrade = (planId: string) => {
    console.log(`User upgraded to ${planId} plan`);
    // In a real app, this would update the user's subscription status
    setShowPremiumUpgrade(false);
  };

  const isPremiumFeature = (feature: string) => {
    return user?.subscription_status === 'free' && ['unlimited_chats', 'advanced_plans'].includes(feature);
  };

  const navigationItems = [
    { id: 'chat', label: 'Conversations', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, premium: true },
    { id: 'exercise', label: 'Exercise & Habits', icon: Activity },
    { id: 'photo-analysis', label: 'Photo Analysis', icon: Camera, premium: true },
    { id: 'grocery-list', label: 'Smart Grocery List', icon: ShoppingCart, premium: true },
    { id: 'reports', label: 'Weekly Reports', icon: TrendingUp, premium: true },
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Settings }
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
                  {item.premium && (
                    <Crown className="w-4 h-4 text-purple-500" />
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
                {currentPage === 'analytics' && 'Progress Analytics'}
                {currentPage === 'exercise' && 'Exercise & Habits'}
                {currentPage === 'photo-analysis' && 'AI Photo Analysis'}
                {currentPage === 'grocery-list' && 'Smart Grocery Lists'}
                {currentPage === 'reports' && 'Weekly Reports'}
                {currentPage === 'profile' && 'Profile Settings'}
                {currentPage === 'preferences' && 'Preferences'}
              </p>
              <p className="text-sm">
                {currentPage === 'analytics' && 'Track your health progress'}
                {currentPage === 'exercise' && 'Monitor workouts and habits'}
                {currentPage === 'photo-analysis' && 'Analyze food photos with AI'}
                {currentPage === 'grocery-list' && 'AI-generated shopping lists'}
                {currentPage === 'reports' && 'Detailed weekly insights'}
                {currentPage === 'profile' && 'Manage your personal information'}
                {currentPage === 'preferences' && 'Customize your experience'}
              </p>
            </div>
          </div>
        )}

        {/* Premium Upgrade Banner - Only show for free users */}
        {(!user || user?.subscription_status === 'free') && (
          <div className="p-4 border-t border-gray-200">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white"
            >
              <div className="flex items-center space-x-2 mb-2">
                <Crown className="w-5 h-5" />
                <h3 className="font-semibold">Upgrade to Premium</h3>
              </div>
              <p className="text-sm text-purple-100 mb-3">
                Unlock analytics, photo analysis, smart grocery lists, and more
              </p>
              <button 
                onClick={() => setShowPremiumUpgrade(true)}
                className="w-full bg-white text-purple-600 font-medium py-2 rounded-lg hover:bg-purple-50 transition-colors"
              >
                View Plans
              </button>
            </motion.div>
          </div>
        )}

        {/* Bottom Menu */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          {user && (
            <button 
              onClick={signOut}
              className="w-full flex items-center space-x-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          )}
          
          {!user && (
            <div className="text-center p-3">
              <p className="text-xs text-gray-500">Development Mode Active</p>
            </div>
          )}
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