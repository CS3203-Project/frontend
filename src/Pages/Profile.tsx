import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Edit2, 
  Star, 
  Award,
  Briefcase,
  ExternalLink,
  UserPlus,
  Trash2,
  AlertTriangle,
  Clock,
  Building,
  Plus,
  X,
  Save,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart,
  Cell,
  LabelList
} from 'recharts';
import Button from '../components/Button';
import MinimalFooter from '../components/MinimalFooter';
import { userApi } from '../api/userApi';
import { serviceApi, type ServiceResponse } from '../api/serviceApi';
import { paymentApi, type Payment, type ProviderEarnings } from '../api/paymentApi';
import type { UserProfile, ProviderProfile, Company } from '../api/userApi';
import EditProviderModal from '../components/Profile/EditProviderModal';
import EditProfileModal from '../components/Profile/EditProfileModal';
import CompanyModal from '../components/Profile/CompanyModal';
import LocationPickerAdvanced from '../components/LocationPickerAdvanced';
import { uploadMultipleImages } from '../utils/imageUpload';
import ReviewCard from '../components/ReviewCard';
import { serviceReviewApi } from '../api/serviceReviewApi';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import Orb from '../components/Orb';

export default function Profile() {
  const navigate = useNavigate();
  const { user: authUser, isLoading: authLoading, updateUser } = useAuth();
  const [localUser] = useState<UserProfile | null>(null);
  const [showEditProviderModal, setShowEditProviderModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showDeleteCompanyConfirmation, setShowDeleteCompanyConfirmation] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);
  const [services, setServices] = useState<ServiceResponse[]>([]);
  
  // Payment related state
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [earnings, setEarnings] = useState<ProviderEarnings | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentPage, setPaymentPage] = useState(1);
  const [totalPaymentPages, setTotalPaymentPages] = useState(1);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);

  // Reviews related state
  const [customerReviews, setCustomerReviews] = useState<any[]>([]);
  const [serviceReviews, setServiceReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [selectedReviewType, setSelectedReviewType] = useState<'customer' | 'service'>('customer');
  
  // Use AuthContext user data and sync with local state for provider-specific data
  const user = authUser || localUser;
  const loading = authLoading;

  const [servicesLoading, setServicesLoading] = useState(false);
  const [showUpdateServiceModal, setShowUpdateServiceModal] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedService, setSelectedService] = useState<{
    id: string;
    title?: string;
    description?: string;
    price: number;
    currency: string;
    tags?: string[];
    images?: string[];
    isActive: boolean;
    workingTime?: string[];
  } | null>(null);
  const [serviceFormData, setServiceFormData] = useState({
    title: '',
    description: '',
    price: 0,
    currency: 'LKR',
    tags: [] as string[],
    images: [] as string[],
    isActive: true,
    workingTime: [] as string[],
    // Location fields
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    serviceRadiusKm: 10
  });


  const fetchProviderServices = useCallback(async (providerId: string) => {
    try {
      console.log('Fetching services for provider ID:', providerId);
      setServicesLoading(true);
      const response = await serviceApi.getServices({ providerId });
      console.log('Services API response:', response);
      if (response.success) {
        console.log('Services data:', response.data);
        setServices(response.data);
      } else {
        console.log('Services API returned unsuccessful response:', response);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
      toast.error('Failed to load services');
    } finally {
      setServicesLoading(false);
    }
  }, []);

  // Optimized fetch provider data (only when user changes and is a provider)
  const fetchProviderData = useCallback(async () => {
    if (!user || user.role !== 'PROVIDER') return;
    
    try {
      const providerData = await userApi.getProviderProfile();
      console.log('Provider profile data:', providerData);
      setProviderProfile(providerData);
      
      // Fetch services for this provider
      if (providerData.id) {
        console.log('Fetching services for provider ID:', providerData.id);
        await fetchProviderServices(providerData.id);
      } else {
        console.log('Provider data does not have an ID:', providerData);
      }
    } catch (error) {
      console.error('Failed to fetch provider profile:', error);
    }
  }, [user, fetchProviderServices]);

  // Fetch payment history
  const fetchPaymentHistory = useCallback(async (page: number = 1) => {
    if (!user) return;
    
    console.log('fetchPaymentHistory called for user:', user.email, 'role:', user.role);
    
    try {
      setPaymentLoading(true);
      console.log('Calling paymentApi.getPaymentHistory...');
      const response = await paymentApi.getPaymentHistory(page, 10);
      console.log('Payment history response:', response);
      console.log('Response.payments length:', response.payments?.length || 0);
      setPaymentHistory(response.payments || []);
      setTotalPaymentPages(response.pagination?.pages || 1);
      setPaymentPage(response.pagination?.page || 1);
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
      // Don't show toast error for payment history as it's not critical
      // toast.error('Failed to load payment history');
      setPaymentHistory([]);
    } finally {
      setPaymentLoading(false);
    }
  }, [user]);

  // Fetch provider earnings
  const fetchProviderEarnings = useCallback(async () => {
    if (!user || user.role !== 'PROVIDER') return;

    try {
      const earningsData = await paymentApi.getProviderEarnings();
      console.log('Earnings data received:', earningsData);
      setEarnings(earningsData);
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
      // Don't show toast error for earnings as it's not critical
      // toast.error('Failed to load earnings data');
    }
  }, [user]);

  // Fetch customer reviews (when user is acting as customer)
  const fetchCustomerReviews = useCallback(async () => {
    if (!user) return;

    try {
      setReviewsLoading(true);
      const response = await userApi.getCustomerReviewsReceived(user.id);
      setCustomerReviews(response.reviews || []);
    } catch (error) {
      console.error('Failed to fetch customer reviews:', error);
      setCustomerReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, [user]);

  // Fetch service reviews (when user has provider profile data)
  const fetchServiceReviews = useCallback(async () => {
    if (!user || !providerProfile?.id) return;

    try {
      setReviewsLoading(true);
      // Use serviceReviewApi similar to Provider page
      const response = await serviceReviewApi.getProviderServiceReviews(providerProfile.id);
      if (response.success) {
        setServiceReviews(response.data.reviews || []);
      } else {
        setServiceReviews([]);
      }
    } catch (error) {
      console.error('Failed to fetch service reviews:', error);
      setServiceReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, [user, providerProfile?.id]);

  // Replace the old fetchProfile useEffect with optimized version
  useEffect(() => {
    if (!authLoading && user) {
      fetchProviderData();
      // Fetch payment data for all users
      if (user.role === 'PROVIDER') {
        // Fetch earnings for providers
        fetchProviderEarnings().catch(err => console.log('Earnings fetch failed:', err));
      }
      // Fetch reviews for all users - service reviews loaded separately when provider profile is available
      fetchCustomerReviews().catch(err => console.log('Customer reviews fetch failed:', err));
      // Fetch payment history for all users (providers and customers)
      fetchPaymentHistory().catch(err => console.log('Payment history fetch failed:', err));
    }
  }, [authLoading, user, fetchProviderData, fetchProviderEarnings, fetchPaymentHistory, fetchCustomerReviews]);

  // Separate effect to fetch service reviews when provider profile is loaded
  useEffect(() => {
    if (providerProfile?.id && user) {
      fetchServiceReviews().catch(err => console.log('Service reviews fetch failed:', err));
    }
  }, [providerProfile?.id, user, fetchServiceReviews]);

  const refreshServices = useCallback(() => {
    if (providerProfile?.id) {
      fetchProviderServices(providerProfile.id);
    }
  }, [providerProfile?.id, fetchProviderServices]);

  // Listen for window focus to refresh services when returning from create service page
  useEffect(() => {
    const handleFocus = () => {
      if (providerProfile?.id) {
        refreshServices();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [providerProfile?.id, refreshServices]);

  const handleUpdateProfile = (updatedUser: Partial<UserProfile>) => {
    if (user) {
      const newUser = { ...user, ...updatedUser };
      updateUser(newUser);
    }
  };

  const handleBecomeProvider = () => {
    navigate('/become-provider');
  };

  const handleProviderUpdated = (updatedProvider: ProviderProfile) => {
    setProviderProfile(updatedProvider);
    // Also update user data if needed
    if (user && updatedProvider.user) {
      const newUser = { ...user, role: updatedProvider.user.role };
      updateUser(newUser);
    }
    // Refresh services after provider update
    if (updatedProvider.id) {
      fetchProviderServices(updatedProvider.id);
    }
  };

  const handleDeleteProvider = async () => {
    try {
      await userApi.deleteProvider();
      toast.success('Provider profile deleted successfully!');
      setShowDeleteConfirmation(false);
      // Update auth context user data
      const updatedUser = await userApi.getProfile();
      updateUser(updatedUser);
      setProviderProfile(null);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete provider profile');
    }
  };

  const handleCompanySuccess = (company: Company) => {
    // Update the provider profile with the new/updated company
    if (providerProfile) {
      if (selectedCompany) {
        // Update existing company
        setProviderProfile({
          ...providerProfile,
          companies: providerProfile.companies.map(c => 
            c.id === company.id ? company : c
          )
        });
      } else {
        // Add new company
        setProviderProfile({
          ...providerProfile,
          companies: [...providerProfile.companies, company]
        });
      }
    }
    setSelectedCompany(null);
  };

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setShowCompanyModal(true);
  };

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;
    
    try {
      await userApi.deleteCompany(companyToDelete);
      toast.success('Company deleted successfully!');
      
      // Update the provider profile
      if (providerProfile) {
        setProviderProfile({
          ...providerProfile,
          companies: providerProfile.companies.filter(c => c.id !== companyToDelete)
        });
      }
      
      setShowDeleteCompanyConfirmation(false);
      setCompanyToDelete(null);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete company');
    }
  };

  const handleDeleteCompanyClick = (companyId: string) => {
    setCompanyToDelete(companyId);
    setShowDeleteCompanyConfirmation(true);
  };

  const handleEditService = (service: {
    id: string;
    title?: string;
    description?: string;
    price: number;
    currency: string;
    tags?: string[];
    images?: string[];
    isActive: boolean;
    workingTime?: string[];
    // Location fields
    latitude?: number;
    longitude?: number;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    serviceRadiusKm?: number;
  }) => {
    setSelectedService(service);
    setServiceFormData({
      title: service.title || '',
      description: service.description || '',
      price: service.price || 0,
      currency: service.currency || 'LKR',
      tags: service.tags || [],
      images: service.images || [],
      isActive: service.isActive ?? true,
      workingTime: service.workingTime || [],
      // Location fields
      latitude: service.latitude,
      longitude: service.longitude,
      address: service.address || '',
      city: service.city || '',
      state: service.state || '',
      country: service.country || '',
      postalCode: service.postalCode || '',
      serviceRadiusKm: service.serviceRadiusKm || 10
    });
    setShowUpdateServiceModal(true);
  };

  const handleUpdateService = async () => {
    if (!selectedService) return;

    if (uploadingImages) {
      toast.error('Please wait for image uploads to complete');
      return;
    }

    try {
      await serviceApi.updateService(selectedService.id, serviceFormData);
      toast.success('Service updated successfully!');
      
      // Refetch services directly instead of full profile
      if (providerProfile?.id) {
        await fetchProviderServices(providerProfile.id);
      }
      
      // Also refetch services if we have a provider profile
      if (providerProfile?.id) {
        await fetchProviderServices(providerProfile.id);
      }
      
      setShowUpdateServiceModal(false);
      setSelectedService(null);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to update service');
    }
  };

  const handleServiceFormChange = (field: string, value: string | number | boolean | string[]) => {
    setServiceFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = async (location: {
    latitude?: number;
    longitude?: number;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    serviceRadiusKm?: number;
  } | null) => {
    if (!location) {
      // Reset location fields when location is cleared
      setServiceFormData(prev => ({
        ...prev,
        latitude: undefined,
        longitude: undefined,
        address: '',
        city: undefined,
        state: undefined,
        country: undefined,
        postalCode: undefined,
        serviceRadiusKm: 10
      }));
      return;
    }

    // If we have latitude and longitude but no extended geolocation data,
    // perform reverse geocoding to get address components
    let updatedLocation = { ...location };
    if (location.latitude && location.longitude && !location.city && !location.country) {
      try {
        const { hybridSearchApi } = await import('../api/hybridSearchApi');
        const response = await hybridSearchApi.reverseGeocode(location.latitude, location.longitude);
        if (response.success && response.data && response.data.city && response.data.country) {
          updatedLocation = {
            ...location,
            address: location.address || response.data.address,
            city: response.data.city,
            state: response.data.state,
            country: response.data.country,
            postalCode: response.data.postalCode
          };
        }
      } catch (error) {
        console.warn('Failed to reverse geocode location:', error);
        // Continue with original location data if reverse geocoding fails
      }
    }

    setServiceFormData(prev => ({
      ...prev,
      latitude: updatedLocation.latitude || prev.latitude,
      longitude: updatedLocation.longitude || prev.longitude,
      address: updatedLocation.address || '',
      city: updatedLocation.city,
      state: updatedLocation.state,
      country: updatedLocation.country,
      postalCode: updatedLocation.postalCode,
      serviceRadiusKm: updatedLocation.serviceRadiusKm || prev.serviceRadiusKm || 10
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImages(true);
    try {
      const imageUrls = await uploadMultipleImages(files);
      setServiceFormData(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }));
      toast.success(`${files.length} image(s) uploaded successfully!`);
    } catch (error) {
      toast.error('Failed to upload images. Please try again.');
      console.error('Image upload error:', error);
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setServiceFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-white dark:bg-black overflow-hidden">
        {/* Glass Morphism Background - Homepage Style */}
        <div className="absolute inset-0 z-0">
          {/* Main gradient background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#fff,#ffffff_50%,#e8e8e8_88%)] dark:bg-[linear-gradient(to_bottom,#000,#0000_30%,#898e8e_78%,#ffffff_99%_50%)]"></div>

          {/* Square Grid Pattern */}
          <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#e5e7eb_0.5px,transparent_0.5px),linear-gradient(to_bottom,#e5e7eb_0.5px,transparent_0.5px)] dark:bg-[linear-gradient(to_right,#374151_0.5px,transparent_0.5px),linear-gradient(to_bottom,#374151_0.5px,transparent_0.5px)] bg-[size:4rem_4rem] opacity-30 [mask-image:linear-gradient(to_bottom,black_0%,black_50%,transparent_100%)]" />

          {/* Subtle Orbs for depth */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 opacity-10 blur-3xl">
            <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
          </div>
          <div className="absolute top-1/3 right-1/4 w-80 h-80 opacity-8 blur-3xl">
            <div className="w-full h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-pulse"></div>
          </div>
          <div className="absolute bottom-1/4 right-1/3 w-72 h-72 opacity-10 blur-3xl">
            <div className="w-full h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
          </div>

          {/* Minimal gradient accents */}
          <div className="absolute top-1/5 left-3/4 w-64 h-64 bg-black/5 dark:bg-white/5 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute bottom-1/5 left-1/5 w-56 h-56 bg-black/3 dark:bg-white/3 rounded-full blur-3xl opacity-25"></div>

          {/* Radial overlay for depth */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(255,255,255,0.1)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.2)_100%)]"></div>
        </div>

        {/* Content Overlay - Glass Morphism */}
        <div className="relative z-10 flex flex-col min-h-screen" style={{ paddingLeft: '10px', paddingRight: '10px' }}>
          <main className="flex-1 mx-[30px] px-4 sm:px-6 lg:px-8 mt-20 mb-8">
            {/* Profile Header Skeleton */}
            <div className="backdrop-blur-md bg-white/70 dark:bg-black/30 border border-white/20 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.05)] overflow-hidden mb-8">
              {/* Banner Skeleton */}
              <div className="relative h-36 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-900">
                <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-black/2 to-black/5 dark:from-white/5 dark:via-white/2 dark:to-white/5"></div>

                {/* Avatar Skeleton */}
                <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16 z-10">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-white/50 dark:border-white/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.15)] bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Header Content Skeleton */}
              <div className="px-4 sm:px-6 pb-6 bg-gradient-to-b from-white/10 to-transparent dark:from-black/10">
                <div className="flex flex-col lg:flex-row items-center lg:items-end lg:space-x-8 mt-0">
                  <div className="w-32 h-16 lg:hidden"></div>
                  <div className="flex-1 text-center lg:text-left ml-5 mt-13 lg:mt-0">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-2 mx-auto lg:mx-0"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-2 mx-auto lg:mx-0"></div>
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-2">
                          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-24"></div>
                          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-16"></div>
                          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-20"></div>
                        </div>
                      </div>
                      <div className="animate-pulse">
                        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-full w-32"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Basic Info Skeleton */}
              <div className="lg:col-span-1 space-y-6">
                <div className="backdrop-blur-md bg-white/70 dark:bg-black/30 border border-white/20 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] p-6">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-40 mb-4"></div>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center space-x-3 p-3 rounded-xl bg-white/50 dark:bg-black/50">
                          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16 mb-1"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Services Skeleton */}
              <div className="lg:col-span-2 space-y-6">
                <div className="backdrop-blur-md bg-white/70 dark:bg-black/30 border border-white/20 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] p-6">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-white/30 dark:border-white/20 rounded-2xl p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
                              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
                              <div className="flex items-center gap-2">
                                <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
                                <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                              </div>
                            </div>
                            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-16"></div>
                          </div>
                          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black to-purple-50 dark:bg-black  flex flex-col">
        <div className="flex-1 flex items-center justify-center mt-16">
          <div className="text-center">
        <p className="text-black dark:text-white mb-4">Please log in to access your profile.</p>
        <Button
          onClick={() => {
        localStorage.setItem('RedirectAfterLogin', window.location.pathname);
        navigate('/signin');
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
    <div className="relative min-h-screen bg-white dark:bg-black overflow-hidden">
      {/* Glass Morphism Background - Homepage Style */}
      <div className="absolute inset-0 z-0">
        {/* Main gradient background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#fff,#ffffff_50%,#e8e8e8_88%)] dark:bg-[linear-gradient(to_bottom,#000,#0000_30%,#898e8e_78%,#ffffff_99%_50%)]"></div>
        
        {/* Square Grid Pattern */}
        <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#e5e7eb_0.5px,transparent_0.5px),linear-gradient(to_bottom,#e5e7eb_0.5px,transparent_0.5px)] dark:bg-[linear-gradient(to_right,#374151_0.5px,transparent_0.5px),linear-gradient(to_bottom,#374151_0.5px,transparent_0.5px)] bg-[size:4rem_4rem] opacity-30 [mask-image:linear-gradient(to_bottom,black_0%,black_50%,transparent_100%)]" />
        
        {/* Subtle Orbs for depth */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 opacity-10 blur-3xl">
          <Orb hue={280} hoverIntensity={0.2} rotateOnHover={true} />
        </div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 opacity-8 blur-3xl">
          <Orb hue={200} hoverIntensity={0.15} rotateOnHover={true} />
        </div>
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 opacity-10 blur-3xl">
          <Orb hue={320} hoverIntensity={0.2} rotateOnHover={true} />
        </div>
        
        {/* Minimal gradient accents */}
        <div className="absolute top-1/5 left-3/4 w-64 h-64 bg-black/5 dark:bg-white/5 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-1/5 left-1/5 w-56 h-56 bg-black/3 dark:bg-white/3 rounded-full blur-3xl opacity-25"></div>
        
        {/* Radial overlay for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(255,255,255,0.1)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.2)_100%)]"></div>
      </div>

      {/* Content Overlay - Glass Morphism */}
      <div className="relative z-10 flex flex-col min-h-screen" style={{ paddingLeft: '10px', paddingRight: '10px' }}>      
        <main className="flex-1 mx-[30px] px-4 sm:px-6 lg:px-8 mt-20 mb-8">
        {/* Profile Header - Glass Style */}
        <div className="backdrop-blur-md bg-white/70 dark:bg-black/30 border border-white/20 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.05)] overflow-hidden mb-8 hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.15)] dark:hover:shadow-[0_12px_48px_0_rgba(255,255,255,0.08)] transition-all duration-300">
          {/* Banner - Minimal Gradient */}
          <div className="relative h-36 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-900">
        <img
          src="https://4kwallpapers.com/images/walls/thumbs_3t/8728.jpg"
          alt="Profile Banner"
          className="w-full h-full object-cover opacity-10 dark:opacity-10 mix-blend-overlay"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-black/2 to-black/5 dark:from-white/5 dark:via-white/2 dark:to-white/5"></div>
        
        {/* Avatar - half above the banner */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16 z-10">
          <div className="relative group">
            {user.imageUrl && user.imageUrl.trim() ? (
          <img
            src={user.imageUrl}
            alt={`${user.firstName} ${user.lastName}`}
            className="relative w-32 h-32 rounded-full border-4 border-white/50 dark:border-white/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.15)] object-cover backdrop-blur-sm"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
              const defaultAvatar = img.nextElementSibling as HTMLElement;
              if (defaultAvatar) defaultAvatar.style.display = 'flex';
            }}
          />
            ) : null}
            <div
          className={`relative w-32 h-32 rounded-full border-4 border-white/50 dark:border-white/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.15)] backdrop-blur-md bg-white/50 dark:bg-black/50 flex items-center justify-center text-black dark:text-white text-3xl font-bold ${
            user.imageUrl && user.imageUrl.trim() ? 'hidden' : 'flex'
          }`}
            >
          {((user.firstName || '').charAt(0) || 'U').toUpperCase()}
          {((user.lastName || '').charAt(0) || 'S').toUpperCase()}
            </div>
          </div>
        </div>
          </div>
          {/* Header Content */}
          <div className="px-4 sm:px-6 pb-6 bg-gradient-to-b from-white/10 to-transparent dark:from-black/10">
        <div className="flex flex-col lg:flex-row items-center lg:items-end lg:space-x-8 mt-0">
          {/* Spacer for avatar */}
          <div className="w-32 h-16 lg:hidden" />
          {/* Info & Actions */}
          <div className="flex-1 text-center lg:text-left ml-5 mt-13 lg:mt-0">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent mt-4 mb-1">
              {user.firstName || 'First'} {user.lastName || 'Last'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-1">{user.email}</p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-2">
              <span
            className={`px-4 py-2 rounded-full text-sm font-medium border backdrop-blur-md ${
              user.role === 'PROVIDER'
                ? 'bg-white/50 dark:bg-black/50 text-black dark:text-white border-white/30 dark:border-white/20'
                : 'bg-white/50 dark:bg-black/50 text-black dark:text-white border-white/30 dark:border-white/20'
            } shadow-[0_4px_16px_0_rgba(0,0,0,0.08)]`}
              >
            {user.role === 'PROVIDER' ? 'Service Provider' : 'User'}
              </span>
              {user.isEmailVerified && (
            <span className="flex items-center text-black dark:text-white bg-white/50 dark:bg-black/50 px-3 py-1 rounded-full border border-white/30 dark:border-white/20 backdrop-blur-md shadow-[0_4px_16px_0_rgba(0,0,0,0.08)]">
              <Shield className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Verified</span>
            </span>
              )}
              {user.phone && (
            <span className="flex items-center text-black dark:text-white bg-white/50 dark:bg-black/50 px-3 py-1 rounded-full border border-white/30 dark:border-white/20 backdrop-blur-md shadow-[0_4px_16px_0_rgba(0,0,0,0.08)]">
              <Phone className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">{user.phone}</span>
            </span>
              )}
              {user.location && (
            <span className="flex items-center text-black dark:text-white bg-white/50 dark:bg-black/50 px-3 py-1 rounded-full border border-white/30 dark:border-white/20 backdrop-blur-md shadow-[0_4px_16px_0_rgba(0,0,0,0.08)]">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">{user.location}</span>
            </span>
              )}
            </div>
          </div>
          {/* Edit Profile Button */}
          <Button
            onClick={() => setShowEditProfileModal(true)}
            variant="outline"
            className="flex items-center space-x-2 px-6 py-3 text-base font-semibold !bg-white hover:!bg-white/90 !text-black border-2 !border-white/40 hover:!border-white/60 !rounded-full backdrop-blur-md transition-all duration-300 shadow-[0_8px_24px_0_rgba(0,0,0,0.15)] hover:shadow-[0_12px_32px_0_rgba(0,0,0,0.25)] hover:scale-105 hover:-translate-y-1"
            size="sm"
          >
            <Edit2 className="h-5 w-5" />
            <span>Edit Profile</span>
          </Button>
            </div>
            {/* Provider Actions */}
            {user.role === 'PROVIDER' && (
          <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-2">
            <Button
              onClick={() => setShowEditProviderModal(true)}
              variant="outline"
              className="flex items-center space-x-2 px-6 py-3 text-base font-semibold !bg-white hover:!bg-white/90 !text-black border-2 !border-white/40 hover:!border-white/60 !rounded-full backdrop-blur-md transition-all duration-300 shadow-[0_8px_24px_0_rgba(0,0,0,0.15)] hover:shadow-[0_12px_32px_0_rgba(0,0,0,0.25)] hover:scale-105 hover:-translate-y-1"
              size="lg"
            >
              <Edit2 className="h-5 w-5" />
              <span>Edit Provider</span>
            </Button>
            <Button
              onClick={() => setShowDeleteConfirmation(true)}
              variant="outline"
              className="flex items-center space-x-2 px-6 py-3 text-base font-semibold !bg-white hover:!bg-white/90 !text-red-600 border-2 !border-white/40 hover:!border-red-400/60 !rounded-full backdrop-blur-md transition-all duration-300 shadow-[0_8px_24px_0_rgba(239,68,68,0.2)] hover:shadow-[0_12px_32px_0_rgba(239,68,68,0.3)] hover:scale-105 hover:-translate-y-1"
              size="lg"
            >
              <Trash2 className="h-5 w-5" />
              <span>Delete Provider</span>
            </Button>
          </div>
            )}
            {/* Company Info in Header */}
            {providerProfile && providerProfile.companies && providerProfile.companies.length > 0 && (
          <div className="flex items-center mt-4 bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-xl p-3 border border-white/30 dark:border-white/20 shadow-[0_4px_16px_0_rgba(0,0,0,0.08)]">
            {providerProfile.companies[0].logo ? (
              <img
                src={providerProfile.companies[0].logo}
                alt={providerProfile.companies[0].name}
                className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-white/50 dark:border-white/30"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-md flex items-center justify-center mr-3 border-2 border-white/50 dark:border-white/30">
                <Building className="h-5 w-5 text-black dark:text-white" />
              </div>
            )}
            <span className="text-sm font-medium text-black dark:text-white">{providerProfile.companies[0].name}</span>
          </div>
            )}
            {/* Social Media Links */}
          </div>
        </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Information */}
            <div className="backdrop-blur-md bg-white/70 dark:bg-black/30 border border-white/20 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] p-6 hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.15)] transition-all duration-300">
              <h2 className="text-xl font-bold bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent mb-4">Basic Information</h2>
              <div className="space-y-3">
                <div className="group flex items-center space-x-3 p-3 rounded-xl bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-white/30 dark:border-white/20 hover:scale-102 transition-all duration-200">
                  <div className="w-10 h-10 rounded-lg bg-white/50 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/30 dark:border-white/20">
                    <Mail className="h-5 w-5 text-black dark:text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Email</p>
                    <p className="text-sm font-semibold text-black dark:text-white">{user.email}</p>
                  </div>
                </div>
                
                {user.phone && (
                  <div className="group flex items-center space-x-3 p-3 rounded-xl bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-white/30 dark:border-white/20 hover:scale-102 transition-all duration-200">
                    <div className="w-10 h-10 rounded-lg bg-white/50 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/30 dark:border-white/20">
                      <Phone className="h-5 w-5 text-black dark:text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Phone</p>
                      <p className="text-sm font-semibold text-black dark:text-white">{user.phone}</p>
                    </div>
                  </div>
                )}
                
                {user.location && (
                  <div className="group flex items-center space-x-3 p-3 rounded-xl bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-white/30 dark:border-white/20 hover:scale-102 transition-all duration-200">
                    <div className="w-10 h-10 rounded-lg bg-white/50 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/30 dark:border-white/20">
                      <MapPin className="h-5 w-5 text-black dark:text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Location</p>
                      <p className="text-sm font-semibold text-black dark:text-white">{user.location}</p>
                    </div>
                  </div>
                )}

                {user.address && (
                  <div className="group flex items-start space-x-3 p-3 rounded-xl bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-white/30 dark:border-white/20 hover:scale-102 transition-all duration-200">
                    <div className="w-10 h-10 rounded-lg bg-white/50 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/30 dark:border-white/20">
                      <MapPin className="h-5 w-5 text-black dark:text-white mt-0.5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Address</p>
                      <p className="text-sm font-semibold text-black dark:text-white">{user.address}</p>
                    </div>
                  </div>
                )}
                
                <div className="group flex items-center space-x-3 p-3 rounded-xl bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-white/30 dark:border-white/20 hover:scale-102 transition-all duration-200">
                  <div className="w-10 h-10 rounded-lg bg-white/50 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/30 dark:border-white/20">
                    <Calendar className="h-5 w-5 text-black dark:text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Member since</p>
                    <p className="text-sm font-semibold text-black dark:text-white">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {user.socialmedia && user.socialmedia.length > 0 && (
                  <div className="group flex items-start space-x-3 p-4 rounded-xl bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-white/30 dark:border-white/20">
                    <div className="w-10 h-10 rounded-lg bg-white/50 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/30 dark:border-white/20">
                      <ExternalLink className="h-5 w-5 text-black dark:text-white mt-0.5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2">Social Media</p>
                      <div className="space-y-2">
                        {user.socialmedia.map((link, index) => {
                          const url = link.startsWith('http') ? link : `https://${link}`;
                          const username = url.split('/').pop(); // Extract username from URL
                          const platformIcon = url.includes('twitter') || url.includes('x.com')
    ? <i className="fab fa-twitter text-black dark:text-white"></i>
    : url.includes('linkedin')
    ? <i className="fab fa-linkedin text-black dark:text-white"></i>
    : url.includes('instagram')
    ? <i className="fab fa-instagram text-black dark:text-white"></i>
    : url.includes('github')
    ? <i className="fab fa-github text-black dark:text-white"></i>
    : url.includes('portfolio') || url.includes('website')
    ? <i className="fas fa-globe text-black dark:text-white"></i>
    : <i className="fas fa-link text-black dark:text-white"></i>;

  return (
    <a
      key={index}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center text-black dark:text-white text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg hover:bg-white/50 dark:hover:bg-black/50 backdrop-blur-sm border border-transparent hover:border-white/30 dark:hover:border-white/20"
    >
      <span className="mr-2">{platformIcon}</span>
      {username}
    </a>
  );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* My Services Section - Moved to Left Column */}
            {providerProfile && (
              <>
                {servicesLoading ? (
                  <div className="backdrop-blur-md bg-white/70 dark:bg-black/30 border border-white/20 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent">My Services</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Manage your services</p>
                      </div>
                    </div>
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white mx-auto mb-3"></div>
                      <p className="text-gray-600 dark:text-gray-400">Loading services...</p>
                    </div>
                  </div>
                ) : services.length > 0 ? (
                  <div className="backdrop-blur-md bg-white/70 dark:bg-black/30 border border-white/20 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] p-6 hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.15)] transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent">My Services</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          {services.length} service{services.length !== 1 ? 's' : ''} • {services.filter(s => s.isActive).length} active
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {services.map((service) => (
                        <div
                          key={service.id}
                          onClick={() => navigate(`/service/${service.id}`)}
                          className="group p-4 rounded-xl bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-white/30 dark:border-white/20 hover:border-white/50 dark:hover:border-white/30 cursor-pointer transition-all duration-300 hover:scale-102 hover:shadow-lg"
                        >
                          <div className="flex items-start gap-3">
                            {service.images && service.images.length > 0 ? (
                              <img
                                src={service.images[0]}
                                alt={service.title || 'Service image'}
                                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-200/50 to-gray-300/50 dark:from-gray-800/50 dark:to-gray-900/50 flex items-center justify-center flex-shrink-0">
                                <Briefcase className="w-6 h-6 text-gray-500 dark:text-gray-400 opacity-50" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className="text-sm font-bold text-black dark:text-white line-clamp-1">
                                  {service.title || 'Untitled Service'}
                                </h3>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const serviceData = {
                                      id: service.id,
                                      title: service.title,
                                      description: service.description,
                                      price: typeof service.price === 'string' ? parseFloat(service.price) : service.price,
                                      currency: service.currency,
                                      tags: service.tags,
                                      images: service.images,
                                      isActive: service.isActive,
                                      workingTime: service.workingTime,
                                      latitude: service.latitude,
                                      longitude: service.longitude,
                                      address: service.address,
                                      city: service.city,
                                      state: service.state,
                                      country: service.country,
                                      postalCode: service.postalCode,
                                      serviceRadiusKm: service.serviceRadiusKm
                                    };
                                    handleEditService(serviceData);
                                  }}
                                  variant="white"
                                  size="sm"
                                  className="px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md bg-white/90 dark:bg-white/80 border border-white/40 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                                  title="Edit Service"
                                >
                                  <Edit2 className="h-3.5 w-3.5 text-black" strokeWidth={2.5} />
                                  <span className="text-xs font-semibold text-black">Edit</span>
                                </Button>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                {service.description || 'No description'}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                {service.averageRating && service.averageRating > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-current text-black dark:text-white" />
                                    <span className="font-semibold">{service.averageRating.toFixed(1)}</span>
                                  </div>
                                )}
                                {service.reviewCount && service.reviewCount > 0 && (
                                  <span>• {service.reviewCount} review{service.reviewCount !== 1 ? 's' : ''}</span>
                                )}
                                <span>• ${service.price}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/create-service');
                      }}
                      variant="white"
                      className="w-full mt-4 flex items-center justify-center space-x-2 px-6 py-3 text-sm font-semibold rounded-full hover:scale-105 transition-all duration-300"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create New Service</span>
                    </Button>
                  </div>
                ) : (
                  <div className="backdrop-blur-md bg-white/70 dark:bg-black/30 border border-white/20 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] p-6">
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 dark:border-white/20">
                        <Briefcase className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                      </div>
                      <h3 className="text-base font-semibold text-black dark:text-white mb-2">No services yet</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Start showcasing your skills
                      </p>
                      <Button
                        onClick={() => navigate('/create-service')}
                        variant="white"
                        className="flex items-center space-x-2 mx-auto px-6 py-3 text-sm font-semibold rounded-full hover:scale-105 transition-all duration-300"
                      >
                        <Plus className="h-5 w-5" />
                        <span>Create First Service</span>
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Column - Provider-specific content */}
          <div className="lg:col-span-2">
            {user.role === 'PROVIDER' && providerProfile ? (
              // Check if provider is verified
              providerProfile.isVerified === false ? (
                /* Unverified Provider */
                <div className="bg-black/20 backdrop-blur-lg rounded-xl shadow-2xl p-8 text-center border border-white/10">
                  <div className="max-w-md mx-auto">
                    <div className="p-3 bg-yellow-500/20 backdrop-blur-sm rounded-full inline-flex mb-4 border border-yellow-400/30">
                      <Clock className="h-12 w-12 text-yellow-400" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white mb-2">Verification in Progress</h2>
                    <p className="text-gray-300 mb-6">
                      Your provider profile has been submitted and is currently under review. 
                      Our team is verifying your information and credentials.
                    </p>
                    <div className="bg-yellow-500/10 backdrop-blur-sm border border-yellow-400/20 rounded-lg p-4 mb-6">
                      <h3 className="font-semibold text-yellow-300 mb-2">What's Next?</h3>
                      <ul className="text-sm text-yellow-200 space-y-1 text-left">
                        <li>• We'll review your profile and credentials</li>
                        <li>• You'll receive an email once verification is complete</li>
                        <li>• Verification typically takes 1-3 business days</li>
                        <li>• Once verified, you can start adding services</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <Button
                        onClick={() => setShowEditProviderModal(true)}
                        variant="outline"
                        size="lg"
                        className="flex items-center space-x-2 mx-auto px-6 py-3 text-base font-semibold !bg-white hover:!bg-white/90 !text-black border-2 !border-white/40 hover:!border-white/60 !rounded-full backdrop-blur-md shadow-[0_8px_24px_0_rgba(0,0,0,0.15)] hover:shadow-[0_12px_32px_0_rgba(0,0,0,0.25)] hover:scale-105 hover:-translate-y-1 transition-all duration-300"
                      >
                        <Edit2 className="h-5 w-5" />
                        <span>Edit Profile</span>
                      </Button>
                      <Button
                        onClick={() => setShowDeleteConfirmation(true)}
                        variant="ghost"
                        className="px-6 py-3 text-base font-semibold !bg-white hover:!bg-white/90 !text-red-600 border-2 !border-white/40 hover:!border-red-400/60 !rounded-full backdrop-blur-md shadow-[0_8px_24px_0_rgba(239,68,68,0.2)] hover:shadow-[0_12px_32px_0_rgba(239,68,68,0.3)] hover:scale-105 hover:-translate-y-1 transition-all duration-300"
                      >
                        Cancel Application
                      </Button>
                    </div>
                    
                    {/* Show basic provider info */}
                    <div className="mt-8 text-left">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Submitted Information</h3>
                      <div className="space-y-4 p-4 rounded-lg bg-white/70 border border-gray-200 dark:bg-white/5 dark:border-white/10">
                        {providerProfile.bio && (
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">Bio</h4>
                            <p className="text-gray-700 dark:text-gray-200 text-base leading-relaxed">{providerProfile.bio}</p>
                          </div>
                        )}
                        
                        {providerProfile.skills && providerProfile.skills.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {providerProfile.skills.map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-600/20 dark:text-blue-200 border border-blue-300/60 dark:border-blue-400/30 rounded-full text-sm"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {providerProfile.qualifications && providerProfile.qualifications.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Qualifications</h4>
                            <div className="space-y-1">
                              {providerProfile.qualifications.map((qualification, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <Award className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                  <span className="text-gray-700 dark:text-gray-200 text-base">{qualification}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Verified Provider - existing content */
              <div className="space-y-6">
                {/* Provider Stats - Glass Morphism */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="group backdrop-blur-md bg-white/70 dark:bg-black/30 border border-white/20 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] p-6 hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-14 h-14 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 dark:border-white/20">
                        <Star className="h-7 w-7 text-black dark:text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent">
                          {providerProfile.averageRating?.toFixed(1) || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Average Rating</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(providerProfile.averageRating || 0)
                              ? 'text-black dark:text-white fill-current'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="group backdrop-blur-md bg-white/70 dark:bg-black/30 border border-white/20 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] p-6 hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-14 h-14 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 dark:border-white/20">
                        <Award className="h-7 w-7 text-black dark:text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent">
                          {providerProfile.totalReviews || 0}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Total Reviews</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">
                      {providerProfile.totalReviews && providerProfile.totalReviews > 0 
                        ? `✨ ${((providerProfile.averageRating || 0) / 5 * 100).toFixed(0)}% satisfaction`
                        : 'No reviews yet'
                      }
                    </p>
                  </div>
                  
                  <div className="group backdrop-blur-md bg-white/70 dark:bg-black/30 border border-white/20 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] p-6 hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-14 h-14 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 dark:border-white/20">
                        <Briefcase className="h-7 w-7 text-black dark:text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent">
                          {services.length}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Services Listed</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">
                      ✓ {services.filter(s => s.isActive).length} active • {services.filter(s => !s.isActive).length} inactive
                    </p>
                  </div>
                </div>

                {/* Performance Trends Chart - Full Width */}
                {services.length > 0 && (
                  <div className="backdrop-blur-md bg-white/70 dark:bg-black/30 border border-white/20 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] p-6 hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.15)] transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent flex items-center gap-2">
                          <Activity className="h-6 w-6 text-black dark:text-white" />
                          Performance Trends
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Service ratings and review trends</p>
                      </div>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={services.slice(0, 8).map(service => ({
                            name: service.title && service.title.length > 12 ? service.title.substring(0, 12) + '...' : service.title || 'Untitled',
                            rating: service.averageRating || 0,
                            reviews: service.reviewCount || 0
                          }))}
                          margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
                        >
                          <defs>
                            <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#000000" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#000000" stopOpacity={0.05}/>
                            </linearGradient>
                            <linearGradient id="reviewsGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#666666" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#666666" stopOpacity={0.05}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                          <XAxis 
                            dataKey="name" 
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            tick={{ fill: 'currentColor', fontSize: 12 }}
                            className="text-gray-700 dark:text-gray-300"
                          />
                          <YAxis 
                            yAxisId="left"
                            domain={[0, 5]}
                            ticks={[0, 1, 2, 3, 4, 5]}
                            tick={{ fill: 'currentColor', fontSize: 12 }}
                            className="text-gray-700 dark:text-gray-300"
                            label={{ value: 'Rating', angle: -90, position: 'insideLeft', fill: 'currentColor' }}
                          />
                          <YAxis 
                            yAxisId="right" 
                            orientation="right"
                            tick={{ fill: 'currentColor', fontSize: 12 }}
                            className="text-gray-700 dark:text-gray-300"
                            label={{ value: 'Reviews', angle: 90, position: 'insideRight', fill: 'currentColor' }}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(0,0,0,0.1)',
                              borderRadius: '12px',
                              padding: '12px',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                            }}
                            labelStyle={{ color: '#000', fontWeight: 'bold', marginBottom: '4px' }}
                          />
                          <Legend 
                            wrapperStyle={{ paddingTop: '20px' }}
                          />
                          <Area 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="rating" 
                            stroke="#ffffffff" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#ratingGradient)"
                            name="Average Rating"
                          />
                          <Area 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="reviews" 
                            stroke="#666666" 
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            fillOpacity={1} 
                            fill="url(#reviewsGradient)"
                            name="Total Reviews"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Bio - Glass Morphism */}
                {providerProfile.bio && (
                  <div className="backdrop-blur-md bg-white/70 dark:bg-black/30 border border-white/20 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] p-6 hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.15)] transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent">About Me</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Professional background and expertise</p>
                      </div>
                    </div>
                    <div className="prose prose-gray max-w-none">
                      <blockquote className="border-l-4 border-black/20 dark:border-white/20 pl-6 py-3 bg-white/50 dark:bg-black/50 rounded-r-xl backdrop-blur-sm">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base italic font-medium">
                          "{providerProfile.bio}"
                        </p>
                      </blockquote>
                    </div>
                  </div>
                )}

                {/* Skills - Glass Morphism */}
                {providerProfile.skills && providerProfile.skills.length > 0 && (
                  <div className="backdrop-blur-md bg-white/70 dark:bg-black/30 border border-white/20 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] p-6 hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.15)] transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent">Skills & Expertise</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          ✨ {providerProfile.skills.length} skill{providerProfile.skills.length !== 1 ? 's' : ''} listed
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {providerProfile.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="group px-5 py-2.5 bg-white/50 dark:bg-black/50 backdrop-blur-md text-black dark:text-white rounded-full text-sm font-semibold border border-white/30 dark:border-white/20 hover:border-white/50 dark:hover:border-white/30 hover:shadow-[0_4px_16px_0_rgba(0,0,0,0.12)] transition-all duration-300 cursor-default hover:scale-105"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Qualifications - Glass Morphism */}
                {providerProfile.qualifications && providerProfile.qualifications.length > 0 && (
                  <div className="backdrop-blur-md bg-white/70 dark:bg-black/30 border border-white/20 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] p-6 hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.15)] transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent">Qualifications & Certifications</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          Professional credentials and achievements
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {providerProfile.qualifications.map((qualification, index) => (
                        <div key={index} className="group flex items-start space-x-4 p-4 rounded-xl bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-white/30 dark:border-white/20 hover:border-white/50 dark:hover:border-white/30 transition-all duration-300 hover:scale-102">
                          <div className="w-12 h-12 bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 dark:border-white/20">
                            <Award className="h-6 w-6 text-black dark:text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-800 dark:text-gray-200 font-semibold leading-relaxed">
                              {qualification}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviews Section with Dropdown for Providers */}
                {(
                  <div className="backdrop-blur-md bg-white/70 dark:bg-black/30 border border-white/20 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] p-6 hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.15)] transition-all duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                      <div>
                        <h2 className="text-xl font-bold bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent">My Reviews</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          {selectedReviewType === 'customer'
                            ? 'Feedback received from service providers'
                            : 'Customer feedback on your services'
                          }
                        </p>
                      </div>

                      {/* Review Type Dropdown for Providers */}
                      <div className="relative">
                        <select
                          value={selectedReviewType}
                          onChange={(e) => setSelectedReviewType(e.target.value as 'customer' | 'service')}
                          className="px-4 py-2 pr-8 bg-white/80 dark:bg-black/60 border border-white/30 dark:border-white/20 rounded-xl text-sm font-medium text-black dark:text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-all duration-200 hover:bg-white/90 dark:hover:bg-black/70 appearance-none"
                        >
                          {customerReviews.length > 0 && (
                            <option value="customer" className="bg-white dark:bg-black text-black dark:text-white">⭐ Reviews from Providers</option>
                          )}
                          {serviceReviews.length > 0 && (
                            <option value="service" className="bg-white dark:bg-black text-black dark:text-white"> Reviews from Customers</option>
                          )}
                        </select>
                        <ChevronRight className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black dark:text-white h-4 w-4 pointer-events-none rotate-90" />
                      </div>
                    </div>

                    {reviewsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white mx-auto mb-3"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading reviews...</p>
                      </div>
                    ) : selectedReviewType === 'customer' && customerReviews.length > 0 ? (
                      <div className="space-y-6">
                        {customerReviews.slice(0, 5).map((review, index) => (
                          <div key={review.id || index} className="group border border-white/20 dark:border-white/10 rounded-xl p-4 bg-white/30 dark:bg-black/20 backdrop-blur-sm hover:border-white/40 dark:hover:border-white/20 transition-all duration-300">
                            <div className="flex items-start space-x-4">
                              {review.reviewer?.imageUrl ? (
                                <img
                                  src={review.reviewer.imageUrl}
                                  alt={`${review.reviewer?.firstName || 'Provider'} ${review.reviewer?.lastName || ''}`}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-white/40 dark:border-white/30"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold text-sm border-2 border-white/40 dark:border-white/30">
                                  {((review.reviewer?.firstName || 'P').charAt(0) || 'P').toUpperCase()}
                                  {((review.reviewer?.lastName || '').charAt(0) || 'R').toUpperCase()}
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <h4 className="font-semibold text-black dark:text-white text-base">
                                      {review.reviewer?.firstName || 'Provider'} {review.reviewer?.lastName || ''}
                                    </h4>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <div className="flex items-center space-x-1">
                                        {[...Array(5)].map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`h-4 w-4 ${
                                              i < (review.rating || 0)
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-300 dark:text-gray-600'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                                        {review.rating || 0}.0
                                      </span>
                                      <span className="text-sm text-gray-500">• Provider</span>
                                    </div>
                                    <div className="flex items-center mt-1">
                                      <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric'
                                        }) : 'N/A'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <blockquote className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed border-l-4 border-blue-500/30 pl-4 italic bg-white/50 dark:bg-black/30 p-3 rounded-r-lg">
                                    "{review.comment || 'No comment provided'}"
                                  </blockquote>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {customerReviews.length > 5 && (
                          <div className="text-center pt-4 border-t border-white/20 dark:border-white/10">
                            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                              Showing 5 of {customerReviews.length} reviews
                            </span>
                          </div>
                        )}
                      </div>
                    ) : selectedReviewType === 'service' && serviceReviews.length > 0 ? (
                      <div className="space-y-6">
                        {serviceReviews.slice(0, 5).map((review, index) => (
                          <div key={review.id || index} className="group border border-white/20 dark:border-white/10 rounded-xl p-4 bg-white/30 dark:bg-black/20 backdrop-blur-sm hover:border-white/40 dark:hover:border-white/20 transition-all duration-300">
                            <div className="flex items-start space-x-4">
                              <img
                                src={review.clientAvatar || `https://picsum.photos/seed/${review.reviewerId}/60/60`}
                                alt={review.clientName}
                                className="w-12 h-12 rounded-full object-cover border-2 border-white/40 dark:border-white/30"
                                onError={(e) => {
                                  e.currentTarget.src = `https://picsum.photos/seed/${review.reviewerId}/60/60`;
                                }}
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <h4 className="font-semibold text-black dark:text-white text-base">
                                      {review.clientName || 'Anonymous Customer'}
                                    </h4>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <div className="flex items-center space-x-1">
                                        {[...Array(5)].map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`h-4 w-4 ${
                                              i < (review.rating || 0)
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-300 dark:text-gray-600'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                                        {review.rating || 0}.0
                                      </span>
                                      <span className="text-sm text-gray-500">•</span>
                                      <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {typeof review.service === 'object' ? review.service?.title : review.service || 'Service'}
                                      </span>
                                    </div>
                                    <div className="flex items-center mt-1">
                                      <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {review.date || (review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric'
                                        }) : 'N/A')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <blockquote className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed border-l-4 border-blue-500/30 pl-4 italic bg-white/50 dark:bg-black/30 p-3 rounded-r-lg">
                                    "{review.comment || 'No comment provided'}"
                                  </blockquote>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {serviceReviews.length > 5 && (
                          <div className="text-center pt-4 border-t border-white/20 dark:border-white/10">
                            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                              Showing 5 of {serviceReviews.length} reviews
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Star className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-black dark:text-white mb-2">No reviews yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {selectedReviewType === 'customer'
                            ? 'Reviews from service providers will appear here once you receive feedback.'
                            : 'Reviews from customers will appear here once you receive feedback on your services.'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Companies */}
                <div className="bg-black/20 backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Companies</h2>
                    <Button
                      onClick={() => {
                        setSelectedCompany(null);
                        setShowCompanyModal(true);
                      }}
                      variant="white"
                      size="sm"
                      className="flex items-center space-x-2 px-5 py-2.5 text-sm font-semibold rounded-full hover:scale-105 hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Company</span>
                    </Button>
                  </div>
                  
                  {providerProfile.companies && providerProfile.companies.length > 0 ? (
                    <div className="space-y-4">
                      {providerProfile.companies.map((company) => (
                        <div key={company.id} className="border border-white/10 rounded-lg p-4 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              {company.logo ? (
                                <img
                                  src={company.logo}
                                  alt={company.name}
                                  className="w-12 h-12 rounded-lg object-cover border border-white/20"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                  <Building className="h-6 w-6 text-gray-300" />
                                </div>
                              )}
                              <div>
                                <h3 className="font-semibold text-white">{company.name}</h3>
                                {company.description && (
                                  <p className="text-gray-400 text-sm mt-1">{company.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleEditCompany(company)}
                                variant="white"
                                size="sm"
                                className="p-2.5 rounded-full hover:scale-110 transition-all duration-300"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteCompanyClick(company.id)}
                                variant="white"
                                size="sm"
                                className="p-2.5 !text-red-600 hover:!text-red-700 rounded-full hover:scale-110 transition-all duration-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                            {company.address && (
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4" />
                                <span>{company.address}</span>
                              </div>
                            )}
                            {company.contact && (
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4" />
                                <span>{company.contact}</span>
                              </div>
                            )}
                          </div>
                          
                          {company.socialmedia && company.socialmedia.length > 0 && (
                            <div className="mt-3">
                              <div className="flex flex-wrap gap-2">
                                {company.socialmedia.map((link, index) => (
                                  <a
                                    key={index}
                                    href={link.startsWith('http') ? link : `https://${link}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    {new URL(link.startsWith('http') ? link : `https://${link}`).hostname}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Building className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-400 mb-4">No companies added yet</p>
                      <Button
                        onClick={() => {
                          setSelectedCompany(null);
                          setShowCompanyModal(true);
                        }}
                        variant="white"
                        size="sm"
                        className="rounded-full"
                      >
                        Add Your First Company
                      </Button>
                    </div>
                  )}
                </div>



                {/* Payment History & Earnings */}
                <div className="backdrop-blur-md bg-white/70 dark:bg-black/30 border border-white/20 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] p-6 hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.15)] transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent">Payment & Earnings</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Your financial overview and transaction history</p>
                    </div>
                    <Button
                      onClick={() => setShowPaymentHistory(!showPaymentHistory)}
                      variant="white"
                      size="sm"
                      className="flex items-center space-x-2 rounded-full"
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>{showPaymentHistory ? 'Hide History' : 'View History'}</span>
                    </Button>
                  </div>

                  {/* Earnings Summary */}
                  {earnings ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-white/30 dark:border-white/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Earnings</p>
                              <p className="text-3xl font-bold text-black dark:text-white">
                                LKR {typeof earnings.totalEarnings === 'number' ? earnings.totalEarnings.toFixed(2) : parseFloat(earnings.totalEarnings || '0').toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-white/30 dark:border-white/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Completed Payments</p>
                              <p className="text-3xl font-bold text-black dark:text-white">
                                {paymentHistory.filter(p => p.status === 'SUCCEEDED').length}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Earnings Growth Chart */}
                      {paymentHistory.length > 0 && (
                        <div className="bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-white/30 dark:border-white/20 mb-6">
                          <h3 className="text-lg font-bold text-black dark:text-white mb-4">Earnings Growth</h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart
                                data={paymentHistory
                                  .filter(p => p.status === 'SUCCEEDED')
                                  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                                  .reduce((acc: any[], payment, index) => {
                                    const amount = typeof payment.amount === 'number' ? payment.amount : parseFloat(payment.amount || '0');
                                    const date = new Date(payment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                    const lastTotal = index > 0 ? acc[acc.length - 1].total : 0;
                                    acc.push({
                                      date,
                                      amount,
                                      total: lastTotal + amount
                                    });
                                    return acc;
                                  }, [])
                                  .slice(-10)} // Show last 10 transactions
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                              >
                                <defs>
                                  <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#000000" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#000000" stopOpacity={0.05}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                                <XAxis 
                                  dataKey="date" 
                                  tick={{ fill: 'currentColor', fontSize: 12 }}
                                  className="text-gray-700 dark:text-gray-300"
                                />
                                <YAxis 
                                  tick={{ fill: 'currentColor', fontSize: 12 }}
                                  className="text-gray-700 dark:text-gray-300"
                                />
                                <Tooltip 
                                  contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                                  }}
                                  labelStyle={{ color: '#000', fontWeight: 'bold' }}
                                />
                                <Area 
                                  type="monotone" 
                                  dataKey="total" 
                                  stroke="#000000" 
                                  strokeWidth={2}
                                  fillOpacity={1} 
                                  fill="url(#earningsGradient)"
                                  name="Cumulative Earnings"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-white/30 dark:border-white/20 mb-6">
                      <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-400">No earnings data available yet</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Start accepting payments to see your earnings here</p>
                      </div>
                    </div>
                  )}

                  {/* Payment History */}
                  {showPaymentHistory && (
                    <div className="border-t border-white/20 dark:border-white/10 pt-6">
                      <h3 className="text-lg font-bold text-black dark:text-white mb-4">Payment History</h3>
                      
                      {paymentLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white mx-auto mb-3"></div>
                          <p className="text-gray-600 dark:text-gray-400">Loading payment history...</p>
                        </div>
                      ) : paymentHistory.length > 0 ? (
                        <>
                          <div className="space-y-3">
                            {paymentHistory.map((payment) => (
                              <div key={payment.id} className="bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-white/30 dark:border-white/20 hover:border-white/50 dark:hover:border-white/30 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3">
                                      <div className={`w-3 h-3 rounded-full ${
                                        payment.status === 'SUCCEEDED' ? 'bg-black dark:bg-white' : 
                                        payment.status === 'PENDING' ? 'bg-gray-500' : 
                                        payment.status === 'FAILED' ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-400'
                                      }`}></div>
                                      <div>
                                        <p className="text-black dark:text-white font-semibold">
                                            {payment.service?.title || 'Service Payment'}
                                          </p>
                                          <p className="text-sm text-gray-400">
                                            {new Date(payment.createdAt).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-bold text-black dark:text-white">
                                      {payment.currency} {typeof payment.amount === 'number' ? payment.amount.toFixed(2) : parseFloat(payment.amount || '0').toFixed(2)}
                                    </p>
                                    <p className={`text-sm font-semibold ${
                                      payment.status === 'SUCCEEDED' ? 'text-black dark:text-white' : 
                                      payment.status === 'PENDING' ? 'text-gray-600 dark:text-gray-400' : 
                                      payment.status === 'FAILED' ? 'text-gray-500 dark:text-gray-500' : 'text-gray-400'
                                    }`}>
                                      {payment.status}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Pagination */}
                          {totalPaymentPages > 1 && (
                            <div className="flex items-center justify-center space-x-4 mt-6">
                              <Button
                                onClick={() => fetchPaymentHistory(paymentPage - 1)}
                                disabled={paymentPage <= 1}
                                variant="white"
                                size="sm"
                                className="flex items-center space-x-1 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <ChevronLeft className="h-4 w-4" />
                                <span>Previous</span>
                              </Button>
                              
                              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                Page {paymentPage} of {totalPaymentPages}
                              </span>
                              
                              <Button
                                onClick={() => fetchPaymentHistory(paymentPage + 1)}
                                disabled={paymentPage >= totalPaymentPages}
                                variant="white"
                                size="sm"
                                className="flex items-center space-x-1 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <span>Next</span>
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 dark:text-gray-400 mb-2">No payment history yet</p>
                          <p className="text-sm text-gray-500 dark:text-gray-500">Payments from your services will appear here</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Recent Reviews */}
                {providerProfile.reviews && providerProfile.reviews.length > 0 && (
                  <div className="bg-black/20 backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-semibold text-white">Recent Reviews</h2>
                        <p className="text-sm text-gray-400">
                          Latest feedback from your clients
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            <span className="text-lg font-bold text-white">
                              {providerProfile.averageRating?.toFixed(1) || 'N/A'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">{providerProfile.totalReviews || 0} reviews</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      {providerProfile.reviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="group hover:bg-white/5 -mx-3 px-3 py-4 rounded-xl transition-colors duration-200">
                          <div className="flex items-start space-x-4">
                            {review.reviewer.imageUrl ? (
                              <img
                                src={review.reviewer.imageUrl}
                                alt={`${review.reviewer.firstName} ${review.reviewer.lastName}`}
                                className="w-12 h-12 rounded-full object-cover border-2 border-white/20 group-hover:border-blue-400/50 transition-colors duration-200"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm border-2 border-white/20 group-hover:border-blue-400/50 transition-colors duration-200">
                                {(review.reviewer.firstName || '').charAt(0)}{(review.reviewer.lastName || '').charAt(0)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-white text-base">
                                    {review.reviewer.firstName} {review.reviewer.lastName}
                                  </h4>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <div className="flex items-center space-x-0.5">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`h-4 w-4 ${
                                            i < review.rating 
                                              ? 'text-yellow-400 fill-current' 
                                              : 'text-gray-600'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm font-medium text-yellow-300">
                                      {review.rating}.0
                                    </span>
                                    <span className="text-sm text-gray-500">•</span>
                                    <span className="text-sm text-gray-400">
                                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <blockquote className="text-gray-300 text-sm leading-relaxed border-l-3 border-blue-400/50 pl-4 italic">
                                "{review.comment}"
                              </blockquote>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* View All Reviews Button */}
                    {providerProfile.reviews.length > 3 && (
                      <div className="pt-4 border-t border-gray-100 mt-6">
                        <Button
                          variant="outline"
                          className="w-full justify-center flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                        >
                          <span>View All {providerProfile.totalReviews || providerProfile.reviews.length} Reviews</span>
                          <Star className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              )
            ) : user.role === 'PROVIDER' && !providerProfile ? (
              /* Loading provider data */
              <div className="bg-black/50 backdrop-blur-lg rounded-xl border border-gray-800 p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-gray-300">Loading provider profile...</p>
              </div>
            ) : (
              /* USER role content */
              <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-black-900 border border-gray-700 rounded-xl p-8 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-600">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white mb-2">Welcome to Zia!</h2>
                    <p className="text-gray-400 mb-6">
                      You're currently a user on our platform. Upgrade to become a service provider
                      to offer your services and start earning!
                    </p>
                    <Button
                      onClick={handleBecomeProvider}
                      size="lg"
                      className="flex items-center space-x-2 mx-auto px-6 py-3 text-base font-semibold bg-white hover:bg-gray-100 text-black border-2 border-gray hover:border-white/60 rounded-full backdrop-blur-md transition-all duration-300 shadow-[0_8px_24px_0_rgba(0,0,0,0.15)] hover:shadow-[0_12px_32px_0_rgba(0,0,0,0.25)] hover:scale-105 hover:-translate-y-1"
                    >
                      <UserPlus className="h-5 w-5" />
                      <span>Become a Service Provider</span>
                    </Button>
                  </div>
                </div>

                {/* Reviews Section with Dropdown */}
                {(customerReviews.length > 0 || (user.role === 'PROVIDER' && serviceReviews.length > 0)) && (
                  <div className="backdrop-blur-md bg-white/70 dark:bg-black/30 border border-white/20 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] p-6 hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.15)] transition-all duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                      <div>
                        <h2 className="text-xl font-bold bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent">My Reviews</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          {selectedReviewType === 'customer'
                            ? 'Feedback received from service providers'
                            : 'Customer feedback on your services'
                          }
                        </p>
                      </div>

                      {/* Review Type Dropdown */}
                      <div className="relative">
                        <select
                          value={selectedReviewType}
                          onChange={(e) => setSelectedReviewType(e.target.value as 'customer' | 'service')}
                          className="px-4 py-2 pr-8 bg-white/80 dark:bg-black/60 border border-white/30 dark:border-white/20 rounded-xl text-sm font-medium text-black dark:text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-all duration-200 hover:bg-white/90 dark:hover:bg-black/70 appearance-none"
                        >
                          {customerReviews.length > 0 && (
                            <option value="customer" className="bg-white dark:bg-black text-black dark:text-white">⭐ Reviews from Providers</option>
                          )}
                          {user.role === 'PROVIDER' && serviceReviews.length > 0 && (
                            <option value="service" className="bg-white dark:bg-black text-black dark:text-white">Reviews from Customers</option>
                          )}
                        </select>
                        <ChevronRight className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black dark:text-white h-4 w-4 pointer-events-none rotate-90" />
                      </div>
                    </div>

                    {reviewsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white mx-auto mb-3"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading reviews...</p>
                      </div>
                    ) : selectedReviewType === 'customer' && customerReviews.length > 0 ? (
                      <div className="space-y-6">
                        {customerReviews.slice(0, 5).map((review, index) => (
                          <div key={review.id || index} className="group border border-white/20 dark:border-white/10 rounded-xl p-4 bg-white/30 dark:bg-black/20 backdrop-blur-sm hover:border-white/40 dark:hover:border-white/20 transition-all duration-300">
                            <div className="flex items-start space-x-4">
                              {review.reviewer?.imageUrl ? (
                                <img
                                  src={review.reviewer.imageUrl}
                                  alt={`${review.reviewer?.firstName || 'Provider'} ${review.reviewer?.lastName || ''}`}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-white/40 dark:border-white/30"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold text-sm border-2 border-white/40 dark:border-white/30">
                                  {((review.reviewer?.firstName || 'P').charAt(0) || 'P').toUpperCase()}
                                  {((review.reviewer?.lastName || '').charAt(0) || 'R').toUpperCase()}
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <h4 className="font-semibold text-black dark:text-white text-base">
                                      {review.reviewer?.firstName || 'Provider'} {review.reviewer?.lastName || ''}
                                    </h4>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <div className="flex items-center space-x-1">
                                        {[...Array(5)].map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`h-4 w-4 ${
                                              i < (review.rating || 0)
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-300 dark:text-gray-600'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                                        {review.rating || 0}.0
                                      </span>
                                      <span className="text-sm text-gray-500">• Provider</span>
                                    </div>
                                    <div className="flex items-center mt-1">
                                      <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric'
                                        }) : 'N/A'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <blockquote className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed border-l-4 border-blue-500/30 pl-4 italic bg-white/50 dark:bg-black/30 p-3 rounded-r-lg">
                                    "{review.comment || 'No comment provided'}"
                                  </blockquote>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {customerReviews.length > 5 && (
                          <div className="text-center pt-4 border-t border-white/20 dark:border-white/10">
                            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                              Showing 5 of {customerReviews.length} reviews
                            </span>
                          </div>
                        )}
                      </div>
                    ) : selectedReviewType === 'service' && serviceReviews.length > 0 ? (
                      <div className="space-y-6">
                        {serviceReviews.slice(0, 5).map((review, index) => (
                          <div key={review.id || index} className="group border border-white/20 dark:border-white/10 rounded-xl p-4 bg-white/30 dark:bg-black/20 backdrop-blur-sm hover:border-white/40 dark:hover:border-white/20 transition-all duration-300">
                            <div className="flex items-start space-x-4">
                              <img
                                src={review.clientAvatar || `https://picsum.photos/seed/${review.reviewerId}/60/60`}
                                alt={review.clientName}
                                className="w-12 h-12 rounded-full object-cover border-2 border-white/40 dark:border-white/30"
                                onError={(e) => {
                                  e.currentTarget.src = `https://picsum.photos/seed/${review.reviewerId}/60/60`;
                                }}
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <h4 className="font-semibold text-black dark:text-white text-base">
                                      {review.clientName || 'Anonymous Customer'}
                                    </h4>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <div className="flex items-center space-x-1">
                                        {[...Array(5)].map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`h-4 w-4 ${
                                              i < (review.rating || 0)
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-300 dark:text-gray-600'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                                        {review.rating || 0}.0
                                      </span>
                                      <span className="text-sm text-gray-500">•</span>
                                      <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {typeof review.service === 'object' ? review.service?.title : review.service || 'Service'}
                                      </span>
                                    </div>
                                    <div className="flex items-center mt-1">
                                      <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {review.date || (review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric'
                                        }) : 'N/A')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <blockquote className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed border-l-4 border-blue-500/30 pl-4 italic bg-white/50 dark:bg-black/30 p-3 rounded-r-lg">
                                    "{review.comment || 'No comment provided'}"
                                  </blockquote>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {serviceReviews.length > 5 && (
                          <div className="text-center pt-4 border-t border-white/20 dark:border-white/10">
                            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                              Showing 5 of {serviceReviews.length} reviews
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Star className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-black dark:text-white mb-2">No reviews yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {selectedReviewType === 'customer'
                            ? 'Reviews from service providers will appear here once you receive feedback.'
                            : 'Reviews from customers will appear here once you receive feedback on your services.'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Customer Payment History */}
                <div className="bg-black/30 backdrop-blur-xl rounded-xl shadow-2xl p-6 border border-white/20 relative overflow-hidden">
                  {/* Animated background glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 blur-3xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-semibold text-white drop-shadow-lg">Payment History</h2>
                        <p className="text-sm text-gray-400">Your service payment history</p>
                      </div>
                      <Button
                        onClick={() => setShowPaymentHistory(!showPaymentHistory)}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-400/30 hover:border-blue-400/50 backdrop-blur-sm"
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>{showPaymentHistory ? 'Hide History' : 'View History'}</span>
                      </Button>
                    </div>

                    {/* Payment History */}
                    {showPaymentHistory && (
                      <div className="border-t border-white/10 pt-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Recent Payments</h3>
                        
                        {paymentLoading ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-3"></div>
                            <p className="text-gray-400">Loading payment history...</p>
                          </div>
                        ) : paymentHistory.length > 0 ? (
                          <>
                            <div className="space-y-3">
                              {paymentHistory.map((payment) => (
                                <div key={payment.id} className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-3">
                                        <div className={`w-3 h-3 rounded-full ${
                                          payment.status === 'SUCCEEDED' ? 'bg-green-400' : 
                                          payment.status === 'PENDING' ? 'bg-yellow-400' : 
                                          payment.status === 'FAILED' ? 'bg-red-400' : 'bg-gray-400'
                                        }`}></div>
                                        <div>
                                          <p className="text-white font-medium">
                                            {payment.service?.title || 'Service Payment'}
                                          </p>
                                          <p className="text-sm text-gray-400">
                                            {payment.provider?.user?.firstName && payment.provider?.user?.lastName 
                                              ? `Provider: ${payment.provider.user.firstName} ${payment.provider.user.lastName}`
                                              : 'Service Provider'
                                            }
                                          </p>
                                          <p className="text-sm text-gray-400">
                                            {new Date(payment.createdAt).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-lg font-bold text-white">
                                        LKR {typeof payment.amount === 'number' ? payment.amount.toFixed(2) : parseFloat(payment.amount || '0').toFixed(2)}
                                      </p>
                                      <p className={`text-sm font-medium ${
                                        payment.status === 'SUCCEEDED' ? 'text-green-400' : 
                                        payment.status === 'PENDING' ? 'text-yellow-400' : 
                                        payment.status === 'FAILED' ? 'text-red-400' : 'text-gray-400'
                                      }`}>
                                        {payment.status}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Pagination */}
                            {totalPaymentPages > 1 && (
                              <div className="flex items-center justify-center space-x-4 mt-6">
                                <Button
                                  onClick={() => fetchPaymentHistory(paymentPage - 1)}
                                  disabled={paymentPage <= 1}
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 text-white border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                  <span>Previous</span>
                                </Button>
                                
                                <span className="text-sm text-gray-400">
                                  Page {paymentPage} of {totalPaymentPages}
                                </span>
                                
                                <Button
                                  onClick={() => fetchPaymentHistory(paymentPage + 1)}
                                  disabled={paymentPage >= totalPaymentPages}
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 text-white border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <span>Next</span>
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-8">
                            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-400 mb-2">No payment history yet</p>
                            <p className="text-sm text-gray-500">Payments for services you book will appear here</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {/* Update Service Modal */}
      {showUpdateServiceModal && selectedService && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-black/40 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <h3 className="text-xl font-semibold text-white">Update Service</h3>
              <button
                onClick={() => {
                  setShowUpdateServiceModal(false);
                  setSelectedService(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
                title="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Service Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Service Title *
                </label>
                <input
                  type="text"
                  value={serviceFormData.title}
                  onChange={(e) => handleServiceFormChange('title', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm"
                  placeholder="Enter service title"
                />
              </div>

              {/* Service Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={serviceFormData.description}
                  onChange={(e) => handleServiceFormChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm"
                  placeholder="Describe your service..."
                />
              </div>

              {/* Price and Currency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    value={serviceFormData.price}
                    onChange={(e) => handleServiceFormChange('price', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Currency
                  </label>
                  <select
                    value={serviceFormData.currency}
                    onChange={(e) => handleServiceFormChange('currency', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white backdrop-blur-sm"
                    title="Select currency"
                  >
                    <option value="LKR" className="bg-gray-800 text-white">LKR</option>
                    <option value="USD" className="bg-gray-800 text-white">USD</option>
                    <option value="EUR" className="bg-gray-800 text-white">EUR</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={serviceFormData.tags.join(', ')}
                  onChange={(e) => handleServiceFormChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm"
                  placeholder="web development, design, frontend"
                />
              </div>

              {/* Working Time */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Working Time (comma-separated)
                </label>
                <input
                  type="text"
                  value={serviceFormData.workingTime.join(', ')}
                  onChange={(e) => handleServiceFormChange('workingTime', e.target.value.split(',').map(time => time.trim()).filter(time => time))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm"
                  placeholder="Monday-Friday 9AM-5PM, Weekends flexible"
                  title="Working time schedule"
                />
              </div>

              {/* Location Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Service Location
                </label>
                <LocationPickerAdvanced
                  value={serviceFormData.latitude && serviceFormData.longitude ? {
                    latitude: serviceFormData.latitude,
                    longitude: serviceFormData.longitude,
                    address: serviceFormData.address
                  } : undefined}
                  onChange={handleLocationChange}
                  className="w-full"
                  showMap={true}
                />
              </div>

              {/* Images */}
              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Upload Images
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white backdrop-blur-sm"
                    disabled={uploadingImages}
                    title="Upload service images"
                  />
                  {uploadingImages && (
                    <div className="flex items-center space-x-2 text-blue-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span className="text-sm">Uploading images...</span>
                    </div>
                  )}
                  {serviceFormData.images.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">Uploaded images:</p>
                      <div className="flex flex-wrap gap-2">
                        {serviceFormData.images.map((imageUrl, index) => (
                          <div key={index} className="relative">
                            <img
                              src={imageUrl}
                              alt={`Service image ${index + 1}`}
                              className="w-16 h-16 object-cover rounded border border-white/20"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={serviceFormData.isActive}
                  onChange={(e) => handleServiceFormChange('isActive', e.target.checked)}
                  className="rounded border-white/20 bg-white/10 text-blue-400 focus:ring-blue-400 focus:ring-offset-0"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-300">
                  Service is active and visible to clients
                </label>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/20 bg-black/20 backdrop-blur-sm rounded-b-xl flex space-x-3">
              <Button
                onClick={() => {
                  setShowUpdateServiceModal(false);
                  setSelectedService(null);
                }}
                variant="outline"
                className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50 backdrop-blur-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateService}
                className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 border border-purple-400/20"
                disabled={uploadingImages}
              >
                <Save className="h-4 w-4" />
                <span>{uploadingImages ? 'Uploading...' : 'Update Service'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      <EditProfileModal 
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        onSuccess={handleUpdateProfile}
        user={user}
      />

      {providerProfile && (
        <EditProviderModal 
          isOpen={showEditProviderModal}
          onClose={() => setShowEditProviderModal(false)}
          onSuccess={handleProviderUpdated}
          provider={providerProfile}
        />
      )}

      {/* Company Modal */}
      <CompanyModal 
        isOpen={showCompanyModal}
        onClose={() => {
          setShowCompanyModal(false);
          setSelectedCompany(null);
        }}
        onSuccess={handleCompanySuccess}
        company={selectedCompany}
      />

      {/* Delete Company Confirmation Modal */}
      {showDeleteCompanyConfirmation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black/40 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-500/20 backdrop-blur-sm rounded-full border border-red-400/30">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Delete Company</h3>
              </div>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this company? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowDeleteCompanyConfirmation(false);
                    setCompanyToDelete(null);
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50 backdrop-blur-sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteCompany}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white border border-red-400/30"
                >
                  Delete Company
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Provider Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black/40 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-500/20 backdrop-blur-sm rounded-full border border-red-400/30">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Delete Provider Profile</h3>
              </div>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete your provider profile? This action cannot be undone. 
                All your services will be deactivated and you'll need to recreate your provider profile if you want to become a provider again.
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50 backdrop-blur-sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteProvider}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white border border-red-400/30"
                >
                  Delete Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <MinimalFooter />

      <Toaster />
      </div>
    </div>
  );
}
