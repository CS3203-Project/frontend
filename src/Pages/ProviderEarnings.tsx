import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp,
  CreditCard,
  Eye,
  Calendar,
  RefreshCw,
  Wallet,
  BarChart3
} from 'lucide-react';
import { paymentApi, type ProviderEarnings, type Payment } from '../api/paymentApi';
import { PaymentStatusCard } from '../components/Payment';
import { currencyConfig } from '../services/stripeConfig';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

const ProviderEarningsPage: React.FC = () => {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  
  const [earnings, setEarnings] = useState<ProviderEarnings | null>(null);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  // Check authentication and provider status
  useEffect(() => {
    if (!isLoggedIn || !user) {
      toast.error('Please log in to view earnings');
      navigate('/signin');
      return;
    }
    
    // Check if user is a provider (you might need to adjust this based on your user model)
    if (user.role !== 'PROVIDER' && !user.serviceProvider) {
      toast.error('Only service providers can view earnings');
      navigate('/');
      return;
    }
  }, [isLoggedIn, user, navigate]);

  // Fetch provider earnings
  const fetchEarnings = async () => {
    if (!isLoggedIn || !user) return;
    
    try {
      setLoading(true);
      const earningsData = await paymentApi.getProviderEarnings();
      setEarnings(earningsData);
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch recent payments (you would need to modify the API to filter by provider)
  const fetchRecentPayments = async () => {
    if (!isLoggedIn || !user) return;
    
    try {
      setPaymentsLoading(true);
      // This would need to be modified to get provider-specific payments
      const response = await paymentApi.getPaymentHistory(1, 5);
      setRecentPayments(response.payments);
    } catch (error) {
      console.error('Failed to fetch recent payments:', error);
      toast.error('Failed to load recent payments');
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchEarnings();
      fetchRecentPayments();
    }
  }, [isLoggedIn, user]);

  const handleRefresh = () => {
    fetchEarnings();
    fetchRecentPayments();
  };

  const handleWithdraw = () => {
    // Implement withdrawal logic
    toast.success('Withdrawal functionality would be implemented here');
  };

  const handleViewAllPayments = () => {
    navigate('/payment-history');
  };

  if (!isLoggedIn || !user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Wallet className="w-8 h-8 mr-3 text-green-600" />
                Earnings Dashboard
              </h1>
              <p className="text-gray-600">
                Track your earnings and manage your payments
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading earnings data...</p>
          </div>
        ) : earnings ? (
          <>
            {/* Earnings Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Earnings */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {currencyConfig.formatCurrency(earnings.totalEarnings, earnings.currency)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>

              {/* Available Balance */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Available Balance</p>
                    <p className="text-2xl font-bold text-green-600">
                      {currencyConfig.formatCurrency(earnings.availableBalance, earnings.currency)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <button
                  onClick={handleWithdraw}
                  disabled={earnings.availableBalance <= 0}
                  className="mt-3 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Withdraw Funds
                </button>
              </div>

              {/* Pending Balance */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {currencyConfig.formatCurrency(earnings.pendingBalance, earnings.currency)}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-yellow-600" />
                </div>
              </div>

              {/* Total Withdrawn */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Withdrawn</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {currencyConfig.formatCurrency(earnings.totalWithdrawn, earnings.currency)}
                    </p>
                  </div>
                  <CreditCard className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Earnings Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Earnings Summary */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Earnings Summary
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Total Revenue</span>
                    <span className="font-semibold text-gray-900">
                      {currencyConfig.formatCurrency(earnings.totalEarnings, earnings.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700">Available to Withdraw</span>
                    <span className="font-semibold text-green-600">
                      {currencyConfig.formatCurrency(earnings.availableBalance, earnings.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="text-gray-700">Processing</span>
                    <span className="font-semibold text-yellow-600">
                      {currencyConfig.formatCurrency(earnings.pendingBalance, earnings.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Account
                </h2>
                <div className="space-y-4">
                  {earnings.stripeAccountId ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center text-green-800 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Account Connected
                      </div>
                      <p className="text-sm text-green-700">
                        Your Stripe account is connected and ready to receive payments.
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Account ID: {earnings.stripeAccountId.substring(0, 20)}...
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center text-yellow-800 mb-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                        Setup Required
                      </div>
                      <p className="text-sm text-yellow-700 mb-3">
                        Connect your Stripe account to receive payments.
                      </p>
                      <button className="text-sm bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                        Connect Account
                      </button>
                    </div>
                  )}
                  
                  {earnings.lastPayoutAt && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Last payout:</span> {' '}
                      {new Date(earnings.lastPayoutAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Payments */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Recent Payments
                  </h2>
                  <button
                    onClick={handleViewAllPayments}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View All
                  </button>
                </div>
              </div>

              {paymentsLoading ? (
                <div className="p-12 text-center">
                  <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading recent payments...</p>
                </div>
              ) : recentPayments.length === 0 ? (
                <div className="p-12 text-center">
                  <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
                  <p className="text-gray-600">Your recent payments will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {recentPayments.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {payment.service?.title || 'Service Payment'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {new Date(payment.createdAt).toLocaleDateString()} at {new Date(payment.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            {currencyConfig.formatCurrency(payment.providerAmount || payment.amount, payment.currency)}
                          </p>
                          <PaymentStatusCard
                            status={payment.status}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No earnings data</h3>
            <p className="text-gray-600">Unable to load your earnings information.</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default ProviderEarningsPage;