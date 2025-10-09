import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { CreditCard, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { currencyConfig } from '../../services/stripeConfig';
import { paymentApi, type CreatePaymentIntentRequest } from '../../api/paymentApi';
import toast from 'react-hot-toast';

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
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: false,
  };

  if (paymentSuccess) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Payment Successful!
          </h3>
          <p className="text-gray-600">
            Your payment of {currencyConfig.formatCurrency(amount, currency)} has been processed successfully.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Payment Details
        </h3>
        {serviceName && (
          <p className="text-gray-600 text-sm mb-2">Service: {serviceName}</p>
        )}
        <p className="text-lg font-medium text-gray-900">
          Total: {currencyConfig.formatCurrency(amount, currency)}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information
          </label>
          <div className="border border-gray-300 rounded-md p-3 bg-white">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        {paymentError && (
          <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-sm text-red-700">{paymentError}</span>
          </div>
        )}

        <div className="flex items-center justify-center p-3 bg-gray-50 border border-gray-200 rounded-md">
          <Lock className="w-4 h-4 text-gray-500 mr-2" />
          <span className="text-xs text-gray-600">
            Your payment information is secured with 256-bit SSL encryption
          </span>
        </div>

        <button
          type="submit"
          disabled={!stripe || isProcessing || loading || disabled}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
        >
          {isProcessing || loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          By completing this payment, you agree to our terms of service.
        </p>
      </div>
    </div>
  );
};

export default PaymentForm;