import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Flame, ChefHat, Star } from 'lucide-react';
import type { Recipe } from '../../types';

interface RecipeDisplayProps {
  recipe: Recipe;
}

export const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipe }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'hard':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyStars = (difficulty: string) => {
    const stars = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
    return Array.from({ length: 3 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-semibold text-orange-800 mb-2">
              {recipe.name}
            </h3>
            <p className="text-orange-700">{recipe.description}</p>
          </div>
          <div className="flex items-center space-x-1">
            {getDifficultyStars(recipe.difficulty)}
          </div>
        </div>

        {/* Recipe Stats */}
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-1 text-orange-600">
            <Clock className="w-4 h-4" />
            <span>{recipe.prep_time + recipe.cook_time} min</span>
          </div>
          <div className="flex items-center space-x-1 text-orange-600">
            <Users className="w-4 h-4" />
            <span>{recipe.servings} servings</span>
          </div>
          <div className="flex items-center space-x-1 text-orange-600">
            <Flame className="w-4 h-4" />
            <span>{recipe.calories_per_serving} cal/serving</span>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getDifficultyColor(recipe.difficulty)}`}>
            {recipe.difficulty}
          </span>
        </div>

        {/* Tags */}
        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {recipe.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Ingredients */}
      <div className="mb-6">
        <h4 className="flex items-center space-x-2 text-lg font-semibold text-orange-800 mb-3">
          <ChefHat className="w-5 h-5" />
          <span>Ingredients</span>
        </h4>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-100">
          <div className="grid gap-2">
            {recipe.ingredients.map((ingredient, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-1 border-b border-gray-100 last:border-b-0"
              >
                <span className="text-gray-800">{ingredient.name}</span>
                <span className="text-gray-600 text-sm">
                  {ingredient.amount} {ingredient.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div>
        <h4 className="text-lg font-semibold text-orange-800 mb-3">
          Instructions
        </h4>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-100">
          <ol className="space-y-3">
            {recipe.instructions.map((instruction, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex space-x-3"
              >
                <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white text-sm font-medium rounded-full flex items-center justify-center">
                  {index + 1}
                </span>
                <p className="text-gray-700 flex-1">{instruction}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-orange-200 flex items-center justify-between text-sm text-orange-700">
        <div className="flex items-center space-x-4">
          <span>Prep: {recipe.prep_time} min</span>
          <span>Cook: {recipe.cook_time} min</span>
        </div>
        <span>Added {new Date(recipe.created_at).toLocaleDateString()}</span>
      </div>
    </motion.div>
  );
};