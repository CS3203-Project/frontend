import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, Heart, MapPin, Clock, MessageCircle, Phone, Mail, ArrowLeft, Calendar, 
  Shield, Award, ChevronLeft, ChevronRight, Send, Bookmark, Share2, Eye,
  CheckCircle, Users, ThumbsUp, User, GraduationCap
} from 'lucide-react';
import { serviceApi, type ServiceResponse } from '../api/serviceApi';
import { serviceReviewApi, type ServiceReview, type ReviewStats } from '../api/serviceReviewApi';
import { userApi, type ProviderProfile } from '../api/userApi';
import { messagingApi } from '../api/messagingApi';
import { debugMessagingState } from '../utils/messagingDebug';
import { useAuth } from '../contexts/AuthContext';
import Breadcrumb from '../components/services/Breadcrumb';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import toast, { Toaster } from 'react-hot-toast';
import { cn } from '../utils/utils';
import { confirmationApi } from '../api/confirmationApi';

interface DetailedService {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  images: string[];
  videoUrl?: string;
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
  const { user, isLoggedIn } = useAuth();
  const [service, setService] = useState<DetailedService | null>(null);
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [providerLoading, setProviderLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
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
  const [reviews, setReviews] = useState<ServiceReview[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [reviewsLoading, setReviewsLoading] = useState(false);
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
    console.log('🔄 Transforming API service data:', apiService);
    console.log('🏢 Service provider data from API:');
    console.log('  - Provider ID:', apiService.provider?.id);
    console.log('  - Provider User Data:', apiService.provider?.user);
    if (apiService.provider?.user) {
      console.log('    - First Name:', apiService.provider.user.firstName);
      console.log('    - Last Name:', apiService.provider.user.lastName);
      console.log('    - Email:', apiService.provider.user.email);
      console.log('    - Image URL:', apiService.provider.user.imageUrl);
      console.log('    - Location:', (apiService.provider.user as any).location);
      console.log('    - Phone:', (apiService.provider.user as any).phone);
    }
    console.log('  - Average Rating:', apiService.provider?.averageRating);
    console.log('  - Total Reviews:', apiService.provider?.totalReviews);
    
    return {
      id: apiService.id,
      title: apiService.title || 'Untitled Service',
      description: apiService.description,
      price: Number(apiService.price),
      currency: apiService.currency,
      images: apiService.images && apiService.images.length > 0 ? apiService.images : ['https://picsum.photos/seed/service/800/400'],
      videoUrl: apiService.videoUrl,
      category: {
        name: apiService.category?.name || 'Service',
        slug: apiService.category?.slug || 'general'
      },
      tags: apiService.tags || [],
      workingTime: apiService.workingTime || [],
      provider: {
        id: apiService.provider?.id,
        name: apiService.provider?.user ? 
          (`${apiService.provider.user.firstName || ''} ${apiService.provider.user.lastName || ''}`.trim() || apiService.provider.user.email || 'Unknown Provider') 
          : 'Unknown Provider',
        email: apiService.provider?.user?.email,
        avatar: 'https://ui-avatars.com/api/?name=Provider&background=6366f1&color=fff&size=60',
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
      console.log('🔍 Fetching provider details for ID:', providerId);
      const providerData = await userApi.getProviderById(providerId);
      console.log('✅ Provider data received:', providerData);
      console.log('📋 Provider fields breakdown:');
      console.log('  - Provider ID:', providerData?.id);
      console.log('  - User ID:', providerData?.userId);
      console.log('  - Bio:', providerData?.bio);
      console.log('  - Skills:', providerData?.skills);
      console.log('  - Qualifications:', providerData?.qualifications);
      console.log('  - Logo URL:', providerData?.logoUrl);
      console.log('  - Average Rating:', providerData?.averageRating);
      console.log('  - Total Reviews:', providerData?.totalReviews);
      console.log('  - Is Verified:', providerData?.isVerified);
      console.log('👤 User details (via relation):');
      console.log('  - First Name:', providerData?.user?.firstName);
      console.log('  - Last Name:', providerData?.user?.lastName);
      console.log('  - Email:', providerData?.user?.email);
      console.log('  - Image URL:', providerData?.user?.imageUrl);
      console.log('  - Location:', providerData?.user?.location);
      console.log('  - Phone:', providerData?.user?.phone);
      setProvider(providerData);
    } catch (error) {
      console.error('❌ Failed to fetch provider details:', error);
      // Don't show error toast for provider details failure as it's not critical
    } finally {
      setProviderLoading(false);
    }
  };

  // Fetch service reviews
  const fetchServiceReviews = async (serviceId: string) => {
    try {
      setReviewsLoading(true);
      const ratingFilter = reviewFilter === 'all' ? undefined : parseInt(reviewFilter);
      
      const response = await serviceReviewApi.getServiceReviewsDetailed(serviceId, {
        page: 1,
        limit: 20,
        rating: ratingFilter
      });
      
      if (response.success) {
        setReviews(response.data.reviews);
        setReviewStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch service reviews:', error);
      // Don't show error toast as reviews are not critical for page function
    } finally {
      setReviewsLoading(false);
    }
  };

  // Refetch reviews when filter changes
  useEffect(() => {
    if (service) {
      fetchServiceReviews(service.id);
    }
  }, [reviewFilter, service?.id]);

  useEffect(() => {
    const fetchService = async () => {
      if (!serviceId) return;
      
      try {
        setLoading(true);
        
        // Try to fetch service directly first
        let response;
        try {
          response = await serviceApi.getServiceById(serviceId);
        } catch (directError) {
          console.log('Failed to get service by ID, trying conversation ID:', directError);
          // If direct service fetch fails, try getting service by conversation ID
          try {
            response = await serviceApi.getServiceByConversationId(serviceId);
          } catch (conversationError) {
            console.error('Failed to get service by conversation ID:', conversationError);
            throw conversationError;
          }
        }
        
        if (response.success) {
          const transformedService = transformApiService(response.data);
          setService(transformedService);
          
          // Fetch provider details if provider ID is available
          if (response.data.provider?.id) {
            await fetchProviderDetails(response.data.provider.id);
          }
          
          // Fetch service reviews
          await fetchServiceReviews(response.data.id);
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

  const handleBookNow = async () => {
    // Check if user is logged in
    if (!isLoggedIn || !user) {
      toast.error('Please log in to book a service');
      navigate('/signin');
      return;
    }

    // Check if provider ID is available
    if (!service?.provider?.id) {
      toast.error('Provider information not available');
      return;
    }

    // Debug logging
    console.log('=== BOOK NOW DEBUG ===');
    console.log('Current user:', user);
    console.log('Current user ID:', user.id);
    console.log('Service provider ID:', service.provider.id);
    console.log('Service:', service);

    // Validate user IDs
    if (!user.id) {
      toast.error('Invalid user session. Please log in again.');
      return;
    }

    if (!service.provider.id) {
      toast.error('Invalid provider information.');
      return;
    }

    // Get the provider's user ID (not the provider ID)
    let providerUserId: string;
    
    if (provider?.userId) {
      // We have the provider details, use the userId
      providerUserId = provider.userId;
      console.log('Using provider user ID from provider details:', providerUserId);
    } else {
      // We need to fetch the provider to get the userId
      try {
        console.log('Fetching provider details to get user ID...');
        const providerData = await userApi.getProviderById(service.provider.id);
        providerUserId = providerData.userId;
        console.log('Retrieved provider user ID:', providerUserId);
      } catch (error) {
        console.error('Failed to fetch provider details:', error);
        toast.error('Unable to get provider information. Please try again.');
        return;
      }
    }

    try {
      setBookingLoading(true);
      
      // Check if conversation already exists (use provider's user ID, not provider ID)
      console.log('Checking for existing conversation between:', user.id, 'and', providerUserId);
      const existingConversation = await messagingApi.findConversationByParticipants(
        user.id, 
        providerUserId
      );

      if (existingConversation) {
        console.log('Found existing conversation:', existingConversation);
        toast.success('Opening existing conversation...');
        navigate(`/conversation/${existingConversation.id}`);
        return;
      }
      
      // Create conversation between user and provider's user ID, including serviceId
      const conversationData = {
        userIds: [user.id, providerUserId],
        title: service.title,
        serviceId: service.id // Pass the serviceId to backend
      };

      console.log('Creating conversation with data:', conversationData);

      const conversation = await messagingApi.createConversation(conversationData);
      
      console.log('Conversation created:', conversation);
      
      // Send initial message (use provider's user ID, not provider ID)
      const initialMessage = `Hi! I'm interested in your service: ${service.title}`;
      console.log('Sending initial message...');
      
      await messagingApi.sendMessage({
        content: initialMessage,
        fromId: user.id,
        toId: providerUserId,
        conversationId: conversation.id
      });

      console.log('Initial message sent successfully');
      
      toast.success('Conversation started! Redirecting to messages...');
      
      // Ensure confirmation record exists for this conversation
      try {
        await confirmationApi.ensure(conversation.id);
      } catch (ensureErr) {
        console.warn('Failed to ensure confirmation record (non-blocking):', ensureErr);
      }
      
      // Navigate to the specific conversation
      navigate(`/conversation/${conversation.id}`);
      
    } catch (error) {
      console.error('Failed to create conversation:', error);
      
      // More specific error handling
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('User not found')) {
        console.log('=== USER NOT FOUND ERROR ===');
        console.log('This suggests the user IDs are not valid in the backend database');
        console.log('User ID:', user.id);
        console.log('Provider User ID:', providerUserId);
        debugMessagingState();
        toast.error('User validation failed. Please try logging out and back in.');
      } else if (errorMessage.includes('conversation')) {
        toast.error('Failed to create conversation. Please try again.');
      } else {
        toast.error('Failed to start conversation. Please try again.');
      }
    } finally {
      setBookingLoading(false);
    }
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

  const averageRating = reviewStats.averageRating;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviewStats.ratingDistribution[rating as keyof typeof reviewStats.ratingDistribution],
    percentage: reviewStats.totalReviews > 0 
      ? (reviewStats.ratingDistribution[rating as keyof typeof reviewStats.ratingDistribution] / reviewStats.totalReviews) * 100 
      : 0
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100/30 to-blue-50/20 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center mt-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            </div>

        </div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100/30 to-blue-50/20 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center mt-16">
          <div className="text-center bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-red-500">×</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Service not found</h3>
            <button 
              onClick={() => navigate('/services')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-black dark:via-gray-900/70 dark:to-blue-950/40 flex flex-col relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-300/20 to-purple-300/20 dark:from-blue-800/30 dark:to-purple-800/30 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-300/20 to-blue-300/20 dark:from-cyan-800/30 dark:to-blue-800/30 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-purple-300/10 to-pink-300/10 dark:from-purple-800/20 dark:to-pink-800/20 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      </div>
      
      <Navbar />
      
      <main className="flex-1 mt-16 relative z-10">
        <div className="container mx-auto px-4 py-8">
          {/* Enhanced Back Button with Glass Morphism */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-blue-700 dark:text-gray-300 dark:hover:text-blue-400 mb-6 transition-all duration-300 group bg-white/60 dark:bg-black/50 backdrop-blur-xl rounded-2xl px-6 py-3 shadow-lg border border-white/30 dark:border-gray-700/50 hover:shadow-xl hover:border-blue-300/50 dark:hover:border-blue-600/50 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Back</span>
          </button>

          {/* Enhanced Glass Morphism Breadcrumb */}
          <div className="mb-8 bg-white/60 dark:bg-black/50 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/30 dark:border-gray-700/50">
            <Breadcrumb items={breadcrumbItems} />
          </div>

          {/* Enhanced Responsive Full Width Video Section */}
          {service.videoUrl && (
            <div className="mb-6 relative h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] w-full rounded-2xl sm:rounded-3xl overflow-hidden mx-auto max-w-7xl">
              {/* Full Width Video Background */}
              <div className="absolute inset-0 z-0">
                {service.videoUrl ? (
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src={service.videoUrl} type="video/mp4" />
                    <source src={service.videoUrl} type="video/webm" />
                  </video>
                ) : (
                  // Default video (using HeroSection video as fallback)
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src="https://sg.fiverrcdn.com/packages_lp/cover_video.mp4" type="video/mp4" />
                  </video>
                )}
                {/* Dark overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-pink-900/30"></div>
              </div>

              {/* Responsive Title Overlay */}
              <div className="absolute inset-0 z-10 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="text-center max-w-xs sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto">
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-6xl font-bold text-white mb-2 sm:mb-4 leading-tight drop-shadow-2xl">
                    {service.title}
                  </h1>
                  {/* Optional subtle service indicator */}
                  <div className="inline-flex items-center bg-white/10 backdrop-blur-md rounded-full px-3 py-1.5 sm:px-6 sm:py-2 border border-white/20">
                    <span className="text-white/90 text-xs sm:text-sm font-medium">Premium Service</span>
                  </div>
                </div>
              </div>

              {/* Responsive floating indicators */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 lg:top-6 lg:left-6 bg-black/20 backdrop-blur-md rounded-full px-2 py-1 sm:px-3 sm:py-1 border border-white/10">
                <div className="flex items-center text-white text-xs sm:text-sm">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full mr-1 sm:mr-2 animate-pulse"></div>
                  Live
                </div>
              </div>
              
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 lg:top-6 lg:right-6 bg-black/20 backdrop-blur-md rounded-full px-2 py-1 sm:px-3 sm:py-1 border border-white/10">
                <div className="flex items-center text-white text-xs sm:text-sm">
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />
                  HD
                </div>
              </div>
            </div>
          )}

          {/* Main Content Layout - Grid System */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Images and Service Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Enhanced Compact Image Gallery */}
              <div className="bg-white/80 dark:bg-black/60 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-700/50 group">
                <div className="aspect-[16/9] relative bg-gradient-to-br from-gray-50/50 to-blue-50/50 dark:from-black/40 dark:to-blue-950/40">
                  <img
                    src={service.images[selectedImage]}
                    alt={service.title}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.03]"
                  />
                  
                  {/* Enhanced Glass Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
                  
                  {/* Floating Action Buttons with Glass Morphism */}
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button
                      onClick={toggleWishlist}
                      className={cn(
                        "p-3 rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-110 shadow-xl",
                        isWishlisted 
                          ? 'bg-gradient-to-r from-red-500/90 to-pink-500/90 text-white border-red-400/50 shadow-red-200/50' 
                          : 'bg-white/20 dark:bg-black/30 text-gray-700 dark:text-gray-300 border-white/30 dark:border-gray-600/30 hover:bg-red-50/30 dark:hover:bg-red-900/30 hover:text-red-500 hover:border-red-200/50 dark:hover:border-red-600/50'
                      )}
                      title="Add to wishlist"
                    >
                      <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
                    </button>
                    <button 
                      className="p-3 rounded-2xl bg-white/20 dark:bg-black/30 backdrop-blur-xl border border-white/30 dark:border-gray-600/30 text-gray-700 dark:text-gray-300 hover:bg-blue-50/30 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200/50 dark:hover:border-blue-600/50 transition-all duration-300 hover:scale-110 shadow-xl"
                      title="Share service"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-3 rounded-2xl bg-white/20 dark:bg-black/30 backdrop-blur-xl border border-white/30 dark:border-gray-600/30 text-gray-700 dark:text-gray-300 hover:bg-yellow-50/30 dark:hover:bg-yellow-900/30 hover:text-yellow-600 dark:hover:text-yellow-400 hover:border-yellow-200/50 dark:hover:border-yellow-600/50 transition-all duration-300 hover:scale-110 shadow-xl"
                      title="Bookmark service"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Glass Morphism Slide Indicator */}
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center space-x-2 bg-white/20 dark:bg-black/30 backdrop-blur-xl rounded-2xl px-4 py-2 border border-white/30 dark:border-gray-600/30 shadow-xl">
                      <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{selectedImage + 1}/{service.images.length}</span>
                      {autoSlide && (
                        <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse" />
                      )}
                    </div>
                  </div>
                  
                  {/* Modern Glass Navigation Arrows */}
                  {service.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 dark:bg-black/30 backdrop-blur-xl rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-black/40 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:scale-110 shadow-xl border border-white/30 dark:border-gray-600/30"
                        title="Previous image"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 dark:bg-black/30 backdrop-blur-xl rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-black/40 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:scale-110 shadow-xl border border-white/30 dark:border-gray-600/30"
                        title="Next image"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {/* Modern Glass Progress Indicators */}
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
                            "h-2 rounded-full transition-all duration-300 hover:scale-110",
                            selectedImage === index 
                              ? 'w-8 bg-gradient-to-r from-blue-500 to-cyan-600 shadow-lg' 
                              : 'w-2 bg-white/70 hover:bg-white/90'
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Compact Glass Thumbnails */}
                {service.images.length > 1 && (
                  <div className="flex space-x-2 p-4 overflow-x-auto scrollbar-hide bg-gradient-to-r from-gray-50/80 to-blue-50/80 dark:from-black/40 dark:to-blue-950/40 backdrop-blur-sm">
                    {service.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedImage(index);
                          setAutoSlide(false);
                          setTimeout(() => setAutoSlide(true), 10000);
                        }}
                        className={cn(
                          "flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-110",
                          selectedImage === index 
                            ? 'border-blue-500/80 dark:border-blue-400/80 ring-2 ring-blue-200/50 dark:ring-blue-600/30 shadow-lg transform scale-105' 
                            : 'border-gray-200/50 dark:border-gray-600/50 hover:border-blue-300/70 dark:hover:border-blue-500/70 shadow-sm'
                        )}
                      >
                        <img src={image} alt={`${service.title} ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Enhanced Service Header with Glass Morphism */}
              <div className="bg-gradient-to-br from-white/90 to-gray-50/50 dark:from-black/70 dark:to-gray-900/50 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20 dark:border-gray-700/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-gray-100 dark:to-blue-100 bg-clip-text text-transparent mb-3">
                      {service.title}
                    </h1>
                    <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400 mb-4 flex-wrap gap-2">
                      <span className="bg-gradient-to-r from-blue-100/80 to-cyan-100/80 dark:from-blue-900/60 dark:to-cyan-900/60 backdrop-blur-sm text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full font-medium shadow-lg border border-blue-200/50 dark:border-blue-700/50">
                        {service.category?.name}
                      </span>
                      <div className="flex items-center bg-white/60 dark:bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="font-medium text-gray-800 dark:text-gray-200">{averageRating.toFixed(1)}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-1">({reviewStats.totalReviews} reviews)</span>
                      </div>
                      <div className="flex items-center bg-white/60 dark:bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                        <Eye className="w-4 h-4 mr-1 text-blue-500 dark:text-blue-400" />
                        <span className="text-gray-700 dark:text-gray-300">1.2k views</span>
                      </div>
                    </div>
                    {service.tags && service.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {service.tags.map((tag, index) => (
                          <span 
                            key={index} 
                            className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-black/40 dark:to-gray-900/60 backdrop-blur-sm text-gray-700 dark:text-gray-300 text-xs px-3 py-1.5 rounded-full hover:from-blue-50/80 hover:to-cyan-50/80 dark:hover:from-blue-950/40 dark:hover:to-cyan-950/40 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-300 cursor-default border border-gray-200/50 dark:border-gray-600/50 shadow-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Provider Details and Actions */}
            <div className="lg:col-span-1 space-y-6">
              {/* Glass Morphism Price Card */}
              <div className="bg-white/80 dark:bg-black/60 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 dark:border-gray-700/50 sticky top-24">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                    {service.currency} {service.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">Starting price</div>
                  <div className="flex items-center justify-center text-green-600 dark:text-green-400 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/30 dark:to-emerald-900/30 backdrop-blur-sm rounded-2xl px-4 py-2 border border-green-200/50 dark:border-green-700/50 shadow-lg">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">Available now</span>
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleBookNow}
                    disabled={bookingLoading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-2xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl border border-green-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none backdrop-blur-sm"
                  >
                    {bookingLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating conversation...
                      </div>
                    ) : (
                      'Book Now'
                    )}
                  </button>
                  
                  <button
                    onClick={handleContactProvider}
                    className="w-full border-2 border-gray-300/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 py-4 px-6 rounded-2xl font-semibold hover:bg-blue-50/50 dark:hover:bg-blue-900/30 hover:border-blue-400/50 dark:hover:border-blue-500/50 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl backdrop-blur-sm bg-white/30 dark:bg-black/30"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Provider
                  </button>
                </div>

                {/* Quick Provider Info */}
                <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="relative">
                      <img
                        src={provider?.logoUrl || provider?.user?.imageUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(provider?.user ? `${provider.user.firstName || ''} ${provider.user.lastName || ''}`.trim() || provider.user.email || 'User' : 'Provider') + '&background=6366f1&color=fff&size=48'}
                        alt="Provider"
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-white/50 dark:border-gray-600/50 shadow-lg"
                      />
                      {provider?.isVerified && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-100">
                        {provider?.user ? 
                          `${provider.user.firstName || ''} ${provider.user.lastName || ''}`.trim() || provider.user.email || 'Provider' :
                          'Provider'
                        }
                      </h4>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {provider?.averageRating ? provider.averageRating.toFixed(1) : 'New'}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 ml-1 text-sm">
                          ({provider?.totalReviews || 0})
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {provider?.isVerified && (
                    <div className="flex items-center text-green-600 dark:text-green-400 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/30 dark:to-emerald-900/30 backdrop-blur-sm rounded-xl px-3 py-2 text-sm font-medium border border-green-200/50 dark:border-green-700/50 shadow-sm">
                      <Shield className="w-4 h-4 mr-1" />
                      Verified Provider
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modern Glass Morphism Tabs Navigation */}
          <div className="bg-white/80 dark:bg-black/60 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden mb-6 border border-white/20 dark:border-gray-700/50">
            <div className="border-b border-gray-100/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/60 to-blue-50/40 dark:from-black/40 dark:to-blue-950/40 backdrop-blur-sm">
              <nav className="flex space-x-1 px-6">
                {[
                  { id: 'overview', label: 'Overview', icon: Shield, color: 'blue' },
                  { id: 'reviews', label: `Reviews (${reviewStats.totalReviews})`, icon: Star, color: 'yellow' },
                  { id: 'chat', label: 'Chat with Provider', icon: MessageCircle, color: 'green' }
                ].map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={cn(
                        "flex items-center py-4 px-4 border-b-3 font-medium text-sm transition-all duration-300 relative group",
                        isActive
                          ? "border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 bg-white/60 dark:bg-black/50 backdrop-blur-sm rounded-t-2xl shadow-lg"
                          : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/30 dark:hover:bg-gray-700/30 backdrop-blur-sm rounded-t-lg"
                      )}
                    >
                      <div className={cn(
                        "p-1.5 rounded-lg mr-2 transition-all duration-300",
                        isActive 
                          ? "bg-blue-100/80 dark:bg-blue-900/60 backdrop-blur-sm text-blue-600 dark:text-blue-400" 
                          : "bg-gray-100/60 dark:bg-gray-700/60 backdrop-blur-sm text-gray-500 dark:text-gray-400 group-hover:bg-blue-50/60 dark:group-hover:bg-blue-900/40 group-hover:text-blue-500 dark:group-hover:text-blue-400"
                      )}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      {tab.label}
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6 bg-gradient-to-br from-white/60 to-blue-50/30 dark:from-black/50 dark:to-blue-950/30 backdrop-blur-sm">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Description */}
                  <div className="bg-white/60 dark:bg-black/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 dark:border-gray-700/50">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                      <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-3"></div>
                      About this service
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                      {service.description || 'No description available for this service.'}
                    </p>
                  </div>

                  {/* Working Hours */}
                  {service.workingTime && service.workingTime.length > 0 && (
                    <div className="bg-white/60 dark:bg-black/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 dark:border-gray-700/50">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                        <div className="p-2 bg-gradient-to-r from-green-100/80 to-emerald-100/80 dark:from-green-900/40 dark:to-emerald-900/40 backdrop-blur-sm rounded-lg mr-3">
                          <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        Working Hours
                      </h3>
                      <div className="bg-gradient-to-r from-gray-50/60 to-blue-50/40 dark:from-black/30 dark:to-blue-950/40 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/50 dark:border-gray-600/50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {service.workingTime.map((time, index) => (
                            <div key={index} className="flex items-center bg-white/60 dark:bg-black/40 backdrop-blur-sm rounded-xl p-4 shadow-md border border-gray-100/50 dark:border-gray-600/50 hover:shadow-lg transition-all duration-300">
                              <div className="p-2 bg-gradient-to-r from-blue-100/80 to-purple-100/80 dark:from-blue-900/40 dark:to-purple-900/40 backdrop-blur-sm rounded-lg mr-3">
                                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <span className="text-gray-700 dark:text-gray-300 font-medium">{time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Service Features */}
                  <div className="bg-white/60 dark:bg-black/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 dark:border-gray-700/50">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-3"></div>
                      What's included
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { icon: Shield, label: "Verified Provider", desc: "Background checked and verified", gradient: "from-blue-500 to-cyan-500" },
                        { icon: Award, label: "Quality Guaranteed", desc: "100% satisfaction guarantee", gradient: "from-yellow-500 to-orange-500" },
                        { icon: MessageCircle, label: "24/7 Support", desc: "Round the clock customer support", gradient: "from-green-500 to-emerald-500" },
                        { icon: Users, label: "Experienced Team", desc: "years of industry experience", gradient: "from-purple-500 to-pink-500" }
                      ].map((feature, index) => {
                        const IconComponent = feature.icon;
                        return (
                          <div key={index} className="group">
                            <div className="flex items-start bg-gradient-to-br from-gray-50/60 to-blue-50/40 dark:from-black/30 dark:to-blue-950/40 backdrop-blur-sm rounded-2xl p-4 hover:from-blue-50/60 hover:to-purple-50/40 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50 transition-all duration-300 border border-gray-100/50 dark:border-gray-600/50 hover:border-blue-200/60 dark:hover:border-blue-700/60 hover:shadow-lg">
                              <div className={cn(
                                "w-12 h-12 bg-gradient-to-r rounded-xl flex items-center justify-center mr-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg backdrop-blur-sm",
                                feature.gradient
                              )}>
                                <IconComponent className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-900 dark:group-hover:text-blue-300 transition-colors duration-300">{feature.label}</span>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">{feature.desc}</p>
                              </div>
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
                  <div className="bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-blue-900/40 dark:to-purple-900/40 backdrop-blur-sm rounded-3xl p-6 border border-blue-100/50 dark:border-blue-800/50 shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="relative inline-block">
                          <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            {averageRating.toFixed(1)}
                          </div>
                          <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
                        </div>
                        <div className="flex items-center justify-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "w-5 h-5 transition-all duration-300",
                                i < Math.floor(averageRating) ? "text-yellow-400 fill-current" : "text-gray-300 dark:text-gray-600"
                              )}
                            />
                          ))}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 font-medium">Based on {reviewStats.totalReviews} reviews</p>
                      </div>
                      <div className="space-y-3">
                        {ratingDistribution.map((dist) => (
                          <div key={dist.rating} className="flex items-center space-x-3">
                            <span className="text-sm font-medium w-10 flex items-center text-gray-700 dark:text-gray-300">
                              {dist.rating}
                              <Star className="w-3 h-3 text-yellow-400 fill-current ml-0.5" />
                            </span>
                            <div className="flex-1 bg-gray-200/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-full h-2.5 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2.5 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${dist.percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-right">{dist.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Review Filters */}
                  <div className="flex flex-wrap items-center gap-3 bg-white/60 dark:bg-black/50 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/30 dark:border-gray-700/50">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      Filter by rating:
                    </span>
                    {['all', '5', '4', '3', '2', '1'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setReviewFilter(filter)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border backdrop-blur-sm",
                          reviewFilter === filter
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-600 shadow-lg transform scale-105"
                            : "bg-white/40 dark:bg-black/40 text-gray-700 dark:text-gray-300 hover:bg-blue-50/40 dark:hover:bg-gray-600/40 hover:text-blue-600 dark:hover:text-blue-400 border-gray-200/50 dark:border-gray-600/50 hover:border-blue-300/50 dark:hover:border-blue-500/50 shadow-sm"
                        )}
                      >
                        {filter === 'all' ? 'All' : `${filter} Stars`}
                      </button>
                    ))}
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {reviewsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        <span className="ml-2 text-gray-600">Loading reviews...</span>
                      </div>
                    ) : filteredReviews.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50/60 backdrop-blur-sm rounded-2xl border border-gray-100/50">
                        <div className="text-gray-500 mb-2">No reviews found</div>
                        <div className="text-sm text-gray-400">
                          {reviewFilter === 'all' 
                            ? 'Be the first to review this service!' 
                            : `No ${reviewFilter}-star reviews yet.`
                          }
                        </div>
                      </div>
                    ) : (
                      filteredReviews.map((review) => (
                      <div key={review.id} className="bg-white/60 dark:bg-black/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-3xl p-6 hover:shadow-xl transition-all duration-300 hover:border-blue-200/60 dark:hover:border-blue-700/60 group">
                        <div className="flex items-start space-x-4">
                          <div className="relative">
                            <img
                              src={review.clientAvatar}
                              alt={review.clientName}
                              className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100/50 dark:ring-gray-700/50 group-hover:ring-blue-200/60 dark:group-hover:ring-blue-700/60 transition-all duration-300"
                            />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white dark:border-black"></div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-900 dark:group-hover:text-blue-300 transition-colors duration-300">{review.clientName}</h4>
                                <div className="flex items-center space-x-2">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={cn(
                                          "w-4 h-4 transition-all duration-300",
                                          i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300 dark:text-gray-600"
                                        )}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">• {review.date}</span>
                                  {review.service && (
                                    <span className="bg-gradient-to-r from-blue-100/80 to-purple-100/80 dark:from-blue-900/50 dark:to-purple-900/50 backdrop-blur-sm text-blue-800 dark:text-blue-200 text-xs px-3 py-1 rounded-full border border-blue-200/50 dark:border-blue-700/50">
                                      {typeof review.service === 'string' ? review.service : review.service.title}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-300">{review.comment}</p>
                            <div className="flex items-center space-x-4 text-sm">
                              <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 group-hover:scale-105">
                                <ThumbsUp className="w-4 h-4 mr-1" />
                                Helpful ({review.helpful})
                              </button>
                              <button className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300">
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                    )}
                  </div>
                </div>
              )}

              {/* Chat Tab */}
              {activeTab === 'chat' && (
                <div className="space-y-4">
                  {/* Enhanced Chat Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/60 to-purple-50/60 dark:from-blue-900/40 dark:to-purple-900/40 backdrop-blur-sm -m-6 p-6 rounded-t-3xl">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={provider?.user?.imageUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(provider?.user ? `${provider.user.firstName || ''} ${provider.user.lastName || ''}`.trim() || provider.user.email || 'Provider' : 'Provider') + '&background=6366f1&color=fff&size=40'}
                          alt="Provider"
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-white/50 dark:ring-gray-600/50 shadow-lg"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {provider?.user ? 
                            `${provider.user.firstName || ''} ${provider.user.lastName || ''}`.trim() || provider.user.email :
                            service?.provider?.name || 'Provider'
                          }
                        </h3>
                        <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                          Online now
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 bg-white/40 dark:bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-gray-200/50 dark:border-gray-600/50">
                      Usually responds within 1 hour
                    </div>
                  </div>

                  {/* Enhanced Chat Messages */}
                  <div className="space-y-4 max-h-96 overflow-y-auto bg-gradient-to-b from-gray-50/40 to-transparent dark:from-black/20 dark:to-transparent backdrop-blur-sm rounded-2xl p-4 border border-gray-100/50 dark:border-gray-700/50">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex animate-in slide-in-from-bottom-2 duration-300",
                          message.sender === 'user' ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl backdrop-blur-sm",
                            message.sender === 'user'
                              ? "bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white border-blue-600/50"
                              : "bg-white/60 dark:bg-black/50 text-gray-900 dark:text-gray-100 border-gray-200/50 dark:border-gray-600/50 hover:border-gray-300/60 dark:hover:border-gray-500/60"
                          )}
                        >
                          <p className="text-sm leading-relaxed">{message.message}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className={cn(
                              "text-xs",
                              message.sender === 'user' ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                            )}>
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {message.sender === 'user' && (
                              <div className="flex space-x-1">
                                <div className="w-1 h-1 bg-blue-200 rounded-full"></div>
                                <div className="w-1 h-1 bg-blue-200 rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Enhanced Chat Input */}
                  <div className="flex space-x-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/40 to-blue-50/40 dark:from-black/20 dark:to-blue-950/40 backdrop-blur-sm -m-6 p-6 rounded-b-3xl">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full px-4 py-3 pr-12 border border-gray-300/50 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/60 dark:bg-black/50 backdrop-blur-sm dark:text-gray-100 dark:placeholder-gray-400 shadow-lg transition-all duration-300 hover:shadow-xl"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                        
                      </div>
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className={cn(
                        "px-6 py-3 rounded-2xl font-medium transition-all duration-300 flex items-center shadow-lg border backdrop-blur-sm",
                        newMessage.trim()
                          ? "bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white hover:from-blue-700/90 hover:to-purple-700/90 border-blue-600/50 hover:shadow-xl transform hover:scale-105"
                          : "bg-gray-100/60 dark:bg-gray-700/60 text-gray-400 dark:text-gray-500 cursor-not-allowed border-gray-200/50 dark:border-gray-600/50"
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

          {/* Enhanced Provider Section with Glass Morphism */}
          <div className="mt-8">
            <div className="bg-gradient-to-br from-white/90 to-gray-50/60 dark:from-black/80 dark:to-gray-900/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/50 max-w-6xl mx-auto">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full mr-4"></div>
                Service Provider
              </h3>
              
              {providerLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Loading provider details...</span>
                </div>
              ) : (
                <>
                  {console.log('🎨 Rendering provider in UI. Current provider state:', provider)}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Provider Info Card */}
                    <div className="bg-white/60 dark:bg-black/50 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/30 dark:border-gray-700/50">
                      <div className="flex items-center mb-6">
                        <div className="relative">
                          <img
                            src={provider?.logoUrl || provider?.user?.imageUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(provider?.user ? `${provider.user.firstName || ''} ${provider.user.lastName || ''}`.trim() || provider.user.email || 'User' : 'Provider') + '&background=6366f1&color=fff&size=120'}
                            alt="Provider"
                            className="w-20 h-20 rounded-3xl object-cover border-3 border-white/50 dark:border-gray-600/50 shadow-xl ring-4 ring-gray-100/50 dark:ring-gray-700/50"
                          />
                          {provider?.isVerified && (
                            <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                              <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="ml-6">
                          <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            {provider?.user ? 
                              `${provider.user.firstName || ''} ${provider.user.lastName || ''}`.trim() || provider.user.email || 'Provider' :
                              'Provider'
                            }
                          </h4>
                          {provider?.isVerified && (
                            <div className="flex items-center text-green-600 dark:text-green-400 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/30 dark:to-emerald-900/30 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-medium mb-3 border border-green-200/50 dark:border-green-700/50 shadow-sm">
                              <Shield className="w-5 h-5 mr-2" />
                              Verified Provider
                            </div>
                          )}
                          <div className="flex items-center bg-white/60 dark:bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
                            <Star className="w-5 h-5 text-yellow-400 fill-current mr-2" />
                            <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
                              {provider?.averageRating ? provider.averageRating.toFixed(1) : 'New'}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 ml-2">
                              ({provider?.totalReviews || 0} reviews)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Provider Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center bg-gradient-to-br from-blue-50/60 to-cyan-50/60 dark:from-blue-900/30 dark:to-cyan-900/30 backdrop-blur-sm rounded-2xl p-4 border border-blue-100/50 dark:border-blue-800/50 shadow-sm">
                          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            {provider?.services?.length || 0}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Services</div>
                        </div>
                        <div className="text-center bg-gradient-to-br from-purple-50/60 to-pink-50/60 dark:from-purple-900/30 dark:to-pink-900/30 backdrop-blur-sm rounded-2xl p-4 border border-purple-100/50 dark:border-purple-800/50 shadow-sm">
                          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {provider?.totalReviews || 0}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Reviews</div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information Card */}
                    <div className="bg-white/60 dark:bg-black/50 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/30 dark:border-gray-700/50">
                      <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                        <Phone className="w-6 h-6 mr-3 text-blue-500 dark:text-blue-400" />
                        Contact Information
                      </h4>
                      <div className="space-y-4">
                        {provider?.user?.email && (
                          <div className="flex items-center text-gray-600 dark:text-gray-400 bg-white/60 dark:bg-black/40 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-gray-100/50 dark:border-gray-700/50">
                            <div className="p-3 bg-blue-100/80 dark:bg-blue-900/60 backdrop-blur-sm rounded-xl mr-4">
                              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">Email</div>
                              <div className="font-medium text-gray-800 dark:text-gray-200">{provider.user.email}</div>
                            </div>
                          </div>
                        )}
                        {provider?.user?.phone && (
                          <div className="flex items-center text-gray-600 dark:text-gray-400 bg-white/60 dark:bg-black/40 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-gray-100/50 dark:border-gray-700/50">
                            <div className="p-3 bg-green-100/80 dark:bg-green-900/60 backdrop-blur-sm rounded-xl mr-4">
                              <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">Phone</div>
                              <div className="font-medium text-gray-800 dark:text-gray-200">{provider.user.phone}</div>
                            </div>
                          </div>
                        )}
                        {provider?.user?.location && (
                          <div className="flex items-center text-gray-600 dark:text-gray-400 bg-white/60 dark:bg-black/40 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-gray-100/50 dark:border-gray-700/50">
                            <div className="p-3 bg-red-100/80 dark:bg-red-900/60 backdrop-blur-sm rounded-xl mr-4">
                              <MapPin className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">Location</div>
                              <div className="font-medium text-gray-800 dark:text-gray-200">{provider.user.location}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Skills and About Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Skills */}
                    {provider?.skills && provider.skills.length > 0 && (
                      <div className="bg-white/60 dark:bg-black/50 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/30 dark:border-gray-700/50">
                        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                          <Award className="w-6 h-6 mr-3 text-orange-500 dark:text-orange-400" />
                          Skills & Expertise
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {provider.skills.map((skill: string, index: number) => (
                            <span 
                              key={index}
                              className="bg-gradient-to-r from-blue-100/80 to-cyan-100/80 dark:from-blue-900/60 dark:to-cyan-900/60 backdrop-blur-sm text-blue-800 dark:text-blue-200 text-sm px-4 py-2 rounded-full font-medium border border-blue-200/50 dark:border-blue-700/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="bg-white/60 dark:bg-black/50 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/30 dark:border-gray-700/50">
                      <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                        <Users className="w-6 h-6 mr-3 text-purple-500 dark:text-purple-400" />
                        Quick Actions
                      </h4>
                      <div className="space-y-4">
                        <button
                          onClick={handleBookNow}
                          disabled={bookingLoading}
                          className="w-full bg-gradient-to-r from-green-600/90 to-emerald-600/90 text-white py-4 px-6 rounded-2xl font-bold hover:from-green-700/90 hover:to-emerald-700/90 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl border border-green-600/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none backdrop-blur-sm"
                        >
                          {bookingLoading ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                              Creating conversation...
                            </div>
                          ) : (
                            <>
                              <Calendar className="w-5 h-5 mr-2 inline" />
                              Book Now
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={handleContactProvider}
                          className="w-full border-2 border-gray-300/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 py-4 px-6 rounded-2xl font-bold hover:bg-blue-50/50 dark:hover:bg-blue-900/30 hover:border-blue-400/50 dark:hover:border-blue-500/50 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl backdrop-blur-sm bg-white/30 dark:bg-black/30"
                        >
                          <MessageCircle className="w-5 h-5 mr-2" />
                          Contact Provider
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* About Section */}
                  {provider?.bio && (
                    <div className="bg-white/60 dark:bg-black/50 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/30 dark:border-gray-700/50 mb-8">
                      <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                        <User className="w-6 h-6 mr-3 text-purple-500 dark:text-purple-400" />
                        About the Provider
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-line">
                        {provider.bio}
                      </p>
                    </div>
                  )}

                  {/* Qualifications */}
                  {provider?.qualifications && provider.qualifications.length > 0 && (
                    <div className="bg-white/60 dark:bg-black/50 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/30 dark:border-gray-700/50">
                      <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                        <GraduationCap className="w-6 h-6 mr-3 text-indigo-500 dark:text-indigo-400" />
                        Qualifications & Certifications
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {provider.qualifications.map((qualification: string, index: number) => (
                          <div 
                            key={index}
                            className="flex items-center bg-gradient-to-r from-gray-50/60 to-blue-50/60 dark:from-black/30 dark:to-blue-950/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg transition-all duration-300 hover:scale-105"
                          >
                            <CheckCircle className="w-6 h-6 text-green-500 dark:text-green-400 mr-4 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300 font-medium">{qualification}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
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