import React, { useState } from 'react';
import { useChatContext } from './ChatProvider';
import ConversationList from './ConversationList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { MessageCircle, Settings, Users } from 'lucide-react';

interface ChatInterfaceProps {}

const ChatInterface: React.FC<ChatInterfaceProps> = () => {
  const { 
    isConnected, 
    activeConversation, 
    currentProfile,
    conversations 
  } = useChatContext();
  
  const [showSettings, setShowSettings] = useState(false);

  if (!currentProfile) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-gray-500">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Please sign in to use chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[70vh] border rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Left Sidebar - Conversation List */}
      <div className="w-full md:w-1/3 border-r flex flex-col bg-gray-50">
        {/* Header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              <h2 className="font-semibold text-gray-900">Messages</h2>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Connection Status */}
              <div 
                className={`
                  w-2 h-2 rounded-full 
                  ${isConnected ? 'bg-green-500' : 'bg-red-500'}
                `}
                title={isConnected ? 'Connected' : 'Disconnected'}
              />
              
              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1 hover:bg-gray-100 rounded"
                title="Settings"
              >
                <Settings className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</span>
            </span>
          </div>
        </div>
        
        {/* Conversation List */}
        <ConversationList />
      </div>

      {/* Right Side - Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        {activeConversation && (
          <div className="p-4 border-b bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                {activeConversation.profile.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {activeConversation.profile.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {isConnected ? 'Online' : 'Connecting...'}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Messages */}
        <MessageList />
        
        {/* Message Input */}
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatInterface;
