import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Utensils, 
  Clock, 
  Flame, 
  Target,
  Save,
  Trash2,
  Edit3,
  Star,
  CheckCircle,
  X,
  ArrowLeft,
  Info
} from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay, isToday } from 'date-fns';

interface MealItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  portion: string;
  image?: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  isTracked?: boolean;
  isFavorite?: boolean;
}

interface DayPlan {
  date: Date;
  meals: {
    breakfast: MealItem[];
    lunch: MealItem[];
    dinner: MealItem[];
    snack: MealItem[];
  };
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const SAMPLE_MEALS: MealItem[] = [
  {
    id: '1',
    name: 'Meat Lasagna (Kirkland)',
    calories: 340,
    protein: 17,
    carbs: 29,
    fat: 20,
    fiber: 2,
    sugar: 8,
    portion: '1 portion (240g)',
    category: 'lunch',
    isTracked: true,
    isFavorite: true
  },
  {
    id: '2',
    name: 'Spaghetti mit Fleischsauce',
    calories: 255,
    protein: 12,
    carbs: 35,
    fat: 8,
    portion: '1/2 portion (200g)',
    category: 'dinner',
    isTracked: true
  },
  {
    id: '3',
    name: 'Greek Yogurt with Berries',
    calories: 150,
    protein: 15,
    carbs: 20,
    fat: 2,
    portion: '1 cup',
    category: 'breakfast'
  },
  {
    id: '4',
    name: 'Grilled Chicken Breast',
    calories: 185,
    protein: 35,
    carbs: 0,
    fat: 4,
    portion: '100g',
    category: 'lunch'
  },
  {
    id: '5',
    name: 'Avocado Toast',
    calories: 280,
    protein: 8,
    carbs: 30,
    fat: 18,
    fiber: 12,
    portion: '2 slices',
    category: 'breakfast'
  }
];

export const MealPlanner: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'calendar' | 'day' | 'meal-detail'>('calendar');
  const [selectedMeal, setSelectedMeal] = useState<MealItem | null>(null);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack'>('all');
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [dayPlans, setDayPlans] = useState<Map<string, DayPlan>>(new Map());

