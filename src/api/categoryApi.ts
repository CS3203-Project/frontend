import apiClient from './axios';

// Types for category
export interface Category {
  id: string;
  name?: string;
  slug: string;
  description?: string;
  parentId?: string;
  parent?: {
    id: string;
    name?: string;
    slug: string;
  };
  children?: Array<{
    id: string;
    name?: string;
    slug: string;
    description?: string;
    _count?: {
      services: number;
    };
  }>;
  _count?: {
    services: number;
  };
}

export interface CreateCategoryRequest {
  name?: string;
  slug: string;
  description?: string;
  parentId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface SearchCategoriesResponse extends ApiResponse<Category[]> {
  searchTerm: string;
}

// Category API functions
export const categoryApi = {
  // Get all categories
  getCategories: async (params?: {
    parentId?: string;
    includeChildren?: boolean;
    includeParent?: boolean;
    includeServices?: boolean;
  }): Promise<ApiResponse<Category[]>> => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories', { params });
    return response.data;
  },

  // Get root categories
  getRootCategories: async (params?: {
    includeChildren?: boolean;
  }): Promise<ApiResponse<Category[]>> => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories/roots', { 
      params: { ...params, includeServices: true }
    });
    return response.data;
  },

  // Search categories
  searchCategories: async (searchTerm: string, params?: {
    includeChildren?: boolean;
    includeParent?: boolean;
  }): Promise<SearchCategoriesResponse> => {
    const response = await apiClient.get<SearchCategoriesResponse>('/categories/search', {
      params: { q: searchTerm, ...params }
    });
    return response.data;
  },

  // Get category by ID
  getCategoryById: async (id: string, params?: {
    includeChildren?: boolean;
    includeParent?: boolean;
    includeServices?: boolean;
  }): Promise<ApiResponse<Category>> => {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/id/${id}`, { params });
    return response.data;
  },

  // Get category by slug
  getCategoryBySlug: async (slug: string, params?: {
    includeChildren?: boolean;
    includeParent?: boolean;
    includeServices?: boolean;
  }): Promise<ApiResponse<Category>> => {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/slug/${slug}`, { params });
    return response.data;
  },

  // Create category
  createCategory: async (categoryData: CreateCategoryRequest): Promise<ApiResponse<Category>> => {
    const response = await apiClient.post<ApiResponse<Category>>('/categories', categoryData);
    return response.data;
  },

  // Update category
  updateCategory: async (id: string, categoryData: Partial<CreateCategoryRequest>): Promise<ApiResponse<Category>> => {
    const response = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Delete category
  deleteCategory: async (id: string, force?: boolean): Promise<ApiResponse<Category>> => {
    const response = await apiClient.delete<ApiResponse<Category>>(`/categories/${id}`, {
      params: { force }
    });
    return response.data;
  }
};

export default categoryApi;
