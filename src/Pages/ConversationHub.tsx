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
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 animate-pulse"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        <Navbar />
        <main className="flex-grow flex items-center justify-center relative z-10 px-4">
          <div className="text-center bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl max-w-md w-full relative overflow-hidden">
            {/* Glittering border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/20 via-red-400/10 to-red-500/20 animate-pulse"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-red-500/20 to-red-600/20 flex items-center justify-center border border-red-500/30">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-white mb-2">Error loading conversations</p>
              <p className="text-sm text-gray-400 mb-6">{error}</p>
              <button 
                onClick={() => loadConversations()} 
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 animate-pulse"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      {/* Floating orbs for visual appeal */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 mt-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="relative inline-block">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent mb-4">
                Conversation Hub
              </h1>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            </div>
            <p className="text-gray-400 mt-6 text-lg max-w-2xl mx-auto">
              Connect, communicate, and collaborate with your network in a seamless messaging experience
            </p>
          </div>

          {/* Actions */}
          <div className="mb-8 flex justify-center">
            <button
              onClick={() => setShowNewConversation(true)}
              className="px-8 py-4 bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-xl text-white rounded-2xl hover:from-blue-700/90 hover:to-purple-700/90 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center space-x-3 border border-white/20 hover:border-white/30 relative overflow-hidden group"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
              <div className="relative z-10 flex items-center space-x-3">
                <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="font-semibold">Start New Conversation</span>
              </div>
            </button>
          </div>

          {/* New Conversation Modal */}
          {showNewConversation && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 px-4">
              <div className="bg-black/95 backdrop-blur-xl rounded-2xl border border-white/10 p-8 w-full max-w-lg shadow-2xl relative overflow-hidden">
                {/* Glittering border effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse"></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white">Start New Conversation</h3>
                    <button
                      onClick={() => setShowNewConversation(false)}
                      className="p-2 text-gray-400 hover:text-white transition-colors duration-300 rounded-lg hover:bg-white/10"
                      aria-label="Close modal"
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
            </div>
          )}

          {/* Conversations List */}
          <div className="bg-black/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 relative overflow-hidden">
            {/* Glittering border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse"></div>
            
            <div className="relative z-10">
              {loading && conversations.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                  <p className="text-lg font-medium">Loading conversations...</p>
                  <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your messages</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-gray-500/20 to-gray-600/20 flex items-center justify-center border border-white/20">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-xl font-semibold text-white mb-2">No conversations yet</p>
                  <p className="text-gray-500">Start your first conversation to begin messaging with others</p>
                  <button
                    onClick={() => setShowNewConversation(true)}
                    className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                  >
                    Start Messaging
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation)}
                      className="p-6 hover:bg-white/5 cursor-pointer transition-all duration-300 group relative overflow-hidden border-l-4 border-transparent hover:border-blue-500/50"
                    >
                      {/* Hover shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
                      
                      <div className="flex items-center space-x-4 relative z-10">
                        {/* Avatar with enhanced styling */}
                        <div className="flex-shrink-0 relative">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg group-hover:shadow-xl transition-all duration-300 border-2 border-white/20 group-hover:border-white/40">
                            {getContactDisplayName(conversation).charAt(0).toUpperCase()}
                          </div>
                          {/* Enhanced online status indicator */}
                          {checkUserOnlineStatus(getOtherParticipant(conversation)) && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-3 border-black rounded-full shadow-lg animate-pulse">
                              <div className="absolute inset-0 bg-green-400 rounded-full animate-ping"></div>
                            </div>
                          )}
                        </div>

                        {/* Content with enhanced typography */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              {/* Contact Name with gradient */}
                              <div className="flex items-center space-x-2">
                                <p className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent truncate">
                                  {getContactDisplayName(conversation)}
                                </p>
                                {loadingProfiles.has(getOtherParticipant(conversation)) && (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                                )}
                              </div>
                              
                              {/* Conversation Title */}
                              {conversation.title && 
                               !conversation.title.includes('Chat with') && 
                               conversation.title !== getContactDisplayName(conversation) && (
                                <p className="text-sm text-blue-400 truncate mt-1 font-medium">
                                  {conversation.title}
                                </p>
                              )}
                              
                              {/* Last Message */}
                              {conversation.lastMessage && (
                                <p className="text-sm text-gray-400 truncate mt-2 leading-relaxed">
                                  {conversation.lastMessage.fromId === currentUserId ? (
                                    <span className="text-blue-400 font-medium">You: </span>
                                  ) : ''}
                                  {conversation.lastMessage.content}
                                </p>
                              )}
                              
                              {!conversation.lastMessage && (
                                <p className="text-sm text-gray-500 italic mt-2">No messages yet - start the conversation!</p>
                              )}
                            </div>
                            
                            {/* Time and Unread with enhanced styling */}
                            <div className="flex flex-col items-end ml-4 space-y-2">
                              {conversation.lastMessage && (
                                <p className="text-xs text-gray-500 font-medium">
                                  {formatTime(conversation.lastMessage.createdAt)}
                                </p>
                              )}
                              
                              {conversation.unreadCount && conversation.unreadCount > 0 && (
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded-full h-7 w-7 flex items-center justify-center font-bold shadow-lg animate-pulse">
                                  {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Arrow */}
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110">
                            <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 animate-pulse"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        
        <Navbar />
        <main className="flex-grow flex items-center justify-center relative z-10 px-4">
          <div className="text-center bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 p-12 shadow-2xl max-w-md w-full relative overflow-hidden">
            {/* Glittering border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/10 to-blue-500/20 animate-pulse"></div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
              </div>
              <p className="text-xl font-semibold text-white mb-2">Loading Conversation Hub</p>
              <p className="text-gray-400">Setting up your messaging environment...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !currentUser) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 animate-pulse"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        <Navbar />
        <main className="flex-grow flex items-center justify-center relative z-10 px-4">
          <div className="text-center bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 p-12 shadow-2xl max-w-md w-full relative overflow-hidden">
            {/* Glittering border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/20 via-red-400/10 to-red-500/20 animate-pulse"></div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-red-500/20 to-red-600/20 flex items-center justify-center border border-red-500/30">
                <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-xl font-semibold text-white mb-2">Unable to Load Conversation Hub</p>
              <p className="text-gray-400 mb-8">{error || 'User authentication required'}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
                <span className="relative z-10">Retry</span>
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return <ConversationHubContent currentUser={currentUser} />;
};

export default ConversationHub;
