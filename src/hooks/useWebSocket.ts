import { useEffect, useRef, useCallback, useState } from 'react';
import { socket } from '../api/socket';
import type { Socket } from 'socket.io-client';

export interface UseWebSocketOptions {
  url: string;
  userId?: string;
  autoConnect?: boolean;
}

export interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback?: (data: any) => void) => void;
}

export const useWebSocket = (options: UseWebSocketOptions): UseWebSocketReturn => {
  const { url, userId, autoConnect = true } = options;
  // Use shared socket instance
  const socketRef = useRef<Socket | null>(socket);
  const [isConnected, setIsConnected] = useState(false);

  // Listen for connect/disconnect events to update isConnected
  useEffect(() => {
    const sock = socketRef.current;
    if (!sock) return;
    const handleConnect = () => {
      setIsConnected(true);
      console.log('✅ WebSocket connected');
    };
    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('❌ WebSocket disconnected');
    };
    sock.on('connect', handleConnect);
    sock.on('disconnect', handleDisconnect);
    // Set initial state
    setIsConnected(sock.connected);
    return () => {
      sock.off('connect', handleConnect);
      sock.off('disconnect', handleDisconnect);
    };
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return; // Already connected
    }

    console.log('🔌 Connecting to WebSocket:', url);
    
    // Only connect if not already
    socketRef.current?.connect();
  }, [url, userId]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('🔌 Disconnecting WebSocket');
      socketRef.current.disconnect();
      setIsConnected(false);
    }
  }, []);

  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('⚠️ Cannot emit: WebSocket not connected');
    }
  }, []);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect && userId) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, userId, connect, disconnect]);

  // Reconnect when userId changes
  useEffect(() => {
    if (socketRef.current?.connected && userId) {
      socketRef.current.emit('user:join', { userId });
    }
  }, [userId]);

  return {
    socket: socketRef.current,
    isConnected,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
};
