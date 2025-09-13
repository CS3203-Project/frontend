import React, { useState, useRef, useEffect } from 'react';
import { useMessaging } from './MessagingProvider';
import { userApi } from '../../api/userApi';
import type { MessageResponse } from '../../api/messagingApi';
import type { UserProfile } from '../../api/userApi';

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

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
    
    return Object.entries(groups).map(([date, msgs]) => ({
      date,
      messages: msgs
    }));
  };

  if (!activeConversation) {
    return (
      <div className={`flex items-center justify-center h-full bg-gray-900 ${className}`}>
        <div className="text-center text-green-400 font-mono">
          <div className="text-6xl mb-4">⚠</div>
          <div className="text-lg font-bold mb-2">$ NO ACTIVE CONNECTION</div>
          <div className="text-sm text-gray-500">
            Select a conversation from the terminal list to establish connection...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 text-center text-red-400 bg-gray-900 font-mono ${className}`}>
        <div className="text-4xl mb-4">✖</div>
        <div className="text-lg font-bold mb-2">$ CONNECTION ERROR</div>
        <div className="text-sm mb-4">Error: {error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-red-600 text-white font-mono rounded hover:bg-red-500"
        >
          RETRY CONNECTION
        </button>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);
  const otherUserId = activeConversation.userIds.find(id => id !== currentUserId);
  const contactName = contactProfile 
    ? `${contactProfile.firstName} ${contactProfile.lastName}`.trim() 
    : `User ${otherUserId?.slice(-8) || 'Unknown'}`;

  return (
    <div className={`flex flex-col h-full bg-gray-900 ${className}`} style={{ fontFamily: 'Consolas, Monaco, "Lucida Console", "Liberation Mono", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace' }}>
      {/* Terminal Header */}
      <div className="p-3 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center space-x-2">
          {/* Terminal dots */}
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          
          {/* Terminal title */}
          <div className="flex-1 text-center">
            <span className="text-gray-300 text-sm font-mono">
              Chat Terminal - {contactName}
            </span>
          </div>
          
          {/* Connection status */}
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${isContactOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className={`text-xs font-mono ${isContactOnline ? 'text-green-400' : 'text-gray-400'}`}>
              {isContactOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages - Terminal Style */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-1 bg-gray-900"
        style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: '#4B5563 #1F2937'
        }}
      >
        {loading && messages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-green-400 font-mono text-sm mb-2">
              $ Initializing connection...
            </div>
            <div className="animate-pulse text-green-400 font-mono text-xs">
              ████████████████████████████████
            </div>
          </div>
        )}

        {loading && messages.length > 0 && (
          <div className="text-green-400 font-mono text-xs py-2">
            <span className="animate-pulse">$ Loading previous messages...</span>
          </div>
        )}

        {messageGroups.map(({ date, messages: groupMessages }) => (
          <div key={date} className="space-y-1">
            {/* Date separator - Terminal style */}
            <div className="flex items-center justify-center py-2">
              <div className="text-gray-500 text-xs font-mono px-2">
                ─────────── {formatDate(date)} ───────────
              </div>
            </div>

            {/* Messages for this date */}
            <div className="space-y-1">
              {groupMessages.map((message, index) => {
                const isOwnMessage = message.fromId === currentUserId;
                const timestamp = formatTime(message.createdAt);
                const username = isOwnMessage ? 'YOU' : contactName.toUpperCase().replace(/\s+/g, '_');
                const messageId = `#${String(index + 1).padStart(3, '0')}`;
                
                return (
                  <div key={message.id} className="font-mono text-sm">
                    {/* Message header with timestamp and user */}
                    <div className={`flex items-center space-x-2 mb-1 ${isOwnMessage ? 'text-blue-400' : 'text-green-400'}`}>
                      <span className="text-gray-500 text-xs">{timestamp}</span>
                      <span className="text-xs">{messageId}</span>
                      <span className="font-bold">{username}</span>
                    </div>
                    
                    {/* Message content */}
                    <div className={`pl-4 pb-2 ${isOwnMessage ? 'text-blue-300' : 'text-green-300'}`}>
                      <span className="break-words">{message.content}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {messages.length === 0 && !loading && (
          <div className="text-center py-8">
            <div className="text-gray-500 font-mono text-sm mb-2">
              $ Connection established
            </div>
            <div className="text-gray-400 font-mono text-xs">
              No messages in buffer. Start typing to initiate conversation...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message input - Terminal Style */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          {/* Terminal prompt */}
          <div className="flex-shrink-0 text-green-400 font-mono text-sm self-end pb-3">
            $
          </div>
          
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type message here..."
              rows={1}
              className="w-full p-3 bg-gray-900 border border-gray-600 rounded text-green-300 placeholder-gray-500 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              style={{ 
                minHeight: '44px', 
                maxHeight: '120px',
                fontFamily: 'Consolas, Monaco, "Lucida Console", "Liberation Mono", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace'
              }}
              disabled={sending}
            />
          </div>
          
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2 bg-green-600 text-black font-mono text-sm font-bold rounded hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[60px]"
          >
            {sending ? (
              <div className="text-black font-mono text-xs">...</div>
            ) : (
              'SEND'
            )}
          </button>
        </form>
        
        {/* Terminal info line */}
        <div className="mt-2 text-xs text-gray-500 font-mono">
          Press Enter to send • Shift+Enter for new line • {messages.length} messages in buffer
        </div>
      </div>
    </div>
  );
};
