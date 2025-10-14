import React from 'react';
import { PlaceCard } from '../ui/card-22';
import type { Service } from '../../data/servicesData';
import type { ServiceResponse } from '../../api/serviceApi';

interface ServiceCardProps {
  service: Service | ServiceResponse;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  // Check if it's a ServiceResponse (real API data) or Service (dummy data)
  const isApiService = (service: Service | ServiceResponse): service is ServiceResponse => {
    // API services have category as object, dummy services have category as string
    return typeof service.category === 'object' && service.category !== null;
  };

  if (isApiService(service)) {
    // Map ServiceResponse to PlaceCard props
    const images = service.images && service.images.length > 0 
      ? service.images 
      : [
          `https://picsum.photos/seed/${service.id}-1/800/600`,
          `https://picsum.photos/seed/${service.id}-2/800/600`,
          `https://picsum.photos/seed/${service.id}-3/800/600`,
        ];

    const tags = service.tags && service.tags.length > 0 
      ? service.tags.slice(0, 2) 
      : [service.category?.name || 'Service'];

    const providerName = service.provider?.user 
      ? `${service.provider.user.firstName || ''} ${service.provider.user.lastName || ''}`.trim() || service.provider.user.email
      : 'Service Provider';

    const location = service.city && service.state 
      ? `${service.city}, ${service.state}` 
      : service.city || 'Available';

    const distanceText = service.distance 
      ? service.distance < 1 
        ? `${Math.round(service.distance * 1000)}m away`
        : `${service.distance.toFixed(1)}km away`
      : location;

    // Convert price to number if it's a string
    const price = typeof service.price === 'string' ? parseFloat(service.price) : service.price;

    // Get review count from either reviewCount or _count.reviews
    const reviewCount = service.reviewCount || service._count?.reviews || 0;
    
    // Ensure averageRating is a number
    const averageRating = typeof service.averageRating === 'number' 
      ? service.averageRating 
      : typeof service.averageRating === 'string' 
        ? parseFloat(service.averageRating) 
        : 0;

    return (
      <PlaceCard
        images={images}
        tags={tags}
        rating={averageRating}
        title={service.title || 'Untitled Service'}
        dateRange={distanceText || 'Available'}
        hostType={providerName || 'Service Provider'}
        description={service.description || 'Professional service with quality guaranteed.'}
        pricePerNight={price}
        serviceId={service.id}
        reviewCount={reviewCount}
      />
    );
  } else {
    // Map dummy Service to PlaceCard props
    const images = [service.image];
    const tags = [
      typeof service.category === 'string' ? service.category : 'Category',
      service.subcategory || ''
    ].filter(Boolean);

    return (
      <PlaceCard
        images={images}
        tags={tags}
        rating={service.provider.rating}
        title={service.title}
        dateRange="Available"
        hostType={service.provider.name}
        description="Professional service with quality guaranteed."
        pricePerNight={service.price.amount}
        serviceId={service.id}
        reviewCount={service.provider.reviews}
      />
    );
  }
};

export default ServiceCard;
