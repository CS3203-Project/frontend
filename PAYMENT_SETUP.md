# Payment System Setup Guide

This guide will help you set up the frontend payment system that integrates with your existing backend payment infrastructure.

## What Was Created

### 1. Payment API Service (`src/api/paymentApi.ts`)
- Complete TypeScript API client for all payment endpoints
- Handles payment intents, confirmations, history, and provider earnings
- Proper error handling and type safety

### 2. Payment Components (`src/components/Payment/`)
- **PaymentForm**: Stripe Elements integration with card input
- **PaymentStatusCard**: Displays payment status with appropriate styling
- **PaymentModal**: Complete payment flow modal with review and payment steps
- **StripePaymentWrapper**: Stripe Elements provider wrapper

### 3. Payment Pages
- **PaymentHistory** (`src/Pages/PaymentHistory.tsx`): User payment history with filters
- **ProviderEarnings** (`src/Pages/ProviderEarnings.tsx`): Provider earnings dashboard
- **CheckoutPage** (`src/Pages/CheckoutPage.tsx`): Standalone checkout flow

### 4. Service Integration
- Added "Pay Now" button to service detail page
- Complete payment modal integration
- Proper authentication checks

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the frontend directory:

```bash
# Copy from .env.example
cp .env.example .env
```

Update the `.env` file with your Stripe publishable key:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
VITE_API_URL=http://localhost:3000/api
```

### 2. Backend Requirements

Ensure your backend has these endpoints working:
- `POST /api/payments/create-intent`
- `POST /api/payments/confirm`
- `GET /api/payments/status/:paymentId`
- `GET /api/payments/history`
- `POST /api/payments/refund/:paymentId`
- `GET /api/payments/earnings`
- `POST /api/payments/webhook`

### 3. Testing the Payment Flow

#### For Customers:
1. Navigate to any service detail page
2. Click the "Pay Now" button
3. Review payment details in the modal
4. Complete payment with test card: `4242 4242 4242 4242`
5. View payment history at `/payment-history`

#### For Providers:
1. Navigate to `/provider-earnings` to view earnings dashboard
2. See available balance, pending payments, and recent transactions

#### Standalone Checkout:
- Direct checkout URL: `/checkout/:serviceId`
- Optional amount parameter: `/checkout/:serviceId?amount=100`

### 4. Stripe Test Cards

Use these test cards in development:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Insufficient funds**: `4000 0000 0000 9995`
- **3D Secure**: `4000 0025 0000 3155`

Any future expiry date and any 3-digit CVC.

## Features

### Payment Modal
- Service details review
- Price breakdown with platform fees
- Secure Stripe Elements integration
- Success/error handling
- Mobile responsive design

### Payment History
- Comprehensive payment list with status
- Advanced filtering (status, date, search)
- Pagination support
- Retry failed payments
- Export functionality ready

### Provider Earnings
- Total earnings overview
- Available vs pending balance
- Withdrawal functionality (ready for implementation)
- Recent payments view
- Stripe account connection status

### Security Features
- Proper authentication checks
- Secure payment processing
- PCI-compliant card handling
- Error handling and validation
- Loading states and user feedback

## Integration Notes

### Authentication
The payment system integrates with your existing `AuthContext` and checks:
- User login status
- Provider role for earnings page
- Proper user context throughout

### API Integration
All API calls use your existing `axios` client with:
- Automatic token injection
- Error handling
- Consistent response patterns

### Styling
- Consistent with your existing design system
- Tailwind CSS classes
- Glass morphism effects matching your service detail page
- Mobile-first responsive design

## Customization

### Platform Fee
Currently set to 5% in `PaymentModal.tsx`. Adjust this value as needed:

```tsx
const [platformFee] = useState(servicePrice * 0.05); // 5% platform fee
```

### Currency Support
The system supports multiple currencies. Update `currencyConfig` in `stripeConfig.ts`:

```tsx
export const currencyConfig = {
  defaultCurrency: 'usd',
  supportedCurrencies: ['usd', 'eur', 'gbp', 'cad', 'aud'],
  // ...
};
```

### Styling Customization
All components use Tailwind classes and can be customized by modifying the className props or creating custom CSS classes.

## Troubleshooting

### Common Issues

1. **Stripe not loading**: Check your publishable key in `.env`
2. **API errors**: Verify backend endpoints are working
3. **Authentication issues**: Ensure user is logged in
4. **Payment failures**: Check Stripe dashboard and webhook logs

### Development Tips

1. Use Stripe's test mode for development
2. Check browser console for detailed error messages
3. Monitor network tab for API request/response details
4. Use React DevTools to inspect component state

## Production Deployment

Before going live:

1. Replace test Stripe keys with live keys
2. Update environment variables for production
3. Test webhook endpoints thoroughly
4. Set up proper error monitoring
5. Configure CORS for your domain
6. Enable Stripe webhook signature verification

## Next Steps

1. Test the complete payment flow
2. Customize styling to match your brand
3. Set up webhook handling in production
4. Add additional payment methods if needed
5. Implement withdrawal functionality for providers
6. Add payment analytics and reporting

The payment system is now fully integrated and ready for testing with your Stripe sandbox account!