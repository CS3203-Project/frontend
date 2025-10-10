import { useState, useEffect, useCallback } from 'react';
import { notificationApi, Notification, NotificationStats } from '../api/notificationApi';

export interface UseNotificationsReturn {
  notifications: Notification[];
  stats: NotificationStats | null;
  loading: boolean;
  error: string | null;
  fetchNotifications: (isRead?: boolean) => Promise<void>;
  fetchStats: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (isRead?: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationApi.getNotifications(isRead, 20, 0);
      setNotifications(response.notifications);
      setStats(response.stats);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const statsResponse = await notificationApi.getNotificationStats();
      setStats(statsResponse);
    } catch (err: any) {
      console.error('Error fetching notification stats:', err);
      // Don't show error for stats fetch
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      // Update local state optimistically
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
      // Refresh stats
      await fetchStats();
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  }, [fetchStats]);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead();
      // Update local state - mark all as read
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      // Refresh stats
      await fetchStats();
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  }, [fetchStats]);

  const refresh = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  // Initially fetch both notifications and stats
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    stats,
    loading,
    error,
    fetchNotifications,
    fetchStats,
    markAsRead,
    markAllAsRead,
    refresh,
  };
};
