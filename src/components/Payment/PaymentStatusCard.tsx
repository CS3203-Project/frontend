import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { PaymentStatus } from '../../api/paymentApi';
import { currencyConfig } from '../../services/stripeConfig';

interface PaymentStatusCardProps {
  status: PaymentStatus;
  amount?: number;
  currency?: string;
  serviceName?: string;
  paymentId?: string;
  paidAt?: string;
  failureReason?: string;
  onRetry?: () => void;
  className?: string;
}

const PaymentStatusCard: React.FC<PaymentStatusCardProps> = ({
  status,
  amount,
  currency = 'lkr',
  serviceName,
  paymentId,
  paidAt,
  failureReason,
  onRetry,
  className = ''
}) => {
  const getStatusConfig = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.SUCCEEDED:
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          title: 'Payment Successful',
          description: 'Your payment has been processed successfully.',
        };
      case PaymentStatus.PENDING:
        return {
          icon: Clock,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          title: 'Payment Pending',
          description: 'Your payment is being processed.',
        };
      case PaymentStatus.PROCESSING:
        return {
          icon: RefreshCw,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          title: 'Processing Payment',
          description: 'Your payment is currently being processed.',
        };
      case PaymentStatus.FAILED:
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Payment Failed',
          description: failureReason || 'Your payment could not be processed.',
        };
      case PaymentStatus.CANCELED:
        return {
          icon: XCircle,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          title: 'Payment Canceled',
          description: 'This payment has been canceled.',
        };
      case PaymentStatus.REFUNDED:
        return {
          icon: AlertCircle,
          color: 'text-orange-500',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          title: 'Payment Refunded',
          description: 'This payment has been refunded.',
        };
      case PaymentStatus.PARTIALLY_REFUNDED:
        return {
          icon: AlertCircle,
          color: 'text-orange-500',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          title: 'Partially Refunded',
          description: 'This payment has been partially refunded.',
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          title: 'Unknown Status',
          description: 'Payment status is unknown.',
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor} ${className}`}>
      <div className="flex items-start space-x-3">
        <Icon className={`w-6 h-6 ${config.color} mt-0.5 ${status === PaymentStatus.PROCESSING ? 'animate-spin' : ''}`} />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {config.title}
          </h3>
          <p className="text-gray-600 text-sm mb-3">
            {config.description}
          </p>
          
          {serviceName && (
            <p className="text-gray-700 text-sm mb-2">
              <span className="font-medium">Service:</span> {serviceName}
            </p>
          )}
          
          {amount && (
            <p className="text-gray-700 text-sm mb-2">
              <span className="font-medium">Amount:</span> {currencyConfig.formatCurrency(amount, currency)}
            </p>
          )}
          
          {paymentId && (
            <p className="text-gray-500 text-xs mb-2">
              <span className="font-medium">Payment ID:</span> {paymentId}
            </p>
          )}
          
          {paidAt && status === PaymentStatus.SUCCEEDED && (
            <p className="text-gray-500 text-xs">
              <span className="font-medium">Paid at:</span> {new Date(paidAt).toLocaleString()}
            </p>
          )}
          
          {status === PaymentStatus.FAILED && onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusCard;