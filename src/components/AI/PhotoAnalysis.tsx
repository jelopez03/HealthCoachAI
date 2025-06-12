import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, Scan, Sparkles, Crown, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NutritionAnalysis {
  food_items: Array<{
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    confidence: number;
  }>;
  total_calories: number;
  meal_type: string;
  suggestions: string[];
}

export const PhotoAnalysis: React.FC = () => {
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<NutritionAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TEMPORARILY ALLOW ACCESS FOR TESTING
  const isPremiumUser = true; // user?.subscription_status === 'premium';

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        if (isPremiumUser) {
          analyzeImage();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    setAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock analysis result
    setAnalysis({
      food_items: [
        {
          name: 'Grilled Chicken Breast',
          calories: 185,
          protein: 35,
          carbs: 0,
          fat: 4,
          confidence: 0.92
        },
        {
          name: 'Brown Rice',
          calories: 110,
          protein: 2.5,
          carbs: 23,
          fat: 0.9,
          confidence: 0.88
        },
        {
          name: 'Steamed Broccoli',
          calories: 25,
          protein: 3,
          carbs: 5,
          fat: 0.3,
          confidence: 0.95
        }
      ],
      total_calories: 320,
      meal_type: 'lunch',
      suggestions: [
        'Great protein choice! The chicken provides excellent lean protein.',
        'Consider adding healthy fats like avocado or olive oil.',
        'This meal has a good balance of protein and complex carbs.'
      ]
    });
    
    setAnalyzing(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-8 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Scan className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">AI Photo Analysis</h1>
              <p className="text-indigo-100">Upload food photos for instant nutrition insights</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 mb-8"
      >
        <div className="text-center">
          {!selectedImage ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all"
            >
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload Food Photo</h3>
              <p className="text-gray-600 mb-4">
                Take a photo or upload an image of your meal for AI analysis
              </p>
              <div className="flex items-center justify-center space-x-4">
                <button className="flex items-center space-x-2 bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition-colors">
                  <Camera className="w-5 h-5" />
                  <span>Take Photo</span>
                </button>
                <button className="flex items-center space-x-2 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors">
                  <Upload className="w-5 h-5" />
                  <span>Upload Image</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Food to analyze"
                  className="w-full max-w-md mx-auto rounded-xl shadow-lg"
                />
                {analyzing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
                    <div className="text-white text-center">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                      <p>Analyzing nutrition...</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setAnalysis(null);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Upload Different Photo
                </button>
                {!analyzing && !analysis && (
                  <button
                    onClick={analyzeImage}
                    className="flex items-center space-x-2 bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
                  >
                    <Scan className="w-5 h-5" />
                    <span>Analyze Nutrition</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </motion.div>

      {/* Analysis Results */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Nutrition Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{analysis.total_calories}</div>
                <div className="text-sm text-gray-600">Total Calories</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {analysis.food_items.reduce((sum, item) => sum + item.protein, 0).toFixed(1)}g
                </div>
                <div className="text-sm text-gray-600">Protein</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analysis.food_items.reduce((sum, item) => sum + item.carbs, 0).toFixed(1)}g
                </div>
                <div className="text-sm text-gray-600">Carbs</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {analysis.food_items.reduce((sum, item) => sum + item.fat, 0).toFixed(1)}g
                </div>
                <div className="text-sm text-gray-600">Fat</div>
              </div>
            </div>
          </div>

          {/* Detected Foods */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Detected Foods</h3>
            <div className="space-y-3">
              {analysis.food_items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-800">{item.name}</h4>
                    <p className="text-sm text-gray-600">
                      {item.calories} cal • {item.protein}g protein • {item.carbs}g carbs • {item.fat}g fat
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      {Math.round(item.confidence * 100)}% confident
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
              AI Suggestions
            </h3>
            <div className="space-y-3">
              {analysis.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-indigo-50 rounded-lg">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                  <p className="text-gray-700">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};