import apiClient from './axios';

// Payment Types
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  clientSecret: string;
  status: string;
}

export interface CreatePaymentIntentRequest {
  serviceId: string;
  amount: number;
  currency?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  paymentMethodId?: string;
}

export interface Payment {
  id: string;
  serviceId: string;
  providerId: string;
  userId: string;
  gateway: string;
  stripePaymentIntentId?: string;
  chargeId?: string;
  amount: number;
  platformFee?: number;
  providerAmount?: number;
  currency: string;
  status: PaymentStatus;
  paidAt?: string;
  refundedAt?: string;
  failureReason?: string;
  metadata?: Record<string, string | number | boolean>;
  createdAt: string;
  updatedAt: string;
  service?: {
    id: string;
    title?: string;
    price: number;
  };
  provider?: {
    id: string;
    name?: string;
    user?: {
      firstName?: string;
      lastName?: string;
      email?: string;
    };
  };
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export interface ProviderEarnings {
  id: string;
  providerId: string;
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  totalWithdrawn: number;
  currency: string;
  stripeAccountId?: string;
  lastPayoutAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export interface RefundRequest {
  reason?: string;
  amount?: number; // For partial refunds
}

export interface PaymentHistoryResponse {
  payments: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Payment API Service
export const paymentApi = {
  // Create payment intent
  createPaymentIntent: async (data: CreatePaymentIntentRequest): Promise<PaymentIntent> => {
    const response = await apiClient.post('/payments/create-intent', data);
    // Handle your backend's response structure: {success: true, message: "...", data: {...}}
    if (response.data.success && response.data.data) {
      return response.data.data; // Return the actual payment intent data
    } else if (response.data.clientSecret) {
      return response.data; // Direct response format
    } else {
      throw new Error('Invalid response format from payment API');
    }
  },

  // Confirm payment
  confirmPayment: async (data: ConfirmPaymentRequest): Promise<Payment> => {
    const response = await apiClient.post('/payments/confirm', data);
    return response.data.success ? response.data.data : response.data;
  },

  // Get payment status
  getPaymentStatus: async (paymentId: string): Promise<Payment> => {
    const response = await apiClient.get(`/payments/status/${paymentId}`);
    return response.data.success ? response.data.data : response.data;
  },

  // Get user payment history
  getPaymentHistory: async (page: number = 1, limit: number = 10): Promise<PaymentHistoryResponse> => {
    const response = await apiClient.get(`/payments/history?page=${page}&limit=${limit}`);
    return response.data.success ? response.data.data : response.data;
  },

  // Refund a payment (Provider/Admin only)
  refundPayment: async (paymentId: string, data?: RefundRequest): Promise<Payment> => {
    const response = await apiClient.post(`/payments/refund/${paymentId}`, data || {});
    return response.data.success ? response.data.data : response.data;
  },

  // Get provider earnings (Provider only)
  getProviderEarnings: async (): Promise<ProviderEarnings> => {
    const response = await apiClient.get('/payments/earnings');
    return response.data.success ? response.data.data : response.data;
  },
};

export default paymentApi;