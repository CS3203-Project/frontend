import React, { useRef, useEffect } from 'react';
import type { Message } from './Chat';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  selectedUserId: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId, selectedUserId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Only show messages between current user and selected user
  const filteredMessages = messages.filter(
    (msg) =>
      (msg.fromUserId === currentUserId && msg.toUserId === selectedUserId) ||
      (msg.fromUserId === selectedUserId && msg.toUserId === currentUserId)
  );

  return (
    <div className="flex-grow p-4 overflow-y-auto">
      {filteredMessages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex items-end gap-2 my-2 ${msg.fromUserId === currentUserId ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`p-3 rounded-lg max-w-xs lg:max-w-md ${
              msg.fromUserId === currentUserId
                ? 'bg-blue-500 text-white rounded-br-none'
                : 'bg-gray-200 text-gray-800 rounded-bl-none'
            }`}
          >
            <b>{msg.fromName}:</b> <span className="text-sm">{msg.message}</span>
            {msg.fromUserId === currentUserId && msg.delivered && (
              <span className="ml-1 text-green-500">✓</span>
            )}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;