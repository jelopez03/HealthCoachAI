import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Sidebar } from './components/Layout/Sidebar';
import { ChatInterface } from './components/Chat/ChatInterface';
import { ProfileSettings } from './components/Settings/ProfileSettings';
import { Preferences } from './components/Settings/Preferences';
import { WeeklyReport } from './components/Reports/WeeklyReport';
import { ProgressDashboard } from './components/Analytics/ProgressDashboard';
import { ExerciseTracker } from './components/Exercise/ExerciseTracker';
import { PhotoAnalysis } from './components/AI/PhotoAnalysis';
import { SmartGroceryList } from './components/AI/SmartGroceryList';
import { PremiumUpgrade } from './components/Premium/PremiumUpgrade';
import { WalkthroughModal } from './components/Onboarding/WalkthroughModal';
import type { Conversation } from './types';

// Mock user data for public demo
const mockUser = {
  id: 'demo-user-id',
  email: 'demo@healthcoach.ai',
  created_at: new Date().toISOString(),
  subscription_status: 'premium' as const
};

const mockProfile = {
  id: 'demo-profile-id',
  user_id: 'demo-user-id',
  name: 'Demo User',
  age: 30,
  gender: 'other' as const,
  height: 175,
  weight: 70,
  activity_level: 'moderate' as const,
  health_goals: ['Weight Loss', 'Improved Energy'],
  dietary_restrictions: ['Vegetarian'],
  allergies: [],
  current_habits: 'I try to eat healthy but struggle with consistency.',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const App: React.FC = () => {
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [currentPage, setCurrentPage] = useState<'chat' | 'profile' | 'preferences' | 'reports' | 'analytics' | 'exercise' | 'photo-analysis' | 'grocery-list'>('chat');
  const [showPremiumUpgrade, setShowPremiumUpgrade] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);

  // Check if this is the user's first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('healthcoach-visited');
    const profileComplete = localStorage.getItem('healthcoach-profile-complete');
    
    if (!hasVisited) {
      setShowWalkthrough(true);
      localStorage.setItem('healthcoach-visited', 'true');
    }
    
    if (profileComplete === 'true') {
      setProfileCompleted(true);
    }
  }, []);

  const handleNavigate = (page: 'chat' | 'profile' | 'preferences' | 'reports' | 'analytics' | 'exercise' | 'photo-analysis' | 'grocery-list') => {
    setCurrentPage(page);
    if (page !== 'chat') {
      setCurrentConversation(null);
    }
    
    // Close walkthrough when navigating
    if (showWalkthrough) {
      setShowWalkthrough(false);
    }
  };

  const handleUpgrade = (planId: string) => {
    console.log(`User upgraded to ${planId} plan`);
    setShowPremiumUpgrade(false);
  };

  const handleProfileComplete = () => {
    setProfileCompleted(true);
    localStorage.setItem('healthcoach-profile-complete', 'true');
  };

  const renderMainContent = () => {
    switch (currentPage) {
      case 'profile':
        return <ProfileSettings onProfileComplete={handleProfileComplete} />;
      case 'preferences':
        return <Preferences />;
      case 'reports':
        return <WeeklyReport onUpgrade={() => setShowPremiumUpgrade(true)} />;
      case 'analytics':
        return <ProgressDashboard />;
      case 'exercise':
        return <ExerciseTracker />;
      case 'photo-analysis':
        return <PhotoAnalysis />;
      case 'grocery-list':
        return <SmartGroceryList />;
      case 'chat':
      default:
        return currentConversation ? (
          <ChatInterface conversation={currentConversation} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Welcome to HealthCoach AI!
              </h2>
              <p className="text-gray-600 mb-6">
                Ready to start your health journey? Start a new conversation or explore our features.
              </p>
              <div className="space-y-4 text-left max-w-md mx-auto">
                <div className="bg-sky-50 p-4 rounded-lg">
                  <h3 className="font-medium text-sky-800 mb-2">💬 Ask me anything about:</h3>
                  <ul className="text-sm text-sky-700 space-y-1">
                    <li>• Personalized meal planning</li>
                    <li>• Nutritional advice and tips</li>
                    <li>• Healthy recipe suggestions</li>
                    <li>• Progress tracking and motivation</li>
                  </ul>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <p className="text-sm text-emerald-800">
                    <strong>🎯 Demo Mode:</strong> This is a fully functional demo of HealthCoach AI. 
                    All features are available for testing and exploration.
                  </p>
                </div>
                {!profileCompleted && (
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-800">
                      <strong>⚠️ Complete Your Profile:</strong> For the best experience, please{' '}
                      <button 
                        onClick={() => handleNavigate('profile')}
                        className="underline font-medium hover:text-amber-900"
                      >
                        complete your profile
                      </button>{' '}
                      first to get personalized recommendations.
                    </p>
                  </div>
                )}
                <div className="text-center">
                  <button
                    onClick={() => setShowWalkthrough(true)}
                    className="text-sky-600 hover:text-sky-700 text-sm font-medium underline"
                  >
                    Take the guided tour
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <AuthProvider>
      <Router>
        <div className="h-screen flex bg-gray-50">
          <Sidebar
            currentConversation={currentConversation}
            onConversationSelect={setCurrentConversation}
            onNewConversation={() => setCurrentConversation(null)}
            onNavigate={handleNavigate}
            currentPage={currentPage}
            user={mockUser}
            profile={mockProfile}
            profileCompleted={profileCompleted}
          />
          
          <div className="flex-1 flex flex-col">
            {/* Header with Bolt Badge */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-end">
              <div className="flex items-center">
                <a 
                  href="https://bolt.new/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img 
                    src="/black_circle_360x360.png" 
                    alt="Powered by Bolt" 
                    className="w-16 h-16 opacity-80 hover:opacity-100 transition-opacity cursor-pointer hover:scale-105 transform transition-transform duration-200"
                    title="Powered by Bolt - Click to visit bolt.new"
                  />
                </a>
              </div>
            </div>
            
            <div className="flex-1">
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
    </AuthProvider>
  );
};

export default App;