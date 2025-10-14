import React, { useState } from 'react';
import { CreditCard, DollarSign, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { currencyConfig } from '../../services/stripeConfig';
import StripePaymentWrapper from './StripePaymentWrapper';
import PaymentStatusPopup from './PaymentStatusPopup';

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
  const navigate = useNavigate();
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'error' | 'pending' | 'failed'>('success');
  const [completedPaymentId, setCompletedPaymentId] = useState<string>('');
  const [paymentErrorMessage, setPaymentErrorMessage] = useState<string>('');

  const handlePaymentSuccess = (paymentId: string) => {
    setCompletedPaymentId(paymentId);
    setPaymentStatus('success');
    setShowStatusPopup(true);
    onPaymentSuccess?.(paymentId);
  };

  const handlePaymentError = (error: string) => {
    setPaymentErrorMessage(error);
    setPaymentStatus('error');
    setShowStatusPopup(true);
    onPaymentError?.(error);
  };

  const handleStatusPopupOk = () => {
    if (paymentStatus === 'success') {
      // Navigate to customer profile
      navigate('/profile');
    }
    setShowStatusPopup(false);
    onClose();
    setStep('details'); // Reset for next time
  };

  const handleCloseModal = () => {
    onClose();
    setStep('details'); // Reset for next time
    setShowStatusPopup(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20 bg-white/5">
          {step === 'payment' && (
            <button
              onClick={() => setStep('details')}
              className="flex items-center text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </button>
          )}
          <h2 className="text-xl font-semibold text-white flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            {step === 'details' ? 'Payment Summary' : 'Complete Payment'}
          </h2>
          <button
            onClick={handleCloseModal}
            className="text-white/60 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
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
                      className="w-16 h-16 object-cover rounded-xl border border-white/20"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white mb-1">
                      {serviceName}
                    </h3>
                    <p className="text-white/60 text-sm">
                      Professional service booking
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Price */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 mb-6">
                <h4 className="text-sm font-medium text-white mb-3">Service Price</h4>
                <div className="flex justify-between font-medium">
                  <span className="text-white">Price</span>
                  <span className="text-white">
                    {currencyConfig.formatCurrency(servicePrice, serviceCurrency)}
                  </span>
                </div>
              </div>

              {/* Payment Terms */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl p-4 mb-6">
                <div className="flex items-start">
                  <DollarSign className="w-5 h-5 text-white mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1">
                      Secure Payment
                    </h4>
                    <p className="text-sm text-white/70">
                      Your payment is held securely until the service is completed to your satisfaction.
                    </p>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl p-4 mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-white mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1">
                      Important Note
                    </h4>
                    <p className="text-sm text-white/70">
                      By proceeding with this payment, you agree to our terms of service and refund policy.
                    </p>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <button
                onClick={() => setStep('payment')}
                className="w-full bg-gradient-to-r from-white to-white/80 text-black font-semibold py-3 px-4 rounded-xl hover:scale-105 transition-all duration-200 shadow-lg"
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

      {/* Payment Status Popup */}
      <PaymentStatusPopup
        isOpen={showStatusPopup}
        onClose={() => setShowStatusPopup(false)}
        status={paymentStatus}
        paymentId={completedPaymentId}
        amount={servicePrice}
        currency={serviceCurrency}
        errorMessage={paymentErrorMessage}
        serviceName={serviceName}
        onOkClick={handleStatusPopupOk}
      />
    </div>
  );
};

export default PaymentModal;