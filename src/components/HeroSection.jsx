
import React, { useState, useRef, useEffect } from 'react';
import { Search, Star, Users, MessageCircle, MapPin, Play, Pause, Filter, ChevronDown, Globe, Map, Home, X } from 'lucide-react';
import Button from './Button';


const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState({
    country: 'United States',
    province: 'All States',
    city: 'All Cities'
  });
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationStep, setLocationStep] = useState('country'); // country, province, city
  const [videoPlaying, setVideoPlaying] = useState(true);
  const videoRef = useRef(null);

  const locationData = {
    'United States': {
      'California': ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento', 'San Jose'],
      'New York': ['New York City', 'Buffalo', 'Albany', 'Rochester', 'Syracuse'],
      'Texas': ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth'],
      'Florida': ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale'],
      'Illinois': ['Chicago', 'Springfield', 'Rockford', 'Peoria', 'Elgin'],
      'All States': ['All Cities']
    },
    'Canada': {
      'Ontario': ['Toronto', 'Ottawa', 'Hamilton', 'London', 'Windsor'],
      'Quebec': ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Sherbrooke'],
      'British Columbia': ['Vancouver', 'Victoria', 'Burnaby', 'Surrey', 'Richmond'],
      'Alberta': ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'Medicine Hat'],
      'All Provinces': ['All Cities']
    },
    'United Kingdom': {
      'England': ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds'],
      'Scotland': ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee', 'Stirling'],
      'Wales': ['Cardiff', 'Swansea', 'Newport', 'Wrexham', 'Barry'],
      'Northern Ireland': ['Belfast', 'Derry', 'Lisburn', 'Newtownabbey', 'Bangor'],
      'All Regions': ['All Cities']
    }
  };

  const countries = Object.keys(locationData);
  const provinces = locationData[selectedLocation.country] ? Object.keys(locationData[selectedLocation.country]) : [];
  const cities = locationData[selectedLocation.country] && locationData[selectedLocation.country][selectedLocation.province] 
    ? locationData[selectedLocation.country][selectedLocation.province] 
    : [];

  // Handle video looping behavior
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleVideoEnd = () => {
        video.currentTime = 0;
        video.play();
      };

      video.addEventListener('ended', handleVideoEnd);
      
      const handleTimeUpdate = () => {
        if (video.currentTime >= video.duration - 0.1) {
          video.currentTime = 0;
        }
      };

      video.addEventListener('timeupdate', handleTimeUpdate);

      return () => {
        video.removeEventListener('ended', handleVideoEnd);
        video.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery, 'in', selectedLocation);
  };

  const toggleVideo = () => {
    const video = videoRef.current;
    if (video) {
      if (videoPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setVideoPlaying(!videoPlaying);
    }
  };

  const openLocationModal = () => {
    setShowLocationModal(true);
    setLocationStep('country');
  };

  const closeLocationModal = () => {
    setShowLocationModal(false);
    setLocationStep('country');
  };

  const handleCountrySelect = (country) => {
    setSelectedLocation({
      country: country,
      province: Object.keys(locationData[country])[0],
      city: locationData[country][Object.keys(locationData[country])[0]][0]
    });
    setLocationStep('province');
  };

  const handleProvinceSelect = (province) => {
    setSelectedLocation(prev => ({
      ...prev,
      province: province,
      city: locationData[prev.country][province][0]
    }));
    setLocationStep('city');
  };

  const handleCitySelect = (city) => {
    setSelectedLocation(prev => ({
      ...prev,
      city: city
    }));
    closeLocationModal();
  };

  const getLocationDisplayText = () => {
    if (selectedLocation.city === 'All Cities' && selectedLocation.province === 'All States') {
      return selectedLocation.country;
    } else if (selectedLocation.city === 'All Cities') {
      return `${selectedLocation.province}, ${selectedLocation.country}`;
    } else {
      return `${selectedLocation.city}, ${selectedLocation.province}`;
    }
  };

  const popularSearches = [
    "House Cleaning",
    "Tutoring", 
    "Plumbing",
    "Web Design",
    "Photography",
    "Personal Trainer"
  ];

return (
    <div className="relative pt-12 z-10">
      {/* Hero Section with Video Background */}
      <div className="relative h-auto md:h-[70vh] flex items-center md:justify-center overflow-hidden md:overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
          >
            <source src="/intro.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-transparent to-purple-900/30"></div>
        </div>

        {/* Video Control Button */}
        <button
          onClick={toggleVideo}
          className="absolute bottom-8 right-8 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200"
        >
          {videoPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 mt-4 leading-tight">
            Connect with Trusted Service Providers
          </h1>
          <p className="text-lg md:text-xl text-white mb-8 max-w-2xl mx-auto leading-relaxed">
            Find verified professionals for any service you need. From home repairs to tutoring, 
            we connect you with the best providers in your area.
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
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
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
                  className="px-8 h-14 py-4 text-base font-semibold bg-black hover:bg-neutral-900 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl border border-black"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Search
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
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="white" size="lg" className="text-base px-6 font-semibold">
              Find Services
            </Button>
            <Button variant="outline" size="lg" className="text-base mb-6 px-6 border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold">
              Start Selling
            </Button>
          </div>
        </div>
      </div>

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

            {/* App Location Option */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button className="w-full flex items-center justify-center p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium">
                <MapPin className="h-5 w-5 mr-2" />
                Use Current Location
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                We'll detect your location automatically
              </p>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default HeroSection;