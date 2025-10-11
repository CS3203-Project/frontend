import api from './axios';

// Service Request types
export interface ServiceRequest {
  id: string;
  userId: string;
  title?: string;
  description: string;
  categoryId?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  status: 'PENDING' | 'MATCHED' | 'COMPLETED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceRequestData {
  title?: string;
  description: string;
  // categoryId removed
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface UpdateServiceRequestData {
  title?: string;
  description?: string;
  // categoryId removed
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

// Service Request API endpoints
const ServiceRequestAPI = {
  // Create a new service request
  createServiceRequest: (requestData: CreateServiceRequestData) => {
    return api.post('/service-requests', requestData);
  },
  
  // Get all service requests for the logged-in user
  getServiceRequests: (page = 1, limit = 10) => {
    return api.get(`/service-requests?page=${page}&limit=${limit}`);
  },
  
  // Get a specific service request by ID
  getServiceRequestById: (id: string) => {
    return api.get(`/service-requests/${id}`);
  },
  
  // Update a service request
  updateServiceRequest: (id: string, requestData: UpdateServiceRequestData) => {
    return api.put(`/service-requests/${id}`, requestData);
  },
  
  // Delete a service request
  deleteServiceRequest: (id: string) => {
    return api.delete(`/service-requests/${id}`);
  },
  
  // Find matching services for a service request
  findMatchingServices: (id: string, page = 1, limit = 10) => {
    return api.get(`/service-requests/${id}/matching?page=${page}&limit=${limit}`);
  }
};

export default ServiceRequestAPI;