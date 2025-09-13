// Simple chatbot API - no complex setup needed
// This will work with your existing API structure

export interface ChatbotResponse {
  success: boolean;
  data: {
    question: string;
    answer: string;
    timestamp: string;
  };
  error?: string;
}

export interface SuggestionsResponse {
  success: boolean;
  data: {
    suggestions: string[];
    timestamp: string;
  };
}

class ChatbotAPI {
  private baseURL: string;

  constructor() {
    // Updated to point to backend service instead of communication service
    this.baseURL = import.meta.env.DEV 
      ? 'http://localhost:3000' // Backend service port
      : '/api'; // Production API proxy
  }

  async askQuestion(message: string): Promise<ChatbotResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/chatbot/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatbotResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Chatbot API error:', error);
      // Return a fallback response
      return {
        success: false,
        data: {
          question: message,
          answer: "I'm having trouble connecting right now. Please try again in a moment, or contact our support team for assistance!",
          timestamp: new Date().toISOString()
        },
        error: 'Connection error'
      };
    }
  }

  async getSuggestions(): Promise<SuggestionsResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/chatbot/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SuggestionsResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Suggestions API error:', error);
      // Return fallback suggestions
      return {
        success: true,
        data: {
          suggestions: [
            "How do I book a service?",
            "How do I use messaging?",
            "How do payments work?",
            "How do I become a provider?"
          ],
          timestamp: new Date().toISOString()
        }
      };
    }
  }
}

export const chatbotApi = new ChatbotAPI();
