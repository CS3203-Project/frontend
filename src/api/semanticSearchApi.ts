import apiClient from './axios';

export interface SemanticSearchResult {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  tags: string[];
  images: string[];
  similarity: number;
  provider: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
  category: {
    id: string;
    name: string;
  };
}

export interface SemanticSearchResponse {
  success: boolean;
  message: string;
  data: {
    query: string;
    results: SemanticSearchResult[];
    count: number;
  };
}

export interface SimilarServicesResponse {
  success: boolean;
  message: string;
  data: SemanticSearchResult[];
}

export interface SemanticSearchOptions {
  query: string;
  limit?: number;
  threshold?: number;
  categoryId?: string;
  providerId?: string;
  minPrice?: number;
  maxPrice?: number;
}

// Semantic Search API functions
export const semanticSearchApi = {
  // Perform semantic search for services
  searchServices: async (options: SemanticSearchOptions): Promise<SemanticSearchResponse> => {
    const params = new URLSearchParams();
    
    params.append('query', options.query);
    if (options.limit !== undefined) params.append('limit', options.limit.toString());
    if (options.threshold !== undefined) params.append('threshold', options.threshold.toString());
    if (options.categoryId) params.append('categoryId', options.categoryId);
    if (options.providerId) params.append('providerId', options.providerId);
    if (options.minPrice !== undefined) params.append('minPrice', options.minPrice.toString());
    if (options.maxPrice !== undefined) params.append('maxPrice', options.maxPrice.toString());

    const response = await apiClient.get<SemanticSearchResponse>(`/services/search?${params.toString()}`);
    return response.data;
  },

  // Get similar services to a given service
  getSimilarServices: async (serviceId: string, limit: number = 5): Promise<SimilarServicesResponse> => {
    const response = await apiClient.get<SimilarServicesResponse>(`/services/${serviceId}/similar?limit=${limit}`);
    return response.data;
  },

  // Update embeddings for a specific service (admin only)
  updateServiceEmbeddings: async (serviceId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(`/services/${serviceId}/embeddings`);
    return response.data;
  },

  // Batch update embeddings for all services (admin only)
  updateAllServiceEmbeddings: async (): Promise<{ success: boolean; message: string; data: number }> => {
    const response = await apiClient.post<{ success: boolean; message: string; data: number }>(`/services/embeddings/batch`);
    return response.data;
  }
};
