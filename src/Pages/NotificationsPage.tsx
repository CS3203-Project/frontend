import React, { useState } from 'react';
import { Bell, Check, CheckCheck, Clock, AlertCircle, ShoppingCart, MessageSquare, Star } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { cn } from '../utils/utils';

const NotificationsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const {
    notifications,
    stats,
    loading,
    error,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });

  const getNotificationIcon = (emailType: string) => {
    switch (emailType) {
      case 'BOOKING_CONFIRMATION':
        return <ShoppingCart className="h-5 w-5 text-green-500" />;
      case 'BOOKING_REMINDER':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'BOOKING_CANCELLATION_MODIFICATION':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'NEW_MESSAGE_OR_REVIEW':
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  const stripHtmlTags = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Bell className="h-8 w-8 mr-3 text-blue-600" />
                Notifications
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Stay updated with your service bookings and messages
              </p>
            </div>

            {/* Stats */}
            {stats && (
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.unread}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Unread</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.read}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Read</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'unread', label: 'Unread' },
              { key: 'read', label: 'Read' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  filter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {stats && stats.unread > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All as Read
            </button>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
              <span className="text-red-800 dark:text-red-200">{error}</span>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filter === 'unread'
                  ? 'You have read all your notifications!'
                  : 'When you receive notifications, they will appear here.'
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'bg-white dark:bg-gray-800 rounded-lg border transition-all duration-200 hover:shadow-md',
                  notification.isRead
                    ? 'border-gray-200 dark:border-gray-700 shadow-sm'
                    : 'border-blue-200 dark:border-blue-700 shadow-md ring-2 ring-blue-100 dark:ring-blue-900'
                )}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.emailType)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3
                            className={cn(
                              'text-lg font-semibold truncate',
                              notification.isRead
                                ? 'text-gray-900 dark:text-white'
                                : 'text-gray-900 dark:text-white font-bold'
                            )}
                          >
                            {notification.subject}
                          </h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>

                        <div
                          className={cn(
                            'mt-2 text-sm prose prose-sm max-w-none dark:prose-invert',
                            notification.isRead
                              ? 'text-gray-600 dark:text-gray-400'
                              : 'text-gray-700 dark:text-gray-300'
                          )}
                          dangerouslySetInnerHTML={{ __html: notification.html }}
                        />

                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="mt-3 flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
