import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Search, Grid3X3, List, Sparkles, Users, RefreshCw, MapPin } from 'lucide-react';
import { categoryApi, type Category } from '../api/categoryApi';
import { getCategoryIcon, getCategoryGradient } from '../utils/categoryMapper';
import { hybridSearchApi, type HybridSearchResult, type LocationParams } from '../api/hybridSearchApi';
import LocationPickerAdvanced from '../components/LocationPickerAdvanced';
import Orb from '../components/Orb';

interface BrowseServicesState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  viewMode: 'grid' | 'list';
  sortBy: 'name' | 'services' | 'popular';
  hybridSearchResults: HybridSearchResult[];
  isHybridSearchActive: boolean;
  isSearching: boolean;
  refreshing: boolean;
  locationFilter: LocationParams | null;
  showLocationFilter: boolean;
  searchType: 'hybrid' | 'semantic' | 'location' | 'general';
}

const BrowseServicesEnhanced: React.FC = () => {
  const [state, setState] = useState<BrowseServicesState>({
    categories: [],
    loading: true,
    error: null,
    searchTerm: '',
    viewMode: 'grid',
    sortBy: 'name',
    hybridSearchResults: [],
    isHybridSearchActive: false,
    isSearching: false,
    refreshing: false,
    locationFilter: null,
    showLocationFilter: false,
    searchType: 'general'
  });
  const navigate = useNavigate();

  // Calculate total service count including subcategories
  const getTotalServiceCount = (category: Category): number => {
    // Start with direct services count from this category
    let total = category._count?.services || 0;
    
    // Add services from all subcategories recursively
    if (category.children && Array.isArray(category.children) && category.children.length > 0) {
      category.children.forEach(child => {
        // Recursively count services from subcategories
        total += getTotalServiceCount(child);
      });
    }
    
    return total;
  };

  // Fetch categories function that can be reused
  const fetchCategories = async (isRefresh = false) => {
    try {
      setState(prev => ({ 
        ...prev, 
        loading: !isRefresh, 
        refreshing: isRefresh,
        error: null 
      }));
      
      const response = await categoryApi.getRootCategories({
        includeChildren: true
      });
      
      console.log('Categories API response:', response);
      
      if (response.success) {
        console.log('Categories data:', response.data);
        setState(prev => ({ 
          ...prev, 
          categories: response.data,
          loading: false,
          refreshing: false
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to load categories',
          loading: false,
          refreshing: false
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load categories',
        loading: false,
        refreshing: false
      }));
    }
  };

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Add window focus event listener to refresh data when user returns to page
  useEffect(() => {
    const handleWindowFocus = () => {
      // Only refresh if we have categories already (not on initial load)
      if (state.categories.length > 0 && !state.loading && !state.refreshing) {
        console.log('Window focused, refreshing category data...');
        fetchCategories(true);
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [state.categories.length, state.loading, state.refreshing]);

  // Perform hybrid search when search term or location changes
  useEffect(() => {
    const performSearch = async () => {
      const hasQuery = state.searchTerm.trim().length >= 3;
      const hasLocation = state.locationFilter?.latitude && state.locationFilter?.longitude;

      if (hasQuery || hasLocation) {
        await performHybridSearch();
      } else {
        // Clear search results for short queries and no location
        setState(prev => ({ 
          ...prev, 
          hybridSearchResults: [],
          isHybridSearchActive: false,
          searchType: 'general'
        }));
      }
    };

    // Debounce search
    const timeoutId = setTimeout(performSearch, 500);
    return () => clearTimeout(timeoutId);
  }, [state.searchTerm, state.locationFilter]);

  // Filter and sort categories
  const filteredAndSortedCategories = React.useMemo(() => {
    let filtered = state.categories;

    // Apply search filter only when not in hybrid search mode
    if (state.searchTerm && !state.isHybridSearchActive) {
      filtered = filtered.filter(category => 
        category.name?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(state.searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (state.sortBy) {
        case 'services':
          return getTotalServiceCount(b) - getTotalServiceCount(a);
        case 'popular':
          return getTotalServiceCount(b) - getTotalServiceCount(a);
        case 'name':
        default:
          return (a.name || '').localeCompare(b.name || '');
      }
    });

    return filtered;
  }, [state.categories, state.searchTerm, state.sortBy, state.isHybridSearchActive]);

  const handleSearch = (value: string) => {
    setState(prev => ({ ...prev, searchTerm: value }));
    // Search will be triggered by useEffect
  };

  const performHybridSearch = async () => {
    const query = state.searchTerm.trim();
    const location = state.locationFilter;

    if (!query && !location) return;

    try {
      setState(prev => ({ ...prev, isSearching: true }));
      
      const response = await hybridSearchApi.searchServices({
        query: query || undefined,
        location: location || undefined,
        threshold: 0.4,
        limit: 20,
        includeWithoutLocation: true
      });

      if (response.success) {
        setState(prev => ({ 
          ...prev, 
          hybridSearchResults: response.data.results,
          isHybridSearchActive: true,
          isSearching: false,
          searchType: response.data.searchType
        }));
      }
    } catch (error) {
      console.error('Hybrid search failed:', error);
      setState(prev => ({ ...prev, isSearching: false }));
    }
  };

  const clearSearch = () => {
    setState(prev => ({ 
      ...prev, 
      hybridSearchResults: [],
      isHybridSearchActive: false,
      searchTerm: '',
      locationFilter: null,
      searchType: 'general'
    }));
  };

  const handleLocationChange = (location: LocationParams | null) => {
    setState(prev => ({ ...prev, locationFilter: location }));
    // Search will be triggered by useEffect
  };

  const handleViewSearchResults = () => {
    if (state.hybridSearchResults.length > 0) {
      navigate('/search-results-enhanced', {
        state: {
          results: state.hybridSearchResults,
          query: state.searchTerm || undefined,
          location: state.locationFilter ? {
            latitude: state.locationFilter.latitude,
            longitude: state.locationFilter.longitude,
            radius: state.locationFilter.radius
          } : undefined,
          searchType: state.searchType
        }
      });
    }
  };

  const handleSortChange = (sortBy: 'name' | 'services' | 'popular') => {
    setState(prev => ({ ...prev, sortBy }));
  };

  const handleViewModeChange = (viewMode: 'grid' | 'list') => {
    setState(prev => ({ ...prev, viewMode }));
  };

  const getSearchTypeLabel = () => {
    switch (state.searchType) {
      case 'hybrid': return 'Smart Search (Text + Location)';
      case 'semantic': return 'Semantic Search';
      case 'location': return 'Location-based Search';
      case 'general': return 'General Browse';
      default: return 'Browse Services';
    }
  };

  if (state.loading) {
    return (
      <div className="bg-black min-h-screen">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center mb-12 pt-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-black/50 backdrop-blur-lg rounded-full mb-4 border border-gray-800">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h1 className="text-4xl font-extrabold text-white mb-4">
              Loading Services
            </h1>
            <p className="text-lg text-gray-300">
              Please wait while we fetch the latest categories...
            </p>
          </div>
          
          {/* Loading skeleton */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="rounded-xl bg-gray-800/50 backdrop-blur-lg border border-gray-700 p-6 shadow-lg">
                  <div className="flex items-start">
                    <div className="w-14 h-14 bg-gray-700 rounded-lg"></div>
                    <div className="ml-4 flex-1">
                      <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
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
      <div className="bg-black min-h-screen">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center pt-20">
            <h1 className="text-4xl font-extrabold text-white mb-4">
              Something went wrong
            </h1>
            <p className="text-lg text-gray-300 mb-6">
              {state.error}
            </p>
            <button
              onClick={() => fetchCategories()}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
      {/* Enhanced Animated Orb Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 opacity-30 blur-sm">
          <Orb hue={280} hoverIntensity={0.3} rotateOnHover={true} />
        </div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 opacity-20 blur-sm">
          <Orb hue={200} hoverIntensity={0.2} rotateOnHover={true} />
        </div>
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 opacity-25 blur-sm">
          <Orb hue={320} hoverIntensity={0.3} rotateOnHover={true} />
        </div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12 pt-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-black/50 backdrop-blur-lg rounded-full mb-4 border border-gray-800">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold text-white mb-4">
              {getSearchTypeLabel()}
            </h1>
            <p className="text-lg text-gray-300">
              {state.isHybridSearchActive 
                ? `Found ${state.hybridSearchResults.length} matching services`
                : 'Discover amazing services from verified providers'
              }
            </p>
          </div>

          {/* Enhanced Search Section */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-black/30 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
              {/* Main Search Bar */}
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search for services (e.g., 'web development', 'plumbing', 'graphic design')"
                  value={state.searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
                {state.isSearching && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                  </div>
                )}
              </div>

              {/* Location and Filters Row */}
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                {/* Location Filter */}
                <div className="flex-1">
                  <button
                    onClick={() => setState(prev => ({ ...prev, showLocationFilter: !prev.showLocationFilter }))}
                    className={`w-full sm:w-auto px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      state.showLocationFilter || state.locationFilter
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white/10 text-gray-300 border-white/20 hover:bg-white/20'
                    }`}
                  >
                    <MapPin className="w-4 h-4 mr-2 inline" />
                    {state.locationFilter ? 'Location Set' : 'Add Location'}
                  </button>
                  
                  {state.showLocationFilter && (
                    <div className="mt-4">
                      <LocationPickerAdvanced
                        value={state.locationFilter || undefined}
                        onChange={handleLocationChange}
                        placeholder="Search by location..."
                        showRadius={true}
                        defaultRadius={10}
                        maxRadius={50}
                        autoDetect={false}
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {(state.searchTerm || state.locationFilter) && (
                    <button
                      onClick={clearSearch}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                    >
                      Clear
                    </button>
                  )}
                  
                  {state.isHybridSearchActive && state.hybridSearchResults.length > 0 && (
                    <button
                      onClick={handleViewSearchResults}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      View All Results
                      <ArrowRight className="w-4 h-4 ml-1 inline" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Search Results Preview */}
          {state.isHybridSearchActive && state.hybridSearchResults.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  Search Results
                </h2>
                <span className="text-gray-400">
                  Showing {Math.min(6, state.hybridSearchResults.length)} of {state.hybridSearchResults.length} results
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {state.hybridSearchResults.slice(0, 6).map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    viewMode="grid"
                    showDistance={state.locationFilter !== null}
                  />
                ))}
              </div>

              {state.hybridSearchResults.length > 6 && (
                <div className="text-center">
                  <button
                    onClick={handleViewSearchResults}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    View All {state.hybridSearchResults.length} Results
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Categories Section - Show when not in active search mode */}
          {!state.isHybridSearchActive && (
            <>
              {/* Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-300">Sort by:</span>
                  <select
                    value={state.sortBy}
                    onChange={(e) => handleSortChange(e.target.value as 'name' | 'services' | 'popular')}
                    className="px-3 py-2 bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="name" className="bg-gray-800 text-white">Name</option>
                    <option value="services" className="bg-gray-800 text-white">Most Services</option>
                    <option value="popular" className="bg-gray-800 text-white">Most Popular</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-300">View:</span>
                  <div className="flex items-center bg-black/30 backdrop-blur-sm rounded-lg p-1 border border-white/20">
                    <button
                      onClick={() => handleViewModeChange('grid')}
                      className={`p-2 rounded-md transition-colors ${
                        state.viewMode === 'grid' 
                          ? 'bg-white/20 text-white shadow-sm' 
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleViewModeChange('list')}
                      className={`p-2 rounded-md transition-colors ${
                        state.viewMode === 'list' 
                          ? 'bg-white/20 text-white shadow-sm' 
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Categories Grid */}
              {filteredAndSortedCategories.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No categories found</h3>
                  <p className="text-gray-400 mb-4">
                    Try adjusting your search terms or clear the search to see all categories
                  </p>
                  <button
                    onClick={clearSearch}
                    className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 hover:border-white/30 transition-all duration-200"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className={state.viewMode === 'grid' 
                  ? 'grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3' 
                  : 'space-y-4'
                }>
                  {filteredAndSortedCategories.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      viewMode={state.viewMode}
                      getTotalServiceCount={getTotalServiceCount}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

// Service Card Component for search results preview
interface ServiceCardProps {
  service: HybridSearchResult;
  viewMode: 'grid' | 'list';
  showDistance: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, viewMode, showDistance }) => {
  const price = typeof service.price === 'string' ? parseFloat(service.price) : service.price;

  return (
    <Link
      to={`/services/detail/${service.id}`}
      className={`group block bg-black/30 backdrop-blur-lg rounded-xl shadow-lg border border-white/10 hover:border-white/20 hover:bg-black/40 transition-all duration-200 hover:-translate-y-1 ${
        viewMode === 'list' ? 'p-4' : 'p-6'
      }`}
    >
      <div className={`${viewMode === 'list' ? 'flex items-start space-x-4' : ''}`}>
        {/* Service Image */}
        <div className={`flex-shrink-0 ${viewMode === 'list' ? 'w-24 h-24' : 'w-full h-48 mb-4'}`}>
          <div className={`w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg overflow-hidden ${
            viewMode === 'list' ? '' : ''
          }`}>
            {service.images && service.images.length > 0 ? (
              <img
                src={service.images[0]}
                alt={service.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-full h-full flex items-center justify-center ${service.images && service.images.length > 0 ? 'hidden' : ''}`}>
              <span className="text-4xl">🎯</span>
            </div>
          </div>
        </div>

        {/* Service Content */}
        <div className={`flex-1 ${viewMode === 'list' ? '' : ''}`}>
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors line-clamp-2">
              {service.title}
            </h3>
            {service.similarity && (
              <div className="ml-2 px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full font-medium">
                {Math.round(service.similarity * 100)}% match
              </div>
            )}
          </div>

          <p className="text-gray-400 text-sm mb-3 line-clamp-3">
            {service.description}
          </p>

          {/* Tags */}
          {service.tags && service.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {service.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {service.tags.length > 3 && (
                <span className="px-2 py-1 bg-white/10 text-gray-400 text-xs rounded-full">
                  +{service.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Provider and Category */}
          <div className="flex items-center text-sm text-gray-400 mb-3">
            <span>
              by {service.provider.user.firstName} {service.provider.user.lastName}
            </span>
            <span className="mx-2">•</span>
            <span>{service.category.name}</span>
          </div>

          {/* Distance and Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {showDistance && service.distance_km !== undefined && service.distance_km !== null && (
                <div className="flex items-center text-sm text-blue-400">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{service.distance_km.toFixed(1)} km away</span>
                </div>
              )}
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold text-white">
                {service.currency} {price?.toLocaleString()}
              </div>
              {service.address && (
                <div className="text-xs text-gray-400 line-clamp-1">
                  {service.address}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Category Card Component
interface CategoryCardProps {
  category: Category;
  viewMode: 'grid' | 'list';
  getTotalServiceCount: (category: Category) => number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, viewMode, getTotalServiceCount }) => {
  const totalServices = getTotalServiceCount(category);
  const Icon = getCategoryIcon(category.slug || '');
  const gradient = getCategoryGradient(category.slug || '');

  return (
    <Link
      to={`/services/${category.slug}`}
      className={`group block transform transition-all duration-300 hover:scale-105 ${
        viewMode === 'list' ? 'p-4' : ''
      }`}
    >
      <div className={`relative rounded-xl bg-black/30 backdrop-blur-lg border border-white/10 shadow-xl hover:shadow-2xl hover:border-white/20 transition-all duration-300 overflow-hidden ${
        viewMode === 'list' ? 'p-4' : 'p-6'
      }`}>
        {/* Background Gradient */}
        <div className={`absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300 ${gradient}`}></div>
        
        <div className={`relative z-10 ${viewMode === 'list' ? 'flex items-center space-x-4' : ''}`}>
          {/* Icon */}
          <div className={`flex-shrink-0 ${viewMode === 'list' ? 'w-12 h-12' : 'w-16 h-16 mb-4'}`}>
            <div className={`w-full h-full ${gradient} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className={`flex-1 ${viewMode === 'list' ? '' : ''}`}>
            <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors mb-2">
              {category.name}
            </h3>
            
            {category.description && (
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                {category.description}
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 text-blue-400">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {totalServices} {totalServices === 1 ? 'service' : 'services'}
                </span>
              </div>
              
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
            </div>

            {/* Subcategories indicator */}
            {category.children && category.children.length > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                +{category.children.length} subcategories
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BrowseServicesEnhanced;