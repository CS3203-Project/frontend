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

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-[60vh] bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl border border-white/20">
        <div className="text-center p-8 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white mx-auto mb-4"></div>
          <p className="text-white/80">Loading user...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[60vh] bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl border border-white/20 overflow-hidden">
      {/* User List */}
      <div className="w-full md:w-1/4 border-r border-white/20 p-4 overflow-y-auto bg-black/40 backdrop-blur-sm">
        <h3 className="font-bold mb-4 text-white">Online Users</h3>
        {onlineUsers.length === 0 && (
          <div className="text-white/60 text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-white/20 to-white/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p>No users online</p>
          </div>
        )}
        <ul className="space-y-2">
          {onlineUsers.map(user => (
            <li
              key={user.userId}
              className={`p-3 rounded-xl cursor-pointer transition-all duration-300 border ${
                selectedUser?.userId === user.userId
                  ? 'bg-white/20 border-white/30 text-white'
                  : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20'
              }`}
              onClick={() => setSelectedUser(user)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center border border-white/20">
                  <span className="text-xs font-semibold text-white">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <span className="font-medium">{user.name}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-black/40 backdrop-blur-sm">
        <div className="flex-1">
          {selectedUser ? (
            <MessageList
              messages={messages}
              currentUserId={currentUser.id}
              selectedUserId={selectedUser.userId}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 max-w-md">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-white/20 to-white/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-white/80 font-medium mb-2">Select a user to start chatting</p>
                <p className="text-white/60 text-sm">Choose someone from the online users list</p>
              </div>
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