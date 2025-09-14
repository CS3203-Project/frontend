import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, Sparkles, Grid3X3, List } from 'lucide-react';
import type { SemanticSearchResult } from '../api/semanticSearchApi';

interface LocationState {
  results: SemanticSearchResult[];
  query: string;
  searchType: 'semantic';
  location?: {
    country: string;
    province: string;
    city: string;
  };
}

const SearchResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<'relevance' | 'price' | 'rating'>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const state = location.state as LocationState;

  useEffect(() => {
    // If no search results, redirect back to browse services
    if (!state || !state.results) {
      navigate('/services', { replace: true });
    }
  }, [state, navigate]);

  if (!state || !state.results) {
    return null;
  }

  const { results, query } = state;

  // Sort results based on selected criteria
  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'rating':
        // Since we don't have ratings yet, sort by similarity
        return b.similarity - a.similarity;
      case 'relevance':
      default:
        return b.similarity - a.similarity;
    }
  });

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
                Smart Search Results
              </h1>
            </div>
          </div>
          
          <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-gray-300">
                  Searched for: <span className="font-semibold text-white">"{query}"</span>
                </p>
                <p className="text-sm text-blue-400">
                  Found {results.length} semantically matching services
                </p>
              </div>
              
              {/* Controls */}
              <div className="flex items-center gap-4">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'relevance' | 'price' | 'rating')}
                  className="px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="relevance" className="bg-gray-800 text-white">Most Relevant</option>
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
          </div>
        </div>

        {/* Results */}
        {sortedResults.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
            <p className="text-gray-400 mb-4">
              Try adjusting your search terms or browse our categories
            </p>
            <Link
              to="/services"
              className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 hover:border-white/30 transition-all duration-200"
            >
              Browse All Services
            </Link>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {sortedResults.map((service) => (
              <Link
                key={service.id}
                to={`/services/detail/${service.id}`}
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
                      <div className="w-full h-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-white/10">
                        <Star className="w-8 h-8 text-white/60" />
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className={`${viewMode === 'list' ? 'flex-1' : 'mt-4'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {service.title}
                      </h3>
                      <span className="ml-2 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/30">
                        {Math.round(service.similarity * 100)}% match
                      </span>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {service.description}
                    </p>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <span className="font-medium text-gray-300">{service.category.name}</span>
                      <span className="mx-2">•</span>
                      <span>{service.provider.user.firstName} {service.provider.user.lastName}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-white">4.8</span>
                        <span className="text-xs text-gray-500">(24 reviews)</span>
                      </div>
                      <div className="text-lg font-semibold text-green-400">
                        {service.currency} {service.price}
                      </div>
                    </div>
                    
                    {service.tags && service.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {service.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 bg-white/10 text-gray-300 text-xs rounded-md border border-white/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
