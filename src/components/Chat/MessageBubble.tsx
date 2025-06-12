import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import { format } from 'date-fns';
import type { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isUser, 
  icon, 
  children 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-gradient-to-r from-sky-500 to-emerald-500' 
          : 'bg-gradient-to-r from-purple-500 to-pink-500'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[calc(100%-3rem)]`}>
        <div className={`rounded-2xl px-4 py-3 ${
          isUser 
            ? 'bg-gradient-to-r from-sky-500 to-emerald-500 text-white' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {icon && !isUser && (
            <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-gray-200">
              <div className="text-sky-500">{icon}</div>
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                {message.message_type.replace('_', ' ')}
              </span>
            </div>
          )}
          {children}
        </div>
        
        {/* Timestamp */}
        <p className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {format(new Date(message.created_at), 'h:mm a')}
        </p>
      </div>
    </motion.div>
  );
};