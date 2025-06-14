import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Video, Volume2, FileText, Utensils, Sparkles, Brain, Target, MessageSquare, Plus, Trash2, Edit3 } from 'lucide-react';
import type { Message, Conversation, UserProfile } from '../../types';
import { MessageBubble } from './MessageBubble';
import { VideoPlayer } from './VideoPlayer';
import { AudioPlayer } from './AudioPlayer';
import { MealPlanDisplay } from './MealPlanDisplay';
import { RecipeDisplay } from './RecipeDisplay';
import { geminiService } from '../../services/gemini';

interface ChatInterfaceProps {
  conversation: Conversation | null;
  conversations: Conversation[];
  onConversationSelect: (conversation: Conversation) => void;
  onNewConversation: () => void;
  onDeleteConversation?: (conversationId: string) => void;
  userProfile?: UserProfile | null;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  conversation, 
  conversations,
  onConversationSelect,
  onNewConversation,
  onDeleteConversation,
  userProfile
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock initial message
  const initialMessage: Message = {
    id: '1',
    conversation_id: conversation?.id || 'default',
    role: 'assistant',
    content: `Hello${userProfile?.name ? ` ${userProfile.name}` : ''}! 👋 I'm your AI Health Coach, powered by Google Gemini 2.5 Flash. I'm here to help you with personalized nutrition advice, meal planning, healthy recipes, and lifestyle guidance. 

${userProfile ? `I can see you're focused on ${userProfile.health_goals?.join(', ') || 'your health goals'}. ` : ''}What would you like to work on today?`,
    message_type: 'text',
    created_at: new Date(Date.now() - 300000).toISOString()
  };

  useEffect(() => {
    if (conversation) {
      // Load messages for this conversation (in a real app, this would come from the database)
      setMessages([initialMessage]);
    } else {
      setMessages([]);
    }
  }, [conversation?.id, userProfile]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        conversation_id: conversation?.id || 'default',
        role: 'user',
        content: messageText,
        message_type: 'text',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);

      // Get conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Generate AI response using Gemini
      const aiResponse = await geminiService.generateResponse(
        messageText,
        conversationHistory,
        userProfile || undefined
      );

      // Add AI response to messages
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        conversation_id: conversation?.id || 'default',
        role: 'assistant',
        content: aiResponse,
        message_type: 'text',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      // Show error message to user
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        conversation_id: conversation?.id || 'default',
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your message. Please try again.',
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
    { 
      icon: <Utensils className="w-4 h-4" />, 
      text: "Create a meal plan for me", 
      borderColor: "border-emerald-200",
      bgColor: "bg-emerald-50",
      hoverBgColor: "hover:bg-emerald-100",
      iconColor: "text-emerald-600",
      textColor: "text-emerald-800"
    },
    { 
      icon: <Target className="w-4 h-4" />, 
      text: "Help me lose weight", 
      borderColor: "border-blue-200",
      bgColor: "bg-blue-50",
      hoverBgColor: "hover:bg-blue-100",
      iconColor: "text-blue-600",
      textColor: "text-blue-800"
    },
    { 
      icon: <Brain className="w-4 h-4" />, 
      text: "Suggest healthy recipes", 
      borderColor: "border-purple-200",
      bgColor: "bg-purple-50",
      hoverBgColor: "hover:bg-purple-100",
      iconColor: "text-purple-600",
      textColor: "text-purple-800"
    },
    { 
      icon: <Sparkles className="w-4 h-4" />, 
      text: "Improve my energy levels", 
      borderColor: "border-orange-200",
      bgColor: "bg-orange-50",
      hoverBgColor: "hover:bg-orange-100",
      iconColor: "text-orange-600",
      textColor: "text-orange-800"
    }
  ];

  return (
    <div className="flex h-full bg-white">
      {/* Conversation History Sidebar */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
        {/* Header - Fixed */}
        <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-sky-500" />
              Conversations
            </h2>
            <button
              onClick={onNewConversation}
              className="w-8 h-8 bg-sky-500 text-white rounded-full flex items-center justify-center hover:bg-sky-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={onNewConversation}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-sky-500 to-emerald-500 text-white rounded-lg hover:from-sky-600 hover:to-emerald-600 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Conversations List - Scrollable with Fixed Height */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full overflow-y-auto p-4 space-y-2">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No conversations yet</p>
                <p className="text-sm">Start a new chat to begin!</p>
              </div>
            ) : (
              <AnimatePresence>
                {conversations.map((conv) => (
                  <motion.div
                    key={conv.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                      conversation?.id === conv.id
                        ? 'bg-sky-50 border border-sky-200'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => onConversationSelect(conv)}
                  >
                    <div className="flex items-start space-x-3">
                      <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {conv.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {conv.message_count} messages
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(conv.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle edit conversation title
                        }}
                        className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
                      >
                        <Edit3 className="w-3 h-3 text-gray-500" />
                      </button>
                      {onDeleteConversation && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conv.id);
                          }}
                          className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-sky-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {conversation?.title || 'HealthCoach AI'}
              </h2>
              <p className="text-sm text-gray-600 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Powered by Google Gemini 2.5 Flash
              </p>
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
                    className={`p-3 rounded-lg border-2 ${prompt.borderColor} ${prompt.bgColor} ${prompt.hoverBgColor} transition-all text-left group`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`${prompt.iconColor} group-hover:scale-110 transition-transform`}>
                        {prompt.icon}
                      </div>
                      <span className={`text-sm font-medium ${prompt.textColor}`}>
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
    </div>
  );
};