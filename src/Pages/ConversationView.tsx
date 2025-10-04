import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessagingProvider, MessageThread, useMessaging } from '../components/Messaging';
import { userApi } from '../api/userApi';
import { serviceApi } from '../api/serviceApi';
import type { UserProfile } from '../api/userApi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ConfirmationPanel from '../components/Messaging/ConfirmationPanel';

const ConversationViewContent: React.FC<{ currentUser: UserProfile; conversationId: string }> = ({ currentUser, conversationId }) => {
  const [serviceProvider, setServiceProvider] = useState<any>(null);
  const [currentUserRole, setCurrentUserRole] = useState<'USER' | 'PROVIDER'>('USER');

  useEffect(() => {
    const fetchServiceProvider = async () => {
      try {
        const serviceRes = await serviceApi.getServiceByConversationId(conversationId);
        if (serviceRes.success && serviceRes.data && serviceRes.data.provider) {
          setServiceProvider(serviceRes.data.provider);
          const provider = serviceRes.data.provider as any;
          const providerUserId = provider.userId;
          const isProvider = currentUser.id === providerUserId;
          const role = isProvider ? 'PROVIDER' : 'USER';
          setCurrentUserRole(role);
        }
      } catch (err) {
        console.error('Failed to fetch service provider:', err);
      }
    };
    fetchServiceProvider();
  }, [conversationId, currentUser.id]);

  return (
    <MessagingProvider userId={currentUser.id}>
      <ConversationViewInner 
        conversationId={conversationId} 
        currentUserRole={currentUserRole} 
        currentUserId={currentUser.id} 
      />
    </MessagingProvider>
  );
};