  const nutritionGoals: NutritionGoals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 67
  };

  // Initialize sample data
  useEffect(() => {
    const today = new Date();
    const todayKey = format(today, 'yyyy-MM-dd');
    
    const sampleDayPlan: DayPlan = {
      date: today,
      meals: {
        breakfast: [SAMPLE_MEALS[2], SAMPLE_MEALS[4]],
        lunch: [SAMPLE_MEALS[0]],
        dinner: [SAMPLE_MEALS[1]],
        snack: []
      },
      totalCalories: 1025,
      totalProtein: 52,
      totalCarbs: 114,
      totalFat: 52
    };

    setDayPlans(new Map([[todayKey, sampleDayPlan]]));
  }, []);

  const getDayPlan = (date: Date): DayPlan => {
    const key = format(date, 'yyyy-MM-dd');
    return dayPlans.get(key) || {
      date,
      meals: { breakfast: [], lunch: [], dinner: [], snack: [] },
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0
    };
  };

  const getWeekDays = () => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  };

  const addMealToDay = (date: Date, meal: MealItem, category: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    const key = format(date, 'yyyy-MM-dd');
    const currentPlan = getDayPlan(date);
    
    const updatedPlan = {
      ...currentPlan,
      meals: {
        ...currentPlan.meals,
        [category]: [...currentPlan.meals[category], meal]
      }
    };

    // Recalculate totals
    const allMeals = Object.values(updatedPlan.meals).flat();
    updatedPlan.totalCalories = allMeals.reduce((sum, m) => sum + m.calories, 0);
    updatedPlan.totalProtein = allMeals.reduce((sum, m) => sum + m.protein, 0);
    updatedPlan.totalCarbs = allMeals.reduce((sum, m) => sum + m.carbs, 0);
    updatedPlan.totalFat = allMeals.reduce((sum, m) => sum + m.fat, 0);

    setDayPlans(new Map(dayPlans.set(key, updatedPlan)));
  };

  const removeMealFromDay = (date: Date, mealId: string, category: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    const key = format(date, 'yyyy-MM-dd');
    const currentPlan = getDayPlan(date);
    
    const updatedPlan = {
      ...currentPlan,
      meals: {
        ...currentPlan.meals,
        [category]: currentPlan.meals[category].filter(m => m.id !== mealId)
      }
    };

    // Recalculate totals
    const allMeals = Object.values(updatedPlan.meals).flat();
    updatedPlan.totalCalories = allMeals.reduce((sum, m) => sum + m.calories, 0);
    updatedPlan.totalProtein = allMeals.reduce((sum, m) => sum + m.protein, 0);
    updatedPlan.totalCarbs = allMeals.reduce((sum, m) => sum + m.carbs, 0);
    updatedPlan.totalFat = allMeals.reduce((sum, m) => sum + m.fat, 0);

    setDayPlans(new Map(dayPlans.set(key, updatedPlan)));
  };

  const filteredMeals = SAMPLE_MEALS.filter(meal => {
    const matchesSearch = meal.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || meal.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const CalendarView = () => (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">
            {format(weekStart, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => setWeekStart(addDays(weekStart, 7))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <button
          onClick={() => setWeekStart(startOfWeek(new Date()))}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Today
        </button>
      </div>

      {/* Week Calendar */}
      <div className="grid grid-cols-7 gap-4">
        {getWeekDays().map((day, index) => {
          const dayPlan = getDayPlan(day);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : isCurrentDay
                  ? 'border-blue-300 bg-blue-25'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => {
                setSelectedDate(day);
                setView('day');
              }}
            >
              <div className="text-center mb-3">
                <div className="text-sm text-gray-600 font-medium">
                  {format(day, 'EEE')}
                </div>
                <div className={`text-lg font-bold ${
                  isCurrentDay ? 'text-blue-600' : 'text-gray-800'
                }`}>
                  {format(day, 'd')}
                </div>
              </div>

              {/* Daily Summary */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Calories</span>
                  <span className="font-medium">{dayPlan.totalCalories}</span>
                </div>
                
                {/* Progress Ring */}
                <div className="relative w-12 h-12 mx-auto">
                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeDasharray={`${(dayPlan.totalCalories / nutritionGoals.calories) * 100}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-700">
                      {Math.round((dayPlan.totalCalories / nutritionGoals.calories) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Meal Indicators */}
                <div className="flex justify-center space-x-1">
                  {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => (
                    <div
                      key={mealType}
                      className={`w-2 h-2 rounded-full ${
                        dayPlan.meals[mealType as keyof typeof dayPlan.meals].length > 0
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const DayView = () => {
    const dayPlan = getDayPlan(selectedDate);
    
    return (
      <div className="space-y-6">
        {/* Day Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setView('calendar')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {format(selectedDate, 'EEEE, MMMM d')}
              </h2>
              <p className="text-gray-600">Daily Meal Plan</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddMeal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Meal</span>
            </button>
          </div>
        </div>

        {/* Daily Progress Ring */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeDasharray={`${Math.min((dayPlan.totalCalories / nutritionGoals.calories) * 100, 100)}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-800">{dayPlan.totalCalories}</span>
                  <span className="text-sm text-gray-600">kcal left</span>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">CARBS</div>
                  <div className="text-lg font-bold text-gray-800">{dayPlan.totalCarbs}g</div>
                  <div className="text-xs text-gray-500">{Math.round((dayPlan.totalCarbs / nutritionGoals.carbs) * 100)}%</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">PROTEIN</div>
                  <div className="text-lg font-bold text-gray-800">{dayPlan.totalProtein}g</div>
                  <div className="text-xs text-gray-500">{Math.round((dayPlan.totalProtein / nutritionGoals.protein) * 100)}%</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">FAT</div>
                  <div className="text-lg font-bold text-gray-800">{dayPlan.totalFat}g</div>
                  <div className="text-xs text-gray-500">{Math.round((dayPlan.totalFat / nutritionGoals.fat) * 100)}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Planned Meals */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Planned Meals</h3>
          
          <div className="space-y-6">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((mealType) => (
              <div key={mealType} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Utensils className="w-4 h-4 text-blue-600" />
                    </div>
                    <h4 className="font-medium text-gray-800 capitalize">{mealType}</h4>
                  </div>
                  <button
                    onClick={() => setShowAddMeal(true)}
                    className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  {dayPlan.meals[mealType].map((meal) => (
                    <div
                      key={meal.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedMeal(meal);
                        setView('meal-detail');
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-gray-800">{meal.name}</p>
                          <p className="text-sm text-gray-600">{meal.portion}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-700">{meal.calories} kcal</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMealFromDay(selectedDate, meal.id, mealType);
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {dayPlan.meals[mealType].length === 0 && (
                    <p className="text-gray-500 text-sm italic">No meals planned</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const MealDetailView = () => {
    if (!selectedMeal) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setView('day')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Edit3 className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Star className={`w-5 h-5 ${selectedMeal.isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>

        {/* Meal Info */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-2xl font-bold">{selectedMeal.name}</h1>
            {selectedMeal.isFavorite && (
              <Star className="w-6 h-6 text-yellow-300 fill-current" />
            )}
          </div>
          <p className="text-blue-100">Very healthy</p>
          <div className="mt-4 flex items-center space-x-4 text-sm">
            <span>No of serving: Starting with</span>
            <div className="flex items-center space-x-2">
              <button className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">-</span>
              </button>
              <span className="font-bold">1</span>
              <button className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">+</span>
              </button>
            </div>
            <span>{selectedMeal.portion}</span>
          </div>
        </div>

        {/* Nutrition Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Info className="w-5 h-5 mr-2 text-blue-500" />
            Nutrition Information
          </h3>

          {/* Calories Circle */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeDasharray="75, 100"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-gray-800">{selectedMeal.calories}</span>
                <span className="text-xs text-gray-600">kcal</span>
              </div>
            </div>

            <div className="flex-1 ml-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Protein</span>
                <span className="font-medium">{selectedMeal.protein}g</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Carbs</span>
                <span className="font-medium">{selectedMeal.carbs}g</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Fat</span>
                <span className="font-medium">{selectedMeal.fat}g</span>
              </div>
              {selectedMeal.fiber && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Fiber</span>
                  <span className="font-medium">{selectedMeal.fiber}g</span>
                </div>
              )}
              {selectedMeal.sugar && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Sugar</span>
                  <span className="font-medium">{selectedMeal.sugar}g</span>
                </div>
              )}
            </div>
          </div>

          {/* Macronutrient Breakdown */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Protein</div>
              <div className="text-lg font-bold text-green-700">{Math.round((selectedMeal.protein * 4 / selectedMeal.calories) * 100)}%</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Carbs</div>
              <div className="text-lg font-bold text-blue-700">{Math.round((selectedMeal.carbs * 4 / selectedMeal.calories) * 100)}%</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-sm text-orange-600 font-medium">Fat</div>
              <div className="text-lg font-bold text-orange-700">{Math.round((selectedMeal.fat * 9 / selectedMeal.calories) * 100)}%</div>
            </div>
          </div>

          <button className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium">
            Save
          </button>
        </div>
      </div>
    );
  };

  const AddMealModal = () => (
    <AnimatePresence>
      {showAddMeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Add Meal</h3>
              <button
                onClick={() => setShowAddMeal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search and Filter */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search food or meals"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-2">
                {['all', 'breakfast', 'lunch', 'dinner', 'snack'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Meal List */}
            <div className="space-y-3">
              {filteredMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      meal.isTracked ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <div>
                      <h4 className="font-medium text-gray-800">{meal.name}</h4>
                      <p className="text-sm text-gray-600">{meal.portion} • {meal.calories} kcal</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {meal.isFavorite && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                    <button
                      onClick={() => {
                        addMealToDay(selectedDate, meal, meal.category);
                        setShowAddMeal(false);
                      }}
                      className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-8 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Meal Planner</h1>
              <p className="text-blue-100">Plan your daily nutrition and track your goals</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {view === 'calendar' && <CalendarView />}
          {view === 'day' && <DayView />}
          {view === 'meal-detail' && <MealDetailView />}
        </motion.div>
      </AnimatePresence>

      {/* Add Meal Modal */}
      <AddMealModal />
    </div>
  );
};