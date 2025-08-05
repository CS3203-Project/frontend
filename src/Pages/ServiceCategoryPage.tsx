import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { categoriesData } from '../data/servicesData';
import type { ServiceCategory as ServiceCategoryType, Service } from '../data/servicesData';
import ServiceCard from '../components/services/ServiceCard';
import Breadcrumb from '../components/services/Breadcrumb';
import { serviceApi, type ServiceResponse } from '../api/serviceApi';
import { ChevronDown } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const SubCategorySidebar: React.FC<{
  category: ServiceCategoryType;
  selectedSubCategory: string | null;
  onSelectSubCategory: (slug: string | null) => void;
  availableTags: string[];
}> = ({ category, selectedSubCategory, onSelectSubCategory, availableTags }) => {
  return (
    <div className="w-full md:w-1/4 lg:w-1/5 p-4">
      <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Subcategories</h3>
      <ul className="space-y-2">
        <li>
          <button
            onClick={() => onSelectSubCategory(null)}
            className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-200 ${
              selectedSubCategory === null
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            All {category.title}
          </button>
        </li>
        
        {/* Show predefined subcategories first */}
        {category.subcategories.map((sub) => (
          <li key={sub.slug}>
            <button
              onClick={() => onSelectSubCategory(sub.slug)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-200 flex items-center justify-between ${
                selectedSubCategory === sub.slug
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{sub.name}</span>
              <sub.icon className="w-4 h-4 text-gray-500" />
            </button>
          </li>
        ))}
        
        {/* Show available tags as additional subcategories */}
        {availableTags.length > 0 && (
          <>
            <li className="pt-2">
              <hr className="border-gray-200" />
              <p className="text-sm text-gray-500 mt-2 mb-2">Available Tags</p>
            </li>
            {availableTags.map((tag) => (
              <li key={tag}>
                <button
                  onClick={() => onSelectSubCategory(tag)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-200 ${
                    selectedSubCategory === tag
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="capitalize">{tag}</span>
                </button>
              </li>
            ))}
          </>
        )}
      </ul>
    </div>
  );
};

const ServiceCategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('relevance');

  const category = categoriesData.find(c => c.slug === categorySlug);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      if (!category) return;
      
      console.log('Fetching services for category:', {
        slug: category.slug,
        title: category.title,
        categorySlug
      });
      
      // Try different approaches to match the backend
      const response = await serviceApi.getServices({
        categoryId: category.slug, // First try with slug
        isActive: true
      });
      
      console.log('Services response:', {
        success: response.success,
        dataLength: response.data.length,
        data: response.data
      });
      
      if (response.data.length === 0) {
        console.warn(`No services found with categoryId: ${category.slug}`);
        console.log('Attempting fallback to fetch all services...');
        throw new Error('No services found for this category, trying fallback');
      }
      
      setServices(response.data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      
      // If the first approach fails, try without categoryId to see all services
      try {
        console.log('Trying to fetch all services to debug...');
        const allServicesResponse = await serviceApi.getServices({
          isActive: true
        });
        console.log('All services:', allServicesResponse);
        
        // Filter services on frontend by matching category
        const filteredByCategory = allServicesResponse.data.filter(service => {
          if (!category) return false;
          return service.category?.slug === category.slug || 
                 service.category?.name?.toLowerCase().includes(category.title.toLowerCase());
        });
        
        console.log('Filtered services for category:', filteredByCategory);
        setServices(filteredByCategory);
        
        if (filteredByCategory.length === 0 && category) {
          toast.error(`No services found for ${category.title}. Check console for debugging info.`);
        }
      } catch (fallbackError) {
        console.error('Fallback fetch also failed:', fallbackError);
        toast.error('Failed to load services');
        setServices([]);
      }
    } finally {
      setLoading(false);
    }
  }, [category, categorySlug]);

  useEffect(() => {
    if (category) {
      fetchServices();
    }
  }, [category, fetchServices]);
  
  if (!category) {
    return <div className="text-center py-20">Category not found.</div>;
  }

  // Transform ServiceResponse to Service format for ServiceCard compatibility
  const transformServiceData = (serviceResponse: ServiceResponse): Service => {
    return {
      id: serviceResponse.id,
      title: serviceResponse.title || 'Untitled Service',
      provider: {
        name: serviceResponse.provider?.user ? 
          `${serviceResponse.provider.user.firstName || ''} ${serviceResponse.provider.user.lastName || ''}`.trim() || 
          serviceResponse.provider.user.email : 
          'Unknown Provider',
        avatar: '/api/placeholder/40/40', // Default avatar since backend doesn't provide this
        rating: 4.5, // Default rating since backend doesn't provide this yet
        reviews: 0 // Default reviews since backend doesn't provide this yet
      },
      price: {
        amount: serviceResponse.price,
        currency: serviceResponse.currency,
        type: 'fixed' as const // Default to fixed since backend doesn't specify
      },
      image: serviceResponse.images && serviceResponse.images.length > 0 ? 
        serviceResponse.images[0] : 
        'https://picsum.photos/seed/service/400/300', // Default image
      category: serviceResponse.category?.slug || categorySlug || '',
      subcategory: serviceResponse.tags && serviceResponse.tags.length > 0 ? 
        serviceResponse.tags[0] : 
        'general' // Use first tag as subcategory fallback
    };
  };

  // Filter services based on selected subcategory (using tags as subcategories)
  const filteredServices = selectedSubCategory
    ? services.filter(s => s.tags && s.tags.includes(selectedSubCategory))
    : services;

  // Sort services based on selected option
  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        // Since we don't have ratings yet, sort by creation date
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0; // relevance - keep original order
    }
  });

  // Transform backend data to frontend format
  const transformedServices = sortedServices.map(transformServiceData);

  // Get unique tags from all services for dynamic subcategories
  const availableTags = Array.from(new Set(
    services.flatMap(service => service.tags || [])
  )).filter(tag => 
    // Exclude tags that match existing subcategory slugs to avoid duplicates
    !category.subcategories.some(sub => sub.slug === tag)
  );

  const breadcrumbItems = [
    { label: 'Services', href: '/services' },
    { label: category.title }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8">
          <Breadcrumb items={breadcrumbItems} />
          <div className="mt-4 flex items-center">
            <category.icon className={`w-12 h-12 p-2 rounded-lg text-white bg-gradient-to-r ${category.gradient}`} />
            <div className="ml-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{category.title}</h1>
              <p className="text-md text-gray-600 mt-1">{category.description}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row -mx-4">
          {/* Sidebar for Subcategories */}
          <SubCategorySidebar 
            category={category}
            selectedSubCategory={selectedSubCategory}
            onSelectSubCategory={setSelectedSubCategory}
            availableTags={availableTags}
          />

          {/* Main Content */}
          <div className="w-full md:w-3/4 lg:w-4/5 p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedSubCategory 
                  ? category.subcategories.find(s => s.slug === selectedSubCategory)?.name 
                  : `All ${category.title}`
                }
              </h2>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">{transformedServices.length} services</span>
                <div className="relative">
                  <select 
                    className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="relevance">Sort by: Relevance</option>
                    <option value="price-low">Sort by: Price (Low to High)</option>
                    <option value="price-high">Sort by: Price (High to Low)</option>
                    <option value="rating">Sort by: Recently Added</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Services Grid */}
            {loading ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-700">Loading services...</h3>
                <p className="text-gray-500 mt-2">Please wait while we fetch the services.</p>
              </div>
            ) : transformedServices.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {transformedServices.map(service => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700">No services found</h3>
                <p className="text-gray-500 mt-2">There are currently no services available in this category.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default ServiceCategoryPage;