const ConversationViewInner: React.FC<{ 
  conversationId: string; 
  currentUserRole: 'USER'|'PROVIDER'|string; 
  currentUserId: string;
}> = ({ conversationId, currentUserRole, currentUserId }) => {
  const { 
    conversations, 
    activeConversation, 
    selectConversation, 
    loadConversations,
    loading 
  } = useMessaging();
  const navigate = useNavigate();
  const [conversationLoading, setConversationLoading] = useState(true);
  const [conversationError, setConversationError] = useState<string | null>(null);

  // Auto-select conversation based on URL parameter
  useEffect(() => {
    const handleConversationSelection = async () => {
      if (!conversationId) {
        setConversationError('No conversation ID provided');
        setConversationLoading(false);
        return;
      }

      // If we already have the right conversation active, we're done
      if (activeConversation?.id === conversationId) {
        setConversationLoading(false);
        return;
      }

      // Try to find the conversation in our current list
      if (conversations.length > 0) {
        const targetConversation = conversations.find((conv: any) => conv.id === conversationId);
        if (targetConversation) {
          console.log('Selecting conversation from existing list:', conversationId);
          try {
            await selectConversation(targetConversation);
            setConversationLoading(false);
          } catch (error) {
            console.error('Failed to select conversation:', error);
            setConversationError('Failed to load conversation');
            setConversationLoading(false);
          }
        } else {
          // Conversation not found, try to refresh
          console.warn('Conversation not found in list, refreshing conversations');
          try {
            await loadConversations();
          } catch (error) {
            console.error('Failed to refresh conversations:', error);
            setConversationError('Conversation not found');
            setConversationLoading(false);
          }
        }
      }
    };

    handleConversationSelection();
  }, [conversationId, activeConversation, conversations, selectConversation, loadConversations]);

  // Handle conversation selection after conversations are loaded
  useEffect(() => {
    if (conversationId && conversations.length > 0 && !activeConversation && conversationLoading) {
      const targetConversation = conversations.find((conv: any) => conv.id === conversationId);
      if (targetConversation) {
        console.log('Selecting conversation after conversations update:', conversationId);
        selectConversation(targetConversation).then(() => {
          setConversationLoading(false);
        }).catch((error) => {
          console.error('Failed to select conversation after update:', error);
          setConversationError('Failed to load conversation');
          setConversationLoading(false);
        });
      } else if (!loading) {
        setConversationError('Conversation not found');
        setConversationLoading(false);
      }
    }
  }, [conversations, conversationId, activeConversation, conversationLoading, loading]);

  const handleBackToHub = () => {
    navigate('/conversation-hub');
  };

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

  if (conversationError) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center p-8 rounded-xl bg-white/10 backdrop-blur-sm border border-red-500/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-red-500/10 to-red-500/5 animate-pulse rounded-xl"></div>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-red-500/20 to-red-500/10 flex items-center justify-center relative z-10">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-red-400 mb-2 relative z-10">Error loading conversation</p>
            <p className="text-sm text-white/60 mb-6 relative z-10">{conversationError}</p>
            <div className="flex space-x-3 relative z-10">
              <button 
                onClick={handleBackToHub}
                className="px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 font-medium border border-white/30 hover:border-white/40 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
                <span className="relative z-10">Back to Hub</span>
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all duration-300 font-medium border border-red-500/30 hover:border-red-500/40 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/10 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
                <span className="relative z-10">Retry</span>
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navbar />
      <main className="flex-grow px-4 py-6 mt-16">
        <div className="h-[calc(100vh-8rem)] flex flex-col">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToHub}
                className="flex items-center space-x-2 text-white/90 hover:text-white px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/20 hover:border-white/30 backdrop-blur-sm relative overflow-hidden group"
              >
                {/* Glitter effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
                <svg className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="relative z-10 font-medium">Back to Hub</span>
              </button>
              
              {activeConversation?.title && 
               !activeConversation.title.includes('Chat with') && (
                <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse"></div>
                  <h1 className="text-xl font-semibold text-white relative z-10">{activeConversation.title}</h1>
                </div>
              )}
            </div>
          </div>
          
          {/* Main Content */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl flex-1 flex overflow-hidden border border-white/20 relative">
            {/* Background gradient effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 animate-pulse rounded-2xl"></div>
            
            {conversationLoading || loading ? (
              <div className="flex items-center justify-center h-full w-full relative z-10">
                <div className="text-center p-8 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/20 border-t-white mx-auto mb-4"></div>
                  <p className="text-white/90">Loading conversation...</p>
                </div>
              </div>
            ) : activeConversation ? (
              <>
                {/* Left Side - Confirmation Panel (Fixed width) */}
                <div className="w-80 xl:w-96 flex-shrink-0 flex flex-col bg-gradient-to-b from-white/5 to-white/10 backdrop-blur-sm relative z-10 border-r border-white/20">
                  <ConfirmationPanel
                    key={activeConversation.id}
                    conversationId={activeConversation.id}
                    currentUserRole={currentUserRole as 'USER' | 'PROVIDER'}
                    onReviewClick={handleReviewClick}
                  />
                </div>
                
                {/* Right Side - Message Thread (Better proportioned) */}
                <div className="flex-1 min-w-0 flex flex-col overflow-hidden relative z-10">
                  <MessageThread />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full w-full text-white/70 relative z-10">
                <div className="text-center p-8 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-white/20 to-white/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-white mb-2">Conversation not found</p>
                  <p className="text-sm text-white/60 mb-4">The conversation you're looking for doesn't exist or you don't have access to it</p>
                  <button
                    onClick={handleBackToHub}
                    className="px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 font-medium border border-white/30 hover:border-white/40 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
                    <span className="relative z-10">Back to Conversations</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const ConversationView: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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

  // Redirect if no conversation ID
  useEffect(() => {
    if (!conversationId) {
      navigate('/conversation-hub');
    }
  }, [conversationId, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center p-8 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse rounded-xl"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/20 border-t-white mx-auto mb-4 relative z-10"></div>
            <p className="text-white/90 relative z-10">Loading conversation...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !currentUser) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center p-8 rounded-xl bg-white/10 backdrop-blur-sm border border-red-500/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-red-500/10 to-red-500/5 animate-pulse rounded-xl"></div>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-red-500/20 to-red-500/10 flex items-center justify-center relative z-10">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-red-400 mb-2 relative z-10">Error loading conversation</p>
            <p className="text-sm text-white/60 mb-6 relative z-10">{error || 'User not found'}</p>
            <button 
              onClick={() => navigate('/conversation-hub')} 
              className="px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 font-medium border border-white/30 hover:border-white/40 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
              <span className="relative z-10">Go to Conversation Hub</span>
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!conversationId) {
    return null; // Will be redirected by useEffect
  }

  return <ConversationViewContent currentUser={currentUser} conversationId={conversationId} />;
};

export default ConversationView;
