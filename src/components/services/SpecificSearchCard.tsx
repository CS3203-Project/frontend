import React, { useState } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../Button';
import { semanticSearchApi } from '../../api/semanticSearchApi';

const SpecificSearchCard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleSemanticSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      
      const response = await semanticSearchApi.searchServices({
        query: searchQuery.trim(),
        threshold: 0.3, // Lower threshold for broader results
        limit: 20
      });

      if (response.success) {
        navigate('/services/search', { 
          state: { 
            results: response.data.results, 
            query: searchQuery.trim(),
            searchType: 'semantic'
          } 
        });
      }
    } catch (error) {
      console.error('Semantic search failed:', error);
      alert('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSemanticSearch();
    }
  };

  return (
    <div className="mt-6 p-6 bg-white/5 rounded-xl border border-white/20 shadow-sm">
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-3">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h4 className="font-semibold text-white mb-2">Smart Service Discovery</h4>
        <p className="text-sm text-gray-400">
          Use AI-powered search to find exactly what you need
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Try 'wedding photography', 'logo design', or 'home cleaning'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-white placeholder-gray-400"
          />
        </div>
        <Button 
          onClick={handleSemanticSearch}
          disabled={isSearching || !searchQuery.trim()}
          size="sm" 
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Smart Search
            </>
          )}
        </Button>
      </div>
      
      <div className="mt-3 flex flex-wrap gap-2 justify-center">
        {['wedding photography', 'logo design', 'home cleaning', 'tutoring'].map((suggestion, index) => (
          <button
            key={index}
            onClick={() => setSearchQuery(suggestion)}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white text-xs rounded-full border border-white/20 hover:border-white/30 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SpecificSearchCard;
