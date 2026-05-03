import { describe, it, expect, vi, beforeEach } from 'vitest';
import authService from './authService';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch
global.fetch = vi.fn();

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully and store user data', async () => {
      const mockResponse = {
        token: 'test-token',
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            role: 'user',
            name: 'Test User',
          },
        },
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await authService.login('test@example.com', 'password123');

      expect(result.token).toBe('test-token');
      expect(result.user).toEqual(mockResponse.data.user);
      expect(localStorage.getItem('token')).toBe('test-token');
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockResponse.data.user));
    });

    it('should throw error on login failure', async () => {
      const mockError = { message: 'Invalid credentials' };

      (global.fetch as any).mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue(mockError),
      });

      await expect(authService.login('test@example.com', 'wrong-password')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should remove token and user from localStorage', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify({ id: '1', email: 'test@example.com' }));

      authService.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user object from localStorage', () => {
      const user = { id: '1', email: 'test@example.com', role: 'user', name: 'Test User' };
      localStorage.setItem('user', JSON.stringify(user));

      const result = authService.getCurrentUser();

      expect(result).toEqual(user);
    });

    it('should return null when no user in localStorage', () => {
      const result = authService.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('token', 'test-token');

      const result = authService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when no token exists', () => {
      const result = authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should return true when user has required role', () => {
      const user = { id: '1', email: 'test@example.com', role: 'admin' };
      localStorage.setItem('user', JSON.stringify(user));

      const result = authService.hasPermission('user');

      expect(result).toBe(true);
    });

    it('should return false when user does not have required role', () => {
      const user = { id: '1', email: 'test@example.com', role: 'user' };
      localStorage.setItem('user', JSON.stringify(user));

      const result = authService.hasPermission('admin');

      expect(result).toBe(false);
    });

    it('should return false when no user is logged in', () => {
      const result = authService.hasPermission('user');

      expect(result).toBe(false);
    });
  });
});