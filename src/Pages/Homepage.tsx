import ServicesGrid from '../components/ServicesGrid';
import Orb from '../components/Orb';
import Footer from '../components/Footer';
import useServices from '../hooks/useServices';
import { useEffect, useState, useRef } from 'react';
import { Search, MapPin, ChevronDown, Globe, Map, Home, X, Loader2, Sparkles, ArrowRight } from 'lucide-react';
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
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 pt-20">
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

            {/* Enhanced Search Bar */}
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

                  {/* Location Selector Button */}
                  <div className="relative">
                    <button
                      onClick={openLocationModal}
                      className="flex items-center justify-between w-full sm:w-56 px-4 py-4 text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200 border border-white/10 hover:border-white/20 font-medium"
                    >
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="truncate">{getLocationDisplayText()}</span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-400 ml-2" />
                    </button>
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

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
        {/* Background Orbs */}
        <div className="absolute top-1/4 left-0 w-72 h-72 opacity-20">
          <Orb hue={240} hoverIntensity={0.3} rotateOnHover={true} />
        </div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 opacity-15">
          <Orb hue={300} hoverIntensity={0.4} rotateOnHover={true} />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Zia</span>?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Experience the future of service marketplace with cutting-edge features designed for both customers and professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 - Verified Professionals */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-white/30 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Verified Professionals</h3>
                <p className="text-gray-300 leading-relaxed">
                  All service providers undergo thorough verification processes including background checks, skill assessments, and identity verification.
                </p>
              </div>
            </div>

            {/* Feature 2 - Smart Matching */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-white/30 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Smart Matching</h3>
                <p className="text-gray-300 leading-relaxed">
                  Our AI-powered semantic search connects you with the perfect service provider based on your specific needs and location preferences.
                </p>
              </div>
            </div>

            {/* Feature 3 - Secure Payments */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-green-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-white/30 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-green-500 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Secure Payments</h3>
                <p className="text-gray-300 leading-relaxed">
                  End-to-end encrypted payment processing with escrow protection ensures safe transactions for both parties every time.
                </p>
              </div>
            </div>

            {/* Feature 4 - Real-time Communication */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-white/30 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Real-time Chat</h3>
                <p className="text-gray-300 leading-relaxed">
                  Instant messaging system allows seamless communication between customers and service providers throughout the entire project lifecycle.
                </p>
              </div>
            </div>

            {/* Feature 5 - Quality Assurance */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-white/30 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Quality Assurance</h3>
                <p className="text-gray-300 leading-relaxed">
                  Comprehensive review system with ratings, feedback, and quality monitoring ensures consistently high service standards across the platform.
                </p>
              </div>
            </div>

            {/* Feature 6 - 24/7 Support */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 to-purple-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-white/30 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">24/7 Support</h3>
                <p className="text-gray-300 leading-relaxed">
                  Round-the-clock customer support with dedicated teams ready to assist with any questions, disputes, or technical issues you may encounter.
                </p>
              </div>
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
                aria-label="Close location modal"
                title="Close"
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

      {/* Call to Action Section for Service Providers */}
      <section className="relative py-20 bg-gradient-to-br from-purple-900 via-black to-gray-900 overflow-hidden">
        {/* Background Orb */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 opacity-20">
          <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-600/20 backdrop-blur-sm border border-purple-500/30 text-purple-300 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4 mr-2" />
              Join Our Provider Network
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Turn Your Skills Into
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Income?
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Join thousands of professionals already earning on our platform. Set your own rates, 
              work flexible hours, and build your reputation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="p-3 bg-green-600/20 rounded-xl w-fit mx-auto mb-4">
                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Earn More</h3>
              <p className="text-gray-400 text-sm">Set competitive rates and increase your income potential</p>
            </div>
            
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="p-3 bg-blue-600/20 rounded-xl w-fit mx-auto mb-4">
                <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Stay Protected</h3>
              <p className="text-gray-400 text-sm">Secure payments and verified customer base</p>
            </div>
            
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="p-3 bg-purple-600/20 rounded-xl w-fit mx-auto mb-4">
                <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Grow Fast</h3>
              <p className="text-gray-400 text-sm">Build your reputation and expand your client base</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              onClick={() => navigate('/become-provider')}
            >
              <span className="flex items-center">
                <Sparkles className="mr-2 h-5 w-5" />
                Become a Provider
                <ArrowRight className="ml-2 h-5 w-5" />
              </span>
            </Button>
            
            <Button
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg"
              onClick={() => navigate('/services')}
            >
              Browse Services
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

