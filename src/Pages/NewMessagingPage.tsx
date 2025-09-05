import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MessagingProvider, ConversationList, MessageThread, useMessaging } from '../components/Messaging';
import { userApi } from '../api/userApi';
import { serviceApi } from '../api/serviceApi';
import type { UserProfile } from '../api/userApi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ConfirmationPanel from '../components/Messaging/ConfirmationPanel';

const MessagingContent: React.FC<{ currentUser: UserProfile }> = ({ currentUser }) => {
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('conversation');

  // Debug logging
  useEffect(() => {
    console.log('=== MESSAGING PAGE DEBUG ===');
    console.log('Conversation ID from URL:', conversationId);
    console.log('Current user:', currentUser.id);
  }, [conversationId, currentUser]);

  return (
    <MessagingProvider userId={currentUser.id}>
      <MessagingContentInner conversationId={conversationId} currentUserRole={currentUser.role as any} currentUserId={currentUser.id} />
    </MessagingProvider>
  );
};

const MessagingContentInner: React.FC<{ conversationId: string | null; currentUserRole: 'USER'|'PROVIDER'|string; currentUserId: string }> = ({ conversationId, currentUserRole, currentUserId }) => {
  const { 
    conversations, 
    activeConversation, 
    selectConversation, 
    loadConversations,
    loading 
  } = useMessaging();
  const navigate = useNavigate();

  // Debug logging for messaging state
  useEffect(() => {
    console.log('=== MESSAGING STATE DEBUG ===');
    console.log('Active conversation:', activeConversation?.id);
    console.log('Total conversations:', conversations.length);
    console.log('Conversations:', conversations.map((c: any) => ({ id: c.id, title: c.title })));
    console.log('Loading:', loading);
  }, [activeConversation, conversations, loading]);

  // Log the active conversation object whenever it changes
  useEffect(() => {
    console.log('=== ACTIVE CONVERSATION OBJECT ===');
    console.log(activeConversation);
  }, [activeConversation]);

  // Auto-select conversation from URL parameter
  useEffect(() => {
    const handleAutoSelection = async () => {
      if (!conversationId) return;
      if (activeConversation?.id === conversationId) return;
      if (conversations.length > 0) {
        const targetConversation = conversations.find((conv: any) => conv.id === conversationId);
        if (targetConversation && targetConversation.id !== activeConversation?.id) {
          console.log('Auto-selecting conversation from URL:', conversationId);
          selectConversation(targetConversation);
        } else if (!targetConversation) {
          console.warn('Conversation not found in list:', conversationId);
          try { await loadConversations(); } catch (error) { console.error('Failed to refresh conversations:', error); }
        }
      }
    };

    handleAutoSelection();
  }, [conversationId, activeConversation, conversations, selectConversation, loadConversations]);

  // Separate effect to handle conversation selection after conversations update
  useEffect(() => {
    if (conversationId && conversations.length > 0 && !activeConversation) {
      const targetConversation = conversations.find((conv: any) => conv.id === conversationId);
      if (targetConversation) {
        console.log('Selecting conversation after conversations update:', conversationId);
        selectConversation(targetConversation);
      }
    }
  }, [conversations]);

  // Button always visible if there is an active conversation
  const showReviewButton = !!activeConversation;

  const handleReviewClick = async () => {
    if (!activeConversation) return;
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      // Add cache-busting param to always get fresh data
      const res = await fetch(`/api/confirmations/${activeConversation.id}?t=${Date.now()}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Failed to fetch confirmation status');
      const data = await res.json();
      if (data.customerConfirmation && data.providerConfirmation) {
        if (currentUserRole === 'USER') {
          // Get the service ID from the conversation
          try {
            const serviceResponse = await serviceApi.getServiceByConversationId(activeConversation.id);
            if (serviceResponse.success && serviceResponse.data) {
              navigate(`/rate-service/${serviceResponse.data.id}`);
            } else {
              alert('Service information not found for this conversation.');
            }
          } catch (serviceError) {
            console.error('Failed to get service from conversation:', serviceError);
            alert('Failed to get service information. Please try again.');
          }
        } else if (currentUserRole === 'PROVIDER') {
          // Find the customerId from the conversation
          const customerId = activeConversation.userIds.find((id: string) => id !== currentUserId);
          navigate(`/rate-customer/${activeConversation.id}`, { state: { customerId } });
        }
      } else {
        alert('Both customer and provider must confirm the booking before rating.');
      }
    } catch (error) {
      alert('Failed to check confirmation status. Please try again.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Messages</h1>
            <p className="text-gray-600 mt-2">Stay connected with your contacts</p>
            {conversationId && (
              <p className="text-sm text-blue-600 mt-1">Loading conversation: {conversationId}</p>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden h-[700px] flex">
            {/* Conversations sidebar */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              <ConversationList />
            </div>
            
            {/* Message thread */}
            <div className="flex-1 flex flex-col relative overflow-hidden">
              {activeConversation && (
                <>
                  <ConfirmationPanel
                    conversationId={activeConversation.id}
                    currentUserRole={currentUserRole}
                  />
                  {showReviewButton && (
                    <button
                      className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={handleReviewClick}
                    >
                      {currentUserRole === 'USER'
                        ? 'Rate Service & Provider'
                        : 'Rate Customer'}
                    </button>
                  )}
                </>
              )}
              <div className="flex-1 flex flex-col overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading messages...</p>
                    </div>
                  </div>
                ) : activeConversation ? (
                  <MessageThread />
                ) : conversationId ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-lg">Finding your conversation...</p>
                      <p className="text-sm text-gray-400 mt-2">Please wait while we load your conversation</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <p className="text-lg">Select a conversation to start messaging</p>
                      <p className="text-sm text-gray-400 mt-2">Choose from your conversations on the left</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
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
