import React, { useState, useEffect } from 'react';
import { MessagingProvider, ConversationList, MessageThread } from '../components/Messaging';
import { userApi } from '../api/userApi';
import type { UserProfile } from '../api/userApi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MessagingContent: React.FC<{ currentUser: UserProfile }> = ({ currentUser }) => {
  return (
    <MessagingProvider userId={currentUser.id}>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 mt-16">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Messages</h1>
              <p className="text-gray-600 mt-2">Stay connected with your contacts</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden h-[600px] flex">
              {/* Conversations sidebar */}
              <div className="w-1/3 border-r border-gray-200">
                <ConversationList />
              </div>
              
              {/* Message thread */}
              <div className="flex-1">
                <MessageThread />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </MessagingProvider>
  );
};

const MessagingPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await userApi.getProfile();
        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to fetch current user:', error);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading messaging...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !currentUser) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center text-red-500">
            <p className="text-lg font-medium">Error loading messaging</p>
            <p className="text-sm mt-2">{error || 'User not found'}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return <MessagingContent currentUser={currentUser} />;
};

export default MessagingPage;
