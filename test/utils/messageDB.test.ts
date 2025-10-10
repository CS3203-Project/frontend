import { describe, it, expect, vi } from 'vitest';
import { getDB, saveMessages, getMessagesBetween, clearMessages } from '../../src/utils/messageDB';

// Mock idb
vi.mock('idb', () => ({
  openDB: vi.fn(),
}));

const mockDB = {
  clear: vi.fn(),
  getAll: vi.fn(),
  transaction: vi.fn(),
  createObjectStore: vi.fn(),
  objectStoreNames: {
    contains: vi.fn(),
  },
};

const mockTx = {
  store: {
    put: vi.fn(),
  },
  done: Promise.resolve(),
};

import { openDB } from 'idb';
const mockedOpenDB = vi.mocked(openDB);

describe('messageDB utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedOpenDB.mockResolvedValue(mockDB as any);
    mockDB.transaction.mockReturnValue(mockTx as any);
  });

  describe('getDB', () => {
    it('should open database with correct configuration', async () => {
      await getDB();

      expect(mockedOpenDB).toHaveBeenCalledWith('zia-messages', 1, expect.any(Object));
    });
  });

  describe('clearMessages', () => {
    it('should clear all messages', async () => {
      await clearMessages();

      expect(mockDB.clear).toHaveBeenCalledWith('messages');
    });
  });

  describe('saveMessages', () => {
    it('should save messages to database', async () => {
      const messages = [
        { fromUserId: '1', toUserId: '2', fromName: 'User 1', message: 'Hello' },
      ];

      await saveMessages(messages);

      expect(mockDB.transaction).toHaveBeenCalledWith('messages', 'readwrite');
      expect(mockTx.store.put).toHaveBeenCalledWith(messages[0]);
    });
  });

  describe('getMessagesBetween', () => {
    it('should return messages between two users', async () => {
      const mockMessages = [
        { fromUserId: 'user1', toUserId: 'user2', fromName: 'User 1', message: 'Hello' },
        { fromUserId: 'user2', toUserId: 'user1', fromName: 'User 2', message: 'Hi' },
        { fromUserId: 'user3', toUserId: 'user4', fromName: 'User 3', message: 'Other' },
      ];
      mockDB.getAll.mockResolvedValue(mockMessages);

      const result = await getMessagesBetween('user1', 'user2');

      expect(result).toHaveLength(2);
      expect(result[0].fromUserId).toBe('user1');
      expect(result[1].fromUserId).toBe('user2');
    });

    it('should return empty array when no messages found', async () => {
      mockDB.getAll.mockResolvedValue([]);

      const result = await getMessagesBetween('user1', 'user2');

      expect(result).toEqual([]);
    });
  });
});