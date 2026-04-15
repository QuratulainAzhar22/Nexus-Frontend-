import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '../ui/Avatar';

interface ChatMessageProps {
  message: {
    id: number;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: string;
    isRead: boolean;
    sender?: {
      id: string;
      name: string;
      email: string;
      avatarUrl: string;
      role: string;
    };
    receiver?: {
      id: string;
      name: string;
      email: string;
      avatarUrl: string;
      role: string;
    };
  };
  isCurrentUser: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isCurrentUser }) => {
  // Get user data from the message object (from API)
  const user = isCurrentUser ? message.sender : message.receiver;
  
  if (!user) {
    // Fallback if user data is not available
    return (
      <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className="max-w-xs sm:max-w-md px-4 py-2 rounded-lg bg-gray-100 text-gray-800">
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}
    >
      {!isCurrentUser && (
        <Avatar
          src={user.avatarUrl}
          alt={user.name}
          size="sm"
          className="mr-2 self-end"
        />
      )}
      
      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`max-w-xs sm:max-w-md px-4 py-2 rounded-lg ${
            isCurrentUser
              ? 'bg-primary-600 text-white rounded-br-none'
              : 'bg-gray-100 text-gray-800 rounded-bl-none'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        
        <span className="text-xs text-gray-500 mt-1">
          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
        </span>
      </div>
      
      {isCurrentUser && (
        <Avatar
          src={user.avatarUrl}
          alt={user.name}
          size="sm"
          className="ml-2 self-end"
        />
      )}
    </div>
  );
};