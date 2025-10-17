import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star, Heart, MapPin, Clock, MessageCircle, Phone, Mail, ArrowLeft, Calendar,
  Shield, Award, ChevronLeft, ChevronRight, Send, Bookmark, Eye,
  CheckCircle, Users, ThumbsUp, User, GraduationCap, CreditCard, Github, Linkedin, Twitter, ArrowUpRight, QrCode, Download, Share2
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
import Button from '@/components/Button';
import QRCode from 'react-qr-code';
import * as QRCodeLib from 'qrcode';

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

  console.log('ServiceDetailPage - serviceId from URL:', serviceId);
  const [service, setService] = useState<DetailedService | null>(null);
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [providerLoading, setProviderLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [autoSlide, setAutoSlide] = useState(true);
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
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // QR code state
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Schedule state
  const [currentSchedules, setCurrentSchedules] = useState<{ startTime: string; endTime: string }[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // Calculate total media items (video + images)
  const totalMediaItems = service ? (service.videoUrl ? 1 : 0) + service.images.length : 0;

  // Auto-slide effect for images only (video is now separate)
  useEffect(() => {
    if (autoSlide && service?.images.length > 1) {
      const interval = setInterval(() => {
        setSelectedImage((prevIndex) => (prevIndex + 1) % service.images.length);
      }, 4000); // Change images every 4 seconds

      return () => clearInterval(interval);
    }
  }, [autoSlide, service?.images.length]);

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

  // Generate QR code URL for sharing
  useEffect(() => {
    if (service) {
      const currentUrl = window.location.href;
      setQrCodeUrl(currentUrl);
    }
  }, [service]);

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
      console.log('User details (via relation):');
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

  // Fetch current schedules
  const fetchCurrentSchedules = async (serviceId: string) => {
    try {
      setScheduleLoading(true);
      console.log('Fetching schedules for service:', serviceId);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/schedule/current/${serviceId}`);
      console.log('Schedule API response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Schedule API response data:', data);
        if (data.success) {
          setCurrentSchedules(data.data);
        }
      } else {
        console.error('Schedule API error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching current schedules:', error);
    } finally {
      setScheduleLoading(false);
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

          // Fetch current schedules
          console.log('About to fetch schedules for service:', response.data.id);
          await fetchCurrentSchedules(response.data.id);
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
      setShowLoginPrompt(true);
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
      setShowLoginPrompt(true);
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
    if (service?.images.length > 1) {
      const nextIndex = selectedImage + 1;
      setSelectedImage(nextIndex >= service.images.length ? 0 : nextIndex);
      setAutoSlide(false);
      setTimeout(() => setAutoSlide(true), 10000);
    }
  };

  const prevImage = () => {
    if (service?.images.length > 1) {
      const prevIndex = selectedImage - 1;
      setSelectedImage(prevIndex < 0 ? service.images.length - 1 : prevIndex);
      setAutoSlide(false);
      setTimeout(() => setAutoSlide(true), 10000);
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

  // Share service handler
  const handleShareService = async () => {
    if (!service) return;

    const shareData = {
      title: service.title,
      text: `Check out this service: ${service.title}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        // You could show a toast notification here
        alert('Service link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Service link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError);
      }
    }
  };

  // Download QR code handler
  const handleDownloadQR = async () => {
    if (!qrCodeUrl) return;

    try {
      // Use the qrcode library to generate and download
      // Create a temporary div to render the QR code
      const tempDiv = document.createElement('div');
      tempDiv.style.display = 'none';
      document.body.appendChild(tempDiv);

      // Generate QR code using the imported library
      QRCodeLib.toCanvas(qrCodeUrl, {
        width: 256,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      }, (error: any, canvas: HTMLCanvasElement) => {
        if (error) {
          console.error('QR Code generation error:', error);
          document.body.removeChild(tempDiv);
          alert('Unable to generate QR code. Please try again.');
          return;
        }

        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${service?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'service'}-qr-code.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
          // Clean up
          document.body.removeChild(tempDiv);
        }, 'image/png');
      });
    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('Unable to download QR code. Please try again.');
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
                      <div className="h-4 bg-gradient-to-r from-black/15 to-gray-400/25 dark:from-white/15 dark:to-gray-500/25 rounded w-4/6 animate-pulse relative overflow-hidden">
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

  if (showLoginPrompt) {
    return (
      <div className="min-h-screen bg-black to-purple-50 dark:bg-black  flex flex-col">
        <div className="flex-1 flex items-center justify-center mt-16">
          <div className="text-center">
        <p className="text-black dark:text-white mb-4">Please log in to access your profile.</p>
        <Button
          onClick={() => {
        localStorage.setItem('RedirectAfterLogin', window.location.pathname);
        navigate('/signin');
        setShowLoginPrompt(false);
          }}
          className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-full"
        >
          Log In
        </Button>
          </div>
        </div>
      </div>
    );
  }

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

          {/* Full-width Video Section - Outside Grid Container */}
          {service.videoUrl && (
            <div className="-mx-4 mb-8 bg-white/60 dark:bg-black/60 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-white/10 group">
              <div className="relative bg-gradient-to-br from-white via-gray-50 to-white dark:from-black dark:via-gray-950 dark:to-black">
                <video
                  autoPlay
                  muted
                  playsInline
                  loop
                  className="w-full max-h-[60vh] object-cover"
                  onPlay={() => setIsVideoPlaying(true)}
                  onEnded={() => setIsVideoPlaying(false)}
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
                    {isVideoPlaying ? 'Playing' : 'Demo Video'}
                  </div>
                </div>

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
                    title="Bookmark service"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Layout - Grid System */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Images and Service Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Enhanced Compact Image Carousel */}
              {service.images.length > 0 && (
                <div className="bg-white/60 dark:bg-black/60 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-white/10 group">
                  <div className="aspect-[16/9] relative bg-gradient-to-br from-white via-gray-50 to-white dark:from-black dark:via-gray-950 dark:to-black">
                    <img
                      src={service.images[selectedImage]}
                      alt={service.title}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.03]"
                    />
                    {/* Enhanced Glass Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
                  </div>

                  {/* Glass Morphism Slide Indicator */}
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center space-x-2 bg-white/70 dark:bg-black/30 backdrop-blur-md rounded-full px-4 py-2 border border-white/5 dark:border-white/5 shadow-lg">
                      <Eye className="w-4 h-4 text-black dark:text-white" />
                      <span className="text-black dark:text-white text-sm font-medium">
                        {selectedImage + 1}/{service.images.length}
                      </span>
                      {autoSlide && (
                        <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Modern Glass Navigation Arrows */}
                  {service.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/70 dark:bg-black/30 backdrop-blur-md rounded-full text-black dark:text-white hover:bg-white dark:hover:bg-black/50 transition-all duration-300 hover:scale-110 shadow-lg border border-white/5 dark:border-white/20"
                        title="Previous image"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/70 dark:bg-black/30 backdrop-blur-md rounded-full text-black dark:text-white hover:bg-white dark:hover:bg-black/50 transition-all duration-300 hover:scale-110 shadow-lg border border-white/5 dark:border-white/20"
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
                              ? 'w-8 bg-black dark:bg-white shadow-lg'
                              : 'w-2 bg-white/70 dark:bg-black/70 hover:bg-white dark:hover:bg-black'
                          )}
                          title={`Image ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Compact Glass Thumbnails for Images */}
                  {service.images.length > 1 && (
                    <div className="flex space-x-2 p-4 overflow-x-auto scrollbar-hide bg-white/30 dark:bg-black/30 backdrop-blur-sm">
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
              )}

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

                  {/* Current Schedule Section */}
                  {currentSchedules.length > 0 && (
                    <div className="mt-6 bg-white/60 dark:bg-black/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/20 dark:border-white/15 shadow-lg">
                      <h3 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        Confirmed Schedule
                      </h3>
                      {scheduleLoading ? (
                        <div className="flex justify-center py-4">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Desktop Table View */}
                          <div className="hidden md:block bg-white/50 dark:bg-black/30 backdrop-blur-md rounded-xl border border-white/20 dark:border-white/15 overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-white/70 dark:bg-black/50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-black dark:text-white font-semibold">Start Time</th>
                                  <th className="px-4 py-3 text-left text-black dark:text-white font-semibold">End Time</th>
                                  <th className="px-4 py-3 text-left text-black dark:text-white font-semibold">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {currentSchedules.map((schedule, index) => (
                                  <tr key={index} className="border-t border-white/20 dark:border-white/15">
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                      {new Date(schedule.startTime).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                      {new Date(schedule.endTime).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Confirmed
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Mobile Card View */}
                          <div className="md:hidden space-y-3">
                            {currentSchedules.map((schedule, index) => (
                              <div key={index} className="bg-white/50 dark:bg-black/30 backdrop-blur-md rounded-xl border border-white/20 dark:border-white/15 p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Confirmed
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Start:</span>
                                    <span className="text-sm text-gray-700 dark:text-gray-300 text-right">
                                      {new Date(schedule.startTime).toLocaleDateString()} <br />
                                      <span className="text-xs">{new Date(schedule.startTime).toLocaleTimeString()}</span>
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">End:</span>
                                    <span className="text-sm text-gray-700 dark:text-gray-300 text-right">
                                      {new Date(schedule.endTime).toLocaleDateString()} <br />
                                      <span className="text-xs">{new Date(schedule.endTime).toLocaleTimeString()}</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Unified Booking & Provider Card */}
            <div className="lg:col-span-1 space-y-6 pb-10">
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
                        {(() => {
                          console.log('Provider phone:', provider?.user?.phone);
                          return (provider?.user?.email || provider?.user?.phone) && (
                            <div className="mt-4 w-full space-y-2">
                              {provider?.user?.email && (
                                <div className="flex flex-col items-center justify-center gap-1 text-sm bg-white/50 dark:bg-black/30 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/20 dark:border-white/15">
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-black dark:text-white" />
                                    <span className="text-gray-700 dark:text-gray-300 truncate">{provider.user.email}</span>
                                  </div>
                                  {provider?.user?.phone && (
                                    <div className="flex items-center gap-2">
                                      <Phone className="w-4 h-4 text-black dark:text-white" />
                                      <span className="text-gray-700 dark:text-gray-300">{provider.user.phone}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })()}

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
                          onClick={() => {
                            if (!isLoggedIn || !user) {
                              setShowLoginPrompt(true);
                              return;
                            }
                            navigate(`/provider/${provider.id}`);
                          }}
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
                        'Message Provider'
                      )}
                    </button>
                  </div>

                  {/* QR Code Section */}
                  <div className="pt-6 border-t border-white/20 dark:border-white/20">
                    <h4 className="text-sm font-semibold text-black dark:text-white mb-4 flex items-center">
                      <QrCode className="w-4 h-4 mr-2" />
                      QR Code
                    </h4>
                    <div className="flex flex-col items-center space-y-3">
                      {/* QR Code */}
                      <div className="bg-white/60 dark:bg-black/30 backdrop-blur-xl p-4 rounded-xl border border-white/20 dark:border-white/15 shadow-sm">
                        <div className="w-24 h-24 flex items-center justify-center">
                          {qrCodeUrl ? (
                            <QRCode
                              value={qrCodeUrl}
                              size={96}
                              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                              viewBox={`0 0 256 256`}
                              fgColor="currentColor"
                              bgColor="transparent"
                            />
                          ) : (
                            <div className="w-full h-full bg-black/20 dark:bg-white/20 rounded animate-pulse"></div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleDownloadQR}
                          className="flex items-center space-x-1 bg-white/60 dark:bg-black/30 backdrop-blur-xl hover:bg-white/80 dark:hover:bg-black/50 text-black dark:text-white border border-white/20 dark:border-white/15 rounded-lg px-3 py-2 shadow-sm transition-all duration-200 text-xs"
                          title="Download QR Code"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </button>
                        <button
                          onClick={handleShareService}
                          className="flex items-center space-x-1 bg-white/60 dark:bg-black/30 backdrop-blur-xl hover:bg-white/80 dark:hover:bg-black/50 text-black dark:text-white border border-white/20 dark:border-white/15 rounded-lg px-3 py-2 shadow-sm transition-all duration-200 text-xs"
                          title="Share Service"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Working Hours Section */}
                  {service.workingTime && service.workingTime.length > 0 && (
                    <div >
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

          {/* Disabled tabs removed */}

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
