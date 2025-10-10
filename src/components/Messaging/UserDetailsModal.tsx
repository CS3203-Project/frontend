import React, { useState, useEffect } from 'react';
import { X, Star, User, MapPin, Phone, Mail, Calendar, Award } from 'lucide-react';
import { userApi } from '../../api/userApi';
import { serviceApi } from '../../api/serviceApi';
import apiClient from '../../api/axios';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'USER' | 'PROVIDER';
  conversationId: string;
  currentUserId: string;
}

interface UserDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  imageUrl?: string;
  bio?: string;
  skills?: string[];
  qualifications?: string[];
  averageRating?: number;
  totalReviews?: number;
  isVerified?: boolean;
  location?: string;
  address?: string;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  onClose,
  userRole,
  conversationId,
  currentUserId
}) => {
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchUserDetails();
    }
  }, [isOpen, userRole, conversationId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      if (userRole === 'PROVIDER') {
        // Provider viewing customer details
        // Need to get conversation to find customer ID
        const conversationRes = await fetch(`http://localhost:3001/messaging/conversations/${conversationId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!conversationRes.ok) {
          throw new Error('Failed to fetch conversation details');
        }

        const conversation = await conversationRes.json();
        const customerId = conversation.userIds.find((id: string) => id !== currentUserId);

        if (!customerId) {
          throw new Error('Customer not found');
        }

        // Get customer profile
        const customerProfile = await userApi.getUserById(customerId);
        const customerData: any = customerProfile;
        const serviceProvider: any = customerData.serviceProvider;

        setUserDetails({
          id: customerData.id || '',
          firstName: customerData.firstName || '',
          lastName: customerData.lastName || '',
          email: customerData.email || '',
          phone: customerData.phone || '',
          imageUrl: customerData.imageUrl || '',
          bio: serviceProvider?.bio || '',
          skills: serviceProvider?.skills || [],
          qualifications: serviceProvider?.qualifications || [],
          averageRating: serviceProvider?.averageRating,
          totalReviews: serviceProvider?.totalReviews,
          isVerified: serviceProvider?.isVerified || false,
          location: customerData.location || '',
          address: customerData.address || ''
        });

        // Get reviews received by this customer (reviews given TO this customer)
        try {
          const reviewsRes = await apiClient.get(`/reviews/user/${customerId}/received`);
          console.log('Reviews API response:', reviewsRes.data);
          const reviewData = reviewsRes.data.reviews || reviewsRes.data || [];
          setReviews(reviewData);
        } catch (error) {
          console.error('Error fetching customer reviews:', error);
          setReviews([]);
        }

      } else {
        // Customer viewing service provider details
        const serviceRes = await serviceApi.getServiceByConversationId(conversationId);
        if (!serviceRes.success || !serviceRes.data?.provider) {
          throw new Error('Provider information not found');
        }

        const providerData: any = serviceRes.data.provider;
        const providerUser: any = providerData.user || {};

        setUserDetails({
          id: providerUser.id || providerData.id || '',
          firstName: providerUser.firstName || '',
          lastName: providerUser.lastName || '',
          email: providerUser.email || providerData.email || '',
          phone: providerUser.phone || '',
          imageUrl: providerUser.imageUrl || '',
          bio: providerData.bio || '',
          skills: providerData.skills || [],
          qualifications: providerData.qualifications || [],
          averageRating: providerData.averageRating,
          totalReviews: providerData.totalReviews,
          isVerified: providerData.isVerified || false,
          location: providerUser.location || '',
          address: providerUser.address || ''
        });

        // Get service reviews for this service
        try {
          const reviewsRes = await apiClient.get(`/service-reviews/service/${serviceRes.data.id}`);
          setReviews(reviewsRes.data.reviews || []);
        } catch {
          setReviews([]);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load user details');
      console.error('Error fetching user details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-white/30'
            }`}
          />
        ))}
      </div>
    );
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 animate-pulse rounded-2xl"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

        {/* Header */}
        <div className="relative z-10 p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {userRole === 'PROVIDER' ? '👤 Customer Details' : '🏢 Service Provider Details'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white"></div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-400/30 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {userDetails && !loading && (
            <div className="space-y-6">
              {/* User Profile Section */}
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                    {userDetails.firstName?.[0]}{userDetails.lastName?.[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-white">
                      {userDetails.firstName} {userDetails.lastName}
                    </h3>

                    <div className="flex items-center space-x-4 mt-2 text-sm text-white/60">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-4 h-4" />
                        <span>{userDetails.email}</span>
                      </div>

                      {userDetails.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="w-4 h-4" />
                          <span>{userDetails.phone}</span>
                        </div>
                      )}

                      {userDetails.isVerified && (
                        <div className="flex items-center space-x-2">
                          <Award className="w-4 h-4 text-green-400" />
                          <span className="text-green-400">Verified</span>
                        </div>
                      )}
                    </div>

                    {userDetails.location && (
                      <div className="flex items-center space-x-1 mt-1 text-sm text-white/60">
                        <MapPin className="w-4 h-4" />
                        <span>{userDetails.location}</span>
                      </div>
                    )}

                    {userDetails.averageRating && (
                      <div className="flex items-center space-x-2 mt-3">
                        <span className="text-yellow-400 font-medium">{userDetails.averageRating.toFixed(1)}</span>
                        {renderStars(Math.round(userDetails.averageRating))}
                        <span className="text-white/60 text-sm">
                          ({userDetails.totalReviews || 0} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {userDetails.bio && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-white/80 mb-2">Bio</h4>
                    <p className="text-sm text-white/70">{userDetails.bio}</p>
                  </div>
                )}

                {(userDetails.skills?.length || userDetails.qualifications?.length) && (
                  <div className="mt-4 space-y-3">
                    {userDetails.skills && userDetails.skills.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-white/80 mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {userDetails.skills.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {userDetails.qualifications && userDetails.qualifications.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-white/80 mb-2">Qualifications</h4>
                        <div className="flex flex-wrap gap-2">
                          {userDetails.qualifications.map((qual, index) => (
                            <span key={index} className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs">
                              {qual}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Reviews Section */}
              {reviews.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">
                    {userRole === 'PROVIDER' ? 'Reviews Given to Customer' : 'Service Reviews & Ratings'}
                  </h4>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                              {userRole === 'PROVIDER'
                                ? review.reviewer?.firstName?.[0] || review.reviewee?.firstName?.[0] || '?'
                                : review.reviewer?.firstName?.[0] || review.reviewee?.firstName?.[0] || '?'}
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {userRole === 'PROVIDER'
                                  ? `Given to: ${review.reviewee?.firstName} ${review.reviewee?.lastName}` || 'Unknown'
                                  : `By: ${review.reviewer?.firstName} ${review.reviewer?.lastName}` || 'Unknown'}
                              </p>
                              <div className="flex items-center space-x-2">
                                {renderStars(review.rating)}
                                <span className="text-yellow-400 text-sm">{review.rating}/5</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-xs text-white/60">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {new Date(review.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {review.comment && (
                          <p className="text-white/70 text-sm">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reviews.length === 0 && !loading && (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">No reviews available yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
