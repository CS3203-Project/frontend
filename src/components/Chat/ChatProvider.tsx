import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { chatApi } from '../../api/chatApi';
import type { ChatConversation, ChatMessage } from '../../api/chatApi';
import { userApi } from '../../api/userApi';
import type { UserProfile } from '../../api/userApi';
import { showInfoToast } from '../../utils/toastUtils';

interface ChatContextType {
  socket: Socket | null;
  isConnected: boolean;
  conversations: ChatConversation[];
  activeConversation: ChatConversation | null;
  messages: ChatMessage[];
  currentProfile: UserProfile | null;
  isLoading: boolean;
  
  // Actions
  setActiveConversation: (conversation: ChatConversation | null) => void;
  sendMessage: (content: string) => void;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  markAsViewed: (conversationId: string) => void;
  startNewConversation: (participantId: string, participantName: string) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize user profile and socket connection
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const user = await userApi.getProfile();
        setCurrentProfile(user);
        
        // Connect to chat socket using user ID as profile ID
        const chatSocket = chatApi.connect(user.id);
        setSocket(chatSocket);

        // Set up socket event listeners
        chatApi.onConnect(() => {
          setIsConnected(true);
          console.log('Connected to chat');
        });

        chatApi.onDisconnect(() => {
          setIsConnected(false);
          console.log('Disconnected from chat');
        });

        chatApi.onMessageReceive((data) => {
          console.log('Message received:', data);
          // Add the new message to current messages if it's for active conversation
          if (activeConversation && data.conversationId === activeConversation.conversationId) {
            setMessages(prev => [...prev, data.message]);
          } else {
            // Show notification for messages from other conversations
            showInfoToast(`New message received`);
          }
          // Reload conversations to update message counts
          loadConversations();
        });

      } catch (error) {
        console.error('Failed to initialize chat:', error);
        setCurrentProfile(null);
      }
    };

    initializeChat();

    return () => {
      chatApi.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, []);

  // Load all conversations
  const loadConversations = async () => {
    if (!socket || !currentProfile) return;
    
    try {
      setIsLoading(true);
      const convs = await chatApi.getConversations();
      setConversations(convs);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      showInfoToast('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  // Load messages for a conversation
  const loadMessages = async (conversationId: string) => {
    if (!socket) return;

    try {
      setIsLoading(true);
      const history = await chatApi.getHistory(conversationId);
      setMessages(history.messages || []);
      
      // Mark messages as viewed
      chatApi.markAsViewed(conversationId);
    } catch (error) {
      console.error('Failed to load messages:', error);
      showInfoToast('Failed to load messages');
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Send a message
  const sendMessage = (content: string) => {
    if (!socket || !content.trim() || !activeConversation || !currentProfile) return;
  
    const messageData: {
      content: string;
      conversationId?: string;
      participantId?: string;
      profileName?: string;
    } = {
      content: content.trim(),
    };
  
    // If the conversation is new (has a temporary ID), send participantId and profileName
    if (activeConversation.conversationId.startsWith('new-')) {
      messageData.participantId = activeConversation.profile.id;
      messageData.profileName = currentProfile.firstName; // Or the full name, as needed
    } else {
      // Otherwise, send the existing conversationId
      messageData.conversationId = activeConversation.conversationId;
    }
  
    chatApi.sendMessage(messageData);
    
    // Optimistically add message to UI
    if (currentProfile) {
      const optimisticMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        content: content.trim(),
        fromId: currentProfile.id,
        createdAt: new Date()
      };
      setMessages(prev => [...prev, optimisticMessage]);
    }
  };

  // Mark conversation messages as viewed
  const markAsViewed = (conversationId: string) => {
    chatApi.markAsViewed(conversationId);
  };

  // Start a new conversation with a user
  const startNewConversation = (participantId: string, participantName: string) => {
    // Create a mock conversation object for immediate UI feedback
    const newConversation: ChatConversation = {
      id: `temp-${Date.now()}`,
      conversationId: `new-${participantId}`,
      countMessages: 0,
      profile: {
        id: participantId,
        name: participantName,
      }
    };

    // Set this as the active conversation
    setActiveConversation(newConversation);
    setMessages([]); // Clear messages for new conversation
  };

  // Load conversations when socket connects
  useEffect(() => {
    if (isConnected) {
      loadConversations();
    }
  }, [isConnected]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.conversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversation]);

  const value: ChatContextType = {
    socket,
    isConnected,
    conversations,
    activeConversation,
    messages,
    currentProfile,
    isLoading,
    setActiveConversation,
    sendMessage,
    loadConversations,
    loadMessages,
    markAsViewed,
    startNewConversation
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
