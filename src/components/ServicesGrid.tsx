import React from 'react';
import ServiceCard from './services/ServiceCard';
import type { ServiceResponse } from '../api/serviceApi';

interface ServicesGridProps {
  services: ServiceResponse[];
  loading?: boolean;
  error?: string | null;
}

const ServicesGrid: React.FC<ServicesGridProps> = ({ services, loading, error }) => {
  console.log('ServicesGrid render:', { servicesCount: services?.length, loading, error });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading services...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Services</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Services Found</h3>
          <p className="text-gray-600">There are currently no services available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
};

export default ServicesGrid;
