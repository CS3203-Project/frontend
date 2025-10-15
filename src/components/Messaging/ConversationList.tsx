import React, { useState, useEffect } from 'react';
import { useMessaging } from './MessagingProvider';
import { UserSearch } from '.';
import { userApi } from '../../api/userApi';
import type { ConversationWithLastMessage } from '../../api/messagingApi';
import type { UserProfile } from '../../api/userApi';

interface ConversationListProps {
  className?: string;
}

export const ConversationList: React.FC<ConversationListProps> = ({ className = '' }) => {
  const {
    conversations,
    activeConversation,
    loading,
    error,
    selectConversation,
    deleteConversation,
    startNewConversation,
    currentUserId,
  } = useMessaging();
  
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [deletingConversation, setDeletingConversation] = useState<string | null>(null);
  const [userProfiles, setUserProfiles] = useState<Map<string, UserProfile>>(new Map());
  const [loadingProfiles, setLoadingProfiles] = useState<Set<string>>(new Set());

  const handleSelectConversation = async (conversation: ConversationWithLastMessage) => {
    await selectConversation(conversation);
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      setDeletingConversation(conversationId);
      await deleteConversation(conversationId);
      setDeletingConversation(null);
    }
  };

  const handleStartNewConversation = async (otherUserId: string) => {
    await startNewConversation(otherUserId);
    setShowNewConversation(false);
  };

  // Fetch user profiles for conversations
  useEffect(() => {
    const fetchUserProfiles = async () => {
      const userIds = conversations
        .map(conv => conv.userIds.find(id => id !== currentUserId))
        .filter((id): id is string => id !== undefined)
        .filter(id => !userProfiles.has(id) && !loadingProfiles.has(id));

      if (userIds.length === 0) return;

      // Mark these IDs as loading
      setLoadingProfiles(prev => new Set([...prev, ...userIds]));

      // Fetch profiles in parallel
      const profilePromises = userIds.map(async (userId) => {
        try {
          console.log('Fetching profile for user:', userId); // Debug log
          const profile = await userApi.getUserById(userId);
          return { userId, profile };
        } catch (error) {
          console.error(`Failed to fetch profile for user ${userId}:`, error);
          // Create a fallback profile to prevent retries
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
      
      // Update profiles map
      setUserProfiles(prev => {
        const newMap = new Map(prev);
        results.forEach(({ userId, profile }) => {
          if (profile) {
            newMap.set(userId, profile);
          }
        });
        return newMap;
      });

      // Remove from loading set
      setLoadingProfiles(prev => {
        const newSet = new Set(prev);
        userIds.forEach(id => newSet.delete(id));
        return newSet;
      });
    };

    fetchUserProfiles();
  }, [conversations, currentUserId]); // Remove userProfiles and loadingProfiles to prevent infinite loop

  const getOtherParticipant = (conversation: ConversationWithLastMessage) => {
    return conversation.userIds.find(id => id !== currentUserId) || 'Unknown User';
  };

  const getContactDisplayName = (conversation: ConversationWithLastMessage) => {
    const otherUserId = getOtherParticipant(conversation);
    const profile = userProfiles.get(otherUserId);
    
    if (profile) {
      return `${profile.firstName} ${profile.lastName}`.trim();
    }
    
    // Fallback to user ID format while loading
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
      <div className={`p-4 text-white/80 bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl ${className}`}>
        <p className="text-sm mb-3">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 font-medium border border-white/30 hover:border-white/40 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
          <span className="relative z-10">Retry</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 border-r border-white/20 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/20 bg-black/40 backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Messages</h2>
          <button
            onClick={() => setShowNewConversation(true)}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 border border-white/20 hover:border-white/30"
            title="Start new conversation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* New Conversation Modal */}
      {showNewConversation && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md mx-4 border border-white/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 animate-pulse rounded-2xl"></div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <h3 className="text-lg font-semibold text-white">Start New Conversation</h3>
              <button
                onClick={() => setShowNewConversation(false)}
                className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/20 hover:border-white/30"
                title="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="relative z-10">
              <UserSearch
                onSelectUser={handleStartNewConversation}
                placeholder="Search for users to message..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading && conversations.length === 0 ? (
          <div className="p-4 space-y-4">
            {/* Skeleton loading for conversations */}
            {[...Array(5)].map((_, index) => (
              <div key={index} className="p-4 border-b border-white/10 animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-white/10 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-1">
                        <div className="h-4 bg-white/5 rounded-lg w-3/4"></div>
                        <div className="h-3 bg-white/5 rounded-lg w-1/2"></div>
                      </div>
                      <div className="h-3 bg-white/5 rounded-lg w-12"></div>
                    </div>
                    <div className="h-4 bg-white/5 rounded-lg w-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-white/20 to-white/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-white/80 font-medium mb-2">No conversations yet</p>
            <p className="text-white/60 text-sm">Start a new conversation to begin messaging</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => handleSelectConversation(conversation)}
              className={`p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-all duration-300 relative group ${
                activeConversation?.id === conversation.id ? 'bg-white/10 border-white/20' : ''
              }`}
            >
              {/* Delete button */}
              <button
                onClick={(e) => handleDeleteConversation(conversation.id, e)}
                disabled={deletingConversation === conversation.id}
                className="absolute top-2 right-2 p-1 text-white/40 hover:text-white/80 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg hover:bg-white/10 border border-white/20 hover:border-white/30"
                title="Delete conversation"
              >
                {deletingConversation === conversation.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>

              <div className="flex items-start space-x-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center text-white font-semibold border border-white/20">
                    {getContactDisplayName(conversation).charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      {/* Contact Name - Primary */}
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-semibold text-white truncate">
                          {getContactDisplayName(conversation)}
                        </p>
                        {loadingProfiles.has(getOtherParticipant(conversation)) && (
                          <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/20 border-t-white"></div>
                        )}
                      </div>
                      
                      {/* Conversation Title - Secondary (if different from contact name) */}
                      {conversation.title && 
                       !conversation.title.includes('Chat with') && 
                       conversation.title !== getContactDisplayName(conversation) && (
                        <p className="text-xs text-white/60 truncate mt-0.5">
                          {conversation.title}
                        </p>
                      )}
                    </div>
                    
                    {/* Time */}
                    {conversation.lastMessage && (
                      <p className="text-xs text-white/60 ml-2 flex-shrink-0">
                        {formatTime(conversation.lastMessage.createdAt)}
                      </p>
                    )}
                  </div>
                  
                  {conversation.lastMessage && (
                    <p className="text-sm text-white/70 truncate mt-1">
                      {conversation.lastMessage.fromId === currentUserId ? 'You: ' : ''}
                      {conversation.lastMessage.content}
                    </p>
                  )}
                  
                  {!conversation.lastMessage && (
                    <p className="text-sm text-white/50 italic mt-1">No messages yet</p>
                  )}
                </div>

                {/* Unread indicator */}
                {conversation.unreadCount && conversation.unreadCount > 0 && (
                  <div className="flex-shrink-0">
                    <div className="bg-white/20 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border border-white/30">
                      {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
