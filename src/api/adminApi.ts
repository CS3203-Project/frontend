import apiClient from './axios';

// Admin API Types
export interface AdminStats {
  totalCustomers: number;
  totalServiceProviders: number;
  totalServices: number;
  totalActiveServices: number;
  totalPendingProviders: number;
  totalVerifiedProviders: number;
  recentSignups: number;
  monthlyGrowth: {
    customers: number;
    providers: number;
    services: number;
  };
}

export interface PendingProvider {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location?: string;
    imageUrl?: string;
    createdAt: string;
  };
  bio?: string;
  skills: string[];
  qualifications: string[];
  logoUrl?: string;
  IDCardUrl: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProfile {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  password?: string; // Optional for updates
  role?: string;
  imageUrl?: string;
  lastLogin?: string;
  permissions?: string[];
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  imageUrl?: string;
  location?: string;
  phone?: string;
  createdAt: string;
  isEmailVerified: boolean;
}

export interface Service {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  provider: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  admin: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  };
  token: string;
}

// Report Types
export interface ReportParams {
  type: 'users' | 'services' | 'providers' | 'transactions' | 'analytics';
  startDate: string;
  endDate: string;
  format: 'pdf' | 'excel' | 'csv';
  filters?: {
    status?: string;
    category?: string;
    location?: string;
  };
}

export interface ReportData {
  id: string;
  name: string;
  type: string;
  generatedAt: string;
  downloadUrl: string;
  status: 'generating' | 'completed' | 'failed';
  fileSize?: string;
}

export interface AnalyticsData {
  totalUsers: number;
  totalProviders: number;
  totalServices: number;
  totalTransactions: number;
  revenue: number;
  userGrowth: Array<{ date: string; count: number }>;
  servicesByCategory: Array<{ category: string; count: number }>;
  topProviders: Array<{ name: string; rating: number; services: number }>;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
}

// Admin API functions
export const adminApi = {
  // Admin login
  login: async (credentials: AdminLoginRequest): Promise<ApiResponse<AdminLoginResponse>> => {
    try {
      const response = await apiClient.post<ApiResponse<AdminLoginResponse>>('/admin/login', credentials);
      
      // Store the token in localStorage if login is successful
      if (response.data.success && response.data.data.token) {
        localStorage.setItem('adminToken', response.data.data.token);
        localStorage.setItem('adminUser', JSON.stringify(response.data.data.admin));
      }
      
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Login failed');
      } else if (error && typeof error === 'object' && 'request' in error) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

  // Admin logout
  logout: async (): Promise<void> => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  },

  // Check if admin is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    return !!(token && user);
  },

  // Get current admin user
  getCurrentAdmin: (): AdminLoginResponse['admin'] | null => {
    const userStr = localStorage.getItem('adminUser');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  // Get admin token
  getToken: (): string | null => {
    return localStorage.getItem('adminToken');
  },
  // Get admin dashboard statistics
  getDashboardStats: async (): Promise<ApiResponse<AdminStats>> => {
    try {
      const response = await apiClient.get<ApiResponse<AdminStats>>('/admin/stats');
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Failed to fetch dashboard stats');
      } else if (error && typeof error === 'object' && 'request' in error) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

  // Get pending service providers for approval
  getPendingProviders: async (): Promise<ApiResponse<PendingProvider[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<PendingProvider[]>>('/admin/providers/pending');
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Failed to fetch pending providers');
      } else if (error && typeof error === 'object' && 'request' in error) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

  // Approve a service provider
  approveProvider: async (providerId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post<ApiResponse<void>>(`/admin/providers/${providerId}/approve`);
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Failed to approve provider');
      } else if (error && typeof error === 'object' && 'request' in error) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

  // Reject a service provider
  rejectProvider: async (providerId: string, reason?: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post<ApiResponse<void>>(`/admin/providers/${providerId}/reject`, {
        reason
      });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Failed to reject provider');
      } else if (error && typeof error === 'object' && 'request' in error) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

  // Get admin profile
  getAdminProfile: async (): Promise<ApiResponse<AdminProfile>> => {
    try {
      const response = await apiClient.get<ApiResponse<AdminProfile>>('/admin/profile');
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Failed to fetch admin profile');
      } else if (error && typeof error === 'object' && 'request' in error) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

  // Update admin profile
  updateAdminProfile: async (profileData: Partial<AdminProfile>): Promise<ApiResponse<AdminProfile>> => {
    try {
      const response = await apiClient.put<ApiResponse<AdminProfile>>('/admin/profile', profileData);
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Failed to update admin profile');
      } else if (error && typeof error === 'object' && 'request' in error) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

  // Get all users (customers)
  getAllUsers: async (params?: {
    role?: string;
    skip?: number;
    take?: number;
    search?: string;
  }): Promise<ApiResponse<User[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<User[]>>('/admin/users', { params });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Failed to fetch users');
      } else if (error && typeof error === 'object' && 'request' in error) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

  // Get all service providers
  getAllProviders: async (params?: {
    verified?: boolean;
    skip?: number;
    take?: number;
    search?: string;
  }): Promise<ApiResponse<PendingProvider[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<PendingProvider[]>>('/admin/providers', { params });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Failed to fetch providers');
      } else if (error && typeof error === 'object' && 'request' in error) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

  // Get all services
  getAllServices: async (params?: {
    isActive?: boolean;
    skip?: number;
    take?: number;
    search?: string;
  }): Promise<ApiResponse<Service[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<Service[]>>('/admin/services', { params });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Failed to fetch services');
      } else if (error && typeof error === 'object' && 'request' in error) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

  // Generate Reports
  generateReport: async (params: ReportParams): Promise<ApiResponse<ReportData>> => {
    try {
      const response = await apiClient.post<ApiResponse<ReportData>>('/admin/reports/generate', params);
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Failed to generate report');
      } else if (error && typeof error === 'object' && 'request' in error) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

  // Get Reports History
  getReports: async (): Promise<ApiResponse<ReportData[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<ReportData[]>>('/admin/reports');
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Failed to fetch reports');
      } else if (error && typeof error === 'object' && 'request' in error) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

  // Download Report
  downloadReport: async (reportId: string): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/admin/reports/${reportId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Failed to download report');
      } else if (error && typeof error === 'object' && 'request' in error) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

  // Get Analytics Data
  getAnalytics: async (startDate: string, endDate: string): Promise<ApiResponse<AnalyticsData>> => {
    try {
      const response = await apiClient.get<ApiResponse<AnalyticsData>>('/admin/analytics', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Failed to fetch analytics');
      } else if (error && typeof error === 'object' && 'request' in error) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  }
};

export default adminApi;
