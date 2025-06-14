import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Calendar, Award, Flame, Droplets, Activity, Weight, Ruler, Crown, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ProgressData {
  date: string;
  weight: number;
  calories: number;
  water: number;
  steps: number;
  workouts: number;
}

export const ProgressDashboard: React.FC = () => {
  const { user } = useAuth();
  // TEMPORARILY ALLOW ACCESS FOR TESTING
  const isPremiumUser = true; // user?.subscription_status === 'premium';

  // Mock progress data (converted to lbs)
  const progressData: ProgressData[] = [
    { date: '2024-03-01', weight: 159.8, calories: 1850, water: 2.1, steps: 8500, workouts: 1 },
    { date: '2024-03-02', weight: 159.4, calories: 1780, water: 2.3, steps: 9200, workouts: 0 },
    { date: '2024-03-03', weight: 158.9, calories: 1920, water: 2.0, steps: 7800, workouts: 1 },
    { date: '2024-03-04', weight: 158.5, calories: 1650, water: 2.5, steps: 10500, workouts: 1 },
    { date: '2024-03-05', weight: 158.1, calories: 1750, water: 2.2, steps: 9800, workouts: 0 },
    { date: '2024-03-06', weight: 157.6, calories: 1820, water: 2.4, steps: 11200, workouts: 1 },
    { date: '2024-03-07', weight: 157.2, calories: 1690, water: 2.1, steps: 8900, workouts: 1 }
  ];

  const currentStats = {
    weightChange: -2.4, // in lbs
    avgCalories: 1780,
    avgWater: 2.2,
    avgSteps: 9400,
    totalWorkouts: 5,
    streakDays: 7
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold">Progress Analytics</h1>
                <Crown className="w-8 h-8 text-yellow-300" />
              </div>
              <p className="text-emerald-100">Track your health journey with detailed insights</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2 text-yellow-300">
                <Crown className="w-5 h-5" />
                <span className="font-semibold">Premium Feature</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-3">
            <Weight className="w-8 h-8 text-purple-500" />
            <span className="text-sm text-green-600 font-medium">-2.4 lbs</span>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-1">157.2 lbs</div>
          <div className="text-sm text-gray-600">Current Weight</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-3">
            <Flame className="w-8 h-8 text-orange-500" />
            <span className="text-sm text-gray-600">avg/day</span>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-1">{currentStats.avgCalories}</div>
          <div className="text-sm text-gray-600">Calories</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-3">
            <Activity className="w-8 h-8 text-blue-500" />
            <span className="text-sm text-gray-600">avg/day</span>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-1">{currentStats.avgSteps.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Steps</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-3">
            <Target className="w-8 h-8 text-emerald-500" />
            <span className="text-sm text-emerald-600 font-medium">🔥</span>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-1">{currentStats.streakDays}</div>
          <div className="text-sm text-gray-600">Day Streak</div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weight Progress Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Weight className="w-5 h-5 mr-2 text-purple-500" />
            Weight Progress (lbs)
            <Crown className="w-4 h-4 ml-2 text-purple-500" />
          </h3>
          <div className="h-48 flex items-end justify-between space-x-2 bg-gray-50 rounded-lg p-4">
            {progressData.map((data, index) => {
              const minWeight = Math.min(...progressData.map(d => d.weight));
              const maxWeight = Math.max(...progressData.map(d => d.weight));
              const heightPercentage = ((data.weight - minWeight) / (maxWeight - minWeight)) * 80 + 10;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="relative w-full flex flex-col items-center">
                    <div className="text-xs text-gray-600 mb-1 font-medium">
                      {data.weight.toFixed(1)}
                    </div>
                    <div 
                      className="w-full bg-purple-500 rounded-t-md transition-all duration-1000 ease-out"
                      style={{ height: `${heightPercentage}%`, minHeight: '20px' }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2 font-medium">
                    {new Date(data.date).getDate()}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 text-center text-sm text-gray-600">
            March 2024 • Total change: {currentStats.weightChange} lbs
          </div>
        </motion.div>

        {/* Calories Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Flame className="w-5 h-5 mr-2 text-orange-500" />
            Daily Calories
            <Crown className="w-4 h-4 ml-2 text-purple-500" />
          </h3>
          <div className="h-48 flex items-end justify-between space-x-2 bg-gray-50 rounded-lg p-4">
            {progressData.map((data, index) => {
              const heightPercentage = (data.calories / 2000) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="relative w-full flex flex-col items-center">
                    <div className="text-xs text-gray-600 mb-1 font-medium">
                      {data.calories}
                    </div>
                    <div 
                      className="w-full bg-orange-500 rounded-t-md transition-all duration-1000 ease-out"
                      style={{ height: `${heightPercentage}%`, minHeight: '20px' }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2 font-medium">
                    {new Date(data.date).getDate()}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 text-center text-sm text-gray-600">
            Target: 1800 cal/day • Average: {currentStats.avgCalories} cal
          </div>
        </motion.div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Steps Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-500" />
            Daily Steps
            <Crown className="w-4 h-4 ml-2 text-purple-500" />
          </h3>
          <div className="h-48 flex items-end justify-between space-x-2 bg-gray-50 rounded-lg p-4">
            {progressData.map((data, index) => {
              const heightPercentage = (data.steps / 12000) * 100;
              const isGoalMet = data.steps >= 10000;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="relative w-full flex flex-col items-center">
                    <div className="text-xs text-gray-600 mb-1 font-medium">
                      {(data.steps / 1000).toFixed(1)}k
                    </div>
                    <div 
                      className={`w-full rounded-t-md transition-all duration-1000 ease-out ${
                        isGoalMet ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ height: `${heightPercentage}%`, minHeight: '20px' }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2 font-medium">
                    {new Date(data.date).getDate()}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 text-center text-sm text-gray-600">
            Goal: 10,000 steps/day • Average: {currentStats.avgSteps.toLocaleString()} steps
          </div>
        </motion.div>

        {/* Water Intake Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Droplets className="w-5 h-5 mr-2 text-cyan-500" />
            Water Intake (liters)
            <Crown className="w-4 h-4 ml-2 text-purple-500" />
          </h3>
          <div className="h-48 flex items-end justify-between space-x-2 bg-gray-50 rounded-lg p-4">
            {progressData.map((data, index) => {
              const heightPercentage = (data.water / 3) * 100;
              const isGoalMet = data.water >= 2.0;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="relative w-full flex flex-col items-center">
                    <div className="text-xs text-gray-600 mb-1 font-medium">
                      {data.water.toFixed(1)}L
                    </div>
                    <div 
                      className={`w-full rounded-t-md transition-all duration-1000 ease-out ${
                        isGoalMet ? 'bg-cyan-500' : 'bg-blue-300'
                      }`}
                      style={{ height: `${heightPercentage}%`, minHeight: '20px' }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2 font-medium">
                    {new Date(data.date).getDate()}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 text-center text-sm text-gray-600">
            Goal: 2.0L/day • Average: {currentStats.avgWater.toFixed(1)}L
          </div>
        </motion.div>
      </div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Award className="w-5 h-5 mr-2 text-yellow-500" />
          Recent Achievements
          <Crown className="w-4 h-4 ml-2 text-purple-500" />
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-800">7-Day Streak</p>
              <p className="text-sm text-gray-600">Consistent logging</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <Weight className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Weight Goal</p>
              <p className="text-sm text-gray-600">Lost 2.4 lbs this week</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Step Master</p>
              <p className="text-sm text-gray-600">10k+ steps 3 days</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};