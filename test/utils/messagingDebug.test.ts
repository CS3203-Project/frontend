import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  clearMessagingState,
  logCurrentUser,
  debugMessagingState
} from '../../src/utils/messagingDebug';

// Mock localStorage and sessionStorage
const localStorageData: Record<string, string> = {};
const sessionStorageData: Record<string, string> = {};

const mockLocalStorage = {
  getItem: vi.fn((key: string) => localStorageData[key] || null),
  removeItem: vi.fn((key: string) => { delete localStorageData[key]; }),
  key: vi.fn(),
  length: 0,
  clear: vi.fn(),
  setItem: vi.fn((key: string, value: string) => { localStorageData[key] = value; }),
};

const mockSessionStorage = {
  getItem: vi.fn((key: string) => sessionStorageData[key] || null),
  removeItem: vi.fn((key: string) => { delete sessionStorageData[key]; }),
  key: vi.fn(),
  length: 0,
  clear: vi.fn(),
  setItem: vi.fn((key: string, value: string) => { sessionStorageData[key] = value; }),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

// Mock console
const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
};
vi.stubGlobal('console', mockConsole);

describe('messagingDebug utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('clearMessagingState', () => {
    it('should execute without errors', () => {
      expect(() => clearMessagingState()).not.toThrow();
    });
  });

  describe('logCurrentUser', () => {
    it('should log missing token when no auth token exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      logCurrentUser();

      expect(mockConsole.log).toHaveBeenCalledWith('Current auth token:', 'Missing');
    });

    it('should log present token when auth token exists', () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      mockLocalStorage.getItem.mockReturnValue(mockToken);

      logCurrentUser();

      expect(mockConsole.log).toHaveBeenCalledWith('Current auth token:', 'Present');
      expect(mockConsole.log).toHaveBeenCalledWith('Token payload:', expect.any(Object));
    });

    it('should handle invalid token gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid.token');

      logCurrentUser();

      expect(mockConsole.log).toHaveBeenCalledWith('Current auth token:', 'Present');
      expect(mockConsole.error).toHaveBeenCalledWith('Failed to decode token:', expect.any(Error));
    });
  });

  describe('debugMessagingState', () => {
    it('should call all debug functions', () => {
      localStorageData['test'] = 'data';
      
      debugMessagingState();

      expect(mockConsole.log).toHaveBeenCalledWith('=== MESSAGING DEBUG ===');
      expect(mockConsole.log).toHaveBeenCalledWith('State cleared. Please refresh the page.');
    });
  });
});