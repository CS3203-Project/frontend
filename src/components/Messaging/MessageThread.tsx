import React, { useEffect, useRef, useState } from 'react';
import { Clock, Circle, Wifi } from 'lucide-react';
import { useMessaging } from './MessagingProvider';
import { userApi, type UserProfile } from '../../api/userApi';
import type { MessageResponse } from '../../api/messagingApi';
import Loader from '../Loader';

interface MessageThreadProps {
  className?: string;
}

export const MessageThread: React.FC<MessageThreadProps> = ({ className = '' }) => {
  const {
    messages,
    activeConversation,
    loading,
    error,
    sendMessage,
    loadMoreMessages,
    currentUserId,
    checkUserOnlineStatus,
    onlineUsers, // Add onlineUsers to trigger re-renders when it changes
  } = useMessaging();
  
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [contactProfile, setContactProfile] = useState<UserProfile | null>(null);
  const [isContactOnline, setIsContactOnline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive or when conversation changes
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      // Add a small delay to ensure messages are fully rendered and ordered
      const scrollTimeout = setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'end'
          });
        }
      }, 100); // 100ms delay to ensure DOM is updated
      
      return () => clearTimeout(scrollTimeout);
    }
  }, [messages.length, activeConversation?.id]); // Depend on message count and conversation change

  // Fetch contact profile when conversation changes
  useEffect(() => {
    const fetchContactProfile = async () => {
      if (!activeConversation || !currentUserId) {
        setContactProfile(null);
        return;
      }

      const otherUserId = activeConversation.userIds.find(id => id !== currentUserId);
      if (!otherUserId) {
        setContactProfile(null);
        return;
      }

      try {
        const profile = await userApi.getUserById(otherUserId);
        setContactProfile(profile);
      } catch (error) {
        console.error('Failed to fetch contact profile:', error);
        // Set fallback profile
        setContactProfile({
          id: otherUserId,
          firstName: `User ${otherUserId.slice(-8)}`,
          lastName: '',
          email: `${otherUserId}@example.com`,
          role: 'user',
          imageUrl: undefined,
          location: '',
          phone: '',
          createdAt: '',
          isEmailVerified: false,
        } as UserProfile);
      }
    };

    fetchContactProfile();
  }, [activeConversation, currentUserId]);

  // Handle load more messages on scroll to top
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop === 0 && !loading) {
        loadMoreMessages();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [loading, loadMoreMessages]);

    // Track contact online status - updates automatically when onlineUsers changes
  useEffect(() => {
    if (!activeConversation || !currentUserId) {
      setIsContactOnline(false);
      return;
    }

    const otherUserId = activeConversation.userIds.find(id => id !== currentUserId);
    if (!otherUserId) {
      setIsContactOnline(false);
      return;
    }

    // Update status immediately based on current onlineUsers
    setIsContactOnline(checkUserOnlineStatus(otherUserId));
  }, [activeConversation, currentUserId, checkUserOnlineStatus, onlineUsers]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      await sendMessage(newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const groupMessagesByDate = (messages: MessageResponse[]) => {
    const groups: { [key: string]: MessageResponse[] } = {};
    
    messages.forEach(message => {
      const dateKey = new Date(message.createdAt).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    // Sort groups chronologically - oldest dates first, newest dates last
    return Object.entries(groups)
      .map(([date, msgs]) => ({
        date,
        messages: msgs,
        sortKey: new Date(date).getTime() // Add sort key for chronological ordering
      }))
      .sort((a, b) => a.sortKey - b.sortKey) // Sort by date ascending (oldest first)
      .map(({ date, messages }) => ({ date, messages })); // Remove sort key from final result
  };

  if (!activeConversation) {
    return (
      <div className={`flex flex-col h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 ${className}`}>
        {/* Header Skeleton */}
        <div className="p-4 border-b border-white/20 bg-black/40 backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-8 bg-white/10 rounded-lg animate-pulse"></div>
            <div className="flex-1 h-6 bg-white/5 rounded-lg animate-pulse"></div>
            <div className="w-16 h-6 bg-white/10 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Messages Area Skeleton */}
        <div className="flex-1 p-4 space-y-4 overflow-hidden">
          {/* Empty state with skeleton */}
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 max-w-md w-full">
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse rounded-xl"></div>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-white/20 to-white/10 flex items-center justify-center relative z-10">
                <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-white mb-2 relative z-10">No conversation selected</p>
              <p className="text-sm text-white/60 mb-4 relative z-10">Select a conversation to start messaging</p>
            </div>
          </div>
        </div>

        {/* Input Area Skeleton */}
        <div className="p-4 border-t border-white/20 bg-black/40 backdrop-blur-sm">
          <div className="flex space-x-3">
            <div className="flex-1 h-12 bg-white/5 rounded-xl animate-pulse"></div>
            <div className="w-20 h-12 bg-white/10 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 ${className}`}>
        <div className="flex items-center justify-center h-full p-4">
          <div className="text-center p-8 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 relative overflow-hidden max-w-md w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse rounded-xl"></div>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-white/20 to-white/10 flex items-center justify-center relative z-10">
              <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-white mb-2 relative z-10">Connection error</p>
            <p className="text-sm text-white/60 mb-6 relative z-10">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 font-medium border border-white/30 hover:border-white/40 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
              <span className="relative z-10">Retry connection</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);
  const otherUserId = activeConversation.userIds.find(id => id !== currentUserId);
  const contactName = contactProfile 
    ? `${contactProfile.firstName} ${contactProfile.lastName}`.trim() 
    : `User ${otherUserId?.slice(-8) || 'Unknown'}`;

  return (
    <div className={`flex flex-col h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/20 bg-black/40 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-medium text-sm">{contactName}</h3>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isContactOnline ? 'bg-green-400 animate-pulse' : 'bg-white/40'}`}></div>
                <span className={`text-xs ${isContactOnline ? 'text-green-400' : 'text-white/60'}`}>
                  {isContactOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {loading && messages.length === 0 && (
          <div className="space-y-4">
            {/* Skeleton messages loading */}
            <div className="flex justify-start">
              <div className="max-w-xs lg:max-w-md px-4 py-3 bg-white/5 rounded-2xl animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 bg-white/10 rounded-lg"></div>
                  <div className="h-4 bg-white/10 rounded-lg w-3/4"></div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="max-w-xs lg:max-w-md px-4 py-3 bg-white/10 rounded-2xl animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 bg-white/5 rounded-lg"></div>
                  <div className="h-4 bg-white/5 rounded-lg w-5/6"></div>
                </div>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-xs lg:max-w-md px-4 py-3 bg-white/5 rounded-2xl animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 bg-white/10 rounded-lg"></div>
                  <div className="h-4 bg-white/10 rounded-lg w-4/6"></div>
                  <div className="h-4 bg-white/10 rounded-lg w-2/6"></div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="max-w-xs lg:max-w-md px-4 py-3 bg-white/10 rounded-2xl animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 bg-white/5 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && messages.length > 0 && (
          <div className="text-center py-4">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
              <span className="text-white/90 text-sm">Loading more messages...</span>
            </div>
          </div>
        )}

        {messageGroups.map(({ date, messages: groupMessages }) => (
          <div key={date} className="space-y-4">
            {/* Date separator */}
            <div className="flex items-center justify-center py-2">
              <div className="text-white/60 text-xs px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
                {formatDate(date)}
              </div>
            </div>

            {/* Messages for this date */}
            <div className="space-y-3">
              {groupMessages.map((message, index) => {
                const isOwnMessage = message.fromId === currentUserId;
                
                return (
                  <div key={`${message.id}-${index}`} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                      isOwnMessage 
                        ? 'bg-white/20 border-white/30' 
                        : 'bg-white/10 border-white/20'
                    } backdrop-blur-sm rounded-2xl px-4 py-3 border shadow-lg relative overflow-hidden group transition-all duration-300 hover:${
                      isOwnMessage 
                        ? 'border-white/40 bg-white/30' 
                        : 'border-white/30 bg-white/15'
                    }`}>
                      
                      {/* Shimmering gradient effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 group-hover:animate-pulse rounded-2xl"></div>
                      
                      {/* Message content */}
                      <div className="text-white relative z-10 break-words">
                        {message.content}
                      </div>

                      {/* Timestamp */}
                      <div className="flex items-center justify-end mt-2 relative z-10">
                        <span className="text-xs text-white/60">
                          {formatTime(message.createdAt)}
                        </span>
                        {isOwnMessage && (
                          <div className="ml-2">
                            {message.receivedAt ? (
                              <svg className="w-3 h-3 text-white/80" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L4 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-3 h-3 text-white/40" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {messages.length === 0 && !loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 max-w-md w-full">
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse rounded-xl"></div>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-white/20 to-white/10 flex items-center justify-center relative z-10">
                <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-white mb-2 relative z-10">No messages yet</p>
              <p className="text-sm text-white/60 relative z-10">Start the conversation by sending a message</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-1 mt-2" />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-white/20 bg-black/40 backdrop-blur-sm">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows={1}
              className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/60 resize-none focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-300 min-h-[44px] max-h-[120px]"
              disabled={sending}
            />
          </div>
          
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 font-medium border border-white/30 hover:border-white/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px] relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
            ) : (
              <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
        
        {/* Helper text */}
        <div className="mt-2 text-xs text-white/60 text-center">
          Press Enter to send • Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};
