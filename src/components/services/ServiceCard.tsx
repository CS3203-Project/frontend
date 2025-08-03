import React from 'react';
import { Star, Heart } from 'lucide-react';
import type { Service } from '../../data/servicesData';
import { cn } from '../../utils/utils';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-1 transition-all duration-300 ease-in-out hover:shadow-xl border border-gray-200/80">
      <div className="relative">
        <img className="w-full h-48 object-cover" src={service.image} alt={service.title} />
        <button className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full text-gray-600 hover:text-red-500 hover:bg-white transition-all duration-200">
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
};

export default ServiceCard;
