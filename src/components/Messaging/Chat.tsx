import React, { useState, useEffect, useCallback } from 'react';
import { socket } from '../../api/socket';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { userApi } from '../../api/userApi';
import type { UserProfile } from '../../api/userApi';

export interface Message {
  user: string;
  message: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await userApi.getProfile();
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    function onReceiveMessage(message: Message) {
      setMessages((previous) => [...previous, message]);
    }

    socket.on('receive_message', onReceiveMessage);

    return () => {
      socket.off('receive_message', onReceiveMessage);
    };
  }, []);

  const handleSendMessage = useCallback((content: string) => {
    if (content.trim() && currentUser) {
      const message: Message = {
        user: `${currentUser.firstName} ${currentUser.lastName}`,
        message: content,
      };
      setMessages((prev) => [...prev, message]); // Optimistically add your own message
      socket.emit('send_message', message);
    }
  }, [currentUser]);

  if (!currentUser) {
    return <div>Loading user...</div>;
  }

  return (
    <div className="flex flex-col h-[60vh] border rounded-lg">
      <MessageList messages={messages} currentUserId={currentUser.id} />
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default Chat;