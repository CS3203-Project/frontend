import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMessaging } from '../components/Messaging/MessagingProvider';
import { ConversationList } from '../components/Messaging/ConversationList';
import { MessageThread } from '../components/Messaging/MessageThread';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MessagingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('conversation');
  const { 
    conversations, 
    activeConversation, 
    selectConversation, 
    loadConversations,
    loading 
  } = useMessaging();

  // Debug logging
  useEffect(() => {
    console.log('=== MESSAGING PAGE DEBUG ===');
    console.log('Conversation ID from URL:', conversationId);
    console.log('Active conversation:', activeConversation?.id);
    console.log('Total conversations:', conversations.length);
    console.log('Conversations:', conversations.map(c => ({ id: c.id, title: c.title })));
    console.log('Loading:', loading);
  }, [conversationId, activeConversation, conversations, loading]);

  // Auto-select conversation from URL parameter
  useEffect(() => {
    const handleAutoSelection = async () => {
      if (!conversationId) return;
      
      // If already selected the right conversation, don't reselect
      if (activeConversation?.id === conversationId) return;
      
      // If conversations are loaded and we have a conversation ID from URL
      if (conversations.length > 0) {
        const targetConversation = conversations.find(conv => conv.id === conversationId);
        if (targetConversation && targetConversation.id !== activeConversation?.id) {
          console.log('Auto-selecting conversation from URL:', conversationId);
          selectConversation(targetConversation);
        } else if (!targetConversation) {
          console.warn('Conversation not found in list:', conversationId);
          // The conversation might not be in the list yet, it could be a newly created one
          // Let's try to refresh conversations
          console.log('Refreshing conversations to find new conversation...');
          try {
            await loadConversations();
          } catch (error) {
            console.error('Failed to refresh conversations:', error);
          }
        }
      }
    };

    handleAutoSelection();
  }, [conversationId, activeConversation, conversations, selectConversation, loadConversations]);

  // Separate effect to handle conversation selection after conversations update
  useEffect(() => {
    if (conversationId && conversations.length > 0 && !activeConversation) {
      const targetConversation = conversations.find(conv => conv.id === conversationId);
      if (targetConversation) {
        console.log('Selecting conversation after conversations update:', conversationId);
        selectConversation(targetConversation);
      }
    }
  }, [conversations]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Messages</h1>
        <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '70vh' }}>
          <div className="flex h-full">
            {/* Conversation List Sidebar */}
            <div className="w-1/3 border-r border-gray-200">
              <ConversationList />
            </div>
            
            {/* Message Thread */}
            <div className="flex-1">
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
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-lg">Select a conversation to start messaging</p>
                    <p className="text-sm text-gray-400 mt-2">Your conversations will appear on the left</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MessagingPage;
