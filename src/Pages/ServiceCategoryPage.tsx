import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ServiceCard from '../components/services/ServiceCard';
import Breadcrumb from '../components/services/Breadcrumb';
import { serviceApi } from '../api/serviceApi';
import { categoryApi } from '../api/categoryApi';
import type { ServiceResponse } from '../api/serviceApi';
import type { Category } from '../api/categoryApi';
import { ChevronDown, Loader2 } from 'lucide-react';

const SubCategorySidebar: React.FC<{
  category: Category;
  selectedSubCategory: string | null;
  onSelectSubCategory: (categoryId: string | null) => void;
}> = ({ category, selectedSubCategory, onSelectSubCategory }) => {
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
            All {category.name}
          </button>
        </li>
        {category.children && category.children.map((sub) => (
          <li key={sub.id}>
            <button
              onClick={() => onSelectSubCategory(sub.id)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-200 flex items-center justify-between ${
                selectedSubCategory === sub.id
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{sub.name}</span>
            </button>
          </li>
        ))}
      </ul>
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
        const params = {
          categoryId: selectedSubCategory || category.id,
          isActive: true,
          take: 50 // Limit results
        };
        
        const response = await serviceApi.getServices(params);
        
        if (response.success) {
          setServices(response.data);
        } else {
          console.error('Failed to fetch services:', response.message);
          setServices([]);
        }
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
        return servicesCopy.sort((a, b) => a.price - b.price);
      case 'price-high':
        return servicesCopy.sort((a, b) => b.price - a.price);
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
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading category...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Category Not Found
              </h2>
              <p className="text-gray-600 mb-6">
                {error || 'The category you\'re looking for doesn\'t exist or couldn\'t be loaded.'}
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">Troubleshooting:</h3>
                <ul className="text-sm text-yellow-700 text-left space-y-1">
                  <li>• Check if the category "{categorySlug}" exists in your database</li>
                  <li>• Verify the category slug is correct</li>
                  <li>• Check the browser console for available categories</li>
                  <li>• Ensure your backend is running and accessible</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/services'}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse All Services
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Retry Loading
                </button>
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
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8">
          <Breadcrumb items={breadcrumbItems} />
          <div className="mt-4 flex items-center">
            <div className="w-12 h-12 p-2 rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-xl font-bold">{category.name?.[0] || 'S'}</span>
            </div>
            <div className="ml-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {category.name || category.slug}
              </h1>
              {category.description && (
                <p className="text-md text-gray-600 mt-1">{category.description}</p>
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
            />
          )}

          {/* Main Content */}
          <div className={`w-full p-4 ${category.children && category.children.length > 0 ? 'md:w-3/4 lg:w-4/5' : ''}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {currentCategoryName}
              </h2>
              <div className="flex items-center space-x-4">
                {servicesLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-gray-600">Loading services...</span>
                  </div>
                ) : (
                  <span className="text-gray-600">{sortedServices.length} services</span>
                )}
                <div className="relative">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="relevance">Sort by: Relevance</option>
                    <option value="price-low">Sort by: Price (Low to High)</option>
                    <option value="price-high">Sort by: Price (High to Low)</option>
                    <option value="newest">Sort by: Newest First</option>
                    <option value="oldest">Sort by: Oldest First</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Services Grid */}
            {servicesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
              <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700">No services found</h3>
                <p className="text-gray-500 mt-2">
                  There are currently no active services available in this category.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCategoryPage;
