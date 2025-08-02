import apiClient from './axios';

// Types for user registration
export interface RegisterUserData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  location: string;
  phone: string;
  address?: string;
}

export interface RegisterUserResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    location: string;
    phone: string;
    address?: string;
  };
}

// User profile type
export interface UserProfile {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
  location: string;
  address?: string;
  phone: string;
  socialmedia?: string[];
  createdAt: string;
  isEmailVerified: boolean;
  serviceProvider?: {
    id: string;
    bio?: string;
    skills: string[];
    qualifications: string[];
    logoUrl?: string;
    averageRating?: number;
    totalReviews?: number;
    services: Array<{
      id: string;
      title: string;
      description: string;
      price: number;
      currency: string;
      images: string[];
      isActive: boolean;
    }>;
    reviews: Array<{
      id: string;
      rating: number;
      comment: string;
      createdAt: string;
      reviewer: {
        firstName: string;
        lastName: string;
        imageUrl?: string;
      };
    }>;
  };
}

// Update profile data type
export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  socialmedia?: string[];
}

// Provider types
export interface CreateProviderData {
  bio?: string;
  skills?: string[];
  qualifications?: string[];
  logoUrl?: string;
}

export interface UpdateProviderData {
  bio?: string;
  skills?: string[];
  qualifications?: string[];
  logoUrl?: string;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  bio?: string;
  skills: string[];
  qualifications: string[];
  logoUrl?: string;
  averageRating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    imageUrl?: string;
    role: string;
    phone?: string;
    location?: string;
    address?: string;
    socialmedia?: string[];
    createdAt: string;
    isEmailVerified: boolean;
  };
  services: Array<{
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    images: string[];
    isActive: boolean;
    tags: string[];
    createdAt: string;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    reviewer: {
      firstName: string;
      lastName: string;
      imageUrl?: string;
    };
  }>;
}

// User API functions
export const userApi = {
  // Login user
  login: async (credentials: { email: string; password: string }): Promise<{ message: string; token?: string; user?: any }> => {
    try {
      const response = await apiClient.post('/users/login', credentials);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Login failed');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },
  // Check if email already exists
  checkEmailExists: async (email: string): Promise<{ exists: boolean; message: string }> => {
    try {
      const response = await apiClient.get(`/users/check-email?email=${encodeURIComponent(email)}`);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        // Server responded with error status
        throw new Error(error.response.data?.message || 'Email check failed');
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('Network error. Please check your connection.');
      } else {
        // Something else happened
        throw new Error('An unexpected error occurred');
      }
    }
  },

  // Register a new user
  register: async (userData: RegisterUserData): Promise<RegisterUserResponse> => {
    try {
      const response = await apiClient.post('/users/register', userData);
      return response.data;
    } catch (error: any) {
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        throw new Error(error.response.data?.message || 'Registration failed');
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('Network error. Please check your connection.');
      } else {
        // Something else happened
        throw new Error('An unexpected error occurred');
      }
    }
  },

  // Get user profile
  getProfile: async (): Promise<UserProfile> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await apiClient.get('/users/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to fetch profile');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

  // Update user profile
  updateProfile: async (profileData: UpdateProfileData): Promise<UserProfile> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await apiClient.put('/users/profile', profileData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.user;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to update profile');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

  // Logout user
  logout: async (): Promise<void> => {
    localStorage.removeItem('token');
  },

  // Provider API methods
  createProvider: async (providerData: CreateProviderData): Promise<ProviderProfile> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await apiClient.post('/providers', providerData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.provider;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to create provider profile');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

  getProviderProfile: async (): Promise<ProviderProfile> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await apiClient.get('/providers/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to fetch provider profile');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

  updateProvider: async (providerData: UpdateProviderData): Promise<ProviderProfile> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await apiClient.put('/providers/profile', providerData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.provider;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to update provider profile');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

  deleteProvider: async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      await apiClient.delete('/providers/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to delete provider profile');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

  // You can add more user-related API calls here
  // updateProfile: async (userId: string, data: UpdateUserData): Promise<UserProfile> => { ... },
};

export default userApi;
