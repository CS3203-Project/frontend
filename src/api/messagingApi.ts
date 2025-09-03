// Messaging API types and functions
const BASE_URL = 'http://localhost:3001/messaging';

export interface ConversationResponse {
  id: string;
  userIds: string[];
  title: string | null;
}

export interface MessageResponse {
  id: string;
  content: string;
  fromId: string;
  toId: string;
  conversationId: string;
  createdAt: string;
  receivedAt: string | null;
}

export interface ConversationWithLastMessage extends ConversationResponse {
  lastMessage?: MessageResponse;
  unreadCount?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateConversationDto {
  userIds: string[];
  title?: string;
}

export interface CreateMessageDto {
  content: string;
  fromId: string;
  toId: string;
  conversationId: string;
}

export interface SearchUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl?: string;
}

// API Functions
export const messagingApi = {
  // Conversation endpoints
  async createConversation(data: CreateConversationDto): Promise<ConversationResponse> {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    
    console.log('Creating conversation with token:', token ? 'Token present' : 'No token');
    console.log('Request data:', data);
    
    const response = await fetch(`${BASE_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error(errorData.message || `HTTP ${response.status}: Failed to create conversation`);
    }
    
    const result = await response.json();
    console.log('Conversation created successfully:', result);
    return result;
  },

  async getConversations(userId: string, page = 1, limit = 10): Promise<PaginatedResponse<ConversationResponse>> {
    const response = await fetch(`${BASE_URL}/conversations?userId=${userId}&page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to get conversations');
    return response.json();
  },

  async getConversationsWithLastMessage(userId: string, page = 1, limit = 10): Promise<ConversationWithLastMessage[]> {
    const response = await fetch(`${BASE_URL}/conversations/enhanced?userId=${userId}&page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to get enhanced conversations');
    return response.json();
  },

  async getConversationById(id: string): Promise<ConversationResponse> {
    const response = await fetch(`${BASE_URL}/conversations/${id}`);
    if (!response.ok) throw new Error('Failed to get conversation');
    return response.json();
  },

  async findConversationByParticipants(participantOne: string, participantTwo: string): Promise<ConversationResponse | null> {
    try {
      console.log('Finding conversation between:', participantOne, 'and', participantTwo);
      const response = await fetch(`${BASE_URL}/conversations/between/${participantOne}/${participantTwo}`);
      
      console.log('Find conversation response status:', response.status);
      
      if (response.status === 404) {
        return null; // No conversation found
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error finding conversation:', errorText);
        throw new Error(`Failed to find conversation: ${response.status} ${errorText}`);
      }
      
      const responseText = await response.text();
      console.log('Find conversation response:', responseText);
      
      if (!responseText) {
        return null;
      }
      
      return JSON.parse(responseText);
    } catch (error) {
      console.error('Error in findConversationByParticipants:', error);
      return null; // Return null on error to allow creating new conversation
    }
  },

  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/conversations/${conversationId}?userId=${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete conversation');
  },

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/conversations/${conversationId}/mark-read?userId=${userId}`, {
      method: 'PATCH',
    });
    if (!response.ok) throw new Error('Failed to mark conversation as read');
  },

  // Message endpoints
  async sendMessage(data: CreateMessageDto): Promise<MessageResponse> {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    
    console.log('Sending message with token:', token ? 'Token present' : 'No token');
    console.log('Message data:', data);
    
    const response = await fetch(`${BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    console.log('Message response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Message API Error:', errorData);
      throw new Error(errorData.message || `HTTP ${response.status}: Failed to send message`);
    }
    
    const result = await response.json();
    console.log('Message sent successfully:', result);
    return result;
  },

  async getMessages(conversationId: string, page = 1, limit = 20): Promise<PaginatedResponse<MessageResponse>> {
    const response = await fetch(`${BASE_URL}/messages?conversationId=${conversationId}&page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to get messages');
    return response.json();
  },

  async getMessagesBetweenUsers(userOne: string, userTwo: string, page = 1, limit = 50): Promise<PaginatedResponse<MessageResponse>> {
    const response = await fetch(`${BASE_URL}/messages/between/${userOne}/${userTwo}?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to get messages between users');
    return response.json();
  },

  async getMessageById(messageId: string): Promise<MessageResponse> {
    const response = await fetch(`${BASE_URL}/messages/${messageId}`);
    if (!response.ok) throw new Error('Failed to get message');
    return response.json();
  },

  async markMessageAsRead(messageId: string, userId: string): Promise<MessageResponse> {
    const response = await fetch(`${BASE_URL}/messages/${messageId}/mark-read?userId=${userId}`, {
      method: 'PATCH',
    });
    if (!response.ok) throw new Error('Failed to mark message as read');
    return response.json();
  },

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/messages/${messageId}?userId=${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete message');
  },

  // User endpoints
  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const response = await fetch(`${BASE_URL}/users/${userId}/unread-count`);
    if (!response.ok) throw new Error('Failed to get unread count');
    return response.json();
  },
};

// User search API (using the main backend)
export const userApi = {
  async searchUsers(query: string, token: string): Promise<SearchUser[]> {
    const response = await fetch(`http://localhost:3000/api/users/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to search users');
    return response.json();
  },
};
