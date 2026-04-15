import React from 'react';
import { Bell, MessageCircle, UserPlus, DollarSign, Calendar, CheckCheck } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, refreshNotifications } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle size={16} className="text-primary-600" />;
      case 'collaboration':
        return <UserPlus size={16} className="text-secondary-600" />;
      case 'meeting':
        return <Calendar size={16} className="text-accent-600" />;
      case 'payment':
        return <DollarSign size={16} className="text-success-600" />;
      default:
        return <Bell size={16} className="text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated with your network activity</p>
        </div>
        
        {notifications.length > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck size={16} className="mr-2" />
            Mark all as read
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <Card
              key={notification.id}
              className={`transition-colors duration-200 cursor-pointer ${
                !notification.isRead ? 'bg-primary-50' : ''
              }`}
              onClick={() => !notification.isRead && markAsRead(notification.id)}
            >
              <CardBody className="flex items-start p-4">
                {notification.userAvatar ? (
                  <Avatar
                    src={notification.userAvatar}
                    alt={notification.userName || 'User'}
                    size="md"
                    className="flex-shrink-0 mr-4"
                  />
                ) : (
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    {getNotificationIcon(notification.type)}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {notification.title}
                    </span>
                    {!notification.isRead && (
                      <Badge variant="primary" size="sm" rounded>New</Badge>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    {getNotificationIcon(notification.type)}
                    <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
                
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
                  >
                    Mark read
                  </Button>
                )}
              </CardBody>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Bell size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
            <p className="text-gray-500 mt-1">When you receive notifications, they will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};