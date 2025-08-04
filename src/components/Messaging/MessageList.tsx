import React, { useRef, useEffect } from 'react';
import type { Message } from './Chat';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-grow p-4 overflow-y-auto">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex items-end gap-2 my-2 ${msg.user === currentUserId ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`p-3 rounded-lg max-w-xs lg:max-w-md ${
              msg.user === currentUserId
                ? 'bg-blue-500 text-white rounded-br-none'
                : 'bg-gray-200 text-gray-800 rounded-bl-none'
            }`}
          >
            <b>{msg.user}:</b> <span className="text-sm">{msg.message}</span>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;