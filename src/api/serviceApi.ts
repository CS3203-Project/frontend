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
  isActive?: boolean;
  workingTime?: string[];
}

export interface ServiceResponse {
  id: string;
  providerId: string;
  categoryId: string;
  title?: string;
  description?: string;
  price: number;
  currency: string;
  tags: string[];
  images: string[];
  isActive: boolean;
  workingTime: string[];
  createdAt: string;
  updatedAt: string;
  provider?: {
    id: string;
    user: {
      firstName?: string;
      lastName?: string;
      email: string;
    };
  };
  category?: {
    id: string;
    name?: string;
    slug: string;
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
  }): Promise<ServiceListResponse> => {
    const response = await apiClient.get<ServiceListResponse>('/services', { params });
    return response.data;
  },

  // Get service by ID
  getServiceById: async (id: string): Promise<ApiResponse<ServiceResponse>> => {
    const response = await apiClient.get<ApiResponse<ServiceResponse>>(`/services/${id}`);
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
  }
};

export default serviceApi;

