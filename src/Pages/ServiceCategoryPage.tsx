import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ServiceCard from '../components/services/ServiceCard';
import Breadcrumb from '../components/services/Breadcrumb';
import { serviceApi } from '../api/serviceApi';
import { categoryApi } from '../api/categoryApi';
import type { ServiceResponse } from '../api/serviceApi';
import type { Category } from '../api/categoryApi';
import { ChevronDown, Loader2 } from 'lucide-react';
import Orb from '../components/Orb';

const SubCategorySidebar: React.FC<{
  category: Category;
  selectedSubCategory: string | null;
  onSelectSubCategory: (categoryId: string | null) => void;
  services: ServiceResponse[];
}> = ({ category, selectedSubCategory, onSelectSubCategory, services }) => {
  
  // Calculate service counts for each subcategory
  const getSubcategoryServiceCount = (subcategoryId: string) => {
    return services.filter(service => service.category?.id === subcategoryId).length;
  };
  
  const getAllCategoryServiceCount = () => {
    return services.length;
  };
  
  return (
    <div className="w-full md:w-1/4 lg:w-1/5 p-4">
      <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-xl">
        <h3 className="text-xl font-bold mb-4 text-white border-b border-white/20 pb-3">Subcategories</h3>
        <ul className="space-y-3">
          <li>
            <button
              onClick={() => onSelectSubCategory(null)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                selectedSubCategory === null
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-lg border border-white/20'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>All {category.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selectedSubCategory === null 
                    ? 'bg-white/20 text-white' 
                    : 'bg-white/10 text-gray-400'
                }`}>
                  {getAllCategoryServiceCount()}
                </span>
              </div>
            </button>
          </li>
          {category.children && category.children.map((sub) => {
            const serviceCount = getSubcategoryServiceCount(sub.id);
            return (
              <li key={sub.id}>
                <button
                  onClick={() => onSelectSubCategory(sub.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                    selectedSubCategory === sub.id
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-lg border border-white/20'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{sub.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      selectedSubCategory === sub.id 
                        ? 'bg-white/20 text-white' 
                        : 'bg-white/10 text-gray-400'
                    }`}>
                      {serviceCount}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

const ServiceCategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('relevance');

  // Fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      if (!categorySlug) return;
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching category with slug:', categorySlug);
        
        const response = await categoryApi.getCategoryBySlug(categorySlug, {
          includeChildren: true,
          includeServices: false
        });
        
        if (response.success) {
          setCategory(response.data);
          console.log('Category found:', response.data);
        } else {
          setError('Category not found');
        }
      } catch (err: unknown) {
        console.error('Failed to fetch category:', err);
        
        // If category not found, let's fetch all categories to see what's available
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { response?: { status?: number } };
          if (axiosError.response?.status === 404) {
            try {
              console.log('Category not found, fetching all available categories...');
              const allCategoriesResponse = await categoryApi.getCategories();
              if (allCategoriesResponse.success) {
                console.log('Available categories:', allCategoriesResponse.data.map(cat => ({
                  id: cat.id,
                  name: cat.name,
                  slug: cat.slug,
                  parentId: cat.parentId
                })));
              }
            } catch (fetchAllError) {
              console.error('Failed to fetch all categories:', fetchAllError);
            }
            
            setError(`Category "${categorySlug}" not found. Please check if this category exists in your database.`);
          } else {
            setError('Failed to load category');
          }
        } else {
          setError('Failed to load category');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categorySlug]);

  // Fetch services data
  useEffect(() => {
    const fetchServices = async () => {
      if (!category) return;
      
      try {
        setServicesLoading(true);
        let allServices: ServiceResponse[] = [];
        
        if (selectedSubCategory) {
          // Fetch services for the selected subcategory only
          const params = {
            categoryId: selectedSubCategory,
            isActive: true,
            take: 50
          };
          
          const response = await serviceApi.getServices(params);
          
          if (response.success) {
            allServices = response.data;
          }
        } else {
          // Fetch services for main category and all its subcategories
          const categoryIdsToFetch = [category.id];
          
          // Add all subcategory IDs
          if (category.children && category.children.length > 0) {
            categoryIdsToFetch.push(...category.children.map(child => child.id));
          }
          
          // Fetch services for all categories in parallel
          const servicePromises = categoryIdsToFetch.map(categoryId =>
            serviceApi.getServices({
              categoryId,
              isActive: true,
              take: 50
            })
          );
          
          const responses = await Promise.all(servicePromises);
          
          // Combine all services from different categories
          responses.forEach(response => {
            if (response.success) {
              allServices.push(...response.data);
            }
          });
          
          // Remove duplicates if any (shouldn't happen, but just in case)
          const uniqueServices = allServices.filter((service, index, self) =>
            index === self.findIndex(s => s.id === service.id)
          );
          allServices = uniqueServices;
        }
        
        setServices(allServices);
        
      } catch (err) {
        console.error('Failed to fetch services:', err);
        setServices([]);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, [category, selectedSubCategory]);

  // Sort services based on selected option
  const sortedServices = React.useMemo(() => {
    const servicesCopy = [...services];
    
    switch (sortBy) {
      case 'price-low':
        return servicesCopy.sort((a, b) => Number(a.price) - Number(b.price));
      case 'price-high':
        return servicesCopy.sort((a, b) => Number(b.price) - Number(a.price));
      case 'newest':
        return servicesCopy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return servicesCopy.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      default:
        return servicesCopy;
    }
  }, [services, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-800">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-white" />
                <p className="text-white text-lg">Loading category...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
        {/* Background Orbs */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 opacity-15">
          <Orb hue={300} hoverIntensity={0.3} rotateOnHover={true} />
        </div>
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 opacity-10">
          <Orb hue={240} hoverIntensity={0.3} rotateOnHover={true} />
        </div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl">
                <h2 className="text-3xl font-bold text-white mb-6">
                  Category Not Found
                </h2>
                <p className="text-gray-300 mb-8 leading-relaxed">
                  {error || 'The category you\'re looking for doesn\'t exist or couldn\'t be loaded.'}
                </p>
                
                <div className="bg-yellow-600/20 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-6 mb-8">
                  <h3 className="text-sm font-semibold text-yellow-400 mb-3">Troubleshooting:</h3>
                  <ul className="text-sm text-yellow-300 text-left space-y-2">
                    <li>• Check if the category "{categorySlug}" exists in your database</li>
                    <li>• Verify the category slug is correct</li>
                    <li>• Check the browser console for available categories</li>
                    <li>• Ensure your backend is running and accessible</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <button
                    onClick={() => window.location.href = '/services'}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                  >
                    Browse All Services
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/30"
                  >
                    Retry Loading
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Services', href: '/services' },
    { label: category.name || category.slug }
  ];

  const currentCategoryName = selectedSubCategory 
    ? category.children?.find(c => c.id === selectedSubCategory)?.name 
    : category.name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/6 w-96 h-96 opacity-15">
        <Orb hue={280} hoverIntensity={0.4} rotateOnHover={true} />
      </div>
      <div className="absolute top-3/4 right-1/4 w-80 h-80 opacity-10">
        <Orb hue={200} hoverIntensity={0.3} rotateOnHover={true} />
      </div>
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 opacity-8">
        <Orb hue={320} hoverIntensity={0.3} rotateOnHover={true} />
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Enhanced Header Section */}
        <div className="bg-black/30 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 mb-10 border border-white/10 relative overflow-hidden">
          {/* Header Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 opacity-50"></div>
          
          <div className="relative z-10">
            <Breadcrumb items={breadcrumbItems} />
            <div className="mt-6 flex items-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                <div className="relative w-16 h-16 p-3 rounded-2xl text-white bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold">{category.name?.[0] || 'S'}</span>
                </div>
              </div>
              <div className="ml-6">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                    {category.name || category.slug}
                  </span>
                </h1>
                {category.description && (
                  <p className="text-lg text-gray-300 leading-relaxed">{category.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row -mx-4">
          {/* Sidebar for Subcategories */}
          {category.children && category.children.length > 0 && (
            <SubCategorySidebar 
              category={category}
              selectedSubCategory={selectedSubCategory}
              onSelectSubCategory={setSelectedSubCategory}
              services={services}
            />
          )}

          {/* Main Content */}
          <div className={`w-full p-4 ${category.children && category.children.length > 0 ? 'md:w-3/4 lg:w-4/5' : ''}`}>
            <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-xl mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {currentCategoryName}
                  </h2>
                  {!selectedSubCategory && category.children && category.children.length > 0 && (
                    <span className="text-sm text-gray-400">
                      Including all subcategories
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  {servicesLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                      <span className="text-gray-300">
                        {selectedSubCategory ? 'Loading services...' : 'Loading all services...'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-300 font-medium">{sortedServices.length} services</span>
                  )}
                  <div className="relative">
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      title="Sort services"
                      className="appearance-none bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:bg-white/20 transition-all duration-300"
                    >
                      <option value="relevance" className="bg-gray-900 text-white">Sort by: Relevance</option>
                      <option value="price-low" className="bg-gray-900 text-white">Sort by: Price (Low to High)</option>
                      <option value="price-high" className="bg-gray-900 text-white">Sort by: Price (High to Low)</option>
                      <option value="newest" className="bg-gray-900 text-white">Sort by: Newest First</option>
                      <option value="oldest" className="bg-gray-900 text-white">Sort by: Oldest First</option>
                    </select>
                    <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Services Grid */}
            {servicesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 animate-pulse border border-white/10">
                    <div className="w-full h-48 bg-white/10 rounded-xl mb-4"></div>
                    <div className="h-4 bg-white/10 rounded mb-3"></div>
                    <div className="h-4 bg-white/10 rounded mb-3 w-3/4"></div>
                    <div className="h-4 bg-white/10 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : sortedServices.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedServices.map(service => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-12 border border-white/10 shadow-xl max-w-lg mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">No Services Found</h3>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    {selectedSubCategory 
                      ? `There are currently no active services available in this subcategory.`
                      : `There are currently no active services available in "${category.name}" or its subcategories.`
                    }
                  </p>
                  {!selectedSubCategory && category.children && category.children.length > 0 && (
                    <p className="text-gray-400 text-sm">
                      Try selecting a specific subcategory from the sidebar.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCategoryPage;
