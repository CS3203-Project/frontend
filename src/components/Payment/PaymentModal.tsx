import React, { useState } from 'react';
import { CreditCard, DollarSign, AlertTriangle, ArrowLeft } from 'lucide-react';
import { currencyConfig } from '../../services/stripeConfig';
import StripePaymentWrapper from './StripePaymentWrapper';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceCurrency?: string;
  serviceImage?: string;
  onPaymentSuccess?: (paymentId: string) => void;
  onPaymentError?: (error: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  serviceId,
  serviceName,
  servicePrice,
  serviceCurrency = 'lkr',
  serviceImage,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [step, setStep] = useState<'details' | 'payment'>('details');

  const handlePaymentSuccess = (paymentId: string) => {
    onPaymentSuccess?.(paymentId);
    onClose();
    setStep('details'); // Reset for next time
  };

  const handlePaymentError = (error: string) => {
    onPaymentError?.(error);
    // Don't close modal on error, allow user to retry
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          {step === 'payment' && (
            <button
              onClick={() => setStep('details')}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </button>
          )}
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            {step === 'details' ? 'Payment Summary' : 'Complete Payment'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'details' ? (
            <>
              {/* Service Details */}
              <div className="mb-6">
                <div className="flex items-start space-x-4">
                  {serviceImage && (
                    <img
                      src={serviceImage}
                      alt={serviceName}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {serviceName}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Professional service booking
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Price */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Service Price</h4>
                <div className="flex justify-between font-medium">
                  <span className="text-gray-900">Price</span>
                  <span className="text-gray-900">
                    {currencyConfig.formatCurrency(servicePrice, serviceCurrency)}
                  </span>
                </div>
              </div>

              {/* Payment Terms */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <DollarSign className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-1">
                      Secure Payment
                    </h4>
                    <p className="text-sm text-blue-700">
                      Your payment is held securely until the service is completed to your satisfaction.
                    </p>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-amber-900 mb-1">
                      Important Note
                    </h4>
                    <p className="text-sm text-amber-700">
                      By proceeding with this payment, you agree to our terms of service and refund policy.
                    </p>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <button
                onClick={() => setStep('payment')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
              >
                Continue to Payment
              </button>
            </>
          ) : (
            /* Payment Form */
            <StripePaymentWrapper
              serviceId={serviceId}
              amount={servicePrice}
              currency={serviceCurrency}
              serviceName={serviceName}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;