import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Search, Filter, Grid3X3, List, Sparkles, Star, Users, RefreshCw } from 'lucide-react';
import SpecificSearchCard from '../components/services/SpecificSearchCard';
import { categoryApi, type Category } from '../api/categoryApi';
import { getCategoryIcon, getCategoryGradient } from '../utils/categoryMapper';
import { semanticSearchApi, type SemanticSearchResult } from '../api/semanticSearchApi';
import Orb from '../components/Orb';

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
  refreshing: boolean;
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
    isSemanticSearching: false,
    refreshing: false
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
        // Note: children might not have _count data, but we still need to check their children
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
        // Debug service counts after state is set
        setTimeout(() => {
          response.data.forEach((cat, index) => {
            const totalServices = getTotalServiceCount(cat);
            console.log(`Category ${index}: ${cat.name} - Direct Services: ${cat._count?.services || 0}, Total (with subcategories): ${totalServices}`);
          });
        }, 100);
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
          return getTotalServiceCount(b) - getTotalServiceCount(a);
        case 'popular':
          return getTotalServiceCount(b) - getTotalServiceCount(a);
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
                      <div className="h-6 bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </div>
                  <div className="mt-4 h-4 bg-white/20 rounded w-1/2"></div>
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
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 min-h-screen">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center pt-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-600/20 to-red-600/20 backdrop-blur-lg rounded-full mb-4 border border-red-500/30">
              <span className="text-red-400 text-2xl">⚠️</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white mb-4">
              Unable to Load Services
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              {state.error}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 min-h-screen relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 opacity-20">
          <Orb hue={280} hoverIntensity={0.3} rotateOnHover={true} />
        </div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 opacity-15">
          <Orb hue={240} hoverIntensity={0.2} rotateOnHover={true} />
        </div>
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 opacity-10">
          <Orb hue={320} hoverIntensity={0.4} rotateOnHover={true} />
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12 mt-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-lg rounded-full mb-6 border border-white/20">
            <Sparkles className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Browse Our Services
            </span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-lg text-gray-300 sm:text-xl md:mt-5 md:max-w-3xl">
            Find the right professional for any job, from home repairs to business consulting.
            {state.categories.length > 0 && (
              <span className="block mt-2 text-sm font-medium text-purple-400">
                {state.categories.length} categories • {state.categories.reduce((sum, cat) => sum + getTotalServiceCount(cat), 0)} services available
              </span>
            )}
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:gap-4 items-stretch sm:items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search categories or services..."
                value={state.searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
              />
              {state.isSemanticSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
              {/* Refresh Button */}
              <button
                onClick={() => fetchCategories(true)}
                disabled={state.refreshing}
                className="flex items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
                title="Refresh service counts"
                aria-label="Refresh service counts"
              >
                <RefreshCw className={`w-4 h-4 ${state.refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">
                  {state.refreshing ? 'Refreshing...' : 'Refresh'}
                </span>
              </button>

              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400 hidden sm:block" />
                <select
                  value={state.sortBy}
                  onChange={(e) => handleSortChange(e.target.value as 'name' | 'services' | 'popular')}
                  className="w-full sm:w-auto px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                  aria-label="Sort categories"
                >
                  <option value="name" className="bg-gray-800">Sort by Name</option>
                  <option value="services" className="bg-gray-800">Most Services</option>
                  <option value="popular" className="bg-gray-800">Most Popular</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20 self-center">
                <button
                  onClick={() => handleViewModeChange('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    state.viewMode === 'grid' 
                      ? 'bg-white/20 text-purple-400 shadow-sm' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                  title="Grid view"
                  aria-label="Switch to grid view"
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleViewModeChange('list')}
                  className={`p-2 rounded-md transition-colors ${
                    state.viewMode === 'list' 
                      ? 'bg-white/20 text-purple-400 shadow-sm' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                  title="List view"
                  aria-label="Switch to list view"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Semantic Search Results */}
        {state.isSemanticSearchActive && state.semanticSearchResults.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-purple-600/10 to-blue-600/10 backdrop-blur-lg rounded-2xl border border-purple-500/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">
                  Smart Search Results for "{state.searchTerm}"
                </h3>
                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-full border border-purple-500/30">
                  {state.semanticSearchResults.length} found
                </span>
              </div>
              <button
                onClick={clearSemanticSearch}
                className="text-sm text-gray-400 hover:text-gray-300 font-medium"
              >
                Clear
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.semanticSearchResults.map((service) => (
                <Link
                  key={service.id}
                  to={`/services/detail/${service.id}`}
                  className="group block bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/20 hover:shadow-md hover:border-white/30 transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="flex items-start space-x-3">
                    {service.images && service.images.length > 0 ? (
                      <img
                        src={service.images[0]}
                        alt={service.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-blue-400 rounded-lg flex items-center justify-center">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate group-hover:text-purple-400 transition-colors">
                        {service.title}
                      </h4>
                      <p className="text-sm text-gray-300 line-clamp-2 mt-1">
                        {service.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-medium text-green-400">
                          {service.currency} {service.price}
                        </span>
                        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30">
                          {Math.round(service.similarity * 100)}% match
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
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
                className="text-purple-400 hover:text-purple-300 font-medium text-sm"
              >
                View all {state.semanticSearchResults.length} results →
              </button>
            </div>
          </div>
        )}

        {/* Categories Grid/List */}
        {filteredAndSortedCategories.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-lg rounded-full mb-4 border border-white/20">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No categories found</h3>
            <p className="text-gray-300">
              {state.searchTerm 
                ? `No categories match "${state.searchTerm}". Try adjusting your search.`
                : "No categories are currently available."
              }
            </p>
          </div>
        ) : (
          <div className={`${
            state.viewMode === 'grid' 
              ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8 auto-rows-fr' 
              : 'space-y-4'
          }`}>
            {filteredAndSortedCategories.map((category) => {
              const IconComponent = getCategoryIcon(category.slug);
              const gradient = getCategoryGradient(category.slug);
              
              return (
                <Link
                  key={category.id}
                  to={`/services/${category.slug}`}
                  className={`group relative block rounded-xl transition-all duration-300 ease-in-out hover:-translate-y-2 ${
                    state.viewMode === 'grid' ? 'h-full' : ''
                  } ${
                    state.viewMode === 'list' ? 'p-4' : 'p-6'
                  }`}
                >
                  {/* Glassmorphism Background with Gradient Border */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 group-hover:border-white/30 group-hover:bg-white/15 shadow-lg group-hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                    <div className={`flex items-start flex-1 ${state.viewMode === 'list' ? 'space-x-4 p-4' : 'p-6'}`}>
                      <div className={`flex-shrink-0 p-3 rounded-lg bg-gradient-to-r ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="h-7 w-7" />
                      </div>
                      <div className={state.viewMode === 'list' ? 'flex-1' : 'ml-4 flex-1'}>
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                            {category.name || 'Unnamed Category'}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 flex-shrink-0">
                            {getTotalServiceCount(category)} services
                          </span>
                        </div>
                        <p className="mt-1 text-gray-300 group-hover:text-gray-200 transition-colors">
                          {category.description || 'No description available'}
                        </p>
                        
                        {/* Subcategories preview */}
                        {category.children && category.children.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {category.children.slice(0, 3).map((subcategory) => (
                              <span
                                key={subcategory.id}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white/10 text-gray-300 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-colors border border-white/20"
                              >
                                {subcategory.name}
                              </span>
                            ))}
                            {category.children.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white/10 text-gray-400 border border-white/20">
                                +{category.children.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className={`flex items-center justify-between border-t border-white/10 mt-auto ${state.viewMode === 'list' ? 'px-4 py-3' : 'px-6 py-4'}`}>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{getTotalServiceCount(category)} services</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-400" />
                          <span>4.8</span>
                        </div>
                      </div>
                      <div className="flex items-center text-sm font-medium text-purple-400 group-hover:text-purple-300">
                        <span>Explore Services</span>
                        <ArrowRight className="h-4 w-4 ml-1 transform transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
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
          <div className="mt-16 bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-lg border border-white/20">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Trusted by Thousands</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold mb-2 text-purple-400">
                    {state.categories.length}+
                  </div>
                  <div className="text-gray-300 text-sm sm:text-base">Service Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold mb-2 text-purple-400">
                    {state.categories.reduce((sum, cat) => sum + getTotalServiceCount(cat), 0)}+
                  </div>
                  <div className="text-gray-300 text-sm sm:text-base">Active Services</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold mb-2 text-purple-400">4.8</div>
                  <div className="text-gray-300 text-sm sm:text-base">Average Rating</div>
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
