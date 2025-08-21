import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, Heart, MapPin, Clock, MessageCircle, Phone, Mail, ArrowLeft, Calendar, 
  Shield, Award, ChevronLeft, ChevronRight, Send, Bookmark, Share2, Eye,
  CheckCircle, Users, ThumbsUp
} from 'lucide-react';
import { serviceApi, type ServiceResponse } from '../api/serviceApi';
import { userApi, type ProviderProfile } from '../api/userApi';
import Breadcrumb from '../components/services/Breadcrumb';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import toast, { Toaster } from 'react-hot-toast';
import { cn } from '../utils/utils';

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

interface Review {
  id: string;
  rating: number;
  comment: string;
  clientName: string;
  clientAvatar: string;
  date: string;
  helpful: number;
  service?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'provider';
  message: string;
  timestamp: string;
  read: boolean;
}

type TabType = 'overview' | 'reviews' | 'chat';

const ServiceDetailPage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<DetailedService | null>(null);
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [providerLoading, setProviderLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [autoSlide, setAutoSlide] = useState(true);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'provider',
      message: 'Hello! I\'d be happy to help you with your project. Feel free to ask any questions!',
      timestamp: '2025-08-21T10:00:00Z',
      read: true
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  
  // Reviews state  
  const [reviews] = useState<Review[]>([
    {
      id: '1',
      rating: 5,
      comment: 'Excellent service! Very professional and delivered exactly what I needed. Highly recommend!',
      clientName: 'Sarah Johnson',
      clientAvatar: 'https://picsum.photos/seed/client1/60/60',
      date: '2025-08-15',
      helpful: 12,
      service: 'Web Development'
    },
    {
      id: '2',
      rating: 4,
      comment: 'Great work quality and timely delivery. Communication could be improved but overall very satisfied.',
      clientName: 'Michael Chen',
      clientAvatar: 'https://picsum.photos/seed/client2/60/60',
      date: '2025-08-10',
      helpful: 8,
      service: 'Logo Design'
    },
    {
      id: '3',
      rating: 5,
      comment: 'Outstanding! Exceeded my expectations. Will definitely work with this provider again.',
      clientName: 'Emma Davis',
      clientAvatar: 'https://picsum.photos/seed/client3/60/60',
      date: '2025-08-05',
      helpful: 15,
      service: 'Content Writing'
    }
  ]);
  const [reviewFilter, setReviewFilter] = useState('all');

  // Auto-slide effect for images
  useEffect(() => {
    if (autoSlide && service && service.images.length > 1) {
      const interval = setInterval(() => {
        setSelectedImage((prev) => (prev + 1) % service.images.length);
      }, 4000); // Change image every 4 seconds
      
      return () => clearInterval(interval);
    }
  }, [autoSlide, service]);

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

  // Fetch provider details
  const fetchProviderDetails = async (providerId: string) => {
    try {
      setProviderLoading(true);
      const providerData = await userApi.getProviderById(providerId);
      setProvider(providerData);
    } catch (error) {
      console.error('Failed to fetch provider details:', error);
      // Don't show error toast for provider details failure as it's not critical
    } finally {
      setProviderLoading(false);
    }
  };

  useEffect(() => {
    const fetchService = async () => {
      if (!serviceId) return;
      
      try {
        setLoading(true);
        
        // Fetch service from API
        const response = await serviceApi.getServiceById(serviceId);
        
        if (response.success) {
          const transformedService = transformApiService(response.data);
          setService(transformedService);
          
          // Fetch provider details if provider ID is available
          if (response.data.provider?.id) {
            await fetchProviderDetails(response.data.provider.id);
          }
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
    console.log('Service object:', service); // Debug log
    console.log('Provider ID:', service?.provider?.id); // Debug log
    
    if (service?.provider?.id) {
      console.log('Navigating to provider page with ID:', service.provider.id); // Debug log
      // Navigate to the specific provider page with the provider ID
      navigate(`/provider/${service.provider.id}`);
    } else {
      // When provider ID is not available, show an error
      console.log('No provider ID available'); // Debug log
      toast.error('Provider information not available');
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
      setAutoSlide(false); // Stop auto-slide when user manually navigates
      setTimeout(() => setAutoSlide(true), 10000); // Resume auto-slide after 10 seconds
    }
  };

  const prevImage = () => {
    if (service && service.images.length > 1) {
      setSelectedImage((prev) => (prev - 1 + service.images.length) % service.images.length);
      setAutoSlide(false); // Stop auto-slide when user manually navigates
      setTimeout(() => setAutoSlide(true), 10000); // Resume auto-slide after 10 seconds
    }
  };

  // Chat handlers
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        sender: 'user',
        message: newMessage.trim(),
        timestamp: new Date().toISOString(),
        read: false
      };
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Simulate provider response
      setTimeout(() => {
        const response: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'provider',
          message: 'Thank you for your message! I\'ll get back to you soon with more details.',
          timestamp: new Date().toISOString(),
          read: false
        };
        setChatMessages(prev => [...prev, response]);
      }, 2000);
    }
  };

  // Review helpers
  const filteredReviews = reviewFilter === 'all' 
    ? reviews 
    : reviews.filter(review => review.rating === parseInt(reviewFilter));

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0
  }));

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
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb items={breadcrumbItems} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Main Content - Takes 3 columns */}
            <div className="xl:col-span-3">
              {/* Enhanced Image Gallery with Auto-Slide */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 group">
                <div className="aspect-video relative bg-gray-100">
                  <img
                    src={service.images[selectedImage]}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  
                  {/* Image Overlay with Actions */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  
                  {/* Top Actions */}
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button
                      onClick={toggleWishlist}
                      className={cn(
                        "p-3 rounded-full backdrop-blur-sm border transition-all duration-200 hover:scale-110",
                        isWishlisted 
                          ? 'bg-red-500 text-white border-red-500' 
                          : 'bg-white/90 text-gray-700 border-white/50 hover:bg-red-50 hover:text-red-500'
                      )}
                    >
                      <Heart className={cn("w-5 h-5", isWishlisted && "fill-current")} />
                    </button>
                    <button className="p-3 rounded-full bg-white/90 backdrop-blur-sm border border-white/50 text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-110">
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button className="p-3 rounded-full bg-white/90 backdrop-blur-sm border border-white/50 text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-110">
                      <Bookmark className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Auto-slide indicator */}
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5">
                      <Eye className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-medium">{selectedImage + 1}/{service.images.length}</span>
                      {autoSlide && (
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      )}
                    </div>
                  </div>
                  
                  {/* Navigation Arrows */}
                  {service.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all duration-200 hover:scale-110"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-16 top-1/2 -translate-y-1/2 p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all duration-200 hover:scale-110"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}

                  {/* Progress Indicators */}
                  {service.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                      {service.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedImage(index);
                            setAutoSlide(false);
                            setTimeout(() => setAutoSlide(true), 10000);
                          }}
                          className={cn(
                            "w-3 h-3 rounded-full transition-all duration-200",
                            selectedImage === index 
                              ? 'bg-white scale-125' 
                              : 'bg-white/50 hover:bg-white/75'
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Enhanced Image Thumbnails */}
                {service.images.length > 1 && (
                  <div className="flex space-x-3 p-4 overflow-x-auto scrollbar-hide">
                    {service.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedImage(index);
                          setAutoSlide(false);
                          setTimeout(() => setAutoSlide(true), 10000);
                        }}
                        className={cn(
                          "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105",
                          selectedImage === index 
                            ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg' 
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <img src={image} alt={`${service.title} ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Service Header */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">{service.title}</h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                        {service.category?.name}
                      </span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="font-medium">{averageRating.toFixed(1)}</span>
                        <span className="text-gray-400 ml-1">({reviews.length} reviews)</span>
                      </div>
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        <span>1.2k views</span>
                      </div>
                    </div>
                    {service.tags && service.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {service.tags.map((tag, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full hover:bg-gray-200 transition-colors">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-6">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {service.currency} {service.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Starting price</div>
                    <div className="flex items-center mt-2 text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">Available now</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Tabs Navigation */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6">
                    {[
                      { id: 'overview', label: 'Overview', icon: Shield },
                      { id: 'reviews', label: `Reviews (${reviews.length})`, icon: Star },
                      { id: 'chat', label: 'Chat with Provider', icon: MessageCircle }
                    ].map((tab) => {
                      const IconComponent = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as TabType)}
                          className={cn(
                            "flex items-center py-4 px-2 border-b-2 font-medium text-sm transition-all duration-200",
                            activeTab === tab.id
                              ? "border-blue-500 text-blue-600"
                              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                          )}
                        >
                          <IconComponent className="w-4 h-4 mr-2" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Description */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">About this service</h3>
                        <p className="text-gray-700 leading-relaxed text-lg">
                          {service.description || 'No description available for this service.'}
                        </p>
                      </div>

                      {/* Working Hours */}
                      {service.workingTime && service.workingTime.length > 0 && (
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                            <Clock className="w-5 h-5 mr-2" />
                            Working Hours
                          </h3>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {service.workingTime.map((time, index) => (
                                <div key={index} className="flex items-center bg-white rounded-lg p-3">
                                  <Calendar className="w-4 h-4 mr-3 text-blue-500" />
                                  <span className="text-gray-700">{time}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Service Features */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">What's included</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { icon: Shield, label: "Verified Provider", desc: "Background checked and verified" },
                            { icon: Award, label: "Quality Guaranteed", desc: "100% satisfaction guarantee" },
                            { icon: MessageCircle, label: "24/7 Support", desc: "Round the clock customer support" },
                            { icon: Users, label: "Experienced Team", desc: "5+ years of industry experience" }
                          ].map((feature, index) => {
                            const IconComponent = feature.icon;
                            return (
                              <div key={index} className="flex items-start bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                                  <IconComponent className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900">{feature.label}</span>
                                  <p className="text-sm text-gray-600 mt-1">{feature.desc}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reviews Tab */}
                  {activeTab === 'reviews' && (
                    <div className="space-y-6">
                      {/* Review Summary */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-gray-900 mb-2">
                              {averageRating.toFixed(1)}
                            </div>
                            <div className="flex items-center justify-center mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "w-5 h-5",
                                    i < Math.floor(averageRating) ? "text-yellow-400 fill-current" : "text-gray-300"
                                  )}
                                />
                              ))}
                            </div>
                            <p className="text-gray-600">Based on {reviews.length} reviews</p>
                          </div>
                          <div className="space-y-2">
                            {ratingDistribution.map((dist) => (
                              <div key={dist.rating} className="flex items-center space-x-3">
                                <span className="text-sm font-medium w-8">{dist.rating}★</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${dist.percentage}%` }}
                                  />
                                </div>
                                <span className="text-sm text-gray-600 w-8">{dist.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Review Filters */}
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">Filter by rating:</span>
                        {['all', '5', '4', '3', '2', '1'].map((filter) => (
                          <button
                            key={filter}
                            onClick={() => setReviewFilter(filter)}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                              reviewFilter === filter
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}
                          >
                            {filter === 'all' ? 'All' : `${filter} Stars`}
                          </button>
                        ))}
                      </div>

                      {/* Reviews List */}
                      <div className="space-y-4">
                        {filteredReviews.map((review) => (
                          <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start space-x-4">
                              <img
                                src={review.clientAvatar}
                                alt={review.clientName}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <h4 className="font-semibold text-gray-900">{review.clientName}</h4>
                                    <div className="flex items-center space-x-2">
                                      <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                          <Star
                                            key={i}
                                            className={cn(
                                              "w-4 h-4",
                                              i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                            )}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-sm text-gray-500">• {review.date}</span>
                                      {review.service && (
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                          {review.service}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <p className="text-gray-700 leading-relaxed mb-3">{review.comment}</p>
                                <div className="flex items-center space-x-4 text-sm">
                                  <button className="flex items-center text-gray-500 hover:text-blue-600 transition-colors">
                                    <ThumbsUp className="w-4 h-4 mr-1" />
                                    Helpful ({review.helpful})
                                  </button>
                                  <button className="text-gray-500 hover:text-blue-600 transition-colors">
                                    Reply
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Chat Tab */}
                  {activeTab === 'chat' && (
                    <div className="space-y-4">
                      {/* Chat Header */}
                      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <img
                            src={provider?.user?.imageUrl || "/api/placeholder/40/40"}
                            alt="Provider"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {provider?.user ? 
                                `${provider.user.firstName || ''} ${provider.user.lastName || ''}`.trim() || provider.user.email :
                                service?.provider?.name || 'Provider'
                              }
                            </h3>
                            <p className="text-sm text-green-600">● Online now</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          Usually responds within 1 hour
                        </div>
                      </div>

                      {/* Chat Messages */}
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {chatMessages.map((message) => (
                          <div
                            key={message.id}
                            className={cn(
                              "flex",
                              message.sender === 'user' ? "justify-end" : "justify-start"
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl",
                                message.sender === 'user'
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-900"
                              )}
                            >
                              <p className="text-sm">{message.message}</p>
                              <p className={cn(
                                "text-xs mt-1",
                                message.sender === 'user' ? "text-blue-100" : "text-gray-500"
                              )}>
                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Chat Input */}
                      <div className="flex space-x-3 pt-4 border-t border-gray-200">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          className={cn(
                            "px-6 py-2 rounded-full font-medium transition-all duration-200 flex items-center",
                            newMessage.trim()
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          )}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Sidebar */}
            <div className="xl:col-span-1">
              {/* Provider Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6 sticky top-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Service Provider</h3>
                
                {providerLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center mb-4">
                      <img
                        src={provider?.user?.imageUrl || "/api/placeholder/60/60"}
                        alt="Provider"
                        className="w-16 h-16 rounded-full mr-4 object-cover border-2 border-gray-200"
                      />
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {provider?.user ? 
                            `${provider.user.firstName || ''} ${provider.user.lastName || ''}`.trim() || provider.user.email :
                            service?.provider?.name || 'Unknown Provider'
                          }
                        </h4>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-gray-700 ml-1">
                            {provider?.averageRating?.toFixed(1) || '4.5'} ({provider?.totalReviews || 0} reviews)
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                          <span className="text-sm text-green-600">Online now</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-3 flex-shrink-0" />
                        <span>{provider?.user?.location || 'Location not specified'}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-3 flex-shrink-0" />
                        <span>Usually responds within 1 hour</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Shield className="w-4 h-4 mr-3 flex-shrink-0" />
                        <span>Verified provider since 2023</span>
                      </div>
                    </div>

                    {provider?.bio && (
                      <div className="mb-6">
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {provider.bio}
                        </p>
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-3">
                  <button
                    onClick={handleBookNow}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Book Now
                  </button>
                  
                  <button
                    onClick={handleContactProvider}
                    className="w-full border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Provider
                  </button>
                </div>

                {/* Quick Stats */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">150+</div>
                      <div className="text-sm text-gray-600">Orders</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">98%</div>
                      <div className="text-sm text-gray-600">Positive</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Contact */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Contact</h3>
                
                <div className="space-y-4">
                  {provider?.user?.phone && (
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-700">{provider.user.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">
                      {provider?.user?.email || service?.provider?.email || 'Contact via platform'}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">
                      Service Area: {provider?.user?.location || 'Location not specified'}
                    </span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Pro Tip:</strong> Message the provider for a custom quote or to discuss your specific requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <Toaster position="bottom-right" />
    </div>
  );
};

export default ServiceDetailPage;
