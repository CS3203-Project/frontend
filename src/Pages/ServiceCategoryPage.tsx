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
  allServices: ServiceResponse[];
  isLoading?: boolean;
}> = ({ category, selectedSubCategory, onSelectSubCategory, services, allServices, isLoading }) => {
  
  // Calculate service counts for each subcategory using allServices to maintain accurate counts
  const getSubcategoryServiceCount = (subcategoryId: string) => {
    return allServices.filter(service => service.category?.id === subcategoryId).length;
  };
  
  const getAllCategoryServiceCount = () => {
    return allServices.length;
  };
  
  return (
    <div className="w-full md:w-1/4 lg:w-1/5 p-4">
      <div className="bg-white/70 dark:bg-black/30 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.08)] border border-white/30 dark:border-white/10 p-6">
        <h3 className="text-xl font-bold mb-4 text-black dark:text-white border-b border-white/30 dark:border-white/20 pb-3">Subcategories</h3>
        <ul className="space-y-3">
          <li>
            <button
              onClick={() => onSelectSubCategory(null)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                selectedSubCategory === null
                  ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-lg border border-black dark:border-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10 hover:text-black dark:hover:text-white border border-white/30 dark:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>All {category.name}</span>
                {isLoading && allServices.length === 0 ? (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    selectedSubCategory === null 
                      ? 'bg-white/20 text-black dark:bg-black/20 dark:text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                    <Loader2 className="w-3 h-3 animate-spin inline" />
                  </span>
                ) : (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    selectedSubCategory === null 
                      ? 'bg-white/20 text-black dark:bg-black/20 dark:text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                    {getAllCategoryServiceCount()}
                  </span>
                )}
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
                      ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-lg border border-black dark:border-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10 hover:text-black dark:hover:text-white border border-white/30 dark:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{sub.name}</span>
                    {isLoading && allServices.length === 0 ? (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        selectedSubCategory === sub.id 
                          ? 'bg-white/20 text-black dark:bg-black/20 dark:text-white' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        <Loader2 className="w-3 h-3 animate-spin inline" />
                      </span>
                    ) : (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        selectedSubCategory === sub.id 
                          ? 'bg-white/20 text-black dark:bg-black/20 dark:text-white' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        {serviceCount}
                      </span>
                    )}
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
  const [allServices, setAllServices] = useState<ServiceResponse[]>([]); // Store all services for count calculation
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

  // Fetch all services initially for accurate counts
  useEffect(() => {
    const fetchAllServices = async () => {
      if (!category) return;
      
      try {
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
        let fetchedServices: ServiceResponse[] = [];
        responses.forEach(response => {
          if (response.success) {
            fetchedServices.push(...response.data);
          }
        });
        
        // Remove duplicates if any
        const uniqueServices = fetchedServices.filter((service, index, self) =>
          index === self.findIndex(s => s.id === service.id)
        );
        
        setAllServices(uniqueServices);
        setServices(uniqueServices);
        
      } catch (err) {
        console.error('Failed to fetch services:', err);
        setAllServices([]);
        setServices([]);
      }
    };

    fetchAllServices();
  }, [category]);

  // Filter services when subcategory changes
  useEffect(() => {
    if (!category || allServices.length === 0) return;
    
    setServicesLoading(true);
    
    // Use setTimeout to simulate smooth transition and prevent flickering
    const timeoutId = setTimeout(() => {
      if (selectedSubCategory) {
        // Filter to show only selected subcategory services
        const filtered = allServices.filter(service => service.category?.id === selectedSubCategory);
        setServices(filtered);
      } else {
        // Show all services
        setServices(allServices);
      }
      setServicesLoading(false);
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [selectedSubCategory, allServices, category]);

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
      <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
        {/* Square Grid Background with fade */}
        <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#e5e7eb_0.5px,transparent_0.5px),linear-gradient(to_bottom,#e5e7eb_0.5px,transparent_0.5px)] dark:bg-[linear-gradient(to_right,#374151_0.5px,transparent_0.5px),linear-gradient(to_bottom,#374151_0.5px,transparent_0.5px)] bg-[size:4rem_4rem] opacity-30 [mask-image:linear-gradient(to_bottom,black_0%,black_50%,transparent_100%)]" />
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header Skeleton */}
          <div className="bg-white/70 dark:bg-black/30 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.08)] p-8 md:p-10 mb-10 border border-white/30 dark:border-white/10">
            <div className="animate-pulse">
              {/* Breadcrumb skeleton */}
              <div className="flex items-center space-x-2 mb-6">
                <div className="h-4 w-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
              {/* Title skeleton */}
              <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
              {/* Description skeleton */}
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row -mx-4">
            {/* Sidebar Skeleton */}
            <div className="w-full md:w-1/4 lg:w-1/5 p-4">
              <div className="bg-white/70 dark:bg-black/30 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.08)] border border-white/30 dark:border-white/10 p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-10 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="w-full md:w-3/4 lg:w-4/5 p-4">
              {/* Controls Skeleton */}
              <div className="bg-white/70 dark:bg-black/30 backdrop-blur-xl rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.08)] border border-white/30 dark:border-white/10 mb-8">
                <div className="animate-pulse flex justify-between items-center">
                  <div>
                    <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                  </div>
                  <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-48"></div>
                </div>
              </div>

              {/* Services Grid Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-white/30 dark:border-gray-700 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.08)] overflow-hidden">
                      <div className="w-full h-64 bg-gray-300 dark:bg-gray-700"></div>
                      <div className="p-6">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
                        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-full mb-3"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
                        <div className="flex justify-between items-center">
                          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
        {/* Enhanced Square Grid Background with fade effect */}
        <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#e5e7eb_0.5px,transparent_0.5px),linear-gradient(to_bottom,#e5e7eb_0.5px,transparent_0.5px)] dark:bg-[linear-gradient(to_right,#374151_0.5px,transparent_0.5px),linear-gradient(to_bottom,#374151_0.5px,transparent_0.5px)] bg-[size:4rem_4rem] opacity-30 [mask-image:linear-gradient(to_bottom,black_0%,black_50%,transparent_100%)]" />
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="bg-white/70 dark:bg-black/30 backdrop-blur-xl rounded-2xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.08)] border border-white/30 dark:border-white/10">
                <h2 className="text-3xl font-bold text-black dark:text-white mb-6">
                  Category Not Found
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  {error || 'The category you\'re looking for doesn\'t exist or couldn\'t be loaded.'}
                </p>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 backdrop-blur-sm border border-yellow-200 dark:border-yellow-800/30 rounded-xl p-6 mb-8">
                  <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-400 mb-3">Troubleshooting:</h3>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 text-left space-y-2">
                    <li>• Check if the category "{categorySlug}" exists in your database</li>
                    <li>• Verify the category slug is correct</li>
                    <li>• Check the browser console for available categories</li>
                    <li>• Ensure your backend is running and accessible</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <button
                    onClick={() => window.location.href = '/services'}
                    className="w-full bg-black hover:bg-black/90 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black px-6 py-3 rounded-xl transition-all duration-300 font-semibold shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.12)] hover:scale-105 border border-black dark:border-white"
                  >
                    Browse All Services
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-white/70 dark:bg-white/10 backdrop-blur-sm text-black dark:text-white px-6 py-3 rounded-xl hover:bg-white/90 dark:hover:bg-white/20 transition-all duration-300 border border-white/30 dark:border-white/20 hover:border-white/50 dark:hover:border-white/30"
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
    <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
      {/* Enhanced Square Grid Background with fade effect */}
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#e5e7eb_0.5px,transparent_0.5px),linear-gradient(to_bottom,#e5e7eb_0.5px,transparent_0.5px)] dark:bg-[linear-gradient(to_right,#374151_0.5px,transparent_0.5px),linear-gradient(to_bottom,#374151_0.5px,transparent_0.5px)] bg-[size:4rem_4rem] opacity-30 [mask-image:linear-gradient(to_bottom,black_0%,black_50%,transparent_100%)]" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Enhanced Header Section */}
        <div className="bg-white/70 dark:bg-black/30 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.08)] p-8 md:p-10 mb-10 border border-white/30 dark:border-white/10 relative overflow-hidden">
          {/* Header Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-gray-500/5 to-black/5 dark:from-white/5 dark:via-gray-400/5 dark:to-white/5 opacity-50"></div>
          
          <div className="relative z-10">
            <Breadcrumb items={breadcrumbItems} />
            <div className="mt-6">
              <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-2">
                <span className="bg-gradient-to-r from-black via-gray-700 to-black dark:from-white dark:via-gray-300 dark:to-white bg-clip-text text-transparent">
                  {category.name || category.slug}
                </span>
              </h1>
              {category.description && (
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">{category.description}</p>
              )}
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
              allServices={allServices}
              isLoading={servicesLoading}
            />
          )}

          {/* Main Content */}
          <div className={`w-full p-4 ${category.children && category.children.length > 0 ? 'md:w-3/4 lg:w-4/5' : ''}`}>
            <div className="bg-white/70 dark:bg-black/30 backdrop-blur-xl rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.08)] border border-white/30 dark:border-white/10 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-black dark:text-white mb-2">
                    {currentCategoryName}
                  </h2>
                  {!selectedSubCategory && category.children && category.children.length > 0 && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Including all subcategories
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  {servicesLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin text-black dark:text-white" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {selectedSubCategory ? 'Loading services...' : 'Loading all services...'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-600 dark:text-gray-400 font-medium">{sortedServices.length} services</span>
                  )}
                  <div className="relative">
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      title="Sort services"
                      className="appearance-none bg-white/50 dark:bg-white/10 backdrop-blur-sm border border-white/30 dark:border-white/20 rounded-xl py-3 pl-4 pr-12 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent hover:bg-white/70 dark:hover:bg-white/20 transition-all duration-300"
                    >
                      <option value="relevance" className="bg-white dark:bg-gray-800 text-black dark:text-white">Sort by: Relevance</option>
                      <option value="price-low" className="bg-white dark:bg-gray-800 text-black dark:text-white">Sort by: Price (Low to High)</option>
                      <option value="price-high" className="bg-white dark:bg-gray-800 text-black dark:text-white">Sort by: Price (High to Low)</option>
                      <option value="newest" className="bg-white dark:bg-gray-800 text-black dark:text-white">Sort by: Newest First</option>
                      <option value="oldest" className="bg-white dark:bg-gray-800 text-black dark:text-white">Sort by: Oldest First</option>
                    </select>
                    <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Services Grid */}
            {servicesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-white/30 dark:border-gray-700 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.08)] p-6">
                      <div className="w-full h-48 bg-gray-300 dark:bg-gray-700 rounded-xl mb-4"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-3"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-3 w-3/4"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedServices.map(service => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="bg-white/70 dark:bg-black/30 backdrop-blur-xl rounded-2xl p-12 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.08)] border border-white/30 dark:border-white/10 max-w-lg mx-auto">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-black dark:text-white mb-4">No Services Found</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                    {selectedSubCategory 
                      ? `There are currently no active services available in this subcategory.`
                      : `There are currently no active services available in "${category.name}" or its subcategories.`
                    }
                  </p>
                  {!selectedSubCategory && category.children && category.children.length > 0 && (
                    <p className="text-gray-500 dark:text-gray-500 text-sm">
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
