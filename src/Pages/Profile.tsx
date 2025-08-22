import { useState, useEffect, useCallback, useMemo } from 'react';
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
  Upload
} from 'lucide-react';
import Button from '../components/Button';
import { userApi } from '../api/userApi';
import { serviceApi, type ServiceResponse } from '../api/serviceApi';
import type { UserProfile, ProviderProfile, Company } from '../api/userApi';
import EditProviderModal from '../components/Profile/EditProviderModal';
import EditProfileModal from '../components/Profile/EditProfileModal';
import CompanyModal from '../components/Profile/CompanyModal';
import { uploadMultipleImages } from '../utils/imageUpload';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const socialMediaLinks = [
  { platform: 'Twitter', username: '@user123', url: 'https://twitter.com/user123', icon: '🐦' },
  { platform: 'Facebook', username: 'user123', url: 'https://facebook.com/user123', icon: '📘' },
  { platform: 'Instagram', username: '@user123', url: 'https://instagram.com/user123', icon: '📸' },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user: authUser, isLoading: authLoading, updateUser } = useAuth();
  const [localUser, setLocalUser] = useState<UserProfile | null>(null);
  const [showEditProviderModal, setShowEditProviderModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showDeleteCompanyConfirmation, setShowDeleteCompanyConfirmation] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);
  const [services, setServices] = useState<ServiceResponse[]>([]);
  
  // Use AuthContext user data and sync with local state for provider-specific data
  const user = authUser || localUser;
  const loading = authLoading;

  // Use useMemo to prevent unnecessary re-computations
  const isProvider = useMemo(() => user?.role === 'PROVIDER', [user?.role]);
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
    workingTime: [] as string[]
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

  // Replace the old fetchProfile useEffect with optimized version
  useEffect(() => {
    if (!authLoading && user) {
      fetchProviderData();
    }
  }, [authLoading, user, fetchProviderData]);

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
      workingTime: service.workingTime || []
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center mt-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center mt-16">
          <div className="text-center">
            <p className="text-red-600">Failed to load profile. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col" style={{ paddingLeft: '10px', paddingRight: '10px' }}>      
      <main className="flex-1 mx-[30px] px-4 sm:px-6 lg:px-8 mt-20 mb-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Banner */}
          <div className="relative h-36 bg-gradient-to-r from-blue-500 to-purple-600">
        <img
          src="https://4kwallpapers.com/images/walls/thumbs_3t/8728.jpg"
          alt="Profile Banner"
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {/* Avatar - half above the banner */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16 z-10">
          <div className="relative">
            {user.imageUrl && user.imageUrl.trim() ? (
          <img
            src={user.imageUrl}
            alt={`${user.firstName} ${user.lastName}`}
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
              const defaultAvatar = img.nextElementSibling as HTMLElement;
              if (defaultAvatar) defaultAvatar.style.display = 'flex';
            }}
          />
            ) : null}
            <div
          className={`w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold ${
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
          <div className="px-4 sm:px-6 pb-6 ">
        <div className="flex flex-col lg:flex-row items-center lg:items-end lg:space-x-8 mt-0">
          {/* Spacer for avatar */}
          <div className="w-32 h-16 lg:hidden" />
          {/* Info & Actions */}
          <div className="flex-1 text-center lg:text-left ml-5 mt-13 lg:mt-0">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-4 mb-1">
              {user.firstName || 'First'} {user.lastName || 'Last'}
            </h1>
            <p className="text-gray-600 text-lg mb-1">{user.email}</p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-2">
              <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              user.role === 'PROVIDER'
                ? 'bg-green-100 text-green-800'
                : 'bg-blue-100 text-blue-800'
            }`}
              >
            {user.role === 'PROVIDER' ? 'Service Provider' : 'User'}
              </span>
              {user.isEmailVerified && (
            <span className="flex items-center text-green-600">
              <Shield className="h-5 w-5 mr-1" />
              <span className="text-sm">Verified</span>
            </span>
              )}
              {user.phone && (
            <span className="flex items-center text-gray-500">
              <Phone className="h-4 w-4 mr-1" />
              <span className="text-xs">{user.phone}</span>
            </span>
              )}
              {user.location && (
            <span className="flex items-center text-gray-500">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-xs">{user.location}</span>
            </span>
              )}
            </div>
          </div>
          {/* Edit Profile Button */}
          <Button
            onClick={() => setShowEditProfileModal(true)}
            variant="outline"
            className="flex items-center space-x-2 px-4 py-2 text-base font-medium"
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
              className="flex items-center space-x-2 px-6 py-3 text-base font-medium"
              size="lg"
            >
              <Edit2 className="h-5 w-5" />
              <span>Edit Provider</span>
            </Button>
            <Button
              onClick={() => setShowDeleteConfirmation(true)}
              variant="outline"
              className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50 px-6 py-3 text-base font-medium"
              size="lg"
            >
              <Trash2 className="h-5 w-5" />
              <span>Delete Provider</span>
            </Button>
          </div>
            )}
            {/* Company Info in Header */}
            {providerProfile && providerProfile.companies && providerProfile.companies.length > 0 && (
          <div className="flex items-center mt-4">
            {providerProfile.companies[0].logo ? (
              <img
                src={providerProfile.companies[0].logo}
                alt={providerProfile.companies[0].name}
                className="w-10 h-10 rounded-full object-cover mr-3"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                <Building className="h-5 w-5 text-gray-400" />
              </div>
            )}
            <span className="text-sm text-gray-600">{providerProfile.companies[0].name}</span>
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
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                </div>
                
                {user.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-900">{user.phone}</p>
                    </div>
                  </div>
                )}
                
                {user.location && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-gray-900">{user.location}</p>
                    </div>
                  </div>
                )}

                {user.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-gray-900">{user.address}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Member since</p>
                    <p className="text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {user.socialmedia && user.socialmedia.length > 0 && (
                  <div className="flex items-start space-x-3">
                    <ExternalLink className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Social Media</p>
                      <div className="space-y-2">
                        {user.socialmedia.map((link, index) => {
                          const url = link.startsWith('http') ? link : `https://${link}`;
                          const username = url.split('/').pop(); // Extract username from URL
                          const platformIcon = url.includes('twitter') || url.includes('x.com')
    ? <i className="fab fa-twitter text-black"></i>
    : url.includes('linkedin')
    ? <i className="fab fa-linkedin text-black"></i>
    : url.includes('instagram')
    ? <i className="fab fa-instagram text-black"></i>
    : url.includes('github')
    ? <i className="fab fa-github text-black"></i>
    : url.includes('portfolio') || url.includes('website')
    ? <i className="fas fa-globe text-black"></i>
    : <i className="fas fa-link text-black"></i>;

  return (
    <a
      key={index}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
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
          </div>

          {/* Right Column - Provider-specific content */}
          <div className="lg:col-span-2">
            {user.role === 'PROVIDER' && providerProfile ? (
              // Check if provider is verified
              providerProfile.isVerified === false ? (
                /* Unverified Provider */
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="p-3 bg-yellow-100 rounded-full inline-flex mb-4">
                      <Clock className="h-12 w-12 text-yellow-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Verification in Progress</h2>
                    <p className="text-gray-600 mb-6">
                      Your provider profile has been submitted and is currently under review. 
                      Our team is verifying your information and credentials.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <h3 className="font-semibold text-yellow-900 mb-2">What's Next?</h3>
                      <ul className="text-sm text-yellow-800 space-y-1 text-left">
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
                        className="flex items-center space-x-2 mx-auto"
                      >
                        <Edit2 className="h-5 w-5" />
                        <span>Edit Profile</span>
                      </Button>
                      <Button
                        onClick={() => setShowDeleteConfirmation(true)}
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50"
                      >
                        Cancel Application
                      </Button>
                    </div>
                    
                    {/* Show basic provider info */}
                    <div className="mt-8 text-left">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Submitted Information</h3>
                      <div className="space-y-4">
                        {providerProfile.bio && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">Bio</h4>
                            <p className="text-gray-600 text-sm">{providerProfile.bio}</p>
                          </div>
                        )}
                        
                        {providerProfile.skills && providerProfile.skills.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {providerProfile.skills.map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {providerProfile.qualifications && providerProfile.qualifications.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Qualifications</h4>
                            <div className="space-y-1">
                              {providerProfile.qualifications.map((qualification, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <Award className="h-4 w-4 text-blue-500" />
                                  <span className="text-gray-600 text-sm">{qualification}</span>
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
                {/* Provider Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-lg p-6 border border-yellow-200 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-md">
                        <Star className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {providerProfile.averageRating?.toFixed(1) || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600 font-medium">Average Rating</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(providerProfile.averageRating || 0)
                              ? 'text-yellow-500 fill-current'
                              : 'text-yellow-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border border-blue-200 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {providerProfile.totalReviews || 0}
                        </p>
                        <p className="text-sm text-gray-600 font-medium">Total Reviews</p>
                      </div>
                    </div>
                    <p className="text-xs text-blue-700 font-medium">
                      {providerProfile.totalReviews && providerProfile.totalReviews > 0 
                        ? `${((providerProfile.averageRating || 0) / 5 * 100).toFixed(0)}% satisfaction`
                        : 'No reviews yet'
                      }
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border border-green-200 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-md">
                        <Briefcase className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {services.length}
                        </p>
                        <p className="text-sm text-gray-600 font-medium">Services Listed</p>
                      </div>
                    </div>
                    <p className="text-xs text-green-700 font-medium">
                      {services.filter(s => s.isActive).length} active • {services.filter(s => !s.isActive).length} inactive
                    </p>
                  </div>
                </div>

                {/* Bio */}
                {providerProfile.bio && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">About Me</h2>
                        <p className="text-sm text-gray-500">Professional background and expertise</p>
                      </div>
                    </div>
                    <div className="prose prose-gray max-w-none">
                      <blockquote className="border-l-4 border-blue-400 pl-6 py-2 bg-gradient-to-r from-blue-50 to-transparent rounded-r-lg">
                        <p className="text-gray-700 leading-relaxed text-base italic">
                          "{providerProfile.bio}"
                        </p>
                      </blockquote>
                    </div>
                  </div>
                )}

                {/* Skills */}
                {providerProfile.skills && providerProfile.skills.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Skills & Expertise</h2>
                        <p className="text-sm text-gray-500">
                          {providerProfile.skills.length} skill{providerProfile.skills.length !== 1 ? 's' : ''} listed
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {providerProfile.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="group px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 rounded-full text-sm font-medium border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-default"
                        >
                          <span className="relative">
                            {skill}
                            <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
                          </span>
                        </span>
                      ))}
                  </div>
                  </div>
                )}

                {/* Qualifications */}
                {providerProfile.qualifications && providerProfile.qualifications.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Qualifications & Certifications</h2>
                        <p className="text-sm text-gray-500">
                          Professional credentials and achievements
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {providerProfile.qualifications.map((qualification, index) => (
                        <div key={index} className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border border-transparent hover:border-blue-200">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200">
                            <Award className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium leading-relaxed group-hover:text-blue-900 transition-colors duration-200">
                              {qualification}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Create Service Button */}
                <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-xl shadow-lg p-8 border border-gray-200">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Plus className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to offer a new service?</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                      Create and publish your service to start getting bookings from clients. 
                      Showcase your skills and grow your business with Zia.
                    </p>
                    <Button
                      onClick={() => {
                        console.log('Navigating to create service...');
                        navigate('/create-service');
                      }}
                      size="lg"
                      className="flex items-center space-x-2 mx-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Create New Service</span>
                    </Button>
                  </div>
                </div>

                {/* Services */}
                {servicesLoading ? (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">My Services</h2>
                        <p className="text-sm text-gray-500">Manage and view your service offerings</p>
                      </div>
                    </div>
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                      <p className="text-gray-500">Loading services...</p>
                    </div>
                  </div>
                ) : services.length > 0 ? (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">My Services</h2>
                        <p className="text-sm text-gray-500">
                          {services.length} service{services.length !== 1 ? 's' : ''} • {services.filter(s => s.isActive).length} active
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {services.map((service) => (
                        <div 
                          key={service.id} 
                          className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                        >
                          {/* Service Image */}
                          <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                            {service.images && service.images.length > 0 ? (
                              <img 
                                src={service.images[0]} 
                                alt={service.title || 'Service image'}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onClick={() => navigate(`/service/${service.id}`)}
                                onError={(e) => {
                                  // Fallback to gradient background if image fails
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center">
                                <div className="text-center text-gray-500">
                                  <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                  <p className="text-sm font-medium">No image</p>
                                </div>
                              </div>
                            )}
                            
                            {/* Status Badge */}
                            <div className="absolute top-3 left-3">
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
                                service.isActive 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                  : 'bg-gray-100 text-gray-600 border border-gray-200'
                              }`}>
                                {service.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            
                            {/* Edit Button */}
                            <div className="absolute top-3 right-3">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditService(service);
                                }}
                                variant="white"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg hover:shadow-xl"
                                title="Edit Service"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Service Content */}
                          <div 
                            className="p-5"
                            onClick={() => navigate(`/service/${service.id}`)}
                          >
                            <div className="mb-3">
                              <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                {service.title || 'Untitled Service'}
                              </h3>
                              <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                                {service.description || 'No description available'}
                              </p>
                            </div>

                            {/* Price */}
                            <div className="mb-4">
                              <span className="text-2xl font-bold text-gray-900">
                                {service.currency} {service.price}
                              </span>
                              <span className="text-sm text-gray-500 ml-1">per service</span>
                            </div>

                            {/* Tags */}
                            {service.tags && service.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {service.tags.slice(0, 3).map((tag, index) => (
                                  <span 
                                    key={index} 
                                    className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {service.tags.length > 3 && (
                                  <span className="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
                                    +{service.tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Service Stats */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm font-medium text-gray-700">--</span>
                                <span className="text-xs text-gray-500">(No reviews yet)</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                Created {new Date(service.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No services created yet</h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Start showcasing your skills by creating your first service. It's easy and takes just a few minutes!
                      </p>
                      <Button
                        onClick={() => navigate('/create-service')}
                        className="flex items-center space-x-2 mx-auto"
                      >
                        <Plus className="h-5 w-5" />
                        <span>Create Your First Service</span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Companies */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Companies</h2>
                    <Button
                      onClick={() => {
                        setSelectedCompany(null);
                        setShowCompanyModal(true);
                      }}
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Company</span>
                    </Button>
                  </div>
                  
                  {providerProfile.companies && providerProfile.companies.length > 0 ? (
                    <div className="space-y-4">
                      {providerProfile.companies.map((company) => (
                        <div key={company.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              {company.logo ? (
                                <img
                                  src={company.logo}
                                  alt={company.name}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <Building className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <h3 className="font-semibold text-gray-900">{company.name}</h3>
                                {company.description && (
                                  <p className="text-gray-600 text-sm mt-1">{company.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleEditCompany(company)}
                                variant="ghost"
                                size="sm"
                                className="p-2"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteCompanyClick(company.id)}
                                variant="ghost"
                                size="sm"
                                className="p-2 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
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
                                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
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
                      <p className="text-gray-500 mb-4">No companies added yet</p>
                      <Button
                        onClick={() => {
                          setSelectedCompany(null);
                          setShowCompanyModal(true);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Add Your First Company
                      </Button>
                    </div>
                  )}
                </div>

                {/* Recent Reviews */}
                {providerProfile.reviews && providerProfile.reviews.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Recent Reviews</h2>
                        <p className="text-sm text-gray-500">
                          Latest feedback from your clients
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            <span className="text-lg font-bold text-gray-900">
                              {providerProfile.averageRating?.toFixed(1) || 'N/A'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{providerProfile.totalReviews || 0} reviews</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      {providerProfile.reviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="group hover:bg-gray-50 -mx-3 px-3 py-4 rounded-xl transition-colors duration-200">
                          <div className="flex items-start space-x-4">
                            {review.reviewer.imageUrl ? (
                              <img
                                src={review.reviewer.imageUrl}
                                alt={`${review.reviewer.firstName} ${review.reviewer.lastName}`}
                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 group-hover:border-blue-200 transition-colors duration-200"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm border-2 border-gray-100 group-hover:border-blue-200 transition-colors duration-200">
                                {(review.reviewer.firstName || '').charAt(0)}{(review.reviewer.lastName || '').charAt(0)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-gray-900 text-base">
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
                                              : 'text-gray-300'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm font-medium text-yellow-600">
                                      {review.rating}.0
                                    </span>
                                    <span className="text-sm text-gray-400">•</span>
                                    <span className="text-sm text-gray-500">
                                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <blockquote className="text-gray-700 text-sm leading-relaxed border-l-3 border-blue-200 pl-4 italic">
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
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading provider profile...</p>
              </div>
            ) : (
              /* USER role content */
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="max-w-md mx-auto">
                  <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to Zia!</h2>
                  <p className="text-gray-600 mb-6">
                    You're currently a user on our platform. Upgrade to become a service provider 
                    to offer your services and start earning!
                  </p>
                  <Button
                    onClick={handleBecomeProvider}
                    size="lg"
                    className="flex items-center space-x-2 mx-auto"
                  >
                    <UserPlus className="h-5 w-5" />
                    <span>Become a Service Provider</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {/* Update Service Modal */}
      {showUpdateServiceModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Update Service</h3>
              <button
                onClick={() => {
                  setShowUpdateServiceModal(false);
                  setSelectedService(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Service Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Title *
                </label>
                <input
                  type="text"
                  value={serviceFormData.title}
                  onChange={(e) => handleServiceFormChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter service title"
                />
              </div>

              {/* Service Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={serviceFormData.description}
                  onChange={(e) => handleServiceFormChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your service..."
                />
              </div>

              {/* Price and Currency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    value={serviceFormData.price}
                    onChange={(e) => handleServiceFormChange('price', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={serviceFormData.currency}
                    onChange={(e) => handleServiceFormChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="LKR">LKR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={serviceFormData.tags.join(', ')}
                  onChange={(e) => handleServiceFormChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="web development, design, frontend"
                />
              </div>

              {/* Working Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Working Time (comma-separated)
                </label>
                <input
                  type="text"
                  value={serviceFormData.workingTime.join(', ')}
                  onChange={(e) => handleServiceFormChange('workingTime', e.target.value.split(',').map(time => time.trim()).filter(time => time))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Monday-Friday 9AM-5PM, Weekends flexible"
                />
              </div>

              {/* Images */}
              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Images
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={uploadingImages}
                  />
                  {uploadingImages && (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm">Uploading images...</span>
                    </div>
                  )}
                  {serviceFormData.images.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Uploaded images:</p>
                      <div className="flex flex-wrap gap-2">
                        {serviceFormData.images.map((imageUrl, index) => (
                          <div key={index} className="relative">
                            <img
                              src={imageUrl}
                              alt={`Service image ${index + 1}`}
                              className="w-16 h-16 object-cover rounded border"
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
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Service is active and visible to clients
                </label>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex space-x-3">
              <Button
                onClick={() => {
                  setShowUpdateServiceModal(false);
                  setSelectedService(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateService}
                className="flex-1 flex items-center justify-center space-x-2"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Company</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this company? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowDeleteCompanyConfirmation(false);
                    setCompanyToDelete(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteCompany}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Provider Profile</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete your provider profile? This action cannot be undone. 
                All your services will be deactivated and you'll need to recreate your provider profile if you want to become a provider again.
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteProvider}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
}