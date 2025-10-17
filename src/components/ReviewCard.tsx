import React from 'react';
import { Star, User, Phone, MapPin } from 'lucide-react';

interface CustomerReviewData {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  reviewer: {
    id: string;
    firstName: string;
    lastName: string;
    imageUrl: string | null;
    serviceProvider?: {
      bio: string | null;
      skills: string[];
    } | null;
  };
  reviewee: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface ServiceReviewData {
  id: string;
  reviewerId: string;
  serviceId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  reviewer: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    imageUrl: string | null;
    phone: string | null;
    location: string | null;
  };
  service: {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    images: string[];
  };
}

interface ReviewCardProps {
  review: CustomerReviewData | ServiceReviewData;
  type: 'customer' | 'service'; // customer = CustomerReviews received, service = ServiceReviews received
}

export default function ReviewCard({ review, type }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Render customer review (reviews user received when acting as customer)
  if (type === 'customer') {
    const customerReview = review as CustomerReviewData;

    return (
      <div className="group hover:bg-white/5 -mx-3 px-3 py-4 rounded-xl transition-colors duration-200">
        <div className="flex items-start space-x-4">
          {/* Reviewer Avatar (Service Provider) */}
          <div className="relative flex-shrink-0">
            {customerReview.reviewer.imageUrl ? (
              <img
                src={customerReview.reviewer.imageUrl}
                alt={`${customerReview.reviewer.firstName} ${customerReview.reviewer.lastName}`}
                className="w-12 h-12 rounded-full object-cover border-2 border-purple-400/50 group-hover:border-purple-400/70 transition-colors duration-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm flex items-center justify-center border-2 border-purple-400/50 group-hover:border-purple-400/70 transition-colors duration-200">
                <span className="text-white font-semibold text-sm">
                  {customerReview.reviewer.firstName.charAt(0).toUpperCase()}
                  {customerReview.reviewer.lastName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* Provider Badge */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-500/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
              <User className="w-2.5 h-2.5 text-white fill-current" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-semibold text-white text-base">
                  {customerReview.reviewer.firstName} {customerReview.reviewer.lastName}
                </h4>
                <div className="text-xs text-purple-300 font-medium mb-1">Service Provider</div>
                <div className="flex items-center space-x-2 mt-1">
                  {/* Rating Stars */}
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < customerReview.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-yellow-300">
                    {customerReview.rating}.0
                  </span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-400">
                    {formatDate(customerReview.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Comment */}
            {customerReview.comment && (
              <blockquote className="text-gray-300 text-sm leading-relaxed mb-3">
                "{customerReview.comment}"
              </blockquote>
            )}

            {/* Review Type Label */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                Service Interaction Review
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render service review (reviews user received when acting as service provider)
  if (type === 'service') {
    const serviceReview = review as ServiceReviewData;

    return (
      <div className="group hover:bg-white/5 -mx-3 px-3 py-4 rounded-xl transition-colors duration-200">
        <div className="flex items-start space-x-4">
          {/* Client Avatar (Customer/Reviewer) */}
          <div className="relative flex-shrink-0">
            {serviceReview.reviewer.imageUrl ? (
              <img
                src={serviceReview.reviewer.imageUrl}
                alt={`${serviceReview.reviewer.firstName} ${serviceReview.reviewer.lastName}`}
                className="w-12 h-12 rounded-full object-cover border-2 border-green-400/50 group-hover:border-green-400/70 transition-colors duration-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 backdrop-blur-sm flex items-center justify-center border-2 border-green-400/50 group-hover:border-green-400/70 transition-colors duration-200">
                <span className="text-white font-semibold text-sm">
                  {serviceReview.reviewer.firstName.charAt(0).toUpperCase()}
                  {serviceReview.reviewer.lastName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-white text-base">
                  {serviceReview.reviewer.firstName} {serviceReview.reviewer.lastName}
                </h4>
                <div className="text-xs text-green-300 font-medium mb-1">Customer</div>

                {/* Service Info */}
                <div className="mb-2">
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <span className="font-medium text-gray-300">Service:</span>
                    <span>{serviceReview.service.title}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <span className="font-medium text-gray-300">Price:</span>
                    <span>{serviceReview.service.currency} {serviceReview.service.price.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-1">
                  {/* Rating Stars */}
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < serviceReview.rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-yellow-300">
                    {serviceReview.rating}.0
                  </span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-400">
                    {formatDate(serviceReview.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Comment */}
            <blockquote className="text-gray-300 text-sm leading-relaxed mb-3">
              "{serviceReview.comment}"
            </blockquote>

            {/* Client Contact Info */}
            {(serviceReview.reviewer.phone || serviceReview.reviewer.location) && (
              <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                {serviceReview.reviewer.phone && (
                  <div className="flex items-center space-x-1">
                    <Phone className="w-3 h-3" />
                    <span>{serviceReview.reviewer.phone}</span>
                  </div>
                )}
                {serviceReview.reviewer.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{serviceReview.reviewer.location}</span>
                  </div>
                )}
              </div>
            )}

            {/* Review Type Label */}
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-400/30">
                Service Review by Customer
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
