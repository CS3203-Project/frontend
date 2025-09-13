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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 mt-20">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Smart Search Results
              </h1>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-gray-600">
                  Searched for: <span className="font-semibold text-gray-900">"{query}"</span>
                </p>
                <p className="text-sm text-blue-600">
                  Found {results.length} semantically matching services
                </p>
              </div>
              
              {/* Controls */}
              <div className="flex items-center gap-4">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'relevance' | 'price' | 'rating')}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="relevance">Most Relevant</option>
                  <option value="price">Lowest Price</option>
                  <option value="rating">Best Match</option>
                </select>
                
                {/* View Mode */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
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
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or browse our categories
            </p>
            <Link
              to="/services"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                className={`group block bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:-translate-y-1 ${
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
                      <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                        <Star className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className={`${viewMode === 'list' ? 'flex-1' : 'mt-4'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {service.title}
                      </h3>
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        {Math.round(service.similarity * 100)}% match
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {service.description}
                    </p>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <span className="font-medium text-gray-700">{service.category.name}</span>
                      <span className="mx-2">•</span>
                      <span>{service.provider.user.firstName} {service.provider.user.lastName}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">4.8</span>
                        <span className="text-xs text-gray-500">(24 reviews)</span>
                      </div>
                      <div className="text-lg font-semibold text-green-600">
                        {service.currency} {service.price}
                      </div>
                    </div>
                    
                    {service.tags && service.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {service.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
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
