import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, User, MessageSquare, Activity, Target, Settings, CheckCircle } from 'lucide-react';

interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
  highlight?: string;
}

interface WalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
  profileCompleted: boolean;
}

const walkthroughSteps: WalkthroughStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to HealthCoach AI! 🎉',
    description: 'Your personal AI-powered nutrition and health companion. Let\'s get you set up for success!',
    icon: <User className="w-8 h-8" />,
  },
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'First, we need to know about you! Your age, goals, dietary preferences, and health information help us provide personalized recommendations.',
    icon: <User className="w-8 h-8" />,
    action: 'Go to Profile Settings',
    highlight: 'This is the most important step - we can\'t provide good advice without knowing about you!'
  },
  {
    id: 'chat',
    title: 'Start Your First Conversation',
    description: 'Ask me anything about nutrition, meal planning, recipes, or health goals. I\'m here to help 24/7!',
    icon: <MessageSquare className="w-8 h-8" />,
    action: 'Start Chatting'
  },
  {
    id: 'exercise',
    title: 'Track Your Activities',
    description: 'Log workouts, track daily habits like water intake and steps, and monitor your progress over time.',
    icon: <Activity className="w-8 h-8" />,
    action: 'Explore Exercise Tracker'
  },
  {
    id: 'features',
    title: 'Discover Premium Features',
    description: 'Analyze food photos, generate smart grocery lists, view detailed analytics, and get weekly health reports.',
    icon: <Target className="w-8 h-8" />,
    action: 'Explore Features'
  },
  {
    id: 'preferences',
    title: 'Customize Your Experience',
    description: 'Set up notifications, choose your coaching style, and personalize the app to match your preferences.',
    icon: <Settings className="w-8 h-8" />,
    action: 'Set Preferences'
  }
];

export const WalkthroughModal: React.FC<WalkthroughModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  profileCompleted
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (profileCompleted) {
      setCompletedSteps(prev => new Set([...prev, 'profile']));
    }
  }, [profileCompleted]);

  const handleNext = () => {
    if (currentStep < walkthroughSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAction = () => {
    const step = walkthroughSteps[currentStep];
    
    switch (step.id) {
      case 'profile':
        onNavigate('profile');
        break;
      case 'chat':
        onNavigate('chat');
        break;
      case 'exercise':
        onNavigate('exercise');
        break;
      case 'features':
        onNavigate('analytics');
        break;
      case 'preferences':
        onNavigate('preferences');
        break;
    }
    
    setCompletedSteps(prev => new Set([...prev, step.id]));
    
    if (currentStep < walkthroughSteps.length - 1) {
      handleNext();
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  const currentStepData = walkthroughSteps[currentStep];
  const isCompleted = completedSteps.has(currentStepData.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-emerald-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              {currentStepData.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
              <p className="text-sky-100">
                Step {currentStep + 1} of {walkthroughSteps.length}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-gray-600">Progress</span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / walkthroughSteps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-sky-500 to-emerald-500 h-2 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep + 1) / walkthroughSteps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {currentStepData.description}
                </p>
                
                {currentStepData.highlight && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-amber-800">
                      <Target className="w-5 h-5" />
                      <span className="font-medium">Important:</span>
                    </div>
                    <p className="text-amber-700 mt-1">{currentStepData.highlight}</p>
                  </div>
                )}

                {isCompleted && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-center space-x-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Completed!</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Step-specific content */}
              {currentStepData.id === 'welcome' && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-sky-50 p-4 rounded-lg text-center">
                    <div className="text-2xl mb-2">🎯</div>
                    <h3 className="font-medium text-sky-800">Personalized</h3>
                    <p className="text-sm text-sky-600">AI recommendations just for you</p>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-lg text-center">
                    <div className="text-2xl mb-2">📱</div>
                    <h3 className="font-medium text-emerald-800">Easy to Use</h3>
                    <p className="text-sm text-emerald-600">Simple, intuitive interface</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl mb-2">📊</div>
                    <h3 className="font-medium text-purple-800">Track Progress</h3>
                    <p className="text-sm text-purple-600">Monitor your health journey</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <div className="text-2xl mb-2">🤖</div>
                    <h3 className="font-medium text-orange-800">AI Powered</h3>
                    <p className="text-sm text-orange-600">Smart health coaching</p>
                  </div>
                </div>
              )}

              {currentStepData.id === 'profile' && !profileCompleted && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 text-red-800 mb-2">
                    <Target className="w-5 h-5" />
                    <span className="font-medium">Action Required</span>
                  </div>
                  <p className="text-red-700">
                    Please complete your profile before continuing. This helps us provide accurate, personalized recommendations.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            {walkthroughSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index <= currentStep ? 'bg-sky-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Skip Tour
            </button>

            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </button>
            )}

            {currentStepData.action ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAction}
                className={`flex items-center px-6 py-2 rounded-lg font-medium transition-all ${
                  currentStepData.id === 'profile' && !profileCompleted
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gradient-to-r from-sky-500 to-emerald-500 text-white hover:from-sky-600 hover:to-emerald-600'
                }`}
              >
                {currentStepData.action}
                <ChevronRight className="w-4 h-4 ml-1" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                className="flex items-center px-6 py-2 bg-gradient-to-r from-sky-500 to-emerald-500 text-white rounded-lg hover:from-sky-600 hover:to-emerald-600 transition-all"
              >
                {currentStep === walkthroughSteps.length - 1 ? 'Get Started' : 'Next'}
                <ChevronRight className="w-4 h-4 ml-1" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};