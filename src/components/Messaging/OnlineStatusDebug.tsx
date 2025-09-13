import React, { useEffect, useState } from 'react';
import { useMessaging } from './MessagingProvider';

interface OnlineStatusDebugProps {
  className?: string;
}

export const OnlineStatusDebug: React.FC<OnlineStatusDebugProps> = ({ className = '' }) => {
  const { onlineUsers, isWebSocketConnected, currentUserId } = useMessaging();
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toLocaleTimeString());

  // Update timestamp whenever onlineUsers changes
  useEffect(() => {
    setLastUpdate(new Date().toLocaleTimeString());
  }, [onlineUsers]);

  return (
    <div className={`bg-gray-800 text-white p-4 rounded-lg border border-gray-600 font-mono text-sm ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-green-400">🔍 Online Status Debug</h3>
        <div className={`px-2 py-1 rounded text-xs ${
          isWebSocketConnected ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {isWebSocketConnected ? 'CONNECTED' : 'DISCONNECTED'}
        </div>
      </div>
      
      <div className="space-y-2">
        <div>
          <span className="text-gray-400">Current User:</span>{' '}
          <span className="text-blue-400">{currentUserId || 'Not set'}</span>
        </div>
        
        <div>
          <span className="text-gray-400">Last Update:</span>{' '}
          <span className="text-yellow-400">{lastUpdate}</span>
        </div>
        
        <div>
          <span className="text-gray-400">Online Users ({onlineUsers.length}):</span>
          <div className="mt-1 max-h-32 overflow-y-auto">
            {onlineUsers.length === 0 ? (
              <div className="text-gray-500 italic">No online users</div>
            ) : (
              <ul className="list-disc list-inside">
                {onlineUsers.map((userId) => (
                  <li key={userId} className="text-green-300">
                    {userId === currentUserId ? (
                      <span>
                        {userId} <span className="text-blue-400">(You)</span>
                      </span>
                    ) : (
                      userId
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-700">
          💡 This updates automatically without page refresh when users go online/offline
        </div>
      </div>
    </div>
  );
};

export default OnlineStatusDebug;
