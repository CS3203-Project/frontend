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
        return <ShoppingCart className="h-5 w-5 text-black dark:text-white" />;
      case 'BOOKING_REMINDER':
        return <Clock className="h-5 w-5 text-black dark:text-white" />;
      case 'BOOKING_CANCELLATION_MODIFICATION':
        return <AlertCircle className="h-5 w-5 text-black dark:text-white" />;
      case 'NEW_MESSAGE_OR_REVIEW':
        return <MessageSquare className="h-5 w-5 text-black dark:text-white" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
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
      <div className="min-h-screen relative pt-20">
        {/* Background Pattern */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-black/10 to-transparent dark:from-white/10 dark:to-transparent rounded-full blur-3xl"></div>
          <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-gray-500/10 to-transparent dark:from-gray-400/10 dark:to-transparent rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-white/5 to-transparent dark:from-white/5 dark:to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            {/* Skeleton Header */}
            <div className="bg-white/70 dark:bg-black/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-white/15 p-6">
              <div className="h-8 bg-gradient-to-r from-black/20 via-gray-400/30 to-black/20 dark:from-white/20 dark:via-gray-500/30 dark:to-white/20 rounded w-1/4 mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent animate-shimmer"></div>
              </div>
              <div className="h-4 bg-gradient-to-r from-black/20 via-gray-400/30 to-black/20 dark:from-white/20 dark:via-gray-500/30 dark:to-white/20 rounded w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent animate-shimmer"></div>
              </div>
            </div>
            
            {/* Skeleton Notifications */}
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white/70 dark:bg-black/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-white/15 p-6">
                <div className="h-6 bg-gradient-to-r from-black/20 via-gray-400/30 to-black/20 dark:from-white/20 dark:via-gray-500/30 dark:to-white/20 rounded w-3/4 mb-3 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent animate-shimmer"></div>
                </div>
                <div className="h-4 bg-gradient-to-r from-black/20 via-gray-400/30 to-black/20 dark:from-white/20 dark:via-gray-500/30 dark:to-white/20 rounded w-full mb-2 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent animate-shimmer"></div>
                </div>
                <div className="h-4 bg-gradient-to-r from-black/20 via-gray-400/30 to-black/20 dark:from-white/20 dark:via-gray-500/30 dark:to-white/20 rounded w-2/3 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent animate-shimmer"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pt-20">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-black/10 to-transparent dark:from-white/10 dark:to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-gray-500/10 to-transparent dark:from-gray-400/10 dark:to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-white/5 to-transparent dark:from-white/5 dark:to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8 bg-white/70 dark:bg-black/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-white/15 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white flex items-center">
                <Bell className="h-8 w-8 mr-3 text-black dark:text-white" />
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
                  <div className="text-2xl font-bold text-black dark:text-white">
                    {stats.total}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-black dark:text-white">
                    {stats.unread}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Unread</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-black dark:text-white">
                    {stats.read}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Read</div>
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
                  'px-4 py-2 rounded-full font-medium transition-all duration-300',
                  filter === key
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-xl'
                    : 'bg-white/70 dark:bg-black/70 text-gray-700 dark:text-gray-300 border border-white/20 dark:border-white/15 backdrop-blur-xl hover:scale-105'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {stats && stats.unread > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold hover:scale-105 transition-all duration-300 shadow-xl"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All as Read
            </button>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/15 rounded-3xl p-6 mb-6 shadow-xl">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-black dark:text-white mr-2" />
              <span className="text-black dark:text-white font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white/70 dark:bg-black/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-white/15 p-12 text-center">
              <Bell className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
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
                  'bg-white/70 dark:bg-black/70 backdrop-blur-2xl rounded-3xl border transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]',
                  notification.isRead
                    ? 'border-white/20 dark:border-white/15 shadow-xl'
                    : 'border-white/30 dark:border-white/25 shadow-2xl ring-2 ring-black/10 dark:ring-white/10'
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
                                ? 'text-black dark:text-white'
                                : 'text-black dark:text-white font-bold'
                            )}
                          >
                            {notification.subject}
                          </h3>
                          <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap ml-4">
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
                            className="mt-3 flex items-center text-sm text-black dark:text-white hover:opacity-80 transition-all font-medium"
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
