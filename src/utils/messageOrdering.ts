// Message ordering utility functions
import type { MessageResponse } from '../api/messagingApi';

/**
 * Sorts messages in chronological order (oldest first, newest last)
 * This ensures consistent ordering regardless of database query results
 */
export function sortMessagesByTimestamp(messages: MessageResponse[]): MessageResponse[] {
  return [...messages].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

/**
 * Inserts a new message in the correct chronological position
 * Maintains the sorted order while adding a new message
 */
export function insertMessageInOrder(messages: MessageResponse[], newMessage: MessageResponse): MessageResponse[] {
  // Check if message already exists to avoid duplicates
  const existsIndex = messages.findIndex(msg => msg.id === newMessage.id);
  if (existsIndex !== -1) {
    return messages; // Message already exists, return unchanged
  }
  
  // Add the new message and sort by timestamp
  const newMessages = [...messages, newMessage];
  return sortMessagesByTimestamp(newMessages);
}

/**
 * Merges older messages with current messages while maintaining chronological order
 * Used for pagination when loading more messages
 */
export function mergeMessagesInOrder(olderMessages: MessageResponse[], currentMessages: MessageResponse[]): MessageResponse[] {
  // Sort both arrays to ensure they're in chronological order
  const sortedOlder = sortMessagesByTimestamp(olderMessages);
  const sortedCurrent = sortMessagesByTimestamp(currentMessages);
  
  // Combine and remove duplicates based on message ID
  const combined = [...sortedOlder, ...sortedCurrent];
  const uniqueMessages = combined.reduce((acc, message) => {
    if (!acc.find(msg => msg.id === message.id)) {
      acc.push(message);
    }
    return acc;
  }, [] as MessageResponse[]);
  
  // Final sort to ensure perfect chronological order
  return sortMessagesByTimestamp(uniqueMessages);
}

/**
 * Validates that messages are in correct chronological order
 * Returns true if messages are properly ordered, false otherwise
 */
export function validateMessageOrder(messages: MessageResponse[]): boolean {
  for (let i = 1; i < messages.length; i++) {
    const currentTime = new Date(messages[i].createdAt).getTime();
    const previousTime = new Date(messages[i - 1].createdAt).getTime();
    
    if (currentTime < previousTime) {
      console.warn('Message ordering violation detected:', {
        current: messages[i],
        previous: messages[i - 1]
      });
      return false;
    }
  }
  return true;
}

/**
 * Debug function to log message ordering information
 */
export function debugMessageOrder(messages: MessageResponse[], context: string): void {
  console.log(`📋 Message Order Debug [${context}]:`, {
    count: messages.length,
    isOrdered: validateMessageOrder(messages),
    firstMessage: messages[0]?.createdAt,
    lastMessage: messages[messages.length - 1]?.createdAt,
    timestamps: messages.map(m => ({ id: m.id, createdAt: m.createdAt }))
  });
}