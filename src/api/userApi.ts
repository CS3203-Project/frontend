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
  location?: string;
  phone?: string;
  address?: string;
  socialmedia?: string[];
}

// Provider types
export interface CreateProviderData {
  bio?: string;
  skills?: string[];
  qualifications?: string[];
  logoUrl?: string;
  IDCardUrl: string; // Required field - ID card image URL
}

export interface UpdateProviderData {
  bio?: string;
  skills?: string[];
  qualifications?: string[];
  logoUrl?: string;
  IDCardUrl?: string; // Optional for updates
}

// Company types
export interface CreateCompanyData {
  name: string;
  description?: string;
  logo?: string;
  address?: string;
  contact?: string;
  socialmedia?: string[];
}

export interface UpdateCompanyData {
  name?: string;
  description?: string;
  logo?: string;
  address?: string;
  contact?: string;
  socialmedia?: string[];
}

export interface Company {
  id: string;
  providerId: string;
  name?: string;
  description?: string;
  logo?: string;
  address?: string;
  contact?: string;
  socialmedia: string[];
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
  isVerified?: boolean;
  IDCardUrl: string; // Required field
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
  companies: Company[];
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
    averageRating?: number;
    reviewCount?: number;
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

  // Update user profile with image upload
  updateProfileWithImage: async (formData: FormData): Promise<UserProfile> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await apiClient.put('/users/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
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

  getProviderById: async (providerId: string): Promise<ProviderProfile> => {
    try {
      const response = await apiClient.get(`/providers/${providerId}`);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to fetch provider details');
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

  // Company API methods
  getCompanies: async (): Promise<Company[]> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await apiClient.get('/companies', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to fetch companies');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

  createCompany: async (companyData: CreateCompanyData): Promise<Company> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await apiClient.post('/companies', companyData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.company;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to create company');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

  updateCompany: async (companyId: string, companyData: UpdateCompanyData): Promise<Company> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await apiClient.put(`/companies/${companyId}`, companyData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.company;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to update company');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

  deleteCompany: async (companyId: string): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      await apiClient.delete(`/companies/${companyId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to delete company');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<UserProfile> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await apiClient.get(`/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to fetch user');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

  // Get customer reviews received (from service providers)
  getCustomerReviewsReceived: async (userId: string, page: number = 1, limit: number = 10) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await apiClient.get(`/reviews/user/${userId}/received?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to fetch customer reviews');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  },

  // Get service reviews received (from customers for services)
  getServiceReviewsReceived: async (providerId: string, page: number = 1, limit: number = 10) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await apiClient.get(`/service-reviews/provider/${providerId}?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to fetch service reviews');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  }
};

export default userApi;
