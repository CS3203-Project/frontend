
import React, { createContext, useEffect, useState, useMemo } from 'react';
import { socket } from '../../api/socket';
import { userApi } from '../../api/userApi';
import type { UserProfile } from '../../api/userApi';

interface MessagingContextType {
  socket: typeof socket;
  isConnected: boolean;
}

export const MessagingContext = createContext<MessagingContextType>({
  socket,
  isConnected: false,
});

export const MessagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await userApi.getProfile();
        setCurrentUser(user);
      } catch (error) {
        setCurrentUser(null);
      }
    };
    fetchUser();
  }, []);

  // Connect socket and register user globally
  useEffect(() => {
    if (!currentUser) return;
    if (!socket.connected) socket.connect();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Register this user with the backend
    socket.emit('register_user', {
      userId: currentUser.id,
      name: `${currentUser.firstName} ${currentUser.lastName}`,
    });
    // Request the current online users list
    socket.emit('get_online_users');

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      // Do not disconnect here, keep socket alive globally
    };
  }, [currentUser]);

  const contextValue = useMemo(() => ({ socket, isConnected }), [isConnected]);

  return (
    <MessagingContext.Provider value={contextValue}>
      {children}
    </MessagingContext.Provider>
  );
};
