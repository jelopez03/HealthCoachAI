import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Sidebar } from './components/Layout/Sidebar';
import { ChatInterface } from './components/Chat/ChatInterface';
import { ProfileSettings } from './components/Settings/ProfileSettings';
import { Preferences } from './components/Settings/Preferences';
import { WeeklyReport } from './components/Reports/WeeklyReport';
import { ProgressDashboard } from './components/Analytics/ProgressDashboard';
import { ExerciseTracker } from './components/Exercise/ExerciseTracker';
import { SmartGroceryList } from './components/AI/SmartGroceryList';
import { MealPlanner } from './components/MealPlanner/MealPlanner';
import { PremiumUpgrade } from './components/Premium/PremiumUpgrade';
import { WalkthroughModal } from './components/Onboarding/WalkthroughModal';
import type { Conversation, User, UserProfile } from './types';

// Helper function to generate valid UUIDs for mock data
const generateMockUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Create a mock user for open access
const mockUser: User = {
  id: generateMockUUID(), // Use generated UUID instead of hardcoded string
  email: 'user@healthcoach.ai',
  created_at: new Date().toISOString(),
  subscription_status: 'premium' // Give premium access for testing
};

const App: React.FC = () => {
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentPage, setCurrentPage] = useState<'chat' | 'profile' | 'preferences' | 'reports' | 'analytics' | 'exercise' | 'grocery-list' | 'meal-planner'>('profile'); // Start with profile
  const [showPremiumUpgrade, setShowPremiumUpgrade] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Mock conversations for demo
  const mockConversations: Conversation[] = [
    {
      id: generateMockUUID(),
      user_id: mockUser.id,
      title: 'Meal Planning for Weight Loss',
      message_count: 8,
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      updated_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
    },
    {
      id: generateMockUUID(),
      user_id: mockUser.id,
      title: 'Vegetarian Protein Sources',
      message_count: 5,
      created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      updated_at: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
    },
    {
      id: generateMockUUID(),
      user_id: mockUser.id,
      title: 'Quick Healthy Breakfast Ideas',
      message_count: 12,
      created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      updated_at: new Date(Date.now() - 10800000).toISOString() // 3 hours ago
    }
  ];

  // Load profile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('healthcoach-profile');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);
        
        // Check if profile is complete
        const isComplete = !!(
          parsedProfile.name?.trim() &&
          parsedProfile.email?.trim() &&
          parsedProfile.age &&
          parsedProfile.height_feet &&
          parsedProfile.height_inches &&
          parsedProfile.weight &&
          parsedProfile.health_goals?.length > 0
        );
        setProfileCompleted(isComplete);
        
        // If profile is complete, show chat page instead
        if (isComplete) {
          setCurrentPage('chat');
        }
      } catch (error) {
        console.error('Error parsing saved profile:', error);
      }
    }

    // Load mock conversations
    setConversations(mockConversations);
  }, []);

  // Check if this is the user's first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('healthcoach-visited');
    
    if (!hasVisited && profileCompleted) {
      setShowWalkthrough(true);
      localStorage.setItem('healthcoach-visited', 'true');
    }
  }, [profileCompleted]);

  const handleNavigate = (page: 'chat' | 'profile' | 'preferences' | 'reports' | 'analytics' | 'exercise' | 'grocery-list' | 'meal-planner') => {
    setCurrentPage(page);
    
    // Close walkthrough when navigating
    if (showWalkthrough) {
      setShowWalkthrough(false);
    }
  };

  const handleUpgrade = (planId: string) => {
    console.log(`User upgraded to ${planId} plan`);
    setShowPremiumUpgrade(false);
  };

  const handleProfileComplete = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    setProfileCompleted(true);
    
    // Save to localStorage
    localStorage.setItem('healthcoach-profile', JSON.stringify(updatedProfile));
    
    // Navigate to chat after profile completion
    setCurrentPage('chat');
    
    // Show walkthrough for first-time users
    const hasVisited = localStorage.getItem('healthcoach-visited');
    if (!hasVisited) {
      setShowWalkthrough(true);
      localStorage.setItem('healthcoach-visited', 'true');
    }
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('healthcoach-profile', JSON.stringify(updatedProfile));
  };

  const handleNewConversation = () => {
    const newConversation: Conversation = {
      id: generateMockUUID(),
      user_id: mockUser.id,
      title: 'New Conversation',
      message_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversation(newConversation);
    setCurrentPage('chat');
  };

  const handleDeleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(null);
    }
  };

  const renderMainContent = () => {
    switch (currentPage) {
      case 'profile':
        return (
          <ProfileSettings 
            onProfileComplete={handleProfileComplete}
            onProfileUpdate={handleProfileUpdate}
            existingProfile={profile}
          />
        );
      case 'preferences':
        return <Preferences />;
      case 'reports':
        return <WeeklyReport onUpgrade={() => setShowPremiumUpgrade(true)} />;
      case 'analytics':
        return <ProgressDashboard />;
      case 'exercise':
        return <ExerciseTracker userId={mockUser.id} />;
      case 'grocery-list':
        return <SmartGroceryList />;
      case 'meal-planner':
        return <MealPlanner />;
      case 'chat':
      default:
        return (
          <ChatInterface 
            conversation={currentConversation}
            conversations={conversations}
            onConversationSelect={setCurrentConversation}
            onNewConversation={handleNewConversation}
            onDeleteConversation={handleDeleteConversation}
            userProfile={profile}
          />
        );
    }
  };

  return (
    <Router>
      {/* Fixed viewport container - prevents page scrolling */}
      <div className="h-screen w-screen overflow-hidden flex bg-gray-50">
        {/* Fixed Sidebar */}
        <div className="flex-shrink-0">
          <Sidebar
            onNavigate={handleNavigate}
            currentPage={currentPage}
            user={mockUser}
            profile={profile}
            profileCompleted={profileCompleted}
            onUpgrade={() => setShowPremiumUpgrade(true)}
          />
        </div>
        
        {/* Main Content Area with its own scroll */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header with Bolt Badge - Fixed */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-800">HealthCoach AI</h1>
              <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium">
                Open Access Demo
              </span>
            </div>
            <div className="flex items-center">
              <img 
                src="/black_circle_360x360.png" 
                alt="Powered by Bolt" 
                className="w-16 h-16 opacity-80 hover:opacity-100 transition-opacity cursor-pointer hover:scale-105 transform transition-transform duration-200"
                title="Powered by Bolt - Click to visit bolt.new"
              />
            </div>
          </div>
          
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            {renderMainContent()}
          </div>
        </div>
      </div>

      {/* Premium Upgrade Modal */}
      {showPremiumUpgrade && (
        <PremiumUpgrade
          onClose={() => setShowPremiumUpgrade(false)}
          onUpgrade={handleUpgrade}
        />
      )}

      {/* Walkthrough Modal */}
      <WalkthroughModal
        isOpen={showWalkthrough}
        onClose={() => setShowWalkthrough(false)}
        onNavigate={handleNavigate}
        profileCompleted={profileCompleted}
      />
    </Router>
  );
};

export default App;