import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Video, Info, Smile, MessageCircle, ArrowLeft } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ChatMessage } from '../../components/chat/ChatMessage';
import { ChatUserList } from '../../components/chat/ChatUserList';
import { useAuth } from '../../context/AuthContext';
import { useSignalR } from '../../context/SignalRContext';
import { messageService, Message, Conversation } from '../../services/messageService';
import { userService } from '../../services/userService';
import { User } from '../../services/authService';
import toast from 'react-hot-toast';

export const ChatPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { sendCallOffer } = useSignalR();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chatPartner, setChatPartner] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(!userId); // Show sidebar if no chat selected

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (currentUser) loadConversations();
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && userId) {
      setShowSidebar(false); // Hide sidebar when chat is selected
      loadMessages(userId);
      loadChatPartner(userId);
    } else {
      setShowSidebar(true); // Show sidebar when no chat selected
    }
  }, [currentUser, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      const data = await messageService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadMessages = async (partnerId: string) => {
    try {
      setLoading(true);
      const data = await messageService.getMessagesWithUser(partnerId);
      setMessages(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const loadChatPartner = async (partnerId: string) => {
    try {
      const u = await userService.getInvestorById(partnerId);
      setChatPartner(u);
    } catch {
      try {
        const u = await userService.getEntrepreneurById(partnerId);
        setChatPartner(u);
      } catch (error) {
        console.error('Failed to load chat partner:', error);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !userId) return;
    const content = newMessage;
    setNewMessage('');
    setSending(true);
    try {
      const sent = await messageService.sendMessage(userId, content);
      setMessages((prev) => [...prev, sent]);
      loadConversations();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  };

  const handleVideoCall = async () => {
    if (!currentUser || !chatPartner) return;

    const ids = [currentUser.id.slice(0, 8), chatPartner.id.slice(0, 8)].sort();
    const roomName = `nexus-${ids[0]}-${ids[1]}`;
    
    await sendCallOffer(chatPartner.id, currentUser.name, roomName);
    window.open(`https://meet.jit.si/${roomName}#config.disableDeepLinking=true`, '_blank');
  };

  const handleBackToConversations = () => {
    setShowSidebar(true);
    navigate('/chat');
  };

  if (!currentUser) return null;

  if (loading && userId) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Desktop: Side-by-side layout */}
      <div className="hidden md:flex h-full">
        {/* Sidebar - Conversation List */}
        <div className="w-80 border-r border-gray-200 flex-shrink-0 overflow-y-auto">
          <ChatUserList conversations={conversations as any} />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {chatPartner ? (
            <>
              <div className="border-b border-gray-200 p-4 flex justify-between items-center flex-shrink-0 bg-white">
                <div className="flex items-center">
                  <Avatar
                    src={chatPartner.avatarUrl}
                    alt={chatPartner.name}
                    size="md"
                    status={chatPartner.isOnline ? 'online' : 'offline'}
                    className="mr-3"
                  />
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">{chatPartner.name}</h2>
                    <p className="text-sm text-gray-500">
                      {chatPartner.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" className="rounded-full p-2" onClick={handleVideoCall}>
                    <Video size={18} />
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-full p-2">
                    <Info size={18} />
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <ChatMessage
                        key={message.id}
                        message={message as any}
                        isCurrentUser={message.senderId === currentUser.id}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center">
                    <div className="bg-gray-100 p-4 rounded-full mb-4">
                      <MessageCircle size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700">No messages yet</h3>
                    <p className="text-gray-500 mt-1">Send a message to start the conversation</p>
                  </div>
                )}
              </div>
              <div className="border-t border-gray-200 p-4 flex-shrink-0 bg-white">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Button type="button" variant="ghost" size="sm" className="rounded-full p-2">
                    <Smile size={20} />
                  </Button>
                  <Input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    fullWidth
                    className="flex-1"
                  />
                  <Button type="submit" size="sm" disabled={!newMessage.trim() || sending} className="rounded-full p-2 w-10 h-10">
                    <Send size={18} />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-4">
              <div className="bg-gray-100 p-6 rounded-full mb-4">
                <MessageCircle size={48} className="text-gray-400" />
              </div>
              <h2 className="text-xl font-medium text-gray-700">Select a conversation</h2>
              <p className="text-gray-500 mt-2 text-center">Choose a contact from the list to start chatting</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Show either sidebar OR chat area, not both */}
      <div className="md:hidden h-full">
        {/* Mobile: Conversation List (shown when no chat selected) */}
        {showSidebar ? (
          <div className="h-full overflow-y-auto">
            <ChatUserList conversations={conversations as any} />
          </div>
        ) : (
          // Mobile: Chat Area (shown when chat is selected)
          <div className="flex flex-col h-full bg-white">
            {/* Mobile Chat Header with Back Button */}
            {chatPartner && (
              <div className="border-b border-gray-200 p-3 flex items-center gap-3 flex-shrink-0 bg-white">
                <button onClick={handleBackToConversations} className="p-1">
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <Avatar
                  src={chatPartner.avatarUrl}
                  alt={chatPartner.name}
                  size="md"
                  status={chatPartner.isOnline ? 'online' : 'offline'}
                />
                <div className="flex-1">
                  <h2 className="text-md font-medium text-gray-900">{chatPartner.name}</h2>
                  <p className="text-xs text-gray-500">{chatPartner.isOnline ? 'Online' : 'Offline'}</p>
                </div>
                <Button variant="ghost" size="sm" className="rounded-full p-2" onClick={handleVideoCall}>
                  <Video size={18} />
                </Button>
              </div>
            )}

            {/* Mobile Messages */}
            <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
              {messages.length > 0 ? (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message as any}
                      isCurrentUser={message.senderId === currentUser.id}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <MessageCircle size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-md font-medium text-gray-700">No messages yet</h3>
                  <p className="text-xs text-gray-500 mt-1">Send a message to start</p>
                </div>
              )}
            </div>

            {/* Mobile Message Input */}
            <div className="border-t border-gray-200 p-3 flex-shrink-0 bg-white">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Button type="button" variant="ghost" size="sm" className="rounded-full p-2">
                  <Smile size={18} />
                </Button>
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  fullWidth
                  className="flex-1 text-sm"
                />
                <Button type="submit" size="sm" disabled={!newMessage.trim() || sending} className="rounded-full p-2 w-9 h-9">
                  <Send size={16} />
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};