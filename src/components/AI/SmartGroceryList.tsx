import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Check, X, Sparkles, Crown, Lock, Save, Trash2, Edit3, Calendar, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface GroceryItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  checked: boolean;
  fromMealPlan: boolean;
}

interface GroceryCategory {
  name: string;
  items: GroceryItem[];
  color: string;
}

interface SavedGroceryList {
  id: string;
  name: string;
  description: string;
  categories: GroceryCategory[];
  created_at: string;
  updated_at: string;
  total_items: number;
  completed_items: number;
  is_favorite: boolean;
}

export const SmartGroceryList: React.FC = () => {
  const { user } = useAuth();
  const [view, setView] = useState<'saved' | 'current'>('saved');
  const [currentList, setCurrentList] = useState<GroceryCategory[]>([]);
  const [generating, setGenerating] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');

  // TEMPORARILY ALLOW ACCESS FOR TESTING
  const isPremiumUser = true; // user?.subscription_status === 'premium';

  // Mock saved lists
  const [savedLists, setSavedLists] = useState<SavedGroceryList[]>([
    {
      id: '1',
      name: 'Weekly Meal Prep',
      description: 'Ingredients for this week\'s healthy meal prep',
      created_at: '2024-03-01T10:00:00Z',
      updated_at: '2024-03-01T10:00:00Z',
      total_items: 24,
      completed_items: 18,
      is_favorite: true,
      categories: [
        {
          name: 'Proteins',
          color: 'red',
          items: [
            { id: '1', name: 'Chicken Breast', category: 'proteins', quantity: '2 lbs', checked: true, fromMealPlan: true },
            { id: '2', name: 'Greek Yogurt', category: 'proteins', quantity: '2 containers', checked: true, fromMealPlan: true },
            { id: '3', name: 'Eggs', category: 'proteins', quantity: '1 dozen', checked: false, fromMealPlan: true }
          ]
        },
        {
          name: 'Vegetables',
          color: 'green',
          items: [
            { id: '4', name: 'Broccoli', category: 'vegetables', quantity: '2 heads', checked: true, fromMealPlan: true },
            { id: '5', name: 'Spinach', category: 'vegetables', quantity: '1 bag', checked: false, fromMealPlan: true }
          ]
        }
      ]
    },
    {
      id: '2',
      name: 'Keto Shopping List',
      description: 'Low-carb ingredients for ketogenic diet',
      created_at: '2024-02-28T15:30:00Z',
      updated_at: '2024-02-28T15:30:00Z',
      total_items: 18,
      completed_items: 18,
      is_favorite: false,
      categories: [
        {
          name: 'Proteins',
          color: 'red',
          items: [
            { id: '6', name: 'Salmon Fillets', category: 'proteins', quantity: '1 lb', checked: true, fromMealPlan: true },
            { id: '7', name: 'Ground Beef', category: 'proteins', quantity: '2 lbs', checked: true, fromMealPlan: true }
          ]
        },
        {
          name: 'Fats',
          color: 'yellow',
          items: [
            { id: '8', name: 'Avocados', category: 'fats', quantity: '4 pieces', checked: true, fromMealPlan: true },
            { id: '9', name: 'Coconut Oil', category: 'fats', quantity: '1 jar', checked: true, fromMealPlan: true }
          ]
        }
      ]
    },
    {
      id: '3',
      name: 'Quick Breakfast Items',
      description: 'Easy breakfast ingredients for busy mornings',
      created_at: '2024-02-25T08:00:00Z',
      updated_at: '2024-02-25T08:00:00Z',
      total_items: 12,
      completed_items: 5,
      is_favorite: true,
      categories: [
        {
          name: 'Grains',
          color: 'yellow',
          items: [
            { id: '10', name: 'Oatmeal', category: 'grains', quantity: '1 container', checked: true, fromMealPlan: true },
            { id: '11', name: 'Whole Grain Bread', category: 'grains', quantity: '1 loaf', checked: false, fromMealPlan: true }
          ]
        }
      ]
    }
  ]);

  const mockNewGroceryList: GroceryCategory[] = [
    {
      name: 'Proteins',
      color: 'red',
      items: [
        { id: '1', name: 'Chicken Breast', category: 'proteins', quantity: '2 lbs', checked: false, fromMealPlan: true },
        { id: '2', name: 'Greek Yogurt', category: 'proteins', quantity: '2 containers', checked: false, fromMealPlan: true },
        { id: '3', name: 'Eggs', category: 'proteins', quantity: '1 dozen', checked: false, fromMealPlan: true }
      ]
    },
    {
      name: 'Vegetables',
      color: 'green',
      items: [
        { id: '4', name: 'Broccoli', category: 'vegetables', quantity: '2 heads', checked: false, fromMealPlan: true },
        { id: '5', name: 'Spinach', category: 'vegetables', quantity: '1 bag', checked: false, fromMealPlan: true },
        { id: '6', name: 'Bell Peppers', category: 'vegetables', quantity: '3 pieces', checked: false, fromMealPlan: true }
      ]
    },
    {
      name: 'Grains & Carbs',
      color: 'yellow',
      items: [
        { id: '7', name: 'Brown Rice', category: 'grains', quantity: '2 lbs', checked: false, fromMealPlan: true },
        { id: '8', name: 'Quinoa', category: 'grains', quantity: '1 lb', checked: false, fromMealPlan: true },
        { id: '9', name: 'Oats', category: 'grains', quantity: '1 container', checked: false, fromMealPlan: true }
      ]
    },
    {
      name: 'Pantry',
      color: 'purple',
      items: [
        { id: '10', name: 'Olive Oil', category: 'pantry', quantity: '1 bottle', checked: false, fromMealPlan: true },
        { id: '11', name: 'Almond Butter', category: 'pantry', quantity: '1 jar', checked: false, fromMealPlan: true },
        { id: '12', name: 'Coconut Milk', category: 'pantry', quantity: '2 cans', checked: false, fromMealPlan: true }
      ]
    }
  ];

  const generateGroceryList = async () => {
    setGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setCurrentList(mockNewGroceryList);
    setView('current');
    setGenerating(false);
  };

  const saveCurrentList = () => {
    if (!listName.trim()) return;

    const totalItems = currentList.reduce((total, category) => total + category.items.length, 0);
    const completedItems = currentList.reduce((total, category) => 
      total + category.items.filter(item => item.checked).length, 0
    );

    const newList: SavedGroceryList = {
      id: Date.now().toString(),
      name: listName,
      description: listDescription,
      categories: currentList,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      total_items: totalItems,
      completed_items: completedItems,
      is_favorite: false
    };

    setSavedLists(prev => [newList, ...prev]);
    setShowSaveModal(false);
    setListName('');
    setListDescription('');
    setView('saved');
  };

  const loadSavedList = (list: SavedGroceryList) => {
    setCurrentList(list.categories);
    setView('current');
  };

  const deleteSavedList = (listId: string) => {
    setSavedLists(prev => prev.filter(list => list.id !== listId));
  };

  const toggleFavorite = (listId: string) => {
    setSavedLists(prev => 
      prev.map(list => 
        list.id === listId 
          ? { ...list, is_favorite: !list.is_favorite }
          : list
      )
    );
  };

  const toggleItem = (categoryIndex: number, itemIndex: number) => {
    setCurrentList(prev => 
      prev.map((category, cIndex) => 
        cIndex === categoryIndex 
          ? {
              ...category,
              items: category.items.map((item, iIndex) => 
                iIndex === itemIndex 
                  ? { ...item, checked: !item.checked }
                  : item
              )
            }
          : category
      )
    );
  };

  const removeItem = (categoryIndex: number, itemIndex: number) => {
    setCurrentList(prev => 
      prev.map((category, cIndex) => 
        cIndex === categoryIndex 
          ? {
              ...category,
              items: category.items.filter((_, iIndex) => iIndex !== itemIndex)
            }
          : category
      )
    );
  };

  const SaveModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 max-w-md w-full"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Save Grocery List</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">List Name</label>
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="e.g., Weekly Meal Prep"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
            <textarea
              value={listDescription}
              onChange={(e) => setListDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Brief description of this grocery list..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowSaveModal(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={saveCurrentList}
            disabled={!listName.trim()}
            className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            Save List
          </button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold">Smart Grocery Lists</h1>
                  <Crown className="w-8 h-8 text-yellow-300" />
                </div>
                <p className="text-emerald-100">AI-generated and saved shopping lists</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2 text-yellow-300">
                  <Crown className="w-5 h-5" />
                  <span className="font-semibold">Premium Feature</span>
                </div>
              </div>
              <button
                onClick={generateGroceryList}
                disabled={generating}
                className="flex items-center space-x-2 bg-white bg-opacity-20 text-white px-6 py-3 rounded-lg hover:bg-opacity-30 transition-all disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate New List</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8">
        <button
          onClick={() => setView('saved')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all ${
            view === 'saved'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Save className="w-5 h-5" />
          <span className="font-medium">Saved Lists ({savedLists.length})</span>
          <Crown className="w-4 h-4 text-purple-500" />
        </button>
        <button
          onClick={() => setView('current')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all ${
            view === 'current'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="font-medium">Current List</span>
          {currentList.length > 0 && (
            <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">
              {currentList.reduce((total, category) => total + category.items.length, 0)}
            </span>
          )}
          <Crown className="w-4 h-4 text-purple-500" />
        </button>
      </div>

      {/* Saved Lists View */}
      {view === 'saved' && (
        <div className="space-y-6">
          {savedLists.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center"
            >
              <Save className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Saved Lists</h3>
              <p className="text-gray-600 mb-6">
                Generate your first smart grocery list to get started
              </p>
              <button
                onClick={generateGroceryList}
                className="flex items-center space-x-2 bg-emerald-500 text-white px-8 py-3 rounded-lg hover:bg-emerald-600 transition-all mx-auto"
              >
                <Sparkles className="w-5 h-5" />
                <span>Generate First List</span>
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedLists.map((list, index) => (
                <motion.div
                  key={list.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{list.name}</h3>
                        {list.is_favorite && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                        <Crown className="w-4 h-4 text-purple-500" />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{list.description}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => toggleFavorite(list.id)}
                        className={`p-1 rounded transition-colors ${
                          list.is_favorite 
                            ? 'text-yellow-500 hover:text-yellow-600' 
                            : 'text-gray-400 hover:text-yellow-500'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${list.is_favorite ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => deleteSavedList(list.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-800">
                        {list.completed_items}/{list.total_items} items
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${(list.completed_items / list.total_items) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(list.created_at).toLocaleDateString()}</span>
                    </div>
                    <span>{list.categories.length} categories</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => loadSavedList(list)}
                      className="flex-1 bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
                    >
                      Open List
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Current List View */}
      {view === 'current' && (
        <div className="space-y-6">
          {currentList.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center"
            >
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center justify-center space-x-2">
                <span>No Current List</span>
                <Crown className="w-5 h-5 text-purple-500" />
              </h3>
              <p className="text-gray-600 mb-6">
                Generate a new grocery list or load a saved one to get started
              </p>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={generateGroceryList}
                  disabled={generating}
                  className="flex items-center space-x-2 bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition-all disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate New List</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setView('saved')}
                  className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-all"
                >
                  <Save className="w-5 h-5" />
                  <span>Load Saved List</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Current List Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                      <span>Current Shopping List</span>
                      <Crown className="w-5 h-5 text-purple-500" />
                    </h3>
                    <p className="text-gray-600">
                      {currentList.reduce((total, category) => total + category.items.length, 0)} items • 
                      {currentList.reduce((total, category) => total + category.items.filter(item => item.checked).length, 0)} completed
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setShowSaveModal(true)}
                      className="flex items-center space-x-2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save List</span>
                    </button>
                    <button
                      onClick={generateGroceryList}
                      className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Regenerate</span>
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Grocery Categories */}
              {currentList.map((category, categoryIndex) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: categoryIndex * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <div className={`w-4 h-4 bg-${category.color}-500 rounded-full mr-3`}></div>
                    {category.name}
                    <span className="ml-2 text-sm text-gray-500">
                      ({category.items.filter(item => !item.checked).length} remaining)
                    </span>
                    <Crown className="w-4 h-4 ml-2 text-purple-500" />
                  </h3>

                  <div className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                          item.checked 
                            ? 'bg-gray-50 opacity-60' 
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleItem(categoryIndex, itemIndex)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                              item.checked
                                ? `bg-${category.color}-500 border-${category.color}-500`
                                : `border-gray-300 hover:border-${category.color}-400`
                            }`}
                          >
                            {item.checked && <Check className="w-3 h-3 text-white" />}
                          </button>
                          <div>
                            <p className={`font-medium ${item.checked ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-600">{item.quantity}</p>
                          </div>
                          {item.fromMealPlan && (
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                              From meal plan
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(categoryIndex, itemIndex)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Save Modal */}
      <AnimatePresence>
        {showSaveModal && <SaveModal />}
      </AnimatePresence>
    </div>
  );
};