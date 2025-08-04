import { useState, useEffect } from 'react';
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
  Plus
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { userApi } from '../api/userApi';
import type { UserProfile, ProviderProfile, Company } from '../api/userApi';
import EditProviderModal from '../components/Profile/EditProviderModal';
import EditProfileModal from '../components/Profile/EditProfileModal';
import CompanyModal from '../components/Profile/CompanyModal';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditProviderModal, setShowEditProviderModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showDeleteCompanyConfirmation, setShowDeleteCompanyConfirmation] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);
  const [showAllServices, setShowAllServices] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userData = await userApi.getProfile();
      setUser(userData);

      // If user is a provider, fetch provider profile
      if (userData.role === 'PROVIDER') {
        try {
          const providerData = await userApi.getProviderProfile();
          setProviderProfile(providerData);
        } catch (error) {
          console.error('Failed to fetch provider profile:', error);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = (updatedUser: Partial<UserProfile>) => {
    setUser(prev => prev ? { ...prev, ...updatedUser } : null);
  };

  const handleBecomeProvider = () => {
    navigate('/become-provider');
  };

  const handleProviderUpdated = (updatedProvider: ProviderProfile) => {
    setProviderProfile(updatedProvider);
    // Also update user data if needed
    if (user && updatedProvider.user) {
      setUser(prev => prev ? { ...prev, role: updatedProvider.user.role } : null);
    }
  };

  const handleDeleteProvider = async () => {
    try {
      await userApi.deleteProvider();
      toast.success('Provider profile deleted successfully!');
      setShowDeleteConfirmation(false);
      fetchProfile(); // Refresh profile to show USER role
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete provider profile');
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
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete company');
    }
  };

  const handleDeleteCompanyClick = (companyId: string) => {
    setCompanyToDelete(companyId);
    setShowDeleteCompanyConfirmation(true);
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
                      {providerProfile.services?.length || 0}
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

                {/* Services */}
                {providerProfile.services && providerProfile.services.length > 0 ? (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Services</h2>
                        <p className="text-sm text-gray-500">
                          {showAllServices
                            ? `Showing all ${providerProfile.services.length} services`
                            : `Showing ${Math.min(4, providerProfile.services.length)} of ${providerProfile.services.length} services`
                          }
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          navigate('/create-service');
                        }}
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Create Service</span>
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(showAllServices ? providerProfile.services : providerProfile.services.slice(0, 4)).map((service) => (
                        <div 
                          key={service.id} 
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                          onClick={() => navigate(`/service/${service.id}`)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium text-gray-900 text-sm">{service.title || 'Untitled Service'}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              service.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {service.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{service.description || 'No description'}</p>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-blue-600">
                              {service.currency} {service.price}
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {service.tags && service.tags.length > 0 ? (
                                service.tags.slice(0, 2).map((tag, index) => (
                                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                    {tag}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-gray-400">No tags</span>
                              )}
                              {service.tags && service.tags.length > 2 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                  +{service.tags.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {providerProfile.services.length > 4 && (
                      <div className="mt-6 text-center">
                        <Button 
                          variant={showAllServices ? "outline" : "default"}
                          size="sm"
                          onClick={() => setShowAllServices(!showAllServices)}
                          className={`px-6 ${showAllServices ? "border-blue-300 text-blue-600 hover:bg-blue-50" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                        >
                          {showAllServices ? (
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                              Show Less
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                              View All Services ({providerProfile.services.length})
                            </span>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">Services</h2>
                      <Button
                        onClick={() => {
                          navigate('/create-service');
                        }}
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Create Service</span>
                      </Button>
                    </div>
                    <div className="text-center py-8">
                      <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 mb-4">No services created yet</p>
                      <Button
                        onClick={() => {
                          navigate('/create-service');
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Create Your First Service
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
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Reviews</h2>
                    <div className="space-y-4">
                      {providerProfile.reviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                          <div className="flex items-start space-x-3">
                            {review.reviewer.imageUrl ? (
                              <img
                                src={review.reviewer.imageUrl}
                                alt={`${review.reviewer.firstName} ${review.reviewer.lastName}`}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-medium">
                                {review.reviewer.firstName?.charAt(0)}{review.reviewer.lastName?.charAt(0)}
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="font-medium text-gray-900">
                                  {review.reviewer.firstName} {review.reviewer.lastName}
                                </p>
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
                              <p className="text-xs text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
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

      {/* Modals */}
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

      <Footer />
      <Toaster />
    </div>
  );
}
