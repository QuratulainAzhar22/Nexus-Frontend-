import { api } from './api';

export interface Message {
  id: number;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  sender?: any;
  receiver?: any;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: string;
  otherParticipant?: any;
}

export const messageService = {
  async getConversations(): Promise<Conversation[]> {
    return api.get('/Messages/conversations');
  },
  
  async getMessagesWithUser(userId: string): Promise<Message[]> {
    return api.get(`/Messages/${userId}`);
  },
  
  async sendMessage(receiverId: string, content: string): Promise<Message> {
    return api.post('/Messages', { receiverId, content });
  },
  
  async markAsRead(messageId: number): Promise<void> {
    await api.put(`/Messages/${messageId}/read`, {});
  },
  
  async getUnreadCount(): Promise<number> {
    const response = await api.get('/Messages/unread/count');
    return response.unreadCount;
  },
};