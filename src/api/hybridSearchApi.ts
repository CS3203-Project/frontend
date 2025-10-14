import apiClient from './axios';
import type { SemanticSearchResult } from './semanticSearchApi';

export interface LocationParams {
  latitude?: number;
  longitude?: number;
  address?: string;
  radius?: number; // in kilometers (optional - if not provided, no location filtering)
}

export interface HybridSearchParams {
  query?: string;
  location?: LocationParams;
  limit?: number;
  threshold?: number;
  categoryId?: string;
  providerId?: string;
  minPrice?: number;
  maxPrice?: number;
  includeWithoutLocation?: boolean;
}

export interface HybridSearchResult extends SemanticSearchResult {
  // Location fields
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  serviceRadiusKm?: number;
  distance_km?: number | null; // Distance from search location
}

export interface HybridSearchResponse {
  success: boolean;
  message: string;
  data: {
    query: string | null;
    location: {
      latitude?: number;
      longitude?: number;
      radius?: number;
    } | null;
    searchType: 'hybrid' | 'semantic' | 'location' | 'general';
    results: HybridSearchResult[];
    count: number;
    // Additional fields for hybrid searches
    hasServicesWithinRadius?: boolean;
    message?: string; // User message about radius expansion
  };
}

export interface LocationInfo {
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface LocationResponse {
  success: boolean;
  message: string;
  data: LocationInfo | null;
}

// Hybrid Search API functions
export const hybridSearchApi = {
  // Perform hybrid search for services (combines semantic search with geolocation)
  searchServices: async (params: HybridSearchParams): Promise<HybridSearchResponse> => {
    const searchParams = new URLSearchParams();
    
    // Add search query
    if (params.query) {
      searchParams.append('query', params.query);
    }
    
    // Add location parameters
    if (params.location?.latitude && params.location?.longitude) {
      searchParams.append('latitude', params.location.latitude.toString());
      searchParams.append('longitude', params.location.longitude.toString());
    } else if (params.location?.address) {
      searchParams.append('address', params.location.address);
    }
    
    if (params.location?.radius !== undefined) {
      searchParams.append('radius', params.location.radius.toString());
    }
    
    // Add other search parameters
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());
    if (params.threshold !== undefined) searchParams.append('threshold', params.threshold.toString());
    if (params.categoryId) searchParams.append('categoryId', params.categoryId);
    if (params.providerId) searchParams.append('providerId', params.providerId);
    if (params.minPrice !== undefined) searchParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) searchParams.append('maxPrice', params.maxPrice.toString());
    if (params.includeWithoutLocation !== undefined) {
      searchParams.append('includeWithoutLocation', params.includeWithoutLocation.toString());
    }

    const response = await apiClient.get<HybridSearchResponse>(`/services/search/hybrid?${searchParams.toString()}`);
    return response.data;
  },

  // Get user's current location using browser geolocation API
  getCurrentLocation: (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes cache
        }
      );
    });
  },

  // Get location from IP address as fallback
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

  // Calculate distance between two points (client-side helper)
  calculateDistance: (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  // Format distance for display
  formatDistance: (distanceKm: number | null | undefined): string => {
    if (distanceKm === null || distanceKm === undefined) {
      return 'Available everywhere';
    }
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m away`;
    }
    return `${distanceKm.toFixed(1)}km away`;
  }
};

export default hybridSearchApi;
