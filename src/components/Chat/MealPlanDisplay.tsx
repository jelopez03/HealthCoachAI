import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Flame, Utensils } from 'lucide-react';
import type { MealPlan } from '../../types';

interface MealPlanDisplayProps {
  mealPlan: MealPlan;
}

export const MealPlanDisplay: React.FC<MealPlanDisplayProps> = ({ mealPlan }) => {
  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return '🌅';
      case 'lunch':
        return '☀️';
      case 'dinner':
        return '🌙';
      case 'snack':
        return '🍎';
      default:
        return '🍽️';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-emerald-800 mb-2">
            {mealPlan.title}
          </h3>
          <p className="text-emerald-700">{mealPlan.description}</p>
        </div>
        <div className="flex items-center space-x-2 text-emerald-600">
          <Flame className="w-5 h-5" />
          <span className="font-medium">{mealPlan.calories_per_day} cal/day</span>
        </div>
      </div>

      {/* Days */}
      <div className="space-y-4">
        {mealPlan.days.map((day, dayIndex) => (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dayIndex * 0.1 }}
            className="bg-white rounded-lg p-4 shadow-sm border border-emerald-100"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <h4 className="font-semibold text-emerald-800 capitalize">
                  {day.day}
                </h4>
              </div>
              <div className="flex items-center space-x-1 text-sm text-emerald-600">
                <Flame className="w-4 h-4" />
                <span>{day.total_calories} cal</span>
              </div>
            </div>

            <div className="grid gap-3">
              {day.meals.map((meal, mealIndex) => (
                <div
                  key={mealIndex}
                  className="flex items-start space-x-3 p-3 bg-emerald-25 rounded-lg"
                >
                  <div className="text-lg">{getMealIcon(meal.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-gray-800 capitalize">
                        {meal.type}
                      </h5>
                      <span className="text-sm text-gray-600">
                        {meal.calories} cal
                      </span>
                    </div>
                    <p className="text-gray-700 font-medium mb-2">{meal.name}</p>
                    
                    {meal.ingredients.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-gray-600 mb-1">
                          Ingredients:
                        </p>
                        <p className="text-sm text-gray-600">
                          {meal.ingredients.join(', ')}
                        </p>
                      </div>
                    )}
                    
                    {meal.instructions && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">
                          Instructions:
                        </p>
                        <p className="text-sm text-gray-600">{meal.instructions}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-emerald-200 flex items-center justify-between text-sm text-emerald-700">
        <div className="flex items-center space-x-2">
          <Utensils className="w-4 h-4" />
          <span>{mealPlan.days.length} days planned</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4" />
          <span>Updated {new Date(mealPlan.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </motion.div>
  );
};