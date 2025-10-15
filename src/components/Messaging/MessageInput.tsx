import React, { useState } from 'react';
import { FiSend } from 'react-icons/fi';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-white/20 bg-black/40 backdrop-blur-sm flex items-center gap-3">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type a message..."
        className="flex-grow p-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
      />
      <button
        type="submit"
        className="bg-white/20 text-white p-3 rounded-xl hover:bg-white/30 disabled:bg-white/10 disabled:text-white/40 border border-white/30 hover:border-white/40 transition-all duration-300 disabled:cursor-not-allowed"
        disabled={!inputValue.trim()}
      >
        <FiSend className="w-5 h-5" />
      </button>
    </form>
  );
};

export default MessageInput;
