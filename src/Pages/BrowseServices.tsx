import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Search, Filter, Grid3X3, List, Sparkles, Star, Users } from 'lucide-react';
import SpecificSearchCard from '../components/services/SpecificSearchCard';
import { categoryApi, type Category } from '../api/categoryApi';
import { getCategoryIcon, getCategoryGradient } from '../utils/categoryMapper';
import { semanticSearchApi, type SemanticSearchResult } from '../api/semanticSearchApi';

interface BrowseServicesState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  viewMode: 'grid' | 'list';
  sortBy: 'name' | 'services' | 'popular';
  semanticSearchResults: SemanticSearchResult[];
  isSemanticSearchActive: boolean;
  isSemanticSearching: boolean;
}

const BrowseServices: React.FC = () => {
  const [state, setState] = useState<BrowseServicesState>({
    categories: [],
    loading: true,
    error: null,
    searchTerm: '',
    viewMode: 'grid',
    sortBy: 'name',
    semanticSearchResults: [],
    isSemanticSearchActive: false,
    isSemanticSearching: false
  });
  const navigate = useNavigate();

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const response = await categoryApi.getRootCategories({
          includeChildren: true
        });
        
        if (response.success) {
          setState(prev => ({ 
            ...prev, 
            categories: response.data,
            loading: false 
          }));
        } else {
          setState(prev => ({ 
            ...prev, 
            error: 'Failed to load categories',
            loading: false 
          }));
        }
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Failed to load categories',
          loading: false 
        }));
      }
    };

    fetchCategories();
  }, []);

  // Filter and sort categories
  const filteredAndSortedCategories = React.useMemo(() => {
    let filtered = state.categories;

    // Apply search filter
    if (state.searchTerm) {
      filtered = filtered.filter(category => 
        category.name?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(state.searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (state.sortBy) {
        case 'services':
          return (b._count?.services || 0) - (a._count?.services || 0);
        case 'popular':
          return (b._count?.services || 0) - (a._count?.services || 0);
        case 'name':
        default:
          return (a.name || '').localeCompare(b.name || '');
      }
    });

    return filtered;
  }, [state.categories, state.searchTerm, state.sortBy]);

  const handleSearch = async (value: string) => {
    setState(prev => ({ ...prev, searchTerm: value }));
    
    // If the search term is substantial, also perform semantic search
    if (value.trim().length >= 3) {
      await performSemanticSearch(value.trim());
    } else {
      // Clear semantic search results for short queries
      setState(prev => ({ 
        ...prev, 
        semanticSearchResults: [],
        isSemanticSearchActive: false 
      }));
    }
  };

  const performSemanticSearch = async (query: string) => {
    try {
      setState(prev => ({ ...prev, isSemanticSearching: true }));
      
      const response = await semanticSearchApi.searchServices({
        query,
        threshold: 0.4,
        limit: 12
      });

      if (response.success) {
        setState(prev => ({ 
          ...prev, 
          semanticSearchResults: response.data.results,
          isSemanticSearchActive: true,
          isSemanticSearching: false
        }));
      }
    } catch (error) {
      console.error('Semantic search failed:', error);
      setState(prev => ({ ...prev, isSemanticSearching: false }));
    }
  };

  const clearSemanticSearch = () => {
    setState(prev => ({ 
      ...prev, 
      semanticSearchResults: [],
      isSemanticSearchActive: false,
      searchTerm: ''
    }));
  };

  const handleSortChange = (sortBy: 'name' | 'services' | 'popular') => {
    setState(prev => ({ ...prev, sortBy }));
  };

  const handleViewModeChange = (viewMode: 'grid' | 'list') => {
    setState(prev => ({ ...prev, viewMode }));
  };

  if (state.loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
              Loading Services
            </h1>
            <p className="text-lg text-gray-600">
              Please wait while we fetch the latest categories...
            </p>
          </div>
          
          {/* Loading skeleton */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-start">
                    <div className="w-14 h-14 bg-gray-200 rounded-lg"></div>
                    <div className="ml-4 flex-1">
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                  <div className="mt-4 h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
              Unable to Load Services
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              {state.error}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12 mt-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Browse Our Services
          </h1>
          <p className="mt-3 max-w-md mx-auto text-lg text-gray-600 sm:text-xl md:mt-5 md:max-w-3xl">
            Find the right professional for any job, from home repairs to business consulting.
            {state.categories.length > 0 && (
              <span className="block mt-2 text-sm font-medium text-blue-600">
                {state.categories.length} categories • {state.categories.reduce((sum, cat) => sum + (cat._count?.services || 0), 0)} services available
              </span>
            )}
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search categories or services (e.g., 'photography', 'marketing')..."
                value={state.searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {state.isSemanticSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                </div>
              )}
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={state.sortBy}
                onChange={(e) => handleSortChange(e.target.value as 'name' | 'services' | 'popular')}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="services">Most Services</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-2 rounded-md transition-colors ${
                  state.viewMode === 'grid' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`p-2 rounded-md transition-colors ${
                  state.viewMode === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Semantic Search Results */}
        {state.isSemanticSearchActive && state.semanticSearchResults.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Smart Search Results for "{state.searchTerm}"
                </h3>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {state.semanticSearchResults.length} found
                </span>
              </div>
              <button
                onClick={clearSemanticSearch}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                Clear
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.semanticSearchResults.map((service) => (
                <Link
                  key={service.id}
                  to={`/services/detail/${service.id}`}
                  className="group block bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="flex items-start space-x-3">
                    {service.images && service.images.length > 0 ? (
                      <img
                        src={service.images[0]}
                        alt={service.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {service.title}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {service.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-medium text-green-600">
                          {service.currency} {service.price}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {Math.round(service.similarity * 100)}% match
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {service.category.name} • {service.provider.user.firstName} {service.provider.user.lastName}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/services/search', { 
                  state: { 
                    results: state.semanticSearchResults, 
                    query: state.searchTerm,
                    searchType: 'semantic'
                  } 
                })}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View all {state.semanticSearchResults.length} results →
              </button>
            </div>
          </div>
        )}

        {/* Categories Grid/List */}
        {filteredAndSortedCategories.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-600">
              {state.searchTerm 
                ? `No categories match "${state.searchTerm}". Try adjusting your search.`
                : "No categories are currently available."
              }
            </p>
          </div>
        ) : (
          <div className={`${
            state.viewMode === 'grid' 
              ? 'grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3' 
              : 'space-y-4'
          }`}>
            {filteredAndSortedCategories.map((category) => {
              const IconComponent = getCategoryIcon(category.slug);
              const gradient = getCategoryGradient(category.slug);
              
              return (
                <Link
                  key={category.id}
                  to={`/services/${category.slug}`}
                  className={`group block rounded-xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 ${
                    state.viewMode === 'list' ? 'p-4' : 'p-6'
                  }`}
                >
                  <div className={`flex items-start ${state.viewMode === 'list' ? 'space-x-4' : ''}`}>
                    <div className={`flex-shrink-0 p-3 rounded-lg bg-gradient-to-r ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-7 w-7" />
                    </div>
                    <div className={state.viewMode === 'list' ? 'flex-1' : 'ml-4 flex-1'}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {category.name || 'Unnamed Category'}
                        </h3>
                        {category._count?.services && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {category._count.services} services
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-gray-600 group-hover:text-gray-700 transition-colors">
                        {category.description || 'No description available'}
                      </p>
                      
                      {/* Subcategories preview */}
                      {category.children && category.children.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {category.children.slice(0, 3).map((subcategory) => (
                            <span
                              key={subcategory.id}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors"
                            >
                              {subcategory.name}
                            </span>
                          ))}
                          {category.children.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-500">
                              +{category.children.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {category._count?.services && (
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{category._count.services} providers</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-400" />
                        <span>4.8</span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                      <span>Explore Services</span>
                      <ArrowRight className="h-4 w-4 ml-1 transform transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Bottom CTA Section */}
        <div className="mt-16">
          <SpecificSearchCard />
        </div>

        {/* Stats Section */}
        {state.categories.length > 0 && (
          <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Thousands</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2 text-blue-600">
                    {state.categories.length}+
                  </div>
                  <div className="text-gray-600">Service Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2 text-blue-600">
                    {state.categories.reduce((sum, cat) => sum + (cat._count?.services || 0), 0)}+
                  </div>
                  <div className="text-gray-600">Active Services</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2 text-blue-600">4.8</div>
                  <div className="text-gray-600">Average Rating</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseServices;
