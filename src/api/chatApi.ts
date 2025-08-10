import apiClient from './axios';
import { io, Socket } from 'socket.io-client';

// Types for chat API
export interface ChatProfile {
  id: string;
  name: string;
  lastSeenAt: Date | null;
}

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

export interface ChatHistory {
  profile: ChatProfile;
  historyId: string;
  messages: ChatMessage[];
}

export interface ChatSettings {
  notify: boolean;
}

export interface SearchUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
}

// Chat API Client
class ChatApiClient {
  private socket: Socket | null = null;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.MODE === 'production' 
      ? 'YOUR_PRODUCTION_CHAT_API_URL' 
      : 'http://localhost:3002';
  }

  // Socket connection
  connect(profileId: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(`${this.baseURL}/chat`, {
      query: {
        profile: profileId
      },
      autoConnect: true,
      transports: ['websocket']
    });

    // Add profileId to socket for compatibility
    (this.socket as any).profileId = profileId;

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Socket event handlers
  onConnect(callback: () => void) {
    this.socket?.on('connect', callback);
  }

  onDisconnect(callback: () => void) {
    this.socket?.on('disconnect', callback);
  }

  onMessageReceive(callback: (message: any) => void) {
    this.socket?.on('message:receive', callback);
  }

  // Socket message sending
  sendMessage(data: {
    conversationId?: string;
    participantId?: string;
    content: string;
  }) {
    console.log('Sending message:', data);
    this.socket?.emit('message:send', data);
  }

  // Get conversation history
  async getHistory(conversationId: string, page: number = 0, limit: number = 50): Promise<ChatHistory> {
    return new Promise((resolve, reject) => {
      this.socket?.emit('history:get', { conversationId, page, limit }, (response: ChatHistory) => {
        if (response) {
          resolve(response);
        } else {
          reject(new Error('Failed to get history'));
        }
      });
    });
  }

  // Get all conversations
  async getConversations(): Promise<ChatConversation[]> {
    return new Promise((resolve, reject) => {
      this.socket?.emit('conversation:get', {}, (response: ChatConversation[]) => {
        if (response) {
          resolve(response);
        } else {
          reject(new Error('Failed to get conversations'));
        }
      });
    });
  }

  // Mark messages as viewed
  markAsViewed(conversationId: string) {
    this.socket?.emit('message:viewed', { conversationId });
  }

  // Delete conversation history
  deleteHistory(conversationId: string) {
    this.socket?.emit('history:delete', { conversationId });
  }

  // Delete entire conversation
  deleteConversation(conversationId: string) {
    this.socket?.emit('conversation:delete', { conversationId });
  }

  // REST API methods
  async getSettings(profileId: string): Promise<ChatSettings> {
    const response = await apiClient.get(`${this.baseURL}/chat/${profileId}/settings`);
    return response.data;
  }

  async updateSettings(profileId: string, settings: Partial<ChatSettings>): Promise<ChatSettings> {
    const response = await apiClient.patch(`${this.baseURL}/chat/${profileId}/settings`, settings);
    return response.data;
  }

  // Server-sent events for online profiles
  createProfilesOnlineStream(): EventSource {
    return new EventSource(`${this.baseURL}/chat/profiles/online`);
  }

  // Server-sent events for message retrieval
  createMessageRetrievalStream(): EventSource {
    return new EventSource(`${this.baseURL}/chat/retrieve/messages`);
  }

  // Search users for messaging
  async searchUsers(query: string, token: string): Promise<SearchUser[]> {
    const response = await apiClient.get(`http://localhost:3000/users/search`, {
      params: { q: query },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  }
}

export const chatApi = new ChatApiClient();
