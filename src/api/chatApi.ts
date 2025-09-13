// Placeholder chat API types and functions
// This is a temporary file to resolve TypeScript compilation errors

import { Socket } from 'socket.io-client';

export interface ChatMessage {
  id: string;
  content: string;
  fromId: string;
  createdAt: Date;
}

export interface ChatConversation {
  id: string;
  conversationId: string;
  countMessages: number;
  profile: {
    id: string;
    name: string;
  };
}

export interface SearchUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// Placeholder chatApi implementation
export const chatApi = {
  connect: (_userId: string): Socket | null => {
    console.warn('Chat API not implemented');
    return null;
  },
  
  disconnect: () => {
    console.warn('Chat API disconnect not implemented');
  },
  
  onConnect: (_callback: () => void) => {
    console.warn('Chat API onConnect not implemented');
  },
  
  onDisconnect: (_callback: () => void) => {
    console.warn('Chat API onDisconnect not implemented');
  },
  
  onMessageReceive: (_callback: (data: any) => void) => {
    console.warn('Chat API onMessageReceive not implemented');
  },
  
  getConversations: async (): Promise<ChatConversation[]> => {
    console.warn('Chat API getConversations not implemented');
    return [];
  },
  
  getHistory: async (_conversationId: string): Promise<{ messages: ChatMessage[] }> => {
    console.warn('Chat API getHistory not implemented');
    return { messages: [] };
  },
  
  markAsViewed: (_conversationId: string) => {
    console.warn('Chat API markAsViewed not implemented');
  },
  
  sendMessage: (_messageData: any) => {
    console.warn('Chat API sendMessage not implemented');
  }
};
