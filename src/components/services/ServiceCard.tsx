import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart, User, MapPin } from 'lucide-react';
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
    // API services have category as object, dummy services have category as string
    return typeof service.category === 'object' && service.category !== null;
  };

  const renderDummyService = (service: Service) => (
    <div 
      onClick={handleCardClick}
      className="group relative bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300 ease-in-out hover:shadow-2xl border border-white/20 hover:border-white/30 cursor-pointer"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
      
      <div className="relative">
        <img className="w-full h-48 object-cover rounded-t-2xl" src={service.image} alt={service.title} />
        <button 
          onClick={handleHeartClick}
          className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm p-2 rounded-full text-white hover:text-red-400 hover:bg-black/50 transition-all duration-200 border border-white/20"
          aria-label="Add to favorites"
        >
          <Heart className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6 relative">
        <p className="text-sm text-gray-300">
          {typeof service.category === 'string' ? service.category : 'Category'} &gt; {service.subcategory || ''}
        </p>
        <h3 className="text-lg font-semibold text-white mt-1 truncate">{service.title}</h3>
        
        <div className="flex items-center mt-3">
          <img src={service.provider.avatar} alt={service.provider.name} className="w-8 h-8 rounded-full mr-2 border border-white/20" />
          <span className="text-sm text-gray-300">{service.provider.name}</span>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="text-white font-bold ml-1">{service.provider.rating}</span>
            <span className="text-gray-400 text-sm ml-1">({service.provider.reviews} reviews)</span>
          </div>
          <div className="text-lg font-bold text-white">
            {service.price.currency} {service.price.amount}
            <span className="text-sm text-gray-400 ml-1">
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
      className="group relative bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300 ease-in-out hover:shadow-2xl border border-white/20 hover:border-white/30 cursor-pointer"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
      
      <div className="relative">
        {service.images && service.images.length > 0 ? (
          <img 
            className="w-full h-48 object-cover rounded-t-2xl" 
            src={service.images[0]} 
            alt={service.title || 'Service image'}
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              e.currentTarget.src = `https://picsum.photos/seed/${service.id}/400/300`;
            }}
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-gray-800/50 to-gray-700/50 flex items-center justify-center rounded-t-2xl">
            <div className="text-gray-400 text-center">
              <User className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">No image available</p>
            </div>
          </div>
        )}
        <button 
          onClick={handleHeartClick}
          className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm p-2 rounded-full text-white hover:text-red-400 hover:bg-black/50 transition-all duration-200 border border-white/20"
          aria-label="Add to favorites"
        >
          <Heart className="w-5 h-5" />
        </button>
        {!service.isActive && (
          <div className="absolute top-3 left-3 bg-red-500/80 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs border border-red-400/30">
            Inactive
          </div>
        )}
      </div>
      <div className="p-6 relative">
        <p className="text-sm text-gray-300">
          {service.category?.name || 'Category'}
        </p>
        <h3 className="text-lg font-semibold text-white mt-1 truncate">
          {service.title || 'Untitled Service'}
        </h3>
        
        <div className="flex items-center mt-3">
          <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mr-2 border border-white/20">
            <User className="w-4 h-4 text-gray-300" />
          </div>
          <span className="text-sm text-gray-300">
            {service.provider?.user ? 
              `${service.provider.user.firstName || ''} ${service.provider.user.lastName || ''}`.trim() || 
              service.provider.user.email : 
              'Service Provider'
            }
          </span>
        </div>

        {/* Location Information */}
        {(service.city || service.address || (service.latitude && service.longitude)) && (
          <div className="flex items-center mt-2">
            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mr-2 border border-white/20">
              <MapPin className="w-4 h-4 text-gray-300" />
            </div>
            <span className="text-sm text-gray-300 truncate">
              {service.city && service.state ? 
                `${service.city}, ${service.state}` : 
                service.city || 
                service.address || 
                (service.latitude && service.longitude ? 
                  `${service.latitude.toFixed(2)}, ${service.longitude.toFixed(2)}` : 
                  'Location available'
                )
              }
              {service.distance && (
                <span className="text-blue-300 ml-1">
                  • {service.distance < 1 ? 
                    `${Math.round(service.distance * 1000)}m` : 
                    `${service.distance.toFixed(1)}km`
                  } away
                </span>
              )}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="text-white font-bold ml-1">--</span>
            <span className="text-gray-400 text-sm ml-1">(No reviews yet)</span>
          </div>
          <div className="text-lg font-bold text-white">
            {service.currency} {service.price}
          </div>
        </div>

        {/* Tags */}
        {service.tags && service.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {service.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-blue-500/20 backdrop-blur-sm text-blue-300 text-xs rounded-full border border-blue-400/30">
                {tag}
              </span>
            ))}
            {service.tags.length > 3 && (
              <span className="px-2 py-1 bg-white/10 backdrop-blur-sm text-gray-300 text-xs rounded-full border border-white/20">
                +{service.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Description */}
        {service.description && (
          <p className="text-sm text-gray-400 mt-2 line-clamp-2">
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
