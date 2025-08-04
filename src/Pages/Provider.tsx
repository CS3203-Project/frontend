import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Star, 
  Award,
  Briefcase,
  ExternalLink,
  UserPlus,
  Clock,
  DollarSign,
  Camera,
  MessageCircle,
  ChevronRight,
  X
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { userApi } from '../api/userApi';
import type { UserProfile, ProviderProfile } from '../api/userApi';
import { serviceApi, type ServiceResponse } from '../api/serviceApi';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

export default function Provider() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);
  const [detailedServices, setDetailedServices] = useState<ServiceResponse[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [reviewFilter, setReviewFilter] = useState('all');
  const [showContactModal, setShowContactModal] = useState(false);

  const mockPortfolio = [
    {
      id: 'portfolio-1',
      title: 'E-commerce Platform',
      description: 'Complete e-commerce solution with inventory management, payment processing, and analytics dashboard.',
      images: ['https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80'],
      category: 'Web Development',
      completedDate: '2024-12-15',
      clientRating: 5,
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe', 'AWS']
    },
    {
      id: 'portfolio-2',
      title: 'Mobile Banking App UI',
      description: 'Modern and secure mobile banking application design with focus on user experience.',
      images: ['https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=600&q=80'],
      category: 'Design',
      completedDate: '2024-11-20',
      clientRating: 5,
      technologies: ['Figma', 'Adobe XD', 'Principle']
    }
  ];

  const mockReviews = [
    {
      id: 'review-1',
      clientName: 'John Smith',
      clientAvatar: 'https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?q=80&w=100&auto=format&fit=crop',
      rating: 5,
      comment: 'Excellent work! The project was delivered on time and exceeded expectations. Great communication throughout.',
      date: '2024-12-20',
      projectTitle: 'E-commerce Website Development',
      helpful: 12
    },
    {
      id: 'review-2',
      clientName: 'Maria Garcia',
      clientAvatar: 'https://images.unsplash.com/photo-1464863979621-258859e62245?w=100&auto=format&fit=crop',
      rating: 5,
      comment: 'Amazing work on our mobile app design. The user experience is intuitive and the design is modern.',
      date: '2024-12-18',
      projectTitle: 'Mobile App UI/UX Design',
      helpful: 8
    },
    {
      id: 'review-3',
      clientName: 'David Johnson',
      clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop',
      rating: 4,
      comment: 'Great developer with excellent technical skills. Very professional and responsive.',
      date: '2024-12-10',
      projectTitle: 'Custom Web Application',
      helpful: 6
    }
  ];

  // State for modal interactions (for future use)
  const [selectedService, setSelectedService] = useState<{
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    images: string[];
    isActive: boolean;
    tags?: string[];
    createdAt?: string;
  } | null>(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState<typeof mockPortfolio[0] | null>(null);
  
  // Suppress unused variable warnings for now
  void selectedService;
  void selectedPortfolio;

  const fetchDetailedServices = useCallback(async (providerId: string) => {
    try {
      setServicesLoading(true);
      const response = await serviceApi.getServices({ 
        providerId,
        isActive: undefined // Get both active and inactive services
      });
      setDetailedServices(response.data);
    } catch (error) {
      console.error('Failed to fetch detailed services:', error);
      // Fall back to basic service data from provider profile
      setDetailedServices([]);
    } finally {
      setServicesLoading(false);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const userData = await userApi.getProfile();
      setUser(userData);

      // If user is a provider, fetch provider profile
      if (userData.role === 'PROVIDER') {
        try {
          const providerData = await userApi.getProviderProfile();
          setProviderProfile(providerData);
          
          // Fetch detailed services for the provider
          if (providerData.id) {
            await fetchDetailedServices(providerData.id);
          }
        } catch (error) {
          console.error('Failed to fetch provider profile:', error);
        }
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [fetchDetailedServices]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleBecomeProvider = () => {
    navigate('/become-provider');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
        <Navbar />
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
        <Navbar />
        <div className="flex-1 flex items-center justify-center mt-16">
          <div className="text-center">
            <p className="text-red-600">Failed to load profile. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }
   return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 mb-8">
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
          {(user.firstName?.charAt(0) || 'U').toUpperCase()}
          {(user.lastName?.charAt(0) || 'S').toUpperCase()}
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
            </div>
            {/* Contact Button for verified providers */}
            {providerProfile && providerProfile.isVerified && (
              <div className="mt-4 lg:mt-0 flex justify-center lg:justify-end">
                <Button
                  onClick={() => setShowContactModal(true)}
                  size="default"
                  className="flex items-center space-x-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Contact Provider</span>
                </Button>
              </div>
            )}
            {/* Social Media Links */}
          </div>
        </div>
          </div>
        </div>

        {/* Only show tabs for verified providers */}
        {user.role === 'PROVIDER' && providerProfile && providerProfile.isVerified && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-wrap">
                {[
                  { id: 'overview', label: 'Overview', icon: <User className="w-4 h-4" /> },
                  { id: 'services', label: 'Services', icon: <DollarSign className="w-4 h-4" /> },
                  { id: 'portfolio', label: 'Portfolio', icon: <Camera className="w-4 h-4" /> },
                  { id: 'reviews', label: 'Reviews', icon: <Star className="w-4 h-4" /> },
                  { id: 'about', label: 'About', icon: <MessageCircle className="w-4 h-4" /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? "border-black text-black bg-gray-50"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.icon}
                    <span className="ml-2">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
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
                        {user.socialmedia.map((link, index) => (
                          <a
                            key={index}
                            href={link.startsWith('http') ? link : `https://${link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <ExternalLink className="h-3 w-3 mr-2" />
                            {link}
                          </a>
                        ))}
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
                /* Verified Provider - tabbed content */
                <div className="space-y-6">
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <>
                      {/* Provider Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                          <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-gray-900">
                            {providerProfile.averageRating?.toFixed(1) || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">Average Rating</p>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                          <Award className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-gray-900">
                            {providerProfile.totalReviews || 0}
                          </p>
                          <p className="text-sm text-gray-500">Total Reviews</p>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                          <Briefcase className="h-8 w-8 text-green-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-gray-900">
                            {detailedServices.length > 0 
                              ? detailedServices.length 
                              : (providerProfile.services?.length || 0)}
                          </p>
                          <p className="text-sm text-gray-500">Active Services</p>
                        </div>
                      </div>

                      {/* Bio */}
                      {providerProfile.bio && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                          <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                          <p className="text-gray-700">{providerProfile.bio}</p>
                        </div>
                      )}

                      {/* Skills */}
                      {providerProfile.skills && providerProfile.skills.length > 0 && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                          <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
                          <div className="flex flex-wrap gap-2">
                            {providerProfile.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Qualifications */}
                      {providerProfile.qualifications && providerProfile.qualifications.length > 0 && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                          <h2 className="text-xl font-semibold text-gray-900 mb-4">Qualifications</h2>
                          <div className="space-y-2">
                            {providerProfile.qualifications.map((qualification, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <Award className="h-4 w-4 text-blue-500" />
                                <span className="text-gray-700">{qualification}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recent Reviews */}
                      {mockReviews && mockReviews.length > 0 && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Recent Reviews</h2>
                            <button 
                              onClick={() => setActiveTab('reviews')}
                              className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors"
                            >
                              View All
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                          </div>
                          <div className="space-y-4">
                            {mockReviews.slice(0, 2).map((review) => (
                              <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                                <div className="flex items-start space-x-3">
                                  <img 
                                    src={review.clientAvatar} 
                                    alt={review.clientName}
                                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="font-semibold text-gray-900">{review.clientName}</span>
                                      <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`h-4 w-4 ${
                                              i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                    <p className="text-gray-700 text-sm mb-1">{review.comment}</p>
                                    <p className="text-xs text-gray-500">{review.date}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Services Tab */}
                  {activeTab === 'services' && (
                    <div>
                      {servicesLoading ? (
                        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <p className="text-gray-600">Loading services...</p>
                        </div>
                      ) : detailedServices && detailedServices.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {detailedServices.map((service) => (
                            <div 
                              key={service.id}
                              className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
                              onClick={() => setSelectedService({
                                id: service.id,
                                title: service.title || 'Untitled Service',
                                description: service.description || 'No description available',
                                price: service.price,
                                currency: service.currency,
                                images: service.images,
                                isActive: service.isActive,
                                tags: service.tags,
                                createdAt: service.createdAt
                              })}
                            >
                              <div className="relative">
                                {service.images && service.images.length > 0 ? (
                                  <img 
                                    src={service.images[0]} 
                                    alt={service.title || 'Service'}
                                    className="w-full h-48 object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                    <div className="text-center">
                                      <Briefcase className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                                      <p className="text-sm text-gray-600">No Image</p>
                                    </div>
                                  </div>
                                )}
                                <span className="absolute top-4 left-4 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                  Service
                                </span>
                                <span className={`absolute top-4 right-4 px-2 py-1 text-xs rounded-full ${
                                  service.isActive 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {service.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <div className="p-6">
                                <div className="flex items-center justify-between mb-3">
                                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                                    {service.title || 'Untitled Service'}
                                  </h3>
                                  <span className="text-xl font-bold text-blue-600">
                                    {service.currency} {service.price}
                                  </span>
                                </div>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                  {service.description || 'No description available'}
                                </p>
                                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                  <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    <span>
                                      {service.workingTime && service.workingTime.length > 0 
                                        ? service.workingTime.join(', ') 
                                        : 'Contact for timing'}
                                    </span>
                                  </div>
                                  {/* Show created date */}
                                  <div className="text-xs text-gray-400">
                                    {new Date(service.createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                                {/* Tags */}
                                {service.tags && service.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {service.tags.slice(0, 3).map((tag, index) => (
                                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                        {tag}
                                      </span>
                                    ))}
                                    {service.tags.length > 3 && (
                                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                        +{service.tags.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : providerProfile?.services && providerProfile.services.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {providerProfile.services.map((service) => (
                            <div 
                              key={service.id}
                              className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
                              onClick={() => setSelectedService(service)}
                            >
                              <div className="relative">
                                {service.images && service.images.length > 0 ? (
                                  <img 
                                    src={service.images[0]} 
                                    alt={service.title || 'Service'}
                                    className="w-full h-48 object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                    <div className="text-center">
                                      <Briefcase className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                                      <p className="text-sm text-gray-600">No Image</p>
                                    </div>
                                  </div>
                                )}
                                <span className="absolute top-4 left-4 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                  Service
                                </span>
                                <span className={`absolute top-4 right-4 px-2 py-1 text-xs rounded-full ${
                                  service.isActive 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {service.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <div className="p-6">
                                <div className="flex items-center justify-between mb-3">
                                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                                    {service.title || 'Untitled Service'}
                                  </h3>
                                  <span className="text-xl font-bold text-blue-600">
                                    {service.currency} {service.price}
                                  </span>
                                </div>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                  {service.description || 'No description available'}
                                </p>
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    <span>Contact for timing</span>
                                  </div>
                                  {/* Show created date if available */}
                                  <div className="text-xs text-gray-400">
                                    Basic service info
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                          <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Services Yet</h3>
                          <p className="text-gray-600 mb-6">This provider hasn't added any services yet.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Portfolio Tab */}
                  {activeTab === 'portfolio' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {mockPortfolio.map((item) => (
                        <div 
                          key={item.id}
                          className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
                          onClick={() => setSelectedPortfolio(item)}
                        >
                          <div className="relative">
                            <img 
                              src={item.images[0]} 
                              alt={item.title}
                              className="w-full h-48 object-cover"
                            />
                            <span className="absolute top-4 left-4 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                              {item.category}
                            </span>
                          </div>
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">{item.title}</h3>
                              <div className="flex items-center">
                                {[...Array(item.clientRating)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                            {item.technologies && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {item.technologies.slice(0, 3).map((tech, index) => (
                                  <span 
                                    key={index}
                                    className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded hover:bg-gray-200 transition-colors"
                                  >
                                    {tech}
                                  </span>
                                ))}
                                {item.technologies.length > 3 && (
                                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded hover:bg-gray-200 transition-colors">
                                    +{item.technologies.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                            <div className="text-xs text-gray-400">
                              Completed: {item.completedDate}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reviews Tab */}
                  {activeTab === 'reviews' && (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                      <div className="p-6 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              Reviews ({mockReviews.length})
                            </h3>
                            <div className="flex items-center space-x-2 mt-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-5 h-5 ${
                                      i < Math.floor(4.7) 
                                        ? "text-yellow-400 fill-current" 
                                        : "text-gray-300"
                                    }`} 
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">4.7 out of 5</span>
                            </div>
                          </div>
                          <div className="mt-4 md:mt-0">
                            <select 
                              value={reviewFilter}
                              onChange={(e) => setReviewFilter(e.target.value)}
                              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                              <option value="all">All Reviews</option>
                              <option value="5">5 Stars</option>
                              <option value="4">4 Stars</option>
                              <option value="3">3 Stars</option>
                              <option value="2">2 Stars</option>
                              <option value="1">1 Star</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {mockReviews.map((review) => (
                          <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start space-x-4">
                              <img 
                                src={review.clientAvatar} 
                                alt={review.clientName}
                                className="w-12 h-12 rounded-full border border-gray-200 object-cover"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <h4 className="font-semibold text-gray-900">{review.clientName}</h4>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <div className="flex items-center">
                                        {[...Array(review.rating)].map((_, i) => (
                                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                        ))}
                                      </div>
                                      <span className="text-sm text-gray-400">{review.date}</span>
                                    </div>
                                  </div>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed mb-3">{review.comment}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-500">Project: {review.projectTitle}</span>
                                  <button className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                                    Helpful ({review.helpful})
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* About Tab */}
                  {activeTab === 'about' && (
                    <div className="space-y-6">
                      {/* About Profile */}
                      {providerProfile.bio && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">About Profile</h3>
                          <p className="text-gray-600 leading-relaxed">{providerProfile.bio}</p>
                        </div>
                      )}

                      {/* Skills */}
                      {providerProfile.skills && providerProfile.skills.length > 0 && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Skills</h3>
                          <div className="flex flex-wrap gap-2">
                            {providerProfile.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Qualifications */}
                      {providerProfile.qualifications && providerProfile.qualifications.length > 0 && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Qualifications</h3>
                          <div className="space-y-3">
                            {providerProfile.qualifications.map((qualification, index) => (
                              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <Award className="h-5 w-5 text-blue-500" />
                                <span className="text-gray-700">{qualification}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Member Since */}
                      <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Member Since</h3>
                        <div className="flex items-center space-x-3 mb-3">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-600">Last active: Recently</span>
                        </div>
                      </div>
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

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Contact Provider</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative">
                  {user.imageUrl && user.imageUrl.trim() ? (
                    <img
                      src={user.imageUrl}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                      {(user.firstName?.charAt(0) || 'U').toUpperCase()}
                      {(user.lastName?.charAt(0) || 'S').toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {user.firstName || 'First'} {user.lastName || 'Last'}
                  </h4>
                  <p className="text-sm text-gray-500">Service Provider</p>
                </div>
              </div>
              
              {/* Contact Options */}
              <div className="space-y-3">
                {/* Email Contact */}
                <a
                  href={`mailto:${user.email}`}
                  className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                >
                  <div className="p-2 bg-blue-100 group-hover:bg-blue-200 rounded-lg transition-colors">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Send Email</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
                
                {/* Phone Contact */}
                {user.phone && (
                  <a
                    href={`tel:${user.phone}`}
                    className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                  >
                    <div className="p-2 bg-green-100 group-hover:bg-green-200 rounded-lg transition-colors">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Call Now</p>
                      <p className="text-sm text-gray-600">{user.phone}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </a>
                )}
              </div>
              
              {/* Note */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Note:</strong> Clicking these options will open your default email client or phone app to contact the provider directly.
                </p>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <Button
                onClick={() => setShowContactModal(false)}
                variant="outline"
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <Toaster />
    </div>
  );

}
