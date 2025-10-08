import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  ShoppingBag, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Eye,
  Settings,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  Clock,
  Star,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  LogOut
} from 'lucide-react';
import Button from '../components/Button';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import ReportGenerator from '../components/ReportGenerator';
import { adminApi, type ServiceProvider, type AdminProfile } from '../api/adminApi';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';

// Confirmation Modal Component
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText: string;
  confirmButtonColor?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText,
  confirmButtonColor = 'bg-green-600 hover:bg-green-700'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-700">{message}</p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              onClick={onClose}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className={confirmButtonColor}
            >
              {confirmButtonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Statistics Card Component
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: number;
  subtitle?: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, subtitle, color }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow admin-stat-card">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</p>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
        {trend !== undefined && (
          <div className={`flex items-center mt-2 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`w-4 h-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
            <span className="text-sm font-medium">{Math.abs(trend)}% this month</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

// Provider Approval Card Component
interface ProviderCardProps {
  provider: ServiceProvider;
  onApprove: (id: string) => void;
  onViewDetails: (provider: ServiceProvider) => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onApprove, onViewDetails }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow admin-provider-card">
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0">
        <img
          src={provider.user.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.user.firstName + ' ' + provider.user.lastName)}&size=64&background=e5e7eb&color=374151`}
          alt={`${provider.user.firstName} ${provider.user.lastName}`}
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 admin-profile-image"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {provider.user.firstName} {provider.user.lastName}
          </h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            provider.isVerified 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {provider.isVerified ? (
              <CheckCircle className="w-3 h-3 mr-1" />
            ) : (
              <Clock className="w-3 h-3 mr-1" />
            )}
            {provider.isVerified ? 'Verified' : 'Pending'}
          </span>
        </div>
        
        <div className="mt-2 space-y-1">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-2" />
            {provider.user.email}
          </div>
          {provider.user.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2" />
              {provider.user.phone}
            </div>
          )}
          {provider.user.location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              {provider.user.location}
            </div>
          )}
        </div>

        {provider.bio && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-2">{provider.bio}</p>
        )}

        {provider.skills.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium text-gray-700 mb-1">Skills:</p>
            <div className="flex flex-wrap gap-1">
              {provider.skills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                >
                  {skill}
                </span>
              ))}
              {provider.skills.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                  +{provider.skills.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Rating and Services Info */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {provider.averageRating && provider.totalReviews && (
              <div className="flex items-center text-sm text-gray-600">
                <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                {provider.averageRating.toFixed(1)} ({provider.totalReviews} reviews)
              </div>
            )}
            <div className="flex items-center text-sm text-gray-600">
              <ShoppingBag className="w-4 h-4 mr-1" />
              {provider._count.services} services
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Applied: {new Date(provider.createdAt).toLocaleDateString()}
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => onViewDetails(provider)}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              View Details
            </Button>
            {provider.isVerified ? (
              // Show "Approved" status for verified providers
              <Button
                size="sm"
                className="text-xs bg-green-600 hover:bg-green-700 cursor-default"
                disabled
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Approved
              </Button>
            ) : (
              // Show only Approve button for unverified providers
              <Button
                onClick={() => onApprove(provider.id)}
                size="sm"
                className="text-xs bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Approve
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Provider Details Modal Component
interface ProviderDetailsModalProps {
  provider: ServiceProvider | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
}

const ProviderDetailsModal: React.FC<ProviderDetailsModalProps> = ({
  provider,
  isOpen,
  onClose,
  onApprove
}) => {
  if (!isOpen || !provider) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto admin-modal">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Provider Application Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <p className="mt-1 text-sm text-gray-900">
                  {provider.user.firstName} {provider.user.lastName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{provider.user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-sm text-gray-900">{provider.user.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <p className="mt-1 text-sm text-gray-900">{provider.user.location || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          {provider.bio && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Bio</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{provider.bio}</p>
            </div>
          )}

          {/* Skills */}
          {provider.skills.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {provider.skills.map((skill, index) => (
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

          {/* Qualifications */}
          {provider.qualifications.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Qualifications</h3>
              <div className="space-y-2">
                {provider.qualifications.map((qualification, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Star className="w-4 h-4 text-yellow-500 mr-2" />
                    <span className="text-gray-700">{qualification}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services */}
          {provider.services.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Services ({provider.services.length})</h3>
              <div className="space-y-3">
                {provider.services.map((service) => (
                  <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{service.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {service.category.name} • Created {new Date(service.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="text-sm font-medium text-green-600">
                            {service.price} {service.currency}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            service.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {service.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rating and Statistics */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{provider._count.services}</p>
                <p className="text-sm text-gray-600">Services</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{provider._count.schedules}</p>
                <p className="text-sm text-gray-600">Bookings</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {provider.averageRating ? provider.averageRating.toFixed(1) : 'N/A'}
                </p>
                <p className="text-sm text-gray-600">Rating</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{provider.totalReviews || 0}</p>
                <p className="text-sm text-gray-600">Reviews</p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Verification Documents</h3>
            <div className="space-y-3">
              {provider.IDCardUrl && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">ID Card Document</span>
                    <a
                      href={provider.IDCardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View Document
                    </a>
                  </div>
                </div>
              )}
              {provider.logoUrl && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Logo/Profile Image</span>
                    <a
                      href={provider.logoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View Image
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Application Timeline */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Timeline</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Applied: {new Date(provider.createdAt).toLocaleString()}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Last Updated: {new Date(provider.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <Button
            onClick={onClose}
            variant="outline"
          >
            Close
          </Button>
          {provider.isVerified ? (
            // Show "Approved" status for verified providers
            <Button
              className="bg-green-600 hover:bg-green-700 cursor-default"
              disabled
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Provider Approved
            </Button>
          ) : (
            // Show only Approve button for unverified providers
            <Button
              onClick={() => {
                onApprove(provider.id);
                onClose();
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Provider
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Admin Profile Section Component
interface AdminProfileSectionProps {
  profile: AdminProfile | null;
  onUpdateProfile: (data: Partial<AdminProfile>) => void;
  onLogout: () => void;
}

const AdminProfileSection: React.FC<AdminProfileSectionProps> = ({ profile, onUpdateProfile, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    username: profile?.username || '',
    password: '',
    confirmPassword: '',
  });

  // Check if passwords match
  const passwordsMatch = !formData.password || formData.password === formData.confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password confirmation if password is provided
    if (formData.password && formData.password !== formData.confirmPassword) {
      showErrorToast('Passwords do not match');
      return;
    }
    
    // Remove confirmPassword from the data sent to API
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...profileData } = formData;
    onUpdateProfile(profileData);
    setIsEditing(false);
    
    // Reset form data
    setFormData({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      username: profile?.username || '',
      password: '',
      confirmPassword: '',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data
    setFormData({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      username: profile?.username || '',
      password: '',
      confirmPassword: '',
    });
  };

  if (!profile) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Admin Profile</h2>
        <div className="flex items-center space-x-2">
          <Button
            onClick={onLogout}
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant="outline"
            size="sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Leave empty to keep current password"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent ${
                  formData.confirmPassword && !passwordsMatch 
                    ? 'border-red-300 bg-red-50' 
                    : formData.confirmPassword && passwordsMatch
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300'
                }`}
                placeholder="Confirm your new password"
                disabled={!formData.password}
              />
              {formData.confirmPassword && !passwordsMatch && (
                <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
              )}
              {formData.confirmPassword && passwordsMatch && formData.password && (
                <p className="mt-1 text-sm text-green-600">Passwords match</p>
              )}
            </div>
          </div>
          <div className="flex space-x-3">
            <Button 
              type="submit"
              disabled={!passwordsMatch}
              className={!passwordsMatch ? 'opacity-50 cursor-not-allowed' : ''}
            >
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {profile.firstName} {profile.lastName}
              </h3>
              <p className="text-gray-600">@{profile.username}</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                {profile.role || 'ADMIN'}
              </span>
            </div>
          </div>
          
          {profile.lastLogin && (
            <div className="text-sm text-gray-600">
              Last login: {new Date(profile.lastLogin).toLocaleString()}
            </div>
          )}
          
          {profile.permissions && profile.permissions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions</h4>
              <div className="flex flex-wrap gap-2">
                {profile.permissions.map((permission, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main Admin Dashboard Component
const AdminDashboard: React.FC = () => {
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnalyticsDashboardOpen, setIsAnalyticsDashboardOpen] = useState(false);
  const [isReportGeneratorOpen, setIsReportGeneratorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'profile'>('overview');
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [providerToApprove, setProviderToApprove] = useState<ServiceProvider | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'pending'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [customerCount, setCustomerCount] = useState<number>(0);

  useEffect(() => {
    // Initialize admin profile from localStorage
    const currentAdmin = adminApi.getCurrentAdmin();
    if (currentAdmin) {
      setAdminProfile({
        ...currentAdmin,
        role: 'ADMIN',
        permissions: ['manage_users', 'manage_providers'],
        lastLogin: new Date().toISOString(),
      });
    }
    
    fetchDashboardData();
  }, []);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showFilterDropdown && !target.closest('.filter-dropdown-container')) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterDropdown]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch service providers data (main priority)
      try {
        const serviceProvidersResponse = await adminApi.getAllServiceProviders();
        if (serviceProvidersResponse.success) {
          setServiceProviders(serviceProvidersResponse.data);
          console.log('Service providers loaded:', serviceProvidersResponse.data.length);
        } else {
          console.error('Failed to fetch service providers:', serviceProvidersResponse.message);
          showErrorToast('Failed to load service providers');
        }
      } catch (error) {
        console.error('Error fetching service providers:', error);
        showErrorToast('Failed to load service providers');
      }

      // Fetch customer count
      try {
        const customerCountResponse = await adminApi.getCustomerCount();
        if (customerCountResponse.success) {
          setCustomerCount(customerCountResponse.data.count);
          console.log('Customer count loaded:', customerCountResponse.data.count);
        } else {
          console.error('Failed to fetch customer count:', customerCountResponse.message);
        }
      } catch (error) {
        console.error('Error fetching customer count:', error);
        // Don't show error toast for customer count since it's not critical
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
      showErrorToast('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProvider = (providerId: string) => {
    // Find the provider to approve
    const provider = serviceProviders.find(p => p.id === providerId);
    if (provider) {
      setProviderToApprove(provider);
      setIsConfirmationModalOpen(true);
    }
  };

  const confirmApproveProvider = async () => {
    if (!providerToApprove) return;
    
    try {
      const response = await adminApi.approveProvider(providerToApprove.id);
      if (response.success) {
        showSuccessToast('Provider approved successfully');
        // Update the provider in the list with the new verification status
        setServiceProviders(prev => 
          prev.map(p => p.id === providerToApprove.id ? response.data : p)
        );
        // Update selected provider if it's the one being approved
        setSelectedProvider(prev => 
          prev && prev.id === providerToApprove.id ? response.data : prev
        );
      }
    } catch (error) {
      console.error('Failed to approve provider:', error);
      showErrorToast(error instanceof Error ? error.message : 'Failed to approve provider');
    } finally {
      // Close the modal and reset state
      setIsConfirmationModalOpen(false);
      setProviderToApprove(null);
    }
  };

  const cancelApproveProvider = () => {
    setIsConfirmationModalOpen(false);
    setProviderToApprove(null);
  };

  // Filter and search providers
  const filteredProviders = useMemo(() => {
    let filtered = serviceProviders || [];

    // Apply status filter
    if (filterStatus === 'verified') {
      filtered = filtered.filter(provider => provider.isVerified);
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter(provider => !provider.isVerified);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(provider => 
        provider.user.firstName.toLowerCase().includes(search) ||
        provider.user.lastName.toLowerCase().includes(search) ||
        provider.user.email.toLowerCase().includes(search) ||
        provider.bio?.toLowerCase().includes(search) ||
        provider.skills.some(skill => skill.toLowerCase().includes(search)) ||
        provider.qualifications.some(qual => qual.toLowerCase().includes(search))
      );
    }

    return filtered;
  }, [serviceProviders, filterStatus, searchTerm]);

  const handleUpdateAdminProfile = async (profileData: Partial<AdminProfile>) => {
    try {
      // Filter out empty password field if it exists
      const updateData = { ...profileData };
      if (updateData.password === '') {
        delete updateData.password;
      }

      const response = await adminApi.updateAdminProfile(updateData);
      
      if (response.success) {
        const updatedProfile = response.data;
        setAdminProfile(updatedProfile);
        
        // Update localStorage with new admin data
        localStorage.setItem('adminUser', JSON.stringify({
          id: updatedProfile.id,
          username: updatedProfile.username,
          firstName: updatedProfile.firstName,
          lastName: updatedProfile.lastName,
        }));
        
        showSuccessToast('Profile updated successfully');
      } else {
        showErrorToast(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      showErrorToast(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  const handleLogout = async () => {
    try {
      await adminApi.logout();
      showSuccessToast('Logged out successfully');
      
      // Redirect to admin login page
      window.location.href = '/admin-login';
    } catch (error) {
      console.error('Logout error:', error);
      showErrorToast('Failed to logout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchDashboardData}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">
                Welcome back, {adminProfile?.firstName || 'Admin'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {adminProfile?.firstName?.[0] || 'A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'providers', label: `Service Providers (${serviceProviders?.length || 0})`, icon: UserCheck },
              { id: 'profile', label: 'Admin Profile', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`${
                  activeTab === tab.id
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Service Provider Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Customers"
                value={customerCount}
                icon={<Users className="w-6 h-6 text-white" />}
                color="bg-blue-500"
              />
              <StatCard
                title="Total Providers"
                value={serviceProviders?.length || 0}
                icon={<UserCheck className="w-6 h-6 text-white" />}
                color="bg-green-500"
              />
              <StatCard
                title="Verified Providers"
                value={serviceProviders?.filter(p => p.isVerified).length || 0}
                icon={<CheckCircle className="w-6 h-6 text-white" />}
                color="bg-emerald-500"
              />
              <StatCard
                title="Pending Approvals"
                value={serviceProviders?.filter(p => !p.isVerified).length || 0}
                icon={<Clock className="w-6 h-6 text-white" />}
                color="bg-orange-500"
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => setActiveTab('providers')}
                  className="justify-start"
                  variant="outline"
                >
                  <UserCheck className="w-5 h-5 mr-3" />
                  Review Provider Applications
                  {(serviceProviders?.filter(p => !p.isVerified).length || 0) > 0 && (
                    <span className="ml-auto bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">
                      {serviceProviders?.filter(p => !p.isVerified).length || 0}
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* Analytics Dashboard */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
                Analytics Dashboard
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600">
                  View graphical charts and performance metrics for comprehensive business insights.
                </p>
                <button
                  onClick={() => setIsAnalyticsDashboardOpen(true)}
                  className="w-full flex items-center justify-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg hover:from-indigo-100 hover:to-purple-100 transition-all group"
                >
                  <TrendingUp className="w-5 h-5 text-indigo-600 mr-3" />
                  <span className="text-lg font-medium text-indigo-700">Open Analytics Dashboard</span>
                  <ExternalLink className="w-4 h-4 text-indigo-500 ml-2" />
                </button>
              </div>
            </div>

            {/* Report Generator */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2 text-blue-600" />
                Report Generator
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Generate comprehensive reports for customers, providers, and services. Download as PDF.
                </p>
                <button
                  onClick={() => setIsReportGeneratorOpen(true)}
                  className="w-full flex items-center justify-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-cyan-100 transition-all group"
                >
                  <ShoppingBag className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-lg font-medium text-blue-700">Generate Reports</span>
                  <ExternalLink className="w-4 h-4 text-blue-500 ml-2" />
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {(serviceProviders || []).slice(0, 3).map((provider) => (
                  <div key={provider.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <img
                        src={provider.user.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.user.firstName + ' ' + provider.user.lastName)}&size=40&background=e5e7eb&color=374151`}
                        alt={`${provider.user.firstName} ${provider.user.lastName}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {provider.user.firstName} {provider.user.lastName} applied to become a provider
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(provider.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      provider.isVerified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {provider.isVerified ? 'Verified' : 'Pending Review'}
                    </span>
                  </div>
                ))}
                {(serviceProviders?.length || 0) === 0 && (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Service Providers Tab */}
        {activeTab === 'providers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Service Providers</h2>
                <p className="text-gray-600">Manage and review all service providers</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search providers..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div className="relative filter-dropdown-container">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                    {filterStatus !== 'all' && (
                      <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                        {filterStatus === 'verified' ? 'Verified' : 'Pending'}
                      </span>
                    )}
                  </Button>
                  
                  {showFilterDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setFilterStatus('all');
                            setShowFilterDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                            filterStatus === 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                          }`}
                        >
                          All Providers
                        </button>
                        <button
                          onClick={() => {
                            setFilterStatus('verified');
                            setShowFilterDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                            filterStatus === 'verified' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                          }`}
                        >
                          Verified Only
                        </button>
                        <button
                          onClick={() => {
                            setFilterStatus('pending');
                            setShowFilterDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                            filterStatus === 'pending' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                          }`}
                        >
                          Pending Only
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {(filteredProviders?.length || 0) === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || filterStatus !== 'all' ? 'No Matching Providers' : 'No Service Providers'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'No providers match your current search or filter criteria.'
                    : 'No service providers found in the system.'
                  }
                </p>
                {(searchTerm || filterStatus !== 'all') && (
                  <div className="mt-4 space-x-2">
                    {searchTerm && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchTerm('')}
                      >
                        Clear Search
                      </Button>
                    )}
                    {filterStatus !== 'all' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilterStatus('all')}
                      >
                        Clear Filter
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  Showing {filteredProviders.length} of {serviceProviders?.length || 0} providers
                  {(searchTerm || filterStatus !== 'all') && (
                    <span className="ml-2">
                      {searchTerm && `• Search: "${searchTerm}"`}
                      {filterStatus !== 'all' && `• Filter: ${filterStatus === 'verified' ? 'Verified' : 'Pending'}`}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredProviders.map((provider: ServiceProvider) => (
                    <ProviderCard
                      key={provider.id}
                      provider={provider}
                      onApprove={handleApproveProvider}
                      onViewDetails={(provider) => {
                        setSelectedProvider(provider);
                        setIsModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Admin Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Admin Profile</h2>
              <p className="text-gray-600">Manage your admin account settings</p>
            </div>
            <AdminProfileSection
              profile={adminProfile}
              onUpdateProfile={handleUpdateAdminProfile}
              onLogout={handleLogout}
            />
          </div>
        )}
      </div>
      
      {/* Modals Section */}
      <div>

      {/* Provider Details Modal */}
      <ProviderDetailsModal
        provider={selectedProvider}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProvider(null);
        }}
        onApprove={handleApproveProvider}
      />

      {/* Analytics Dashboard Modal */}
      <AnalyticsDashboard
        isOpen={isAnalyticsDashboardOpen}
        onClose={() => setIsAnalyticsDashboardOpen(false)}
      />

      {/* Report Generator Modal */}
      <ReportGenerator
        isOpen={isReportGeneratorOpen}
        onClose={() => setIsReportGeneratorOpen(false)}
      />

      {/* Confirmation Modal for Approve Action */}
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={cancelApproveProvider}
        onConfirm={confirmApproveProvider}
        title="Approve Provider Application"
        message={`Are you sure you want to approve ${providerToApprove?.user.firstName} ${providerToApprove?.user.lastName}'s application? This will grant them access as a verified service provider.`}
        confirmButtonText="Yes, Approve"
        confirmButtonColor="bg-green-600 hover:bg-green-700"
      />
      
      </div>
    </div>
  );
};

export default AdminDashboard;
