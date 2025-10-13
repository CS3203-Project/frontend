import apiClient from './axios';

// Types for service creation
export interface CreateServiceRequest {
  providerId: string;
  categoryId: string;
  title?: string;
  description?: string;
  price: number;
  currency?: string;
  tags?: string[];
  images?: string[];
  videoUrl?: string;
  isActive?: boolean;
  workingTime?: string[];
  // Location fields
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  serviceRadiusKm?: number;
}

export interface ServiceResponse {
  id: string;
  providerId?: string;
  categoryId?: string;
  title?: string;
  description?: string;
  price: string | number; // API returns string, but we might have number internally
  currency: string;
  tags: string[];
  images: string[];
  videoUrl?: string;
  isActive: boolean;
  workingTime?: string[];
  // Location fields
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  serviceRadiusKm?: number;
  locationLastUpdated?: string;
  // Distance (calculated on the client side or returned from location search)
  distance?: number;
  // Rating fields
  averageRating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt?: string;
  provider?: {
    id: string;
    averageRating?: number | null;
    totalReviews?: number | null;
    user: {
      firstName?: string;
      lastName?: string;
      email?: string;
      imageUrl?: string | null;
    };
  };
  category?: {
    id: string;
    name?: string;
    slug: string;
  };
  _count?: {
    reviews: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ServiceListResponse extends ApiResponse<ServiceResponse[]> {
  pagination?: {
    skip: number;
    take: number;
  };
}

// Location search parameters
export interface LocationSearchParams {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  isActive?: boolean;
  skip?: number;
  take?: number;
}

// Location-based response types
export interface LocationInfo {
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface LocationResponse extends ApiResponse<LocationInfo> {}

// Service API functions
export const serviceApi = {
  // Create a new service
  createService: async (serviceData: CreateServiceRequest): Promise<ApiResponse<ServiceResponse>> => {
    const response = await apiClient.post<ApiResponse<ServiceResponse>>('/services', serviceData);
    return response.data;
  },

  // Get all services with optional filtering
  getServices: async (params?: {
    providerId?: string;
    categoryId?: string;
    isActive?: boolean;
    skip?: number;
    take?: number;
  }, abortSignal?: AbortSignal): Promise<ServiceListResponse> => {
    const response = await apiClient.get<ServiceListResponse>('/services', { 
      params,
      signal: abortSignal 
    });
    return response.data;
  },

  // Get service by ID
  getServiceById: async (id: string): Promise<ApiResponse<ServiceResponse>> => {
    const response = await apiClient.get<ApiResponse<ServiceResponse>>(`/services/${id}`);
    return response.data;
  },

  // Get service by conversation ID
  getServiceByConversationId: async (conversationId: string): Promise<ApiResponse<ServiceResponse>> => {
    const response = await apiClient.get<ApiResponse<ServiceResponse>>(`/services/conversation/${conversationId}`);
    return response.data;
  },

  // Update service
  updateService: async (id: string, serviceData: Partial<CreateServiceRequest>): Promise<ApiResponse<ServiceResponse>> => {
    const response = await apiClient.put<ApiResponse<ServiceResponse>>(`/services/${id}`, serviceData);
    return response.data;
  },

  // Delete service
  deleteService: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/services/${id}`);
    return response.data;
  },

  // Location-based service search
  searchServicesByLocation: async (params: LocationSearchParams, abortSignal?: AbortSignal): Promise<ServiceListResponse> => {
    const response = await apiClient.get<ServiceListResponse>('/services/search/location', { 
      params,
      signal: abortSignal 
    });
    return response.data;
  },

  // Get location from IP address
  getLocationFromIP: async (): Promise<LocationResponse> => {
    const response = await apiClient.get<LocationResponse>('/services/location/ip');
    return response.data;
  },

  // Geocode address to coordinates
  geocodeAddress: async (address: string): Promise<LocationResponse> => {
    const response = await apiClient.post<LocationResponse>('/services/location/geocode', { address });
    return response.data;
  },

  // Reverse geocode coordinates to address
  reverseGeocode: async (latitude: number, longitude: number): Promise<LocationResponse> => {
    const response = await apiClient.post<LocationResponse>('/services/location/reverse-geocode', { 
      latitude, 
      longitude 
    });
    return response.data;
  },

  // Video upload function
  uploadVideo: async (videoFile: File): Promise<{ videoUrl: string }> => {
    const formData = new FormData();
    formData.append('video', videoFile);

    const response = await apiClient.post('/users/upload-video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }
};

export default serviceApi;

