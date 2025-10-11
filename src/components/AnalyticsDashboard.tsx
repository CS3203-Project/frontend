import React, { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Users,
  ShoppingBag,
  UserCheck,
  RefreshCw,
  BarChart3,
  MapPin,
  Star,
  Activity,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Button from './Button';
import { adminApi } from '../api/adminApi';
import { showErrorToast } from '../utils/toastUtils';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AnalyticsData {
  totalUsers: number;
  totalProviders: number;
  totalServices: number;
  totalActiveServices: number;
  totalVerifiedProviders: number;
  totalActiveCustomers: number;
  servicesByCategory: Array<{ category: string; count: number; percentage: number }>;
  providersByLocation: Array<{ location: string; count: number }>;
  customersByLocation: Array<{ location: string; count: number }>;
  servicesByStatus: Array<{ status: string; count: number }>;
  customersByStatus: Array<{ status: string; count: number }>;
  topProviders: Array<{ name: string; services: number; rating: number; location: string }>;
  recentActivity: Array<{ type: string; count: number; date: string }>;
}

interface PaymentAnalyticsData {
  totalRevenue: number;
  totalTransactions: number;
  averageTransactionAmount: number;
  pendingPayments: number;
  completedPayments: number;
  failedPayments: number;
  currentMonthRevenue: number;
  previousMonthRevenue: number;
  revenueGrowthPercentage: number;
  revenueData: Array<{ date: string; revenue: number; transactions: number }>;
  topProviders: Array<{ providerId: string; providerName: string; totalRevenue: number; totalTransactions: number; averageRating?: number }>;
  recentPayments: Array<{ id: string; amount: number; currency: string; status: string; customerName: string; providerName: string; serviceName?: string; createdAt: string }>;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'general' | 'payments'>('general');
  const [dateRange, setDateRange] = useState('30days');

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch data from multiple endpoints
      const [customersResponse, providersResponse, servicesResponse, allCustomersResponse] = await Promise.all([
        adminApi.getCustomerCount(),
        adminApi.getAllServiceProviders(),
        adminApi.getAllServices(),
        adminApi.getAllCustomers()
      ]);

      if (customersResponse.success && providersResponse.success && servicesResponse.success && allCustomersResponse.success) {
        const services = servicesResponse.data;
        const providers = providersResponse.data;
        const customers = allCustomersResponse.data;
        
        // Process services by category
        const categoryMap = new Map<string, number>();
        services.forEach(service => {
          const categoryName = service.category.parent ? 
            `${service.category.parent.name} > ${service.category.name}` : 
            service.category.name;
          categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1);
        });
        
        const servicesByCategory = Array.from(categoryMap.entries())
          .map(([category, count]) => ({
            category,
            count,
            percentage: (count / services.length) * 100
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6); // Top 6 categories

        // Process providers by location
        const locationMap = new Map<string, number>();
        providers.forEach(provider => {
          const location = provider.user.location || 'Unknown';
          locationMap.set(location, (locationMap.get(location) || 0) + 1);
        });
        
        const providersByLocation = Array.from(locationMap.entries())
          .map(([location, count]) => ({ location, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5); // Top 5 locations

        // Process customers by location
        const customerLocationMap = new Map<string, number>();
        customers.forEach(customer => {
          const location = customer.location || 'Unknown';
          customerLocationMap.set(location, (customerLocationMap.get(location) || 0) + 1);
        });
        
        const customersByLocation = Array.from(customerLocationMap.entries())
          .map(([location, count]) => ({ location, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5); // Top 5 locations

        // Services by status
        const activeServices = services.filter(s => s.isActive).length;
        const inactiveServices = services.length - activeServices;
        const servicesByStatus = [
          { status: 'Active', count: activeServices },
          { status: 'Inactive', count: inactiveServices }
        ];

        // Customers by status
        const activeCustomers = customers.filter(c => c.isActive).length;
        const inactiveCustomers = customers.length - activeCustomers;
        const verifiedCustomers = customers.filter(c => c.isEmailVerified).length;
        const customersByStatus = [
          { status: 'Active', count: activeCustomers },
          { status: 'Inactive', count: inactiveCustomers },
          { status: 'Email Verified', count: verifiedCustomers },
          { status: 'Email Unverified', count: customers.length - verifiedCustomers }
        ];

        // Top providers by rating only
        const topProviders = providers
          .map(provider => ({
            name: `${provider.user.firstName} ${provider.user.lastName}`,
            services: provider._count.services,
            rating: provider.averageRating || 0,
            location: provider.user.location || 'Not specified'
          }))
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 5); // Top 5 providers

        // Recent activity (simplified)
        const recentActivity = [
          { type: 'New Services', count: services.filter(s => {
            const created = new Date(s.createdAt);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return created > weekAgo;
          }).length, date: 'This week' },
          { type: 'New Providers', count: providers.filter(p => {
            const created = new Date(p.createdAt);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return created > weekAgo;
          }).length, date: 'This week' },
          { type: 'New Customers', count: customers.filter(c => {
            const created = new Date(c.createdAt);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return created > weekAgo;
          }).length, date: 'This week' }
        ];

        const analyticsData: AnalyticsData = {
          totalUsers: customersResponse.data.count,
          totalProviders: providers.length,
          totalServices: services.length,
          totalActiveServices: activeServices,
          totalVerifiedProviders: providers.filter(p => p.isVerified).length,
          totalActiveCustomers: activeCustomers,
          servicesByCategory,
          providersByLocation,
          customersByLocation,
          servicesByStatus,
          customersByStatus,
          topProviders,
          recentActivity
        };

        setData(analyticsData);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      showErrorToast('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPaymentAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch payment analytics data
      const [
        statsResponse,
        revenueResponse,
        providersResponse,
        paymentsResponse
      ] = await Promise.all([
        adminApi.getPaymentStatistics(),
        adminApi.getRevenueChart(dateRange),
        adminApi.getTopProviders(10),
        adminApi.getRecentPayments(20)
      ]);

      const paymentAnalyticsData: PaymentAnalyticsData = {
        totalRevenue: statsResponse.totalRevenue || 0,
        totalTransactions: statsResponse.totalTransactions || 0,
        averageTransactionAmount: statsResponse.averageTransactionValue || 0,
        pendingPayments: statsResponse.pendingTransactions || 0,
        completedPayments: statsResponse.successfulTransactions || 0,
        failedPayments: statsResponse.failedTransactions || 0,
        currentMonthRevenue: 0,
        previousMonthRevenue: 0,
        revenueGrowthPercentage: 0,
        revenueData: revenueResponse || [],
        topProviders: providersResponse || [],
        recentPayments: paymentsResponse || []
      };

      setPaymentData(paymentAnalyticsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch payment analytics data:', error);
      showErrorToast('Failed to load payment analytics data');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'general') {
        fetchAnalyticsData();
      } else {
        fetchPaymentAnalyticsData();
      }
    }
  }, [isOpen, activeTab, dateRange, fetchAnalyticsData, fetchPaymentAnalyticsData]);

  const refreshData = () => {
    if (activeTab === 'general') {
      fetchAnalyticsData();
    } else {
      fetchPaymentAnalyticsData();
    }
  };

  if (!isOpen) return null;

  // Chart configurations
  const servicesByCategoryData = data ? {
    labels: data.servicesByCategory.map(item => item.category),
    datasets: [
      {
        data: data.servicesByCategory.map(item => item.count),
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#06B6D4',
        ],
        borderWidth: 0,
      },
    ],
  } : { labels: [], datasets: [] };

  const providersByLocationData = data ? {
    labels: data.providersByLocation.map(item => item.location),
    datasets: [
      {
        label: 'Providers',
        data: data.providersByLocation.map(item => item.count),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  } : { labels: [], datasets: [] };

  const servicesByStatusData = data ? {
    labels: data.servicesByStatus.map(item => item.status),
    datasets: [
      {
        data: data.servicesByStatus.map(item => item.count),
        backgroundColor: [
          '#10B981', // Green for Active
          '#EF4444', // Red for Inactive
        ],
        borderWidth: 0,
      },
    ],
  } : { labels: [], datasets: [] };

  const customersByLocationData = data ? {
    labels: data.customersByLocation.map(item => item.location),
    datasets: [
      {
        label: 'Customers',
        data: data.customersByLocation.map(item => item.count),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  } : { labels: [], datasets: [] };

  const customersByStatusData = data ? {
    labels: data.customersByStatus.map(item => item.status),
    datasets: [
      {
        data: data.customersByStatus.map(item => item.count),
        backgroundColor: [
          '#10B981', // Green for Active
          '#EF4444', // Red for Inactive
          '#3B82F6', // Blue for Email Verified
          '#F59E0B', // Orange for Email Unverified
        ],
        borderWidth: 0,
      },
    ],
  } : { labels: [], datasets: [] };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
              <p className="text-gray-600">Real-time insights and performance metrics</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {activeTab === 'payments' && (
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="1year">Last Year</option>
              </select>
            )}
            <Button
              onClick={refreshData}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-white">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('general')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'general'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              General Analytics
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'payments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CreditCard className="w-4 h-4 inline mr-2" />
              Payment Analytics
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : activeTab === 'general' && data ? (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Customers</p>
                      <p className="text-3xl font-bold text-blue-900">{data.totalUsers.toLocaleString()}</p>
                      <p className="text-sm text-blue-700 mt-1">
                        {data.totalActiveCustomers} active
                      </p>
                    </div>
                    <Users className="w-10 h-10 text-blue-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Total Providers</p>
                      <p className="text-3xl font-bold text-green-900">{data.totalProviders.toLocaleString()}</p>
                      <p className="text-sm text-green-700 mt-1">
                        {data.totalVerifiedProviders} verified
                      </p>
                    </div>
                    <UserCheck className="w-10 h-10 text-green-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Total Services</p>
                      <p className="text-3xl font-bold text-purple-900">{data.totalServices.toLocaleString()}</p>
                      <p className="text-sm text-purple-700 mt-1">
                        {data.totalActiveServices} active
                      </p>
                    </div>
                    <ShoppingBag className="w-10 h-10 text-purple-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-xl p-6 border border-cyan-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cyan-600">Verified Providers</p>
                      <p className="text-3xl font-bold text-cyan-900">{data.totalVerifiedProviders.toLocaleString()}</p>
                      <p className="text-sm text-cyan-700 mt-1">
                        {((data.totalVerifiedProviders / data.totalProviders) * 100).toFixed(1)}% verified
                      </p>
                    </div>
                    <UserCheck className="w-10 h-10 text-cyan-500" />
                  </div>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Services by Category */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Services by Category</h3>
                  <div className="h-80">
                    <Doughnut
                      data={servicesByCategoryData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const percentage = data?.servicesByCategory[context.dataIndex]?.percentage || 0;
                                return `${context.label}: ${context.parsed} (${percentage.toFixed(1)}%)`;
                              }
                            }
                          }
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Providers by Location */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Providers by Location</h3>
                  <div className="h-80">
                    <Bar
                      data={providersByLocationData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Customers by Location */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customers by Location</h3>
                  <div className="h-80">
                    <Bar
                      data={customersByLocationData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Customer Status */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Status</h3>
                  <div className="h-80">
                    <Doughnut
                      data={customersByStatusData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Service Status */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Status</h3>
                  <div className="h-80">
                    <Doughnut
                      data={servicesByStatusData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Top Providers */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Providers</h3>
                  <div className="space-y-4">
                    {data.topProviders.map((provider, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{provider.name}</p>
                            <div className="flex items-center text-xs text-gray-500">
                              <MapPin className="w-3 h-3 mr-1" />
                              {provider.location}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">{provider.services} services</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <Star className="w-3 h-3 mr-1 text-yellow-400" />
                            {provider.rating.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-600" />
                  Recent Activity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                        <p className="text-xs text-gray-500">{activity.date}</p>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">{activity.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'payments' && paymentData ? (
            <div className="space-y-6">
              {/* Payment Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Total Revenue</p>
                      <p className="text-3xl font-bold text-green-900">LKR {paymentData.totalRevenue.toLocaleString()}</p>
                      <p className="text-sm text-green-700 mt-1">
                        All time earnings
                      </p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-green-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Transactions</p>
                      <p className="text-3xl font-bold text-blue-900">{paymentData.totalTransactions.toLocaleString()}</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Avg: LKR {paymentData.averageTransactionAmount.toLocaleString()}
                      </p>
                    </div>
                    <CreditCard className="w-10 h-10 text-blue-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Pending Payments</p>
                      <p className="text-3xl font-bold text-yellow-900">{paymentData.pendingPayments.toLocaleString()}</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Awaiting completion
                      </p>
                    </div>
                    <Clock className="w-10 h-10 text-yellow-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Success Rate</p>
                      <p className="text-3xl font-bold text-purple-900">
                        {paymentData.totalTransactions > 0 
                          ? ((paymentData.completedPayments / paymentData.totalTransactions) * 100).toFixed(1)
                          : 0}%
                      </p>
                      <p className="text-sm text-purple-700 mt-1">
                        {paymentData.completedPayments} completed
                      </p>
                    </div>
                    <CheckCircle className="w-10 h-10 text-purple-500" />
                  </div>
                </div>
              </div>

              {/* Payment Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend Chart */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
                  <div className="h-80">
                    {paymentData.revenueData.length > 0 ? (
                      <Line
                        data={{
                          labels: paymentData.revenueData.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                          datasets: [
                            {
                              label: 'Revenue (LKR)',
                              data: paymentData.revenueData.map(item => item.revenue),
                              borderColor: 'rgb(16, 185, 129)',
                              backgroundColor: 'rgba(16, 185, 129, 0.1)',
                              borderWidth: 3,
                              fill: true,
                              tension: 0.4,
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top' as const,
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  return `Revenue: LKR ${context.parsed.y.toLocaleString()}`;
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                callback: function(value) {
                                  return `LKR ${(Number(value) / 1000).toFixed(0)}K`;
                                }
                              }
                            }
                          }
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <p>No revenue data available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Status Distribution */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status Distribution</h3>
                  <div className="h-80">
                    <Doughnut
                      data={{
                        labels: ['Completed', 'Pending', 'Failed'],
                        datasets: [
                          {
                            data: [
                              paymentData.completedPayments,
                              paymentData.pendingPayments,
                              paymentData.failedPayments
                            ],
                            backgroundColor: [
                              '#10B981', // Green for completed
                              '#F59E0B', // Yellow for pending
                              '#EF4444'  // Red for failed
                            ],
                            borderWidth: 0,
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom' as const,
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const total = paymentData.totalTransactions;
                                const percentage = total > 0 ? ((context.parsed as number / total) * 100).toFixed(1) : 0;
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Top Providers and Recent Payments */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Earning Providers */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                    Top Earning Providers
                  </h3>
                  <div className="space-y-4">
                    {paymentData.topProviders.length > 0 ? (
                      paymentData.topProviders.slice(0, 8).map((provider, index) => (
                        <div key={provider.providerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </div>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{provider.providerName}</p>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span>{provider.totalTransactions} transactions</span>
                                {provider.averageRating && (
                                  <div className="flex items-center">
                                    <Star className="w-3 h-3 text-yellow-500 fill-current mr-1" />
                                    <span>{provider.averageRating.toFixed(1)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              LKR {provider.totalRevenue.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>No provider data available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Payments */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-blue-600" />
                    Recent Payments
                  </h3>
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {paymentData.recentPayments.length > 0 ? (
                      paymentData.recentPayments.slice(0, 10).map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-3">
                            {payment.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                            {payment.status === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
                            {payment.status === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
                            <div>
                              <p className="font-medium text-gray-900">
                                {payment.customerName} → {payment.providerName}
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(payment.createdAt).toLocaleDateString()} at {new Date(payment.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              LKR {payment.amount.toLocaleString()}
                            </p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {payment.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>No recent payments found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-gray-500 mb-4">
                  {activeTab === 'payments' ? 'No payment analytics data available' : 'No analytics data available'}
                </p>
                <Button onClick={refreshData}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Load Data
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;