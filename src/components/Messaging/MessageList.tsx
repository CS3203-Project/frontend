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
    <div className="flex-grow p-4 overflow-y-auto bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {filteredMessages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex items-end gap-3 my-3 ${msg.fromUserId === currentUserId ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`p-4 rounded-2xl max-w-xs lg:max-w-md backdrop-blur-sm border relative overflow-hidden group ${
              msg.fromUserId === currentUserId
                ? 'bg-white/10 border-white/20 text-white rounded-br-md'
                : 'bg-white/5 border-white/10 text-white/90 rounded-bl-md'
            } transition-all duration-300 hover:${
              msg.fromUserId === currentUserId
                ? 'border-white/30 bg-white/15'
                : 'border-white/20 bg-white/10'
            }`}
          >
            {/* Shimmer effect */}
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent ${
              msg.fromUserId === currentUserId
                ? 'via-white/5 to-transparent'
                : 'via-white/3 to-transparent'
            } transform -skew-x-12 group-hover:animate-pulse rounded-2xl`}></div>
            
            <div className="relative z-10">
              <div className={`font-semibold text-sm mb-1 ${
                msg.fromUserId === currentUserId ? 'text-white/90' : 'text-white/80'
              }`}>
                {msg.fromName}
              </div>
              <div className="text-sm break-words">{msg.message}</div>
              {msg.fromUserId === currentUserId && msg.delivered && (
                <div className="flex justify-end mt-2">
                  <svg className="w-3 h-3 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;