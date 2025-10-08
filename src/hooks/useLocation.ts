import { useState, useEffect, useCallback } from 'react';
import LocationService from '../services/locationService';
import type { 
  Coordinates, 
  LocationInfo, 
  LocationPermissionStatus, 
  LocationError 
} from '../services/locationService';

export interface UseLocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchPosition?: boolean;
  autoRequest?: boolean;
}

export interface UseLocationResult {
  coordinates: Coordinates | null;
  locationInfo: LocationInfo | null;
  loading: boolean;
  error: LocationError | null;
  permissionStatus: LocationPermissionStatus | null;
  
  // Methods
  getCurrentLocation: () => Promise<void>;
  getLocationFromIP: () => Promise<void>;
  geocodeAddress: (address: string) => Promise<void>;
  reverseGeocode: (coords: Coordinates) => Promise<void>;
  clearError: () => void;
  clearLocation: () => void;
}

export const useLocation = (options: UseLocationOptions = {}): UseLocationResult => {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 300000, // 5 minutes
    watchPosition = false,
    autoRequest = false
  } = options;

  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LocationError | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Check permission status on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const status = await LocationService.checkPermissionStatus();
        setPermissionStatus(status);
      } catch {
        setPermissionStatus('unsupported');
      }
    };

    checkPermission();
  }, []);

    // Auto-request location if enabled
  useEffect(() => {
    if (autoRequest && permissionStatus === 'granted') {
      getCurrentLocation();
    }
  }, [autoRequest, permissionStatus]); // Removed getCurrentLocation from dependencies

  // Watch position if enabled
  useEffect(() => {
    if (watchPosition && navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setCoordinates(coords);
          setError(null);
        },
        (error) => {
          setError({
            code: error.code,
            message: `Watch position error: ${error.message}`
          });
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge
        }
      );

      setWatchId(id);

      return () => {
        navigator.geolocation.clearWatch(id);
        setWatchId(null);
      };
    }
  }, [watchPosition, enableHighAccuracy, timeout, maximumAge]);

  const getCurrentLocation = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const coords = await LocationService.getCurrentPosition();
      setCoordinates(coords);
      
      // Also try to get address information
      try {
        const info = await LocationService.reverseGeocode(coords);
        setLocationInfo(info);
      } catch (reverseError) {
        // Don't fail the whole operation if reverse geocoding fails
        console.warn('Failed to reverse geocode:', reverseError);
      }
    } catch (err) {
      setError(err as LocationError);
    } finally {
      setLoading(false);
    }
  }, []);

  const getLocationFromIP = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const info = await LocationService.getLocationFromIP();
      setLocationInfo(info);
      
      if (info.latitude && info.longitude) {
        setCoordinates({
          latitude: info.latitude,
          longitude: info.longitude
        });
      }
    } catch (err) {
      setError({
        code: -1,
        message: err instanceof Error ? err.message : 'Failed to get IP location'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const geocodeAddress = useCallback(async (address: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const info = await LocationService.geocodeAddress(address);
      setLocationInfo(info);
      
      if (info.latitude && info.longitude) {
        setCoordinates({
          latitude: info.latitude,
          longitude: info.longitude
        });
      }
    } catch (err) {
      setError({
        code: -1,
        message: err instanceof Error ? err.message : 'Failed to geocode address'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const reverseGeocode = useCallback(async (coords: Coordinates): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const info = await LocationService.reverseGeocode(coords);
      setLocationInfo(info);
      setCoordinates(coords);
    } catch (err) {
      setError({
        code: -1,
        message: err instanceof Error ? err.message : 'Failed to reverse geocode'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearLocation = useCallback(() => {
    setCoordinates(null);
    setLocationInfo(null);
    setError(null);
    
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    coordinates,
    locationInfo,
    loading,
    error,
    permissionStatus,
    getCurrentLocation,
    getLocationFromIP,
    geocodeAddress,
    reverseGeocode,
    clearError,
    clearLocation
  };
};

export default useLocation;