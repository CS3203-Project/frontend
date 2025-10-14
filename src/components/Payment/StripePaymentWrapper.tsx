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
      theme: 'night' as const,
      variables: {
        colorPrimary: '#ffffff',
        colorBackground: 'rgba(255, 255, 255, 0.1)',
        colorText: '#ffffff',
        colorDanger: '#ffffff',
        borderRadius: '12px',
        fontFamily: 'system-ui, sans-serif',
      },
      rules: {
        '.Input': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#ffffff',
          backdropFilter: 'blur(10px)',
        },
        '.Input:focus': {
          border: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.2)',
        },
        '.Label': {
          color: 'rgba(255, 255, 255, 0.9)',
          fontWeight: '500',
        },
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