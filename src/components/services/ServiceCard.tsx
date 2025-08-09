import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart, User } from 'lucide-react';
import type { Service } from '../../data/servicesData';
import type { ServiceResponse } from '../../api/serviceApi';

interface ServiceCardProps {
  service: Service | ServiceResponse;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/service/${service.id}`);
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking heart
    // TODO: Implement wishlist functionality
  };

  // Check if it's a ServiceResponse (real API data) or Service (dummy data)
  const isApiService = (service: Service | ServiceResponse): service is ServiceResponse => {
    return 'providerId' in service;
  };

  const renderDummyService = (service: Service) => (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-1 transition-all duration-300 ease-in-out hover:shadow-xl border border-gray-200/80 cursor-pointer"
    >
      <div className="relative">
        <img className="w-full h-48 object-cover" src={service.image} alt={service.title} />
        <button 
          onClick={handleHeartClick}
          className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full text-gray-600 hover:text-red-500 hover:bg-white transition-all duration-200"
        >
          <Heart className="w-5 h-5" />
        </button>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-500">{service.category} &gt; {service.subcategory}</p>
        <h3 className="text-lg font-semibold text-gray-900 mt-1 truncate">{service.title}</h3>
        
        <div className="flex items-center mt-2">
          <img src={service.provider.avatar} alt={service.provider.name} className="w-8 h-8 rounded-full mr-2" />
          <span className="text-sm text-gray-700">{service.provider.name}</span>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="text-gray-800 font-bold ml-1">{service.provider.rating}</span>
            <span className="text-gray-600 text-sm ml-1">({service.provider.reviews} reviews)</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {service.price.currency} {service.price.amount}
            <span className="text-sm text-gray-500 ml-1">
              {service.price.type === 'hourly' ? '/hr' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApiService = (service: ServiceResponse) => (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-1 transition-all duration-300 ease-in-out hover:shadow-xl border border-gray-200/80 cursor-pointer"
    >
      <div className="relative">
        {service.images && service.images.length > 0 ? (
          <img 
            className="w-full h-48 object-cover" 
            src={service.images[0]} 
            alt={service.title || 'Service image'}
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              e.currentTarget.src = `https://picsum.photos/seed/${service.id}/400/300`;
            }}
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <div className="text-gray-500 text-center">
              <User className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">No image available</p>
            </div>
          </div>
        )}
        <button 
          onClick={handleHeartClick}
          className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full text-gray-600 hover:text-red-500 hover:bg-white transition-all duration-200"
        >
          <Heart className="w-5 h-5" />
        </button>
        {!service.isActive && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs">
            Inactive
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-500">
          {service.category?.name || 'Category'}
        </p>
        <h3 className="text-lg font-semibold text-gray-900 mt-1 truncate">
          {service.title || 'Untitled Service'}
        </h3>
        
        <div className="flex items-center mt-2">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <span className="text-sm text-gray-700">
            {service.provider?.user ? 
              `${service.provider.user.firstName || ''} ${service.provider.user.lastName || ''}`.trim() || 
              service.provider.user.email : 
              'Service Provider'
            }
          </span>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="text-gray-800 font-bold ml-1">--</span>
            <span className="text-gray-600 text-sm ml-1">(No reviews yet)</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {service.currency} {service.price}
          </div>
        </div>

        {/* Tags */}
        {service.tags && service.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {service.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {tag}
              </span>
            ))}
            {service.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{service.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Description */}
        {service.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {service.description}
          </p>
        )}
      </div>
    </div>
  );

  if (isApiService(service)) {
    return renderApiService(service);
  } else {
    return renderDummyService(service);
  }
};

export default ServiceCard;
