import apiClient from './axios';

// Admin API Types
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

export interface ServiceProvider {
  id: string;
  userId: string;
  bio: string;
  skills: string[];
  qualifications: string[];
  logoUrl?: string;
  averageRating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
  IDCardUrl: string;
  isVerified: boolean;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    imageUrl?: string;
    location?: string;
    address?: string;
    isEmailVerified: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
    socialmedia: string[];
  };
  companies: unknown[];
  services: {
    id: string;
    providerId: string;
    categoryId: string;
    title: string;
    description: string;
    price: string;
    currency: string;
    tags: string[];
    images: string[];
    videoUrl?: string;
    isActive: boolean;
    workingTime: string[];
    createdAt: string;
    updatedAt: string;
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
  _count: {
    services: number;
    schedules: number;
    payments: number;
  };
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
  providerId: string;
  categoryId: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  tags: string[];
  images: string[];
  videoUrl?: string;
  isActive: boolean;
  workingTime: string[];
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
    parent?: {
      id: string;
      name: string;
      slug: string;
    };
  };
  provider: {
    id: string;
    userId: string;
    bio: string;
    skills: string[];
    qualifications: string[];
    logoUrl?: string;
    averageRating?: number;
    totalReviews?: number;
    createdAt: string;
    updatedAt: string;
    IDCardUrl: string;
    isVerified: boolean;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      phone?: string;
      location?: string;
      isActive: boolean;
    };
  };
  _count: {
    schedules: number;
    payments: number;
    serviceReviews: number;
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

  // Update service provider verification status
  updateProviderVerification: async (providerId: string, isVerified: boolean): Promise<ApiResponse<ServiceProvider>> => {
    try {
      const response = await apiClient.put<ApiResponse<ServiceProvider>>(`/admin/service-providers/${providerId}/verification`, {
        isVerified
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Update provider verification error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
        console.error('Server response status:', axiosError.response?.status);
        console.error('Server response data:', axiosError.response?.data);
        throw new Error(axiosError.response?.data?.message || `Failed to ${isVerified ? 'approve' : 'reject'} provider`);
      } else if (error && typeof error === 'object' && 'request' in error) {
        console.error('Network request failed');
        throw new Error('Network error. Please check your connection.');
      } else {
        console.error('Unknown error:', error);
        throw new Error('An unexpected error occurred');
      }
    }
  },

  // Approve a service provider (wrapper for backward compatibility)
  approveProvider: async (providerId: string): Promise<ApiResponse<ServiceProvider>> => {
    return adminApi.updateProviderVerification(providerId, true);
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


  // Get all service providers (verified and unverified)
  getAllServiceProviders: async (params?: {
    verified?: boolean;
    skip?: number;
    take?: number;
    search?: string;
  }): Promise<ApiResponse<ServiceProvider[]> & { count?: number }> => {
    try {
      const response = await apiClient.get<ApiResponse<ServiceProvider[]> & { count?: number }>('/admin/service-providers', { params });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Failed to fetch service providers');
      } else if (error && typeof error === 'object' && 'request' in error) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

  // Get total customer count
  getCustomerCount: async (): Promise<ApiResponse<{ count: number }>> => {
    try {
      const response = await apiClient.get<ApiResponse<{ count: number }>>('/admin/customers/count');
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Failed to fetch customer count');
      } else if (error && typeof error === 'object' && 'request' in error) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

  // Get all services with analytics data
  getAllServices: async (): Promise<ApiResponse<Service[]> & { count?: number }> => {
    try {
      const response = await apiClient.get<ApiResponse<Service[]> & { count?: number }>('/admin/services');
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

  // Get analytics data (combined endpoint for dashboard)
  getAnalyticsData: async (): Promise<ApiResponse<AnalyticsData>> => {
    try {
      // Fetch data from multiple endpoints and combine
      const [customersResponse, providersResponse, servicesResponse] = await Promise.all([
        apiClient.get<ApiResponse<{ count: number }>>('/admin/customers/count'),
        apiClient.get<ApiResponse<ServiceProvider[]>>('/admin/service-providers'),
        apiClient.get<ApiResponse<Service[]>>('/admin/services')
      ]);

      // Process and combine the data
      const analyticsData: AnalyticsData = {
        totalUsers: customersResponse.data.data.count,
        totalProviders: providersResponse.data.data.length,
        totalServices: servicesResponse.data.data.length,
        totalTransactions: 0, // Would need separate endpoint
        revenue: 0, // Would need separate endpoint
        userGrowth: [], // Would need historical data endpoint
        servicesByCategory: [], // Will be calculated from services data
        topProviders: [], // Will be calculated from providers data
        monthlyRevenue: [] // Would need separate endpoint
      };

      return {
        success: true,
        message: 'Analytics data fetched successfully',
        data: analyticsData
      };
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Failed to fetch analytics data');
      } else if (error && typeof error === 'object' && 'request' in error) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

};

export default adminApi;
