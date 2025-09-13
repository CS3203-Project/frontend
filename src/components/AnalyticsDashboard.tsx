import React, { useState, useEffect } from 'react';
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
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Calendar,
  RefreshCw,
  BarChart3,
  Activity
} from 'lucide-react';
import Button from './Button';
import { simulateApiDelay } from '../data/mockReportData';

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
  userGrowth: Array<{ date: string; users: number; providers: number }>;
  servicesByCategory: Array<{ category: string; count: number; revenue: number }>;
  monthlyRevenue: Array<{ month: string; revenue: number; transactions: number }>;
  userActivity: Array<{ hour: string; activeUsers: number }>;
  topMetrics: {
    totalUsers: number;
    totalProviders: number;
    totalServices: number;
    totalRevenue: number;
    growthRate: number;
    conversionRate: number;
  };
}

// Mock analytics data
const mockAnalyticsData: AnalyticsData = {
  userGrowth: [
    { date: 'Jan', users: 8500, providers: 450 },
    { date: 'Feb', users: 9200, providers: 520 },
    { date: 'Mar', users: 10100, providers: 680 },
    { date: 'Apr', users: 11300, providers: 780 },
    { date: 'May', users: 12400, providers: 890 },
    { date: 'Jun', users: 13200, providers: 950 },
    { date: 'Jul', users: 14100, providers: 1050 },
    { date: 'Aug', users: 14900, providers: 1150 },
    { date: 'Sep', users: 15847, providers: 1240 }
  ],
  servicesByCategory: [
    { category: 'Home Services', count: 2456, revenue: 345600 },
    { category: 'Automotive', count: 1823, revenue: 287400 },
    { category: 'Beauty & Wellness', count: 1654, revenue: 198500 },
    { category: 'Education', count: 1342, revenue: 156700 },
    { category: 'Technology', count: 1234, revenue: 234800 },
    { category: 'Health & Fitness', count: 423, revenue: 89200 }
  ],
  monthlyRevenue: [
    { month: 'Jan', revenue: 89420, transactions: 1240 },
    { month: 'Feb', revenue: 95680, transactions: 1340 },
    { month: 'Mar', revenue: 108950, transactions: 1580 },
    { month: 'Apr', revenue: 126780, transactions: 1820 },
    { month: 'May', revenue: 134560, transactions: 1950 },
    { month: 'Jun', revenue: 142890, transactions: 2100 },
    { month: 'Jul', revenue: 155670, transactions: 2280 },
    { month: 'Aug', revenue: 168230, transactions: 2450 },
    { month: 'Sep', revenue: 185450, transactions: 2680 }
  ],
  userActivity: [
    { hour: '00:00', activeUsers: 245 },
    { hour: '03:00', activeUsers: 123 },
    { hour: '06:00', activeUsers: 456 },
    { hour: '09:00', activeUsers: 1234 },
    { hour: '12:00', activeUsers: 1856 },
    { hour: '15:00', activeUsers: 1645 },
    { hour: '18:00', activeUsers: 2134 },
    { hour: '21:00', activeUsers: 1789 }
  ],
  topMetrics: {
    totalUsers: 15847,
    totalProviders: 1240,
    totalServices: 8932,
    totalRevenue: 1312400,
    growthRate: 12.5,
    conversionRate: 8.3
  }
};

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ isOpen, onClose }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    if (isOpen) {
      fetchAnalytics();
    }
  }, [isOpen, selectedTimeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      await simulateApiDelay(1000);
      setAnalytics(mockAnalyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const userGrowthData = {
    labels: analytics?.userGrowth.map(item => item.date) || [],
    datasets: [
      {
        label: 'Users',
        data: analytics?.userGrowth.map(item => item.users) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Providers',
        data: analytics?.userGrowth.map(item => item.providers) || [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const revenueData = {
    labels: analytics?.monthlyRevenue.map(item => item.month) || [],
    datasets: [
      {
        label: 'Revenue ($)',
        data: analytics?.monthlyRevenue.map(item => item.revenue) || [],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)',
        borderWidth: 1,
      },
    ],
  };

  const categoryData = {
    labels: analytics?.servicesByCategory.map(item => item.category) || [],
    datasets: [
      {
        data: analytics?.servicesByCategory.map(item => item.count) || [],
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#06B6D4',
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const activityData = {
    labels: analytics?.userActivity.map(item => item.hour) || [],
    datasets: [
      {
        label: 'Active Users',
        data: analytics?.userActivity.map(item => item.activeUsers) || [],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  };

  if (!isOpen) return null;

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
            {/* Time Range Selector */}
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as '7d' | '30d' | '90d' | '1y')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Button
              onClick={fetchAnalytics}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-100px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Users</p>
                      <p className="text-3xl font-bold text-blue-900">{analytics.topMetrics.totalUsers.toLocaleString()}</p>
                      <p className="text-sm text-blue-700 mt-1">
                        +{analytics.topMetrics.growthRate}% this month
                      </p>
                    </div>
                    <Users className="w-10 h-10 text-blue-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Total Providers</p>
                      <p className="text-3xl font-bold text-green-900">{analytics.topMetrics.totalProviders.toLocaleString()}</p>
                      <p className="text-sm text-green-700 mt-1">
                        +{analytics.topMetrics.conversionRate}% conversion rate
                      </p>
                    </div>
                    <ShoppingBag className="w-10 h-10 text-green-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Total Services</p>
                      <p className="text-3xl font-bold text-purple-900">{analytics.topMetrics.totalServices.toLocaleString()}</p>
                      <p className="text-sm text-purple-700 mt-1">Across all categories</p>
                    </div>
                    <Activity className="w-10 h-10 text-purple-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Total Revenue</p>
                      <p className="text-3xl font-bold text-yellow-900">${analytics.topMetrics.totalRevenue.toLocaleString()}</p>
                      <p className="text-sm text-yellow-700 mt-1">This period</p>
                    </div>
                    <DollarSign className="w-10 h-10 text-yellow-500" />
                  </div>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth Chart */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                    User Growth Trend
                  </h3>
                  <div className="h-64">
                    <Line data={userGrowthData} options={chartOptions} />
                  </div>
                </div>

                {/* Revenue Chart */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-purple-600" />
                    Monthly Revenue
                  </h3>
                  <div className="h-64">
                    <Bar data={revenueData} options={chartOptions} />
                  </div>
                </div>

                {/* Services by Category */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <ShoppingBag className="w-5 h-5 mr-2 text-green-600" />
                    Services by Category
                  </h3>
                  <div className="h-64">
                    <Doughnut 
                      data={categoryData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom' as const,
                          },
                        },
                      }} 
                    />
                  </div>
                </div>

                {/* User Activity */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-green-600" />
                    User Activity by Hour
                  </h3>
                  <div className="h-64">
                    <Bar data={activityData} options={chartOptions} />
                  </div>
                </div>
              </div>

              {/* Additional Insights */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Key Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Peak Activity</h4>
                    <p className="text-sm text-gray-600">
                      Highest user activity occurs at 6 PM with 2,134 active users
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Top Category</h4>
                    <p className="text-sm text-gray-600">
                      Home Services leads with 2,456 services and $345,600 revenue
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Growth Rate</h4>
                    <p className="text-sm text-gray-600">
                      Platform growing at 12.5% monthly with strong user retention
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No analytics data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
