import React from 'react';
import { useChatContext } from './ChatProvider';

interface ConversationListProps {}

const ConversationList: React.FC<ConversationListProps> = () => {
  const { 
    conversations, 
    activeConversation, 
    setActiveConversation, 
    isLoading 
  } = useChatContext();

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No conversations yet</p>
        <p className="text-sm mt-1">Start a conversation by sending a message</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 mb-3">Conversations</h3>
        <div className="space-y-1">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setActiveConversation(conversation)}
              className={`
                p-3 rounded-lg cursor-pointer transition-colors duration-200
                ${activeConversation?.id === conversation.id 
                  ? 'bg-blue-100 border-blue-200' 
                  : 'hover:bg-gray-50 border-transparent'
                }
                border
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                      {conversation.profile.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {conversation.profile.name}
                      </h4>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.countMessages} message{conversation.countMessages !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Message count badge */}
                {conversation.countMessages > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {conversation.countMessages}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConversationList;
