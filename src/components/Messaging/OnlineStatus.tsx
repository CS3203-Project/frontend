import React from 'react';
import { useMessaging } from './MessagingProvider';

interface OnlineStatusProps {
  userId: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const OnlineStatus: React.FC<OnlineStatusProps> = ({ 
  userId, 
  showText = false, 
  size = 'md',
  className = '' 
}) => {
  const { checkUserOnlineStatus } = useMessaging();
  const isOnline = checkUserOnlineStatus(userId);

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div 
        className={`${sizeClasses[size]} rounded-full ${
          isOnline 
            ? 'bg-white animate-pulse' 
            : 'bg-white/30'
        }`}
      />
      {showText && (
        <span 
          className={`${textSizeClasses[size]} font-medium ${
            isOnline 
              ? 'text-white' 
              : 'text-white/60'
          }`}
        >
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </div>
  );
};

export default OnlineStatus;
