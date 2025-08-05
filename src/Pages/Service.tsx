import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Heart,
  Share2,
  ChevronDown,
  Grid3X3,
  List,
  SlidersHorizontal
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  workingTime: string;
  isActive: boolean;
  mediaUrls: string[];
  provider: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    location: string;
  };
  createdAt: string;
  tags: string[];
}

export default function Service() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'Home Services',
    'Technical Services',
    'Business Services',
    'Creative Services',
    'Personal Services'
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' }
  ];

  // Mock data - in real app this would come from API
  const mockServices: Service[] = [
    {
      id: '1',
      title: 'Professional Web Development',
      description: 'I will create a modern, responsive website for your business using the latest technologies. Includes custom design, mobile optimization, and SEO-friendly structure.',
      category: 'Technical Services',
      price: 1500,
      currency: 'USD',
      workingTime: '2-3 weeks',
      isActive: true,
      mediaUrls: [
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80'
      ],
      provider: {
        id: 'p1',
        name: 'John Smith',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop',
        rating: 4.9,
        reviewCount: 127,
        isVerified: true,
        location: 'New York, USA'
      },
      createdAt: '2024-12-20',
      tags: ['React', 'Node.js', 'MongoDB', 'Responsive Design']
    },
    {
      id: '2',
      title: 'Logo Design & Branding',
      description: 'Professional logo design with complete brand identity package. Includes multiple concepts, unlimited revisions, and all source files.',
      category: 'Creative Services',
      price: 250,
      currency: 'USD',
      workingTime: '1 week',
      isActive: true,
      mediaUrls: [
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80'
      ],
      provider: {
        id: 'p2',
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1c?w=100&auto=format&fit=crop',
        rating: 4.8,
        reviewCount: 89,
        isVerified: true,
        location: 'London, UK'
      },
      createdAt: '2024-12-18',
      tags: ['Logo Design', 'Branding', 'Adobe Illustrator', 'Creative']
    },
    {
      id: '3',
      title: 'Home Cleaning Service',
      description: 'Professional home cleaning service with eco-friendly products. Deep cleaning for all rooms, including kitchen, bathrooms, and living areas.',
      category: 'Home Services',
      price: 80,
      currency: 'USD',
      workingTime: '3-4 hours',
      isActive: true,
      mediaUrls: [
        'https://images.unsplash.com/photo-1558618047-7c37513fcb6c?auto=format&fit=crop&w=800&q=80'
      ],
      provider: {
        id: 'p3',
        name: 'Maria Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop',
        rating: 4.7,
        reviewCount: 203,
        isVerified: true,
        location: 'Los Angeles, USA'
      },
      createdAt: '2024-12-15',
      tags: ['Cleaning', 'Home Care', 'Eco-friendly', 'Professional']
    },
    {
      id: '4',
      title: 'Business Consultation',
      description: 'Strategic business consultation to help grow your startup or existing business. Market analysis, business planning, and growth strategies.',
      category: 'Business Services',
      price: 200,
      currency: 'USD',
      workingTime: '2 hours session',
      isActive: true,
      mediaUrls: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
      ],
      provider: {
        id: 'p4',
        name: 'David Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop',
        rating: 4.9,
        reviewCount: 156,
        isVerified: true,
        location: 'Singapore'
      },
      createdAt: '2024-12-12',
      tags: ['Business Strategy', 'Consultation', 'Growth', 'Planning']
    },
    {
      id: '5',
      title: 'Personal Fitness Training',
      description: 'One-on-one personal training sessions tailored to your fitness goals. Includes workout plans, nutrition guidance, and progress tracking.',
      category: 'Personal Services',
      price: 60,
      currency: 'USD',
      workingTime: '1 hour session',
      isActive: true,
      mediaUrls: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80'
      ],
      provider: {
        id: 'p5',
        name: 'Alex Thompson',
        avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=100&auto=format&fit=crop',
        rating: 4.8,
        reviewCount: 91,
        isVerified: true,
        location: 'Toronto, Canada'
      },
      createdAt: '2024-12-10',
      tags: ['Fitness', 'Training', 'Health', 'Nutrition']
    }
  ];

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await serviceApi.getServices();
      // setServices(response.data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setServices(mockServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.provider.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || service.category === selectedCategory;
    return matchesSearch && matchesCategory && service.isActive;
  });

  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.provider.rating - a.provider.rating;
      case 'popular':
        return b.provider.reviewCount - a.provider.reviewCount;
      default:
        return 0;
    }
  });

  const handleServiceClick = (service: Service) => {
    // TODO: Navigate to service detail page
    toast.success(`Viewing ${service.title}`);
  };

  const handleProviderClick = (providerId: string) => {
    navigate(`/provider/${providerId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center mt-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading services...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 mb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Services</h1>
          <p className="text-gray-600">Discover professional services from verified providers</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search services, providers, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {sortedServices.length} service{sortedServices.length !== 1 ? 's' : ''} found
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>More Filters</span>
            </Button>
          </div>
        </div>

        {/* Services Grid/List */}
        {sortedServices.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria or browse all categories</p>
            <Button onClick={() => { setSearchTerm(''); setSelectedCategory(''); }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-6"
          }>
            {sortedServices.map((service) => (
              <div
                key={service.id}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1 ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
                onClick={() => handleServiceClick(service)}
              >
                {/* Service Image */}
                <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-w-16 aspect-h-9'}`}>
                  {service.mediaUrls.length > 0 ? (
                    <img
                      src={service.mediaUrls[0]}
                      alt={service.title}
                      className={`object-cover ${viewMode === 'list' ? 'w-full h-full' : 'w-full h-48'}`}
                    />
                  ) : (
                    <div className={`bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center ${viewMode === 'list' ? 'w-full h-full' : 'h-48'}`}>
                      <div className="text-center">
                        <DollarSign className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Service</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                      {service.category}
                    </span>
                  </div>
                  
                  {/* Price Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-green-600 text-white text-sm font-bold rounded-full">
                      {service.currency} {service.price}
                    </span>
                  </div>
                </div>

                {/* Service Details */}
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                      {service.title}
                    </h3>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {service.description}
                  </p>

                  {/* Provider Info */}
                  <div 
                    className="flex items-center space-x-3 mb-4 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProviderClick(service.provider.id);
                    }}
                  >
                    <img
                      src={service.provider.avatar}
                      alt={service.provider.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {service.provider.name}
                        </p>
                        {service.provider.isVerified && (
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span>{service.provider.rating}</span>
                          <span>({service.provider.reviewCount})</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{service.provider.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Service Meta */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{service.workingTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>{new Date(service.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {service.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {service.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {service.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{service.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Heart className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                    <Button size="sm" className="px-4">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <Toaster />
    </div>
  );
}
