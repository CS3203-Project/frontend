import { describe, it, expect, vi } from 'vitest';
import {
  sortMessagesByTimestamp,
  insertMessageInOrder,
  mergeMessagesInOrder,
  validateMessageOrder,
  debugMessageOrder
} from '../../src/utils/messageOrdering';
import type { MessageResponse } from '../../src/api/messagingApi';

// Mock console for debug function
const mockConsole = {
  log: vi.fn(),
  warn: vi.fn(),
};
vi.stubGlobal('console', mockConsole);

describe('messageOrdering utilities', () => {
  const createMockMessage = (id: number, createdAt: string): MessageResponse => ({
    id: id.toString(),
    content: `Message ${id}`,
    createdAt,
    fromId: '1',
    toId: '2',
    conversationId: '1',
    receivedAt: null
  });

  describe('sortMessagesByTimestamp', () => {
    it('should sort messages in chronological order', () => {
      const messages = [
        createMockMessage(1, '2023-01-01T12:00:00Z'),
        createMockMessage(2, '2023-01-01T10:00:00Z'),
        createMockMessage(3, '2023-01-01T11:00:00Z'),
      ];

      const sorted = sortMessagesByTimestamp(messages);

      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('3');
      expect(sorted[2].id).toBe('1');
    });

    it('should not mutate original array', () => {
      const messages = [
        createMockMessage(1, '2023-01-01T12:00:00Z'),
        createMockMessage(2, '2023-01-01T10:00:00Z'),
      ];
      const originalOrder = messages.map(m => m.id);

      sortMessagesByTimestamp(messages);

      expect(messages.map(m => m.id)).toEqual(originalOrder);
    });
  });

  describe('insertMessageInOrder', () => {
    it('should insert new message in correct chronological position', () => {
      const messages = [
        createMockMessage(1, '2023-01-01T10:00:00Z'),
        createMockMessage(3, '2023-01-01T12:00:00Z'),
      ];
      const newMessage = createMockMessage(2, '2023-01-01T11:00:00Z');

      const result = insertMessageInOrder(messages, newMessage);

      expect(result.length).toBe(3);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
      expect(result[2].id).toBe('3');
    });

    it('should not add duplicate messages', () => {
      const messages = [
        createMockMessage(1, '2023-01-01T10:00:00Z'),
        createMockMessage(2, '2023-01-01T11:00:00Z'),
      ];
      const duplicateMessage = createMockMessage(1, '2023-01-01T10:00:00Z');

      const result = insertMessageInOrder(messages, duplicateMessage);

      expect(result.length).toBe(2);
      expect(result).toEqual(messages);
    });
  });

  describe('mergeMessagesInOrder', () => {
    it('should merge messages while maintaining chronological order', () => {
      const olderMessages = [
        createMockMessage(1, '2023-01-01T10:00:00Z'),
        createMockMessage(2, '2023-01-01T11:00:00Z'),
      ];
      const currentMessages = [
        createMockMessage(3, '2023-01-01T12:00:00Z'),
        createMockMessage(4, '2023-01-01T13:00:00Z'),
      ];

      const result = mergeMessagesInOrder(olderMessages, currentMessages);

      expect(result.length).toBe(4);
      expect(result.map(m => m.id)).toEqual(['1', '2', '3', '4']);
    });

    it('should remove duplicates when merging', () => {
      const olderMessages = [
        createMockMessage(1, '2023-01-01T10:00:00Z'),
        createMockMessage(2, '2023-01-01T11:00:00Z'),
      ];
      const currentMessages = [
        createMockMessage(2, '2023-01-01T11:00:00Z'),
        createMockMessage(3, '2023-01-01T12:00:00Z'),
      ];

      const result = mergeMessagesInOrder(olderMessages, currentMessages);

      expect(result.length).toBe(3);
      expect(result.map(m => m.id)).toEqual(['1', '2', '3']);
    });
  });

  describe('validateMessageOrder', () => {
    it('should return true for correctly ordered messages', () => {
      const messages = [
        createMockMessage(1, '2023-01-01T10:00:00Z'),
        createMockMessage(2, '2023-01-01T11:00:00Z'),
        createMockMessage(3, '2023-01-01T12:00:00Z'),
      ];

      const result = validateMessageOrder(messages);

      expect(result).toBe(true);
    });

    it('should return false for incorrectly ordered messages', () => {
      const messages = [
        createMockMessage(1, '2023-01-01T12:00:00Z'),
        createMockMessage(2, '2023-01-01T10:00:00Z'),
      ];

      const result = validateMessageOrder(messages);

      expect(result).toBe(false);
      expect(mockConsole.warn).toHaveBeenCalled();
    });

    it('should return true for empty array', () => {
      const result = validateMessageOrder([]);
      expect(result).toBe(true);
    });
  });

  describe('debugMessageOrder', () => {
    it('should log debug information', () => {
      const messages = [
        createMockMessage(1, '2023-01-01T10:00:00Z'),
        createMockMessage(2, '2023-01-01T11:00:00Z'),
      ];

      debugMessageOrder(messages, 'test');

      expect(mockConsole.log).toHaveBeenCalledWith(
        '📋 Message Order Debug [test]:',
        expect.objectContaining({
          count: 2,
          isOrdered: true,
          firstMessage: '2023-01-01T10:00:00Z',
          lastMessage: '2023-01-01T11:00:00Z',
        })
      );
    });
  });
});