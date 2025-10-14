import React from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import Button from '../Button';

interface PaymentStatusPopupProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'success' | 'error' | 'pending' | 'failed';
  paymentId?: string;
  amount?: number;
  currency?: string;
  errorMessage?: string;
  serviceName?: string;
  onOkClick?: () => void;
}

const PaymentStatusPopup: React.FC<PaymentStatusPopupProps> = ({
  isOpen,
  onClose,
  status,
  paymentId,
  amount,
  currency = 'lkr',
  errorMessage,
  serviceName,
  onOkClick
}) => {
  if (!isOpen) return null;

  const formatCurrency = (amount: number, currency: string) => {
    const currencySymbols = {
      'lkr': 'LKR',
      'usd': '$',
      'eur': '€',
      'gbp': '£'
    };
    const symbol = currencySymbols[currency.toLowerCase() as keyof typeof currencySymbols] || currency.toUpperCase();
    return `${symbol} ${amount.toLocaleString()}`;
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: <CheckCircle className="w-16 h-16 text-white" />,
          title: 'Payment Successful!',
          message: 'Your payment has been processed successfully.',
          bgColor: 'bg-white/10',
          borderColor: 'border-white/30',
          titleColor: 'text-white',
          messageColor: 'text-white/80'
        };
      case 'error':
      case 'failed':
        return {
          icon: <XCircle className="w-16 h-16 text-white" />,
          title: 'Payment Failed',
          message: errorMessage || 'Your payment could not be processed. Please try again.',
          bgColor: 'bg-white/10',
          borderColor: 'border-white/30',
          titleColor: 'text-white',
          messageColor: 'text-white/80'
        };
      case 'pending':
        return {
          icon: <Clock className="w-16 h-16 text-white" />,
          title: 'Payment Pending',
          message: 'Your payment is being processed. Please wait for confirmation.',
          bgColor: 'bg-white/10',
          borderColor: 'border-white/30',
          titleColor: 'text-white',
          messageColor: 'text-white/80'
        };
      default:
        return {
          icon: <AlertTriangle className="w-16 h-16 text-white" />,
          title: 'Payment Status Unknown',
          message: 'Please check your payment status.',
          bgColor: 'bg-white/10',
          borderColor: 'border-white/30',
          titleColor: 'text-white',
          messageColor: 'text-white/80'
        };
    }
  };

  const config = getStatusConfig();

  const handleOkClick = () => {
    if (onOkClick) {
      onOkClick();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Content */}
        <div className="p-8">
          <div className="text-center">
            {/* Status Icon */}
            <div className="flex justify-center mb-6">
              {config.icon}
            </div>

            {/* Title */}
            <h2 className={`text-2xl font-bold mb-4 ${config.titleColor}`}>
              {config.title}
            </h2>

            {/* Message */}
            <p className={`mb-6 ${config.messageColor}`}>
              {config.message}
            </p>

            {/* Payment Details */}
            {status === 'success' && (
              <div className={`p-4 rounded-xl mb-6 ${config.bgColor} ${config.borderColor} border backdrop-blur-sm`}>
                <div className="space-y-2 text-sm">
                  {serviceName && (
                    <div className="flex justify-between">
                      <span className="text-white/70">Service:</span>
                      <span className="font-medium text-white">{serviceName}</span>
                    </div>
                  )}
                  {amount && (
                    <div className="flex justify-between">
                      <span className="text-white/70">Amount:</span>
                      <span className="font-medium text-white">{formatCurrency(amount, currency)}</span>
                    </div>
                  )}
                  {paymentId && (
                    <div className="flex justify-between">
                      <span className="text-white/70">Payment ID:</span>
                      <span className="font-mono text-xs text-white/80 break-all">{paymentId}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-white/70">Date:</span>
                    <span className="font-medium text-white">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <Button
              onClick={handleOkClick}
              className="w-full py-3 bg-gradient-to-r from-white to-white/80 text-black font-semibold rounded-xl hover:scale-105 transition-all duration-200 shadow-lg"
            >
              {status === 'success' ? 'Continue to Profile' : 'OK'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusPopup;