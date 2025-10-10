import apiClient from './axios';

// Types for notifications
export interface Notification {
  id: string;
  subject: string;
  html: string;
  emailType: string;
  sentAt: string | null;
  createdAt: string;
  isRead: boolean;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
}

export interface NotificationListResponse {
  notifications: Notification[];
  stats: NotificationStats;
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface MarkAsReadResponse {
  id: string;
  isRead: boolean;
  subject: string;
}

export interface MarkAllAsReadResponse {
  updatedCount: number;
}

// Notification API functions
export const notificationApi = {
  // Get user notifications
  getNotifications: async (
    isRead?: boolean,
    limit = 20,
    offset = 0
  ): Promise<NotificationListResponse> => {
    try {
      const params = new URLSearchParams();
      if (isRead !== undefined) params.append('isRead', isRead.toString());
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await apiClient.get(`/notifications?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to fetch notifications');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

  // Get notification statistics
  getNotificationStats: async (): Promise<NotificationStats> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await apiClient.get('/notifications/stats', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to fetch notification stats');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

  // Get single notification
  getNotification: async (id: string): Promise<Notification> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await apiClient.get(`/notifications/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to fetch notification');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<MarkAsReadResponse> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await apiClient.put(`/notifications/${id}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to mark notification as read');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<MarkAllAsReadResponse> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await apiClient.put('/notifications/read-all', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to mark all notifications as read');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },
};

export default notificationApi;
