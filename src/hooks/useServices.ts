import { useState, useEffect } from 'react';
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

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await serviceApi.getServices(params);
      
      if (response.success) {
        setServices(response.data);
      } else {
        setError(response.message || 'Failed to fetch services');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching services');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchServices();
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return {
    services,
    loading,
    error,
    refetch
  };
};

export default useServices;
