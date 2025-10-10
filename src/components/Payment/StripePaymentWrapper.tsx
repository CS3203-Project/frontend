import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../services/stripeConfig';
import PaymentForm from './PaymentForm';

interface StripePaymentWrapperProps {
  serviceId: string;
  amount: number;
  currency?: string;
  serviceName?: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

const StripePaymentWrapper: React.FC<StripePaymentWrapperProps> = (props) => {
  const options = {
    clientSecret: undefined, // We'll create the payment intent in the form
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#dc2626',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default StripePaymentWrapper;