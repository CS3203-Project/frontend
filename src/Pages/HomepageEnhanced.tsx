import ServicesGrid from '../components/ServicesGrid';
import Footer from '../components/Footer';
import useServices from '../hooks/useServices';
import { useState } from 'react';
import { Search, Loader2, Sparkles, ArrowRight, ChevronRight } from 'lucide-react';
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
    <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
      {/* Content Overlay */}
      <div className="relative">
        {/* Hero Section */}
        <section className="relative mx-auto w-full pt-40 px-6 text-center md:px-8 min-h-[calc(100vh-40px)] overflow-hidden bg-[linear-gradient(to_bottom,#fff,#ffffff_50%,#e8e8e8_88%)] dark:bg-[linear-gradient(to_bottom,#000,#0000_30%,#898e8e_78%,#ffffff_99%_50%)] rounded-b-xl">
          {/* Square Grid BG - Subtle with Smooth Fade */}
          <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#e5e7eb_0.5px,transparent_0.5px),linear-gradient(to_bottom,#e5e7eb_0.5px,transparent_0.5px)] dark:bg-[linear-gradient(to_right,#374151_0.5px,transparent_0.5px),linear-gradient(to_bottom,#374151_0.5px,transparent_0.5px)] bg-[size:4rem_4rem] opacity-30 [mask-image:linear-gradient(to_bottom,black_0%,black_50%,transparent_100%)]" />

          {/* Radial Accent */}
          <div className="absolute left-1/2 top-[calc(100%-90px)] lg:top-[calc(100%-150px)] h-[500px] w-[700px] md:h-[500px] md:w-[1100px] lg:h-[750px] lg:w-[140%] -translate-x-1/2 rounded-[100%] border-[#B48CDE] bg-white dark:bg-black bg-[radial-gradient(closest-side,#fff_82%,#000000)] dark:bg-[radial-gradient(closest-side,#000_82%,#ffffff)]" />

          <div className="max-w-7xl mx-auto relative z-10">
            {/* Eyebrow */}
            <a href="#" className="group inline-block mb-6">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium mx-auto px-5 py-2 bg-gradient-to-tr from-zinc-300/5 via-gray-400/5 to-transparent border-[2px] border-gray-300/20 dark:border-white/5 rounded-3xl w-fit tracking-tight uppercase flex items-center justify-center">
                Next-Gen Productivity
                <ChevronRight className="inline w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </a>

            {/* Main Heading */}
            <h1 className="animate-fade-in text-balance bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text py-6 text-5xl font-semibold leading-none tracking-tighter text-transparent sm:text-6xl md:text-7xl lg:text-8xl mb-6">
              <span className="block">The Ignite</span>
              <span className="block">Talent. Services. Social.</span>
            </h1>

            {/* Subtitle */}
            <p className="animate-fade-in mb-12 text-balance text-lg tracking-tight text-gray-600 dark:text-gray-400 md:text-xl max-w-3xl mx-auto leading-relaxed">
              Connect with verified professionals and get high-quality services 
              delivered with excellence and reliability
            </p>

            {/* Enhanced Search Bar with Geolocation */}
            <div className="max-w-3xl mx-auto mb-6 rounded-3xl">
              <div className="bg-white/80 dark:bg-black/30 backdrop-blur-lg rounded-2xl p-2 shadow-2xl border border-gray-200 dark:border-white/10">
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Service Search Input */}
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
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
                      className="w-full pl-12 pr-4 py-4 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-transparent border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-base font-medium"
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
                    variant="white"
                    size="lg"
                    className="px-8 h-14 text-base font-semibold rounded-full backdrop-blur-md bg-white/80 hover:bg-white/90 border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] transition-all duration-300"
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
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Popular searches:</p>
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
                      className="px-4 py-2 bg-white/70 text-black backdrop-blur-md text-sm rounded-full hover:bg-white/90 transition-all duration-300 border border-white/20 shadow-[0_4px_16px_0_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_0_rgba(0,0,0,0.15)] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-medium"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center items-center mb-12">
              <Button 
                onClick={() => navigate('/services')}
                variant="white"
                size="lg"
                className="px-12 py-6 text-lg font-semibold rounded-full backdrop-blur-md bg-white/80 hover:bg-white/95 border border-white/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.2)] hover:scale-105 transition-all duration-300"
              >
                Find Services
              </Button>
            </div>
          </div>
        </section>

        {/* Interactive Feature Cards Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black relative">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
                Why Choose Our Platform
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Experience a seamless way to connect with professionals and grow your business
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1 - Smart Search */}
              <div className="group relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-black/10 dark:from-white/5 dark:to-white/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
                <div className="relative h-full backdrop-blur-md bg-white/70 dark:bg-black/30 border border-white/20 dark:border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-105 hover:-translate-y-2 flex flex-col">
                  <div className="mb-6 inline-block p-4 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-white/20 w-fit">
                    <Sparkles className="w-8 h-8 text-black dark:text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-black dark:text-white mb-4">
                    AI-Powered Search
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed flex-grow">
                    Find exactly what you need with our intelligent search algorithm that understands your requirements and delivers relevant results instantly.
                  </p>
                </div>
              </div>

              {/* Card 2 - Location Based */}
              <div className="group relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-black/10 dark:from-white/5 dark:to-white/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
                <div className="relative h-full backdrop-blur-md bg-white/70 dark:bg-black/30 border border-white/20 dark:border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-105 hover:-translate-y-2 flex flex-col">
                  <div className="mb-6 inline-block p-4 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-white/20 w-fit">
                    <Search className="w-8 h-8 text-black dark:text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-black dark:text-white mb-4">
                    Location-Based Discovery
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed flex-grow">
                    Connect with service providers near you. Our advanced geolocation features help you find local professionals within your preferred radius.
                  </p>
                </div>
              </div>

              {/* Card 3 - Verified Professionals */}
              <div className="group relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-black/10 dark:from-white/5 dark:to-white/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
                <div className="relative h-full backdrop-blur-md bg-white/70 dark:bg-black/30 border border-white/20 dark:border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-105 hover:-translate-y-2 flex flex-col">
                  <div className="mb-6 inline-block p-4 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-white/20 w-fit">
                    <ArrowRight className="w-8 h-8 text-black dark:text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-black dark:text-white mb-4">
                    Verified Professionals
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed flex-grow">
                    Every service provider is thoroughly vetted and verified. Work with confidence knowing you're hiring trusted and qualified professionals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Services Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-6">
                Featured Services
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
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
                <Button
                  onClick={refetch}
                  variant="white"
                  size="lg"
                  className="px-8 py-4 rounded-full text-lg backdrop-blur-md bg-white/80 hover:bg-white/95 border border-white/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.2)] hover:scale-105 transition-all duration-300"
                >
                  {error ? 'Try Again' : 'Refresh Services'}
                </Button>
                {error && (
                  <p className="text-red-600 dark:text-red-400 text-lg mt-4 font-medium">
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