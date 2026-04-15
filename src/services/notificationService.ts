import { api } from './api';

export interface Notification {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: string;
  referenceId: string;
  isRead: boolean;
  createdAt: string;
  userName?: string;
  userAvatar?: string;
}

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    return api.get('/Notifications');
  },
  
  async getUnreadCount(): Promise<number> {
    const response = await api.get('/Notifications/unread/count');
    return response.unreadCount;
  },
  
  async markAsRead(notificationId: number): Promise<void> {
    await api.put(`/Notifications/${notificationId}/read`, {});
  },
  
  async markAllAsRead(): Promise<void> {
    await api.put('/Notifications/mark-all-read', {});
  },
};