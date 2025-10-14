import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, Heart, MapPin, Clock, MessageCircle, Phone, Mail, ArrowLeft, Calendar, 
  Shield, Award, ChevronLeft, ChevronRight, Send, Bookmark, Share2, Eye,
  CheckCircle, Users, ThumbsUp, User, GraduationCap, CreditCard, Github, Linkedin, Twitter, ArrowUpRight
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
import { PaymentModal } from '../components/Payment';
import toast, { Toaster } from 'react-hot-toast';
import { cn } from '../utils/utils';
import { confirmationApi } from '../api/confirmationApi';
import GlassmorphismProfileCard from '../components/ui/ProfileCard';

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
  // Location fields
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  serviceRadiusKm?: number;
  locationLastUpdated?: string;
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

type TabType = 'overview';

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
  const [showVideo, setShowVideo] = useState(true); // Track if we're showing video or images
  const [isVideoPlaying, setIsVideoPlaying] = useState(false); // Track if video is currently playing
  
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
  
  // Reviews carousel state
  const reviewsScrollRef = React.useRef<HTMLDivElement>(null);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  
  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Calculate total media items (video + images)
  const totalMediaItems = service ? (service.videoUrl ? 1 : 0) + service.images.length : 0;
  const currentMediaIndex = showVideo && service?.videoUrl ? 0 : selectedImage + (service?.videoUrl ? 1 : 0);

  // Auto-slide effect for images (but not video - let video play completely)
  useEffect(() => {
    if (autoSlide && service && totalMediaItems > 1) {
      // Don't auto-slide if video is currently playing
      if (showVideo && service.videoUrl && isVideoPlaying) {
        return;
      }
      
      const interval = setInterval(() => {
        // If currently showing video but it's not playing (ended), switch to first image
        if (showVideo && service.videoUrl && !isVideoPlaying) {
          setShowVideo(false);
          setSelectedImage(0);
        } else if (!showVideo) {
          // Navigate through images only (not video)
          const nextImageIndex = selectedImage + 1;
          if (nextImageIndex >= service.images.length && service.videoUrl) {
            // Loop back to video
            setShowVideo(true);
            setSelectedImage(0);
          } else if (nextImageIndex >= service.images.length) {
            // Loop back to first image
            setSelectedImage(0);
          } else {
            setSelectedImage(nextImageIndex);
          }
        }
      }, 4000); // Change images every 4 seconds
      
      return () => clearInterval(interval);
    }
  }, [autoSlide, service, showVideo, selectedImage, totalMediaItems, isVideoPlaying]);

  // Auto-scroll reviews carousel
  useEffect(() => {
    if (reviews.length > 1 && reviewsScrollRef.current) {
      const interval = setInterval(() => {
        setCurrentReviewIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % reviews.length;
          
          // Smooth scroll to next review
          if (reviewsScrollRef.current) {
            const cardWidth = reviewsScrollRef.current.scrollWidth / reviews.length;
            reviewsScrollRef.current.scrollTo({
              left: cardWidth * nextIndex,
              behavior: 'smooth'
            });
          }
          
          return nextIndex;
        });
      }, 5000); // Change review every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [reviews.length]);

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
      // Location fields
      latitude: apiService.latitude,
      longitude: apiService.longitude,
      address: apiService.address,
      city: apiService.city,
      state: apiService.state,
      country: apiService.country,
      postalCode: apiService.postalCode,
      serviceRadiusKm: apiService.serviceRadiusKm,
      locationLastUpdated: apiService.locationLastUpdated,
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

  // Payment handlers
  const handlePayNow = () => {
    if (!isLoggedIn || !user) {
      toast.error('Please log in to make a payment');
      navigate('/signin');
      return;
    }
    
    if (!service) {
      toast.error('Service information not available');
      return;
    }
    
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (paymentId: string) => {
    console.log('Payment completed:', paymentId);
    // The PaymentModal will handle showing the success popup and navigation to profile
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    // The PaymentModal will handle showing the error popup
  };

  const nextImage = () => {
    if (service && totalMediaItems > 1) {
      // If currently showing video, go to first image
      if (showVideo && service.videoUrl) {
        setShowVideo(false);
        setSelectedImage(0);
      } else {
        // Navigate to next image
        const nextIndex = selectedImage + 1;
        if (nextIndex >= service.images.length && service.videoUrl) {
          // Loop back to video
          setShowVideo(true);
          setSelectedImage(0);
        } else if (nextIndex >= service.images.length) {
          // Loop back to first image
          setSelectedImage(0);
        } else {
          setSelectedImage(nextIndex);
        }
      }
      setAutoSlide(false); // Stop auto-slide when user manually navigates
      setTimeout(() => setAutoSlide(true), 10000); // Resume auto-slide after 10 seconds
    }
  };

  const prevImage = () => {
    if (service && totalMediaItems > 1) {
      // If currently showing first image and video exists, go to video
      if (!showVideo && selectedImage === 0 && service.videoUrl) {
        setShowVideo(true);
      } else if (!showVideo && selectedImage > 0) {
        // Go to previous image
        setSelectedImage(selectedImage - 1);
      } else if (showVideo && service.videoUrl) {
        // If on video, go to last image
        setShowVideo(false);
        setSelectedImage(service.images.length - 1);
      }
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-black dark:via-gray-950 dark:to-black flex flex-col relative overflow-hidden">
        {/* Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808018_1px,transparent_1px),linear-gradient(to_bottom,#80808018_1px,transparent_1px)] bg-[size:32px_32px]"></div>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-white/10 via-white/5 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-black/10 via-black/5 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent rounded-full blur-3xl"></div>
        </div>
        
        <Navbar />
        
        <main className="flex-1 mt-16 relative z-10">
          <div className="container mx-auto px-4 py-8">
            {/* Skeleton Breadcrumb */}
            <div className="mb-8 bg-white/60 dark:bg-black/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-white/20 animate-pulse">
              <div className="h-4 bg-gradient-to-r from-black/20 via-gray-400/30 to-black/20 dark:from-white/20 dark:via-gray-500/30 dark:to-white/20 rounded w-1/3 animate-shimmer"></div>
            </div>

            {/* Main Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column Skeleton */}
              <div className="lg:col-span-2 space-y-6">
                {/* Media Gallery Skeleton */}
                <div className="bg-white/60 dark:bg-black/60 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-white/10">
                  <div className="aspect-[16/9] bg-gradient-to-br from-black/10 via-gray-300/20 to-black/10 dark:from-white/10 dark:via-gray-600/20 dark:to-white/10 animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                  </div>
                  <div className="p-4 flex gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-14 h-14 bg-gradient-to-br from-black/20 to-gray-400/30 dark:from-white/20 dark:to-gray-500/30 rounded-xl animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Service Info Skeleton */}
                <div className="py-8 px-6 space-y-4">
                  <div className="h-10 bg-gradient-to-r from-black/20 via-gray-400/30 to-black/20 dark:from-white/20 dark:via-gray-500/30 dark:to-white/20 rounded w-2/3 animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-8 bg-gradient-to-r from-black/15 to-gray-400/25 dark:from-white/15 dark:to-gray-500/25 rounded-full w-20 animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gradient-to-r from-black/15 via-gray-400/25 to-black/15 dark:from-white/15 dark:via-gray-500/25 dark:to-white/15 rounded w-full animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                    </div>
                    <div className="h-4 bg-gradient-to-r from-black/15 via-gray-400/25 to-black/15 dark:from-white/15 dark:via-gray-500/25 dark:to-white/15 rounded w-5/6 animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                    </div>
                    <div className="h-4 bg-gradient-to-r from-black/15 via-gray-400/25 to-black/15 dark:from-white/15 dark:via-gray-500/25 dark:to-white/15 rounded w-4/6 animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gradient-to-r from-black/20 to-gray-400/30 dark:from-white/20 dark:to-gray-500/30 rounded w-1/4 mt-4 animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                  </div>
                  
                  {/* Location Card Skeleton */}
                  <div className="bg-white/60 dark:bg-black/50 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-white/15 shadow-lg mt-6">
                    <div className="h-6 bg-gradient-to-r from-black/20 to-gray-400/30 dark:from-white/20 dark:to-gray-500/30 rounded w-1/3 mb-4 animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gradient-to-r from-black/15 to-gray-400/25 dark:from-white/15 dark:to-gray-500/25 rounded w-full animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                      </div>
                      <div className="h-4 bg-gradient-to-r from-black/15 to-gray-400/25 dark:from-white/15 dark:to-gray-500/25 rounded w-3/4 animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column Skeleton */}
              <div className="lg:col-span-1">
                <div className="bg-white/70 dark:bg-black/70 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-white/15 sticky top-24">
                  {/* Avatar Skeleton */}
                  <div className="flex flex-col items-center mb-8 pb-8 border-b border-white/20">
                    <div className="w-20 h-20 bg-gradient-to-br from-black/20 to-gray-400/30 dark:from-white/20 dark:to-gray-500/30 rounded-full mb-4 animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                    </div>
                    <div className="h-6 bg-gradient-to-r from-black/20 to-gray-400/30 dark:from-white/20 dark:to-gray-500/30 rounded w-32 mb-2 animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                    </div>
                    <div className="h-4 bg-gradient-to-r from-black/15 to-gray-400/25 dark:from-white/15 dark:to-gray-500/25 rounded w-24 animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                    </div>
                    
                    {/* Contact Info Skeleton */}
                    <div className="mt-4 w-full space-y-2">
                      <div className="h-10 bg-gradient-to-r from-black/15 to-gray-400/25 dark:from-white/15 dark:to-gray-500/25 rounded-xl animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                      </div>
                      <div className="h-10 bg-gradient-to-r from-black/15 to-gray-400/25 dark:from-white/15 dark:to-gray-500/25 rounded-xl animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 mt-4">
                      <div className="h-4 bg-gradient-to-r from-black/15 to-gray-400/25 dark:from-white/15 dark:to-gray-500/25 rounded w-16 animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                      </div>
                      <div className="h-4 bg-gradient-to-r from-black/15 to-gray-400/25 dark:from-white/15 dark:to-gray-500/25 rounded w-16 animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                  </div>

                  {/* Price Skeleton */}
                  <div className="text-center mb-6 space-y-3">
                    <div className="h-10 bg-gradient-to-r from-black/20 to-gray-400/30 dark:from-white/20 dark:to-gray-500/30 rounded w-32 mx-auto animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                    </div>
                    <div className="h-4 bg-gradient-to-r from-black/15 to-gray-400/25 dark:from-white/15 dark:to-gray-500/25 rounded w-24 mx-auto animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                    </div>
                    <div className="h-8 bg-gradient-to-r from-black/15 to-gray-400/25 dark:from-white/15 dark:to-gray-500/25 rounded-full w-32 mx-auto animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                    </div>
                  </div>

                  {/* Buttons Skeleton */}
                  <div className="space-y-3 mb-6">
                    <div className="h-14 bg-gradient-to-r from-black/30 to-gray-500/40 dark:from-white/30 dark:to-gray-400/40 rounded-full animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer"></div>
                    </div>
                    <div className="h-14 bg-gradient-to-r from-black/20 to-gray-400/30 dark:from-white/20 dark:to-gray-500/30 rounded-full animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                    </div>
                  </div>

                  {/* Working Hours Skeleton */}
                  <div className="pt-6 border-t border-white/20 space-y-3">
                    <div className="h-5 bg-gradient-to-r from-black/20 to-gray-400/30 dark:from-white/20 dark:to-gray-500/30 rounded w-32 animate-pulse relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                    </div>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 bg-gradient-to-r from-black/15 to-gray-400/25 dark:from-white/15 dark:to-gray-500/25 rounded-xl animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Skeleton */}
            <div className="mb-6 mt-6">
              <div className="flex items-center justify-between mb-8">
                <div className="h-8 bg-gradient-to-r from-black/20 to-gray-400/30 dark:from-white/20 dark:to-gray-500/30 rounded w-48 animate-pulse relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                </div>
                <div className="h-10 bg-gradient-to-r from-black/20 to-gray-400/30 dark:from-white/20 dark:to-gray-500/30 rounded-full w-32 animate-pulse relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                </div>
              </div>
              
              <div className="flex gap-6 overflow-hidden pb-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex-shrink-0 w-[90%] sm:w-[45%] lg:w-[32%]">
                    <div className="bg-white/70 dark:bg-black/50 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 dark:border-white/15 shadow-xl">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-black/20 to-gray-400/30 dark:from-white/20 dark:to-gray-500/30 rounded-full animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="h-5 bg-gradient-to-r from-black/20 to-gray-400/30 dark:from-white/20 dark:to-gray-500/30 rounded w-3/4 animate-pulse relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                          </div>
                          <div className="h-4 bg-gradient-to-r from-black/15 to-gray-400/25 dark:from-white/15 dark:to-gray-500/25 rounded w-1/2 animate-pulse relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map((j) => (
                          <div key={j} className="w-5 h-5 bg-gradient-to-br from-black/20 to-gray-400/30 dark:from-white/20 dark:to-gray-500/30 rounded animate-pulse relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gradient-to-r from-black/15 to-gray-400/25 dark:from-white/15 dark:to-gray-500/25 rounded w-full animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                        </div>
                        <div className="h-4 bg-gradient-to-r from-black/15 to-gray-400/25 dark:from-white/15 dark:to-gray-500/25 rounded w-5/6 animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                        </div>
                        <div className="h-4 bg-gradient-to-r from-black/15 to-gray-400/25 dark:from-white/15 dark:to-gray-500/25 rounded w-4/6 animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
        
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-black dark:via-gray-950 dark:to-black flex flex-col relative overflow-hidden">
      {/* Homepage-style Background with Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Enhanced grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808018_1px,transparent_1px),linear-gradient(to_bottom,#80808018_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        
        {/* Enhanced gradient orbs with glass effect */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-white/10 via-white/5 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-black/10 via-black/5 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-white/5 to-transparent dark:from-white/5 dark:to-transparent rounded-full blur-3xl"></div>
      </div>
      
      <Navbar />
      
      <main className="flex-1 mt-16 relative z-10">
        <div className="container mx-auto px-4 py-8">
          {/* Enhanced Glass Morphism Breadcrumb */}
          <div className="mb-8 bg-white/60 dark:bg-black/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-white/20">
            <Breadcrumb items={breadcrumbItems} />
          </div>

          {/* Main Content Layout - Grid System */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Images and Service Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Enhanced Compact Media Gallery (Video + Images) */}
              <div className="bg-white/60 dark:bg-black/60 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-white/10 group">
                <div className="aspect-[16/9] relative bg-gradient-to-br from-white via-gray-50 to-white dark:from-black dark:via-gray-950 dark:to-black">
                  {/* Show video if showVideo is true and videoUrl exists */}
                  {showVideo && service.videoUrl ? (
                    <>
                      <video
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                        onPlay={() => setIsVideoPlaying(true)}
                        onEnded={() => {
                          setIsVideoPlaying(false);
                          // Auto-advance to first image after video ends (if autoSlide is on)
                          if (autoSlide && service.images.length > 0) {
                            setTimeout(() => {
                              setShowVideo(false);
                              setSelectedImage(0);
                            }, 1000); // Wait 1 second before transitioning
                          }
                        }}
                        onPause={() => setIsVideoPlaying(false)}
                      >
                        <source src={service.videoUrl} type="video/mp4" />
                        <source src={service.videoUrl} type="video/webm" />
                      </video>
                      {/* Dark overlay for video */}
                      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-black/40"></div>
                      {/* Video indicator badge */}
                      <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/20">
                        <div className="flex items-center text-white text-sm font-medium">
                          <Eye className="w-4 h-4 mr-2" />
                          {isVideoPlaying ? 'Playing' : 'Video'}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <img
                        src={service.images[selectedImage]}
                        alt={service.title}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.03]"
                      />
                      {/* Enhanced Glass Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
                    </>
                  )}
                  
                  {/* Floating Action Buttons with Glass Morphism */}
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button
                      onClick={toggleWishlist}
                      className={cn(
                        "p-3 rounded-full backdrop-blur-md border transition-all duration-300 hover:scale-110 shadow-lg",
                        isWishlisted 
                          ? 'bg-black dark:bg-white text-white dark:text-black border-black/10 dark:border-white/20' 
                          : 'bg-white/70 dark:bg-black/30 text-black dark:text-white border-white/5 dark:border-white/5 hover:bg-white dark:hover:bg-black/50'
                      )}
                      title="Add to wishlist"
                    >
                      <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
                    </button>
                    <button 
                      className="p-3 rounded-full bg-white/70 dark:bg-black/30 backdrop-blur-md border border-white/5 dark:border-white/5 text-black dark:text-white hover:bg-white dark:hover:bg-black/50 transition-all duration-300 hover:scale-110 shadow-lg"
                      title="Share service"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-3 rounded-full bg-white/70 dark:bg-black/30 backdrop-blur-md border border-white/5 dark:border-white/5 text-black dark:text-white hover:bg-white dark:hover:bg-black/50 transition-all duration-300 hover:scale-110 shadow-lg"
                      title="Bookmark service"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Glass Morphism Slide Indicator */}
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center space-x-2 bg-white/70 dark:bg-black/30 backdrop-blur-md rounded-full px-4 py-2 border border-white/5 dark:border-white/5 shadow-lg">
                      <Eye className="w-4 h-4 text-black dark:text-white" />
                      <span className="text-black dark:text-white text-sm font-medium">
                        {currentMediaIndex + 1}/{totalMediaItems}
                      </span>
                      {autoSlide && (
                        <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-pulse" />
                      )}
                    </div>
                  </div>
                  
                  {/* Modern Glass Navigation Arrows */}
                  {totalMediaItems > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/70 dark:bg-black/30 backdrop-blur-md rounded-full text-black dark:text-white hover:bg-white dark:hover:bg-black/50 transition-all duration-300 hover:scale-110 shadow-lg border border-white/5 dark:border-white/20"
                        title="Previous media"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/70 dark:bg-black/30 backdrop-blur-md rounded-full text-black dark:text-white hover:bg-white dark:hover:bg-black/50 transition-all duration-300 hover:scale-110 shadow-lg border border-white/5 dark:border-white/20"
                        title="Next media"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {/* Modern Glass Progress Indicators */}
                  {totalMediaItems > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                      {/* Video indicator dot (if video exists) */}
                      {service.videoUrl && (
                        <button
                          onClick={() => {
                            setShowVideo(true);
                            setSelectedImage(0);
                            setIsVideoPlaying(false); // Reset video state
                            setAutoSlide(true); // Enable auto-slide
                          }}
                          className={cn(
                            "h-2 rounded-full transition-all duration-300 hover:scale-110",
                            showVideo 
                              ? 'w-8 bg-black dark:bg-white shadow-lg' 
                              : 'w-2 bg-white/70 dark:bg-black/70 hover:bg-white dark:hover:bg-black'
                          )}
                          title="Video"
                        />
                      )}
                      {/* Image indicator dots */}
                      {service.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setShowVideo(false);
                            setSelectedImage(index);
                            setAutoSlide(false);
                            setTimeout(() => setAutoSlide(true), 10000);
                          }}
                          className={cn(
                            "h-2 rounded-full transition-all duration-300 hover:scale-110",
                            !showVideo && selectedImage === index 
                              ? 'w-8 bg-black dark:bg-white shadow-lg' 
                              : 'w-2 bg-white/70 dark:bg-black/70 hover:bg-white dark:hover:bg-black'
                          )}
                          title={`Image ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Compact Glass Thumbnails (Video + Images) */}
                {totalMediaItems > 1 && (
                  <div className="flex space-x-2 p-4 overflow-x-auto scrollbar-hide bg-white/30 dark:bg-black/30 backdrop-blur-sm">
                    {/* Video thumbnail (if video exists) */}
                    {service.videoUrl && (
                      <button
                        onClick={() => {
                          setShowVideo(true);
                          setSelectedImage(0);
                          setIsVideoPlaying(false); // Reset video state
                          setAutoSlide(true); // Enable auto-slide
                        }}
                        className={cn(
                          "flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-110 relative",
                          showVideo
                            ? 'border-black dark:border-white ring-2 ring-black/20 dark:ring-white/20 shadow-lg transform scale-105' 
                            : 'border-white/5 dark:border-white/5 hover:border-black dark:hover:border-white shadow-sm'
                        )}
                        title="Video"
                      >
                        <video
                          src={service.videoUrl}
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                      </button>
                    )}
                    {/* Image thumbnails */}
                    {service.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setShowVideo(false);
                          setSelectedImage(index);
                          setAutoSlide(false);
                          setTimeout(() => setAutoSlide(true), 10000);
                        }}
                        className={cn(
                          "flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-110",
                          !showVideo && selectedImage === index 
                            ? 'border-black dark:border-white ring-2 ring-black/20 dark:ring-white/20 shadow-lg transform scale-105' 
                            : 'border-white/5 dark:border-white/5 hover:border-black dark:hover:border-white shadow-sm'
                        )}
                        title={`Image ${index + 1}`}
                      >
                        <img src={image} alt={`${service.title} ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Service Header - Minimal Glass Theme */}
              <div className="py-8 px-6">
                <div className="max-w-4xl">
                  {/* Title */}
                  <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
                    {service.title}
                  </h1>
                  
                  {/* Tags */}
                  {service.tags && service.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {service.tags.map((tag, index) => (
                        <span 
                          key={index} 
                          className="text-sm px-4 py-1.5 rounded-full text-gray-600 dark:text-gray-300 bg-white/50 dark:bg-black/30 backdrop-blur-sm border border-white/15 dark:border-white/5 hover:border-black/15 dark:hover:border-white/15 transition-all duration-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Description */}
                  {service.description && (
                    <p className="text-base text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                      {service.description}
                    </p>
                  )}

                  {/* Rating with White Stars */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, index) => (
                        <Star 
                          key={index}
                          className={cn(
                            "w-5 h-5",
                            index < Math.floor(averageRating)
                              ? "fill-white text-white dark:fill-white dark:text-white"
                              : "fill-none text-gray-300 dark:text-gray-600"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-black dark:text-white ml-1">
                      {averageRating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({reviewStats.totalReviews} reviews)
                    </span>
                  </div>

                  {/* Service Location Card */}
                  {(service.address || (service.latitude && service.longitude)) && (
                    <div className="bg-white/60 dark:bg-black/50 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-white/15 shadow-lg">
                      <h3 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-black dark:text-white" />
                        Service Location
                      </h3>
                      
                      <div className="space-y-3">
                        {/* Address */}
                        {service.address && (
                          <div className="flex items-start">
                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-black dark:bg-white mt-2 mr-3" />
                            <div>
                              <p className="text-base text-black dark:text-white font-medium">
                                {service.address}
                              </p>
                              {(service.city || service.state || service.country) && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {[service.city, service.state, service.country].filter(Boolean).join(', ')}
                                  {service.postalCode && ` ${service.postalCode}`}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Coordinates */}
                        {service.latitude && service.longitude && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 mr-3" />
                            <span>
                              {service.latitude.toFixed(6)}, {service.longitude.toFixed(6)}
                            </span>
                          </div>
                        )}

                        {/* Service Radius */}
                        {service.serviceRadiusKm && (
                          <div className="flex items-start mt-4 pt-4 border-t border-white/5 dark:border-white/10">
                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-black dark:bg-white mt-2 mr-3" />
                            <div>
                              <p className="text-sm text-black dark:text-white font-medium">
                                Service Area: {service.serviceRadiusKm} km radius
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Provider can travel up to {service.serviceRadiusKm} km from the service location
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Unified Booking & Provider Card */}
            <div className="lg:col-span-1 space-y-6">
              {/* Unified Glass Morphism Card */}
              <div className="relative">
                <div 
                  className="bg-white/70 dark:bg-black/70 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-white/15 sticky top-24"
                  style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)' }}
                >
                  {/* Provider Profile Section */}
                  {provider && (
                    <div className="mb-8 pb-8 border-b border-white/20 dark:border-white/20">
                      <div className="flex flex-col items-center">
                        {/* Avatar */}
                        <div className="w-20 h-20 mb-4 rounded-full p-1 border-2 border-white/10 dark:border-white/10 relative">
                          <img 
                            src={provider?.logoUrl || provider?.user?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(provider?.user ? `${provider.user.firstName || ''} ${provider.user.lastName || ''}`.trim() || provider.user.email || 'User' : 'Provider')}&background=000000&color=ffffff&size=96`}
                            alt="Provider"
                            className="w-full h-full rounded-full object-cover"
                            onError={(e) => { 
                              const target = e.target as HTMLImageElement;
                              target.onerror = null; 
                              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent('P')}&background=000000&color=ffffff&size=96`;
                            }}
                          />
                          {provider?.isVerified && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-black dark:bg-white rounded-full flex items-center justify-center border-2 border-white dark:border-black">
                              <svg className="w-3.5 h-3.5 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Name and Title */}
                        <h3 className="text-xl font-bold text-black dark:text-white text-center">
                          {provider?.user ? `${provider.user.firstName || ''} ${provider.user.lastName || ''}`.trim() || provider.user.email || 'Provider' : 'Provider'}
                        </h3>
                        <p className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                          {provider?.isVerified ? 'Verified Provider' : 'Service Provider'}
                        </p>

                        {/* Contact Information */}
                        {(provider?.user?.email || provider?.user?.phone) && (
                          <div className="mt-4 w-full space-y-2">
                            {provider?.user?.email && (
                              <div className="flex items-center justify-center gap-2 text-sm bg-white/50 dark:bg-black/30 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/20 dark:border-white/15">
                                <Mail className="w-4 h-4 text-black dark:text-white" />
                                <span className="text-gray-700 dark:text-gray-300 truncate">{provider.user.email}</span>
                              </div>
                            )}
                            {provider?.user?.phone && (
                              <div className="flex items-center justify-center gap-2 text-sm bg-white/50 dark:bg-black/30 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/20 dark:border-white/15">
                                <Phone className="w-4 h-4 text-black dark:text-white" />
                                <span className="text-gray-700 dark:text-gray-300">{provider.user.phone}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Stats */}
                        {((provider?.averageRating !== undefined && provider?.averageRating !== null) || (provider?.services?.length !== undefined && provider?.services?.length !== null)) && (
                          <div className="flex items-center gap-4 mt-4">
                            {provider?.averageRating !== undefined && provider?.averageRating !== null && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm font-semibold text-black dark:text-white">{provider.averageRating.toFixed(1)}</span>
                                {provider?.totalReviews !== undefined && provider?.totalReviews !== null && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">({provider.totalReviews})</span>
                                )}
                              </div>
                            )}
                            
                            {provider?.services?.length !== undefined && provider?.services?.length !== null && (
                              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                                <span className="font-semibold text-black dark:text-white">{provider.services.length}</span>
                                <span className="text-xs">Service{provider.services.length !== 1 ? 's' : ''}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* View Profile Button */}
                        <button
                          onClick={() => navigate(`/provider/${provider.id}`)}
                          className="mt-4 text-sm text-black dark:text-white hover:underline flex items-center gap-1"
                        >
                          View Full Profile
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Price Section */}
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-black dark:text-white mb-2">
                      {service.currency} {service.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">Starting price</div>
                    <div className="flex items-center justify-center text-black dark:text-white bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-full px-4 py-2 border border-white/20 dark:border-white/15 shadow-lg">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">Available now</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 mb-6">
                    <button
                      onClick={handlePayNow}
                      className="w-full bg-black dark:bg-white text-white dark:text-black py-4 px-6 rounded-full font-bold hover:scale-105 transition-all duration-300 shadow-xl border border-black/20 dark:border-white/20 backdrop-blur-sm flex items-center justify-center"
                      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}
                    >
                      <CreditCard className="w-5 h-5 mr-2" />
                      Pay Now
                    </button>
                    
                    <button
                      onClick={handleBookNow}
                      disabled={bookingLoading}
                      className="w-full bg-white/80 dark:bg-black/50 text-black dark:text-white py-4 px-6 rounded-full font-bold hover:bg-white dark:hover:bg-black/70 transition-all duration-300 shadow-xl border border-white/20 dark:border-white/15 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-xl"
                    >
                      {bookingLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                          <span>Creating conversation</span>
                        </div>
                      ) : (
                        'Book Now'
                      )}
                    </button>
                  </div>

                  {/* Working Hours Section */}
                  {service.workingTime && service.workingTime.length > 0 && (
                    <div className="pt-6 border-t border-white/20 dark:border-white/20">
                      <h4 className="text-sm font-semibold text-black dark:text-white mb-3 flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Working Hours
                      </h4>
                      <div className="space-y-2">
                        {service.workingTime.map((time, index) => (
                          <div 
                            key={index}
                            className="flex items-center bg-white/60 dark:bg-black/30 backdrop-blur-xl rounded-xl p-3 border border-white/20 dark:border-white/15 shadow-sm"
                          >
                            <Calendar className="w-3.5 h-3.5 text-black/60 dark:text-white/60 mr-2" />
                            <span className="text-sm text-black dark:text-white font-medium">{time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Enhanced Glassmorphism glow effect */}
                <div className="absolute inset-0 rounded-3xl -z-10 transition-all duration-500 ease-out blur-3xl opacity-30 bg-gradient-to-br from-black/40 via-black/20 to-black/40 dark:from-white/30 dark:via-white/15 dark:to-white/30" />
              </div>
            </div>
          </div>

          {/* Reviews Carousel Section */}
          {reviews.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-black dark:text-white">
                  Customer Reviews
                </h2>
                <div className="flex items-center gap-2 bg-white/70 dark:bg-black/50 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20 dark:border-white/15 shadow-lg">
                  <Star className="w-5 h-5 fill-white text-white" />
                  <span className="text-lg font-semibold text-black dark:text-white">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ({reviewStats.totalReviews})
                  </span>
                </div>
              </div>

              {/* Enhanced Reviews Slider */}
              <div className="relative">
                <div 
                  ref={reviewsScrollRef}
                  className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 scroll-smooth"
                  onScroll={(e) => {
                    const scrollLeft = e.currentTarget.scrollLeft;
                    const cardWidth = e.currentTarget.scrollWidth / reviews.length;
                    const newIndex = Math.round(scrollLeft / cardWidth);
                    setCurrentReviewIndex(newIndex);
                  }}
                >
                  {reviews.map((review, index) => (
                    <div 
                      key={review.id}
                      className="flex-shrink-0 w-[90%] sm:w-[45%] lg:w-[32%] snap-start"
                    >
                      <div className={cn(
                        "bg-white/70 dark:bg-black/50 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 dark:border-white/15 h-full transition-all duration-500",
                        index === currentReviewIndex 
                          ? "shadow-2xl scale-105 border-white/30 dark:border-white/20" 
                          : "shadow-xl hover:shadow-2xl"
                      )}>
                        {/* Review Header */}
                        <div className="flex items-start gap-4 mb-6">
                          <div className="relative flex-shrink-0">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 dark:border-white/10 shadow-lg">
                              {review.clientAvatar ? (
                                <img 
                                  src={review.clientAvatar} 
                                  alt={review.clientName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-black/10 to-black/5 dark:from-white/10 dark:to-white/5 flex items-center justify-center">
                                  <span className="text-2xl text-black dark:text-white font-bold">
                                    {review.clientName?.[0]?.toUpperCase() || 'U'}
                                  </span>
                                </div>
                              )}
                            </div>
                            {/* Verified badge */}
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-black dark:bg-white rounded-full flex items-center justify-center border-2 border-white dark:border-black shadow-lg">
                              <svg className="w-3.5 h-3.5 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-black dark:text-white mb-1">
                              {review.clientName || 'Anonymous'}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Rating Stars - White */}
                        <div className="flex items-center gap-1 mb-4">
                          {[...Array(5)].map((_, starIndex) => (
                            <Star
                              key={starIndex}
                              className={cn(
                                "w-5 h-5 transition-all",
                                starIndex < review.rating
                                  ? "fill-white text-white drop-shadow-lg"
                                  : "fill-none text-gray-300 dark:text-gray-600"
                              )}
                            />
                          ))}
                          <span className="ml-2 text-sm font-semibold text-black dark:text-white">
                            {review.rating}.0
                          </span>
                        </div>

                        {/* Review Comment */}
                        {review.comment && (
                          <div className="relative">
                            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-5 italic">
                              "{review.comment}"
                            </p>
                          </div>
                        )}

                        {/* Helpful indicator */}
                        {review.helpful > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/5 dark:border-white/10">
                            <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                              <ThumbsUp className="w-4 h-4" />
                              {review.helpful} found this helpful
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation Dots */}
                {reviews.length > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    {reviews.map((_, index) => (
                      <button
                        key={index}
                        aria-label={`Go to review ${index + 1}`}
                        onClick={() => {
                          setCurrentReviewIndex(index);
                          if (reviewsScrollRef.current) {
                            const cardWidth = reviewsScrollRef.current.scrollWidth / reviews.length;
                            reviewsScrollRef.current.scrollTo({
                              left: cardWidth * index,
                              behavior: 'smooth'
                            });
                          }
                        }}
                        className={cn(
                          "transition-all duration-300 rounded-full",
                          index === currentReviewIndex
                            ? "w-8 h-2 bg-black dark:bg-white"
                            : "w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No Reviews Message */}
          {reviews.length === 0 && !reviewsLoading && (
            <div className="mb-6 text-center py-12 bg-white/70 dark:bg-black/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/15 shadow-lg">
              <Star className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No reviews yet. Be the first to review this service!
              </p>
            </div>
          )}

          {/* Disabled tabs - keeping for reference */}
          {false && (
          <div className="bg-white/80 dark:bg-black/60 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden mb-6 border border-white/5 dark:border-gray-700/50">
            <div className="border-b border-gray-100/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/60 to-blue-50/40 dark:from-black/40 dark:to-blue-950/40 backdrop-blur-sm">
              <nav className="flex space-x-1 px-6">
                {[
                  { id: 'overview', label: 'Overview', icon: Shield, color: 'blue' }
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
                  <div className="bg-white/60 dark:bg-black/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/15 dark:border-gray-700/50">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                      <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-3"></div>
                      About this service
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                      {service.description || 'No description available for this service.'}
                    </p>
                  </div>

                  {/* Service Location */}
                  {(service.address || (service.latitude && service.longitude)) && (
                    <div className="bg-white/60 dark:bg-black/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/15 dark:border-gray-700/50">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                        <div className="p-2 bg-gradient-to-r from-red-100/80 to-pink-100/80 dark:from-red-900/40 dark:to-pink-900/40 backdrop-blur-sm rounded-lg mr-3">
                          <MapPin className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        Service Location
                      </h3>
                      <div className="bg-gradient-to-r from-gray-50/60 to-blue-50/40 dark:from-black/30 dark:to-blue-950/40 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/50 dark:border-gray-600/50">
                        <div className="space-y-3">
                          {service.address && (
                            <div className="flex items-start bg-white/60 dark:bg-black/40 backdrop-blur-sm rounded-xl p-4 shadow-md border border-gray-100/50 dark:border-gray-600/50">
                              <div className="p-2 bg-gradient-to-r from-blue-100/80 to-purple-100/80 dark:from-blue-900/40 dark:to-purple-900/40 backdrop-blur-sm rounded-lg mr-3 flex-shrink-0">
                                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                  {service.address}
                                </span>
                                {(service.city || service.state || service.country) && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {[service.city, service.state, service.country].filter(Boolean).join(', ')}
                                    {service.postalCode && ` ${service.postalCode}`}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {service.serviceRadiusKm && (
                            <div className="flex items-center bg-white/60 dark:bg-black/40 backdrop-blur-sm rounded-xl p-4 shadow-md border border-gray-100/50 dark:border-gray-600/50">
                              <div className="p-2 bg-gradient-to-r from-green-100/80 to-emerald-100/80 dark:from-green-900/40 dark:to-emerald-900/40 backdrop-blur-sm rounded-lg mr-3">
                                <div className="w-4 h-4 border-2 border-green-600 dark:border-green-400 rounded-full flex items-center justify-center">
                                  <div className="w-1 h-1 bg-green-600 dark:bg-green-400 rounded-full"></div>
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                  Service Area: {service.serviceRadiusKm} km radius
                                </span>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  Provider can travel up to {service.serviceRadiusKm} km from the service location
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {service.latitude && service.longitude && (
                            <div className="flex items-center bg-white/60 dark:bg-black/40 backdrop-blur-sm rounded-xl p-4 shadow-md border border-gray-100/50 dark:border-gray-600/50">
                              <div className="p-2 bg-gradient-to-r from-purple-100/80 to-pink-100/80 dark:from-purple-900/40 dark:to-pink-900/40 backdrop-blur-sm rounded-lg mr-3">
                                <div className="w-4 h-4 text-purple-600 dark:text-purple-400 font-mono text-xs flex items-center justify-center">
                                  📍
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                  Coordinates
                                </span>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {service.latitude.toFixed(6)}, {service.longitude.toFixed(6)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Working Hours */}
                  {service.workingTime && service.workingTime.length > 0 && (
                    <div className="bg-white/60 dark:bg-black/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/15 dark:border-gray-700/50">
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
                  <div className="bg-white/60 dark:bg-black/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/15 dark:border-gray-700/50">
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

              {/* Reviews Tab - REMOVED (see line 67 for TabType update) */}
              {false && activeTab === 'reviews' && (
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
                  <div className="flex flex-wrap items-center gap-3 bg-white/60 dark:bg-black/50 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/15 dark:border-gray-700/50">
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
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="bg-white/60 dark:bg-black/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-3xl p-6">
                            <div className="flex items-start space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-black/20 to-gray-400/30 dark:from-white/20 dark:to-gray-500/30 rounded-full animate-pulse relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                              </div>
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="h-5 bg-gradient-to-r from-black/20 to-gray-400/30 dark:from-white/20 dark:to-gray-500/30 rounded w-32 animate-pulse relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                                  </div>
                                  <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((j) => (
                                      <div key={j} className="w-4 h-4 bg-gradient-to-br from-black/20 to-gray-400/30 dark:from-white/20 dark:to-gray-500/30 rounded animate-pulse relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="h-4 bg-gradient-to-r from-black/15 to-gray-400/25 dark:from-white/15 dark:to-gray-500/25 rounded w-24 animate-pulse relative overflow-hidden">
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                                </div>
                                <div className="space-y-2 mt-3">
                                  <div className="h-4 bg-gradient-to-r from-black/15 to-gray-400/25 dark:from-white/15 dark:to-gray-500/25 rounded w-full animate-pulse relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                                  </div>
                                  <div className="h-4 bg-gradient-to-r from-black/15 to-gray-400/25 dark:from-white/15 dark:to-gray-500/25 rounded w-5/6 animate-pulse relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                                  </div>
                                  <div className="h-4 bg-gradient-to-r from-black/15 to-gray-400/25 dark:from-white/15 dark:to-gray-500/25 rounded w-4/6 animate-pulse relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
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

              {/* Chat Tab - REMOVED (see line 67 for TabType update) */}
              {false && activeTab === 'chat' && (
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
          )}
          {/* End of disabled tabs */}

        </div>
      </main>

      <Footer />
      <Toaster position="bottom-right" />
      
      {/* Payment Modal */}
      {service && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          serviceId={service.id}
          serviceName={service.title}
          servicePrice={typeof service.price === 'string' ? parseFloat(service.price) : service.price}
          serviceCurrency={service.currency}
          serviceImage={service.images?.[0]}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      )}
    </div>
  );
};

export default ServiceDetailPage;
