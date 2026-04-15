import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { messageService, Conversation } from '../../services/messageService';
import { Avatar } from '../../components/ui/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle } from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);
  
  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await messageService.getConversations();
      setConversations(data);
    } catch (error: any) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectConversation = (userId: string) => {
    navigate(`/chat/${userId}`);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!user) return null;
  
  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
      {conversations.length > 0 ? (
        <div className="divide-y divide-gray-200">
          {conversations.map(conversation => {
            const otherUser = conversation.otherParticipant;
            if (!otherUser) return null;
            
            const lastMessage = conversation.lastMessage;
            const isFromCurrentUser = lastMessage?.senderId === user.id;
            
            return (
              <div
                key={conversation.id}
                className="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                onClick={() => handleSelectConversation(otherUser.id)}
              >
                <Avatar
                  src={otherUser.avatarUrl}
                  alt={otherUser.name}
                  size="lg"
                  status={otherUser.isOnline ? 'online' : 'offline'}
                  className="mr-4 flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-md font-semibold text-gray-900 truncate">
                      {otherUser.name}
                    </h3>
                    {lastMessage && (
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mt-1">
                    {lastMessage && (
                      <p className="text-sm text-gray-600 truncate">
                        {isFromCurrentUser && 'You: '}
                        {lastMessage.content}
                      </p>
                    )}
                    {!lastMessage && (
                      <p className="text-sm text-gray-400">No messages yet</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center p-8">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            <MessageCircle size={48} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-medium text-gray-900">No messages yet</h2>
          <p className="text-gray-500 text-center mt-2">
            Start connecting with entrepreneurs and investors to begin conversations
          </p>
        </div>
      )}
    </div>
  );
};