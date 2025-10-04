import ServicesGrid from '../components/ServicesGrid';
import Orb from '../components/Orb';
import Footer from '../components/Footer';
import useServices from '../hooks/useServices';
import { useState } from 'react';
import { Search, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { hybridSearchApi, type LocationParams } from '../api/hybridSearchApi';
import LocationPickerAdvanced from '../components/LocationPickerAdvanced';
import Button from '../components/Button';

export default function Homepage() {
  const { services, loading, error, refetch } = useServices({
    isActive: true, // Only show active services
    take: 20 // Limit to 20 services for better performance
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [locationFilter, setLocationFilter] = useState<LocationParams | null>(null);
  const navigate = useNavigate();

  const popularSearches: string[] = [
    'Web Development',
    'Graphic Design', 
    'Content Writing',
    'Digital Marketing',
    'Photography',
    'Video Editing'
  ];

  const handleSearch = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    doSearch();
  };

  const doSearch = async () => {
    const hasQuery = searchQuery.trim().length > 0;
    const hasLocation = locationFilter?.latitude && locationFilter?.longitude;

    // Allow search with just query OR just location OR both
    if (!hasQuery && !hasLocation) {
      console.log('No search query or location provided - redirecting to browse');
      navigate('/services');
      return;
    }

    try {
      setIsSearching(true);
      console.log('🔍 Performing hybrid search for:', searchQuery, 'with location:', locationFilter);
      
      const response = await hybridSearchApi.searchServices({
        query: hasQuery ? searchQuery.trim() : undefined,
        location: hasLocation ? locationFilter : undefined,
        threshold: 0.4,
        limit: 20,
        includeWithoutLocation: true
      });

      if (response.success) {
        console.log('✅ Search results:', response.data);
        
        // Navigate to enhanced search results page
        navigate('/search-results-enhanced', { 
          state: { 
            results: response.data.results, 
            query: hasQuery ? searchQuery.trim() : undefined,
            location: hasLocation ? {
              latitude: locationFilter.latitude,
              longitude: locationFilter.longitude,
              radius: locationFilter.radius || 10
            } : undefined,
            searchType: response.data.searchType
          } 
        });
      } else {
        console.error('❌ Search failed:', response.message);
        alert('Search failed. Please try again.');
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      alert('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Orb Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 opacity-30">
          <Orb />
        </div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 opacity-20">
          <Orb />
        </div>
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 opacity-25">
          <Orb />
        </div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="max-w-7xl mx-auto">
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 leading-tight">
              <span className="block">Discover the right people.</span>
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Skills. Services. Social.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Connect with verified professionals and get high-quality services 
              delivered with excellence and reliability
            </p>

            {/* Enhanced Search Bar with Geolocation */}
            <div className="max-w-3xl mx-auto mb-6">
              <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-2 shadow-2xl border border-white/10">
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Service Search Input */}
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="What service do you need?"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          doSearch();
                        }
                      }}
                      className="w-full pl-12 pr-4 py-4 text-white placeholder-gray-400 bg-transparent border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base font-medium"
                    />
                  </div>

                  {/* Location Picker Component */}
                  <div className="relative w-full sm:w-56">
                    <LocationPickerAdvanced
                      value={locationFilter || undefined}
                      onChange={setLocationFilter}
                      placeholder="Set location..."
                      showRadius={true}
                      defaultRadius={10}
                      maxRadius={50}
                      autoDetect={false}
                      className="w-full"
                    />
                  </div>

                  {/* Search Button */}
                  <Button 
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="px-8 h-14 py-4 text-base font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-5 w-5" />
                        {searchQuery.trim() || locationFilter ? 'Search' : 'Browse'}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Popular Searches */}
              <div className="mt-4 text-center">
                <p className="text-white text-sm mb-2">Popular searches:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {popularSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(search);
                        // Auto-search after a short delay to allow state to update
                        setTimeout(() => {
                          const hasQuery = search.trim().length > 0;
                          const hasLocation = locationFilter?.latitude && locationFilter?.longitude;
                          
                          if (hasQuery || hasLocation) {
                            doSearch();
                          }
                        }, 100);
                      }}
                      className="px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white text-sm rounded-full hover:bg-white/20 transition-all duration-200 border border-white/20 hover:border-white/40"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                onClick={() => navigate('/services')}
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl text-white font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25 hover:scale-105"
              >
                <span className="relative z-10">Find Services</span>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"></div>
              </Button>
              
              <Button 
                onClick={() => navigate('/become-provider')}
                className="px-8 py-4 border-2 border-white rounded-2xl text-white font-semibold text-lg transition-all duration-300 hover:border-purple-500 hover:text-purple-400 hover:shadow-lg backdrop-blur-sm hover:bg-white/10"
              >
                Become a Provider
              </Button>
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              {/* Feature 1 */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <Sparkles className="w-8 h-8 text-purple-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Smart Search</h3>
                <p className="text-gray-400">Find services using AI-powered search with location filtering</p>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <Search className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Location-Based</h3>
                <p className="text-gray-400">Discover services near you with precise location matching</p>
              </div>
              
              {/* Feature 3 */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <ArrowRight className="w-8 h-8 text-green-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Instant Results</h3>
                <p className="text-gray-400">Get relevant results instantly with our enhanced search</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Services Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-black to-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Featured Services
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Discover professional services from our verified providers. 
                Quality guaranteed, satisfaction assured.
              </p>
            </div>
            
            <ServicesGrid 
              services={services} 
              loading={loading} 
              error={error} 
            />
            
            {/* Refresh Button - Show for both errors AND when no services found */}
            {(error || (!loading && services.length === 0)) && (
              <div className="text-center mt-12">
                <button
                  onClick={refetch}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 hover:shadow-lg hover:scale-105"
                >
                  {error ? 'Try Again' : 'Refresh Services'}
                </button>
                {error && (
                  <p className="text-red-600 text-lg mt-4 font-medium">
                    Error: {error}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}