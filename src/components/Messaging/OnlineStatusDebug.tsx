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
    <div className={`bg-black/40 backdrop-blur-xl text-white p-4 rounded-lg border border-white/20 font-mono text-sm ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-white">🔍 Online Status Debug</h3>
        <div className={`px-2 py-1 rounded text-xs ${
          isWebSocketConnected ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'
        }`}>
          {isWebSocketConnected ? 'CONNECTED' : 'DISCONNECTED'}
        </div>
      </div>
      
      <div className="space-y-2">
        <div>
          <span className="text-white/60">Current User:</span>{' '}
          <span className="text-white">{currentUserId || 'Not set'}</span>
        </div>
        
        <div>
          <span className="text-white/60">Last Update:</span>{' '}
          <span className="text-white">{lastUpdate}</span>
        </div>
        
        <div>
          <span className="text-white/60">Online Users ({onlineUsers.length}):</span>
          <div className="mt-1 max-h-32 overflow-y-auto">
            {onlineUsers.length === 0 ? (
              <div className="text-white/40 italic">No online users</div>
            ) : (
              <ul className="list-disc list-inside">
                {onlineUsers.map((userId) => (
                  <li key={userId} className="text-white">
                    {userId === currentUserId ? (
                      <span>
                        {userId} <span className="text-white/60">(You)</span>
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
        
        <div className="text-xs text-white/40 mt-3 pt-2 border-t border-white/20">
          💡 This updates automatically without page refresh when users go online/offline
        </div>
      </div>
    </div>
  );
};

export default OnlineStatusDebug;
