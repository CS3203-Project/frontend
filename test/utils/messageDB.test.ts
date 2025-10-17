import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDB, clearMessages } from '../../src/utils/messageDB';

// Mock idb
vi.mock('idb', () => ({
  openDB: vi.fn(),
}));

const mockDB = {
  clear: vi.fn(),
  createObjectStore: vi.fn(),
  objectStoreNames: {
    contains: vi.fn(),
  },
};

import { openDB } from 'idb';
const mockedOpenDB = vi.mocked(openDB);

describe('messageDB utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedOpenDB.mockResolvedValue(mockDB as any);
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
});