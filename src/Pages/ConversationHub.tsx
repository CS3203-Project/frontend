import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessagingProvider, useMessaging } from '../components/Messaging';
import { userApi } from '../api/userApi';
import { UserSearch } from '../components/Messaging';
import type { UserProfile } from '../api/userApi';
import type { ConversationWithLastMessage } from '../api/messagingApi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ConversationHubContent: React.FC<{ currentUser: UserProfile }> = ({ currentUser }) => {
  return (
    <MessagingProvider userId={currentUser.id}>
      <ConversationHubInner currentUserId={currentUser.id} />
    </MessagingProvider>
  );
};

const ConversationHubInner: React.FC<{ currentUserId: string }> = ({ currentUserId }) => {
  const { 
    conversations, 
    loading, 
    error,
    startNewConversation,
    loadConversations,
    checkUserOnlineStatus
  } = useMessaging();
  
  const navigate = useNavigate();
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [userProfiles, setUserProfiles] = useState<Map<string, UserProfile>>(new Map());
  const [loadingProfiles, setLoadingProfiles] = useState<Set<string>>(new Set());

  // Fetch user profiles for conversations
  useEffect(() => {
    const fetchUserProfiles = async () => {
      const userIds = conversations
        .map(conv => conv.userIds.find(id => id !== currentUserId))
        .filter((id): id is string => id !== undefined)
        .filter(id => !userProfiles.has(id) && !loadingProfiles.has(id));

      if (userIds.length === 0) return;

      setLoadingProfiles(prev => new Set([...prev, ...userIds]));

      const profilePromises = userIds.map(async (userId) => {
        try {
          const profile = await userApi.getUserById(userId);
          return { userId, profile };
        } catch (error) {
          console.error(`Failed to fetch profile for user ${userId}:`, error);
          return { 
            userId, 
            profile: {
              id: userId,
              firstName: 'Unknown',
              lastName: 'User',
              email: 'unknown@example.com',
              role: 'USER',
              isActive: false,
              location: '',
              phone: '',
              createdAt: new Date().toISOString(),
              isEmailVerified: false
            }
          };
        }
      });

      const results = await Promise.all(profilePromises);
      
      setUserProfiles(prev => {
        const newMap = new Map(prev);
        results.forEach(({ userId, profile }) => {
          if (profile) {
            newMap.set(userId, profile);
          }
        });
        return newMap;
      });

      setLoadingProfiles(prev => {
        const newSet = new Set(prev);
        userIds.forEach(id => newSet.delete(id));
        return newSet;
      });
    };

    fetchUserProfiles();
  }, [conversations, currentUserId]);

  const handleStartNewConversation = async (otherUserId: string) => {
    try {
      await startNewConversation(otherUserId);
      setShowNewConversation(false);
      // Reload conversations to get the latest list
      await loadConversations();
      // After creating/finding conversation, navigate to it
      setTimeout(() => {
        const conversation = conversations.find(conv => 
          conv.userIds.includes(otherUserId) && conv.userIds.includes(currentUserId)
        );
        if (conversation) {
          navigate(`/conversation/${conversation.id}`);
        } else {
          // If we can't find it in the current list, reload and try again
          loadConversations().then(() => {
            const updatedConversation = conversations.find(conv => 
              conv.userIds.includes(otherUserId) && conv.userIds.includes(currentUserId)
            );
            if (updatedConversation) {
              navigate(`/conversation/${updatedConversation.id}`);
            }
          });
        }
      }, 500);
    } catch (error) {
      console.error('Failed to start new conversation:', error);
    }
  };

  const handleSelectConversation = (conversation: ConversationWithLastMessage) => {
    navigate(`/conversation/${conversation.id}`);
  };

  const getOtherParticipant = (conversation: ConversationWithLastMessage) => {
    return conversation.userIds.find(id => id !== currentUserId) || 'Unknown User';
  };

  const getContactDisplayName = (conversation: ConversationWithLastMessage) => {
    const otherUserId = getOtherParticipant(conversation);
    const profile = userProfiles.get(otherUserId);
    
    if (profile) {
      return `${profile.firstName} ${profile.lastName}`.trim();
    }
    
    return `User ${otherUserId.slice(-8)}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center text-red-500">
            <p className="text-lg font-medium">Error loading conversations</p>
            <p className="text-sm mt-2">{error}</p>
            <button 
              onClick={() => loadConversations()} 
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Conversation Hub</h1>
            <p className="text-gray-600 mt-2">Manage your conversations and start new ones</p>
          </div>

          {/* Actions */}
          <div className="mb-6">
            <button
              onClick={() => setShowNewConversation(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Start New Conversation</span>
            </button>
          </div>

          {/* New Conversation Modal */}
          {showNewConversation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Start New Conversation</h3>
                  <button
                    onClick={() => setShowNewConversation(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <UserSearch
                  onSelectUser={handleStartNewConversation}
                  placeholder="Search for users to message..."
                />
              </div>
            </div>
          )}

          {/* Conversations List */}
          <div className="bg-white rounded-lg shadow-md">
            {loading && conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p>Loading conversations...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-lg">No conversations yet</p>
                <p className="text-sm mt-2">Start a new conversation to begin messaging</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation)}
                    className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Avatar with online indicator */}
                      <div className="flex-shrink-0 relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {getContactDisplayName(conversation).charAt(0).toUpperCase()}
                        </div>
                        {/* Online status indicator */}
                        {checkUserOnlineStatus(getOtherParticipant(conversation)) && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            {/* Contact Name */}
                            <div className="flex items-center space-x-2">
                              <p className="text-lg font-semibold text-gray-900 truncate">
                                {getContactDisplayName(conversation)}
                              </p>
                              {loadingProfiles.has(getOtherParticipant(conversation)) && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                              )}
                            </div>
                            
                            {/* Conversation Title */}
                            {conversation.title && 
                             !conversation.title.includes('Chat with') && 
                             conversation.title !== getContactDisplayName(conversation) && (
                              <p className="text-sm text-gray-500 truncate mt-1">
                                {conversation.title}
                              </p>
                            )}
                            
                            {/* Last Message */}
                            {conversation.lastMessage && (
                              <p className="text-sm text-gray-600 truncate mt-2">
                                {conversation.lastMessage.fromId === currentUserId ? 'You: ' : ''}
                                {conversation.lastMessage.content}
                              </p>
                            )}
                            
                            {!conversation.lastMessage && (
                              <p className="text-sm text-gray-400 italic mt-2">No messages yet</p>
                            )}
                          </div>
                          
                          {/* Time and Unread */}
                          <div className="flex flex-col items-end ml-4">
                            {conversation.lastMessage && (
                              <p className="text-xs text-gray-500 mb-2">
                                {formatTime(conversation.lastMessage.createdAt)}
                              </p>
                            )}
                            
                            {conversation.unreadCount && conversation.unreadCount > 0 && (
                              <div className="bg-blue-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const ConversationHub: React.FC = () => {
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
            <p className="text-gray-600">Loading conversations...</p>
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
            <p className="text-lg font-medium">Error loading conversation hub</p>
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

  return <ConversationHubContent currentUser={currentUser} />;
};

export default ConversationHub;
