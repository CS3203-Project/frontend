import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Chatbot from '../../src/components/Chatbot/Chatbot';
import { chatbotApi } from '../../src/api/chatbotApi';

// Mock the chatbot API
vi.mock('../../src/api/chatbotApi', () => ({
  chatbotApi: {
    getSuggestions: vi.fn(),
    askQuestion: vi.fn(),
  },
}));

const mockedChatbotApi = vi.mocked(chatbotApi);

describe('Chatbot Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedChatbotApi.getSuggestions.mockResolvedValue({
      success: true,
      data: {
        suggestions: ['How do I book a service?', 'What payment methods do you accept?']
      }
    });
  });

  const renderChatbot = () => {
    return render(
      <BrowserRouter>
        <Chatbot />
      </BrowserRouter>
    );
  };

  it('should render chatbot toggle button', () => {
    renderChatbot();
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should open chatbot when toggle button is clicked', async () => {
    renderChatbot();
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      const heading = screen.getByRole('heading', { name: /Zia Assistant/i });
      expect(heading).toBeInTheDocument();
    });
  });

  it('should display welcome message when opened', async () => {
    renderChatbot();
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/I'm here to help you navigate our platform/i)).toBeInTheDocument();
    });
  });

  it('should fetch suggestions on open', async () => {
    renderChatbot();
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockedChatbotApi.getSuggestions).toHaveBeenCalled();
    });
  });
});