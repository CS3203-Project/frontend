import { useState, useEffect, useCallback, useRef } from 'react';
import { serviceApi } from '../api/serviceApi';
import type { ServiceResponse } from '../api/serviceApi';

interface UseServicesResult {
  services: ServiceResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useServices = (params?: {
  providerId?: string;
  categoryId?: string;
  isActive?: boolean;
  skip?: number;
  take?: number;
}): UseServicesResult => {
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);
      
      const response = await serviceApi.getServices(params, abortControllerRef.current?.signal);
      
      // Check if the request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      if (response.success) {
        setServices(response.data);
      } else {
        setError(response.message || 'Failed to fetch services');
      }
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError(err instanceof Error ? err.message : 'An error occurred while fetching services');
    } finally {
      setLoading(false);
    }
  }, [params?.providerId, params?.categoryId, params?.isActive, params?.skip, params?.take]);

  const refetch = useCallback(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    fetchServices();

    // Cleanup function to abort ongoing requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchServices]);

  return {
    services,
    loading,
    error,
    refetch
  };
};

export default useServices;
