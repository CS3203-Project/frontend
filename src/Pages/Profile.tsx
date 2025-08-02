import { useState, useEffect } from 'react';
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
  Camera,
  Save,
  X,
  UserPlus,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { userApi } from '../api/userApi';
import type { UserProfile, UpdateProfileData, ProviderProfile } from '../api/userApi';
import BecomeProviderModal from '../components/Profile/BecomeProviderModal';
import EditProviderModal from '../components/Profile/EditProviderModal';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UpdateProfileData>({});
  const [showBecomeProviderModal, setShowBecomeProviderModal] = useState(false);
  const [showEditProviderModal, setShowEditProviderModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userData = await userApi.getProfile();
      setUser(userData);
      setEditForm({
        firstName: userData.firstName,
        lastName: userData.lastName,
        imageUrl: userData.imageUrl,
        socialmedia: userData.socialmedia
      });

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

  const handleUpdateProfile = async () => {
    try {
      const updatedUser = await userApi.updateProfile(editForm);
      setUser(prev => prev ? { ...prev, ...updatedUser } : null);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleBecomeProvider = () => {
    setShowBecomeProviderModal(true);
  };

  const handleProviderCreated = () => {
    fetchProfile(); // Refresh the entire profile
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
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          </div>
          
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-16">
              {/* Avatar */}
              <div className="relative">
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </div>
                )}
                {isEditing && (
                  <button className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {user.firstName} {user.lastName}
                    </h1>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.role === 'PROVIDER' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'PROVIDER' ? 'Service Provider' : 'User'}
                      </span>
                      {user.isEmailVerified && (
                        <div className="flex items-center text-green-600">
                          <Shield className="h-4 w-4 mr-1" />
                          <span className="text-sm">Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-0 flex space-x-3">
                    {user.role === 'USER' && (
                      <Button
                        onClick={handleBecomeProvider}
                        className="flex items-center space-x-2"
                      >
                        <UserPlus className="h-4 w-4" />
                        <span>Become a Provider</span>
                      </Button>
                    )}
                    {user.role === 'PROVIDER' && (
                      <>
                        <Button
                          onClick={() => setShowEditProviderModal(true)}
                          variant="outline"
                          className="flex items-center space-x-2"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span>Edit Provider</span>
                        </Button>
                        <Button
                          onClick={() => setShowDeleteConfirmation(true)}
                          variant="outline"
                          className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete Provider</span>
                        </Button>
                      </>
                    )}
                    <Button
                      variant={isEditing ? "ghost" : "outline"}
                      onClick={() => {
                        if (isEditing) {
                          setIsEditing(false);
                          setEditForm({
                            firstName: user.firstName,
                            lastName: user.lastName,
                            imageUrl: user.imageUrl,
                            socialmedia: user.socialmedia
                          });
                        } else {
                          setIsEditing(true);
                        }
                      }}
                      className="flex items-center space-x-2"
                    >
                      {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                      <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                    </Button>
                    {isEditing && (
                      <Button
                        onClick={handleUpdateProfile}
                        className="flex items-center space-x-2"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save Changes</span>
                      </Button>
                    )}
                  </div>
                </div>
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
              </div>
            </div>

            {/* Editable Information for USER role */}
            {user.role === 'USER' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {isEditing ? 'Edit Information' : 'Personal Details'}
                </h2>
                
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={editForm.firstName || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={editForm.lastName || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profile Image URL
                      </label>
                      <input
                        type="url"
                        value={editForm.imageUrl || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Social Media (one per line)
                      </label>
                      <textarea
                        value={editForm.socialmedia?.join('\n') || ''}
                        onChange={(e) => setEditForm(prev => ({ 
                          ...prev, 
                          socialmedia: e.target.value.split('\n').filter(link => link.trim())
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="twitter.com/username&#10;linkedin.com/in/username"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {user.socialmedia && user.socialmedia.length > 0 && (
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
                              <ExternalLink className="h-4 w-4 mr-2" />
                              {link}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Provider-specific content */}
          <div className="lg:col-span-2">
            {user.role === 'PROVIDER' && providerProfile ? (
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
                {providerProfile.services && providerProfile.services.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Services</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {providerProfile.services.slice(0, 4).map((service) => (
                        <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium text-gray-900 text-sm">{service.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              service.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {service.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{service.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-blue-600">
                              {service.currency} {service.price}
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {service.tags?.slice(0, 2).map((tag, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {providerProfile.services.length > 4 && (
                      <div className="mt-4 text-center">
                        <Button variant="outline" size="sm">
                          View All Services ({providerProfile.services.length})
                        </Button>
                      </div>
                    )}
                  </div>
                )}

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
      <BecomeProviderModal 
        isOpen={showBecomeProviderModal}
        onClose={() => setShowBecomeProviderModal(false)}
        onSuccess={handleProviderCreated}
      />

      {providerProfile && (
        <EditProviderModal 
          isOpen={showEditProviderModal}
          onClose={() => setShowEditProviderModal(false)}
          onSuccess={handleProviderUpdated}
          provider={providerProfile}
        />
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
