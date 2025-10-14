import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { CreditCard, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { currencyConfig } from '../../services/stripeConfig';
import { paymentApi, type CreatePaymentIntentRequest } from '../../api/paymentApi';
import toast from 'react-hot-toast';
import { FlippableCreditCard } from '../ui/credit-debit-card';

interface PaymentFormProps {
  serviceId: string;
  amount: number;
  currency?: string;
  serviceName?: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  serviceId,
  amount,
  currency = 'lkr',
  serviceName,
  onSuccess,
  onError,
  loading = false,
  disabled = false
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [cardPreview, setCardPreview] = useState({
    number: '•••• •••• •••• ••••',
    expiry: 'MM/YY',
    cvv: '•••'
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setPaymentError('Stripe has not loaded yet. Please try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setPaymentError('Card element not found. Please refresh the page.');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Create payment intent
      const paymentIntentData: CreatePaymentIntentRequest = {
        serviceId,
        amount: amount, // Send raw amount in dollars - backend will handle cents conversion
        currency,
        metadata: {
          serviceName: serviceName || 'Service Payment',
        },
      };

      console.log('Creating payment intent with data:', paymentIntentData);
      const response = await paymentApi.createPaymentIntent(paymentIntentData);
      console.log('Payment intent response:', response);

      // The backend should return { clientSecret: "pi_xxx_secret_xxx" }
      const clientSecret = response.clientSecret;
      
      if (!clientSecret) {
        throw new Error('No client secret received from server');
      }

      console.log('Using client secret:', clientSecret);

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        console.error('Stripe payment error:', error);
        setPaymentError(error.message || 'An error occurred during payment.');
        onError?.(error.message || 'Payment failed');
        toast.error('Payment failed: ' + error.message);
      } else if (paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent);
        setPaymentSuccess(true);
        onSuccess?.(paymentIntent.id);
        toast.success('Payment successful!');
        
        // Confirm payment on our backend
        try {
          await paymentApi.confirmPayment({
            paymentIntentId: paymentIntent.id,
          });
        } catch (confirmError) {
          console.warn('Backend confirmation failed (non-blocking):', confirmError);
        }
      }
    } catch (error) {
      console.error('Payment process error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setPaymentError(errorMessage);
      onError?.(errorMessage);
      toast.error('Payment failed: ' + errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        '::placeholder': {
          color: 'rgba(255, 255, 255, 0.5)',
        },
      },
      invalid: {
        color: '#ffffff',
      },
    },
    hidePostalCode: false,
  };

  if (paymentSuccess) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-white mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Payment Successful!
          </h3>
          <p className="text-white/70">
            Your payment of {currencyConfig.formatCurrency(amount, currency)} has been processed successfully.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Credit Card Preview */}
      <div className="flex justify-center">
        <FlippableCreditCard
          cardholderName={cardholderName || 'YOUR NAME'}
          cardNumber={cardPreview.number}
          expiryDate={cardPreview.expiry}
          cvv={cardPreview.cvv}
        />
      </div>

      {/* Payment Summary */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Payment Details
        </h3>
        {serviceName && (
          <p className="text-white/70 text-sm mb-2">Service: {serviceName}</p>
        )}
        <p className="text-xl font-medium text-white">
          Total: {currencyConfig.formatCurrency(amount, currency)}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Cardholder Name
          </label>
          <input
            type="text"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
            placeholder="JOHN DOE"
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/50 focus:ring-2 focus:ring-white/50 transition-all duration-200"
            required
          />
        </div>

        {/* Card Information */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Card Information
          </label>
          <div className="border border-white/20 rounded-xl p-4 bg-white/10 backdrop-blur-sm">
            <CardElement 
              options={cardElementOptions}
              onChange={(e) => {
                if (e.complete) {
                  setCardPreview({
                    number: '•••• •••• •••• ' + (e.value?.cardNumber?.slice(-4) || '••••'),
                    expiry: e.value?.expiryMonth && e.value?.expiryYear 
                      ? `${String(e.value.expiryMonth).padStart(2, '0')}/${String(e.value.expiryYear).slice(-2)}`
                      : 'MM/YY',
                    cvv: '•••'
                  });
                }
              }}
            />
          </div>
        </div>

        {paymentError && (
          <div className="flex items-center p-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl">
            <AlertCircle className="w-5 h-5 text-white mr-2" />
            <span className="text-sm text-white/90">{paymentError}</span>
          </div>
        )}

        <div className="flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
          <Lock className="w-4 h-4 text-white/70 mr-2" />
          <span className="text-xs text-white/70">
            Your payment information is secured with 256-bit SSL encryption
          </span>
        </div>

        <button
          type="submit"
          disabled={!stripe || isProcessing || loading || disabled || !cardholderName}
          className="w-full bg-gradient-to-r from-white to-white/80 text-black font-semibold py-3 px-4 rounded-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg flex items-center justify-center"
        >
          {isProcessing || loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Pay {currencyConfig.formatCurrency(amount, currency)}
            </>
          )}
        </button>
      </form>

      <div className="text-center">
        <p className="text-xs text-white/60">
          By completing this payment, you agree to our terms of service.
        </p>
      </div>
    </div>
  );
};

export default PaymentForm;