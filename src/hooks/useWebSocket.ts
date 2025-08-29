import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

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
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return; // Already connected
    }

    console.log('🔌 Connecting to WebSocket:', url);
    
    socketRef.current = io(url, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
      
      // Join with user ID if provided
      if (userId) {
        socket.emit('user:join', { userId });
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      setIsConnected(false);
    });

    socket.on('user:joined', (data) => {
      console.log('👤 User joined WebSocket:', data);
    });

    socket.connect();
  }, [url, userId]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('🔌 Disconnecting WebSocket');
      socketRef.current.disconnect();
      socketRef.current = null;
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
