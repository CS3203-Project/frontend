import React, { useState } from 'react';
import { ChatProvider, useChatContext } from '../components/Chat/ChatProvider';
import ChatInterface from '../components/Chat/ChatInterface';
import UserSearchModal from '../components/Chat/UserSearchModal';
import type { SearchUser } from '../api/chatApi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MessagingContent: React.FC = () => {
  const [showUserSearch, setShowUserSearch] = useState(false);
  const { startNewConversation } = useChatContext();

  // Get token from localStorage (adjust based on your auth implementation)
  const token = localStorage.getItem('token') || ''; //authToken

  const handleSelectUser = (user: SearchUser) => {
    // Start a new conversation with the selected user
    startNewConversation(user.id, `${user.firstName} ${user.lastName}`);
    setShowUserSearch(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Messages</h1>
            <button
              onClick={() => setShowUserSearch(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Chat
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <ChatInterface />
          </div>
        </div>
      </main>
      <Footer />
      
      <UserSearchModal
        isOpen={showUserSearch}
        onClose={() => setShowUserSearch(false)}
        onSelectUser={handleSelectUser}
        token={token}
      />
    </div>
  );
};

const MessagingPage: React.FC = () => {
  return (
    <ChatProvider>
      <MessagingContent />
    </ChatProvider>
  );
};

export default MessagingPage;
