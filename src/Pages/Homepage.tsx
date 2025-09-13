import ServicesGrid from '../components/ServicesGrid';
import Orb from '../components/Orb';
import Footer from '../components/Footer';
import useServices from '../hooks/useServices';
import { useEffect, useState, useRef } from 'react';
import { Search, MapPin, ChevronDown, Globe, Map, Home, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { semanticSearchApi } from '../api/semanticSearchApi';
import Button from '../components/Button';

type LocationData = {
  [country: string]: {
    [province: string]: string[];
  };
};

type Location = {
  country: string;
  province: string;
  city: string;
};

export default function Homepage() {
  const { services, loading, error, refetch } = useServices({
    isActive: true, // Only show active services
    take: 20 // Limit to 20 services for better performance
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<Location>({
    country: 'Sri Lanka',
    province: 'All States',
    city: 'All Cities',
  });
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [locationStep, setLocationStep] = useState<'country' | 'province' | 'city'>('country');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const navigate = useNavigate();

  const locationData: LocationData = {
    'Sri Lanka': {
        'Colombo': ['Colombo', 'Dehiwala-Mount Lavinia', 'Moratuwa', 'Kotte', 'Homagama', 'Kesbewa', 'Maharagama', 'Kolonnawa', 'Kaduwela', 'Ratmalana'],
        'Gampaha': ['Negombo', 'Gampaha', 'Katunayake', 'Ja-Ela', 'Wattala', 'Kelaniya', 'Minuwangoda', 'Divulapitiya', 'Dompe', 'Attanagalla'],
        'Kalutara': ['Kalutara', 'Panadura', 'Beruwala', 'Horana', 'Matugama', 'Agalawatta', 'Bandaragama', 'Bulathsinhala', 'Ingiriya', 'Millaniya'],
        'Kandy': ['Kandy', 'Gampola', 'Nawalapitiya', 'Akurana', 'Peradeniya', 'Katugastota', 'Pilimathalawa', 'Wattegama', 'Galagedara', 'Ududumbara'],
        'Matale': ['Matale', 'Dambulla', 'Galewela', 'Ukuwela', 'Rattota', 'Naula', 'Pallepola', 'Yatawatta', 'Ambanganga Korale', 'Wilgamuwa'],
        'Nuwara Eliya': ['Nuwara Eliya', 'Hatton', 'Talawakele', 'Kotagala', 'Ragala', 'Watawala', 'Maskeliya', 'Lindula', 'Ambewela', 'Pundaluoya'],
        'Galle': ['Galle', 'Hikkaduwa', 'Ambalangoda', 'Baddegama', 'Elpitiya', 'Karandeniya', 'Bentota', 'Balapitiya', 'Ahungalla', 'Wakwella'],
        'Matara': ['Matara', 'Weligama', 'Hakmana', 'Akurassa', 'Kamburupitiya', 'Deniyaya', 'Devinuwara', 'Dickwella', 'Thihagoda', 'Mulatiyana'],
        'Hambantota': ['Hambantota', 'Tangalle', 'Tissamaharama', 'Ambalantota', 'Beliatta', 'Weeraketiya', 'Walasmulla', 'Sooriyawewa', 'Katuwana', 'Lunugamvehera'],
        'All Districts': ['All Towns']
    }
  };

  const countries: string[] = Object.keys(locationData);
  const provinces: string[] = locationData[selectedLocation.country] ? Object.keys(locationData[selectedLocation.country]) : [];
  const cities: string[] = locationData[selectedLocation.country] && locationData[selectedLocation.country][selectedLocation.province]
    ? locationData[selectedLocation.country][selectedLocation.province]
    : [];

  // Debug logging
  useEffect(() => {
    console.log('Homepage - Services state:', { services, loading, error });
  }, [services, loading, error]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    doSearch();
  };

  const doSearch = async () => {
    if (!searchQuery.trim()) {
      console.log('Empty search query');
      return;
    }

    try {
      setIsSearching(true);
      console.log('🔍 Performing semantic search for:', searchQuery, 'in', selectedLocation);
      
      const response = await semanticSearchApi.searchServices({
        query: searchQuery.trim(),
        threshold: 0.4, // Lower threshold for broader results
        limit: 20
      });

      if (response.success) {
        console.log('✅ Search results:', response.data);
        
        // Navigate to search results page with results
        navigate('/services/search', { 
          state: { 
            results: response.data.results, 
            query: searchQuery.trim(),
            location: selectedLocation,
            searchType: 'semantic'
          } 
        });
      } else {
        console.error('❌ Search failed:', response.message);
        alert('Search failed. Please try again.');
      }
    } catch (error) {
      console.error('❌ Semantic search error:', error);
      alert('Search failed. Please check your connection and try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const openLocationModal = (): void => {
    setShowLocationModal(true);
    setLocationStep('country');
  };

  const closeLocationModal = (): void => {
    setShowLocationModal(false);
    setLocationStep('country');
  };

  const handleCountrySelect = (country: string): void => {
    const firstProvince = Object.keys(locationData[country])[0];
    setSelectedLocation({
      country: country,
      province: firstProvince,
      city: locationData[country][firstProvince][0],
    });
    setLocationStep('province');
  };

  const handleProvinceSelect = (province: string): void => {
    setSelectedLocation((prev) => ({
      ...prev,
      province: province,
      city: locationData[prev.country][province][0],
    }));
    setLocationStep('city');
  };

  const handleCitySelect = (city: string): void => {
    setSelectedLocation((prev) => ({
      ...prev,
      city: city,
    }));
    closeLocationModal();
  };

  const getLocationDisplayText = (): string => {
    if (selectedLocation.city === 'All Cities' && selectedLocation.province === 'All States') {
      return selectedLocation.country;
    } else if (selectedLocation.city === 'All Cities') {
      return `${selectedLocation.province}, ${selectedLocation.country}`;
    } else {
      return `${selectedLocation.city}, ${selectedLocation.province}`;
    }
  };

  const popularSearches: string[] = [
    "House Cleaning",
    "Tutoring", 
    "Plumbing",
    "Web Design",
    "Photography",
    "Personal Trainer"
  ];

  return (
    <div>
      {/* Hero Section with Orb Background */}
      <section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
        {/* Animated Orb Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 opacity-60">
            <Orb hue={280} hoverIntensity={0.5} rotateOnHover={true} />
          </div>
          <div className="absolute top-1/3 right-1/4 w-80 h-80 opacity-40">
            <Orb hue={200} hoverIntensity={0.3} rotateOnHover={true} />
          </div>
          <div className="absolute bottom-1/4 right-1/3 w-64 h-64 opacity-30">
            <Orb hue={320} hoverIntensity={0.4} rotateOnHover={true} />
          </div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            {/* <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-600/20 backdrop-blur-sm border border-purple-500/30 text-purple-300 text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              New ✨ Enhanced Service Platform
            </div> */}

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="block">Professional Services</span>
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                For Everyone
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Connect with verified professionals and get high-quality services 
              delivered with excellence and reliability
            </p>

            {/* Enhanced Search Bar */}
            <div className="max-w-3xl mx-auto mb-6">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-2 shadow-2xl border border-white/20">
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
                      className="w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-500 bg-transparent border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base font-medium"
                    />
                  </div>

                  {/* Location Selector Button */}
                  <div className="relative">
                    <button
                      onClick={openLocationModal}
                      className="flex items-center justify-between w-full sm:w-56 px-4 py-4 text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-200 hover:border-gray-300 font-medium"
                    >
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                        <span className="truncate">{getLocationDisplayText()}</span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-500 ml-2" />
                    </button>
                  </div>

                  {/* Search Button */}
                  <Button 
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="px-8 h-14 py-4 text-base font-semibold bg-black hover:bg-neutral-900 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl border border-black disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-5 w-5" />
                        Search
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
                      onClick={() => setSearchQuery(search)}
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
                onClick={() => navigate('/provider-signup')}
                className="px-8 py-4 border-2 border-white rounded-2xl text-white font-semibold text-lg transition-all duration-300 hover:border-purple-500 hover:text-purple-400 hover:shadow-lg backdrop-blur-sm hover:bg-white/10"
              >
                Start Selling
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 pt-12 border-t border-gray-800">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">10K+</div>
                <div className="text-gray-400">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">500+</div>
                <div className="text-gray-400">Verified Providers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">50+</div>
                <div className="text-gray-400">Service Categories</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Featured Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
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

      {/* Location Selection Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {locationStep === 'country' && 'Select Country'}
                {locationStep === 'province' && 'Select State/Province'}
                {locationStep === 'city' && 'Select City'}
              </h3>
              <button
                onClick={closeLocationModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {/* Country Selection */}
              {locationStep === 'country' && (
                <div className="space-y-2">
                  {countries.map((country, index) => (
                    <button
                      key={index}
                      onClick={() => handleCountrySelect(country)}
                      className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-200"
                    >
                      <Globe className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="font-medium text-gray-900">{country}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Province/State Selection */}
              {locationStep === 'province' && (
                <div className="space-y-2">
                  <button
                    onClick={() => setLocationStep('country')}
                    className="flex items-center text-blue-600 hover:text-blue-700 mb-4 font-medium"
                  >
                    <ChevronDown className="h-4 w-4 rotate-90 mr-1" />
                    Back to Countries
                  </button>
                  {provinces.map((province, index) => (
                    <button
                      key={index}
                      onClick={() => handleProvinceSelect(province)}
                      className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-200"
                    >
                      <Map className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="font-medium text-gray-900">{province}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* City Selection */}
              {locationStep === 'city' && (
                <div className="space-y-2">
                  <button
                    onClick={() => setLocationStep('province')}
                    className="flex items-center text-blue-600 hover:text-blue-700 mb-4 font-medium"
                  >
                    <ChevronDown className="h-4 w-4 rotate-90 mr-1" />
                    Back to States/Provinces
                  </button>
                  {cities.map((city, index) => (
                    <button
                      key={index}
                      onClick={() => handleCitySelect(city)}
                      className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-200"
                    >
                      <Home className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="font-medium text-gray-900">{city}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Use Current Location Option */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <Button className="w-full flex items-center justify-center p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium">
                <MapPin className="h-5 w-5 mr-2" />
                Use Current Location
              </Button>
              <p className="text-xs text-gray-500 text-center mt-2">
                We'll detect your location automatically
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

