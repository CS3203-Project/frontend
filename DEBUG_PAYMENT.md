// Debug Payment Issues

## Current Error
The error "Missing value for stripe.confirmCardPayment intent secret" means the `clientSecret` is not being received properly from your backend.

## What to Check

### 1. Backend Response Structure
Your backend `/api/payments/create-intent` endpoint should return:

```json
{
  "id": "pi_1234567890",
  "amount": 9450,
  "currency": "usd", 
  "clientSecret": "pi_1234567890_secret_abcdef123456",
  "status": "requires_payment_method"
}
```

### 2. Check Network Tab
1. Open browser DevTools → Network tab
2. Click "Pay Now" button
3. Look for the `/api/payments/create-intent` request
4. Check the response - it should contain `clientSecret`

### 3. Backend Controller Check
In your backend `payment.controller.js`, the `createPaymentIntent` function should:

```javascript
// Example of what your backend should return
const paymentIntent = await stripe.paymentIntents.create({
  amount: amount, // amount in cents
  currency: currency,
  metadata: metadata
});

res.json({
  id: paymentIntent.id,
  amount: paymentIntent.amount,
  currency: paymentIntent.currency,
  clientSecret: paymentIntent.client_secret, // This is crucial!
  status: paymentIntent.status
});
```

### 4. Common Issues

**Issue**: Backend returns `client_secret` but frontend expects `clientSecret`
**Fix**: Make sure your backend returns `clientSecret` (camelCase) or update frontend to use `client_secret`

**Issue**: Backend throws error before creating PaymentIntent
**Fix**: Check backend logs for any errors during payment intent creation

**Issue**: API request fails entirely
**Fix**: Check if backend is running and endpoint exists

### 5. Quick Test

Try this in your browser console on the payment page:

```javascript
// Test the API directly
fetch('/api/payments/create-intent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  },
  body: JSON.stringify({
    serviceId: 'cmj755l400b02s5j1zmlm',
    amount: 9450,
    currency: 'usd'
  })
})
.then(res => res.json())
.then(data => console.log('API Response:', data))
.catch(err => console.error('API Error:', err));
```

This should help you see exactly what your backend is returning!