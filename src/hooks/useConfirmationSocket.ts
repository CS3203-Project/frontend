import { useEffect } from 'react';
import { socket } from '../api/socket';

/**
 * Hook to listen for real-time confirmation updates for a conversation.
 * @param conversationId The conversation to join and listen for updates.
 * @param onUpdate Callback to run when a new confirmation is received.
 * @param userId The current user's ID (for room join logic).
 */
export function useConfirmationSocket(conversationId: string, onUpdate: (confirmation: any) => void, userId: string) {
  useEffect(() => {
    if (!conversationId || !userId) return;

    console.log('🔌 Setting up confirmation socket for conversation:', conversationId);

    // Connect if not already
    if (!socket.connected) socket.connect();

    // Join the conversation room (reuse messaging logic)
    socket.emit('user:join', { userId });
    socket.emit('conversation:enter', { userId, conversationId });

    // Listen for confirmation updates
    const handler = (data: { conversationId: string; confirmation: any }) => {
      console.log('📡 Received confirmation_updated event:', data);
      // Only call onUpdate for the current conversation
      if (data.conversationId === conversationId) {
        console.log('✅ Confirmation update is for current conversation:', conversationId);
        onUpdate(data.confirmation);
      } else {
        console.log('🚫 Ignoring confirmation update for different conversation:', data.conversationId, 'current:', conversationId);
      }
    };
    socket.on('confirmation_updated', handler);

    // Cleanup on unmount or conversation change
    return () => {
      console.log('🧹 Cleaning up confirmation socket for conversation:', conversationId);
      socket.emit('conversation:leave', { userId });
      socket.off('confirmation_updated', handler);
    };
  }, [conversationId, userId, onUpdate]);
}
