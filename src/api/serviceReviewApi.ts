import apiClient from './axios';

// Types for service reviews
export interface ServiceReview {
  id: string;
  rating: number;
  comment: string;
  clientName: string;
  clientAvatar: string;
  date: string;
  helpful: number;
  service?: string | {
    id: string;
    title: string;
    image?: string | null;
    category: string;
  };
  reviewerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ServiceReviewsResponse {
  reviews: ServiceReview[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: ReviewStats;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CreateReviewRequest {
  serviceId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}

// Provider review types
export interface ProviderServiceReview extends ServiceReview {
  service: {
    id: string;
    title: string;
    image?: string | null;
    category: string;
  };
}

export interface ProviderReviewsResponse {
  reviews: ProviderServiceReview[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Service Review API functions
export const serviceReviewApi = {
  // Get review statistics for a service
  getServiceReviewStats: async (serviceId: string): Promise<ApiResponse<ReviewStats>> => {
    const response = await apiClient.get<ApiResponse<ReviewStats>>(`/service-reviews/service/${serviceId}/stats`);
    return response.data;
  },

  // Get detailed reviews for a service with stats and filtering
  getServiceReviewsDetailed: async (
    serviceId: string, 
    options?: {
      page?: number;
      limit?: number;
      rating?: number;
    }
  ): Promise<ApiResponse<ServiceReviewsResponse>> => {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.rating) params.append('rating', options.rating.toString());
    
    const queryString = params.toString();
    const url = `/service-reviews/service/${serviceId}/detailed${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<ApiResponse<ServiceReviewsResponse>>(url);
    return response.data;
  },

  // Get basic reviews for a service
  getServiceReviews: async (
    serviceId: string, 
    page = 1, 
    limit = 10
  ): Promise<any> => {
    const response = await apiClient.get(`/service-reviews/service/${serviceId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Create a new review (requires authentication)
  createServiceReview: async (reviewData: CreateReviewRequest): Promise<any> => {
    const response = await apiClient.post('/service-reviews', reviewData);
    return response.data;
  },

  // Update a review (requires authentication)
  updateServiceReview: async (reviewId: string, reviewData: UpdateReviewRequest): Promise<any> => {
    const response = await apiClient.patch(`/service-reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Delete a review (requires authentication)
  deleteServiceReview: async (reviewId: string): Promise<any> => {
    const response = await apiClient.delete(`/service-reviews/${reviewId}`);
    return response.data;
  },

  // Get a single review by ID (requires authentication)
  getServiceReviewById: async (reviewId: string): Promise<any> => {
    const response = await apiClient.get(`/service-reviews/${reviewId}`);
    return response.data;
  },

  // Provider review functions
  // Get all reviews for all services of a provider
  getProviderServiceReviews: async (
    providerId: string, 
    options?: {
      page?: number;
      limit?: number;
      rating?: number;
    }
  ): Promise<ApiResponse<ProviderReviewsResponse>> => {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.rating) params.append('rating', options.rating.toString());
    
    const queryString = params.toString();
    const url = `/service-reviews/provider/${providerId}${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<ApiResponse<ProviderReviewsResponse>>(url);
    return response.data;
  },

  // Get review statistics for all services of a provider
  getProviderReviewStats: async (providerId: string): Promise<ApiResponse<ReviewStats>> => {
    const response = await apiClient.get<ApiResponse<ReviewStats>>(`/service-reviews/provider/${providerId}/stats`);
    return response.data;
  }
};

export default serviceReviewApi;
