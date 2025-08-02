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

  // You can add more user-related API calls here
  // login: async (credentials: LoginData): Promise<LoginResponse> => { ... },
  // getProfile: async (userId: string): Promise<UserProfile> => { ... },
  // updateProfile: async (userId: string, data: UpdateUserData): Promise<UserProfile> => { ... },
};

export default userApi;
