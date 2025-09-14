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
      <div className={`p-4 text-red-500 ${className}`}>
        <p>Error: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-white border-r border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <button
            onClick={() => setShowNewConversation(true)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
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
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
      <div className="flex-1 overflow-y-auto">
        {loading && conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            Loading conversations...
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No conversations yet</p>
            <p className="text-sm mt-1">Start a new conversation to begin messaging</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => handleSelectConversation(conversation)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors relative ${
                activeConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              {/* Delete button */}
              <button
                onClick={(e) => handleDeleteConversation(conversation.id, e)}
                disabled={deletingConversation === conversation.id}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete conversation"
              >
                {deletingConversation === conversation.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>

              <div className="flex items-start space-x-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {getContactDisplayName(conversation).charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      {/* Contact Name - Primary */}
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {getContactDisplayName(conversation)}
                        </p>
                        {loadingProfiles.has(getOtherParticipant(conversation)) && (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        )}
                      </div>
                      
                      {/* Conversation Title - Secondary (if different from contact name) */}
                      {conversation.title && 
                       !conversation.title.includes('Chat with') && 
                       conversation.title !== getContactDisplayName(conversation) && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {conversation.title}
                        </p>
                      )}
                    </div>
                    
                    {/* Time */}
                    {conversation.lastMessage && (
                      <p className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatTime(conversation.lastMessage.createdAt)}
                      </p>
                    )}
                  </div>
                  
                  {conversation.lastMessage && (
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {conversation.lastMessage.fromId === currentUserId ? 'You: ' : ''}
                      {conversation.lastMessage.content}
                    </p>
                  )}
                  
                  {!conversation.lastMessage && (
                    <p className="text-sm text-gray-400 italic mt-1">No messages yet</p>
                  )}
                </div>

                {/* Unread indicator */}
                {conversation.unreadCount && conversation.unreadCount > 0 && (
                  <div className="flex-shrink-0">
                    <div className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
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
