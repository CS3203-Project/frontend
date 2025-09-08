import React from 'react';
import { useChatContext } from './ChatProvider';
import type { ChatMessage } from '../../api/chatApi';

interface MessageListProps {}

const MessageList: React.FC<MessageListProps> = () => {
  const { messages, currentProfile, activeConversation, isLoading } = useChatContext();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading messages...</div>
      </div>
    );
  }

  if (!activeConversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-lg font-medium">Select a conversation</p>
          <p className="text-sm mt-1">Choose a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-lg font-medium">No messages yet</p>
          <p className="text-sm mt-1">Send a message to start the conversation</p>
        </div>
      </div>
    );
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message: ChatMessage) => {
        const isOwn = message.fromId === currentProfile?.id;
        
        return (
          <div
            key={message.id}
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-xs lg:max-w-md px-4 py-2 rounded-lg
                ${isOwn 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-900'
                }
              `}
            >
              <p className="text-sm">{message.content}</p>
              <p 
                className={`
                  text-xs mt-1 
                  ${isOwn ? 'text-blue-100' : 'text-gray-500'}
                `}
              >
                {formatTime(message.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
