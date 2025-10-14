import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Search, Grid3X3, List, Sparkles, Users, RefreshCw, MapPin } from 'lucide-react';
import { categoryApi, type Category } from '../api/categoryApi';
import { getCategoryIcon, getCategoryGradient } from '../utils/categoryMapper';
import { hybridSearchApi, type HybridSearchResult, type LocationParams } from '../api/hybridSearchApi';
import LocationPickerAdvanced from '../components/LocationPickerAdvanced';

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
  hasServicesWithinRadius?: boolean;
  searchMessage?: string;
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
          searchType: response.data.searchType,
          hasServicesWithinRadius: response.data.hasServicesWithinRadius,
          searchMessage: response.data.message
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
          searchType: state.searchType,
          hasServicesWithinRadius: state.hasServicesWithinRadius,
          message: state.searchMessage
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
      <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
        {/* Square Grid Background */}
        <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#e5e7eb_0.5px,transparent_0.5px),linear-gradient(to_bottom,#e5e7eb_0.5px,transparent_0.5px)] dark:bg-[linear-gradient(to_right,#374151_0.5px,transparent_0.5px),linear-gradient(to_bottom,#374151_0.5px,transparent_0.5px)] bg-[size:4rem_4rem] opacity-30 [mask-image:linear-gradient(to_bottom,black_0%,black_50%,transparent_100%)]" />

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="text-center mb-12 pt-20">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/70 dark:bg-black/30 backdrop-blur-lg rounded-full mb-4 border border-white/30 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.08)]">
                <Loader2 className="w-8 h-8 text-black dark:text-white animate-spin" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent mb-4">
                Loading Services
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Please wait while we fetch the latest categories...
              </p>
            </div>

            {/* Enhanced Search Section Skeleton */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="bg-white/70 dark:bg-black/30 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.08)] border border-white/30 dark:border-white/10 p-6">
                {/* Main Search Bar Skeleton */}
                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <div className="w-5 h-5 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="block w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-white/10 backdrop-blur-sm border border-white/30 dark:border-white/20 rounded-xl">
                    <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>

                {/* Location and Filters Row Skeleton */}
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  {/* Location Filter Skeleton */}
                  <div className="flex-1">
                    <div className="w-full sm:w-auto px-4 py-2 rounded-xl border border-white/30 dark:border-white/20 bg-white/50 dark:bg-white/10">
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                    </div>
                  </div>

                  {/* Action Buttons Skeleton */}
                  <div className="flex gap-2">
                    <div className="px-4 py-2 bg-white/50 dark:bg-white/10 rounded-xl">
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                <div className="px-3 py-2 bg-white/50 dark:bg-black/30 backdrop-blur-sm border border-white/30 dark:border-white/20 rounded-xl">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
                <div className="flex items-center bg-white/50 dark:bg-black/30 backdrop-blur-sm rounded-xl p-1 border border-white/30 dark:border-white/20">
                  <div className="p-2 rounded-lg">
                    <div className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="p-2 rounded-lg">
                    <div className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Categories Grid Skeleton */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-white/30 dark:border-gray-700 p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.08)]">
                    <div className="flex items-start">
                      <div className="w-14 h-14 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
                      <div className="ml-4 flex-1">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full mb-1"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="bg-white dark:bg-black min-h-screen relative overflow-hidden">
        {/* Square Grid Background */}
        <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#e5e7eb_0.5px,transparent_0.5px),linear-gradient(to_bottom,#e5e7eb_0.5px,transparent_0.5px)] dark:bg-[linear-gradient(to_right,#374151_0.5px,transparent_0.5px),linear-gradient(to_bottom,#374151_0.5px,transparent_0.5px)] bg-[size:4rem_4rem] opacity-30" />
        
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center pt-20">
            <h1 className="text-4xl font-extrabold bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent mb-4">
              Something went wrong
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              {state.error}
            </p>
            <button
              onClick={() => fetchCategories()}
              className="inline-flex items-center px-8 py-4 bg-black hover:bg-black/90 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-semibold rounded-full transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.12)] hover:scale-105 border border-black dark:border-white"
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
    <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
      {/* Square Grid Background - Subtle with Smooth Fade */}
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#e5e7eb_0.5px,transparent_0.5px),linear-gradient(to_bottom,#e5e7eb_0.5px,transparent_0.5px)] dark:bg-[linear-gradient(to_right,#374151_0.5px,transparent_0.5px),linear-gradient(to_bottom,#374151_0.5px,transparent_0.5px)] bg-[size:4rem_4rem] opacity-30 [mask-image:linear-gradient(to_bottom,black_0%,black_50%,transparent_100%)]" />

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12 pt-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/70 dark:bg-black/30 backdrop-blur-lg rounded-full mb-4 border border-white/30 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.08)]">
              <Sparkles className="w-8 h-8 text-black dark:text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent mb-4">
              {getSearchTypeLabel()}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {state.isHybridSearchActive
                ? `Found ${state.hybridSearchResults.length} matching services`
                : 'Discover amazing services from verified providers'
              }
            </p>
            {/* Add search message notification */}
            {state.searchMessage && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {state.searchMessage}
                </p>
              </div>
            )}
          </div>

          {/* Enhanced Search Section */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white/70 dark:bg-black/30 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.08)] border border-white/30 dark:border-white/10 p-6">
              {/* Main Search Bar */}
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search for services (e.g., 'web development', 'plumbing', 'graphic design')"
                  value={state.searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-white/10 backdrop-blur-sm border border-white/30 dark:border-white/20 rounded-xl text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent text-lg"
                />
                {state.isSearching && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <Loader2 className="h-5 w-5 text-gray-400 dark:text-gray-500 animate-spin" />
                  </div>
                )}
              </div>

              {/* Location and Filters Row */}
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                {/* Location Filter */}
                <div className="flex-1">
                  <button
                    onClick={() => setState(prev => ({ ...prev, showLocationFilter: !prev.showLocationFilter }))}
                    className={`w-full sm:w-auto px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-300 shadow-[0_4px_16px_0_rgba(0,0,0,0.08)] dark:shadow-[0_4px_16px_0_rgba(255,255,255,0.08)] hover:scale-105 ${
                      state.showLocationFilter || state.locationFilter
                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                        : 'bg-white/50 dark:bg-white/10 text-black dark:text-gray-300 border-white/30 dark:border-white/20 hover:bg-white/70 dark:hover:bg-white/20'
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
            placeholder="Search by location (radius optional)..."
            showRadius={true}
            defaultRadius={10}
            maxRadius={50}
            autoDetect={false}
            allowManualRadius={true}
          />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {(state.searchTerm || state.locationFilter) && (
                    <button
                      onClick={clearSearch}
                      className="px-4 py-2 bg-white/50 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 text-black dark:text-white rounded-xl transition-all duration-300 text-sm border border-white/30 dark:border-white/20 shadow-[0_4px_16px_0_rgba(0,0,0,0.08)] dark:shadow-[0_4px_16px_0_rgba(255,255,255,0.08)] hover:scale-105 font-medium"
                    >
                      Clear
                    </button>
                  )}
                  
                  {state.isHybridSearchActive && state.hybridSearchResults.length > 0 && (
                    <button
                      onClick={handleViewSearchResults}
                      className="px-4 py-2 bg-black hover:bg-black/90 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black rounded-xl transition-all duration-300 text-sm font-medium border border-black dark:border-white shadow-[0_4px_16px_0_rgba(0,0,0,0.12)] dark:shadow-[0_4px_16px_0_rgba(255,255,255,0.12)] hover:scale-105"
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
                <h2 className="text-2xl md:text-3xl font-bold text-black dark:text-white flex items-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  Search Results
                </h2>
                <span className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                  Showing {Math.min(6, state.hybridSearchResults.length)} of {state.hybridSearchResults.length} results
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {state.isSearching ? (
                  [...Array(6)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-white/30 dark:border-gray-700 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.08)] p-6">
                        <div className="w-full h-48 bg-gray-300 dark:bg-gray-700 rounded-xl mb-4"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full mb-1"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mb-3"></div>
                        <div className="flex items-center justify-between">
                          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  state.hybridSearchResults.slice(0, 6).map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      viewMode="grid"
                      showDistance={state.locationFilter !== null}
                    />
                  ))
                )}
              </div>

              {state.hybridSearchResults.length > 6 && (
                <div className="text-center">
                  <button
                    onClick={handleViewSearchResults}
                    className="inline-flex items-center px-8 py-4 bg-black hover:bg-black/90 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-semibold rounded-full transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.12)] hover:scale-105 border border-black dark:border-white"
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
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sort by:</span>
                  <select
                    value={state.sortBy}
                    onChange={(e) => handleSortChange(e.target.value as 'name' | 'services' | 'popular')}
                    title="Sort categories"
                    className="px-3 py-2 bg-white/50 dark:bg-black/30 backdrop-blur-sm border border-white/30 dark:border-white/20 rounded-xl text-sm text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all duration-300"
                  >
                    <option value="name" className="bg-white dark:bg-gray-800 text-black dark:text-white">Name</option>
                    <option value="services" className="bg-white dark:bg-gray-800 text-black dark:text-white">Most Services</option>
                    <option value="popular" className="bg-white dark:bg-gray-800 text-black dark:text-white">Most Popular</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">View:</span>
                  <div className="flex items-center bg-white/50 dark:bg-black/30 backdrop-blur-sm rounded-xl p-1 border border-white/30 dark:border-white/20 shadow-[0_4px_16px_0_rgba(0,0,0,0.08)] dark:shadow-[0_4px_16px_0_rgba(255,255,255,0.08)]">
                    <button
                      onClick={() => handleViewModeChange('grid')}
                      title="Grid view"
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        state.viewMode === 'grid' 
                          ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm' 
                          : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleViewModeChange('list')}
                      title="List view"
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        state.viewMode === 'list' 
                          ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm' 
                          : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Categories Grid */}
              {(state.isSearching || state.refreshing) ? (
                <div className={state.viewMode === 'grid' 
                  ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3' 
                  : 'space-y-4'
                }>
                  {[...Array(state.viewMode === 'grid' ? 6 : 4)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className={`bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-white/30 dark:border-gray-700 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.08)] ${state.viewMode === 'grid' ? 'p-6' : 'p-4'}`}>
                        <div className={`flex items-start ${state.viewMode === 'list' ? 'space-x-4' : ''}`}>
                          <div className={`flex-shrink-0 ${state.viewMode === 'list' ? 'w-16 h-16' : 'w-14 h-14'} bg-gray-300 dark:bg-gray-700 rounded-xl`}></div>
                          <div className={`flex-1 ${state.viewMode === 'list' ? '' : 'ml-4'}`}>
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
                            {state.viewMode === 'grid' && (
                              <>
                                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full mb-1"></div>
                                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredAndSortedCategories.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-black dark:text-white mb-2">No categories found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Try adjusting your search terms or clear the search to see all categories
                  </p>
                  <button
                    onClick={clearSearch}
                    className="inline-flex items-center px-6 py-3 bg-white/70 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20 text-black dark:text-white rounded-full border border-white/30 dark:border-white/20 hover:border-white/50 dark:hover:border-white/30 transition-all duration-300 shadow-[0_4px_16px_0_rgba(0,0,0,0.08)] dark:shadow-[0_4px_16px_0_rgba(255,255,255,0.08)] hover:scale-105 font-medium"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className={state.viewMode === 'grid' 
                  ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3' 
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
      to={`/service/${service.id}`}
      className={`group block bg-white/70 dark:bg-black/30 backdrop-blur-lg rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.08)] border border-white/30 dark:border-white/10 hover:border-white/50 dark:hover:border-white/20 hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.15)] dark:hover:shadow-[0_12px_48px_0_rgba(255,255,255,0.15)] transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${
        viewMode === 'list' ? 'p-4' : 'p-6'
      }`}
    >
      <div className={`${viewMode === 'list' ? 'flex items-start space-x-4' : ''}`}>
        {/* Service Image */}
        <div className={`flex-shrink-0 ${viewMode === 'list' ? 'w-24 h-24' : 'w-full h-48 mb-4'}`}>
          <div className={`w-full h-full bg-gradient-to-br from-gray-200/50 to-gray-300/50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl overflow-hidden ${
            viewMode === 'list' ? '' : ''
          }`}>
            {service.images && service.images.length > 0 ? (
              <img
                src={service.images[0]}
                alt={service.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
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
            <h3 className="text-lg font-semibold text-black dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors line-clamp-2">
              {service.title}
            </h3>
            {service.similarity && (
              <div className="ml-2 px-2 py-1 bg-black/10 dark:bg-white/10 text-black dark:text-white text-xs rounded-full font-medium">
                {Math.round(service.similarity * 100)}% match
              </div>
            )}
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3">
            {service.description}
          </p>

          {/* Tags */}
          {service.tags && service.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {service.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-white/50 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-xs rounded-full border border-white/30 dark:border-white/10"
                >
                  {tag}
                </span>
              ))}
              {service.tags.length > 3 && (
                <span className="px-2 py-1 bg-white/50 dark:bg-white/10 text-gray-600 dark:text-gray-400 text-xs rounded-full border border-white/30 dark:border-white/10">
                  +{service.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Provider and Category */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
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
                <div className="flex items-center text-sm text-black dark:text-white">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{service.distance_km.toFixed(1)} km away</span>
                </div>
              )}
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold text-black dark:text-white">
                {service.currency} {price?.toLocaleString()}
              </div>
              {service.address && (
                <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
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
  const [imageError, setImageError] = useState(false);

  // Get category-specific background pattern
  const getCategoryPattern = (slug: string) => {
    const patterns: { [key: string]: string } = {
      'technology': '💻',
      'design': '🎨',
      'writing': '✍️',
      'marketing': '📱',
      'business': '💼',
      'business-services': '💼',
      'lifestyle': '🌟',
      'music': '🎵',
      'video': '🎬',
      'photography': '📷',
      'programming': '⚡',
      'consulting': '🎯',
      'education': '📚',
      'health': '❤️',
      'fitness': '💪',
      'legal': '⚖️',
      'finance': '💰',
      'real-estate': '🏠',
      'creative-services': '�',
      'automotive': '🚗',
      'construction': '🏗️',
      'home-services': '🔧',
      'personal-care': '💆',
      'professional-services': '👔',
      'general-services': '🎯'
    };
    return patterns[slug] || '🌐';
  };

  // Get category-specific image URLs (using Pixabay-style CDN URLs)
  const getCategoryImage = (slug: string) => {
    const images: { [key: string]: string } = {
      'technology': 'https://cdn.pixabay.com/photo/2018/05/08/08/44/artificial-intelligence-3382507_640.jpg',
      'design': 'https://cdn.pixabay.com/photo/2017/05/19/06/22/desk-2325627_640.jpg',
      'writing': 'https://cdn.pixabay.com/photo/2015/07/17/22/43/student-849825_640.jpg',
      'marketing': 'https://cdn.pixabay.com/photo/2015/02/05/08/06/macbook-624707_640.jpg',
      'business': 'https://cdn.pixabay.com/photo/2015/01/09/11/08/startup-594090_640.jpg',
      'business-services': 'https://cdn.pixabay.com/photo/2015/01/09/11/08/startup-594090_640.jpg',
      'lifestyle': 'https://cdn.pixabay.com/photo/2016/11/29/03/53/athletes-1867185_640.jpg',
      'music': 'https://cdn.pixabay.com/photo/2015/05/07/11/02/guitar-756326_640.jpg',
      'video': 'https://cdn.pixabay.com/photo/2016/11/29/08/41/apple-1868496_640.jpg',
      'photography': 'https://cdn.pixabay.com/photo/2016/11/19/15/40/camera-1839924_640.jpg',
      'programming': 'https://cdn.pixabay.com/photo/2015/09/17/17/25/code-944499_640.jpg',
      'consulting': 'https://cdn.pixabay.com/photo/2015/01/08/18/29/entrepreneur-593358_640.jpg',
      'education': 'https://cdn.pixabay.com/photo/2016/09/08/18/45/cube-1655118_640.jpg',
      'health': 'https://cdn.pixabay.com/photo/2017/08/25/15/10/healthcare-2680421_640.jpg',
      'fitness': 'https://cdn.pixabay.com/photo/2017/08/07/14/02/man-2604149_640.jpg',
      'legal': 'https://cdn.pixabay.com/photo/2017/07/10/23/49/club-2492011_640.jpg',
      'finance': 'https://cdn.pixabay.com/photo/2016/11/27/21/42/stock-1863880_640.jpg',
      'real-estate': 'https://cdn.pixabay.com/photo/2016/11/18/17/20/living-room-1835923_640.jpg',
      'automotive': 'https://cdn.pixabay.com/photo/2016/11/19/11/16/automobile-1838744_640.jpg',
      'construction': 'https://cdn.pixabay.com/photo/2015/07/19/10/00/construction-site-850636_640.jpg',
      'home-services': 'https://cdn.pixabay.com/photo/2018/01/25/20/53/lifestyle-3107041_1280.jpg',
      'food': 'https://cdn.pixabay.com/photo/2017/08/06/06/43/breakfast-2589056_640.jpg',
      'travel': 'https://cdn.pixabay.com/photo/2015/07/11/23/02/plane-841441_640.jpg',
      'creative-services': 'https://cdn.pixabay.com/photo/2017/05/19/06/22/desk-2325627_640.jpg',
      'beauty': 'https://cdn.pixabay.com/photo/2016/03/26/22/21/books-1281581_640.jpg',
      'fashion': 'https://cdn.pixabay.com/photo/2016/11/19/18/06/feet-1840619_640.jpg',
      'sports': 'https://cdn.pixabay.com/photo/2016/11/29/05/45/adventure-1867797_640.jpg',
      'entertainment': 'https://cdn.pixabay.com/photo/2015/11/24/11/09/audience-1056764_640.jpg',
      'pets': 'https://cdn.pixabay.com/photo/2016/12/13/05/15/puppy-1903313_640.jpg',
      'gardening': 'https://cdn.pixabay.com/photo/2016/11/21/16/03/gardening-1846137_640.jpg',
      'cleaning': 'https://cdn.pixabay.com/photo/2015/09/21/14/24/cleaning-949352_640.jpg',
      'personal-care': 'https://cdn.pixabay.com/photo/2017/03/14/03/20/woman-2141808_1280.jpg',
      'professional-services': 'https://cdn.pixabay.com/photo/2015/01/08/18/29/entrepreneur-593358_640.jpg',
      'general-services': 'https://cdn.pixabay.com/photo/2015/01/09/11/08/startup-594090_640.jpg'
    };
    return images[slug] || 'https://cdn.pixabay.com/photo/2015/05/28/14/53/ux-788002_1280.jpg';
  };

  const categoryImage = getCategoryImage(category.slug || '');

  return (
    <Link
      to={`/services/${category.slug}`}
      className={`group block transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${
        viewMode === 'list' ? '' : ''
      }`}
    >
      <div className={`relative rounded-2xl bg-white/70 dark:bg-black/30 backdrop-blur-lg border border-white/30 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.08)] hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.15)] dark:hover:shadow-[0_12px_48px_0_rgba(255,255,255,0.15)] hover:border-white/50 dark:hover:border-white/20 transition-all duration-300 overflow-hidden ${
        viewMode === 'list' ? 'h-28' : 'h-64'
      }`}>
        {/* Category Image Background - Enhanced with MORE visible images */}
        {categoryImage && !imageError && viewMode === 'grid' && (
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={categoryImage}
              alt={category.name}
              onError={() => setImageError(true)}
              loading="lazy"
              className="w-full h-full object-cover opacity-60 dark:opacity-50 group-hover:opacity-80 dark:group-hover:opacity-70 transition-all duration-500 group-hover:scale-110 transform filter grayscale-[20%] group-hover:grayscale-0"
            />
            {/* Lighter gradient overlay for better image visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/85 via-white/50 to-white/10 dark:from-black/85 dark:via-black/50 dark:to-black/10"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-white/20 dark:from-transparent dark:via-black/10 dark:to-black/20"></div>
          </div>
        )}

        {/* Background Pattern/Emoji - Fallback when no image or in list view - MORE VISIBLE */}
        {(!categoryImage || imageError || viewMode === 'list') && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div className="text-[12rem] opacity-[0.15] dark:opacity-[0.20] group-hover:opacity-[0.25] dark:group-hover:opacity-[0.30] transition-opacity duration-300 group-hover:scale-110 transform">
              {getCategoryPattern(category.slug || '')}
            </div>
          </div>
        )}

        {/* Background Gradient */}
        <div className={`absolute inset-0 opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-300 ${gradient}`}></div>

        <div className={`relative z-10 h-full flex ${viewMode === 'list' ? 'flex-row items-center space-x-4 px-4' : 'flex-col p-6'}`}>
          {/* Icon */}
          <div className={`flex-shrink-0 ${viewMode === 'list' ? 'w-14 h-14' : 'w-16 h-16 mb-4'}`}>
            <div className={`w-full h-full bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
              <Icon className={`${viewMode === 'list' ? 'w-6 h-6' : 'w-8 h-8'} text-black dark:text-white`} />
            </div>
          </div>

          {/* Content */}
          <div className={`flex-1 flex flex-col ${viewMode === 'list' ? 'justify-center' : 'justify-between'}`}>
            <div className="flex-grow">
              <h3 className={`font-bold text-black dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors mb-2 ${
                viewMode === 'list' ? 'text-base line-clamp-1' : 'text-xl line-clamp-2'
              }`}>
                {category.name}
              </h3>
              
              {category.description && (
                <p className={`text-gray-600 dark:text-gray-400 text-sm leading-relaxed ${
                  viewMode === 'list' ? 'line-clamp-1' : 'line-clamp-3 mb-4'
                }`}>
                  {category.description}
                </p>
              )}
            </div>

            {/* Footer Section - Always at bottom */}
            <div className="mt-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-black dark:text-white">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    {totalServices} {totalServices === 1 ? 'service' : 'services'}
                  </span>
                </div>
                
                <ArrowRight className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
              </div>

              {/* Subcategories indicator */}
              {category.children && category.children.length > 0 && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-600 font-medium">
                  +{category.children.length} subcategories
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BrowseServicesEnhanced;
