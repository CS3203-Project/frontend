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
          icon: <CheckCircle className="w-16 h-16 text-green-500" />,
          title: 'Payment Successful!',
          message: 'Your payment has been processed successfully.',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          titleColor: 'text-green-800',
          messageColor: 'text-green-600'
        };
      case 'error':
      case 'failed':
        return {
          icon: <XCircle className="w-16 h-16 text-red-500" />,
          title: 'Payment Failed',
          message: errorMessage || 'Your payment could not be processed. Please try again.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          titleColor: 'text-red-800',
          messageColor: 'text-red-600'
        };
      case 'pending':
        return {
          icon: <Clock className="w-16 h-16 text-yellow-500" />,
          title: 'Payment Pending',
          message: 'Your payment is being processed. Please wait for confirmation.',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-600'
        };
      default:
        return {
          icon: <AlertTriangle className="w-16 h-16 text-gray-500" />,
          title: 'Payment Status Unknown',
          message: 'Please check your payment status.',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          titleColor: 'text-gray-800',
          messageColor: 'text-gray-600'
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
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
              <div className={`p-4 rounded-lg mb-6 ${config.bgColor} ${config.borderColor} border`}>
                <div className="space-y-2 text-sm">
                  {serviceName && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service:</span>
                      <span className="font-medium text-gray-900">{serviceName}</span>
                    </div>
                  )}
                  {amount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium text-gray-900">{formatCurrency(amount, currency)}</span>
                    </div>
                  )}
                  {paymentId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment ID:</span>
                      <span className="font-mono text-xs text-gray-700 break-all">{paymentId}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium text-gray-900">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <Button
              onClick={handleOkClick}
              className={`w-full py-3 ${
                status === 'success' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : status === 'error' || status === 'failed'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
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