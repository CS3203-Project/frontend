import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useChatContext } from './ChatProvider';

interface MessageInputProps {}

const MessageInput: React.FC<MessageInputProps> = () => {
  const [message, setMessage] = useState('');
  const { sendMessage, activeConversation, isConnected } = useChatContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !isConnected) return;
    
    sendMessage(message.trim());
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  if (!activeConversation) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isConnected 
                ? "Type a message..." 
                : "Connecting..."
            }
            disabled={!isConnected}
            rows={1}
            className="
              w-full px-3 py-2 border border-gray-300 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-100 disabled:cursor-not-allowed
              resize-none
            "
            style={{
              minHeight: '40px',
              maxHeight: '120px',
            }}
          />
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() || !isConnected}
          className="
            px-4 py-2 bg-blue-500 text-white rounded-lg
            hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:bg-gray-300 disabled:cursor-not-allowed
            transition-colors duration-200
            flex items-center space-x-2
          "
        >
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
      
      {!isConnected && (
        <p className="text-xs text-red-500 mt-2">
          Disconnected. Trying to reconnect...
        </p>
      )}
    </form>
  );
};

export default MessageInput;
