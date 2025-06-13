import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Award, Calendar, Flame, Utensils, Activity, Crown, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface WeeklyReportProps {
  onUpgrade?: () => void;
}

export const WeeklyReport: React.FC<WeeklyReportProps> = ({ onUpgrade }) => {
  const { user } = useAuth();
  // TEMPORARILY ALLOW ACCESS FOR TESTING
  const isPremiumUser = true; // user?.subscription_status === 'premium';

  // Mock data for the report
  const reportData = {
    week: 'March 4-10, 2024',
    caloriesGoal: 12600, // 1800 per day * 7 days
    caloriesActual: 11850,
    mealsLogged: 18,
    mealsGoal: 21,
    exerciseDays: 4,
    exerciseGoal: 5,
    weightChange: -0.8,
    achievements: [
      'Stayed within calorie goals 5/7 days',
      'Tried 3 new healthy recipes',
      'Increased vegetable intake by 25%'
    ],
    insights: [
      'Your protein intake was consistent throughout the week',
      'Consider adding more fiber-rich foods to your breakfast',
      'Great job staying hydrated - you met your water goals!'
    ]
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold">Weekly Health Report</h1>
                  <Crown className="w-8 h-8 text-yellow-300" />
                </div>
                <p className="text-emerald-100">{reportData.week}</p>
              </div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2 text-yellow-300">
                <Crown className="w-5 h-5" />
                <span className="font-semibold">Premium Feature</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-orange-50 rounded-xl p-6 text-center"
            >
              <Flame className="w-8 h-8 text-orange-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-800">{reportData.caloriesActual.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Calories</div>
              <div className="text-xs text-orange-600 mt-1">
                {Math.round((reportData.caloriesActual / reportData.caloriesGoal) * 100)}% of goal
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-blue-50 rounded-xl p-6 text-center"
            >
              <Utensils className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-800">{reportData.mealsLogged}/{reportData.mealsGoal}</div>
              <div className="text-sm text-gray-600">Meals Logged</div>
              <div className="text-xs text-blue-600 mt-1">
                {Math.round((reportData.mealsLogged / reportData.mealsGoal) * 100)}% completion
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-green-50 rounded-xl p-6 text-center"
            >
              <Activity className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-800">{reportData.exerciseDays}/{reportData.exerciseGoal}</div>
              <div className="text-sm text-gray-600">Exercise Days</div>
              <div className="text-xs text-green-600 mt-1">
                {Math.round((reportData.exerciseDays / reportData.exerciseGoal) * 100)}% of goal
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-purple-50 rounded-xl p-6 text-center"
            >
              <Target className="w-8 h-8 text-purple-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-800">{reportData.weightChange > 0 ? '+' : ''}{reportData.weightChange}</div>
              <div className="text-sm text-gray-600">lbs Change</div>
              <div className="text-xs text-purple-600 mt-1">This week</div>
            </motion.div>
          </div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-500" />
              This Week's Achievements
              <Crown className="w-4 h-4 ml-2 text-purple-500" />
            </h2>
            <div className="space-y-3">
              {reportData.achievements.map((achievement, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">{achievement}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
              AI Insights & Recommendations
              <Crown className="w-4 h-4 ml-2 text-purple-500" />
            </h2>
            <div className="space-y-3">
              {reportData.insights.map((insight, index) => (
                <div key={index} className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <p className="text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};