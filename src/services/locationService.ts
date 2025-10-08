import apiClient from '../api/axios';

// Location types
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationInfo {
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  serviceRadiusKm?: number;
}

export interface GeocodeRequest {
  address: string;
}

export interface GeocodeResponse {
  success: boolean;
  data: LocationInfo;
}

export interface ReverseGeocodeRequest {
  latitude: number;
  longitude: number;
}

export interface IPLocationResponse {
  success: boolean;
  data: LocationInfo;
}

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

// Location permission status
export type LocationPermissionStatus = 'granted' | 'denied' | 'prompt' | 'unsupported';

// Location error types
export interface LocationError {
  code: number;
  message: string;
}

export class LocationService {
  // Get current position using browser geolocation API
  static async getCurrentPosition(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes cache
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          let message = 'Failed to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information is unavailable';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out';
              break;
          }
          reject({ code: error.code, message });
        },
        options
      );
    });
  }

  // Check location permission status
  static async checkPermissionStatus(): Promise<LocationPermissionStatus> {
    if (!navigator.permissions) {
      return 'unsupported';
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state as LocationPermissionStatus;
    } catch {
      return 'unsupported';
    }
  }

  // Get location from IP address (fallback method)
  static async getLocationFromIP(): Promise<LocationInfo> {
    try {
      const response = await apiClient.get<IPLocationResponse>('/services/location/ip');
      return response.data.data;
    } catch (error) {
      throw new Error('Failed to get location from IP address');
    }
  }

  // Geocode an address to coordinates
  static async geocodeAddress(address: string): Promise<LocationInfo> {
    try {
      const response = await apiClient.post<GeocodeResponse>('/services/location/geocode', {
        address
      });
      return response.data.data;
    } catch (error) {
      throw new Error('Failed to geocode address');
    }
  }

  // Reverse geocode coordinates to address
  static async reverseGeocode(coordinates: Coordinates): Promise<LocationInfo> {
    try {
      const response = await apiClient.post<GeocodeResponse>('/services/location/reverse-geocode', {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      });
      return response.data.data;
    } catch (error) {
      throw new Error('Failed to reverse geocode coordinates');
    }
  }

  // Calculate distance between two points using Haversine formula
  static calculateDistance(point1: Coordinates, point2: Coordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.latitude)) * Math.cos(this.toRadians(point2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Helper method to convert degrees to radians
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Format distance for display
  static formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    } else if (distanceKm < 10) {
      return `${distanceKm.toFixed(1)}km`;
    } else {
      return `${Math.round(distanceKm)}km`;
    }
  }

  // Check if location is within a certain radius
  static isWithinRadius(
    point1: Coordinates,
    point2: Coordinates,
    radiusKm: number
  ): boolean {
    const distance = this.calculateDistance(point1, point2);
    return distance <= radiusKm;
  }

  // Get location display string
  static getLocationDisplayString(location: LocationInfo): string {
    const parts: string[] = [];
    
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    if (location.country) parts.push(location.country);
    
    return parts.join(', ') || location.address || 'Unknown location';
  }

  // Validate coordinates
  static isValidCoordinates(coordinates: Partial<Coordinates>): coordinates is Coordinates {
    return (
      typeof coordinates.latitude === 'number' &&
      typeof coordinates.longitude === 'number' &&
      coordinates.latitude >= -90 &&
      coordinates.latitude <= 90 &&
      coordinates.longitude >= -180 &&
      coordinates.longitude <= 180
    );
  }
}

export default LocationService;