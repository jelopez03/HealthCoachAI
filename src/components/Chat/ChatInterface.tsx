import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Video, Volume2, FileText, Utensils, Sparkles, Brain, Target } from 'lucide-react';
import type { Message, Conversation } from '../../types';
import { MessageBubble } from './MessageBubble';
import { VideoPlayer } from './VideoPlayer';
import { AudioPlayer } from './AudioPlayer';
import { MealPlanDisplay } from './MealPlanDisplay';
import { RecipeDisplay } from './RecipeDisplay';

interface ChatInterfaceProps {
  conversation: Conversation;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ conversation }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock messages for demo
  const mockMessages: Message[] = [
    {
      id: '1',
      conversation_id: conversation.id,
      role: 'assistant',
      content: "Hello! I'm your AI Health Coach. I'm here to help you with personalized nutrition advice, meal planning, and healthy lifestyle guidance. What would you like to work on today?",
      message_type: 'text',
      created_at: new Date(Date.now() - 300000).toISOString() // 5 minutes ago
    }
  ];

  useEffect(() => {
    // Load mock messages for demo
    setMessages(mockMessages);
  }, [conversation.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateMockResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Determine response type and content based on user input
    if (lowerMessage.includes('meal plan') || lowerMessage.includes('diet plan')) {
      return {
        id: Date.now().toString(),
        conversation_id: conversation.id,
        role: 'assistant',
        content: "I've created a personalized 3-day meal plan based on your goals and preferences. This plan focuses on balanced nutrition with approximately 1,800 calories per day.",
        message_type: 'meal_plan',
        metadata: {
          meal_plan: {
            id: 'mock-meal-plan',
            title: 'Balanced Weight Loss Plan',
            description: 'A 3-day meal plan designed for sustainable weight loss with vegetarian options',
            calories_per_day: 1800,
            days: [
              {
                day: 'Monday',
                total_calories: 1820,
                meals: [
                  {
                    type: 'breakfast',
                    name: 'Greek Yogurt Berry Bowl',
                    calories: 350,
                    ingredients: ['Greek yogurt', 'Mixed berries', 'Granola', 'Honey', 'Chia seeds'],
                    instructions: 'Layer yogurt with berries and granola, drizzle with honey and sprinkle chia seeds'
                  },
                  {
                    type: 'lunch',
                    name: 'Quinoa Buddha Bowl',
                    calories: 520,
                    ingredients: ['Quinoa', 'Roasted vegetables', 'Chickpeas', 'Avocado', 'Tahini dressing'],
                    instructions: 'Combine cooked quinoa with roasted vegetables and chickpeas, top with avocado and tahini dressing'
                  },
                  {
                    type: 'dinner',
                    name: 'Lentil Curry with Brown Rice',
                    calories: 480,
                    ingredients: ['Red lentils', 'Coconut milk', 'Spinach', 'Brown rice', 'Indian spices'],
                    instructions: 'Cook lentils with coconut milk and spices, add spinach, serve over brown rice'
                  },
                  {
                    type: 'snack',
                    name: 'Apple with Almond Butter',
                    calories: 200,
                    ingredients: ['Apple', 'Almond butter'],
                    instructions: 'Slice apple and serve with 2 tbsp almond butter'
                  }
                ]
              }
            ],
            created_at: new Date().toISOString()
          }
        },
        created_at: new Date().toISOString()
      };
    } else if (lowerMessage.includes('recipe') || lowerMessage.includes('cook')) {
      return {
        id: Date.now().toString(),
        conversation_id: conversation.id,
        role: 'assistant',
        content: "Here's a delicious and healthy recipe that fits your dietary preferences perfectly!",
        message_type: 'recipe',
        metadata: {
          recipe: {
            id: 'mock-recipe',
            name: 'Mediterranean Chickpea Salad',
            description: 'A fresh, protein-packed salad perfect for lunch or dinner',
            ingredients: [
              { name: 'Chickpeas', amount: '2', unit: 'cups' },
              { name: 'Cucumber', amount: '1', unit: 'large' },
              { name: 'Cherry tomatoes', amount: '1', unit: 'cup' },
              { name: 'Red onion', amount: '1/4', unit: 'cup' },
              { name: 'Feta cheese', amount: '1/2', unit: 'cup' },
              { name: 'Olive oil', amount: '3', unit: 'tbsp' },
              { name: 'Lemon juice', amount: '2', unit: 'tbsp' },
              { name: 'Fresh herbs', amount: '1/4', unit: 'cup' }
            ],
            instructions: [
              'Drain and rinse the chickpeas',
              'Dice the cucumber and halve the cherry tomatoes',
              'Thinly slice the red onion',
              'Combine all vegetables and chickpeas in a large bowl',
              'Whisk together olive oil, lemon juice, salt, and pepper',
              'Pour dressing over salad and toss well',
              'Add crumbled feta and fresh herbs',
              'Let marinate for 15 minutes before serving'
            ],
            prep_time: 15,
            cook_time: 0,
            servings: 4,
            calories_per_serving: 280,
            difficulty: 'easy',
            tags: ['vegetarian', 'mediterranean', 'high-protein', 'quick'],
            created_at: new Date().toISOString()
          }
        },
        created_at: new Date().toISOString()
      };
    } else if (lowerMessage.includes('video') || lowerMessage.includes('exercise') || lowerMessage.includes('workout')) {
      return {
        id: Date.now().toString(),
        conversation_id: conversation.id,
        role: 'assistant',
        content: "I've prepared a personalized video guide for you! This 10-minute routine is perfect for your fitness level and goals.",
        message_type: 'video',
        metadata: {
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        },
        created_at: new Date().toISOString()
      };
    } else if (lowerMessage.includes('audio') || lowerMessage.includes('meditation') || lowerMessage.includes('relax')) {
      return {
        id: Date.now().toString(),
        conversation_id: conversation.id,
        role: 'assistant',
        content: "Here's a guided meditation to help you relax and focus on your wellness journey. Take a few minutes to center yourself.",
        message_type: 'audio',
        metadata: {
          audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
        },
        created_at: new Date().toISOString()
      };
    } else {
      // Generate contextual text responses
      const responses = [
        "That's a great question! Based on your profile, I'd recommend focusing on balanced nutrition with plenty of vegetables and lean proteins. What specific aspect would you like to explore further?",
        "I understand your concern. Let's work together to create a sustainable approach that fits your lifestyle. Can you tell me more about your current eating habits?",
        "Excellent! Your commitment to health is inspiring. Here are some personalized suggestions based on your goals and preferences...",
        "That's a common challenge many people face. The key is to start small and build sustainable habits. Would you like me to create a step-by-step plan for you?",
        "Based on your dietary preferences and health goals, I have some tailored recommendations. Let's break this down into manageable steps.",
        "I'm here to support you on your health journey! Your progress so far has been fantastic. What would you like to focus on next?"
      ];
      
      return {
        id: Date.now().toString(),
        conversation_id: conversation.id,
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        message_type: 'text',
        created_at: new Date().toISOString()
      };
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    setLoading(true);
    setIsTyping(true);

    try {
      // Add user message to UI immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        conversation_id: conversation.id,
        role: 'user',
        content: messageText,
        message_type: 'text',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);

      // Simulate AI thinking time
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

      // Generate mock response for demo
      const aiMessage = generateMockResponse(messageText);
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      // Show error message to user
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        conversation_id: conversation.id,
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        message_type: 'text',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const renderMessageContent = (message: Message) => {
    switch (message.message_type) {
      case 'video':
        return (
          <div className="space-y-3">
            <p className="text-gray-800">{message.content}</p>
            {message.metadata?.video_url && (
              <VideoPlayer url={message.metadata.video_url} />
            )}
          </div>
        );

      case 'audio':
        return (
          <div className="space-y-3">
            <p className="text-gray-800">{message.content}</p>
            {message.metadata?.audio_url && (
              <AudioPlayer url={message.metadata.audio_url} />
            )}
          </div>
        );

      case 'meal_plan':
        return (
          <div className="space-y-3">
            <p className="text-gray-800">{message.content}</p>
            {message.metadata?.meal_plan && (
              <MealPlanDisplay mealPlan={message.metadata.meal_plan} />
            )}
          </div>
        );

      case 'recipe':
        return (
          <div className="space-y-3">
            <p className="text-gray-800">{message.content}</p>
            {message.metadata?.recipe && (
              <RecipeDisplay recipe={message.metadata.recipe} />
            )}
          </div>
        );

      default:
        return <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>;
    }
  };

  const getMessageIcon = (messageType: Message['message_type']) => {
    switch (messageType) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'audio':
        return <Volume2 className="w-4 h-4" />;
      case 'meal_plan':
        return <FileText className="w-4 h-4" />;
      case 'recipe':
        return <Utensils className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const quickPrompts = [
    { icon: <Utensils className="w-4 h-4" />, text: "Create a meal plan for me", color: "emerald" },
    { icon: <Target className="w-4 h-4" />, text: "Help me lose weight", color: "blue" },
    { icon: <Brain className="w-4 h-4" />, text: "Suggest healthy recipes", color: "purple" },
    { icon: <Sparkles className="w-4 h-4" />, text: "Improve my energy levels", color: "orange" }
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-sky-50 to-emerald-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{conversation.title}</h2>
            <p className="text-sm text-gray-600">AI Health Coach • Demo Mode</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* Quick prompts for empty conversation */}
        {messages.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <p className="text-center text-gray-600 mb-4">Try asking me about:</p>
            <div className="grid grid-cols-2 gap-3">
              {quickPrompts.map((prompt, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setInputMessage(prompt.text)}
                  className={`p-3 rounded-lg border-2 border-${prompt.color}-200 bg-${prompt.color}-50 hover:bg-${prompt.color}-100 transition-all text-left group`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`text-${prompt.color}-600 group-hover:scale-110 transition-transform`}>
                      {prompt.icon}
                    </div>
                    <span className={`text-sm font-medium text-${prompt.color}-800`}>
                      {prompt.text}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                <MessageBubble
                  message={message}
                  isUser={message.role === 'user'}
                  icon={message.role === 'assistant' ? getMessageIcon(message.message_type) : undefined}
                >
                  {renderMessageContent(message)}
                </MessageBubble>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[70%]">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Ask me about nutrition, meal planning, recipes, or health goals..."
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-sky-500 to-emerald-500 text-white rounded-full hover:from-sky-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
};