import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Heart, MapPin, Clock, MessageCircle, Phone, Mail, ArrowLeft, Calendar, Shield, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { serviceApi, type ServiceResponse } from '../api/serviceApi';
import { servicesData, type Service } from '../data/servicesData';
import Breadcrumb from '../components/services/Breadcrumb';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import toast, { Toaster } from 'react-hot-toast';

interface DetailedService {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  images: string[];
  category: {
    name: string;
    slug: string;
  };
  tags: string[];
  workingTime: string[];
  provider: {
    id?: string;
    name: string;
    email?: string;
    avatar?: string;
    rating?: number;
    reviews?: number;
  };
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const ServiceDetailPage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<DetailedService | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Transform Service (dummy data) to DetailedService format
  const transformDummyService = (dummyService: Service): DetailedService => {
    return {
      id: dummyService.id,
      title: dummyService.title,
      description: `Professional ${dummyService.title} service provided by ${dummyService.provider.name}. High quality service with attention to detail and customer satisfaction guaranteed.`,
      price: dummyService.price.amount,
      currency: dummyService.price.currency,
      images: [dummyService.image],
      category: {
        name: dummyService.category,
        slug: dummyService.category
      },
      tags: [dummyService.subcategory],
      workingTime: ['Monday - Friday: 9:00 AM - 6:00 PM', 'Saturday: 10:00 AM - 4:00 PM', 'Sunday: Closed'],
      provider: {
        id: dummyService.provider.name.toLowerCase().replace(/\s+/g, '-'),
        name: dummyService.provider.name,
        email: 'contact@provider.com',
        avatar: dummyService.provider.avatar,
        rating: dummyService.provider.rating,
        reviews: dummyService.provider.reviews
      },
      isActive: true
    };
  };

  // Transform ServiceResponse (API data) to DetailedService format
  const transformApiService = (apiService: ServiceResponse): DetailedService => {
    return {
      id: apiService.id,
      title: apiService.title || 'Untitled Service',
      description: apiService.description,
      price: apiService.price,
      currency: apiService.currency,
      images: apiService.images && apiService.images.length > 0 ? apiService.images : ['https://picsum.photos/seed/service/800/400'],
      category: {
        name: apiService.category?.name || 'Service',
        slug: apiService.category?.slug || 'general'
      },
      tags: apiService.tags || [],
      workingTime: apiService.workingTime || [],
      provider: {
        id: apiService.provider?.id,
        name: apiService.provider?.user ? 
          `${apiService.provider.user.firstName || ''} ${apiService.provider.user.lastName || ''}`.trim() || 
          apiService.provider.user.email : 
          'Unknown Provider',
        email: apiService.provider?.user?.email,
        avatar: '/api/placeholder/60/60',
        rating: 4.5, // Default rating
        reviews: 23 // Default reviews
      },
      isActive: apiService.isActive,
      createdAt: apiService.createdAt,
      updatedAt: apiService.updatedAt
    };
  };

  useEffect(() => {
    const fetchService = async () => {
      if (!serviceId) return;
      
      try {
        setLoading(true);
        
        // First, try to find in dummy data (for services from Homepage/BrowseServices)
        const dummyService = servicesData.find(s => s.id === serviceId);
        if (dummyService) {
          setService(transformDummyService(dummyService));
          setLoading(false);
          return;
        }

        // If not found in dummy data, try API
        const response = await serviceApi.getServiceById(serviceId);
        
        if (response.success) {
          setService(transformApiService(response.data));
        } else {
          toast.error('Service not found');
          navigate('/services');
        }
      } catch (error) {
        console.error('Failed to fetch service:', error);
        toast.error('Failed to load service details');
        navigate('/services');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId, navigate]);

  const handleContactProvider = () => {
    if (service?.provider?.id) {
      // Navigate to the specific provider page with the provider ID
      navigate(`/provider/${service.provider.id}`);
    } else {
      // For dummy data or when provider ID is not available, 
      // create a generic provider ID based on the provider name
      const providerSlug = service?.provider?.name?.toLowerCase().replace(/\s+/g, '-') || 'unknown-provider';
      navigate(`/provider/${providerSlug}`);
    }
  };

  const handleBookNow = () => {
    // TODO: Implement booking functionality
    toast.success('Booking functionality coming soon!');
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const nextImage = () => {
    if (service && service.images.length > 1) {
      setSelectedImage((prev) => (prev + 1) % service.images.length);
    }
  };

  const prevImage = () => {
    if (service && service.images.length > 1) {
      setSelectedImage((prev) => (prev - 1 + service.images.length) % service.images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center mt-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-700">Loading service details...</h3>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center mt-16">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-700">Service not found</h3>
            <button 
              onClick={() => navigate('/services')}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Services
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Services', href: '/services' },
    { label: service.category?.name || 'Category', href: `/services/${service.category?.slug}` },
    { label: service.title || 'Service' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 mt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb items={breadcrumbItems} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Image Gallery */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                <div className="aspect-video relative">
                  <img
                    src={service.images[selectedImage]}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={toggleWishlist}
                    className={`absolute top-4 right-4 p-3 rounded-full transition-all duration-200 ${
                      isWishlisted 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                  
                  {/* Image Navigation */}
                  {service.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full text-gray-600 hover:text-gray-800 transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-16 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full text-gray-600 hover:text-gray-800 transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
                
                {/* Image Thumbnails */}
                {service.images.length > 1 && (
                  <div className="flex space-x-2 p-4 overflow-x-auto">
                    {service.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === index 
                            ? 'border-blue-500 ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img src={image} alt={`${service.title} ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Service Details */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.title}</h1>
                    <div className="flex items-center text-gray-600">
                      <span className="text-sm">{service.category?.name}</span>
                      {service.tags && service.tags.length > 0 && (
                        <>
                          <span className="mx-2">•</span>
                          <div className="flex flex-wrap gap-2">
                            {service.tags.map((tag, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">
                      {service.currency} {service.price}
                    </div>
                    <div className="text-sm text-gray-500">Fixed Price</div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {service.description || 'No description available for this service.'}
                  </p>
                </div>

                {/* Working Hours */}
                {service.workingTime && service.workingTime.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Working Hours
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {service.workingTime.map((time, index) => (
                          <div key={index} className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="text-gray-700">{time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Service Features */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Service Features</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-700">Verified Provider</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="w-5 h-5 text-blue-500 mr-3" />
                      <span className="text-gray-700">Quality Guaranteed</span>
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="w-5 h-5 text-purple-500 mr-3" />
                      <span className="text-gray-700">24/7 Support</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-500 mr-3" />
                      <span className="text-gray-700">Top Rated Service</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Provider Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Service Provider</h3>
                
                <div className="flex items-center mb-4">
                  <img
                    src={service.provider.avatar || "/api/placeholder/60/60"}
                    alt={service.provider.name}
                    className="w-16 h-16 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{service.provider.name}</h4>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-gray-700 ml-1">
                        {service.provider.rating?.toFixed(1) || '4.5'} ({service.provider.reviews || 23} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-3" />
                    <span>Available Nationwide</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-3" />
                    <span>Usually responds within 1 hour</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleBookNow}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Book Now
                  </button>
                  
                  <button
                    onClick={handleContactProvider}
                    className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Provider
                  </button>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Contact</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">+1 (555) 123-4567</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">{service.provider?.email || 'Contact via platform'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">Service Area: Nationwide</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Pro Tip:</strong> Message the provider for a custom quote or to discuss your specific requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <Toaster />
    </div>
  );
};

export default ServiceDetailPage;
