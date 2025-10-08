import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { messagingApi } from '../../api/messagingApi';
import { userApi } from '../../api/userApi';
import type { ConversationWithLastMessage, MessageResponse } from '../../api/messagingApi';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAuth } from '../../contexts/AuthContext';
import { useLoader } from '../LoaderContext';
import { sortMessagesByTimestamp, insertMessageInOrder, mergeMessagesInOrder, debugMessageOrder } from '../../utils/messageOrdering';

interface MessagingContextType {
  conversations: ConversationWithLastMessage[];
  activeConversation: ConversationWithLastMessage | null;
  messages: MessageResponse[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  currentUserId: string | null;
  
  // WebSocket status
  isWebSocketConnected: boolean;
  onlineUsers: string[];
  
  // Actions
  loadConversations: () => Promise<void>;
  selectConversation: (conversation: ConversationWithLastMessage) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  startNewConversation: (otherUserId: string, title?: string) => Promise<void>;
  markConversationAsRead: (conversationId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  checkUserOnlineStatus: (userId: string) => boolean;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

interface MessagingProviderProps {
  children: ReactNode;
  userId: string;
}

export const MessagingProvider: React.FC<MessagingProviderProps> = ({ children, userId }) => {
  const { user: currentUser } = useAuth(); // Get current user data for email notifications
  const [conversations, setConversations] = useState<ConversationWithLastMessage[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationWithLastMessage | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messagesPage, setMessagesPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // WebSocket integration
  const webSocket = useWebSocket({
    url: 'http://localhost:3001/messaging',
    userId,
    autoConnect: true,
  });

  // Load conversations on mount and when userId changes
  useEffect(() => {
    if (userId) {
      loadConversations();
      loadUnreadCount();
    }
  }, [userId]);

  const handleError = (error: any, message: string) => {
    console.error(message, error);
    setError(message);
    setLoading(false);
  };

  const loadConversations = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const conversationsData = await messagingApi.getConversationsWithLastMessage(userId);
      setConversations(conversationsData);
    } catch (error) {
      handleError(error, 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    if (!userId) return;
    
    try {
      const { count } = await messagingApi.getUnreadCount(userId);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const selectConversation = async (conversation: ConversationWithLastMessage) => {
    try {
      setLoading(true);
      setError(null);
      
      // Leave previous conversation if any
      if (activeConversation && webSocket.isConnected) {
        webSocket.emit('conversation:leave', { userId });
      }
      
      setActiveConversation(conversation);
      setMessagesPage(1);
      setHasMoreMessages(true);
      
      // Enter new conversation
      if (webSocket.isConnected) {
        webSocket.emit('conversation:enter', { 
          userId, 
          conversationId: conversation.id 
        });
      }
      
      // Load messages for this conversation - Get NEWEST messages first
      const messagesData = await messagingApi.getMessages(conversation.id, 1, 20);
      
      // CRITICAL FIX: Since backend now returns newest first, reverse to get chronological order
      // Backend returns: [newest...oldest], we need: [oldest...newest] for UI display
      const orderedMessages = sortMessagesByTimestamp(messagesData.data);
      debugMessageOrder(orderedMessages, 'Initial Load - Latest Messages');
      
      setMessages(orderedMessages);
      setHasMoreMessages(messagesData.totalPages > 1);
      
      // Mark conversation as read if there are unread messages
      if (conversation.unreadCount && conversation.unreadCount > 0) {
        await markConversationAsRead(conversation.id);
      }
    } catch (error) {
      handleError(error, 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!activeConversation || !userId) return;

    try {
      setError(null);
      // Ensure socket is connected before sending
      if (!webSocket.isConnected) {
        webSocket.connect();
      }
      // Determine the recipient (the other user in the conversation)
      const recipientId = activeConversation.userIds.find(id => id !== userId);
      if (!recipientId) throw new Error('Could not determine recipient');

      // Check if WebSocket is connected, use WebSocket if available, fallback to REST
      if (webSocket.isConnected) {
        console.log('📤 Sending message via WebSocket');
        
        // Prepare user data for email notifications
        let senderName: string | undefined;
        let senderEmail: string | undefined;
        let recipientName: string | undefined;
        let recipientEmail: string | undefined;

        // Get sender data from current user
        if (currentUser) {
          senderName = `${currentUser.firstName} ${currentUser.lastName}`.trim();
          senderEmail = currentUser.email;
        }

        // Get recipient data - try to fetch from API
        try {
          const recipientUser = await userApi.getUserById(recipientId);
          if (recipientUser) {
            recipientName = `${recipientUser.firstName} ${recipientUser.lastName}`.trim();
            recipientEmail = recipientUser.email;
          }
        } catch (error) {
          console.warn('Failed to fetch recipient user data:', error);
          // Continue without recipient data - message will still send but no email notification
        }

        // Send via WebSocket with user data for email notifications
        webSocket.emit('message:send', {
          content,
          fromId: userId,
          toId: recipientId,
          conversationId: activeConversation.id,
          // Include user data for email notifications
          senderName,
          senderEmail,
          recipientName,
          recipientEmail,
        });
        
        console.log('📧 WebSocket message sent with email data:', {
          senderName,
          senderEmail,
          recipientName,
          recipientEmail,
        });
        
        // Note: The actual message will be added to the UI when we receive the 'message:sent' confirmation
        // No need to optimistically add here since we handle it in the sent confirmation
      } else {
        console.log('📤 Sending message via REST API (WebSocket not connected)');
        // Fallback to REST API
        const newMessage = await messagingApi.sendMessage({
          content,
          fromId: userId,
          toId: recipientId,
          conversationId: activeConversation.id,
        });
        
        // CRITICAL FIX: Use utility function to maintain chronological order
        setMessages(prev => {
          const updatedMessages = insertMessageInOrder(prev, newMessage);
          debugMessageOrder(updatedMessages, 'REST API Send');
          return updatedMessages;
        });
        
        // Update the conversation's last message
        setConversations(prev => 
          prev.map(conv => 
            conv.id === activeConversation.id 
              ? { ...conv, lastMessage: newMessage }
              : conv
          )
        );
        // Update active conversation
        setActiveConversation(prev => 
          prev ? { ...prev, lastMessage: newMessage } : null
        );
      }
    } catch (error) {
      handleError(error, 'Failed to send message');
    }
  };

  const startNewConversation = async (otherUserId: string, title?: string) => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting new conversation with user:', otherUserId);
      
      // Check if conversation already exists
      console.log('Checking for existing conversation...');
      const existingConversation = await messagingApi.findConversationByParticipants(userId, otherUserId);
      
      if (existingConversation) {
        console.log('Found existing conversation:', existingConversation);
        // Find the full conversation data
        const fullConversation = conversations.find(conv => conv.id === existingConversation.id);
        if (fullConversation) {
          await selectConversation(fullConversation);
          return;
        }
      }
      
      // Create new conversation
      console.log('Creating new conversation...');
      const newConversation = await messagingApi.createConversation({
        userIds: [userId, otherUserId],
        title,
      });
      
      console.log('Created new conversation:', newConversation);
      
      // Convert to ConversationWithLastMessage format
      const conversationWithData: ConversationWithLastMessage = {
        ...newConversation,
        unreadCount: 0,
      };
      
      // Add to conversations list
      setConversations(prev => [conversationWithData, ...prev]);
      
      // Select the new conversation
      await selectConversation(conversationWithData);
      
    } catch (error) {
      console.error('Detailed error in startNewConversation:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      handleError(error, `Failed to start new conversation: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const markConversationAsRead = async (conversationId: string) => {
    if (!userId) return;

    try {
      // Check if WebSocket is connected, use WebSocket if available, fallback to REST
      if (webSocket.isConnected) {
        console.log('📖 Marking conversation as read via WebSocket');
        
        // Use WebSocket for real-time read receipts
        webSocket.emit('conversation:mark-read', {
          conversationId,
          userId,
        });
        
      } else {
        console.log('📖 Marking conversation as read via REST API (WebSocket not connected)');
        
        // Fallback to REST API
        await messagingApi.markConversationAsRead(conversationId, userId);
      }
      
      // Update local state immediately for better UX
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
      
      // Update unread count
      await loadUnreadCount();
      
    } catch (error) {
      console.error('Failed to mark conversation as read:', error);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      
      await messagingApi.deleteConversation(conversationId, userId);
      
      // Remove from conversations
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      // Clear active conversation if it was deleted
      if (activeConversation?.id === conversationId) {
        setActiveConversation(null);
        setMessages([]);
      }
      
    } catch (error) {
      handleError(error, 'Failed to delete conversation');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!activeConversation || !hasMoreMessages || loading) return;

    try {
      setLoading(true);
      const nextPage = messagesPage + 1;
      
      // Fetch older messages (next page in reverse chronological order)
      const messagesData = await messagingApi.getMessages(activeConversation.id, nextPage, 20);
      
      // CRITICAL FIX: Backend returns newer-to-older, we need chronological order
      const orderedNewMessages = sortMessagesByTimestamp(messagesData.data);
      
      // Use utility function to merge OLDER messages with current messages
      setMessages(prev => {
        // Since we're loading OLDER messages, they should come BEFORE current messages
        const mergedMessages = [...orderedNewMessages, ...prev];
        const finalOrdered = sortMessagesByTimestamp(mergedMessages);
        debugMessageOrder(finalOrdered, `Load More Messages - Page ${nextPage}`);
        return finalOrdered;
      });
      
      setMessagesPage(nextPage);
      setHasMoreMessages(nextPage < messagesData.totalPages);
      
    } catch (error) {
      console.error('Failed to load more messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // WebSocket event listeners for real-time message reception
  useEffect(() => {
    if (!webSocket.socket) return;

    // Handle incoming messages (from other users only)
    const handleMessageReceived = (messageData: MessageResponse) => {
      console.log('📥 Received real-time message:', messageData);
      
      // Only handle messages from other users (not our own messages)
      if (messageData.fromId === userId) {
        console.log('Ignoring own message in received handler');
        return;
      }
      
      // Add message to current conversation if it matches active conversation
      if (activeConversation && messageData.conversationId === activeConversation.id) {
        setMessages(prev => {
          // CRITICAL FIX: Use utility function to maintain chronological order
          const updatedMessages = insertMessageInOrder(prev, messageData);
          debugMessageOrder(updatedMessages, 'Message Received');
          return updatedMessages;
        });
      }
      // Update conversations list with new last message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === messageData.conversationId 
            ? { ...conv, lastMessage: messageData }
            : conv
        )
      );
      // Update unread count only for messages from others
      loadUnreadCount();
    };

    // Handle message sent confirmation (our own messages only)
    const handleMessageSent = (messageData: MessageResponse) => {
      console.log('📤 Message sent confirmation:', messageData);
      
      // Only handle our own messages in sent confirmation
      if (messageData.fromId !== userId) {
        console.log('Ignoring other user message in sent handler');
        return;
      }
      
      // Add message to current conversation if it matches active conversation
      if (activeConversation && messageData.conversationId === activeConversation.id) {
        setMessages(prev => {
          // CRITICAL FIX: Use utility function to maintain chronological order
          const updatedMessages = insertMessageInOrder(prev, messageData);
          debugMessageOrder(updatedMessages, 'Message Sent');
          return updatedMessages;
        });
      }
      // Update conversations list with new last message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === messageData.conversationId 
            ? { ...conv, lastMessage: messageData }
            : conv
        )
      );
      // Update active conversation
      setActiveConversation(prev => 
        prev && prev.id === messageData.conversationId 
          ? { ...prev, lastMessage: messageData } 
          : prev
      );
    };

    // Handle WebSocket errors
    const handleMessageError = (error: any) => {
      console.error('❌ WebSocket message error:', error);
      setError(`Message error: ${error.error || 'Unknown error'}`);
    };

    // Handle read receipts
    const handleMessageReadReceipt = (data: { messageId: string; readBy: string; readAt: string }) => {
      console.log('📖 Message read receipt received:', data);
      // Update message status in current conversation
      if (activeConversation) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === data.messageId 
              ? { ...msg, receivedAt: data.readAt }
              : msg
          )
        );
      }
    };

    // Handle conversation marked as read confirmation
    const handleConversationMarkedRead = (data: { conversationId: string; success: boolean }) => {
      console.log('📖 Conversation marked as read:', data);
      if (data.success) {
        // Update conversations list
        setConversations(prev =>
          prev.map(conv =>
            conv.id === data.conversationId
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        );
        // Update unread count
        loadUnreadCount();
      }
    };

    // Handle auto-read notification
    const handleMessageAutoRead = (data: { messageId: string; conversationId: string }) => {
      console.log('📖 Message auto-marked as read:', data);
      // Update message read status in current messages
      if (activeConversation && data.conversationId === activeConversation.id) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === data.messageId 
              ? { ...msg, receivedAt: new Date().toISOString() }
              : msg
          )
        );
      }
    };

    // Handle online users list
    const handleOnlineUsersList = (userIds: string[]) => {
      console.log('👥 Online users updated:', userIds);
      setOnlineUsers(userIds);
    };

    // Handle real-time user online status changes
    const handleUserOnline = (data: { userId: string; status: 'online' }) => {
      console.log('🟢 User came online:', data.userId);
      setOnlineUsers(prev => {
        if (!prev.includes(data.userId)) {
          return [...prev, data.userId];
        }
        return prev;
      });
    };

    const handleUserOffline = (data: { userId: string; status: 'offline' }) => {
      console.log('🔴 User went offline:', data.userId);
      setOnlineUsers(prev => prev.filter(id => id !== data.userId));
    };

    // Register event listeners
    webSocket.on('message:received', handleMessageReceived);
    webSocket.on('message:sent', handleMessageSent);
    webSocket.on('message:error', handleMessageError);
    webSocket.on('message:read-receipt', handleMessageReadReceipt);
    webSocket.on('message:auto-read', handleMessageAutoRead);
    webSocket.on('conversation:marked-read', handleConversationMarkedRead);
    webSocket.on('users:online-list', handleOnlineUsersList);
    webSocket.on('user:online', handleUserOnline);
    webSocket.on('user:offline', handleUserOffline);

    // Cleanup listeners on unmount or socket change
    return () => {
      webSocket.off('message:received', handleMessageReceived);
      webSocket.off('message:sent', handleMessageSent);
      webSocket.off('message:error', handleMessageError);
      webSocket.off('message:read-receipt', handleMessageReadReceipt);
      webSocket.off('message:auto-read', handleMessageAutoRead);
      webSocket.off('conversation:marked-read', handleConversationMarkedRead);
      webSocket.off('users:online-list', handleOnlineUsersList);
      webSocket.off('user:online', handleUserOnline);
      webSocket.off('user:offline', handleUserOffline);
    };
  }, [webSocket.socket, activeConversation?.id, userId]); // Only depend on essential values that affect the handlers

  // Request online users periodically when connected
  useEffect(() => {
    if (!webSocket.isConnected) return;

    const requestOnlineUsers = () => {
      webSocket.emit('users:online', {});
    };

    // Request initial online users only once when connected
    requestOnlineUsers();

    // Optional: Uncomment below for backup polling (currently disabled for pure real-time)
    // const intervalId = setInterval(requestOnlineUsers, 5000);
    // return () => clearInterval(intervalId);
  }, [webSocket.isConnected]);

  // Helper function to check if a user is online
  const checkUserOnlineStatus = (userId: string): boolean => {
    return onlineUsers.includes(userId);
  };

  // Ensure user joins and enters conversation on connect or when activeConversation changes
  useEffect(() => {
    if (webSocket.isConnected && userId && activeConversation?.id) {
      console.log('🔌 Joining user and entering conversation:', userId, activeConversation.id);
      webSocket.emit('user:join', { userId });
      webSocket.emit('conversation:enter', { userId, conversationId: activeConversation.id });
    }
  }, [webSocket.isConnected, userId, activeConversation?.id]); // Only depend on essential identifiers

  // Cleanup: Leave conversation when component unmounts or user changes
  useEffect(() => {
    return () => {
      if (activeConversation && webSocket.isConnected) {
        webSocket.emit('conversation:leave', { userId });
      }
    };
  }, [userId]); // Only run when userId changes or component unmounts

  const value: MessagingContextType = {
    conversations,
    activeConversation,
    messages,
    unreadCount,
    loading,
    error,
    currentUserId: userId,
    isWebSocketConnected: webSocket.isConnected,
    onlineUsers,
    loadConversations,
    selectConversation,
    sendMessage,
    startNewConversation,
    markConversationAsRead,
    deleteConversation,
    loadMoreMessages,
    checkUserOnlineStatus,
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};
