import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Grid3X3, List, MapPin, SlidersHorizontal, Navigation2 } from 'lucide-react';
import type { HybridSearchResult } from '../api/hybridSearchApi';
import { hybridSearchApi } from '../api/hybridSearchApi';
import LocationPickerAdvanced from '../components/LocationPickerAdvanced';
import SearchResultsMap from '../components/SearchResultsMap';
import type { LocationParams } from '../api/hybridSearchApi';

interface LocationState {
  results: HybridSearchResult[];
  query?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    radius?: number;
  };
  searchType: 'hybrid' | 'semantic' | 'location' | 'general';
  hasServicesWithinRadius?: boolean;
  message?: string;
}

const SearchResultsPageEnhanced: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<'relevance' | 'distance' | 'price' | 'rating'>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Location filter state
  const [locationFilter, setLocationFilter] = useState<LocationParams | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  
  // Price range filter
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({});
  
  const state = location.state as LocationState;

  useEffect(() => {
    // If no search results, redirect back to browse services
    if (!state || !state.results) {
      navigate('/services', { replace: true });
    } else {
      // Set initial location filter if search had location
      if (state.location?.latitude && state.location?.longitude) {
        setLocationFilter({
          latitude: state.location.latitude,
          longitude: state.location.longitude,
          radius: state.location.radius || 10
        });
      }
    }
  }, [state, navigate]);

  if (!state || !state.results) {
    return null;
  }

  const { results, query, searchType } = state;

  // Filter results based on price range
  const filteredResults = useMemo(() => {
    return results.filter(service => {
      const price = typeof service.price === 'string' ? parseFloat(service.price) : service.price;
      
      if (priceRange.min !== undefined && price < priceRange.min) return false;
      if (priceRange.max !== undefined && price > priceRange.max) return false;
      
      return true;
    });
  }, [results, priceRange]);

  // Sort results based on selected criteria
  const sortedResults = useMemo(() => {
    return [...filteredResults].sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          // Services without location (distance_km = null) go to end
          if (a.distance_km === null && b.distance_km === null) return 0;
          if (a.distance_km === null) return 1;
          if (b.distance_km === null) return -1;
          return (a.distance_km || 0) - (b.distance_km || 0);
        case 'price':
          const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
          const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
          return priceA - priceB;
        case 'rating':
          // Since we don't have ratings yet, sort by similarity
          return b.similarity - a.similarity;
        case 'relevance':
        default:
          return b.similarity - a.similarity;
      }
    });
  }, [filteredResults, sortBy]);

  const handleRefineSearch = async () => {
    if (!query && !locationFilter) return;

    setIsRefining(true);
    try {
      const response = await hybridSearchApi.searchServices({
        query: query || undefined,
        location: locationFilter || undefined,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        includeWithoutLocation: true
      });

      if (response.success) {
        navigate('/search-results-enhanced', {
          state: {
            results: response.data.results,
            query: response.data.query,
            location: response.data.location,
            searchType: response.data.searchType,
            hasServicesWithinRadius: response.data.hasServicesWithinRadius,
            message: response.data.message
          },
          replace: true
        });
      }
    } catch (error) {
      console.error('Failed to refine search:', error);
    } finally {
      setIsRefining(false);
    }
  };

  const getSearchTypeLabel = () => {
    switch (searchType) {
      case 'hybrid': return 'Smart Search (Text + Location)';
      case 'semantic': return 'Semantic Search';
      case 'location': return 'Location-based Search';
      case 'general': return 'General Search';
      default: return 'Search Results';
    }
  };

  const hasLocationResults = sortedResults.some(service => service.distance_km !== null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 mt-20">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-300" />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-white" />
              <h1 className="text-2xl font-bold text-white">
                {getSearchTypeLabel()}
              </h1>
            </div>
          </div>
          
          <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/10">
            <div className="flex flex-col gap-4">
              {/* Search Info */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  {query && (
                    <p className="text-gray-300">
                      Searched for: <span className="font-semibold text-white">"{query}"</span>
                    </p>
                  )}
                  {locationFilter && (
                    <p className="text-gray-300 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Location: <span className="font-semibold text-white">
                        {locationFilter.address || `${locationFilter.latitude?.toFixed(3)}, ${locationFilter.longitude?.toFixed(3)}`}
                        {locationFilter.radius && ` (${locationFilter.radius}km radius)`}
                      </span>
                    </p>
                  )}
                  <p className="text-sm text-blue-400">
                    Found {sortedResults.length} matching services
                    {hasLocationResults && ` • Showing distances from your location`}
                  </p>
                  {/* Add search message notification if radius expansion occurred */}
                  {state.message && (
                    <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-3 mt-2">
                      <p className="text-sm text-blue-200">
                        {state.message}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Controls */}
                <div className="flex items-center gap-2">
                  {/* Filters Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                      showFilters 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white/10 text-gray-300 border-white/20 hover:bg-white/20'
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-1 inline" />
                    Filters
                  </button>
                  
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="relevance" className="bg-gray-800 text-white">Most Relevant</option>
                    {hasLocationResults && (
                      <option value="distance" className="bg-gray-800 text-white">Nearest First</option>
                    )}
                    <option value="price" className="bg-gray-800 text-white">Lowest Price</option>
                    <option value="rating" className="bg-gray-800 text-white">Best Match</option>
                  </select>
                  
                  {/* View Mode */}
                  <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'grid' 
                          ? 'bg-white/20 text-white shadow-sm' 
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'list' 
                          ? 'bg-white/20 text-white shadow-sm' 
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="border-t border-white/10 pt-4 space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Location Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Refine Location
                      </label>
                      <LocationPickerAdvanced
                        value={locationFilter || undefined}
                        onChange={setLocationFilter}
                        placeholder="Update search location..."
                        showRadius={true}
                        defaultRadius={10}
                        maxRadius={50}
                      />
                    </div>

                    {/* Price Range Filter */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-300">
                        Price Range (LKR)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Min price"
                          value={priceRange.min || ''}
                          onChange={(e) => setPriceRange(prev => ({
                            ...prev,
                            min: e.target.value ? parseFloat(e.target.value) : undefined
                          }))}
                          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          placeholder="Max price"
                          value={priceRange.max || ''}
                          onChange={(e) => setPriceRange(prev => ({
                            ...prev,
                            max: e.target.value ? parseFloat(e.target.value) : undefined
                          }))}
                          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Apply Filters Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleRefineSearch}
                      disabled={isRefining}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRefining ? 'Applying...' : 'Apply Filters'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {sortedResults.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
            <p className="text-gray-400 mb-4">
              Try adjusting your search terms, location, or price range
            </p>
            <Link
              to="/services"
              className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 hover:border-white/30 transition-all duration-200"
            >
              Browse All Services
            </Link>
          </div>
        ) : (
          <>
            {/* Interactive Search Results Map */}
            <SearchResultsMap
              services={sortedResults}
              userLocation={locationFilter && locationFilter.latitude && locationFilter.longitude ? {
                latitude: locationFilter.latitude,
                longitude: locationFilter.longitude
              } : undefined}
              className="mb-8"
            />

            {/* Service List */}
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
            }>
              {sortedResults.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  viewMode={viewMode}
                  showDistance={hasLocationResults}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Service Card Component
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
      className={`group block bg-black/30 backdrop-blur-lg rounded-xl shadow-lg border border-white/10 hover:border-white/20 hover:bg-black/40 transition-all duration-200 hover:-translate-y-1 ${
        viewMode === 'list' ? 'p-4' : 'p-6'
      }`}
    >
      <div className={`flex ${viewMode === 'list' ? 'space-x-4' : 'flex-col'}`}>
        {/* Image */}
        <div className={`flex-shrink-0 ${viewMode === 'list' ? 'w-24 h-24' : 'w-full h-48'}`}>
          {service.images && service.images.length > 0 ? (
            <img
              src={service.images[0]}
              alt={service.title}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-blue-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`flex-1 ${viewMode === 'list' ? '' : 'mt-4'}`}>
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors line-clamp-2">
              {service.title}
            </h3>
            {service.similarity && (
              <span className="ml-2 px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-full flex-shrink-0">
                {Math.round(service.similarity * 100)}% match
              </span>
            )}
          </div>

          {service.description && (
            <p className="text-gray-400 text-sm mb-3 line-clamp-2">
              {service.description}
            </p>
          )}

          {/* Location and Distance */}
          {(service.address || service.distance_km !== null) && (
            <div className="flex items-center space-x-2 mb-2 text-xs text-gray-400">
              <MapPin className="w-3 h-3" />
              <span>
                {service.address || 'Location available'}
                {showDistance && service.distance_km !== null && (
                  <span className="ml-1 font-medium text-blue-400">
                    • {hybridSearchApi.formatDistance(service.distance_km)}
                  </span>
                )}
              </span>
            </div>
          )}

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
                <span className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded-full">
                  +{service.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              By {service.provider.user.firstName} {service.provider.user.lastName}
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-white">
                {service.currency} {price.toLocaleString()}
              </div>
              {showDistance && service.distance_km === null && (
                <div className="text-xs text-blue-400">Available everywhere</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SearchResultsPageEnhanced;
