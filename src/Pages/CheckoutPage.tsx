import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock } from 'lucide-react';
import { serviceApi, type ServiceResponse } from '../api/serviceApi';
import { StripePaymentWrapper } from '../components/Payment';
import { currencyConfig } from '../services/stripeConfig';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

const CheckoutPage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  
  const [service, setService] = useState<ServiceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'review' | 'payment' | 'success'>('review');
  
  // Get amount from URL params if provided
  const customAmount = searchParams.get('amount');
  const returnUrl = searchParams.get('return') || '/services';

  // Check authentication
  useEffect(() => {
    if (!isLoggedIn || !user) {
      toast.error('Please log in to proceed with payment');
      navigate('/signin');
    }
  }, [isLoggedIn, user, navigate]);

  // Fetch service details
  useEffect(() => {
    const fetchService = async () => {
      if (!serviceId) {
        toast.error('Service not found');
        navigate('/services');
        return;
      }

      try {
        setLoading(true);
        const response = await serviceApi.getServiceById(serviceId);
        setService(response.data || response);
      } catch (error) {
        console.error('Failed to fetch service:', error);
        toast.error('Failed to load service details');
        navigate('/services');
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchService();
    }
  }, [serviceId, navigate]);

  const handlePaymentSuccess = (paymentId: string) => {
    console.log('Payment successful:', paymentId);
    setStep('success');
    toast.success('Payment completed successfully!');
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    toast.error('Payment failed: ' + error);
  };

  const handleBackToService = () => {
    if (returnUrl.startsWith('/service/')) {
      navigate(returnUrl);
    } else {
      navigate(`/service/${serviceId}`);
    }
  };

  const handleContinueShopping = () => {
    navigate('/services');
  };

  if (!isLoggedIn || !user) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading service details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h1>
            <p className="text-gray-600 mb-6">The service you're looking for doesn't exist.</p>
            <button
              onClick={handleContinueShopping}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Services
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const servicePrice = customAmount ? parseFloat(customAmount) : (typeof service.price === 'string' ? parseFloat(service.price) : service.price);
  const platformFee = servicePrice * 0.05; // 5% platform fee
  const totalAmount = servicePrice + platformFee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={handleBackToService}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Service
        </button>

        {step === 'review' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Your Order</h1>
              <p className="text-gray-600">Please review the details before proceeding to payment</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Service Details */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Details</h2>
                
                <div className="flex items-start space-x-4 mb-6">
                  {service.images && service.images.length > 0 && (
                    <img
                      src={service.images[0]}
                      alt={service.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {service.description}
                    </p>
                  </div>
                </div>

                {service.tags && service.tags.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Categories:</p>
                    <div className="flex flex-wrap gap-2">
                      {service.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Service Price:</span>
                    <span className="font-medium text-gray-900">
                      {currencyConfig.formatCurrency(servicePrice, service.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Platform Fee (5%):</span>
                    <span className="font-medium text-gray-900">
                      {currencyConfig.formatCurrency(platformFee, service.currency)}
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total:</span>
                      <span className="text-lg font-bold text-blue-600">
                        {currencyConfig.formatCurrency(totalAmount, service.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security & Terms */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Security & Trust</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <ShieldCheck className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-gray-900">Secure Payment</h3>
                        <p className="text-sm text-gray-600">
                          Your payment information is encrypted and secure
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Lock className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-gray-900">Money Back Guarantee</h3>
                        <p className="text-sm text-gray-600">
                          Get a full refund if you're not satisfied
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Important Note</h3>
                  <p className="text-sm text-blue-700">
                    By proceeding with this payment, you agree to our terms of service and 
                    understand that funds will be held in escrow until service completion.
                  </p>
                </div>

                <button
                  onClick={() => setStep('payment')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-xl transition-colors duration-200"
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
              <p className="text-gray-600">
                Total: {currencyConfig.formatCurrency(totalAmount, service.currency)}
              </p>
            </div>

            <StripePaymentWrapper
              serviceId={service.id}
              amount={totalAmount}
              currency={service.currency}
              serviceName={service.title}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />

            <div className="mt-6 text-center">
              <button
                onClick={() => setStep('review')}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                ← Back to Review
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-green-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
              <p className="text-gray-600 mb-6">
                Thank you for your payment. You can now contact the service provider to arrange your service.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-2">What's Next?</h3>
                <p className="text-sm text-gray-600">
                  • Check your email for payment confirmation<br />
                  • Contact the provider to schedule your service<br />
                  • Your payment is held securely until service completion
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleBackToService}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Contact Provider
                </button>
                <button
                  onClick={handleContinueShopping}
                  className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg transition-colors"
                >
                  Browse More Services
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default CheckoutPage;