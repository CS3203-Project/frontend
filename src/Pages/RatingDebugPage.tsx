import React, { useEffect, useState } from 'react';
import { serviceApi } from '../api/serviceApi';
import type { ServiceResponse } from '../api/serviceApi';

const RatingDebugPage: React.FC = () => {
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await serviceApi.getServices({ take: 10 });
        console.log('Raw API Response:', response);
        if (response.success && response.data) {
          setServices(response.data);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Service Rating Debug Page</h1>
      
      <div className="space-y-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">{service.title}</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Service ID:</p>
                <p className="text-sm text-gray-600">{service.id}</p>
              </div>
              
              <div>
                <p className="font-semibold">Average Rating:</p>
                <p className="text-2xl text-blue-600">
                  {service.averageRating !== undefined 
                    ? service.averageRating 
                    : 'undefined'} ⭐
                </p>
                <p className="text-xs text-gray-500">
                  Type: {typeof service.averageRating}
                </p>
              </div>
              
              <div>
                <p className="font-semibold">Review Count:</p>
                <p className="text-2xl text-green-600">
                  {service.reviewCount !== undefined 
                    ? service.reviewCount 
                    : 'undefined'}
                </p>
                <p className="text-xs text-gray-500">
                  Type: {typeof service.reviewCount}
                </p>
              </div>
              
              <div>
                <p className="font-semibold">_count.serviceReviews:</p>
                <p className="text-2xl text-purple-600">
                  {service._count?.reviews !== undefined 
                    ? service._count.reviews 
                    : 'undefined'}
                </p>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <p className="font-semibold mb-2">Raw Data:</p>
              <pre className="text-xs overflow-auto">
                {JSON.stringify({
                  id: service.id,
                  title: service.title,
                  averageRating: service.averageRating,
                  reviewCount: service.reviewCount,
                  _count: service._count
                }, null, 2)}
              </pre>
            </div>
            
            <div className="mt-4 p-4 bg-yellow-50 rounded border border-yellow-200">
              <p className="font-semibold mb-2">Display Logic Test:</p>
              <p>rating &gt; 0: <strong>{(service.averageRating || 0) > 0 ? 'TRUE' : 'FALSE'}</strong></p>
              <p>Should show: <strong>{(service.averageRating || 0) > 0 ? '⭐ Rating Badge' : '⭐ No reviews'}</strong></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingDebugPage;
