import React, { useState, useEffect, useCallback } from 'react';
import { socket } from '../../api/socket';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { userApi } from '../../api/userApi';
import type { UserProfile } from '../../api/userApi';

interface OnlineUser {
  userId: string;
  name: string;
  socketId: string;
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

  // Register user and listen for online users/messages
  useEffect(() => {
    if (!currentUser) return;

    if (!socket.connected) socket.connect();

    // Register this user with the backend
    socket.emit('register_user', {
      userId: currentUser.id,
      name: `${currentUser.firstName} ${currentUser.lastName}`,
    });

    // Request the current online users list
    socket.emit('get_online_users');

    // Listen for online users updates
    const handleOnlineUsers = (users: OnlineUser[]) => {
      // Exclude self from the list
      setOnlineUsers(users.filter(u => u.userId !== currentUser.id));
    };
    socket.on('online_users', handleOnlineUsers);

    return () => {
      socket.off('online_users', handleOnlineUsers);
    };
  }, [currentUser]);

  // When user switches chat, clear messages
  useEffect(() => {
    setMessages([]);
  }, [selectedUser]);

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

    const handleReceiveMessage = (msg: Message) => {
      if (
        selectedUser &&
        (
          (msg.fromUserId === selectedUser.userId && msg.toUserId === currentUser.id) ||
          (msg.fromUserId === currentUser.id && msg.toUserId === selectedUser.userId)
        )
      ) {
        // If this is an echo of a pending message, mark as delivered
        if (msg.fromUserId === currentUser.id && msg.pendingId) {
          setMessages(prev =>
            prev.map(m =>
              m.pendingId === msg.pendingId
                ? { ...msg, delivered: true }
                : m
            )
          );
        } else {
          setMessages(prev => [...prev, msg]);
        }
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