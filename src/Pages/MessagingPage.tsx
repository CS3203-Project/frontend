import React, { useState, useEffect } from 'react';
import { socket } from '../api/socket';
import Chat from '../components/Messaging/Chat';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MessagingPage: React.FC = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    if (!socket.connected) {
        socket.connect();
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Real-time Messaging</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-lg mb-4">Connection Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
          <Chat />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MessagingPage;
