import React, { useState, useEffect, useCallback } from 'react';
import { socket } from '../../api/socket';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { userApi } from '../../api/userApi';
import type { UserProfile } from '../../api/userApi';
import { showInfoToast } from '../../utils/toastUtils';
import { saveMessages, getMessagesBetween } from '../../utils/messageDB';

interface OnlineUser {
  userId: string;
  name: string;
}

export interface Message {
  fromUserId: string;
  toUserId: string;
  fromName: string;
  message: string;
  pendingId?: string;
  delivered?: boolean;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<OnlineUser | null>(null);

  // Fetch current user
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

  // Listen for online users updates
  useEffect(() => {
    if (!currentUser) return;
    const handleOnlineUsers = (users: OnlineUser[]) => {
      setOnlineUsers(users.filter(u => u.userId !== currentUser.id));
    };
    socket.on('online_users', handleOnlineUsers);
    return () => {
      socket.off('online_users', handleOnlineUsers);
    };
  }, [currentUser]);

  // When user switches chat, fetch messages from backend and load from IndexedDB
  useEffect(() => {
    const fetchAndLoad = async () => {
      if (!currentUser || !selectedUser) return;
      socket.emit('fetch_messages', { userA: currentUser.id, userB: selectedUser.userId });

      // Listen for messages_history from backend
      const handleMessagesHistory = async (data: { userA: string; userB: string; messages: Message[] }) => {
        await saveMessages(data.messages);
        const msgs = await getMessagesBetween(currentUser.id, selectedUser.userId);
        setMessages(msgs);
      };

      socket.on('messages_history', handleMessagesHistory);

      return () => {
        socket.off('messages_history', handleMessagesHistory);
      };
    };
    fetchAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, selectedUser]);

  const handleSendMessage = useCallback(
    (content: string) => {
      if (!content.trim() || !currentUser || !selectedUser) return;
      const pendingId = Date.now().toString() + Math.random();
      const msg: Message = {
        fromUserId: currentUser.id,
        toUserId: selectedUser.userId,
        fromName: `${currentUser.firstName} ${currentUser.lastName}`,
        message: content,
        pendingId,
        delivered: false,
      };
      setMessages(prev => [...prev, msg]);
      socket.emit('send_message', {
        toUserId: selectedUser.userId,
        fromUserId: currentUser.id,
        fromName: msg.fromName,
        message: content,
        pendingId,
      });
    },
    [currentUser, selectedUser]
  );

  useEffect(() => {
    if (!currentUser) return;

    const handleReceiveMessage = async (msg: Message) => {
      // Always add the message to the list and save to IndexedDB
      setMessages(prev => {
        if (msg.fromUserId === currentUser.id && msg.pendingId) {
          return prev.map(m =>
            m.pendingId === msg.pendingId
              ? { ...msg, delivered: true }
              : m
          );
        } else {
          return [...prev, msg];
        }
      });
      await saveMessages([msg]);

      // Show toast if the message is from a user who is not currently selected
      if (!selectedUser || msg.fromUserId !== selectedUser.userId) {
        showInfoToast(`New message from ${msg.fromName}`);
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [currentUser, selectedUser]);

  if (!currentUser) return <div>Loading user...</div>;

  return (
    <div className="flex flex-col md:flex-row h-[60vh] border rounded-lg">
      {/* User List */}
      <div className="w-full md:w-1/4 border-r p-4 overflow-y-auto">
        <h3 className="font-bold mb-2">Online Users</h3>
        {onlineUsers.length === 0 && <div className="text-gray-500">No users online</div>}
        <ul>
          {onlineUsers.map(user => (
            <li
              key={user.userId}
              className={`p-2 rounded cursor-pointer mb-1 ${
                selectedUser?.userId === user.userId
                  ? 'bg-blue-100 font-semibold'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => setSelectedUser(user)}
            >
              {user.name}
            </li>
          ))}
        </ul>
      </div>
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1">
          {selectedUser ? (
            <MessageList
              messages={messages}
              currentUserId={currentUser.id}
              selectedUserId={selectedUser.userId}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Select a user to start chatting
            </div>
          )}
        </div>
        {selectedUser && (
          <MessageInput onSendMessage={handleSendMessage} />
        )}
      </div>
    </div>
  );
};

export default Chat;