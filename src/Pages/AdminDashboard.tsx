import React, { useState, useEffect } from 'react';
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
  Download,
  Calendar,
  AlertTriangle,
  Clock,
  Star,
  MapPin,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react';
import Button from '../components/Button';
import { adminApi, type AdminStats, type PendingProvider, type AdminProfile } from '../api/adminApi';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import { mockAdminStats, mockPendingProviders, mockAdminProfile } from '../data/mockAdminData';

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
  provider: PendingProvider;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewDetails: (provider: PendingProvider) => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onApprove, onReject, onViewDetails }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow admin-provider-card">
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0">
        <img
          src={provider.user.imageUrl || '/api/placeholder/64/64'}
          alt={`${provider.user.firstName} ${provider.user.lastName}`}
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 admin-profile-image"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {provider.user.firstName} {provider.user.lastName}
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
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
            <Button
              onClick={() => onReject(provider.id)}
              size="sm"
              variant="outline"
              className="text-xs bg-red-50 hover:bg-red-100 text-red-700"
            >
              <XCircle className="w-3 h-3 mr-1" />
              Reject
            </Button>
            <Button
              onClick={() => onApprove(provider.id)}
              size="sm"
              className="text-xs bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Approve
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Provider Details Modal Component
interface ProviderDetailsModalProps {
  provider: PendingProvider | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const ProviderDetailsModal: React.FC<ProviderDetailsModalProps> = ({
  provider,
  isOpen,
  onClose,
  onApprove,
  onReject
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
          <Button
            onClick={() => {
              onReject(provider.id);
              onClose();
            }}
            variant="outline"
            className="bg-red-50 hover:bg-red-100 text-red-700"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject Application
          </Button>
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
        </div>
      </div>
    </div>
  );
};

// Admin Profile Section Component
interface AdminProfileSectionProps {
  profile: AdminProfile | null;
  onUpdateProfile: (data: Partial<AdminProfile>) => void;
}

const AdminProfileSection: React.FC<AdminProfileSectionProps> = ({ profile, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    email: profile?.email || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsEditing(false);
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
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant="outline"
          size="sm"
        >
          <Settings className="w-4 h-4 mr-2" />
          {isEditing ? 'Cancel' : 'Edit'}
        </Button>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              required
            />
          </div>
          <div className="flex space-x-3">
            <Button type="submit">
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <img
              src={profile.imageUrl || '/api/placeholder/64/64'}
              alt={`${profile.firstName} ${profile.lastName}`}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {profile.firstName} {profile.lastName}
              </h3>
              <p className="text-gray-600">{profile.email}</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                {profile.role}
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
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingProviders, setPendingProviders] = useState<PendingProvider[]>([]);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<PendingProvider | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'profile'>('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch real data, fall back to mock data if API is not available
      try {
        const [statsResponse, providersResponse, profileResponse] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getPendingProviders(),
          adminApi.getAdminProfile(),
        ]);

        if (statsResponse.success) {
          setStats(statsResponse.data);
        }

        if (providersResponse.success) {
          setPendingProviders(providersResponse.data);
        }

        if (profileResponse.success) {
          setAdminProfile(profileResponse.data);
        }
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError);
        // Use mock data for demonstration
        setStats(mockAdminStats);
        setPendingProviders(mockPendingProviders);
        setAdminProfile(mockAdminProfile);
        showSuccessToast('Demo mode: Using mock data');
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
      showErrorToast('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProvider = async (providerId: string) => {
    try {
      const response = await adminApi.approveProvider(providerId);
      if (response.success) {
        showSuccessToast('Provider approved successfully');
        setPendingProviders(prev => prev.filter(p => p.id !== providerId));
        // Refresh stats
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Failed to approve provider:', error);
      showErrorToast(error instanceof Error ? error.message : 'Failed to approve provider');
    }
  };

  const handleRejectProvider = async (providerId: string) => {
    try {
      const response = await adminApi.rejectProvider(providerId, 'Application rejected by admin');
      if (response.success) {
        showSuccessToast('Provider application rejected');
        setPendingProviders(prev => prev.filter(p => p.id !== providerId));
      }
    } catch (error) {
      console.error('Failed to reject provider:', error);
      showErrorToast(error instanceof Error ? error.message : 'Failed to reject provider');
    }
  };

  const handleUpdateAdminProfile = async (profileData: Partial<AdminProfile>) => {
    try {
      const response = await adminApi.updateAdminProfile(profileData);
      if (response.success) {
        setAdminProfile(response.data);
        showSuccessToast('Profile updated successfully');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      showErrorToast(error instanceof Error ? error.message : 'Failed to update profile');
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
              <p className="text-sm text-gray-600">Manage your platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Data
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
              { id: 'providers', label: `Provider Approvals (${pendingProviders.length})`, icon: UserCheck },
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
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Customers"
                value={stats?.totalCustomers || 0}
                icon={<Users className="w-6 h-6 text-white" />}
                trend={stats?.monthlyGrowth.customers}
                color="bg-blue-500"
              />
              <StatCard
                title="Service Providers"
                value={stats?.totalServiceProviders || 0}
                icon={<UserCheck className="w-6 h-6 text-white" />}
                trend={stats?.monthlyGrowth.providers}
                subtitle={`${stats?.totalVerifiedProviders || 0} verified`}
                color="bg-green-500"
              />
              <StatCard
                title="Total Services"
                value={stats?.totalServices || 0}
                icon={<ShoppingBag className="w-6 h-6 text-white" />}
                trend={stats?.monthlyGrowth.services}
                subtitle={`${stats?.totalActiveServices || 0} active`}
                color="bg-purple-500"
              />
              <StatCard
                title="Pending Approvals"
                value={stats?.totalPendingProviders || 0}
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
                  {pendingProviders.length > 0 && (
                    <span className="ml-auto bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">
                      {pendingProviders.length}
                    </span>
                  )}
                </Button>
                <Button className="justify-start" variant="outline">
                  <Search className="w-5 h-5 mr-3" />
                  Search Users
                </Button>
                <Button className="justify-start" variant="outline">
                  <Filter className="w-5 h-5 mr-3" />
                  Generate Reports
                </Button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {pendingProviders.slice(0, 3).map((provider) => (
                  <div key={provider.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <img
                        src={provider.user.imageUrl || '/api/placeholder/40/40'}
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
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending Review
                    </span>
                  </div>
                ))}
                {pendingProviders.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Provider Approvals Tab */}
        {activeTab === 'providers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Provider Approvals</h2>
                <p className="text-gray-600">Review and approve service provider applications</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search providers..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            {pendingProviders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Applications</h3>
                <p className="text-gray-600">All provider applications have been reviewed.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pendingProviders.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    onApprove={handleApproveProvider}
                    onReject={handleRejectProvider}
                    onViewDetails={(provider) => {
                      setSelectedProvider(provider);
                      setIsModalOpen(true);
                    }}
                  />
                ))}
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
            />
          </div>
        )}
      </div>

      {/* Provider Details Modal */}
      <ProviderDetailsModal
        provider={selectedProvider}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProvider(null);
        }}
        onApprove={handleApproveProvider}
        onReject={handleRejectProvider}
      />
    </div>
  );
};

export default AdminDashboard;
