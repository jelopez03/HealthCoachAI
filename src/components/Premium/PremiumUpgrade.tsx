import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Check, X, Star, Zap, TrendingUp, Shield, Sparkles, Heart, Camera, ShoppingCart, BarChart3 } from 'lucide-react';

interface PricingPlan {
  id: 'premium';
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  color: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'premium',
    name: 'Premium Plus',
    price: 4.99,
    period: 'month',
    description: 'Complete health coaching experience with all features',
    color: 'purple',
    popular: true,
    features: [
      'Unlimited conversations',
      'Advanced meal planning',
      'Recipe recommendations',
      'Weekly health reports',
      'Advanced analytics & progress tracking',
      'Exercise & habit tracking',
      'AI photo analysis for nutrition',
      'Smart grocery lists from meal plans',
      'Personalized video coaching',
      'Audio meditation guides',
      'Priority support',
      'Nutrition expert consultations'
    ]
  }
];

interface PremiumUpgradeProps {
  onClose?: () => void;
  onUpgrade?: (planId: string) => void;
}

export const PremiumUpgrade: React.FC<PremiumUpgradeProps> = ({ onClose, onUpgrade }) => {
  const [selectedPlan, setSelectedPlan] = useState<'premium'>('premium');
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (planId: string) => {
    setLoading(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real app, this would integrate with Stripe or another payment processor
    console.log(`Upgrading to ${planId} plan`);
    
    if (onUpgrade) {
      onUpgrade(planId);
    }
    
    setLoading(false);
  };

  const PlanCard: React.FC<{ plan: PricingPlan }> = ({ plan }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-white rounded-2xl shadow-xl border-2 transition-all cursor-pointer ${
        selectedPlan === plan.id
          ? `border-${plan.color}-500 ring-4 ring-${plan.color}-100`
          : 'border-gray-200 hover:border-gray-300'
      } ${plan.popular ? 'scale-105' : ''}`}
      onClick={() => setSelectedPlan(plan.id)}
    >
      {plan.popular && (
        <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-${plan.color}-500 to-${plan.color}-600 text-white px-6 py-2 rounded-full text-sm font-medium flex items-center space-x-1`}>
          <Star className="w-4 h-4" />
          <span>Most Popular</span>
        </div>
      )}

      <div className="p-8">
        <div className="text-center mb-6">
          <div className={`w-16 h-16 bg-gradient-to-r from-${plan.color}-500 to-${plan.color}-600 rounded-full flex items-center justify-center mx-auto mb-4`}>
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
          <p className="text-gray-600">{plan.description}</p>
        </div>

        <div className="text-center mb-8">
          <div className="flex items-baseline justify-center">
            <span className="text-4xl font-bold text-gray-800">${plan.price}</span>
            <span className="text-gray-600 ml-1">/{plan.period}</span>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className={`w-5 h-5 bg-${plan.color}-100 rounded-full flex items-center justify-center flex-shrink-0`}>
                <Check className={`w-3 h-3 text-${plan.color}-600`} />
              </div>
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation();
            handleUpgrade(plan.id);
          }}
          disabled={loading}
          className={`w-full py-4 rounded-xl font-semibold transition-all ${
            selectedPlan === plan.id
              ? `bg-gradient-to-r from-${plan.color}-500 to-${plan.color}-600 text-white hover:from-${plan.color}-600 hover:to-${plan.color}-700`
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } disabled:opacity-50`}
        >
          {loading && selectedPlan === plan.id ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            `Choose ${plan.name}`
          )}
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 p-8 text-white relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Heart className="w-10 h-10" />
            </motion.div>
            <h1 className="text-4xl font-bold mb-4">Upgrade to Premium</h1>
            <p className="text-xl text-purple-100">
              Unlock the full potential of your health journey
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="p-8 bg-gray-50">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            Premium Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center p-6 bg-white rounded-xl shadow-sm"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Advanced Analytics</h3>
              <p className="text-gray-600 text-sm">
                Detailed progress tracking with charts and insights
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center p-6 bg-white rounded-xl shadow-sm"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">AI Photo Analysis</h3>
              <p className="text-gray-600 text-sm">
                Upload food photos for instant nutrition analysis
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center p-6 bg-white rounded-xl shadow-sm"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Smart Grocery Lists</h3>
              <p className="text-gray-600 text-sm">
                AI-generated shopping lists from your meal plans
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center p-6 bg-white rounded-xl shadow-sm"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Weekly Reports</h3>
              <p className="text-gray-600 text-sm">
                Comprehensive health and nutrition reports
              </p>
            </motion.div>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            Choose Your Plan
          </h2>
          
          <div className="max-w-md mx-auto">
            {pricingPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>

          {/* Money Back Guarantee */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-8 p-6 bg-green-50 rounded-xl border border-green-200"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-green-800 mb-2">30-Day Money Back Guarantee</h3>
            <p className="text-green-700 text-sm">
              Not satisfied? Get a full refund within 30 days, no questions asked.
            </p>
          </motion.div>

          {/* FAQ */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Questions? Contact our support team at{' '}
              <a href="mailto:support@healthcoach.ai" className="text-sky-600 hover:underline">
                support@healthcoach.ai
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};