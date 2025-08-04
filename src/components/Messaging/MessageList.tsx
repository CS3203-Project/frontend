import React, { useRef, useEffect } from 'react';
import type { Message } from './Chat';
import { cn } from './utils';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <div className="flex-grow p-4 overflow-y-auto">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn(
            'flex items-end gap-2 my-2',
            msg.sender.id === currentUserId ? 'justify-end' : 'justify-start'
          )}
        >
          {msg.sender.id !== currentUserId && (
            <img
              src={msg.sender.avatar || '/api/placeholder/40/40'}
              alt={msg.sender.name}
              className="w-8 h-8 rounded-full"
            />
          )}
          <div
            className={cn(
              'p-3 rounded-lg max-w-xs lg:max-w-md',
              msg.sender.id === currentUserId
                ? 'bg-blue-500 text-white rounded-br-none'
                : 'bg-gray-200 text-gray-800 rounded-bl-none'
            )}
          >
            <p className="text-sm">{msg.content}</p>
            <span className="text-xs opacity-75 mt-1 block text-right">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
