import { loadStripe } from '@stripe/stripe-js';

// Get the publishable key from environment variables
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Debug: Log the key (first few chars only for security)
console.log('Stripe Publishable Key:', publishableKey ? `${publishableKey.substring(0, 20)}...` : 'NOT FOUND');

// Load Stripe with your publishable key
const stripePromise = loadStripe(publishableKey);

export { stripePromise };

// Stripe configuration
export const stripeConfig = {
  publishableKey: publishableKey,
  apiVersion: '2024-06-20' as const,
  locale: 'en' as const,
};

// Currency configuration
export const currencyConfig = {
  defaultCurrency: 'usd',
  supportedCurrencies: ['usd', 'eur', 'gbp', 'cad', 'aud'],
  formatCurrency: (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  },
};